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
        },
        {
            label: 'Open',
            value: stats.openTickets,
            description: 'Tickets waiting for action',
        },
        {
            label: 'Pending',
            value: stats.pendingTickets,
            description: 'Tickets waiting for response',
        },
        {
            label: 'Resolved',
            value: stats.resolvedTickets,
            description: 'Solved tickets',
        },
        {
            label: 'Closed',
            value: stats.closedTickets,
            description: 'Finished tickets',
        },
        {
            label: 'Urgent',
            value: stats.urgentTickets,
            description: 'High-priority attention needed',
        },
        {
            label: 'Assigned to Me',
            value: stats.assignedToMeTickets,
            description: 'Tickets assigned to your account',
        },
    ];

    const priorityBadge = (priority) => {
        const styles = {
            low: 'bg-gray-100 text-gray-700',
            medium: 'bg-blue-100 text-blue-700',
            high: 'bg-orange-100 text-orange-700',
            urgent: 'bg-red-100 text-red-700',
        };

        return styles[priority] ?? styles.medium;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Welcome to SupportFlow AI
                            </h3>

                            {workspace ? (
                                <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                    <p className="text-sm text-gray-500">
                                        Current Workspace
                                    </p>

                                    <p className="mt-1 text-xl font-bold text-gray-900">
                                        {workspace.name}
                                    </p>

                                    <p className="mt-2 text-sm text-gray-600">
                                        Your role:{' '}
                                        <span className="font-semibold">
                                            {workspaceRole}
                                        </span>
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <Link
                                            href={route('workspaces.index')}
                                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                                        >
                                            Manage Workspaces
                                        </Link>

                                        <Link
                                            href={route('tickets.index')}
                                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                        >
                                            View Tickets
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
                                    No workspace found for this account.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((card) => (
                            <div
                                key={card.label}
                                className="overflow-hidden bg-white shadow-sm sm:rounded-lg"
                            >
                                <div className="p-6">
                                    <p className="text-sm font-medium text-gray-500">
                                        {card.label}
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                        {card.value}
                                    </p>

                                    <p className="mt-2 text-sm text-gray-500">
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Recent Tickets
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-600">
                                        Latest tickets in the current workspace.
                                    </p>
                                </div>

                                <Link
                                    href={route('tickets.index')}
                                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                                >
                                    Open Tickets
                                </Link>
                            </div>

                            <div className="mt-6 space-y-4">
                                {recentTickets.length > 0 ? (
                                    recentTickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="rounded-lg border border-gray-200 p-4"
                                        >
                                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                                <div>
                                                    <Link
                                                        href={route('tickets.show', ticket.id)}
                                                        className="text-base font-semibold text-gray-900 hover:text-indigo-600"
                                                    >
                                                        #{ticket.id} {ticket.title}
                                                    </Link>

                                                    <p className="mt-2 text-xs text-gray-500">
                                                        Created by {ticket.creator ?? 'Unknown'} on {ticket.created_at}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Assigned to {ticket.assignee ?? 'Unassigned'}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                        {ticket.status}
                                                    </span>

                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${priorityBadge(ticket.priority)}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600">
                                        No tickets found in this workspace yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}