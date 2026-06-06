<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Models\TicketComment;
use App\Models\User;
use App\Models\WorkspaceMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\FakeAiTicketSummaryService;
class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        $membership = $this->currentMembership($request);

        $filters = [
            'search' => $request->input('search', ''),
            'status' => $request->input('status', 'all'),
            'priority' => $request->input('priority', 'all'),
            'sort' => $request->input('sort', 'latest'),
            'per_page' => (int) $request->input('per_page', 10),
        ];

        if (! in_array($filters['status'], ['all', 'open', 'pending', 'resolved', 'closed'], true)) {
            $filters['status'] = 'all';
        }

        if (! in_array($filters['priority'], ['all', 'low', 'medium', 'high', 'urgent'], true)) {
            $filters['priority'] = 'all';
        }

        if (! in_array($filters['sort'], ['latest', 'oldest', 'title_asc', 'title_desc', 'priority_desc', 'priority_asc'], true)) {
            $filters['sort'] = 'latest';
        }

        if (! in_array($filters['per_page'], [5, 10, 25, 50], true)) {
            $filters['per_page'] = 10;
        }

        $ticketQuery = Ticket::query()
            ->where('workspace_id', $membership->workspace_id)
            ->with(['creator:id,name,email', 'assignee:id,name,email']);

        if ($filters['search'] !== '') {
            $ticketQuery->where(function ($query) use ($filters) {
                $query
                    ->where('title', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        if ($filters['status'] !== 'all') {
            $ticketQuery->where('status', $filters['status']);
        }

        if ($filters['priority'] !== 'all') {
            $ticketQuery->where('priority', $filters['priority']);
        }

        match ($filters['sort']) {
            'oldest' => $ticketQuery->oldest(),
            'title_asc' => $ticketQuery->orderBy('title'),
            'title_desc' => $ticketQuery->orderByDesc('title'),
            'priority_desc' => $ticketQuery->orderByRaw("
                CASE priority
                    WHEN 'urgent' THEN 4
                    WHEN 'high' THEN 3
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 1
                    ELSE 0
                END DESC
            ")->latest(),
            'priority_asc' => $ticketQuery->orderByRaw("
                CASE priority
                    WHEN 'urgent' THEN 4
                    WHEN 'high' THEN 3
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 1
                    ELSE 0
                END ASC
            ")->latest(),
            default => $ticketQuery->latest(),
        };

        $memberRoles = WorkspaceMember::query()
            ->where('workspace_id', $membership->workspace_id)
            ->pluck('role', 'user_id');

        $tickets = $ticketQuery
            ->paginate($filters['per_page'])
            ->withQueryString()
            ->through(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'creator' => $ticket->creator?->name,
                'creator_role' => $ticket->creator
                    ? $memberRoles->get($ticket->creator->id)
                    : null,
                'assignee' => $ticket->assignee?->name,
                'assignee_role' => $ticket->assignee
                    ? $memberRoles->get($ticket->assignee->id)
                    : null,
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
            'filters' => $filters,
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

        $ticket = Ticket::create([
            'workspace_id' => $membership->workspace_id,
            'created_by' => $request->user()->id,
            'assigned_to' => null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => 'open',
            'priority' => $validated['priority'],
        ]);

        $this->logActivity(
            ticket: $ticket,
            userId: $request->user()->id,
            action: 'ticket_created',
            description: 'Ticket was created.',
            oldValue: null,
            newValue: $ticket->title,
        );

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

        $ticket->load(['creator:id,name,email', 'assignee:id,name,email']);

        $workspaceMembers = WorkspaceMember::query()
            ->where('workspace_id', $membership->workspace_id)
            ->with('user:id,name,email')
            ->get();

        $memberRoles = $workspaceMembers->pluck('role', 'user_id');

        $agents = $workspaceMembers
            ->whereIn('role', ['owner', 'admin', 'agent'])
            ->map(fn (WorkspaceMember $member) => [
                'id' => $member->user->id,
                'name' => $member->user->name,
                'email' => $member->user->email,
                'role' => $member->role,
            ])
            ->values();

        $activities = $canViewInternalNotes
            ? $ticket->activities()
                ->with('user:id,name')
                ->latest()
                ->get()
                ->map(fn (TicketActivity $activity) => [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'description' => $activity->description,
                    'old_value' => $activity->old_value,
                    'new_value' => $activity->new_value,
                    'user' => $activity->user?->name,
                    'created_at' => $activity->created_at?->format('Y-m-d H:i'),
                ])
            : [];

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
                'ai_summary' => $ticket->ai_summary,
                'ai_summary_generated_at' => $ticket->ai_summary_generated_at?->format('Y-m-d H:i'),
                'ai_suggested_reply' => $ticket->ai_suggested_reply,
                'ai_suggested_reply_generated_at' => $ticket->ai_suggested_reply_generated_at?->format('Y-m-d H:i'),
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'creator' => $ticket->creator?->name,
                'creator_role' => $ticket->creator
                    ? $memberRoles->get($ticket->creator->id)
                    : null,
                'assignee' => $ticket->assignee?->name,
                'assignee_role' => $ticket->assignee
                    ? $memberRoles->get($ticket->assignee->id)
                    : null,
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
            'activities' => $activities,
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
            $isAssignableMember = WorkspaceMember::query()
                ->where('workspace_id', $membership->workspace_id)
                ->where('user_id', $validated['assigned_to'])
                ->whereIn('role', ['owner', 'admin', 'agent'])
                ->exists();

            if (! $isAssignableMember) {
                return back()->withErrors([
                    'assigned_to' => 'The selected assignee must be an owner, admin, or agent in this workspace.',
                ]);
            }
        }

        $oldStatus = $ticket->status;
        $oldPriority = $ticket->priority;
        $oldAssignedTo = $ticket->assigned_to;

        $newAssignedTo = $validated['assigned_to'] ?? null;

        $ticket->update([
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'assigned_to' => $newAssignedTo,
        ]);

        if ($oldStatus !== $validated['status']) {
            $this->logActivity(
                ticket: $ticket,
                userId: $request->user()->id,
                action: 'status_changed',
                description: 'Ticket status was changed.',
                oldValue: $oldStatus,
                newValue: $validated['status'],
            );
        }

        if ($oldPriority !== $validated['priority']) {
            $this->logActivity(
                ticket: $ticket,
                userId: $request->user()->id,
                action: 'priority_changed',
                description: 'Ticket priority was changed.',
                oldValue: $oldPriority,
                newValue: $validated['priority'],
            );
        }

        if ((int) $oldAssignedTo !== (int) $newAssignedTo) {
            $oldAssigneeName = $oldAssignedTo
                ? User::find($oldAssignedTo)?->name
                : 'Unassigned';

            $newAssigneeName = $newAssignedTo
                ? User::find($newAssignedTo)?->name
                : 'Unassigned';

            $this->logActivity(
                ticket: $ticket,
                userId: $request->user()->id,
                action: 'assignment_changed',
                description: 'Ticket assignment was changed.',
                oldValue: $oldAssigneeName,
                newValue: $newAssigneeName,
            );
        }

        return redirect()->route('tickets.show', $ticket);
    }

        public function generateAiSummary(
        Request $request,
        Ticket $ticket,
        FakeAiTicketSummaryService $summaryService,
    ): RedirectResponse {
        $membership = $this->currentMembership($request);

        abort_unless($ticket->workspace_id === $membership->workspace_id, 404);
        abort_unless($this->canManageTicket($membership), 403);

        $comments = $ticket
            ->comments()
            ->oldest()
            ->get();

        $summary = $summaryService->summarize($ticket, $comments);

        $ticket->update([
            'ai_summary' => $summary,
            'ai_summary_generated_at' => now(),
        ]);

        $this->logActivity(
            ticket: $ticket,
            userId: $request->user()->id,
            action: 'ai_summary_generated',
            description: 'AI summary was generated.',
            oldValue: null,
            newValue: 'AI summary generated',
        );

        return redirect()->route('tickets.show', $ticket);
    }

        public function generateAiSuggestedReply(
        Request $request,
        Ticket $ticket,
        FakeAiTicketSummaryService $summaryService,
    ): RedirectResponse {
        $membership = $this->currentMembership($request);

        abort_unless($ticket->workspace_id === $membership->workspace_id, 404);
        abort_unless($this->canManageTicket($membership), 403);

        $comments = $ticket
            ->comments()
            ->oldest()
            ->get();

        $suggestedReply = $summaryService->suggestReply($ticket, $comments);

        $ticket->update([
            'ai_suggested_reply' => $suggestedReply,
            'ai_suggested_reply_generated_at' => now(),
        ]);

        $this->logActivity(
            ticket: $ticket,
            userId: $request->user()->id,
            action: 'ai_suggested_reply_generated',
            description: 'AI suggested reply was generated.',
            oldValue: null,
            newValue: 'AI suggested reply generated',
        );

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

        $this->logActivity(
            ticket: $ticket,
            userId: $request->user()->id,
            action: $isInternal ? 'internal_note_added' : 'comment_added',
            description: $isInternal
                ? 'An internal note was added.'
                : 'A public comment was added.',
            oldValue: null,
            newValue: null,
        );

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

    private function logActivity(
        Ticket $ticket,
        ?int $userId,
        string $action,
        ?string $description = null,
        ?string $oldValue = null,
        ?string $newValue = null,
        ?array $meta = null,
    ): void {
        TicketActivity::create([
            'ticket_id' => $ticket->id,
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'meta' => $meta,
        ]);
    }
}