import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function AiSettings({ workspace, hasApiKey, flash = {} }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        ai_provider: workspace.ai_provider || 'fake',
        ai_model: workspace.ai_model || '',
        ai_api_key: '', 
    });

    const submit = (event) => {
        event.preventDefault();

        put(route('workspaces.ai-settings.update', workspace.id), {
            preserveScroll: true,
            onSuccess: () => reset('ai_api_key'), 
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Workspace Settings: {workspace.name}
                </h2>
            }
        >
            <Head title="AI Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    
                    {flash.success && (
                        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6 border-b border-gray-200 pb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Artificial Intelligence Integration
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Configure the AI provider for this specific workspace. Keys are encrypted and securely stored.
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        AI Provider
                                    </label>
                                    <select
                                        value={data.ai_provider}
                                        onChange={(e) => setData('ai_provider', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="fake">Fake / Local Testing Mode</option>
                                        <option value="openai">OpenAI (ChatGPT)</option>
                                        <option value="gemini">Google Gemini</option>
                                    </select>
                                    {errors.ai_provider && (
                                        <p className="mt-2 text-sm text-red-600">{errors.ai_provider}</p>
                                    )}
                                </div>

                                {data.ai_provider !== 'fake' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                AI Model Name
                                            </label>
                                            <input
                                                type="text"
                                                value={data.ai_model}
                                                onChange={(e) => setData('ai_model', e.target.value)}
                                                placeholder={data.ai_provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash'}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Specify the exact model version. Leave blank to use system defaults.
                                            </p>
                                            {errors.ai_model && (
                                                <p className="mt-2 text-sm text-red-600">{errors.ai_model}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                API Key
                                            </label>
                                            <input
                                                type="password"
                                                value={data.ai_api_key}
                                                onChange={(e) => setData('ai_api_key', e.target.value)}
                                                placeholder={hasApiKey ? '••••••••••••••••••••••••••••••••' : 'Enter your secret API key...'}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {hasApiKey && (
                                                <p className="mt-1 text-xs text-green-600 font-medium">
                                                    ✓ An active API key is securely saved. Only enter a new one to replace it.
                                                </p>
                                            )}
                                            {errors.ai_api_key && (
                                                <p className="mt-2 text-sm text-red-600">{errors.ai_api_key}</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        Save Configuration
                                    </button>
                                    
                                    <Link
                                        href={route('tickets.index')}
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}