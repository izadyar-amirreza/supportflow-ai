import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function Index({ workspace, workspaceRole, members, roles }) {
    const inviteForm = useForm({
        email: '',
        role: 'agent',
    });

    const submitInvite = (event) => {
        event.preventDefault();

        inviteForm.post(route('workspace-members.store'), {
            onSuccess: () => inviteForm.reset('email', 'role'),
        });
    };

    const updateRole = (memberId, role) => {
        router.patch(route('workspace-members.update', memberId), {
            role,
        });
    };

    const removeMember = (memberId) => {
        if (!confirm('Are you sure you want to remove this member?')) {
            return;
        }

        router.delete(route('workspace-members.destroy', memberId));
    };

    const roleBadge = (role) => {
        const styles = {
            owner: 'bg-purple-100 text-purple-700',
            admin: 'bg-blue-100 text-blue-700',
            agent: 'bg-green-100 text-green-700',
            customer: 'bg-gray-100 text-gray-700',
        };

        return styles[role] ?? styles.customer;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Workspace Members
                </h2>
            }
        >
            <Head title="Workspace Members" />

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
                                Your role:{' '}
                                <span className="font-semibold">
                                    {workspaceRole}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Add existing user to workspace
                            </h3>

                            <p className="mt-1 text-sm text-gray-600">
                                The user must already have an account in the application.
                            </p>

                            <form
                                onSubmit={submitInvite}
                                className="mt-6 grid gap-4 md:grid-cols-3"
                            >
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        User email
                                    </label>

                                    <input
                                        type="email"
                                        value={inviteForm.data.email}
                                        onChange={(event) =>
                                            inviteForm.setData('email', event.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="user@example.com"
                                    />

                                    {inviteForm.errors.email && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {inviteForm.errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Role
                                    </label>

                                    <select
                                        value={inviteForm.data.role}
                                        onChange={(event) =>
                                            inviteForm.setData('role', event.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>

                                    {inviteForm.errors.role && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {inviteForm.errors.role}
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-3">
                                    <button
                                        type="submit"
                                        disabled={inviteForm.processing}
                                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        Add Member
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Members
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-600">
                                        Manage roles and access for this workspace.
                                    </p>
                                </div>

                                <p className="text-sm text-gray-500">
                                    Total members: {members.length}
                                </p>
                            </div>

                            <div className="mt-6 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Member
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Role
                                            </th>

                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Joined
                                            </th>

                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {members.map((member) => (
                                            <tr key={member.id}>
                                                <td className="whitespace-nowrap px-4 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {member.name}
                                                            {member.is_current_user && (
                                                                <span className="ml-2 text-xs text-gray-500">
                                                                    You
                                                                </span>
                                                            )}
                                                        </p>

                                                        <p className="text-sm text-gray-500">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4">
                                                    {member.is_owner ? (
                                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleBadge(member.role)}`}>
                                                            {member.role}
                                                        </span>
                                                    ) : (
                                                        <select
                                                            value={member.role}
                                                            onChange={(event) =>
                                                                updateRole(member.id, event.target.value)
                                                            }
                                                            className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        >
                                                            {roles.map((role) => (
                                                                <option key={role} value={role}>
                                                                    {role}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                                                    {member.joined_at ?? 'Unknown'}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-right">
                                                    {member.is_owner ? (
                                                        <span className="text-xs text-gray-400">
                                                            Owner cannot be removed
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMember(member.id)}
                                                            className="text-sm font-medium text-red-600 hover:text-red-800"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {members.length === 0 && (
                                    <p className="mt-6 text-sm text-gray-600">
                                        No members found.
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