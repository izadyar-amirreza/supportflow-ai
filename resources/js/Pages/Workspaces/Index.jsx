import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function Index({ workspaces }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('workspaces.store'), {
            onSuccess: () => reset('name'),
        });
    };

    const switchWorkspace = (workspaceId) => {
        router.post(route('workspaces.switch', workspaceId));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Workspaces" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Create a new workspace
                            </h3>

                            <p className="mt-1 text-sm text-gray-600">
                                Workspaces let you separate teams, customers, tickets, and support workflows.
                            </p>

                            <form onSubmit={submit} className="mt-6 flex flex-col gap-4 sm:flex-row">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        placeholder="Workspace name"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Create Workspace
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Your workspaces
                            </h3>

                            <div className="mt-6 space-y-4">
                                {workspaces.length > 0 ? (
                                    workspaces.map((workspace) => (
                                        <div
                                            key={workspace.id}
                                            className="flex flex-col justify-between gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
                                        >
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-base font-semibold text-gray-900">
                                                        {workspace.name}
                                                    </h4>

                                                    {workspace.is_current && (
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Role: <span className="font-medium">{workspace.role}</span>
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    Slug: {workspace.slug}
                                                </p>
                                            </div>

                                            {!workspace.is_current && (
                                                <button
                                                    type="button"
                                                    onClick={() => switchWorkspace(workspace.id)}
                                                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                                >
                                                    Switch
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600">
                                        You do not have any workspaces yet.
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