import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Index({ auth, articles, flash }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        category: '',
        content: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('knowledge-base.store'), {
            onSuccess: () => reset(),
        });
    };

    const deleteArticle = (id) => {
        if (confirm('Are you sure you want to delete this rule? The AI will no longer know about it.')) {
            router.delete(route('knowledge-base.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-white">AI Knowledge Base</h2>}
        >
            <Head title="Knowledge Base" />

            <div className="py-8 bg-slate-950 min-h-screen text-slate-100">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    
                    {/* Form Section */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 shadow-xl backdrop-blur">
                        <h3 className="mb-4 text-lg font-semibold text-white tracking-tight">Add New AI Rule / Document</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Document Title</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="e.g. Refund Policy"
                                    />
                                    {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="e.g. Billing"
                                    />
                                    {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Content (Instructions for AI)</label>
                                <textarea
                                    rows="4"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Explain the policy clearly here..."
                                />
                                {errors.content && <p className="mt-1 text-xs text-red-400">{errors.content}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50 transition shadow-blue-600/20"
                            >
                                Save Document
                            </button>
                        </form>
                    </div>

                    {/* List Section */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 shadow-xl backdrop-blur">
                        <h3 className="mb-4 text-lg font-semibold text-white tracking-tight">Current AI Knowledge</h3>
                        <div className="space-y-4">
                            {articles.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-sm text-slate-400">No documents found. The AI has no specific rules yet.</p>
                                </div>
                            ) : (
                                articles.map((article) => (
                                    <div key={article.id} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-slate-950/60 p-5 sm:flex-row sm:items-start sm:justify-between hover:border-blue-500/30 transition">
                                        <div className="space-y-1.5">
                                            <h4 className="font-semibold text-white flex flex-wrap items-center gap-2">
                                                {article.title} 
                                                <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-xs text-slate-300">
                                                    {article.category}
                                                </span>
                                            </h4>
                                            <p className="text-sm text-slate-400 leading-relaxed">{article.content}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteArticle(article.id)}
                                            className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition shrink-0"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}