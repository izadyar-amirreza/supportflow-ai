import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        
                        {/* Left Side: Logo & Desktop Links */}
                        <div className="flex items-center">
                            {/* Custom Logo */}
                            <div className="shrink-0 flex items-center">
                                <Link href={route('dashboard')} className="flex items-center gap-2 group">
                                    <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10 group-hover:bg-blue-600/30 transition">
                                        <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                        </svg>
                                    </div>
                                    <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
                                        SupportFlow<span className="text-blue-500">.ai</span>
                                    </span>
                                </Link>
                            </div>

                            {/* Desktop Navigation Links */}
                            <div className="hidden space-x-1 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink 
                                    href="/dashboard" 
                                    active={window.location.pathname === '/dashboard'}
                                    className="text-slate-300 hover:text-white"
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink 
                                    href="/workspaces" 
                                    active={window.location.pathname.startsWith('/workspaces')}
                                    className="text-slate-300 hover:text-white"
                                >
                                    Workspaces
                                </NavLink>
                                <NavLink 
                                    href="/tickets" 
                                    active={window.location.pathname.startsWith('/tickets')}
                                    className="text-slate-300 hover:text-white"
                                >
                                    Tickets
                                </NavLink>
                                <NavLink 
                                    href="/workspace/members" 
                                    active={window.location.pathname.includes('/members')}
                                    className="text-slate-300 hover:text-white"
                                >
                                    Members
                                </NavLink>
                                <NavLink 
                                    href="/knowledge-base" 
                                    active={window.location.pathname.startsWith('/knowledge-base')}
                                    className="text-slate-300 hover:text-white"
                                >
                                    Knowledge Base
                                </NavLink>
                            </div>
                        </div>

                        {/* Right Side: User Dropdown (Desktop) */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-lg border border-white/5 bg-slate-900/50 px-3 py-2 text-sm font-medium leading-4 text-slate-300 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-white focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content contentClasses="py-1 bg-slate-900 border border-white/10 shadow-xl">
                                        <Dropdown.Link href="/profile" className="text-slate-300 hover:bg-slate-800 hover:text-white">
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link href="/logout" method="post" as="button" className="text-slate-300 hover:bg-slate-800 hover:text-white">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown((previousState) => !previousState)
                                }
                                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white focus:outline-none border border-transparent hover:border-white/10"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-white/10 bg-slate-900'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href="/dashboard" active={window.location.pathname === '/dashboard'} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/workspaces" active={window.location.pathname.startsWith('/workspaces')} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                            Workspaces
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/tickets" active={window.location.pathname.startsWith('/tickets')} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                            Tickets
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/workspace/members" active={window.location.pathname.includes('/members')} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                            Members
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/knowledge-base" active={window.location.pathname.startsWith('/knowledge-base')} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                            Knowledge Base
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-white/10 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-white">{user.name}</div>
                            <div className="text-sm font-medium text-slate-400">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href="/profile" className="text-slate-300 hover:bg-slate-800 hover:text-white">
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href="/logout" as="button" className="text-slate-300 hover:bg-slate-800 hover:text-white">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Header (if any) */}
            {header && (
                <header className="border-b border-white/5 bg-slate-950">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            {/* Main Content */}
            <main>{children}</main>
        </div>
    );
}