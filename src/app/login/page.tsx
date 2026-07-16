'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });
        setIsLoading(false);
        if (result?.ok) {
            router.push('/');
        } else {
            setError('Incorrect email or password.');
        }
    };

    return (
        <main className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden"
              style={{ background: '#0a0908' }}>

            {/* ── Ambient Background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Warm peach orb — top right */}
                <div
                    className="absolute animate-orb-float"
                    style={{
                        top: '-18%',
                        right: '-12%',
                        width: '55vw',
                        height: '55vw',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(224,140,100,0.07) 0%, transparent 65%)',
                    }}
                />
                {/* Warm amber orb — bottom left */}
                <div
                    className="absolute animate-orb-float-alt"
                    style={{
                        bottom: '-22%',
                        left: '-14%',
                        width: '50vw',
                        height: '50vw',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(196,154,108,0.055) 0%, transparent 65%)',
                    }}
                />
                {/* Soft center warmth */}
                <div
                    className="absolute"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '70vw',
                        height: '70vw',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,248,240,0.015) 0%, transparent 55%)',
                    }}
                />
            </div>

            {/* ── Login Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                className="relative z-10 w-full max-w-[420px] mx-auto px-5"
            >
                <div className="premium-card-border">
                    <div className="premium-card p-8 sm:p-10">

                        {/* Logo & Brand */}
                        <div className="flex flex-col items-center mb-9">
                            <div className="w-[60px] h-[60px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.5)] mb-5">
                                <Image
                                    src="/gallery-eye-logo.jpg"
                                    alt="Gallery Eye"
                                    width={60}
                                    height={60}
                                    className="w-full h-full object-cover"
                                    priority
                                />
                            </div>
                            <h1 className="text-[22px] font-bold tracking-tight text-white">
                                Gallery Eye
                            </h1>
                            <p className="text-[13px] text-zinc-400 mt-1.5">
                                Sign in to continue to your dashboard
                            </p>
                        </div>

                        {/* Google Sign-In */}
                        <button
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            className="premium-btn-google"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-white/[0.06]" />
                            <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">or</span>
                            <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>

                        {/* Credentials Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="email-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
                                    Email
                                </label>
                                <input
                                    id="email-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                    className="premium-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="password-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
                                    Password
                                </label>
                                <input
                                    id="password-input"
                                    type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    placeholder="••••••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="premium-input"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-red-400/90 flex items-center gap-1.5"
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 8v4M12 16h.01" />
                                    </svg>
                                    {error}
                                </motion.p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="premium-btn-primary mt-1"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        <span>Signing in…</span>
                                    </>
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </button>
                        </form>

                        {/* Bottom line */}
                        <p className="text-center text-[11px] text-zinc-500/70 mt-7">
                            Protected with end-to-end encryption
                        </p>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
