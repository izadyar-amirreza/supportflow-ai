import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function Show({
    workspace,
    workspaceRole,
    canViewInternalNotes,
    canManageTicket,
    agents,
    aiProvider,
    ticket,
    comments,
    attachments = [],
    activities = [],
    flash = {},
}) {
    const commentForm = useForm({
        body: '',
        is_internal: false,
    });

    const attachmentForm = useForm({
        attachment: null,
    });

    const uploadAttachment = (event) => {
        event.preventDefault();

        attachmentForm.post(route('tickets.attachments.store', ticket.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => attachmentForm.reset('attachment'),
        });
    };

    const deleteAttachment = (attachmentId) => {
        if (!confirm('Are you sure you want to delete this attachment?')) {
            return;
        }

        router.delete(route('tickets.attachments.destroy', [ticket.id, attachmentId]), {
            preserveScroll: true,
        });
    };

    const updateForm = useForm({
        status: ticket.status,
        priority: ticket.priority,
        assigned_to: ticket.assigned_to ?? '',
    });

    const aiSummaryForm = useForm({});
    const aiSuggestedReplyForm = useForm({});

    // Live Polling Logic
    const [isPollingSummary, setIsPollingSummary] = useState(false);
    const [isPollingReply, setIsPollingReply] = useState(false);

    const lastSummaryTimeRef = useRef(ticket.ai_summary_generated_at);
    const lastReplyTimeRef = useRef(ticket.ai_suggested_reply_generated_at);

    useEffect(() => {
        lastSummaryTimeRef.current = ticket.ai_summary_generated_at;
        lastReplyTimeRef.current = ticket.ai_suggested_reply_generated_at;
    }, [ticket.id]);

    const generateAiSuggestedReply = (event) => {
        event.preventDefault();
        lastReplyTimeRef.current = ticket.ai_suggested_reply_generated_at;
        setIsPollingReply(true);

        setTimeout(() => setIsPollingReply(false), 40000);

        aiSuggestedReplyForm.post(route('tickets.ai-suggested-reply.generate', ticket.id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const generateAiSummary = (event) => {
        event.preventDefault();
        lastSummaryTimeRef.current = ticket.ai_summary_generated_at;
        setIsPollingSummary(true);

        setTimeout(() => setIsPollingSummary(false), 40000);

        aiSummaryForm.post(route('tickets.ai-summary.generate', ticket.id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    useEffect(() => {
        let interval;

        if (isPollingSummary || isPollingReply) {
            interval = setInterval(() => {
                router.reload({
                    only: ['ticket'],
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: (page) => {
                        const updatedTicket = page.props.ticket;

                        if (isPollingSummary && updatedTicket.ai_summary_generated_at !== lastSummaryTimeRef.current) {
                            setIsPollingSummary(false);
                            lastSummaryTimeRef.current = updatedTicket.ai_summary_generated_at;
                        }

                        if (isPollingReply && updatedTicket.ai_suggested_reply_generated_at !== lastReplyTimeRef.current) {
                            setIsPollingReply(false);
                            lastReplyTimeRef.current = updatedTicket.ai_suggested_reply_generated_at;
                        }
                    }
                });
            }, 2000);
        }

        return () => clearInterval(interval);
    }, [isPollingSummary, isPollingReply]);

    const submitComment = (event) => {
        event.preventDefault();

        commentForm.post(route('tickets.comments.store', ticket.id), {
            onSuccess: () => commentForm.reset('body', 'is_internal'),
        });
    };

    const submitUpdate = (event) => {
        event.preventDefault();

        updateForm.patch(route('tickets.update', ticket.id));
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

    // AI Sentiment Badge Stylizer
    const sentimentBadge = (sentiment) => {
        const styles = {
            satisfied: 'bg-green-50 text-green-700 border-green-200',
            neutral: 'bg-gray-50 text-gray-600 border-gray-200',
            urgent: 'bg-orange-50 text-orange-700 border-orange-200',
            angry: 'bg-red-50 text-red-700 border-red-200 font-bold',
        };

        return styles[sentiment?.toLowerCase()] ?? 'bg-gray-50 text-gray-600 border-gray-200';
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
                    {flash.success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}

                    {flash.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                            {flash.error}
                        </div>
                    )}
                    <div>
                        <Link
                            href={route('tickets.index')}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            ← Back to Tickets
                        </Link>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
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

                                            {/* AI Tags & Sentiment Container */}
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                {ticket.ai_sentiment && ticket.ai_sentiment !== 'neutral' && (
                                                    <span className={`rounded-md border px-2.5 py-0.5 text-xs ${sentimentBadge(ticket.ai_sentiment)}`}>
                                                        ⚡ {ticket.ai_sentiment.toUpperCase()}
                                                    </span>
                                                )}

                                                {ticket.ai_tags && ticket.ai_tags.length > 0 && (
                                                    ticket.ai_tags.map((tag, index) => (
                                                        <span key={index} className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
                                                            #{tag}
                                                        </span>
                                                    ))
                                                )}
                                            </div>

                                            {ticket.description && (
                                                <p className="mt-4 whitespace-pre-line text-gray-700">
                                                    {ticket.description}
                                                </p>
                                            )}

                                            <p className="mt-4 text-sm text-gray-500">
                                                Created by {ticket.creator ?? 'Unknown'}
                                                {ticket.creator_role && (
                                                    <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                                        {ticket.creator_role}
                                                    </span>
                                                )}
                                                {' '}on {ticket.created_at}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Assigned to {ticket.assignee ?? 'Unassigned'}
                                                {ticket.assignee_role && (
                                                    <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                                        {ticket.assignee_role}
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
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
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Attachments
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-600">
                                                Upload screenshots, PDFs, logs, or documents related to this ticket.
                                            </p>
                                        </div>

                                        <p className="text-sm text-gray-500">
                                            {attachments.length} file(s)
                                        </p>
                                    </div>

                                    <form onSubmit={uploadAttachment} className="mt-6 space-y-4">
                                        <div>
                                            <input
                                                type="file"
                                                onChange={(event) =>
                                                    attachmentForm.setData('attachment', event.target.files[0])
                                                }
                                                className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-700"
                                            />

                                            {attachmentForm.errors.attachment && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {attachmentForm.errors.attachment}
                                                </p>
                                            )}

                                            <p className="mt-2 text-xs text-gray-500">
                                                Max size: 5MB. Allowed: images, PDF, txt, log, csv, doc, docx.
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={attachmentForm.processing || !attachmentForm.data.attachment}
                                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                                        >
                                            Upload Attachment
                                        </button>
                                    </form>

                                    <div className="mt-6 space-y-3">
                                        {attachments.length > 0 ? (
                                            attachments.map((attachment) => (
                                                <div
                                                    key={attachment.id}
                                                    className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
                                                >
                                                    <div>
                                                        <a
                                                            href={attachment.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            {attachment.original_name}
                                                        </a>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Uploaded by {attachment.uploaded_by ?? 'Unknown'} on {attachment.created_at}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {attachment.mime_type ?? 'Unknown type'} · {Math.ceil(attachment.size / 1024)} KB
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => deleteAttachment(attachment.id)}
                                                        className="text-sm font-medium text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-600">
                                                No attachments uploaded yet.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Add a comment
                                    </h3>

                                    <form onSubmit={submitComment} className="mt-6 space-y-4">
                                        <div>
                                            <textarea
                                                value={commentForm.data.body}
                                                onChange={(event) => commentForm.setData('body', event.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                rows="4"
                                                placeholder="Write a reply or note..."
                                            />

                                            {commentForm.errors.body && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {commentForm.errors.body}
                                                </p>
                                            )}
                                        </div>

                                        {canViewInternalNotes && (
                                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={commentForm.data.is_internal}
                                                    onChange={(event) => commentForm.setData('is_internal', event.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                />
                                                Internal note only visible to support team
                                            </label>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={commentForm.processing}
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

                        <div className="space-y-6">
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        AI Provider
                                    </h3>

                                    <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                        <p className="text-sm text-gray-500">
                                            Current provider
                                        </p>

                                        <p className="mt-1 text-base font-semibold text-gray-900">
                                            {aiProvider?.name ?? 'Unknown AI Provider'}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                                {aiProvider?.key ?? 'unknown'}
                                            </span>

                                            {aiProvider?.is_fake ? (
                                                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                                    Local fake mode
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                    Real provider mode
                                                </span>
                                            )}
                                        </div>

                                        {aiProvider?.is_fake && (
                                            <p className="mt-3 text-sm text-gray-600">
                                                This project is currently using a fake local AI provider. Gemini or OpenAI can be enabled later.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {canManageTicket && (
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Manage Ticket
                                        </h3>

                                        <form onSubmit={submitUpdate} className="mt-6 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Status
                                                </label>

                                                <select
                                                    value={updateForm.data.status}
                                                    onChange={(event) => updateForm.setData('status', event.target.value)}
                                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                >
                                                    <option value="open">Open</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="closed">Closed</option>
                                                </select>

                                                {updateForm.errors.status && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {updateForm.errors.status}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Priority
                                                </label>

                                                <select
                                                    value={updateForm.data.priority}
                                                    onChange={(event) => updateForm.setData('priority', event.target.value)}
                                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="urgent">Urgent</option>
                                                </select>

                                                {updateForm.errors.priority && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {updateForm.errors.priority}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Assignee
                                                </label>

                                                <select
                                                    value={updateForm.data.assigned_to}
                                                    onChange={(event) => updateForm.setData('assigned_to', event.target.value)}
                                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                >
                                                    <option value="">Unassigned</option>

                                                    {agents.map((agent) => (
                                                        <option key={agent.id} value={agent.id}>
                                                            {agent.name} — {agent.role} — {agent.email}
                                                        </option>
                                                    ))}
                                                </select>

                                                {updateForm.errors.assigned_to && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {updateForm.errors.assigned_to}
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={updateForm.processing}
                                                className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                                            >
                                                Update Ticket
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {canManageTicket && (
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            AI Ticket Summary
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-600">
                                            Generates a concise, intelligent summary of the ticket conversation using the active AI model.
                                        </p>

                                        {ticket.ai_summary ? (
                                            <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                                                <p className="whitespace-pre-line text-sm text-gray-800">
                                                    {ticket.ai_summary}
                                                </p>

                                                {ticket.ai_summary_generated_at && (
                                                    <p className="mt-3 text-xs text-gray-500">
                                                        Generated at {ticket.ai_summary_generated_at}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                                <p className="text-sm text-gray-600">
                                                    No AI summary generated yet.
                                                </p>
                                            </div>
                                        )}

                                        <form onSubmit={generateAiSummary} className="mt-4">
                                            <button
                                                type="submit"
                                                disabled={aiSummaryForm.processing || isPollingSummary}
                                                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                                            >
                                                {isPollingSummary 
                                                    ? '⏳ AI is analyzing conversation...' 
                                                    : (ticket.ai_summary ? 'Regenerate AI Summary' : 'Generate AI Summary')
                                                }
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {canManageTicket && (
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            AI Suggested Reply
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-600">
                                            Crafts a professional, solution-oriented draft reply for the customer based on the conversation history.
                                        </p>

                                        {ticket.ai_suggested_reply ? (
                                            <div className="mt-4 rounded-lg border border-green-100 bg-green-50 p-4">
                                                <p className="whitespace-pre-line text-sm text-gray-800">
                                                    {ticket.ai_suggested_reply}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() => commentForm.setData('body', ticket.ai_suggested_reply)}
                                                    className="mt-3 block text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                                >
                                                    ↓ Copy to comment box
                                                </button>

                                                {ticket.ai_suggested_reply_generated_at && (
                                                    <p className="mt-3 text-xs text-gray-500">
                                                        Generated at {ticket.ai_suggested_reply_generated_at}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                                <p className="text-sm text-gray-600">
                                                    No AI suggested reply generated yet.
                                                </p>
                                            </div>
                                        )}

                                        <form onSubmit={generateAiSuggestedReply} className="mt-4">
                                            <button
                                                type="submit"
                                                disabled={aiSuggestedReplyForm.processing || isPollingReply}
                                                className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
                                            >
                                                {isPollingReply 
                                                    ? '⏳ AI is drafting reply...' 
                                                    : (ticket.ai_suggested_reply ? 'Regenerate Suggested Reply' : 'Generate Suggested Reply')
                                                }
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {canViewInternalNotes && (
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Activity Log
                                        </h3>

                                        <div className="mt-6 space-y-4">
                                            {activities.length > 0 ? (
                                                activities.map((activity) => (
                                                    <div
                                                        key={activity.id}
                                                        className="rounded-lg border border-gray-200 p-4"
                                                    >
                                                        <div className="flex items-center justify-between gap-4">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {activity.description}
                                                            </p>

                                                            <span className="text-xs text-gray-500">
                                                                {activity.created_at}
                                                            </span>
                                                        </div>

                                                        <p className="mt-2 text-xs text-gray-500">
                                                            By {activity.user ?? 'System'}
                                                        </p>

                                                        {(activity.old_value || activity.new_value) && (
                                                            <p className="mt-2 text-sm text-gray-600">
                                                                {activity.old_value ?? 'None'} → {activity.new_value ?? 'None'}
                                                            </p>
                                                        )}

                                                        <p className="mt-2 text-xs text-gray-400">
                                                            Action: {activity.action}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-600">
                                                    No activity recorded yet.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}