<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use App\Models\WorkspaceMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        $membership = $this->currentMembership($request);

        $tickets = Ticket::query()
            ->where('workspace_id', $membership->workspace_id)
            ->with(['creator:id,name', 'assignee:id,name'])
            ->latest()
            ->get()
            ->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'creator' => $ticket->creator?->name,
                'assignee' => $ticket->assignee?->name,
                'created_at' => $ticket->created_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Tickets/Index', [
            'workspace' => [
                'id' => $membership->workspace->id,
                'name' => $membership->workspace->name,
                'slug' => $membership->workspace->slug,
            ],
            'workspaceRole' => $membership->role,
            'tickets' => $tickets,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $membership = $this->currentMembership($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
        ]);

        Ticket::create([
            'workspace_id' => $membership->workspace_id,
            'created_by' => $request->user()->id,
            'assigned_to' => null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => 'open',
            'priority' => $validated['priority'],
        ]);

        return redirect()->route('tickets.index');
    }

    public function show(Request $request, Ticket $ticket): Response
    {
        $membership = $this->currentMembership($request);

        abort_unless($ticket->workspace_id === $membership->workspace_id, 404);

        $canViewInternalNotes = $this->canViewInternalNotes($membership);
        $canManageTicket = $this->canManageTicket($membership);

        $commentsQuery = $ticket
            ->comments()
            ->with('user:id,name')
            ->oldest();

        if (! $canViewInternalNotes) {
            $commentsQuery->where('is_internal', false);
        }

        $ticket->load(['creator:id,name', 'assignee:id,name']);

        $agents = WorkspaceMember::query()
            ->where('workspace_id', $membership->workspace_id)
            ->whereIn('role', ['owner', 'admin', 'agent'])
            ->with('user:id,name,email')
            ->get()
            ->map(fn (WorkspaceMember $member) => [
                'id' => $member->user->id,
                'name' => $member->user->name,
                'email' => $member->user->email,
                'role' => $member->role,
            ]);

        return Inertia::render('Tickets/Show', [
            'workspace' => [
                'id' => $membership->workspace->id,
                'name' => $membership->workspace->name,
                'slug' => $membership->workspace->slug,
            ],
            'workspaceRole' => $membership->role,
            'canViewInternalNotes' => $canViewInternalNotes,
            'canManageTicket' => $canManageTicket,
            'agents' => $agents,
            'ticket' => [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'creator' => $ticket->creator?->name,
                'assignee' => $ticket->assignee?->name,
                'assigned_to' => $ticket->assigned_to,
                'created_at' => $ticket->created_at?->format('Y-m-d H:i'),
            ],
            'comments' => $commentsQuery->get()->map(fn (TicketComment $comment) => [
                'id' => $comment->id,
                'body' => $comment->body,
                'is_internal' => $comment->is_internal,
                'user' => $comment->user?->name,
                'created_at' => $comment->created_at?->format('Y-m-d H:i'),
            ]),
        ]);
    }

    public function update(Request $request, Ticket $ticket): RedirectResponse
    {
        $membership = $this->currentMembership($request);

        abort_unless($ticket->workspace_id === $membership->workspace_id, 404);
        abort_unless($this->canManageTicket($membership), 403);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['open', 'pending', 'resolved', 'closed'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        if (! empty($validated['assigned_to'])) {
            $isWorkspaceAgent = WorkspaceMember::query()
                ->where('workspace_id', $membership->workspace_id)
                ->where('user_id', $validated['assigned_to'])
                ->whereIn('role', ['owner', 'admin', 'agent'])
                ->exists();

            abort_unless($isWorkspaceAgent, 422);
        }

        $ticket->update([
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'assigned_to' => $validated['assigned_to'] ?? null,
        ]);

        return redirect()->route('tickets.show', $ticket);
    }

    public function comment(Request $request, Ticket $ticket): RedirectResponse
    {
        $membership = $this->currentMembership($request);

        abort_unless($ticket->workspace_id === $membership->workspace_id, 404);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'is_internal' => ['boolean'],
        ]);

        $isInternal = (bool) ($validated['is_internal'] ?? false);

        if ($isInternal && ! $this->canViewInternalNotes($membership)) {
            abort(403);
        }

        TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
            'is_internal' => $isInternal,
        ]);

        return redirect()->route('tickets.show', $ticket);
    }

    private function currentMembership(Request $request): WorkspaceMember
    {
        $currentWorkspaceId = session('current_workspace_id');

        $membershipQuery = $request->user()
            ->workspaceMemberships()
            ->with('workspace');

        $membership = $currentWorkspaceId
            ? (clone $membershipQuery)->where('workspace_id', $currentWorkspaceId)->first()
            : null;

        if (! $membership) {
            $membership = $membershipQuery->firstOrFail();

            session(['current_workspace_id' => $membership->workspace_id]);
        }

        return $membership;
    }

    private function canViewInternalNotes(WorkspaceMember $membership): bool
    {
        return in_array($membership->role, ['owner', 'admin', 'agent'], true);
    }

    private function canManageTicket(WorkspaceMember $membership): bool
    {
        return in_array($membership->role, ['owner', 'admin', 'agent'], true);
    }
}