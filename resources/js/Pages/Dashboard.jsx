import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({
    workspace,
    workspaceRole,
    stats,
    recentTickets = [],
}) {
    const statCards = [
        {
            label: 'Total Tickets',
            value: stats.totalTickets,
            description: 'All tickets in this workspace',
            color: 'text-indigo-400',
        },
        {
            label: 'Open',
            value: stats.openTickets,
            description: 'Tickets waiting for action',
            color: 'text-blue-400',
        },
        {
            label: 'Pending',
            value: stats.pendingTickets,
            description: 'Tickets waiting for response',
            color: 'text-amber-400',
        },
        {
            label: 'Resolved',
            value: stats.resolvedTickets,
            description: 'Solved tickets',
            color: 'text-emerald-400',
        },
        {
            label: 'Closed',
            value: stats.closedTickets,
            description: 'Finished tickets',
            color: 'text-slate-400',
        },
        {
            label: 'Urgent',
            value: stats.urgentTickets,
            description: 'High-priority attention needed',
            color: 'text-red-400',
        },
        {
            label: 'Assigned to Me',
            value: stats.assignedToMeTickets,
            description: 'Tickets assigned to your account',
            color: 'text-purple-400',
        },
    ];

    const priorityBadge = (priority) => {
        const styles = {
            low: 'bg-slate-800 text-slate-300 border-slate-700',
            medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
        };

        return styles[priority] ?? styles.medium;
    };

    const statusBadge = (status) => {
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    Dashboard Overview
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8 bg-slate-950 min-h-screen text-slate-100">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    
                    {/* Welcome & Workspace Banner */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 shadow-xl backdrop-blur">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-3">
                                    SupportFlow AI Workspace
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                    Welcome to SupportFlow AI
                                </h3>

                                {workspace ? (
                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                                        <span className="font-semibold text-white bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                                            🏢 {workspace.name}
                                        </span>
                                        <span className="text-slate-400">•</span>
                                        <span>
                                            Your role:{' '}
                                            <span className="font-semibold text-blue-400 capitalize">
                                                {workspaceRole}
                                            </span>
                                        </span>
                                    </div>
                                ) : (
                                    <p className="mt-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                                        No workspace found for this account.
                                    </p>
                                )}
                            </div>

                            {workspace && (
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={route('workspaces.index')}
                                        className="rounded-xl bg-slate-800 border border-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition shadow"
                                    >
                                        Manage Workspaces
                                    </Link>

                                    <Link
                                        href={route('tickets.index')}
                                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition shadow"
                                    >
                                        View Tickets
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((card) => (
                            <div
                                key={card.label}
                                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-5 shadow-xl backdrop-blur hover:border-white/20 transition"
                            >
                                <p className="text-xs font-medium text-slate-400">
                                    {card.label}
                                </p>

                                <p className={`mt-2 text-3xl font-bold ${card.color || 'text-white'}`}>
                                    {card.value}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    {card.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Tickets Section */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-xl backdrop-blur">
                        <div className="p-6 border-b border-white/10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Recent Tickets
                                </h3>
                                <p className="mt-1 text-xs text-slate-400">
                                    Latest tickets in the current workspace.
                                </p>
                            </div>

                            <Link
                                href={route('tickets.index')}
                                className="rounded-xl bg-slate-800 border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition text-center"
                            >
                                Open Tickets
                            </Link>
                        </div>

                        <div className="p-6">
                            {recentTickets.length > 0 ? (
                                <div className="space-y-3">
                                    {recentTickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="rounded-xl border border-white/10 bg-slate-950/60 p-4 hover:border-blue-500/30 transition"
                                        >
                                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                                <div className="space-y-1">
                                                    <Link
                                                        href={route('tickets.show', ticket.id)}
                                                        className="text-sm font-semibold text-white hover:text-blue-400 transition"
                                                    >
                                                        #{ticket.id} {ticket.title}
                                                    </Link>

                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                                                        <span>Created by <strong className="text-slate-300">{ticket.creator ?? 'Unknown'}</strong> on {ticket.created_at}</span>
                                                        <span>•</span>
                                                        <span>Assigned to <strong className="text-blue-300">{ticket.assignee ?? 'Unassigned'}</strong></span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium border ${statusBadge(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>

                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium border ${priorityBadge(ticket.priority)}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-sm text-slate-400">
                                        No tickets found in this workspace yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}