<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    public function index(Request $request): Response
    {
        $currentWorkspaceId = session('current_workspace_id');

        $memberships = $request->user()
            ->workspaceMemberships()
            ->with('workspace')
            ->latest()
            ->get();

        if (! $currentWorkspaceId && $memberships->isNotEmpty()) {
            $currentWorkspaceId = $memberships->first()->workspace_id;
            session(['current_workspace_id' => $currentWorkspaceId]);
        }

        return Inertia::render('Workspaces/Index', [
            'workspaces' => $memberships->map(function (WorkspaceMember $membership) use ($currentWorkspaceId) {
                return [
                    'id' => $membership->workspace->id,
                    'name' => $membership->workspace->name,
                    'slug' => $membership->workspace->slug,
                    'role' => $membership->role,
                    'is_current' => $membership->workspace_id === $currentWorkspaceId,
                ];
            }),
            'currentWorkspaceId' => $currentWorkspaceId,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $workspace = Workspace::create([
            'owner_id' => $request->user()->id,
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::lower(Str::random(6)),
        ]);

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $request->user()->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        session(['current_workspace_id' => $workspace->id]);

        return redirect()->route('workspaces.index');
    }

    public function switch(Request $request, Workspace $workspace): RedirectResponse
    {
        $membership = $request->user()
            ->workspaceMemberships()
            ->where('workspace_id', $workspace->id)
            ->firstOrFail();

        session(['current_workspace_id' => $membership->workspace_id]);

        return redirect()->back();
    }
}