<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\WorkspaceController;
use App\Models\Ticket;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();

        $currentWorkspaceId = session('current_workspace_id');

        $membershipQuery = $user
            ->workspaceMemberships()
            ->with('workspace');

        $membership = $currentWorkspaceId
            ? (clone $membershipQuery)
                ->where('workspace_id', $currentWorkspaceId)
                ->first()
            : null;

        if (! $membership) {
            $membership = $membershipQuery->first();

            if ($membership) {
                session(['current_workspace_id' => $membership->workspace_id]);
            }
        }

        $stats = [
            'totalTickets' => 0,
            'openTickets' => 0,
            'pendingTickets' => 0,
            'resolvedTickets' => 0,
            'closedTickets' => 0,
            'urgentTickets' => 0,
            'assignedToMeTickets' => 0,
        ];

        $recentTickets = [];

        if ($membership) {
            $baseTicketQuery = Ticket::query()
                ->where('workspace_id', $membership->workspace_id);

            $stats = [
                'totalTickets' => (clone $baseTicketQuery)->count(),
                'openTickets' => (clone $baseTicketQuery)->where('status', 'open')->count(),
                'pendingTickets' => (clone $baseTicketQuery)->where('status', 'pending')->count(),
                'resolvedTickets' => (clone $baseTicketQuery)->where('status', 'resolved')->count(),
                'closedTickets' => (clone $baseTicketQuery)->where('status', 'closed')->count(),
                'urgentTickets' => (clone $baseTicketQuery)->where('priority', 'urgent')->count(),
                'assignedToMeTickets' => (clone $baseTicketQuery)->where('assigned_to', $user->id)->count(),
            ];

            $recentTickets = (clone $baseTicketQuery)
                ->with(['creator:id,name', 'assignee:id,name'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Ticket $ticket) => [
                    'id' => $ticket->id,
                    'title' => $ticket->title,
                    'status' => $ticket->status,
                    'priority' => $ticket->priority,
                    'creator' => $ticket->creator?->name,
                    'assignee' => $ticket->assignee?->name,
                    'created_at' => $ticket->created_at?->format('Y-m-d H:i'),
                ]);
        }

        return Inertia::render('Dashboard', [
            'workspace' => $membership?->workspace,
            'workspaceRole' => $membership?->role,
            'stats' => $stats,
            'recentTickets' => $recentTickets,
        ]);
    })->name('dashboard');

    Route::get('/workspaces', [WorkspaceController::class, 'index'])
        ->name('workspaces.index');

    Route::post('/workspaces', [WorkspaceController::class, 'store'])
        ->name('workspaces.store');

    Route::post('/workspaces/{workspace}/switch', [WorkspaceController::class, 'switch'])
        ->name('workspaces.switch');

    Route::get('/tickets', [TicketController::class, 'index'])
        ->name('tickets.index');

    Route::post('/tickets', [TicketController::class, 'store'])
        ->name('tickets.store');

    Route::get('/tickets/{ticket}', [TicketController::class, 'show'])
        ->name('tickets.show');

    Route::patch('/tickets/{ticket}', [TicketController::class, 'update'])
        ->name('tickets.update');

    Route::post('/tickets/{ticket}/comments', [TicketController::class, 'comment'])
        ->name('tickets.comments.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');
});

require __DIR__.'/auth.php';