<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WorkspaceMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceMemberController extends Controller
{
    public function index(Request $request): Response
    {
        $membership = $this->currentMembership($request);

        abort_unless($this->canManageMembers($membership), 403);

        $members = WorkspaceMember::query()
            ->where('workspace_id', $membership->workspace_id)
            ->with('user:id,name,email')
            ->latest()
            ->get()
            ->map(fn (WorkspaceMember $member) => [
                'id' => $member->id,
                'user_id' => $member->user_id,
                'name' => $member->user?->name,
                'email' => $member->user?->email,
                'role' => $member->role,
                'joined_at' => $member->joined_at?->format('Y-m-d H:i'),
                'is_owner' => $member->role === 'owner',
                'is_current_user' => $member->user_id === $request->user()->id,
            ]);

        return Inertia::render('WorkspaceMembers/Index', [
            'workspace' => [
                'id' => $membership->workspace->id,
                'name' => $membership->workspace->name,
                'slug' => $membership->workspace->slug,
            ],
            'workspaceRole' => $membership->role,
            'members' => $members,
            'roles' => [
                'admin',
                'agent',
                'customer',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $membership = $this->currentMembership($request);

        abort_unless($this->canManageMembers($membership), 403);

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'role' => ['required', Rule::in(['admin', 'agent', 'customer'])],
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();

        $alreadyMember = WorkspaceMember::query()
            ->where('workspace_id', $membership->workspace_id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyMember) {
            return back()->withErrors([
                'email' => 'This user is already a member of this workspace.',
            ]);
        }

        WorkspaceMember::create([
            'workspace_id' => $membership->workspace_id,
            'user_id' => $user->id,
            'role' => $validated['role'],
            'joined_at' => now(),
        ]);

        return redirect()->route('workspace-members.index');
    }

    public function update(Request $request, WorkspaceMember $member): RedirectResponse
    {
        $membership = $this->currentMembership($request);

        abort_unless($this->canManageMembers($membership), 403);
        abort_unless($member->workspace_id === $membership->workspace_id, 404);
        abort_if($member->role === 'owner', 403);

        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'agent', 'customer'])],
        ]);

        $member->update([
            'role' => $validated['role'],
        ]);

        return redirect()->route('workspace-members.index');
    }

    public function destroy(Request $request, WorkspaceMember $member): RedirectResponse
    {
        $membership = $this->currentMembership($request);

        abort_unless($this->canManageMembers($membership), 403);
        abort_unless($member->workspace_id === $membership->workspace_id, 404);
        abort_if($member->role === 'owner', 403);

        $member->delete();

        return redirect()->route('workspace-members.index');
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

    private function canManageMembers(WorkspaceMember $membership): bool
    {
        return in_array($membership->role, ['owner', 'admin'], true);
    }
}