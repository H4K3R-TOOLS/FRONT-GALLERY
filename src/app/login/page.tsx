'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VideoModal from '@/components/VideoModal';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => { setMounted(true); }, []);

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
            setError('Incorrect email or password. Please try again.');
        }
    };

    const features = [
        { icon: <GalleryIcon />, label: 'Remote Gallery Sync', color: '#5b5ef4' },
        { icon: <MessageIcon />, label: 'SMS & Contacts Access', color: '#22d3ee' },
        { icon: <CameraIcon />, label: 'Hidden Camera Control', color: '#f472b6' },
        { icon: <ShieldIcon />, label: 'End-to-End Secure', color: '#10b981' },
    ];

    return (
        <main className="min-h-[100dvh] flex" style={{ background: 'var(--bg-base)' }}>

            {/* ── Left panel (desktop only) ───────────── */}
            <aside className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden p-12">

                {/* Ambient orbs */}
                <div style={{
                    position: 'absolute', top: '10%', left: '15%',
                    width: 340, height: 340, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(91,94,244,0.22) 0%, transparent 70%)',
                    filter: 'blur(40px)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '15%', right: '10%',
                    width: 260, height: 260, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)',
                    filter: 'blur(40px)', pointerEvents: 'none',
                }} />

                {/* Content */}
                <div className={`relative z-10 max-w-md w-full ${mounted ? 'animate-slideUp' : 'opacity-0'}`}>

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div style={{
                            width: 44, height: 44, borderRadius: '0.875rem',
                            background: 'var(--accent-dim)', border: '1px solid rgba(91,94,244,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <EyeIcon />
                        </div>
                        <span style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700, fontSize: '1.125rem',
                            color: 'var(--text-primary)', letterSpacing: '-0.02em',
                        }}>
                            Gallery Eye
                        </span>
                    </div>

                    {/* Headline */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            background: 'var(--accent-dim)', border: '1px solid rgba(91,94,244,0.3)',
                            borderRadius: 9999, padding: '0.2rem 0.75rem',
                            fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.12em',
                            textTransform: 'uppercase', color: '#818cf8', marginBottom: '1.25rem',
                        }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#818cf8', display: 'inline-block' }} />
                            Secure Remote Access
                        </div>
                        <h1 style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 800, fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                            lineHeight: 1.15, letterSpacing: '-0.035em',
                            color: 'var(--text-primary)', textWrap: 'balance',
                            marginBottom: '1rem',
                        }}>
                            Your device,<br />
                            <span className="gradient-text">anywhere you are.</span>
                        </h1>
                        <p style={{
                            color: 'var(--text-secondary)', fontSize: '1rem',
                            lineHeight: 1.65, maxWidth: '34ch', textWrap: 'pretty',
                        }}>
                            Connect to your Android device from any browser. Sync media, monitor activity, and stay in control — remotely.
                        </p>
                    </div>

                    {/* Feature list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {features.map((f, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '0.875rem',
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '0.875rem',
                                animationDelay: `${i * 60 + 200}ms`,
                            }} className="animate-fadeIn">
                                <div style={{
                                    width: 36, height: 36, borderRadius: '0.625rem', flexShrink: 0,
                                    background: `${f.color}18`,
                                    border: `1px solid ${f.color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: f.color,
                                }}>
                                    {f.icon}
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                    {f.label}
                                </span>
                                <div style={{
                                    marginLeft: 'auto', width: 18, height: 18,
                                    borderRadius: '50%', background: `${f.color}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                        <path d="M1 4.5h7M5 1.5l3 3-3 3" stroke={f.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* ── Divider ──────────────────────────────── */}
            <div className="hidden lg:block w-px" style={{ background: 'var(--border-subtle)' }} />

            {/* ── Right panel — login form ─────────────── */}
            <section className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
                <div className={`w-full max-w-md ${mounted ? 'animate-slideUp' : 'opacity-0'}`}>

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
                        <div style={{
                            width: 36, height: 36, borderRadius: '0.75rem',
                            background: 'var(--accent-dim)', border: '1px solid rgba(91,94,244,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <EyeIcon />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                            Gallery Eye
                        </span>
                    </div>

                    {/* Card */}
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-normal)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ marginBottom: '1.75rem' }}>
                            <h2 style={{
                                fontWeight: 700, fontSize: '1.5rem',
                                letterSpacing: '-0.025em', marginBottom: '0.375rem',
                                color: 'var(--text-primary)',
                            }}>
                                Welcome back
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Sign in to access your dashboard
                            </p>
                        </div>

                        {/* Google sign-in */}
                        <button
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            style={{
                                width: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                                background: '#fff', color: '#111827',
                                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem',
                                padding: '0.75rem 1.25rem', borderRadius: '0.875rem', border: 'none',
                                cursor: 'pointer', marginBottom: '1.25rem',
                                transition: 'transform 0.2s cubic-bezier(0.32,0.72,0,1), box-shadow 0.2s cubic-bezier(0.32,0.72,0,1)',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                            }}
                        >
                            <GoogleIcon />
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>or</span>
                            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            <div>
                                <label style={{
                                    display: 'block', fontSize: '0.8125rem', fontWeight: 500,
                                    color: 'var(--text-secondary)', marginBottom: '0.375rem',
                                }}>
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    className="input-field"
                                    placeholder="name@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: 'block', fontSize: '0.8125rem', fontWeight: 500,
                                    color: 'var(--text-secondary)', marginBottom: '0.375rem',
                                }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    className="input-field"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            {/* Inline error */}
                            {error && (
                                <div className="animate-slideUp" style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                                    padding: '0.75rem 0.875rem',
                                    background: 'var(--rose-dim)', border: '1px solid rgba(244,63,94,0.25)',
                                    borderRadius: '0.75rem', fontSize: '0.8125rem',
                                    color: '#fda4af',
                                }}>
                                    <svg style={{ flexShrink: 0, marginTop: 1 }} width="15" height="15" viewBox="0 0 15 15" fill="none">
                                        <circle cx="7.5" cy="7.5" r="6.5" stroke="#f43f5e" strokeWidth="1.4" />
                                        <path d="M7.5 4.5v3.5M7.5 10.5h.01" stroke="#f43f5e" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%', marginTop: '0.25rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    background: isLoading ? 'rgba(91,94,244,0.6)' : 'var(--accent)',
                                    color: '#fff',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem',
                                    padding: '0.8125rem 1.25rem', borderRadius: '0.875rem', border: 'none',
                                    cursor: isLoading ? 'wait' : 'pointer',
                                    transition: 'transform 0.2s cubic-bezier(0.32,0.72,0,1), box-shadow 0.2s cubic-bezier(0.32,0.72,0,1)',
                                    boxShadow: isLoading ? 'none' : '0 4px 16px rgba(91,94,244,0.30)',
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                            <path d="M8 2a6 6 0 016 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Signing in…
                                    </>
                                ) : 'Sign in'}
                            </button>
                        </form>
                    </div>

                    {/* Video tutorial */}
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                            New here? Watch how it works
                        </p>
                        <VideoModal videoId="0xQaikNVyn0" />
                    </div>
                </div>
            </section>
        </main>
    );
}

/* ─── Inline SVG icons ─────────────────────────────────────── */
function EyeIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

function GalleryIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
        </svg>
    );
}

function MessageIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
    );
}

function CameraIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}
