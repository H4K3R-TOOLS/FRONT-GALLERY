'use client';

import { signIn } from 'next-auth/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

/* ═══════ COMPONENTS ═══════ */

/* Mouse-following ambient glow (desktop only) */
function CursorGlow() {
    const [pos, setPos] = useState({ x: -500, y: -500 });
    useEffect(() => {
        const h = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', h, { passive: true });
        return () => window.removeEventListener('mousemove', h);
    }, []);
    return (
        <div className="fixed pointer-events-none z-[1] hidden md:block" style={{
            left: pos.x - 250, top: pos.y - 250, width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,165,116,0.035) 0%, transparent 55%)',
            transition: 'left 0.15s ease-out, top 0.15s ease-out',
        }} />
    );
}

/* Sticky nav appearing on scroll */
function StickyNav({ onScrollTo }: { onScrollTo: (id: string) => void }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const h = () => setShow(window.scrollY > window.innerHeight * 0.6);
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);
    return (
        <AnimatePresence>
            {show && (
                <motion.nav
                    initial={{ y: -70, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -70, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] sticky-nav-glass rounded-full px-2 py-1.5 flex items-center gap-1"
                >
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/[0.06] mr-1">
                        <Image src="/gallery-eye-logo.jpg" alt="GE" width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                    {['tools', 'capabilities', 'login-section'].map((id) => (
                        <button key={id} onClick={() => onScrollTo(id)} className="px-4 py-2 rounded-full text-[11px] font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all capitalize">
                            {id === 'login-section' ? 'Sign In' : id}
                        </button>
                    ))}
                </motion.nav>
            )}
        </AnimatePresence>
    );
}

/* Animated number counter */
function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!inView) return;
        const duration = 2000;
        const start = Date.now();
        const timer = setInterval(() => {
            const progress = Math.min((Date.now() - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(eased * target));
            if (progress >= 1) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);
    return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

/* Scroll-reveal wrapper */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >{children}</motion.div>
    );
}

/* 3D magnetic tilt card */
function MagneticCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({});
    const onMove = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -5;
        const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 5;
        setStyle({ transform: `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)` });
    }, []);
    const onLeave = useCallback(() => setStyle({ transform: 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)' }), []);
    return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={{ ...style, transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1)', willChange: 'transform' }}>{children}</div>;
}

/* ═══════ MAIN PAGE ═══════ */

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setIsLoading(true);
        const r = await signIn('credentials', { email, password, redirect: false });
        setIsLoading(false);
        if (r?.ok) router.push('/'); else setError('Incorrect email or password.');
    };
    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const tools = [
        { id: 'gallery', name: 'Gallery Sync', desc: 'Browse, select, and bulk-download photos & videos from any connected device. Generate encrypted ZIP archives instantly in-browser.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>, accent: '#e8966d', featured: true },
        { id: 'camera', name: 'Remote Camera', desc: 'Capture photos or stream live video from front & rear cameras. Toggle flash, switch lenses, save directly.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>, accent: '#6ecce8' },
        { id: 'audio', name: 'Microphone', desc: 'Record ambient audio remotely. Adjustable duration and quality — files stream directly to your browser.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>, accent: '#b88ae8' },
        { id: 'notifications', name: 'Live Alerts', desc: 'Monitor every notification — app names, titles, content, and timestamps in a live-updating feed.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>, accent: '#7a8ce8' },
        { id: 'contacts', name: 'Contacts', desc: 'Access the full contact list — names, numbers, emails. Search, filter, and export across synced devices.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>, accent: '#6ec4a8' },
        { id: 'sms', name: 'Messages', desc: 'Read SMS threads in real time — full conversation history with sender info, timestamps, and search.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, accent: '#6ea8e8' },
        { id: 'torch', name: 'Flashlight', desc: 'Toggle the device flashlight on or off remotely with a single tap. Instant response.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, accent: '#e8c46e' },
        { id: 'vibration', name: 'Vibrate', desc: 'Trigger device vibration remotely — locate a misplaced phone or send a silent alert.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M2 8v8M22 8v8"/></svg>, accent: '#e86e8c' },
    ];

    const marqueeItems = ['Gallery Sync', 'Remote Camera', 'Live Microphone', 'Alert Monitor', 'Contact Access', 'SMS Reader', 'Flashlight Control', 'Vibration Trigger', 'Bulk ZIP Export', 'Custom APK Builder', '256-bit Encryption', 'Multi-Device Fleet'];

    return (
        <main className="bg-[#080807] text-[#fafaf9] overflow-x-hidden selection:bg-amber-200/20">

            {/* Global effects */}
            <div className="grain-overlay" />
            <CursorGlow />
            <StickyNav onScrollTo={scrollTo} />

            {/* ── Fixed Ambient Background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute animate-orb-float" style={{ top: '-20%', right: '-15%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,140,100,0.055) 0%, transparent 60%)' }} />
                <div className="absolute animate-orb-float-alt" style={{ bottom: '-25%', left: '-15%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,140,220,0.035) 0%, transparent 60%)' }} />
                <div className="absolute" style={{ top: '40%', left: '30%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(110,170,232,0.025) 0%, transparent 55%)' }} />
            </div>


            {/* ═══ HERO ═══ */}
            <section ref={heroRef} className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-5 py-24 overflow-hidden">
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center text-center max-w-4xl mx-auto">

                    {/* Rotating gradient border logo */}
                    <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="relative mb-12">
                        <div className="relative w-[108px] h-[108px]">
                            {/* Spinning conic gradient */}
                            <div className="absolute inset-0 rounded-[2rem] animate-spin-slow" style={{ background: 'conic-gradient(from 0deg, #d4a574, #e8966d, #b88ae8, #6ea8e8, #6ec4a8, #e8c46e, #d4a574)' }} />
                            {/* Glow layer */}
                            <div className="absolute inset-0 rounded-[2rem] animate-spin-slow blur-lg opacity-40" style={{ background: 'conic-gradient(from 0deg, #d4a574, #e8966d, #b88ae8, #6ea8e8, #6ec4a8, #e8c46e, #d4a574)' }} />
                            {/* Inner image */}
                            <div className="absolute inset-[3px] rounded-[calc(2rem-3px)] overflow-hidden bg-[#080807]">
                                <Image src="/gallery-eye-logo.jpg" alt="Gallery Eye" width={102} height={102} className="w-full h-full object-cover" priority />
                            </div>
                        </div>
                    </motion.div>

                    {/* Headline with animated gradient */}
                    <motion.h1 initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold tracking-[-0.045em] leading-[1.05]">
                        Total Device Control.
                        <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-[#d4a574] via-[#e8966d] to-[#b88ae8] bg-clip-text text-transparent animate-gradient-text">
                            From Your Browser.
                        </span>
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} className="text-base sm:text-lg md:text-xl text-zinc-400 mt-7 max-w-2xl leading-relaxed font-light">
                        Gallery, camera, messages, microphone, contacts, alerts — 8 powerful tools accessible remotely through a single encrypted dashboard.
                    </motion.p>

                    {/* CTA */}
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex flex-wrap items-center justify-center gap-4 mt-12">
                        <button onClick={() => scrollTo('login-section')} className="group relative px-8 py-4 rounded-full font-bold text-sm text-[#1c1917] overflow-hidden active:scale-[0.96] transition-transform" style={{ background: 'linear-gradient(to bottom, #faf5ef, #ede5d8)', boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
                            <span className="relative z-10 flex items-center gap-2">Get Started Free <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                        <button onClick={() => scrollTo('tools')} className="px-8 py-4 rounded-full font-semibold text-sm text-zinc-300 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-400 active:scale-[0.96]">
                            View All Tools
                        </button>
                    </motion.div>

                    {/* Tool icon pills with staggered pop-in */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} className="mt-20 flex items-center justify-center gap-3 flex-wrap">
                        {tools.map((t, i) => (
                            <motion.div key={t.id} initial={{ opacity: 0, scale: 0, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.9 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/[0.05] bg-white/[0.015] backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/[0.12] hover:scale-110 hover:-translate-y-1 transition-all duration-300 cursor-default group" style={{ color: t.accent }} title={t.name}>
                                <div className="scale-[0.65] group-hover:scale-[0.75] transition-transform">{t.icon}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-semibold">Scroll to explore</span>
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-5 h-9 rounded-full border border-white/[0.08] flex items-start justify-center pt-2">
                        <div className="w-1 h-2 rounded-full bg-[#c49a6c]/60" />
                    </motion.div>
                </motion.div>
            </section>


            {/* ═══ MARQUEE STRIP ═══ */}
            <section className="relative z-10 py-6 border-y border-white/[0.03] overflow-hidden">
                <div className="animate-marquee flex gap-8 whitespace-nowrap">
                    {[...marqueeItems, ...marqueeItems].map((item, i) => (
                        <span key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c49a6c]/40 flex-shrink-0" />
                            {item}
                        </span>
                    ))}
                </div>
            </section>


            {/* ═══ ALL 8 TOOLS ═══ */}
            <section id="tools" className="relative z-10 py-32 px-5">
                <Reveal className="text-center max-w-2xl mx-auto mb-20">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-semibold mb-5" style={{ color: '#c49a6c' }}>8 Powerful Tools</p>
                    <h2 className="text-3xl sm:text-4xl md:text-[3.2rem] font-extrabold tracking-tight leading-[1.1]">
                        Everything you need.{' '}
                        <span className="text-zinc-500">Nothing you don&apos;t.</span>
                    </h2>
                </Reveal>

                <div className="max-w-5xl mx-auto flex flex-col gap-5">
                    {/* Featured card: Gallery (full width, horizontal) */}
                    <Reveal>
                        <MagneticCard>
                            <div className="card-glow-border rounded-3xl p-8 sm:p-10 border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03] transition-colors duration-500 group grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                <div className="md:col-span-7 relative z-10">
                                    <div className="absolute top-0 left-0 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[50px]" style={{ background: tools[0].accent }} />
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/[0.06] bg-white/[0.03] group-hover:border-white/[0.12] transition-all" style={{ color: tools[0].accent }}>
                                            <div className="scale-110">{tools[0].icon}</div>
                                        </div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border" style={{ color: tools[0].accent, borderColor: `${tools[0].accent}30`, background: `${tools[0].accent}08` }}>
                                            ★ Featured Tool
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{tools[0].name}</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed max-w-md">{tools[0].desc}</p>
                                    </div>
                                </div>
                                {/* Visual gallery mock */}
                                <div className="md:col-span-5 grid grid-cols-3 gap-2">
                                    {['#e8966d', '#c49a6c', '#b88ae8', '#6ecce8', '#6ec4a8', '#e8c46e'].map((c, i) => (
                                        <div key={i} className="aspect-square rounded-xl border border-white/[0.04] group-hover:border-white/[0.08] transition-all duration-500" style={{ background: `linear-gradient(135deg, ${c}30, ${c}10)`, transitionDelay: `${i * 60}ms` }}>
                                            <div className="w-full h-full rounded-xl bg-gradient-to-b from-white/[0.04] to-transparent" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </MagneticCard>
                    </Reveal>

                    {/* Remaining 7 tools: 2-col grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {tools.slice(1).map((tool, i) => (
                            <Reveal key={tool.id} delay={i * 0.05}>
                                <MagneticCard className="h-full">
                                    <div className="card-glow-border rounded-2xl p-7 sm:p-8 border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03] transition-colors duration-500 group h-full">
                                        <div className="absolute top-5 left-5 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[45px]" style={{ background: tool.accent }} />
                                        <div className="relative z-10">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border border-white/[0.06] bg-white/[0.03] group-hover:border-white/[0.12] group-hover:scale-105 transition-all duration-400" style={{ color: tool.accent }}>
                                                {tool.icon}
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{tool.name}</h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed">{tool.desc}</p>
                                        </div>
                                        {/* Corner accent lines */}
                                        <div className="absolute top-0 right-0 w-20 h-px opacity-0 group-hover:opacity-100 transition-all duration-700" style={{ background: `linear-gradient(to left, ${tool.accent}35, transparent)` }} />
                                        <div className="absolute top-0 right-0 w-px h-20 opacity-0 group-hover:opacity-100 transition-all duration-700" style={{ background: `linear-gradient(to bottom, ${tool.accent}35, transparent)` }} />
                                    </div>
                                </MagneticCard>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>


            {/* ═══ EXTRA CAPABILITIES ═══ */}
            <section id="capabilities" className="relative z-10 py-28 px-5">
                <Reveal className="text-center max-w-xl mx-auto mb-16">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-semibold mb-5" style={{ color: '#c49a6c' }}>Beyond Tools</p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Built for power users</h2>
                </Reveal>
                <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                        { name: 'Build Custom APK', desc: 'Generate a branded companion app with your configuration baked in — ready to install.', emoji: '📦' },
                        { name: 'Multi-Device Fleet', desc: 'Manage up to 10 devices simultaneously with real-time status from one dashboard.', emoji: '📱' },
                        { name: 'Bulk ZIP Export', desc: 'Select hundreds of files and download as a single compressed archive in-browser.', emoji: '⚡' },
                        { name: 'Flexible Plans', desc: 'Unlock more devices, premium tools, and unlimited access with Standard & Premium.', emoji: '👑' },
                    ].map((f, i) => (
                        <Reveal key={i} delay={i * 0.07}>
                            <div className="card-glow-border rounded-2xl p-6 border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03] transition-all duration-400 group flex items-start gap-5">
                                <div className="text-3xl flex-shrink-0 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-400">{f.emoji}</div>
                                <div>
                                    <h3 className="text-base font-bold text-white mb-1.5">{f.name}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>


            {/* ═══ ANIMATED STATS ═══ */}
            <section className="relative z-10 py-24 px-5 border-y border-white/[0.04]">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
                    {[
                        { target: 8, suffix: '', label: 'Remote Tools' },
                        { target: 10, suffix: '', label: 'Max Devices' },
                        { target: 18, prefix: '<', suffix: 'ms', label: 'Avg. Latency' },
                        { target: 256, suffix: '-bit', label: 'Encryption' },
                    ].map((s, i) => (
                        <Reveal key={i} delay={i * 0.08}>
                            <div>
                                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent tracking-tight">
                                    <Counter target={s.target} suffix={s.suffix} prefix={s.prefix || ''} />
                                </div>
                                <div className="text-[11px] text-zinc-500 mt-2.5 uppercase tracking-[0.2em] font-medium">{s.label}</div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>


            {/* ═══ LOGIN ═══ */}
            <section id="login-section" className="relative z-10 py-32 px-5 flex flex-col items-center">
                <Reveal className="text-center mb-14">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-semibold mb-5" style={{ color: '#c49a6c' }}>Ready?</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                        Start using Gallery Eye<br className="hidden sm:block" /><span className="text-zinc-500"> in seconds.</span>
                    </h2>
                </Reveal>

                <Reveal delay={0.15}>
                    <div className="w-full max-w-[420px]">
                        <div className="premium-card-border">
                            <div className="premium-card p-8 sm:p-10">
                                <div className="flex justify-center mb-8">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                                        <Image src="/gallery-eye-logo.jpg" alt="Gallery Eye" width={56} height={56} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <button onClick={() => signIn('google', { callbackUrl: '/' })} className="premium-btn-google">
                                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                    <span>Continue with Google</span>
                                </button>
                                <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-white/[0.06]"/><span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">or</span><div className="flex-1 h-px bg-white/[0.06]"/></div>
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div>
                                        <label htmlFor="email-input" className="block text-xs font-medium text-zinc-300 mb-1.5">Email</label>
                                        <input id="email-input" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@example.com" required autoComplete="email" className="premium-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="password-input" className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
                                        <input id="password-input" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="••••••••••••" required autoComplete="current-password" className="premium-input" />
                                    </div>
                                    {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400/90 flex items-center gap-1.5"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>{error}</motion.p>}
                                    <button type="submit" disabled={isLoading} className="premium-btn-primary mt-1">
                                        {isLoading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg><span>Signing in…</span></> : <span>Sign In</span>}
                                    </button>
                                </form>
                                <p className="text-center text-[11px] text-zinc-500/60 mt-7">Protected with end-to-end encryption</p>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>


            {/* ═══ FOOTER ═══ */}
            <footer className="relative z-10 py-14 px-5 border-t border-white/[0.04]">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-white/[0.06]"><Image src="/gallery-eye-logo.jpg" alt="GE" width={28} height={28} className="w-full h-full object-cover"/></div>
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
