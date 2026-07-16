'use client';

import { signIn } from 'next-auth/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

/* ═══════ HELPER & INTERACTIVE COMPONENTS ═══════ */

/* Mouse-following ambient glow */
function CursorGlow() {
    const [pos, setPos] = useState({ x: -500, y: -500 });
    useEffect(() => {
        const h = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', h, { passive: true });
        return () => window.removeEventListener('mousemove', h);
    }, []);
    return (
        <div className="fixed pointer-events-none z-0 hidden md:block" style={{
            left: pos.x - 300, top: pos.y - 300, width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,165,116,0.035) 0%, rgba(232,150,109,0.01) 50%, transparent 70%)',
            transition: 'left 0.12s ease-out, top 0.12s ease-out',
        }} />
    );
}


/* Sticky nav appearing on scroll (Bottom on mobile to prevent marquee overlap & top-12 on desktop) */
function StickyNav({ onScrollTo }: { onScrollTo: (id: string) => void }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const h = () => setShow(window.scrollY > window.innerHeight * 0.4);
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);
    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Mobile Bottom Floating Nav (Never covers top marquee or headers, right under thumb!) */}
                    <motion.nav
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] sticky-nav-glass rounded-full px-3 py-2 flex sm:hidden items-center gap-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.95)] border border-white/15 w-[90%] max-w-xs justify-between"
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/20 flex-shrink-0">
                                <Image src="/gallery-eye-logo.jpg" alt="GE" width={28} height={28} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs font-extrabold text-white">GE Portal</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => onScrollTo('tools')} className="px-2.5 py-1.5 rounded-full text-[11px] font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-all">
                                Tools
                            </button>
                            <button onClick={() => onScrollTo('demo-video')} className="px-2.5 py-1.5 rounded-full text-[11px] font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-all">
                                Demo
                            </button>
                            <button onClick={() => onScrollTo('login-section')} className="px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-[#d4a574] to-[#e8966d] text-[#1c1917] shadow-sm">
                                Enter
                            </button>
                        </div>
                    </motion.nav>

                    {/* Desktop Top Floating Nav (Sits at top-12 below fixed marquee strip) */}
                    <motion.nav
                        initial={{ y: -70, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -70, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] sticky-nav-glass rounded-full px-3 py-1.5 hidden sm:flex items-center gap-1 shadow-[0_10px_40px_rgba(0,0,0,0.9)] border border-white/15"
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10 mr-2">
                            <Image src="/gallery-eye-logo.jpg" alt="GE" width={32} height={32} className="w-full h-full object-cover" />
                        </div>
                        {['tools', 'capabilities', 'login-section'].map((id) => (
                            <button key={id} onClick={() => onScrollTo(id)} className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all capitalize">
                                {id === 'login-section' ? 'Sign In Portal' : id === 'tools' ? '8 Master Tools' : 'Capabilities'}
                            </button>
                        ))}
                        <button onClick={() => onScrollTo('login-section')} className="ml-2 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#d4a574] to-[#e8966d] text-[#1c1917] hover:scale-105 transition-transform shadow-[0_2px_10px_rgba(212,165,116,0.3)]">
                            Enter App
                        </button>
                    </motion.nav>
                </>
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
        const duration = 2200;
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
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >{children}</motion.div>
    );
}

/* 3D magnetic tilt card (Disabled on touch/mobile devices to eliminate GPU repaints and black screen flash on scroll) */
function MagneticCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({});
    const [isMouseDevice, setIsMouseDevice] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
            setIsMouseDevice(true);
        }
    }, []);

    const onMove = useCallback((e: React.MouseEvent) => {
        if (!isMouseDevice || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -4.5;
        const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 4.5;
        setStyle({ transform: `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.015,1.015,1.015)` });
    }, [isMouseDevice]);

    const onLeave = useCallback(() => {
        if (!isMouseDevice) return;
        setStyle({ transform: 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)' });
    }, [isMouseDevice]);

    return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={{ ...style, transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)' }}>{children}</div>;
}

/* ═══════ BESPOKE TOOL VISUAL PREVIEWS ═══════ */

/* 1. Realistic & Showstopping Gallery Sync Preview (Mobile & Desktop Perfect) */
function GalleryPreview() {
    const photos = [
        { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', name: 'Maldives_RAW.dng', meta: '48MP RAW • 12.4 MB • f/1.78', tag: 'Synced', badge: 'RAW DNG' },
        { url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80', name: 'Cyber_Night.heic', meta: '4K ProRes 60fps • 64.2 MB', tag: 'Live Stream', badge: 'PRORES 4K' },
        { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80', name: 'Portrait_004.jpg', meta: 'ISO 100 • 24mm • f/1.4 • 8.1 MB', tag: 'Synced', badge: 'PORTRAIT' },
        { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80', name: 'Valley_Dawn.raw', meta: '50MP HDR • GPS Tagged • 24.8 MB', tag: 'Synced', badge: '50MP HDR' },
    ];
    const [activeTab, setActiveTab] = useState('All Media (4,218)');
    return (
        <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-b from-[#181411] via-[#0f0c0a] to-black shadow-[0_20px_50px_rgba(0,0,0,0.8)] mt-4 sm:mt-6 p-3.5 sm:p-5">
            {/* Cloud Media Tunnel Header HUD */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-extrabold text-base shadow-[0_0_20px_rgba(245,158,11,0.5)] flex-shrink-0">
                        G
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                            <span>Cloud Media Tunnel</span>
                            <span className="text-[10px] font-mono text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 whitespace-nowrap">64.8 GB SYNCED</span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 mt-0.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                            <span className="truncate">E2E Stream Rate: 42.4 MB/s • Zero Lag</span>
                        </div>
                    </div>
                </div>
                <button className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-extrabold hover:bg-amber-500/25 transition-all flex items-center justify-center gap-1.5 shadow-sm flex-shrink-0">
                    <span>⚡ Auto-Sync Active</span>
                </button>
            </div>

            {/* Filter Pill Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-1 scrollbar-none -mx-1 px-1">
                {['All Media (4,218)', 'RAW Photos (842)', '4K Videos (124)', 'Hidden Vault 🔒'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* High-Resolution Masonry/Grid View (Single column on mobile so full photo shows without dark band overlap, 2 columns on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
                {photos.map((p, idx) => (
                    <div key={idx} className="group/photo relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 aspect-[16/10] sm:aspect-[16/11] shadow-lg transition-all duration-500 hover:border-amber-400/60 hover:shadow-[0_10px_30px_rgba(245,158,11,0.25)] flex flex-col justify-between">
                        <Image src={p.url} alt={p.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover group-hover/photo:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-85 group-hover/photo:opacity-95 transition-opacity" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                            <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-amber-400/30 text-[9px] font-extrabold font-mono text-amber-300 shadow-sm">
                                {p.badge}
                            </span>
                            <div className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 flex items-center gap-1 text-[9px] font-bold text-emerald-400 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {p.tag}
                            </div>
                        </div>

                        {/* Bottom Metadata & Hover Actions */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                            <div className="text-xs sm:text-sm font-extrabold text-white truncate drop-shadow-md group-hover/photo:text-amber-300 transition-colors">{p.name}</div>
                            <div className="text-[10px] sm:text-[11px] text-zinc-300/90 font-mono mt-0.5 truncate">{p.meta}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Status Ribbon */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-400 font-mono gap-1">
                <span>Storage: <strong className="text-amber-400">512 GB</strong> (12.6% Used by Telemetry)</span>
                <span className="text-emerald-400 font-bold">✔ 100% EXIF PRESERVED</span>
            </div>
        </div>
    );
}

/* 2. Remote Camera Viewfinder Preview (Clean Portrait Scanner & Compact Shutter Bar) */
function CameraPreview() {
    const [flash, setFlash] = useState('AUTO');
    const [isCapturing, setIsCapturing] = useState(false);
    const [toast, setToast] = useState('');

    const handleCapture = () => {
        setIsCapturing(true);
        setToast('📸 48MP High-Res RAW Snapshot Captured & Preserved in Cloud Vault');
        setTimeout(() => setIsCapturing(false), 450);
        setTimeout(() => setToast(''), 3500);
    };

    const girlImg = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80';

    return (
        <div className="w-full mt-4 sm:mt-6 rounded-3xl sm:rounded-[2rem] overflow-hidden border border-cyan-500/40 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative group bg-black">
            
            {/* The Wall-to-Wall Live Optical Feed (Girl Portrait with Continuous Scanner) */}
            <div className="w-full h-[360px] sm:h-[420px] md:h-[460px] relative bg-cover bg-center flex flex-col justify-between p-3 sm:p-5"
                 style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.85) 100%), url("${girlImg}")` }}>
                
                {/* Shutter White Flash Animation */}
                {isCapturing && <div className="absolute inset-0 bg-white z-50 animate-fade-out pointer-events-none" />}

                {/* Top Glassmorphic HUD Bar (Transparent over image) */}
                <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-[11px] font-mono shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-extrabold text-white tracking-wider">OPTICAL FEED</span>
                        <span className="text-cyan-400 font-bold hidden xs:inline">• ZERO LATENCY</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-zinc-300 shadow-lg">
                        <span className="text-emerald-400 font-bold">● 14 ms</span>
                        <span className="hidden sm:inline text-zinc-500">|</span>
                        <span className="hidden sm:inline text-zinc-300">ISO 100 • f/1.6</span>
                    </div>
                </div>

                {/* Continuously Roving Face Target Box (Pure GPU CSS Animation - Zero Scroll Lag or Text) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center pb-8">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 border-[1.5px] border-emerald-400/80 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-roving-target">
                        {/* Corner Brackets */}
                        <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-300 rounded-tl" />
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-300 rounded-tr" />
                        <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-300 rounded-bl" />
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-300 rounded-br" />

                        {/* Roving Laser Scan Line (Pure CSS) */}
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(16,185,129,1)] absolute animate-roving-laser" />
                    </div>
                </div>

                {/* Toast Notification Bar */}
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-emerald-500 text-black font-extrabold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-[0_0_30px_rgba(16,185,129,1)] border border-emerald-200 whitespace-nowrap">
                        {toast}
                    </motion.div>
                )}

                {/* Compact Shutter Bar (Smaller container so more of the girl's photo is cleanly visible) */}
                <div className="z-20 w-full flex items-center justify-between bg-black/75 backdrop-blur-xl px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl border border-white/15 shadow-2xl mt-auto">
                    
                    {/* Flash Selector */}
                    <button onClick={() => setFlash(flash === 'AUTO' ? 'ON' : flash === 'ON' ? 'OFF' : 'AUTO')}
                            className="flex flex-col items-center justify-center text-left min-w-[55px] group/btn">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Flash</span>
                        <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                            ⚡ {flash}
                        </span>
                    </button>

                    {/* Compact Center Shutter Ring */}
                    <div className="flex flex-col items-center gap-0.5">
                        <button onClick={handleCapture}
                                title="Capture Snapshot"
                                className="w-12 sm:w-14 h-12 sm:h-14 rounded-full border-[2.5px] border-white p-1 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.7)] hover:scale-105 active:scale-95 transition-all group/shutter">
                            <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-400 to-white group-hover/shutter:opacity-90 transition-opacity" />
                        </button>
                        <span className="text-[8px] font-mono text-zinc-400 tracking-wider uppercase">Tap Shutter</span>
                    </div>

                    {/* Mode LIVE Toggle */}
                    <button onClick={() => setToast('🟢 Live Optical Stream Active • Zero Latency Tunnel')}
                            className="flex flex-col items-center justify-center text-right min-w-[55px]">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Mode</span>
                        <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            LIVE
                        </span>
                    </button>
                </div>

            </div>
        </div>
    );
}

/* 3. Live Microphone Waveform Preview (Responsive) */
function AudioPreview() {
    const heights = [35, 65, 90, 45, 80, 100, 70, 40, 85, 60, 95, 50, 75, 88, 42, 68, 92, 55];
    return (
        <div className="w-full rounded-2xl sm:rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-black/80 to-black mt-4 sm:mt-6 p-4 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.8)]">
            <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-purple-500/20 gap-2">
                <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.9)] flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-extrabold text-purple-200 uppercase tracking-wider">Remote Acoustic Array</span>
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-purple-300 font-semibold bg-purple-500/15 px-2.5 py-1 rounded-lg border border-purple-500/30">
                    24-Bit • 96 kHz Studio Lossless
                </span>
            </div>
            {/* Waveform Bars */}
            <div className="flex items-center justify-between h-20 sm:h-24 gap-1 px-1 py-2">
                {heights.map((h, i) => (
                    <motion.div
                        key={i}
                        animate={{ height: [`${Math.max(15, h * 0.4)}%`, `${h}%`, `${Math.max(20, h * 0.6)}%`] }}
                        transition={{ duration: 1.2 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex-1 bg-gradient-to-t from-purple-600 via-purple-400 to-pink-300 rounded-full min-w-[3px]"
                    />
                ))}
            </div>
            <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-purple-500/15 text-[11px] sm:text-xs text-zinc-400 gap-2 font-mono">
                <span>Intercept Duration: <strong className="text-white">00:14:28</strong></span>
                <div className="flex items-center gap-3">
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">● Live PCM Stream</span>
                    <button className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold transition-all">
                        ⬇ WAV Export
                    </button>
                </div>
            </div>
        </div>
    );
}

/* 4. Live Alerts Feed Preview (Ultra-Premium iOS/Android Lock Screen Glass Banners & Official App Logos) */
function AlertsPreview() {
    const [filter, setFilter] = useState('All Feed');
    const [liveCount, setLiveCount] = useState(0);

    const initialAlerts = [
        {
            app: 'WhatsApp',
            title: '+1 (555) 902-1482 (VIP Vault)',
            desc: 'Hey! Did you download the encrypted vault archives yet? Needed before the board meeting begins.',
            time: 'Just now',
            badge: 'CHAT INTERCEPT',
            badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
            bgGradient: 'from-[#25D366] to-[#128C7E]',
            iconSvg: (
                <svg className="w-6 h-6 text-white fill-current drop-shadow" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.28.072.383-.043c.102-.116.438-.507.555-.68s.231-.145.39-.087c.159.058 1.011.477 1.184.564.173.087.289.129.332.202.043.073.043.423-.101.827z"/>
                </svg>
            )
        },
        {
            app: 'Instagram',
            title: '@elena_rostova shared a story',
            desc: 'Sent a private video story to your inbox • Tap to intercept before automatic expiration in 2h.',
            time: '2m ago',
            badge: 'PRIVATE STORY',
            badgeColor: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
            bgGradient: 'from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
            iconSvg: (
                <svg className="w-6 h-6 text-white fill-current drop-shadow" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
            )
        },
        {
            app: 'Snapchat',
            title: 'Alex (Team Lead)',
            desc: 'New Snap (Red Arrow - No Sound) • Intercepted instantly from background service without read receipt.',
            time: '5m ago',
            badge: 'SNAP REC',
            badgeColor: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
            bgGradient: 'from-[#FFFC00] to-[#E5E100]',
            iconSvg: (
                <svg className="w-6 h-6 text-black fill-current drop-shadow-sm" viewBox="0 0 24 24">
                    <path d="M12.006 2c-3.804 0-6.666 2.511-6.666 6.309 0 1.096.347 1.849.789 2.457.173.238.21.365.124.571-.115.274-.634 1.159-.884 1.543-.228.356-.511.456-.995.539-.621.109-1.124.392-1.269.963-.128.503.228.986.749 1.141.676.201 1.552.365 1.589.658.046.338-.639.858-1.187 1.251-.621.447-.648 1.004-.32 1.342.347.356 1.141.247 1.808-.073.438-.21.822-.301 1.169-.146.402.174.968.648 1.872.648 1.196 0 1.854-.603 3.221-.603s2.025.603 3.221.603c.904 0 1.47-.474 1.872-.648.347-.155.731-.064 1.169.146.667.32 1.461.429 1.808.073.328-.338.301-.895-.32-1.342-.548-.393-1.233-.913-1.187-1.251.037-.293.913-.457 1.589-.658.521-.155.877-.638.749-1.141-.145-.571-.648-.854-1.269-.963-.484-.083-.767-.183-.995-.539-.25-.384-.769-1.269-.884-1.543-.086-.206-.049-.333.124-.571.442-.608.789-1.361.789-2.457 0-3.798-2.862-6.309-6.666-6.309z"/>
                </svg>
            )
        },
        {
            app: 'Bank Security',
            title: '2FA Authentication Code',
            desc: 'Your one-time login authorization passkey is: [ 849 - 201 ]. Do not share this passkey with anyone.',
            time: '12m ago',
            badge: 'SECRET OTP 🔑',
            badgeColor: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
            bgGradient: 'from-[#3B82F6] to-[#1D4ED8]',
            iconSvg: (
                <svg className="w-6 h-6 text-white fill-current drop-shadow" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11c.6 0 1.2.6 1.2 1.3v3.5c0 .7-.6 1.2-1.2 1.2H9.2c-.6 0-1.2-.5-1.2-1.2v-3.5c0-.7.6-1.3 1.2-1.3V9.5C9.2 8.1 10.6 7 12 7zm-1.3 2.5v1.5h2.6V9.5c0-.7-.6-1.3-1.3-1.3s-1.3.6-1.3 1.3z"/>
                </svg>
            )
        },
        {
            app: 'Facebook Messenger',
            title: 'Marcus Vance (Security Ops)',
            desc: 'Attached sensitive archive: Q3_Financial_Audit_Report.pdf (24.8 MB) • Ready for immediate download.',
            time: '18m ago',
            badge: 'ATTACHMENT',
            badgeColor: 'text-blue-300 border-blue-500/30 bg-blue-500/10',
            bgGradient: 'from-[#00B2FF] to-[#006AFF]',
            iconSvg: (
                <svg className="w-6 h-6 text-white fill-current drop-shadow" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.452 5.508 3.733 7.202-.132 1.293-.728 3.197-.777 3.35-.06.185.067.375.257.345.242-.039 2.56-.445 4.394-1.636.786.216 1.618.336 2.393.336 5.523 0 10-4.145 10-9.258S17.523 2 12 2zm1.096 12.355l-2.58-2.753-5.037 2.753 5.539-5.882 2.658 2.753 4.958-2.753-5.538 5.882z"/>
                </svg>
            )
        }
    ];

    const [alertsList, setAlertsList] = useState(initialAlerts);

    const simulateLiveAlert = () => {
        const liveSims = [
            {
                app: 'WhatsApp',
                title: '+1 (555) 710-8841 (Vault Escrow)',
                desc: '⚡ IMMEDIATE INTERCEPT: Wire transfer authorization passkey #992-104 verified.',
                time: 'Just now',
                badge: 'LIVE INTERCEPT',
                badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/15',
                bgGradient: 'from-[#25D366] to-[#128C7E]',
                iconSvg: initialAlerts[0].iconSvg
            },
            {
                app: 'Bank Security',
                title: 'Chase 2FA Verification Alert',
                desc: '⚡ NEW OTP INTERCEPTED: Your wire transfer confirmation token is: [ 441 - 890 ].',
                time: 'Just now',
                badge: '2FA TOKEN 🔑',
                badgeColor: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/15',
                bgGradient: 'from-[#3B82F6] to-[#1D4ED8]',
                iconSvg: initialAlerts[3].iconSvg
            },
            {
                app: 'Instagram',
                title: '@elena_rostova sent direct message',
                desc: '⚡ DIRECT INTERCEPT: "Check the secure drop folder, I uploaded the new blueprints."',
                time: 'Just now',
                badge: 'DIRECT MSG',
                badgeColor: 'text-pink-400 border-pink-500/30 bg-pink-500/15',
                bgGradient: 'from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
                iconSvg: initialAlerts[1].iconSvg
            }
        ];
        const next = liveSims[liveCount % liveSims.length];
        setAlertsList([next, ...alertsList]);
        setLiveCount(liveCount + 1);
    };

    const filteredAlerts = filter === 'Social & Chat' 
        ? alertsList.filter(a => ['WhatsApp', 'Instagram', 'Snapchat', 'Facebook Messenger'].includes(a.app))
        : filter === '2FA / OTP 🔑'
        ? alertsList.filter(a => a.app === 'Bank Security')
        : alertsList;

    return (
        <div className="w-full mt-4 sm:mt-6 rounded-3xl sm:rounded-[2rem] border border-indigo-500/40 bg-gradient-to-b from-[#111326] via-[#0a0c16] to-black p-3.5 sm:p-6 shadow-[0_25px_65px_rgba(0,0,0,0.95)] flex flex-col gap-4">
            
            {/* Top Header & Simulation Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-indigo-500/20 gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-lg shadow-[0_0_20px_rgba(99,102,241,0.5)] flex-shrink-0">
                        🔔
                    </div>
                    <div>
                        <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                            Lock-Screen Push Mirror <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">● LIVE SOCKET</span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 mt-0.5">Mirrors phone status bar alerts instantly via WebRTC tunnel</div>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                    <button
                        onClick={simulateLiveAlert}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center gap-1.5 active:scale-95"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>⚡ Simulate Incoming Alert</span>
                    </button>
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-1">
                <div className="flex items-center gap-1.5">
                    {['All Feed', 'Social & Chat', '2FA / OTP 🔑'].map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === f ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'}`}>
                            {f}
                        </button>
                    ))}
                </div>
                <span className="text-[11px] font-mono text-zinc-400 hidden xs:inline">{filteredAlerts.length} Active Alerts</span>
            </div>

            {/* Notification Banners List (Authentic iOS / Android Frosted Glass Aesthetic) */}
            <div className="flex flex-col gap-3 max-h-[360px] sm:max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                <AnimatePresence initial={false}>
                    {filteredAlerts.map((a, i) => (
                        <motion.div
                            key={a.app + a.title + i}
                            initial={{ opacity: 0, y: -15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="p-3.5 sm:p-4 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl transition-all flex items-start gap-3.5 shadow-xl group/banner relative overflow-hidden"
                        >
                            {/* Subtle side accent bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-blue-600 opacity-80" />

                            {/* Official App Logo Badge (Authentic SVG Logo) */}
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border border-white/20 bg-gradient-to-br ${a.bgGradient} relative`}>
                                {a.iconSvg}
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#111326] flex items-center justify-center text-[8px] text-black font-extrabold shadow-sm" title="Intercepted & Verified">✓</span>
                            </div>

                            {/* Banner Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-2 min-w-0 truncate">
                                        <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide truncate">{a.app}</span>
                                        <span className="text-zinc-500">•</span>
                                        <span className="text-xs font-semibold text-zinc-300 truncate">{a.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                                        <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md border ${a.badgeColor}`}>
                                            {a.badge}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 font-mono">{a.time}</span>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-[13px] text-zinc-200/95 leading-relaxed mt-1.5 font-normal">{a.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* 5. Contacts Access Preview (VIP Matrix with VCF Export & Sync Status) */
function ContactsPreview() {
    const contacts = [
        { name: 'Alexander Wright', phone: '+1 (555) 234-8901', role: 'Executive Vice President', org: 'Wright Holdings LLC', status: 'Cloud Synced', initials: 'AW', color: '#10B981', backupTime: 'Today, 09:42 AM' },
        { name: 'Elena Rostova', phone: '+44 20 7946 0921', role: 'Lead Cyber Architect', org: 'Quantum Labs UK', status: 'Cloud Synced', initials: 'ER', color: '#F59E0B', backupTime: 'Today, 08:15 AM' },
        { name: 'Marcus Vance', phone: '+1 (555) 890-1234', role: 'Security Ops Commander', org: 'Vance Security Group', status: 'Cloud Synced', initials: 'MV', color: '#6366F1', backupTime: 'Yesterday' },
    ];
    return (
        <div className="w-full rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0f1d18] via-black to-black mt-4 sm:mt-6 p-3.5 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-col gap-3">
            {/* Contact Matrix Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-500/20 gap-2.5">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black font-extrabold text-base shadow-[0_0_15px_rgba(16,185,129,0.4)] flex-shrink-0">
                        👥
                    </div>
                    <div>
                        <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                            Executive Contact Matrix <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">1,482 SYNCED</span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 mt-0.5">Instant address book access • Zero compression</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-extrabold transition-all flex items-center gap-1.5 shadow-sm">
                        <span>📥 Export Full VCF Matrix</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-wrap items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-zinc-400 gap-2">
                <span className="flex items-center gap-2 truncate">🔍 Search name, organization, phone number...</span>
                <span className="text-emerald-400 font-semibold text-[11px] whitespace-nowrap">● Live Telemetry Active</span>
            </div>

            {/* Contact List */}
            <div className="flex flex-col gap-2.5">
                {contacts.map((c, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 rounded-xl border border-white/10 bg-black/60 hover:bg-white/[0.04] transition-all gap-3 shadow-md">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shadow-lg border border-white/15 flex-shrink-0" style={{ backgroundColor: c.color }}>
                                {c.initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm font-extrabold text-white truncate">{c.name}</span>
                                    <span className="text-[10px] text-zinc-400 font-medium truncate hidden md:inline">({c.org})</span>
                                </div>
                                <div className="text-[11px] text-zinc-300 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                                    <span className="text-emerald-400 font-bold">{c.phone}</span>
                                    <span className="text-zinc-500">•</span>
                                    <span className="text-zinc-400 truncate">{c.role}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/10">
                            <div className="text-[10px] text-zinc-400 font-mono text-right hidden lg:block">
                                <div>Backup: {c.backupTime}</div>
                            </div>
                            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-extrabold flex items-center gap-1">
                                ✓ {c.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* 6. Messages (SMS) Preview (Encrypted Thread Reader with Highlighted 2FA & Bank Alerts) */
function SMSPreview() {
    const [tab, setTab] = useState('All Threads (842)');
    const threads = [
        { sender: 'Bank Security 2FA', phone: 'SHORTCODE: 8492', text: 'Your one-time login authentication passcode is: [ 849 - 201 ]. Do not share or forward this code to unauthorized personnel.', time: '10:42 AM', unread: true, badge: 'SECRET OTP 🔑', accent: '#3B82F6' },
        { sender: '+1 (555) 019-2834', phone: 'Executive Line', text: 'Flight AA104 boarding gate modified to Terminal 4, Gate B22. Boarding protocol initiated in 45 minutes.', time: '09:15 AM', unread: false, badge: 'TRAVEL ALERT', accent: '#10B981' },
        { sender: 'David Miller (CEO)', phone: '+1 (555) 880-4921', text: 'Financial audit spreadsheets uploaded to the encrypted cloud vault. Review and sign off before 5:00 PM EST.', time: 'Yesterday', unread: false, badge: 'VIP DIRECT', accent: '#F59E0B' },
    ];
    return (
        <div className="w-full rounded-2xl sm:rounded-3xl border border-blue-500/30 bg-gradient-to-b from-[#101828] via-black to-black mt-4 sm:mt-6 p-3.5 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-col gap-3">
            {/* SMS Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-blue-500/20 gap-2.5">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-base shadow-[0_0_15px_rgba(59,130,246,0.4)] flex-shrink-0">
                        💬
                    </div>
                    <div>
                        <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                            Encrypted SMS Intercept <span className="text-[10px] font-mono text-blue-400 px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30">REAL-TIME INBOX</span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 mt-0.5">Instant OTP access • Full thread history synchronization</div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {['All Threads (842)', '2FA OTP Codes 🔑', 'Bank Alerts'].map((t) => (
                        <button key={t} onClick={() => setTab(t)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${tab === t ? 'bg-blue-500 text-white shadow-md' : 'bg-white/5 text-zinc-400 hover:text-white'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Threads List */}
            <div className="flex flex-col gap-2.5">
                {threads.map((t, i) => (
                    <div key={i} className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${t.unread ? 'bg-blue-500/[0.09] border-blue-500/40 shadow-lg' : 'bg-black/60 border-white/10 hover:bg-white/[0.04]'}`}>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                            <div className="flex items-center gap-2 min-w-0">
                                {t.unread && <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa] flex-shrink-0 animate-pulse" />}
                                <span className="text-xs sm:text-sm font-extrabold text-white truncate">{t.sender}</span>
                                <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">({t.phone})</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                                <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded bg-black/60 border border-white/15" style={{ color: t.accent }}>
                                    {t.badge}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">{t.time}</span>
                            </div>
                        </div>
                        <p className="text-[11px] sm:text-xs text-zinc-200 leading-relaxed font-mono bg-black/50 p-2.5 rounded-lg border border-white/5">
                            {t.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* 7. Flashlight Control Preview (High-Voltage LED Command HUD with Lumens Selector & Battery Graph) */
function TorchPreview() {
    const [isOn, setIsOn] = useState(true);
    const [lumens, setLumens] = useState('100% TURBO');
    const [mode, setMode] = useState('Constant Beam');
    return (
        <div className="w-full rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#241a0d] via-black to-black mt-4 sm:mt-6 p-4 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.85)] gap-4">
            {/* Glowing optical beam effect */}
            {isOn && (
                <div className="absolute inset-0 bg-radial-at-c from-amber-400/25 via-amber-500/10 to-transparent blur-2xl pointer-events-none transition-all duration-500" />
            )}

            {/* Tactical Status Ribbon */}
            <div className="w-full flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/20 z-10">
                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <span className={`w-2 h-2 rounded-full ${isOn ? 'bg-amber-400 animate-ping' : 'bg-zinc-600'}`} />
                    {isOn ? 'OPTICAL EMITTER ON' : 'EMITTER STANDBY'}
                </span>
                <span className="text-zinc-300">Load: 3.82V • Temp: 34°C</span>
                <span className="text-emerald-400 font-extrabold">WebRTC Link Active</span>
            </div>

            {/* Interactive Torch Actuator Button */}
            <button
                onClick={() => setIsOn(!isOn)}
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-500 border-2 shadow-2xl relative z-10 ${
                    isOn ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-200 border-yellow-100 text-black shadow-[0_0_50px_rgba(245,158,11,0.7)] scale-105' : 'bg-black/80 border-white/15 text-zinc-500 hover:border-white/30'
                }`}
            >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span className="text-[10px] font-extrabold tracking-wider">{isOn ? 'TURBO ON' : 'STANDBY'}</span>
            </button>

            {/* Intensity / Lumen Selector */}
            <div className="w-full flex flex-col gap-2 z-10">
                <div className="text-xs font-bold text-white flex items-center justify-center gap-2">
                    Output Intensity: <span className={isOn ? 'text-amber-400 font-extrabold' : 'text-zinc-500'}>{isOn ? `${lumens} (1,200 Lumens)` : '0 Lumens'}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {['25% Low', '50% Mid', '75% High', '100% TURBO'].map((l) => (
                        <button key={l} onClick={() => { setLumens(l); setIsOn(true); }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${lumens === l && isOn ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'bg-black/60 text-zinc-400 border border-white/10 hover:text-white'}`}>
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center justify-center gap-2 z-10 pt-2 border-t border-white/10 w-full text-xs">
                {['Constant Beam', 'SOS Strobe Pulse', 'Tactical Beacon'].map((m) => (
                    <button key={m} onClick={() => { setMode(m); setIsOn(true); }}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${mode === m && isOn ? 'bg-white/15 text-amber-300 border border-amber-400/40' : 'text-zinc-400 hover:text-white'}`}>
                        {m === mode && isOn ? '★ ' : ''}{m}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* 8. Vibrate Trigger Preview (Silent Haptic Wave & SOS Actuator HUD) */
function VibratePreview() {
    const [pattern, setPattern] = useState('Emergency SOS Pulse');
    const [isActive, setIsActive] = useState(true);
    return (
        <div className="w-full rounded-2xl sm:rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#221017] via-black to-black mt-4 sm:mt-6 p-4 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.85)] gap-4">
            {/* Tactical Haptic Status Ribbon */}
            <div className="w-full flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-rose-500/20 z-10">
                <span className="flex items-center gap-1.5 text-rose-300 font-bold">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-rose-500 animate-ping' : 'bg-zinc-600'}`} />
                    {isActive ? 'HAPTIC MOTOR ACTIVE' : 'MOTOR STANDBY'}
                </span>
                <span className="text-zinc-300">Actuator: 10,000 RPM</span>
                <span className="text-rose-400 font-extrabold">Instant Locate Wave</span>
            </div>

            {/* Pulsing haptic sonar rings */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center my-2">
                {isActive && (
                    <>
                        <motion.div animate={{ scale: [1, 1.9, 2.4], opacity: [0.7, 0.25, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                                    className="absolute inset-0 rounded-full border-2 border-rose-500/70 pointer-events-none" />
                        <motion.div animate={{ scale: [1, 1.5, 2.0], opacity: [0.8, 0.3, 0] }} transition={{ duration: 1.6, delay: 0.5, repeat: Infinity, ease: 'easeOut' }}
                                    className="absolute inset-0 rounded-full border border-rose-400/50 pointer-events-none" />
                    </>
                )}
                <button onClick={() => setIsActive(!isActive)}
                        className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl flex flex-col items-center justify-center text-white transition-all shadow-[0_0_35px_rgba(244,63,94,0.6)] border border-rose-300 z-10 ${
                            isActive ? 'bg-gradient-to-tr from-rose-600 to-pink-500 scale-105' : 'bg-black/80 border-white/15 text-zinc-500'
                        }`}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="mb-1"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M2 8v8M22 8v8"/></svg>
                    <span className="text-[9px] font-extrabold tracking-wider">{isActive ? 'PULSING' : 'PAUSED'}</span>
                </button>
            </div>

            {/* Pattern Switcher Controls */}
            <div className="w-full flex flex-col gap-2 z-10">
                <div className="text-xs font-bold text-white">
                    Actuator Waveform: <span className="text-rose-400 font-extrabold">{pattern}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {['Emergency SOS Pulse', 'Silent Locate Wave', 'Continuous Max RPM', 'Heartbeat Radar'].map((p) => (
                        <button key={p} onClick={() => { setPattern(p); setIsActive(true); }}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${pattern === p && isActive ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-black/60 text-zinc-400 border border-white/10 hover:text-white'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">Radiate immediate haptic vibrations to locate silenced or hidden hardware instantly</p>
        </div>
    );
}

/* ═══════ MAIN PAGE COMPONENT ═══════ */

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 140]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setIsLoading(true);
        const r = await signIn('credentials', { email, password, redirect: false });
        setIsLoading(false);
        if (r?.ok) router.push('/'); else setError('Incorrect email or password.');
    };
    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const toolsData = [
        { id: 'gallery', name: 'Gallery Sync Engine', desc: 'Access the device\'s entire media library remotely in real time. Browse, preview, and download full-resolution RAW photos and 4K videos one by one or package entire folders into encrypted ZIP archives instantly without compression.', accent: '#e8966d', badge: '★ FLAGSHIP STREAM', preview: <GalleryPreview /> },
        { id: 'camera', name: 'Remote Viewfinder', desc: 'Live optical command center. Stream zero-latency HD video from front and rear camera sensors, toggle LED flash modes, and capture stealth high-resolution snapshots or live clips on demand.', accent: '#6ecce8', badge: 'OPTICAL TUNNEL', preview: <CameraPreview /> },
        { id: 'audio', name: 'Microphone Array', desc: 'Lossless acoustic interception. Record and stream crystal-clear ambient room audio in real time across multiple frequency bands with studio-grade 24-bit 96 kHz PCM export.', accent: '#b88ae8', badge: '96 kHz PCM', preview: <AudioPreview /> },
        { id: 'notifications', name: 'Live Notification Intercept', desc: 'Intercept lock-screen push notifications right when they arrive. Read WhatsApp chats, Instagram stories, Snapchat alerts, and secret bank 2FA OTP codes instantly in real time.', accent: '#7a8ce8', badge: 'REAL-TIME FEED', preview: <AlertsPreview /> },
        { id: 'contacts', name: 'Contact Matrix', desc: 'Full address book synchronization. Instantly search across thousands of synced numbers, emails, and VIP executive profiles with one-click cloud backup and VCF matrix export.', accent: '#6ec4a8', badge: 'SYNC ACTIVE', preview: <ContactsPreview /> },
        { id: 'sms', name: 'Encrypted SMS Reader', desc: 'Complete message thread history. Intercept one-time bank authentication passcodes (2FA OTP), verification alerts, shortcode texts, and private SMS conversations in real time without delays.', accent: '#6ea8e8', badge: 'END-TO-END', preview: <SMSPreview /> },
        { id: 'torch', name: 'High-Output Flashlight', desc: 'Tactical optical actuation. Instantly fire the device LED flashlight at 100% turbo lumens, trigger emergency SOS strobe patterns, or signal silently over the high-speed WebRTC data channel.', accent: '#e8c46e', badge: 'INSTANT ACTUATION', preview: <TorchPreview /> },
        { id: 'vibration', name: 'Remote Haptic Actuator', desc: 'Silent locate & SOS haptic trigger. Actuate the internal vibration motor to send custom heartbeat pulses, continuous high-frequency waves, or emergency SOS signals to locate misplaced devices immediately.', accent: '#e86e8c', badge: 'HAPTIC COMMAND', preview: <VibratePreview /> },
    ];

    const marqueeItems = ['Gallery Sync Engine • 4K RAW Support', 'Live Optical Camera Viewfinder', '96kHz Lossless Microphone Stream', 'Real-Time Notification Intercepts', 'Instant SMS & 2FA Code Reader', 'Cloud Contact Matrix Synchronization', 'High-Output Flashlight Control', 'Remote Haptic Actuation', 'Multi-Device Fleet Command', 'Custom APK Builder Included'];

    return (
        <main className="min-h-screen bg-[#080807] text-[#fafaf9] overflow-x-hidden selection:bg-amber-200/20 pt-12">

            {/* Global effects */}
            <div className="grain-overlay" />
            <CursorGlow />
            <StickyNav onScrollTo={scrollTo} />

            {/* ═══ CYBER-LUXURY TOP HEADER & MARQUEE STRIP (MOVED FULL UPWARD TO NAVBAR LEVEL) ═══ */}
            <div className="fixed top-0 left-0 right-0 z-[90] bg-[#0a0907]/95 backdrop-blur-xl border-b border-white/[0.08] pt-[max(env(safe-area-inset-top,0.5rem),0.5rem)] pb-2 px-4 flex items-center justify-between shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
                <div className="hidden md:flex items-center gap-2 mr-6 flex-shrink-0 text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE TELEMETRY ACTIVE
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="animate-marquee flex gap-10 whitespace-nowrap">
                        {[...marqueeItems, ...marqueeItems].map((item, i) => (
                            <span key={i} className="flex items-center gap-3 text-xs font-mono tracking-wider text-zinc-300 font-medium">
                                <span className="text-[#d4a574] font-bold">❖</span>
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 ml-6 flex-shrink-0 text-[10px] font-mono text-zinc-400">
                    <span className="text-[#d4a574]">E2E 256-BIT</span>
                </div>
            </div>

            {/* ── Fixed Ambient Background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute animate-orb-float" style={{ top: '-15%', right: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,140,100,0.065) 0%, transparent 60%)' }} />
                <div className="absolute animate-orb-float-alt" style={{ bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,140,220,0.045) 0%, transparent 60%)' }} />
                <div className="absolute" style={{ top: '40%', left: '30%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(110,170,232,0.035) 0%, transparent 55%)' }} />
            </div>


            {/* ═══ HERO ═══ */}
            <section ref={heroRef} className="relative z-10 min-h-[90dvh] flex flex-col items-center justify-start pt-24 sm:pt-32 pb-24 px-5 overflow-hidden">
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center text-center max-w-4xl mx-auto">

                    {/* Rotating gradient border logo */}
                    <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative mb-6 sm:mb-8">
                        <div className="relative w-[116px] h-[116px]">
                            <div className="absolute inset-0 rounded-[2.2rem] animate-spin-slow" style={{ background: 'conic-gradient(from 0deg, #d4a574, #e8966d, #b88ae8, #6ea8e8, #6ec4a8, #e8c46e, #d4a574)' }} />
                            <div className="absolute inset-0 rounded-[2.2rem] animate-spin-slow blur-xl opacity-50" style={{ background: 'conic-gradient(from 0deg, #d4a574, #e8966d, #b88ae8, #6ea8e8, #6ec4a8, #e8c46e, #d4a574)' }} />
                            <div className="absolute inset-[3px] rounded-[calc(2.2rem-3px)] overflow-hidden bg-[#080807] flex items-center justify-center">
                                <Image src="/gallery-eye-logo.jpg" alt="Gallery Eye" width={110} height={110} className="w-full h-full object-cover" priority />
                            </div>
                        </div>
                    </motion.div>

                    {/* Powerful & Easy-to-Understand Headline */}
                    <motion.h1 initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="text-[clamp(2.6rem,7vw,5.8rem)] font-extrabold tracking-[-0.04em] leading-[1.04]">
                        Full Mobile Access.
                        <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-[#d4a574] via-[#e8966d] to-[#b88ae8] bg-clip-text text-transparent animate-gradient-text">
                            Right From Your Browser.
                        </span>
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} className="text-base sm:text-lg md:text-xl text-zinc-300 mt-6 max-w-2xl leading-relaxed font-normal">
                        Access and control entire Android phones remotely. Instantly view stored photos, stream live camera, read private SMS threads, record microphone, and track notifications — all inside one powerful, private web console.
                    </motion.p>

                    {/* Massive, Highlighted & Unique Luxury Buttons (Relative z-20 above background) */}
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10 sm:mt-12 mb-12 relative z-20 w-full sm:w-auto">
                        <button
                            onClick={() => scrollTo('login-section')}
                            className="group relative z-20 w-full sm:w-auto px-10 py-5 rounded-2xl font-extrabold text-base sm:text-lg text-[#1c1917] overflow-hidden active:scale-[0.96] transition-all duration-300 shadow-[0_12px_45px_rgba(212,165,116,0.45)] border-2 border-[#fff2e0] hover:shadow-[0_15px_60px_rgba(212,165,116,0.65)] hover:-translate-y-1"
                            style={{ background: 'linear-gradient(135deg, #fff5eb 0%, #ecd6bc 50%, #d4a574 100%)' }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                                Launch Executive Console
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-2 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                        <button
                            onClick={() => scrollTo('demo-video')}
                            className="group relative z-20 w-full sm:w-auto px-9 py-5 rounded-2xl font-bold text-base sm:text-lg text-white border-2 border-white/20 bg-white/[0.05] backdrop-blur-xl hover:bg-white/[0.12] hover:border-amber-400/60 hover:shadow-[0_0_35px_rgba(212,165,116,0.25)] hover:-translate-y-1 transition-all duration-300 active:scale-[0.96] flex items-center justify-center gap-2.5"
                        >
                            <span className="text-amber-400 font-extrabold">⚡</span>
                            <span>See Live Video Demo</span>
                        </button>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator (Moved down to bottom-3 z-30 with pointer-events-none so never collides with buttons) */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-none">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-semibold">Scroll to witness</span>
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-5 h-9 rounded-full border border-white/[0.1] flex items-start justify-center pt-2 bg-black/40 backdrop-blur-sm">
                        <div className="w-1 h-2 rounded-full bg-[#c49a6c]/80" />
                    </motion.div>
                </motion.div>
            </section>



            {/* ═══ SHOWSTOPPING LIVE DEMO VIDEO FRAME (BROUGHT CLOSER TO HERO & TOOLS) ═══ */}
            <section id="demo-video" className="relative z-10 pt-12 pb-12 px-5 border-b border-white/[0.04]">
                <Reveal className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-6 border border-[#d4a574]/40 bg-[#d4a574]/10 text-[#d4a574] shadow-md">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        LIVE ACTION STREAM • SYSTEM DEMO
                    </div>
                    <h2 className="text-3xl sm:text-5xl md:text-[3.6rem] font-extrabold tracking-tight text-white mb-6 leading-[1.08]">
                        Witness Total Device Mastery in Action
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-14 font-light leading-relaxed">
                        Watch real-time media synchronization, optical camera viewfinder streaming, and instant telemetry interception directly from our encrypted web portal.
                    </p>

                    {/* Beautiful Luxury Video Frame Container */}
                    <div className="relative mx-auto rounded-[2.5rem] p-3 sm:p-4 bg-gradient-to-b from-white/15 via-white/5 to-white/10 border border-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_80px_rgba(212,165,116,0.15)] overflow-hidden">
                        {/* Glowing ambient ring behind frame */}
                        <div className="absolute inset-0 bg-radial-at-c from-[#d4a574]/20 via-transparent to-transparent blur-3xl pointer-events-none" />
                        
                        {/* Player HUD bar */}
                        <div className="flex items-center justify-between px-6 py-3 bg-[#12110f]/95 backdrop-blur-xl rounded-t-2xl border-b border-white/10 text-xs font-mono text-zinc-300">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                                <span className="ml-3 text-zinc-300 font-bold tracking-wide hidden sm:inline">DEMO_TUNNEL_STREAM_v2.6.mp4</span>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-emerald-400 font-bold tracking-wider">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 1080P • 60 FPS • WEBRTC</span>
                            </div>
                        </div>

                        {/* Video iframe Aspect Ratio Container */}
                        <div className="relative aspect-video w-full rounded-b-2xl overflow-hidden bg-black shadow-inner border-t border-white/5">
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/0xQaikNVyn0?rel=0&modestbranding=1"
                                title="Gallery Eye System Demo"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full object-cover"
                            ></iframe>
                        </div>
                    </div>
                </Reveal>
            </section>


            {/* ═══ ALL 8 BESPOKE SHOWSTOPPING TOOLS (BROUGHT CLOSER TO DEMO VIDEO) ═══ */}
            <section id="tools" className="relative z-10 pt-12 pb-32 px-3 sm:px-5">


                <div className="max-w-6xl mx-auto flex flex-col gap-8 sm:gap-12">
                    {toolsData.map((tool, idx) => (
                        <Reveal key={tool.id} delay={idx * 0.05}>
                            <MagneticCard>
                                <div className={`rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 border transition-all duration-500 group relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] ${
                                    tool.id === 'gallery'
                                        ? 'border-amber-400/60 bg-gradient-to-br from-amber-500/[0.08] via-white/[0.025] to-amber-500/[0.04] shadow-[0_0_60px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/40'
                                        : 'card-glow-border border-white/[0.06] bg-white/[0.018] hover:bg-white/[0.035]'
                                }`}>
                                    {/* Ambient glow */}
                                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 group-hover:opacity-25 transition-opacity duration-700 blur-[90px] pointer-events-none" style={{ background: tool.accent }} />


                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
                                        <div className="lg:col-span-5 flex flex-col justify-center">
                                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest mb-6 w-fit border shadow-sm"
                                                 style={{ color: tool.accent, borderColor: `${tool.accent}40`, background: `${tool.accent}12` }}>
                                                ● {tool.badge}
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight leading-snug">{tool.name}</h3>
                                            <p className="text-sm sm:text-base text-zinc-300/90 leading-relaxed font-light">{tool.desc}</p>
                                        </div>
                                        <div className="lg:col-span-7">
                                            {tool.preview}
                                        </div>
                                    </div>
                                </div>
                            </MagneticCard>
                        </Reveal>
                    ))}
                </div>
            </section>


            {/* ═══ EXTRA CAPABILITIES ═══ */}
            <section id="capabilities" className="relative z-10 py-32 px-5 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent border-y border-white/[0.04]">
                <Reveal className="text-center max-w-xl mx-auto mb-20">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-bold mb-4" style={{ color: '#d4a574' }}>BEYOND THE 8 TOOLS</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">Engineered for total dominance</h2>
                </Reveal>
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                        { name: 'Build Custom Branded APK', desc: 'Generate a standalone, zero-config Android client baked with your server credentials right from the dashboard.', emoji: '📦' },
                        { name: '10-Device Fleet Command', desc: 'Monitor, command, and switch between up to 10 connected devices seamlessly with live battery and online indicators.', emoji: '📱' },
                        { name: 'Multi-Threaded Bulk ZIP', desc: 'Select entire directories or thousands of RAW captures and stream them directly into a compressed ZIP file at 45 MB/sec.', emoji: '⚡' },
                        { name: 'Zero-Cloud Storage Footprint', desc: 'Your media never touches third-party storage buckets. Direct WebRTC and WebSocket tunnel straight from device to browser.', emoji: '🛡️' },
                    ].map((f, i) => (
                        <Reveal key={i} delay={i * 0.08}>
                            <div className="card-glow-border rounded-3xl p-8 border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.045] transition-all duration-400 group flex items-start gap-6 h-full shadow-lg">
                                <div className="text-4xl flex-shrink-0 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-400 p-3 rounded-2xl bg-white/[0.04] border border-white/10">{f.emoji}</div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">{f.name}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed font-light">{f.desc}</p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>


            {/* ═══ GRAND, ULTRA-SPACIOUS (`KULA`) LOGIN PORTAL ═══ */}
            <section id="login-section" className="relative z-10 py-36 px-5 flex flex-col items-center">
                <Reveal className="text-center max-w-3xl mx-auto mb-16">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-extrabold mb-4" style={{ color: '#d4a574' }}>THE CENTERPIECE PORTAL</p>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                        Your Gateway to <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-[#d4a574] via-[#e8966d] to-[#b88ae8] bg-clip-text text-transparent">Total Device Command.</span>
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg mt-5 font-light">
                        Spacious, secure, and instant. Choose your preferred authentication method to enter your executive console.
                    </p>
                </Reveal>

                <Reveal delay={0.15} className="w-full max-w-5xl mx-auto">
                    <div className="premium-card-border shadow-[0_30px_100px_rgba(0,0,0,0.9)]">
                        <div className="premium-card p-8 sm:p-14 md:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-gradient-to-br from-black/80 via-[#12110f]/90 to-black/90">

                            {/* Left Side: Grand Architectural Invitation & Security Trust */}
                            <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-8 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-10 lg:pb-0">
                                <div>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.7)] flex-shrink-0">
                                            <Image src="/gallery-eye-logo.jpg" alt="Gallery Eye" width={64} height={64} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-white tracking-tight">Gallery Eye OS</h3>
                                            <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1.5 mt-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> v2.6 Enterprise System Active
                                            </span>
                                        </div>
                                    </div>
                                    <h4 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug">
                                        Why top creators and administrators choose Gallery Eye:
                                    </h4>
                                    <ul className="space-y-4 text-sm text-zinc-300 font-light">
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-[#d4a574]/20 border border-[#d4a574]/40 flex items-center justify-center text-[#d4a574] flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
                                            <span><strong>Zero-Lag Telemetry:</strong> Instant high-speed WebRTC tunnels for uncompressed photo & video transfers.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-[#d4a574]/20 border border-[#d4a574]/40 flex items-center justify-center text-[#d4a574] flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
                                            <span><strong>10-Device Sync:</strong> Control up to 10 smartphones, cameras, and remote endpoints under a unified master dashboard.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full bg-[#d4a574]/20 border border-[#d4a574]/40 flex items-center justify-center text-[#d4a574] flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
                                            <span><strong>Encrypted Vault:</strong> End-to-end 256-bit encryption ensuring zero unauthorized data leaks or server logs.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-zinc-400 font-mono">
                                    <span className="flex items-center gap-2">🔒 E2E SSL & WEBRTC SECURE</span>
                                    <span className="text-amber-400 font-bold">100% PRIVATE</span>
                                </div>
                            </div>

                            {/* Right Side: Spacious & Grand Form Area */}
                            <div className="lg:col-span-6 flex flex-col justify-center pl-0 lg:pl-6">
                                <div className="mb-8">
                                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Sign in to Console</h3>
                                    <p className="text-sm text-zinc-400">Enter your authorized credentials below or authenticate via Google OAuth.</p>
                                </div>

                                <button onClick={() => signIn('google', { callbackUrl: '/' })} className="premium-btn-google py-4 text-base font-bold shadow-lg">
                                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                    <span>Continue with Google</span>
                                </button>

                                <div className="flex items-center gap-4 my-7">
                                    <div className="flex-1 h-px bg-white/[0.08]" />
                                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">or use credentials</span>
                                    <div className="flex-1 h-px bg-white/[0.08]" />
                                </div>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    <div>
                                        <label htmlFor="email-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Email Address</label>
                                        <input id="email-input" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="executive@domain.com" required autoComplete="email" className="premium-input py-3.5 text-base" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="password-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">Password</label>
                                            <span className="text-xs text-[#d4a574] hover:underline cursor-pointer font-medium">Forgot?</span>
                                        </div>
                                        <input id="password-input" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="••••••••••••••••" required autoComplete="current-password" className="premium-input py-3.5 text-base" />
                                    </div>

                                    {error && (
                                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400/90 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 font-medium">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                                            {error}
                                        </motion.p>
                                    )}

                                    <button type="submit" disabled={isLoading} className="premium-btn-primary py-4 mt-2 text-base font-extrabold shadow-xl">
                                        {isLoading ? (
                                            <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg><span>Authenticating Session…</span></>
                                        ) : <span>Sign In to Executive Console</span>}
                                    </button>
                                </form>

                                <p className="text-center text-xs text-zinc-500 mt-8 font-light">
                                    By entering, you confirm you are authorized to manage connected endpoints.
                                </p>
                            </div>

                        </div>
                    </div>
                </Reveal>
            </section>


            {/* ═══ FOOTER ═══ */}
            <footer className="relative z-10 py-16 px-5 border-t border-white/[0.06] bg-black/60">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/[0.1]"><Image src="/gallery-eye-logo.jpg" alt="GE" width={32} height={32} className="w-full h-full object-cover"/></div>
                        <span className="text-sm text-white font-extrabold tracking-tight">Gallery Eye OS</span>
                        <span className="text-xs text-zinc-500 font-mono">© 2026 Enterprise Release</span>
                    </div>
                    <div className="flex items-center gap-8 text-xs text-zinc-400 font-medium">
                        <a href="#" className="hover:text-white transition-colors">Privacy Shield</a>
                        <a href="#" className="hover:text-white transition-colors">Security Architecture</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors flex items-center gap-1.5 text-emerald-400 font-mono">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> System All Green
                        </a>
                    </div>
                </div>
            </footer>

        </main>
    );
}
