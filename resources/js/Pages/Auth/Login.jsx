import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased">
            <Head title="SupportFlow AI" />

            <div className="max-w-6xl w-full rounded-3xl border border-white/10 bg-slate-900/40 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    
                    {/* Left Column: Project Overview & Features */}
                    <div className="lg:col-span-7 space-y-6">
                        <span className="inline-flex items-center rounded-full bg-blue-600 px-3.5 py-1 text-xs font-semibold text-white">
                            SupportFlow AI Project
                        </span>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                            SupportFlow AI for intelligent customer support & ticketing.
                        </h1>

                        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                            A modern AI-assisted helpdesk and ticketing platform built with Laravel, React (Inertia.js), real-time messaging, and LLM-powered ticket resolution.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                <h3 className="font-semibold text-white text-sm">Smart Ticketing</h3>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Create, track, and resolve customer support tickets in one place.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                <h3 className="font-semibold text-white text-sm">AI Co-Pilot</h3>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Instant AI-generated replies and smart conversation assistance.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                <h3 className="font-semibold text-white text-sm">Admin & User Portals</h3>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Role-based access control for support agents and customers.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                <h3 className="font-semibold text-white text-sm">Deployment Ready</h3>
                                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                    Docker-based production deployment on Render & Supabase.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Login Card */}
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 sm:p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">SupportFlow AI</h2>
                                    <p className="text-xs text-slate-400">Intelligent ticketing system for modern teams</p>
                                </div>
                            </div>

                            {status && (
                                <div className="mb-4 text-sm font-medium text-emerald-400">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="admin@example.com"
                                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        autoComplete="username"
                                        autoFocus
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-xs font-medium text-slate-300 mb-1">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        autoComplete="current-password"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs text-slate-400">Remember me</span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs text-blue-400 hover:text-blue-300 transition"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
                                >
                                    Sign in to workspace
                                </button>

                                <div className="pt-3 text-center border-t border-white/10">
                                    <p className="text-xs text-slate-400">
                                        Don't have an account?{' '}
                                        <Link
                                            href={route('register')}
                                            className="font-semibold text-blue-400 hover:text-blue-300 transition"
                                        >
                                            Create an account
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}