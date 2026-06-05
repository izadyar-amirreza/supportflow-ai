import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Show({
    workspace,
    workspaceRole,
    canViewInternalNotes,
    ticket,
    comments,
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        body: '',
        is_internal: false,
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('tickets.comments.store', ticket.id), {
            onSuccess: () => reset('body', 'is_internal'),
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
                    Ticket #{ticket.id}
                </h2>
            }
        >
            <Head title={`Ticket #${ticket.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div>
                        <Link
                            href={route('tickets.index')}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            ← Back to Tickets
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {workspace.name} · Role: {workspaceRole}
                                    </p>

                                    <h3 className="mt-2 text-2xl font-bold text-gray-900">
                                        {ticket.title}
                                    </h3>

                                    {ticket.description && (
                                        <p className="mt-4 whitespace-pre-line text-gray-700">
                                            {ticket.description}
                                        </p>
                                    )}

                                    <p className="mt-4 text-sm text-gray-500">
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
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Add a comment
                            </h3>

                            <form onSubmit={submit} className="mt-6 space-y-4">
                                <div>
                                    <textarea
                                        value={data.body}
                                        onChange={(event) => setData('body', event.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows="4"
                                        placeholder="Write a reply or note..."
                                    />

                                    {errors.body && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.body}
                                        </p>
                                    )}
                                </div>

                                {canViewInternalNotes && (
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={data.is_internal}
                                            onChange={(event) => setData('is_internal', event.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        />

                                        Internal note only visible to support team
                                    </label>
                                )}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Add Comment
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Conversation
                            </h3>

                            <div className="mt-6 space-y-4">
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className={`rounded-lg border p-4 ${
                                                comment.is_internal
                                                    ? 'border-yellow-300 bg-yellow-50'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {comment.user ?? 'Unknown'}
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    {comment.is_internal && (
                                                        <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-medium text-yellow-800">
                                                            Internal Note
                                                        </span>
                                                    )}

                                                    <span className="text-xs text-gray-500">
                                                        {comment.created_at}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="mt-3 whitespace-pre-line text-sm text-gray-700">
                                                {comment.body}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600">
                                        No comments yet.
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