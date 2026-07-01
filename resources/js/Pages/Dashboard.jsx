import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, workspace, stats, recentTickets }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard overview</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Welcome Banner */}
                    <div className="mb-8 overflow-hidden bg-indigo-600 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-white">
                            <h3 className="text-2xl font-bold">Welcome back, {auth.user.name}! 👋</h3>
                            <p className="mt-1 text-indigo-100">
                                You are currently viewing the <span className="font-semibold text-white">{workspace?.name || 'Main'}</span> workspace. 
                                Here is what is happening with your support tickets today.
                            </p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        
                        <div className="overflow-hidden rounded-lg bg-white p-5 shadow">
                            <dt className="truncate text-sm font-medium text-gray-500">Open Tickets</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.openTickets}</dd>
                        </div>
                        
                        <div className="overflow-hidden rounded-lg bg-white p-5 shadow">
                            <dt className="truncate text-sm font-medium text-gray-500">Urgent Priority ⚡</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-600">{stats.urgentTickets}</dd>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white p-5 shadow">
                            <dt className="truncate text-sm font-medium text-gray-500">Assigned to Me</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-indigo-600">{stats.assignedToMeTickets}</dd>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white p-5 shadow">
                            <dt className="truncate text-sm font-medium text-gray-500">Resolved / Closed</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">
                                {stats.resolvedTickets + stats.closedTickets} <span className="text-sm font-normal text-gray-400">/ {stats.totalTickets} total</span>
                            </dd>
                        </div>

                    </div>

                    {/* Recent Tickets Table */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
                            <p className="mt-1 text-sm text-gray-500">The latest tickets that need attention.</p>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ticket Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Priority</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {recentTickets && recentTickets.length > 0 ? (
                                        recentTickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                                                    <div className="text-sm text-gray-500">by {ticket.creator}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                        ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                                        ticket.status === 'closed' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                        ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {ticket.created_at}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                    <Link href={route('tickets.show', ticket.id)} className="text-indigo-600 hover:text-indigo-900">
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No tickets found in this workspace.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}