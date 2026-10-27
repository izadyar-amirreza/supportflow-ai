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
            owner: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            agent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            customer: 'bg-slate-800 text-slate-300 border-slate-700',
        };

        return styles[role] ?? styles.customer;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    Workspace Members
                </h2>
            }
        >
            <Head title="Workspace Members" />

            <div className="py-8 bg-slate-950 min-h-screen text-slate-100">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    
                    {/* Workspace Header Info */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Current Workspace
                        </p>
                        <h3 className="mt-1 text-2xl font-bold text-white tracking-tight">
                            {workspace.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Your role:{' '}
                            <span className="font-semibold text-blue-400 capitalize">
                                {workspaceRole}
                            </span>
                        </p>
                    </div>

                    {/* Add Member Form */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 shadow-xl backdrop-blur">
                        <h3 className="text-lg font-semibold text-white tracking-tight">
                            Add existing user to workspace
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                            The user must already have an account in the application.
                        </p>

                        <form
                            onSubmit={submitInvite}
                            className="mt-6 grid gap-4 md:grid-cols-3"
                        >
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    User email
                                </label>
                                <input
                                    type="email"
                                    value={inviteForm.data.email}
                                    onChange={(event) =>
                                        inviteForm.setData('email', event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="user@example.com"
                                />
                                {inviteForm.errors.email && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {inviteForm.errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Role
                                </label>
                                <select
                                    value={inviteForm.data.role}
                                    onChange={(event) =>
                                        inviteForm.setData('role', event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 capitalize"
                                >
                                    {roles.map((role) => (
                                        <option key={role} value={role} className="bg-slate-900 text-white">
                                            {role}
                                        </option>
                                    ))}
                                </select>
                                {inviteForm.errors.role && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {inviteForm.errors.role}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={inviteForm.processing}
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50 transition shadow-blue-600/20"
                                >
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Members Table Section */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-xl backdrop-blur">
                        <div className="p-6 border-b border-white/10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-white tracking-tight">
                                    Members
                                </h3>
                                <p className="mt-1 text-xs text-slate-400">
                                    Manage roles and access for this workspace.
                                </p>
                            </div>

                            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                                Total members: {members.length}
                            </span>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-white/10">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Member
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Role
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Joined
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {members.map((member) => (
                                            <tr key={member.id} className="hover:bg-white/[0.02] transition">
                                                <td className="whitespace-nowrap px-4 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-white flex items-center gap-2">
                                                            {member.name}
                                                            {member.is_current_user && (
                                                                <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                                                                    You
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4">
                                                    {member.is_owner ? (
                                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium border capitalize ${roleBadge(member.role)}`}>
                                                            {member.role}
                                                        </span>
                                                    ) : (
                                                        <select
                                                            value={member.role}
                                                            onChange={(event) =>
                                                                updateRole(member.id, event.target.value)
                                                            }
                                                            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 capitalize"
                                                        >
                                                            {roles.map((role) => (
                                                                <option key={role} value={role} className="bg-slate-900 text-white">
                                                                    {role}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-400">
                                                    {member.joined_at ?? 'Unknown'}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-right">
                                                    {member.is_owner ? (
                                                        <span className="text-xs text-slate-500 italic">
                                                            Owner cannot be removed
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMember(member.id)}
                                                            className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
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
                                    <div className="text-center py-12">
                                        <p className="text-sm text-slate-400">
                                            No members found.
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