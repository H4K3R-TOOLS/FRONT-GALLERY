'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VideoModal from '@/components/VideoModal';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Interactive Simulator State
    const [activeTab, setActiveTab] = useState<'gallery' | 'camera' | 'sms'>('gallery');
    const [simulatedZipProgress, setSimulatedZipProgress] = useState<number | null>(null);
    const [selectedMockPhotos, setSelectedMockPhotos] = useState<number[]>([1, 2, 4]);

    useEffect(() => {
        setMounted(true);
    }, []);

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
            setError('Incorrect email or password. Please verify your credentials.');
        }
    };

    const triggerMockZip = () => {
        if (simulatedZipProgress !== null) return;
        setSimulatedZipProgress(0);
        const interval = setInterval(() => {
            setSimulatedZipProgress((prev) => {
                if (prev === null) return null;
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setSimulatedZipProgress(null), 2500);
                    return 100;
                }
                return prev + 20;
            });
        }, 400);
    };

    const scrollToPortal = () => {
        const el = document.getElementById('login-portal');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            const input = document.getElementById('email-input');
            if (input) setTimeout(() => input.focus(), 600);
        }
    };

    const mockGalleryItems = [
        { id: 1, title: 'IMG_20260715_1422.JPG', size: '4.2 MB', date: 'Just now', gradient: 'from-blue-600/30 to-indigo-600/30' },
        { id: 2, title: 'VID_20260714_0911.MP4', size: '128.5 MB', date: '2 hours ago', gradient: 'from-purple-600/30 to-pink-600/30' },
        { id: 3, title: 'DOC_SCAN_PASSPORT.PDF', size: '1.8 MB', date: 'Yesterday', gradient: 'from-emerald-600/30 to-teal-600/30' },
        { id: 4, title: 'SCREENSHOT_2026_RAW.PNG', size: '6.4 MB', date: '3 days ago', gradient: 'from-cyan-600/30 to-blue-600/30' },
        { id: 5, title: 'BACKUP_SYS_LOGS.ZIP', size: '42.1 MB', date: 'July 10', gradient: 'from-amber-600/30 to-orange-600/30' },
        { id: 6, title: 'AUDIO_REC_MEETING.M4A', size: '14.9 MB', date: 'July 8', gradient: 'from-indigo-600/30 to-blue-600/30' }
    ];

    return (
        <main className="min-h-[100dvh] bg-[#050505] text-[#f1f5f9] relative selection:bg-blue-500 selection:text-white overflow-x-hidden font-sans">
            
            {/* Ambient Background Glow (Sleek Obsidian & Sapphire, No Green/Red Hacking Slop) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-cyan-600/08 via-blue-600/05 to-transparent blur-[120px]" />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-blue-500/[0.03] to-indigo-500/[0.03] blur-[100px]" />
                {/* Subtle structural grid */}
                <div 
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
                        backgroundSize: '56px 56px'
                    }}
                />
            </div>

            {/* Floating Island Navigation Pill */}
            <header className="sticky top-6 z-50 px-4 md:px-8 max-w-[1240px] mx-auto w-full">
                <nav className="glass-island rounded-full px-5 py-3 flex items-center justify-between border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                    {/* Brand Header */}
                    <a href="#" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/15 shadow-[0_0_20px_rgba(59,130,246,0.2)] flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/gallery-eye-logo.jpg"
                                alt="Gallery Eye OS"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm md:text-base tracking-tight text-white">
                                    Gallery Eye
                                </span>
                                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    v2.6 OS
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                                Remote Device Command
                            </span>
                        </div>
                    </a>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
                        <a href="#simulator" className="hover:text-blue-400 transition-colors">Live Simulator</a>
                        <a href="#features" className="hover:text-blue-400 transition-colors">Architecture</a>
                        <a href="#security" className="hover:text-blue-400 transition-colors">Zero-Knowledge</a>
                    </div>

                    {/* Action Pill */}
                    <button
                        onClick={scrollToPortal}
                        className="rounded-full px-4 py-2 text-xs font-bold bg-blue-600/15 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center gap-1.5 active:scale-95"
                    >
                        <span>Sign In Console</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </nav>
            </header>

            {/* Hero Section & Double-Bezel Login Portal */}
            <section className="relative z-10 pt-16 md:pt-24 pb-20 px-4 md:px-8 max-w-[1240px] mx-auto min-h-[calc(100dvh-5rem)] flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Hero Content (7 Cols) */}
                    <div className={`lg:col-span-7 flex flex-col items-start text-left ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
                        {/* Status Eyebrow */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[11px] font-mono uppercase tracking-widest font-semibold mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-sapphire-pulse" />
                            MILITARY-GRADE ZERO-KNOWLEDGE ARCHITECTURE
                        </div>

                        {/* Display Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.8rem] font-extrabold tracking-tighter leading-[1.05] text-white mb-6">
                            Your Android Device. <br />
                            <span className="sapphire-gradient-text">Instant Command.</span> <br />
                            From Anywhere.
                        </h1>

                        {/* Subtext */}
                        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-[54ch] mb-8 font-normal">
                            Connect securely from any browser. Sync media archives, inspect telemetry, and trigger silent commands with complete cryptographic privacy.
                        </p>

                        {/* Hero CTAs */}
                        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                            <a
                                href="#simulator"
                                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all duration-300 flex items-center gap-2 hover:translate-x-1 active:scale-98"
                            >
                                <span>Explore Live Simulator</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                            <div className="inline-block">
                                <VideoModal videoId="0xQaikNVyn0" />
                            </div>
                        </div>

                        {/* Trust Micro-Strip Below Hero */}
                        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Android 10 – 15 Compatible</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>AES-256 Storage</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Socket.IO Realtime Tunnel</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Hero Column: Double-Bezel (Doppelrand) Login Portal (5 Cols) */}
                    <div id="login-portal" className={`lg:col-span-5 w-full max-w-md mx-auto ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '150ms' }}>
                        <div className="doppelrand-outer">
                            <div className="doppelrand-inner p-6 sm:p-8">
                                <div className="text-left mb-6">
                                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-1">
                                        Console Authentication
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        Authenticate via secure token or primary credentials
                                    </p>
                                </div>

                                {/* Google Sign-In */}
                                <button
                                    onClick={() => signIn('google', { callbackUrl: '/' })}
                                    className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-white/10 rounded-xl py-3 px-4 text-sm font-semibold text-white transition-all duration-200 mb-5 shadow-sm"
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
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex-1 h-px bg-white/10" />
                                    <span className="text-[11px] font-mono text-slate-500 uppercase">Or credentials</span>
                                    <div className="flex-1 h-px bg-white/10" />
                                </div>

                                {/* Credentials Form */}
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div>
                                        <label htmlFor="email-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            id="email-input"
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                            placeholder="name@company.com"
                                            required
                                            autoComplete="email"
                                            className="login-input-sapphire"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                            placeholder="••••••••••••"
                                            required
                                            autoComplete="current-password"
                                            className="login-input-sapphire"
                                        />
                                    </div>

                                    {/* Error Display */}
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300 animate-fade-in">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-red-400">
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M12 8v4M12 16h.01" />
                                            </svg>
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn-sapphire-primary mt-1"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                <span>Establishing Session...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Authenticate Console</span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Security Footer Strip inside Card */}
                                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>256-Bit E2E Security</span>
                                    </div>
                                    <span>Zero Log Footprint</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Section: Technical Brand Strip */}
            <section className="py-12 border-y border-white/10 bg-[#08090c]/80 backdrop-blur-md relative z-10">
                <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">
                        CORE SYSTEM CAPABILITIES & PROTOCOLS
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-bold text-slate-300">
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                            ⚡ 18ms WebRTC Latency
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                            📦 High-Speed ZIP Packing
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                            🛡️ Silent Background Process
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                            🌐 Multi-Device Command
                        </span>
                    </div>
                </div>
            </section>

            {/* Section: Interactive 3D Spatial Device Simulator (`Show, Don't Tell`) */}
            <section id="simulator" className="py-24 px-4 md:px-8 max-w-[1240px] mx-auto relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono uppercase tracking-widest mb-3 border border-blue-500/20">
                        LIVE SIMULATOR
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
                        Test Drive the Command Console
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300">
                        Experience real-time responsiveness before signing in. Switch tabs to preview simulated remote interactions.
                    </p>

                    {/* Interactive Tab Switcher */}
                    <div className="mt-8 inline-flex p-1.5 rounded-full bg-white/[0.03] border border-white/10 shadow-lg">
                        <button
                            onClick={() => setActiveTab('gallery')}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                                activeTab === 'gallery'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <span>⚡ Gallery & Bulk ZIP</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('camera')}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                                activeTab === 'camera'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <span>📷 Remote Camera</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('sms')}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                                activeTab === 'sms'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <span>💬 Encrypted SMS</span>
                        </button>
                    </div>
                </div>

                {/* Simulated Device Enclosure */}
                <div className="doppelrand-outer max-w-4xl mx-auto">
                    <div className="doppelrand-inner min-h-[440px] p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-b from-[#14161a] to-[#0c0d10]">
                        
                        {/* Simulated Console Header */}
                        <div className="flex items-center justify-between pb-5 border-b border-white/10 text-xs text-slate-400">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    DEVICE_CONNECTED: SM-S928B
                                </span>
                                <span className="hidden sm:inline font-mono text-slate-500">IP: 192.168.1.104 (TUNNEL_ACTIVE)</span>
                            </div>
                            <div className="flex items-center gap-3 font-mono">
                                <span>🔋 89%</span>
                                <span>📶 5G_ULTRA</span>
                            </div>
                        </div>

                        {/* Animated Tab States */}
                        <div className="py-6 flex-1 flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {activeTab === 'gallery' && (
                                    <motion.div
                                        key="gallery"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.25 }}
                                        className="w-full"
                                    >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                            <div>
                                                <h3 className="text-base font-bold text-white">Remote Media Archives (6 Items Cached)</h3>
                                                <p className="text-xs text-slate-400">Select files to generate an instant encrypted ZIP stream</p>
                                            </div>
                                            <button
                                                onClick={triggerMockZip}
                                                disabled={simulatedZipProgress !== null}
                                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-80 text-white text-xs font-semibold shadow-md transition flex items-center gap-2"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span>{simulatedZipProgress !== null ? `Packing ZIP (${simulatedZipProgress}%)...` : 'Generate Bulk ZIP (3 Items)'}</span>
                                            </button>
                                        </div>

                                        {/* Simulated Zip Progress Bar */}
                                        {simulatedZipProgress !== null && (
                                            <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                                                <div className="flex justify-between text-xs font-mono text-blue-300 mb-2">
                                                    <span>Streaming media blocks to archive...</span>
                                                    <span>{simulatedZipProgress === 100 ? 'READY FOR EXPORT' : `${simulatedZipProgress}%`}</span>
                                                </div>
                                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${simulatedZipProgress}%` }} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Grid of Mock Media */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {mockGalleryItems.map((item) => {
                                                const isSelected = selectedMockPhotos.includes(item.id);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => {
                                                            setSelectedMockPhotos(prev =>
                                                                prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]
                                                            );
                                                        }}
                                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                                                            isSelected
                                                                ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                                                : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                                                        }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 text-white font-mono text-[10px]`}>
                                                            {item.title.split('.')[1]}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                                                            <div className="text-[10px] text-slate-400 flex justify-between">
                                                                <span>{item.size}</span>
                                                                <span>{item.date}</span>
                                                            </div>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                                                            isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'border-white/20 text-transparent'
                                                        }`}>
                                                            ✓
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'camera' && (
                                    <motion.div
                                        key="camera"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.25 }}
                                        className="w-full"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                            <div className="md:col-span-7 aspect-video rounded-xl bg-black/80 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center">
                                                <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-red-400 border border-red-500/30">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    LIVE_STREAM (1080p60)
                                                </div>
                                                <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400">
                                                    Bitrate: 4.8 Mbps
                                                </div>
                                                {/* Simulated Lens Visual */}
                                                <div className="w-20 h-20 rounded-full border border-blue-500/30 flex items-center justify-center bg-blue-500/5">
                                                    <div className="w-12 h-12 rounded-full border border-blue-400/50 flex items-center justify-center animate-sapphire-pulse">
                                                        <div className="w-4 h-4 rounded-full bg-blue-500/80" />
                                                    </div>
                                                </div>
                                                <span className="mt-3 text-xs font-mono text-slate-400">Rear Primary Telephoto Active</span>
                                            </div>

                                            <div className="md:col-span-5 flex flex-col gap-3">
                                                <h4 className="text-sm font-bold text-white">Silent Camera Commands</h4>
                                                <p className="text-xs text-slate-400">Trigger snapshots or toggle audio streams without lighting up the target screen.</p>
                                                
                                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                                                    <span className="text-xs font-medium text-slate-200">Ghost Mode Screen-Off</span>
                                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">ACTIVE</span>
                                                </div>
                                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                                                    <span className="text-xs font-medium text-slate-200">High-Gain Mic Monitoring</span>
                                                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold">READY</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'sms' && (
                                    <motion.div
                                        key="sms"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.25 }}
                                        className="w-full flex flex-col gap-3"
                                    >
                                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                            <span className="text-xs font-bold text-white">Encrypted SMS Thread Archive (Real-Time Mirror)</span>
                                            <span className="text-[11px] font-mono text-slate-400">Thread #8942 · 3 Unread</span>
                                        </div>
                                        
                                        <div className="space-y-3 font-sans text-xs max-h-[220px] overflow-y-auto pr-2">
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="p-3 rounded-2xl rounded-tl-none bg-white/[0.04] border border-white/10 text-slate-200 max-w-[80%]">
                                                    Security alert: Your authentication code for bank transfer is 849-210. Do not share.
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500">+1 (555) 019-2834 · 14:18</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="p-3 rounded-2xl rounded-tr-none bg-blue-600/30 border border-blue-500/40 text-blue-100 max-w-[80%]">
                                                    Acknowledged. Verification complete.
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500">Device Relay · 14:19</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Simulated Console Footer */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
                            <span>ENCRYPTION: AES-256-GCM (TUNNEL_VERIFIED)</span>
                            <span className="text-blue-400 cursor-pointer hover:underline" onClick={scrollToPortal}>Sign in to unlock full console →</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section: Asymmetrical Bento Grid (`High-End Features`) */}
            <section id="features" className="py-24 px-4 md:px-8 max-w-[1240px] mx-auto relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-slate-300 text-xs font-mono uppercase tracking-widest mb-3 border border-white/10">
                        SYSTEM ARCHITECTURE
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
                        Engineered for Absolute Sovereignty
                    </h2>
                    <p className="text-sm sm:text-base text-slate-400">
                        Built for speed, security, and low-latency control across entire device fleets.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Bento Cell 1: Multi-Device Fleet (Col-span 7) */}
                    <div className="bento-card md:col-span-7 p-8 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="4" y="2" width="16" height="20" rx="2" />
                                    <line x1="12" y1="18" x2="12.01" y2="18" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Multi-Device Command Fleet</h3>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-[44ch]">
                                Orchestrate up to 10 concurrent Android devices under a single encrypted dashboard session. Switch between device telemetry streams in real-time without reconnection lag.
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4 text-xs font-mono text-slate-400">
                            <span className="flex items-center gap-1.5 text-blue-400">
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                10 Devices Max (Premium)
                            </span>
                            <span>•</span>
                            <span>Simultaneous Sockets</span>
                        </div>
                    </div>

                    {/* Bento Cell 2: Background Stealth (Col-span 5) */}
                    <div className="bento-card md:col-span-5 p-8 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Background Stealth Daemon</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Optimized native Android background service consuming less than 0.4% battery. Operates silently even during deep sleep states.
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                            <span>CPU Overhead: &lt; 0.1%</span>
                            <span className="text-emerald-400">STEALTH_VERIFIED</span>
                        </div>
                    </div>

                    {/* Bento Cell 3: High-Speed ZIP Export (Col-span 5) */}
                    <div className="bento-card md:col-span-5 p-8 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Bulk ZIP Stream Engine</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                No waiting for cloud uploads. GalleryEye streams files directly from the device storage into compressed ZIP archives right inside your browser memory.
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10 text-xs font-mono text-slate-400">
                            <span>Throughput: Up to 45 MB/sec</span>
                        </div>
                    </div>

                    {/* Bento Cell 4: Zero-Cloud Footprint (Col-span 7) */}
                    <div className="bento-card md:col-span-7 p-8 flex flex-col justify-between bg-gradient-to-br from-blue-950/20 via-slate-900/10 to-transparent">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Zero-Cloud Footprint Option</h3>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-[48ch]">
                                Your private media never resides on third-party cloud servers. End-to-end encrypted tunnels ensure bytes pass directly from your Android to your browser display.
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                            <span>Cryptography: AES-256 + RSA-4096</span>
                            <span className="text-blue-400">NO_LOGS_GUARANTEE</span>
                        </div>
                    </div>

                </div>
            </section>

            {/* Section: Cryptographic Comparison Table (`The Z-Axis Architecture`) */}
            <section id="security" className="py-20 px-4 md:px-8 max-w-[1240px] mx-auto relative z-10">
                <div className="p-8 md:p-12 rounded-[2rem] bg-gradient-to-b from-[#121316] to-[#0a0b0d] border border-white/10 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-5">
                            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-semibold block mb-2">
                                COMPARATIVE ADVANTAGE
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                                Why GalleryEye vs Traditional Cloud Backup?
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                Traditional backup services store plaintext thumbnails and logs on centralized servers. GalleryEye eliminates the middleman entirely.
                            </p>
                            <button
                                onClick={scrollToPortal}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg flex items-center gap-2"
                            >
                                <span>Authenticate to Console</span>
                                <span>→</span>
                            </button>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                                <div>
                                    <span className="text-xs font-mono text-red-400 uppercase font-semibold mb-2 block">Traditional Cloud</span>
                                    <h4 className="text-base font-bold text-white mb-2">Third-Party Storage</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Files uploaded and mirrored across commercial servers subject to data indexing and scan pipelines.
                                    </p>
                                </div>
                                <div className="mt-4 text-[11px] font-mono text-red-400/80">⚠️ Plaintext Metadata Stored</div>
                            </div>

                            <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/40 flex flex-col justify-between shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                                <div>
                                    <span className="text-xs font-mono text-blue-400 uppercase font-semibold mb-2 block">GalleryEye Protocol</span>
                                    <h4 className="text-base font-bold text-white mb-2">Direct Encrypted Tunnel</h4>
                                    <p className="text-xs text-blue-100/80 leading-relaxed">
                                        Direct WebSocket and WebRTC relay. Zero files stored in cloud databases. Cryptographically verified session tokens.
                                    </p>
                                </div>
                                <div className="mt-4 text-[11px] font-mono text-emerald-400 font-bold">✓ 100% Zero-Knowledge</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Call-to-Action Banner */}
            <section className="py-20 px-4 md:px-8 max-w-[1240px] mx-auto text-center relative z-10">
                <div className="doppelrand-outer">
                    <div className="doppelrand-inner py-16 px-6 sm:px-12 bg-gradient-to-r from-blue-900/30 via-[#121316] to-indigo-900/30 flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/20 mb-6 shadow-2xl">
                            <Image
                                src="/gallery-eye-logo.jpg"
                                alt="Gallery Eye"
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 max-w-xl">
                            Ready to take complete control of your Android ecosystem?
                        </h2>
                        <p className="text-sm text-slate-400 max-w-md mb-8">
                            Sign in or create your session now to deploy remote monitoring across your device fleet in seconds.
                        </p>
                        <button
                            onClick={scrollToPortal}
                            className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
                        >
                            Access Console Now →
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-[#060709] relative z-10 text-xs text-slate-500">
                <div className="max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10">
                            <Image
                                src="/gallery-eye-logo.jpg"
                                alt="Gallery Eye"
                                width={28}
                                height={28}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="font-bold text-slate-300">Gallery Eye OS</span>
                        <span>© 2026 Gallery Eye Inc. All rights reserved.</span>
                    </div>

                    <div className="flex items-center gap-6 text-slate-400">
                        <a href="#" className="hover:text-white transition">Privacy Architecture</a>
                        <a href="#" className="hover:text-white transition">Terms of Service</a>
                        <a href="#" className="hover:text-white transition">System Status</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
