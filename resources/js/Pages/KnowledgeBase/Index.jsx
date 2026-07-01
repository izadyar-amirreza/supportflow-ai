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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">AI Knowledge Base</h2>}
        >
            <Head title="Knowledge Base" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    
                    {/* Form Section */}
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Add New AI Rule / Document</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Document Title</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="e.g. Refund Policy"
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <input
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="e.g. Billing"
                                    />
                                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Content (Instructions for AI)</label>
                                <textarea
                                    rows="4"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Explain the policy clearly here..."
                                />
                                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                Save Document
                            </button>
                        </form>
                    </div>

                    {/* List Section */}
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Current AI Knowledge</h3>
                        <div className="space-y-4">
                            {articles.length === 0 ? (
                                <p className="text-sm text-gray-500">No documents found. The AI has no specific rules yet.</p>
                            ) : (
                                articles.map((article) => (
                                    <div key={article.id} className="flex flex-col gap-2 rounded-md border border-gray-200 p-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{article.title} <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{article.category}</span></h4>
                                            <p className="mt-1 text-sm text-gray-600">{article.content}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteArticle(article.id)}
                                            className="text-sm font-medium text-red-600 hover:text-red-900 shrink-0"
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