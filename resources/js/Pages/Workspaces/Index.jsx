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
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    Workspaces Management
                </h2>
            }
        >
            <Head title="Workspaces" />

            <div className="py-8 bg-slate-950 min-h-screen text-slate-100">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    
                    {/* Create New Workspace Card */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 shadow-xl backdrop-blur">
                        <h3 className="text-lg font-semibold text-white tracking-tight">
                            Create a new workspace
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Workspaces let you separate teams, customers, tickets, and support workflows.
                        </p>

                        <form onSubmit={submit} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    placeholder="Workspace name"
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />

                                {errors.name && (
                                    <p className="mt-2 text-xs text-red-400">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50 transition shadow-blue-600/20"
                            >
                                Create Workspace
                            </button>
                        </form>
                    </div>

                    {/* Your Workspaces List */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-xl backdrop-blur">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-white">
                                Your workspaces
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                                Switch between active workspaces or manage team contexts.
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {workspaces.length > 0 ? (
                                    workspaces.map((workspace) => (
                                        <div
                                            key={workspace.id}
                                            className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/60 p-5 sm:flex-row sm:items-center hover:border-blue-500/30 transition"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-base font-semibold text-white">
                                                        {workspace.name}
                                                    </h4>

                                                    {workspace.is_current && (
                                                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-300">
                                                    Role: <span className="font-semibold text-blue-400 capitalize">{workspace.role}</span>
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    Slug: {workspace.slug}
                                                </p>
                                            </div>

                                            {!workspace.is_current && (
                                                <button
                                                    type="button"
                                                    onClick={() => switchWorkspace(workspace.id)}
                                                    className="rounded-xl bg-slate-800 border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                                                >
                                                    Switch
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-sm text-slate-400">
                                            You do not have any workspaces yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}