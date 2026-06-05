import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ workspace, workspaceRole, tickets }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        priority: 'medium',
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('tickets.store'), {
            onSuccess: () => reset('title', 'description', 'priority'),
        });
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
                                Your role: <span className="font-semibold">{workspaceRole}</span>
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Create a new ticket
                            </h3>

                            <form onSubmit={submit} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(event) => setData('title', event.target.value)}
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Example: Customer cannot access dashboard"
                                    />

                                    {errors.title && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>

                                    <textarea
                                        value={data.description}
                                        onChange={(event) => setData('description', event.target.value)}
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows="4"
                                        placeholder="Describe the issue..."
                                    />

                                    {errors.description && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Priority
                                    </label>

                                    <select
                                        value={data.priority}
                                        onChange={(event) => setData('priority', event.target.value)}
                                        className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>

                                    {errors.priority && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.priority}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Create Ticket
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Tickets in this workspace
                            </h3>

                            <div className="mt-6 space-y-4">
                                {tickets.length > 0 ? (
                                    tickets.map((ticket) => (
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
                                                        Created by {ticket.creator ?? 'Unknown'} on {ticket.created_at}
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
                                        No tickets found for this workspace yet.
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