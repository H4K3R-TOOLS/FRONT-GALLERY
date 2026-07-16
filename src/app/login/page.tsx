'use client';

import { signIn } from 'next-auth/react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

/* ── Reusable scroll-reveal wrapper ── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay, ease: [0.32, 0.72, 0, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.96]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await signIn('credentials', { email, password, redirect: false });
        setIsLoading(false);
        if (result?.ok) {
            router.push('/');
        } else {
            setError('Incorrect email or password.');
        }
    };

    const scrollToLogin = () => {
        document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    /* Abstract gradient cards for the gallery composition */
    const galleryCards = [
        { w: 220, h: 280, x: '2%',  y: '8%',  rotate: -4, gradient: 'linear-gradient(145deg, #e8966d 0%, #d4786e 40%, #c4606a 100%)', label: 'Sunset.heic' },
        { w: 180, h: 240, x: '28%', y: '18%', rotate: 2,  gradient: 'linear-gradient(145deg, #6e8cc4 0%, #4a7ab5 40%, #3b6da0 100%)', label: 'Ocean.jpg' },
        { w: 260, h: 200, x: '52%', y: '5%',  rotate: -1, gradient: 'linear-gradient(145deg, #c49a6c 0%, #b88a5c 40%, #a67a4f 100%)', label: 'Golden_Hour.raw' },
        { w: 200, h: 260, x: '75%', y: '15%', rotate: 3,  gradient: 'linear-gradient(145deg, #8b7ec8 0%, #7a6bb8 40%, #6958a4 100%)', label: 'Portrait.png' },
        { w: 170, h: 220, x: '14%', y: '52%', rotate: -3, gradient: 'linear-gradient(145deg, #6bb89a 0%, #5aa88a 40%, #4c9a7c 100%)', label: 'Forest.dng' },
        { w: 240, h: 180, x: '42%', y: '58%', rotate: 1,  gradient: 'linear-gradient(145deg, #c87e8a 0%, #b86e7a 40%, #a85e6c 100%)', label: 'Bloom.tiff' },
        { w: 190, h: 250, x: '70%', y: '48%', rotate: -2, gradient: 'linear-gradient(145deg, #7aa8c4 0%, #6898b4 40%, #5688a4 100%)', label: 'Mist.heic' },
    ];

    return (
        <main className="bg-[#0a0908] text-[#fafaf9] overflow-x-hidden selection:bg-amber-200/20 selection:text-white">

            {/* ══════════════════════════════════════════════
                AMBIENT BACKGROUND (fixed, always behind)
            ══════════════════════════════════════════════ */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute animate-orb-float"
                     style={{ top: '-18%', right: '-12%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,140,100,0.06) 0%, transparent 65%)' }} />
                <div className="absolute animate-orb-float-alt"
                     style={{ bottom: '-22%', left: '-14%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,154,108,0.05) 0%, transparent 65%)' }} />
                <div className="absolute"
                     style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '70vw', height: '70vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,248,240,0.012) 0%, transparent 55%)' }} />
            </div>


            {/* ══════════════════════════════════════════════
                SECTION 1 — CINEMATIC HERO
            ══════════════════════════════════════════════ */}
            <motion.section
                ref={heroRef}
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-5 py-20"
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                    className="mb-8"
                >
                    <div className="w-20 h-20 rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                        <Image src="/gallery-eye-logo.jpg" alt="Gallery Eye" width={80} height={80} className="w-full h-full object-cover" priority />
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
                    className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] max-w-3xl"
                >
                    Every photo.{' '}
                    <span className="bg-gradient-to-r from-[#d4a574] via-[#c49a6c] to-[#b88a5c] bg-clip-text text-transparent">
                        Beautifully
                    </span>{' '}
                    in sync.
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    className="text-center text-base sm:text-lg text-zinc-400 mt-6 max-w-lg leading-relaxed"
                >
                    Seamlessly access, organize, and protect your entire media library from anywhere. One dashboard, all your devices.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.45, ease: [0.32, 0.72, 0, 1] }}
                    className="flex flex-wrap items-center justify-center gap-4 mt-10"
                >
                    <button
                        onClick={scrollToLogin}
                        className="px-7 py-3.5 rounded-full font-semibold text-sm text-[#1c1917] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                        style={{ background: 'linear-gradient(to bottom, #faf5ef, #ede5d8)', boxShadow: '0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)' }}
                    >
                        Get Started
                    </button>
                    <a
                        href="#gallery"
                        className="px-7 py-3.5 rounded-full font-semibold text-sm text-zinc-200 border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                    >
                        Explore
                    </a>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">Scroll</span>
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-px h-8 bg-gradient-to-b from-zinc-500 to-transparent"
                    />
                </motion.div>
            </motion.section>


            {/* ══════════════════════════════════════════════
                SECTION 2 — FLOATING GLASS GALLERY
            ══════════════════════════════════════════════ */}
            <section id="gallery" className="relative z-10 py-28 sm:py-36 px-5">
                <Reveal className="text-center max-w-xl mx-auto mb-16 sm:mb-20">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[#c49a6c] font-semibold mb-4">Visual Experience</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                        Your gallery, reimagined
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-400 mt-5 leading-relaxed">
                        Every file type, every resolution — presented in a way that feels effortless and beautiful.
                    </p>
                </Reveal>

                {/* Glass card composition */}
                <div className="relative max-w-5xl mx-auto" style={{ height: 'clamp(420px, 60vw, 600px)' }}>
                    {galleryCards.map((card, i) => (
                        <Reveal key={i} delay={i * 0.08}>
                            <div
                                className="absolute rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/[0.06] backdrop-blur-sm transition-transform duration-500 hover:scale-[1.04] hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] cursor-default group"
                                style={{
                                    width: card.w,
                                    height: card.h,
                                    left: card.x,
                                    top: card.y,
                                    transform: `rotate(${card.rotate}deg)`,
                                }}
                            >
                                {/* Gradient fill (abstract photo) */}
                                <div className="absolute inset-0" style={{ background: card.gradient }} />
                                {/* Glass overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
                                {/* Label */}
                                <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-black/40 backdrop-blur-md">
                                    <span className="text-[10px] font-mono text-white/70 tracking-wide">{card.label}</span>
                                </div>
                                {/* Top-right selection dot */}
                                <div className="absolute top-3 right-3 w-3 h-3 rounded-full border border-white/30 bg-white/10 group-hover:bg-white/30 transition-colors" />
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>


            {/* ══════════════════════════════════════════════
                SECTION 3 — ELEGANT FEATURES (Minimal Cards)
            ══════════════════════════════════════════════ */}
            <section className="relative z-10 py-28 sm:py-36 px-5">
                <div className="max-w-5xl mx-auto">
                    <Reveal className="text-center max-w-xl mx-auto mb-16">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c49a6c] font-semibold mb-4">Why Gallery Eye</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                            Crafted for perfection
                        </h2>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: (
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ),
                                title: 'Instant Sync',
                                desc: 'Your photos appear the moment they\'re captured. Zero lag, zero waiting. Real-time, always.',
                            },
                            {
                                icon: (
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ),
                                title: 'Private & Secure',
                                desc: 'End-to-end encrypted transfers. Your memories stay yours — never stored on third-party servers.',
                            },
                            {
                                icon: (
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                ),
                                title: 'Smart Gallery',
                                desc: 'Intelligent organization by date, type, and size. Find any file in seconds across all your devices.',
                            },
                        ].map((feature, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-400 group h-full">
                                    <div className="w-12 h-12 rounded-xl bg-[#c49a6c]/10 border border-[#c49a6c]/20 flex items-center justify-center text-[#c49a6c] mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>


            {/* ══════════════════════════════════════════════
                SECTION 4 — STATS STRIP
            ══════════════════════════════════════════════ */}
            <section className="relative z-10 py-20 px-5 border-y border-white/[0.04]">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: '50K+', label: 'Active Users' },
                        { value: '12M+', label: 'Photos Synced' },
                        { value: '99.9%', label: 'Uptime' },
                        { value: '< 18ms', label: 'Avg. Latency' },
                    ].map((stat, i) => (
                        <Reveal key={i} delay={i * 0.08}>
                            <div>
                                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-zinc-500 mt-1.5 uppercase tracking-wider font-medium">{stat.label}</div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>


            {/* ══════════════════════════════════════════════
                SECTION 5 — LOGIN / SIGN IN
            ══════════════════════════════════════════════ */}
            <section id="login-section" className="relative z-10 py-28 sm:py-36 px-5 flex flex-col items-center">
                <Reveal className="text-center mb-12">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[#c49a6c] font-semibold mb-4">Get Started</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                        Sign in to Gallery Eye
                    </h2>
                    <p className="text-sm text-zinc-400 mt-4">
                        Access your dashboard and start managing your gallery
                    </p>
                </Reveal>

                <Reveal delay={0.15}>
                    <div className="w-full max-w-[420px]">
                        <div className="premium-card-border">
                            <div className="premium-card p-8 sm:p-10">

                                {/* Logo inside card */}
                                <div className="flex justify-center mb-7">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                                        <Image src="/gallery-eye-logo.jpg" alt="Gallery Eye" width={56} height={56} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                {/* Google Sign-In */}
                                <button onClick={() => signIn('google', { callbackUrl: '/' })} className="premium-btn-google">
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
                                        <label htmlFor="email-input" className="block text-xs font-medium text-zinc-300 mb-1.5">Email</label>
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
                                        <label htmlFor="password-input" className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
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

                                    {error && (
                                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400/90 flex items-center gap-1.5">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                                                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                                            </svg>
                                            {error}
                                        </motion.p>
                                    )}

                                    <button type="submit" disabled={isLoading} className="premium-btn-primary mt-1">
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

                                <p className="text-center text-[11px] text-zinc-500/60 mt-7">
                                    Protected with end-to-end encryption
                                </p>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>


            {/* ══════════════════════════════════════════════
                FOOTER
            ══════════════════════════════════════════════ */}
            <footer className="relative z-10 py-14 px-5 border-t border-white/[0.04]">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-white/[0.06]">
                            <Image src="/gallery-eye-logo.jpg" alt="Gallery Eye" width={28} height={28} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-zinc-400 font-medium">Gallery Eye</span>
                        <span className="text-xs text-zinc-600">© 2026</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-zinc-500">
                        <a href="#" className="hover:text-zinc-200 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-zinc-200 transition-colors">Terms</a>
                        <a href="#" className="hover:text-zinc-200 transition-colors">Status</a>
                    </div>
                </div>
            </footer>

        </main>
    );
}
