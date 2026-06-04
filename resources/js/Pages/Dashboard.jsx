import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ workspace, workspaceRole }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-semibold">
                                Welcome to SupportFlow AI
                            </h3>

                            {workspace ? (
                                <div className="mt-4 rounded-lg border border-gray-200 p-4">
                                    <p className="text-sm text-gray-500">
                                        Current Workspace
                                    </p>

                                    <p className="mt-1 text-xl font-bold text-gray-900">
                                        {workspace.name}
                                    </p>

                                    <p className="mt-2 text-sm text-gray-600">
                                        Your role: <span className="font-semibold">{workspaceRole}</span>
                                        <Link
                                            href={route('workspaces.index')}
                                            className="mt-4 inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
                                            Manage Workspaces
                                        </Link>
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
                                    No workspace found for this account.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}