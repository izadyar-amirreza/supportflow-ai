import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function Index({
    workspace,
    workspaceRole,
    tickets,
    filters = {
        search: '',
        status: 'all',
        priority: 'all',
        sort: 'latest',
        per_page: 10,
    },
}) {
    const createForm = useForm({
        title: '',
        description: '',
        priority: 'medium',
    });

    const filterForm = useForm({
        search: filters.search ?? '',
        status: filters.status ?? 'all',
        priority: filters.priority ?? 'all',
        sort: filters.sort ?? 'latest',
        per_page: filters.per_page ?? 10,
    });

    const submitTicket = (event) => {
        event.preventDefault();

        createForm.post(route('tickets.store'), {
            onSuccess: () => createForm.reset('title', 'description', 'priority'),
        });
    };

    const applyFilters = (event) => {
        event.preventDefault();

        router.get(
            route('tickets.index'),
            {
                search: filterForm.data.search,
                status: filterForm.data.status,
                priority: filterForm.data.priority,
                sort: filterForm.data.sort,
                per_page: filterForm.data.per_page,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        filterForm.setData({
            search: '',
            status: 'all',
            priority: 'all',
            sort: 'latest',
            per_page: 10,
        });

        router.get(
            route('tickets.index'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const priorityBadge = (priority) => {
        const styles = {
            low: 'bg-gray-100 text-gray-700',
            medium: 'bg-blue-100 text-blue-700',
            high: 'bg-orange-100 text-orange-700',
            urgent: 'bg-red-100 text-red-700',
        };

        return styles[priority] ?? styles.medium;
    };

    const statusBadge = (status) => {
        const styles = {
            open: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            resolved: 'bg-blue-100 text-blue-700',
            closed: 'bg-gray-100 text-gray-700',
        };

        return styles[status] ?? styles.open;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Tickets
                </h2>
            }
        >
            <Head title="Tickets" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <p className="text-sm text-gray-500">
                                Current Workspace
                            </p>

                            <h3 className="mt-1 text-xl font-bold text-gray-900">
                                {workspace.name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-600">
                                Your role:{' '}
                                <span className="font-semibold">
                                    {workspaceRole}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Create a new ticket
                            </h3>

                            <form onSubmit={submitTicket} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        value={createForm.data.title}
                                        onChange={(event) =>
                                            createForm.setData('title', event.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Example: Customer cannot access dashboard"
                                    />

                                    {createForm.errors.title && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {createForm.errors.title}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>

                                    <textarea
                                        value={createForm.data.description}
                                        onChange={(event) =>
                                            createForm.setData('description', event.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows="4"
                                        placeholder="Describe the issue..."
                                    />

                                    {createForm.errors.description && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {createForm.errors.description}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Priority
                                    </label>

                                    <select
                                        value={createForm.data.priority}
                                        onChange={(event) =>
                                            createForm.setData('priority', event.target.value)
                                        }
                                        className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>

                                    {createForm.errors.priority && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {createForm.errors.priority}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Create Ticket
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Filter and sort tickets
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-600">
                                        Search, filter, sort, and paginate tickets in the current workspace.
                                    </p>
                                </div>

                                <p className="text-sm text-gray-500">
                                    Showing {tickets.from ?? 0}–{tickets.to ?? 0} of {tickets.total}
                                </p>
                            </div>

                            <form
                                onSubmit={applyFilters}
                                className="mt-6 grid gap-4 md:grid-cols-6"
                            >
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Search
                                    </label>

                                    <input
                                        type="text"
                                        value={filterForm.data.search}
                                        onChange={(event) =>
                                            filterForm.setData('search', event.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Search title or description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>

                                    <select
                                        value={filterForm.data.status}
                                        onChange={(event) =>
                                            filterForm.setData('status', event.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="all">All statuses</option>
                                        <option value="open">Open</option>
                                        <option value="pending">Pending</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Priority
                                    </label>

                                    <select
                                        value={filterForm.data.priority}
                                        onChange={(event) =>
                                            filterForm.setData('priority', event.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="all">All priorities</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sort
                                    </label>

                                    <select
                                        value={filterForm.data.sort}
                                        onChange={(event) =>
                                            filterForm.setData('sort', event.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="latest">Newest first</option>
                                        <option value="oldest">Oldest first</option>
                                        <option value="title_asc">Title A-Z</option>
                                        <option value="title_desc">Title Z-A</option>
                                        <option value="priority_desc">Priority high-low</option>
                                        <option value="priority_asc">Priority low-high</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Per page
                                    </label>

                                    <select
                                        value={filterForm.data.per_page}
                                        onChange={(event) =>
                                            filterForm.setData('per_page', Number(event.target.value))
                                        }
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 md:col-span-6">
                                    <button
                                        type="submit"
                                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                                    >
                                        Apply
                                    </button>

                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Tickets in this workspace
                            </h3>

                            <div className="mt-6 space-y-4">
                                {tickets.data.length > 0 ? (
                                    tickets.data.map((ticket) => (
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

                                                    {ticket.description && (
                                                        <p className="mt-2 text-sm text-gray-600">
                                                            {ticket.description}
                                                        </p>
                                                    )}

                                                    <p className="mt-3 text-xs text-gray-500">
                                                        Created by {ticket.creator ?? 'Unknown'}
                                                        {ticket.creator_role && (
                                                            <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                                                {ticket.creator_role}
                                                            </span>
                                                        )}
                                                        {' '}on {ticket.created_at}
                                                    </p>

                                                   <p className="mt-1 text-xs text-gray-500">
                                                        Assigned to {ticket.assignee ?? 'Unassigned'}
                                                        {ticket.assignee_role && (
                                                            <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                                                {ticket.assignee_role}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge(ticket.status)}`}>
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
                                        No tickets matched your filters.
                                    </p>
                                )}
                            </div>

                            {tickets.links.length > 3 && (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {tickets.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url ?? '#'}
                                            preserveScroll
                                            className={`rounded-md border px-3 py-2 text-sm ${
                                                link.active
                                                    ? 'border-gray-900 bg-gray-900 text-white'
                                                    : link.url
                                                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        : 'cursor-not-allowed border-gray-200 text-gray-400'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}