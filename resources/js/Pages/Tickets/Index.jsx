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
        tag: '',
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
        tag: filters.tag ?? '',
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
                tag: filterForm.data.tag,
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
            tag: '',
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
            low: 'bg-slate-800 text-slate-300 border-slate-700',
            medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
        };

        return styles[priority] ?? styles.medium;
    };

    const statusBadge = (status) => {
        const styles = {
            open: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            resolved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            closed: 'bg-slate-800 text-slate-400 border-slate-700',
        };

        return styles[status] ?? styles.open;
    };

    const sentimentBadge = (sentiment) => {
        const styles = {
            satisfied: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            neutral: 'bg-slate-800 text-slate-400 border-slate-700',
            urgent: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            angry: 'bg-red-500/10 text-red-400 border-red-500/20 font-bold',
        };

        return styles[sentiment?.toLowerCase()] ?? 'bg-slate-800 text-slate-400 border-slate-700';
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    Tickets Management
                </h2>
            }
        >
            <Head title="Tickets" />

            <div className="py-8 bg-slate-950 min-h-screen text-slate-100">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    
                    {/* Workspace Header Info */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Current Workspace
                        </p>
                        <h3 className="mt-1 text-2xl font-bold text-white tracking-tight">
                            {workspace.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Your role:{' '}
                            <span className="font-semibold text-blue-400 capitalize">
                                {workspaceRole}
                            </span>
                        </p>
                    </div>

                    {/* Create New Ticket Form */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 shadow-xl backdrop-blur">
                        <h3 className="text-lg font-semibold text-white tracking-tight">
                            Create a new ticket
                        </h3>

                        <form onSubmit={submitTicket} className="mt-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={createForm.data.title}
                                    onChange={(event) =>
                                        createForm.setData('title', event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Example: Customer cannot access dashboard"
                                />
                                {createForm.errors.title && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {createForm.errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={createForm.data.description}
                                    onChange={(event) =>
                                        createForm.setData('description', event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    rows="4"
                                    placeholder="Describe the issue..."
                                />
                                {createForm.errors.description && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {createForm.errors.description}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Priority
                                </label>
                                <select
                                    value={createForm.data.priority}
                                    onChange={(event) =>
                                        createForm.setData('priority', event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                                {createForm.errors.priority && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {createForm.errors.priority}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={createForm.processing}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50 transition shadow-blue-600/20"
                            >
                                Create Ticket
                            </button>
                        </form>
                    </div>

                    {/* Filter and Sort Section */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 shadow-xl backdrop-blur">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-white tracking-tight">
                                    Filter and sort tickets
                                </h3>
                                <p className="mt-1 text-xs text-slate-400">
                                    Search, filter, sort, and paginate tickets in the current workspace.
                                </p>
                            </div>

                            <p className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                                Showing {tickets.from ?? 0}–{tickets.to ?? 0} of {tickets.total}
                            </p>
                        </div>

                        <form
                            onSubmit={applyFilters}
                            className="mt-6 grid gap-4 md:grid-cols-6 lg:grid-cols-7"
                        >
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    value={filterForm.data.search}
                                    onChange={(event) =>
                                        filterForm.setData('search', event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Search title or description..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    AI Tag
                                </label>
                                <input
                                    type="text"
                                    value={filterForm.data.tag}
                                    onChange={(event) =>
                                        filterForm.setData('tag', event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g. bug"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={filterForm.data.status}
                                    onChange={(event) =>
                                        filterForm.setData('status', event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="open">Open</option>
                                    <option value="pending">Pending</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Priority
                                </label>
                                <select
                                    value={filterForm.data.priority}
                                    onChange={(event) =>
                                        filterForm.setData('priority', event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="all">All priorities</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Sort
                                </label>
                                <select
                                    value={filterForm.data.sort}
                                    onChange={(event) =>
                                        filterForm.setData('sort', event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Per page
                                </label>
                                <select
                                    value={filterForm.data.per_page}
                                    onChange={(event) =>
                                        filterForm.setData('per_page', Number(event.target.value))
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="flex gap-3 md:col-span-6 lg:col-span-7 pt-2">
                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 transition"
                                >
                                    Apply
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="rounded-xl bg-slate-800 border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tickets List Section */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-xl backdrop-blur">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-white tracking-tight">
                                Tickets in this workspace
                            </h3>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {tickets.data.length > 0 ? (
                                    tickets.data.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="rounded-xl border border-white/10 bg-slate-950/60 p-5 hover:border-blue-500/30 transition"
                                        >
                                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                                <div className="space-y-2">
                                                    <Link
                                                        href={route('tickets.show', ticket.id)}
                                                        className="text-base font-semibold text-white hover:text-blue-400 transition"
                                                    >
                                                        #{ticket.id} {ticket.title}
                                                    </Link>

                                                    {/* AI Tags & Sentiment */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {ticket.ai_sentiment && ticket.ai_sentiment !== 'neutral' && (
                                                            <span className={`rounded-md border px-2 py-0.5 text-[10px] uppercase font-semibold ${sentimentBadge(ticket.ai_sentiment)}`}>
                                                                ⚡ {ticket.ai_sentiment}
                                                            </span>
                                                        )}

                                                        {ticket.ai_tags && ticket.ai_tags.length > 0 && (
                                                            ticket.ai_tags.map((tag, index) => (
                                                                <span key={index} className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                                                                    #{tag}
                                                                </span>
                                                            ))
                                                        )}
                                                    </div>

                                                    {ticket.description && (
                                                        <p className="text-sm text-slate-400 line-clamp-2">
                                                            {ticket.description}
                                                        </p>
                                                    )}

                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                                                        <span>
                                                            Created by <strong className="text-slate-300">{ticket.creator ?? 'Unknown'}</strong>
                                                            {ticket.creator_role && (
                                                                <span className="ml-1 rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                                                                    {ticket.creator_role}
                                                                </span>
                                                            )}
                                                            {' '}on {ticket.created_at}
                                                        </span>
                                                        <span>
                                                            Assigned to <strong className="text-blue-300">{ticket.assignee ?? 'Unassigned'}</strong>
                                                            {ticket.assignee_role && (
                                                                <span className="ml-1 rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                                                                    {ticket.assignee_role}
                                                                </span>
                                                            )}
                                                        </span>
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
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-sm text-slate-400">
                                            No tickets matched your filters.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination Links */}
                            {tickets.links.length > 3 && (
                                <div className="mt-8 flex flex-wrap gap-2">
                                    {tickets.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url ?? '#'}
                                            preserveScroll
                                            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                                                link.active
                                                    ? 'border-blue-500 bg-blue-600 text-white shadow'
                                                    : link.url
                                                    ? 'border-white/10 bg-slate-950 text-slate-300 hover:bg-slate-800'
                                                    : 'cursor-not-allowed border-white/5 bg-slate-950/40 text-slate-600'
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