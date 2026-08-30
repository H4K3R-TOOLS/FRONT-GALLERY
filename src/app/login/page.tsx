'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
    Camera, Mic, Image as ImageIcon, MessageSquare, 
    Bell, EyeOff, Shield, Zap, ArrowRight, Play, X,
    Smartphone, CheckCircle2, Lock, Sparkles, Download,
    Radio, Activity, Layers, Terminal, ChevronRight, Eye
} from 'lucide-react';
import VideoModal from '@/components/VideoModal';

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();

    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [activeTool, setActiveTool] = useState<'camera' | 'mic' | 'vault' | 'sms'>('camera');
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [isRecording, setIsRecording] = useState(true);

    // Auto-redirect if already signed in
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
            title: 'Live Optical Feed',
            badge: '4K RAW',
            desc: 'Dual-lens high-speed streaming with zero-latency snapshot exfiltration.',
            icon: Camera,
            accent: '#06b6d4',
            glowClass: 'shadow-[0_0_25px_rgba(6,182,212,0.35)]',
        },
        {
            id: 'audio',
            title: 'Audio Interceptor',
            badge: '48kHz VoIP',
            desc: 'High-clarity ambient microphone listener with hidden background cloud recording.',
            icon: Mic,
            accent: '#a855f7',
            glowClass: 'shadow-[0_0_25px_rgba(168,85,247,0.35)]',
        },
        {
            id: 'gallery',
            title: 'Encrypted Vault',
            badge: 'FULL DUMP',
            desc: 'Instant synchronization of all photo albums, videos, and single-tap ZIP packaging.',
            icon: ImageIcon,
            accent: '#10b981',
            glowClass: 'shadow-[0_0_25px_rgba(16,185,129,0.35)]',
        },
        {
            id: 'sms',
            title: 'SMS & OTP Stream',
            badge: 'LIVE SYNC',
            desc: 'Real-time text interceptor for incoming 2FA verification codes and message threads.',
            icon: MessageSquare,
            accent: '#f43f5e',
            glowClass: 'shadow-[0_0_25px_rgba(244,63,94,0.35)]',
        },
        {
            id: 'notifications',
            title: 'Notification Mirror',
            badge: 'REAL-TIME',
            desc: 'Captures incoming notifications from WhatsApp, Telegram, Instagram, and bank alerts.',
            icon: Bell,
            accent: '#f59e0b',
            glowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.35)]',
        },
        {
            id: 'stealth',
            title: 'Zero-Icon Cloaking',
            badge: '100% INVISIBLE',
            desc: 'Self-hiding launcher icon with persistent watchdog daemon that auto-restarts on reboot.',
            icon: EyeOff,
            accent: '#f97316',
            glowClass: 'shadow-[0_0_25px_rgba(249,115,22,0.35)]',
        },
    ];

    return (
        <div className="min-h-screen bg-[#0e1014] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-300 antialiased overflow-x-hidden">
            
            {/* Ambient Background Glow Orbs */}
            <div className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed top-1/2 left-[-150px] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

            {/* 1. Neumorphic Header Bar */}
            <header className="sticky top-0 z-50 px-4 sm:px-8 py-3 bg-[#0e1014]/90 backdrop-blur-2xl border-b border-white/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    
                    {/* Brand Pod */}
                    <div className="flex items-center gap-3">
                        <div className="uiverse-icon-convex w-10 h-10 rounded-2xl flex items-center justify-center text-orange-400 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                            <Shield size={20} className="stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tight text-white font-mono flex items-center gap-1.5">
                                <span>SPYNOX</span>
                                <span className="text-[9px] font-extrabold text-orange-400 px-1.5 py-0.5 rounded-full uiverse-inset">v3.4</span>
                            </span>
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest hidden sm:block">
                                Remote Hardware Matrix
                            </span>
                        </div>
                    </div>

                    {/* Header Convex CTA */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoggingIn}
                        className="uiverse-btn-glow px-5 py-2.5 rounded-2xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                        <span>{isLoggingIn ? 'Connecting...' : 'Sign In'}</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </header>

            {/* 2. Hero Section: 3D Tactile Sculpture */}
            <main className="flex-1">
                <section className="pt-10 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
                    
                    {/* Glowing Neumorphic Pill */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full uiverse-inset text-orange-400 text-xs font-mono font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
                        <span>NEXT-GEN SURVEILLANCE & TELEMETRY</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12] text-white">
                        Control Any Device <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                            In Real-Time.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
                        Live dual camera feeds, ambient audio interceptor, media vault extraction, and hardware diagnostics in one unified 3D web terminal.
                    </p>

                    {/* Main Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md mx-auto">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLoggingIn}
                            className="w-full sm:w-auto flex-1 py-4 px-7 rounded-2xl bg-white hover:bg-zinc-100 text-black font-black text-sm flex items-center justify-center gap-3 shadow-[0_12px_35px_rgba(255,255,255,0.25)] active:scale-95 transition-transform cursor-pointer"
                        >
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>{isLoggingIn ? 'Connecting...' : 'Get Started with Google'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsVideoModalOpen(true)}
                            className="w-full sm:w-auto py-4 px-6 rounded-2xl uiverse-btn-convex text-white font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Play size={13} className="text-orange-400 fill-orange-400" />
                            <span>Watch 1-Min Demo</span>
                        </button>
                    </div>

                    {/* 3. Uiverse 3D Device Control Deck Showcase */}
                    <div className="pt-6 sm:pt-10 max-w-4xl mx-auto text-left">
                        <div className="uiverse-card p-5 sm:p-7 space-y-5">
                            
                            {/* Terminal Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="uiverse-icon-convex w-11 h-11 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                                        <Smartphone size={22} />
                                    </div>
                                    <div>
                                        <div className="text-sm sm:text-base font-black text-white flex items-center gap-2 font-mono">
                                            <span>Galaxy S24 Ultra</span>
                                            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full uiverse-inset">
                                                ● LIVE ONLINE
                                            </span>
                                        </div>
                                        <div className="text-xs text-zinc-400 font-mono mt-0.5">
                                            Battery: 94% ⚡ • E2E Encrypted WebSocket
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="uiverse-inset px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-orange-400">
                                        14ms PING
                                    </div>
                                </div>
                            </div>

                            {/* 3D Convex Tool Switcher Tabs */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {[
                                    { id: 'camera', label: 'Camera Stream', icon: Camera, color: 'text-cyan-400' },
                                    { id: 'mic', label: 'Mic Audio', icon: Mic, color: 'text-purple-400' },
                                    { id: 'vault', label: 'Media Vault', icon: ImageIcon, color: 'text-emerald-400' },
                                    { id: 'sms', label: 'SMS Logs', icon: MessageSquare, color: 'text-rose-400' },
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTool === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTool(tab.id as any)}
                                            className={`p-3 rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                                                isActive
                                                    ? 'uiverse-btn-glow text-white font-black'
                                                    : 'uiverse-btn-convex text-zinc-400 hover:text-white'
                                            }`}
                                        >
                                            <Icon size={15} className={isActive ? 'text-white' : tab.color} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Interactive Inset Viewport */}
                            <div className="uiverse-inset p-4 sm:p-6 min-h-[200px] flex flex-col justify-center">
                                {activeTool === 'camera' && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                                        <div className="space-y-2 text-center sm:text-left">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                                <span>OPTICAL FEED: 1080P RAW ACTIVE</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Live Dual Lens Viewfinder</h4>
                                            <p className="text-xs text-zinc-400 max-w-sm">Capture instantaneous high-resolution photos and toggle between Front and Rear optics without target notification.</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setIsTorchOn(!isTorchOn)}
                                                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uiverse-btn-convex flex items-center gap-2 cursor-pointer ${isTorchOn ? 'text-amber-300 border-amber-500/50' : 'text-zinc-400'}`}
                                            >
                                                <span>Torch: {isTorchOn ? 'ON ⚡' : 'OFF'}</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={handleGoogleSignIn}
                                                className="uiverse-btn-glow px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider cursor-pointer"
                                            >
                                                Take Snapshot
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTool === 'mic' && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                                        <div className="space-y-2 text-center sm:text-left">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                                <span>48KHZ STEREO LISTENING</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Ambient Microphone Interceptor</h4>
                                            <p className="text-xs text-zinc-400 max-w-sm">High-clarity ambient audio streaming with VoIP call routing bypass and background cloud recorder.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="uiverse-btn-glow px-6 py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider cursor-pointer shrink-0"
                                        >
                                            Listen Live Audio
                                        </button>
                                    </div>
                                )}

                                {activeTool === 'vault' && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                                        <div className="space-y-2 text-center sm:text-left">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <span>4,218 MEDIA FILES SYNCED</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Full Gallery Vault & Export</h4>
                                            <p className="text-xs text-zinc-400 max-w-sm">Browse high-res pictures, 4K videos, hidden screenshots, and trigger bulk ZIP extractions in one click.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="uiverse-btn-glow px-6 py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider cursor-pointer shrink-0"
                                        >
                                            Open Vault
                                        </button>
                                    </div>
                                )}

                                {activeTool === 'sms' && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                                        <div className="space-y-2 text-center sm:text-left">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
                                                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                                                <span>SMS & OTP CAPTURE STREAM</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Real-Time SMS & Chat Logs</h4>
                                            <p className="text-xs text-zinc-400 max-w-sm">Capture all incoming verification codes, banking OTPs, and private text conversations live as they arrive.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="uiverse-btn-glow px-6 py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider cursor-pointer shrink-0"
                                        >
                                            View SMS Feed
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. 6 Core 3D Tactile Modules Grid */}
                <section className="py-14 sm:py-20 px-4 sm:px-6 bg-[#0a0c10] border-t border-white/5">
                    <div className="max-w-6xl mx-auto space-y-10">
                        
                        <div className="text-center space-y-2">
                            <div className="inline-block px-3.5 py-1 rounded-full uiverse-inset text-[10px] font-mono font-black uppercase tracking-wider text-orange-400">
                                COMMAND MODULES
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                                Built for Complete Control
                            </h2>
                            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                                Low-level Android sensor exfiltration and hardware control in pure 3D neumorphic perfection.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {modules.map((m) => {
                                const Icon = m.icon;
                                return (
                                    <div 
                                        key={m.id}
                                        className="uiverse-card p-6 flex flex-col justify-between group"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div 
                                                    className="uiverse-icon-convex w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                                                    style={{ color: m.accent }}
                                                >
                                                    <Icon size={22} />
                                                </div>
                                                <span className="uiverse-inset px-2.5 py-1 rounded-xl text-[9px] font-mono font-black text-white/50 uppercase tracking-wider">
                                                    {m.badge}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-black text-white mb-1.5 tracking-tight group-hover:text-orange-300 transition-colors">
                                                {m.title}
                                            </h3>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                                {m.desc}
                                            </p>
                                        </div>

                                        <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/30 group-hover:text-orange-400 transition-colors">
                                            <span>Hardware Verified</span>
                                            <ChevronRight size={14} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 5. 3-Step Setup Flow (3D Convex Cards) */}
                <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-10">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Simple 3-Step Deployment
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                            Generate and pair endpoints in under 60 seconds.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {[
                            { num: '01', title: 'Generate Custom APK', desc: 'Build your stealth binary with custom app name and icon.' },
                            { num: '02', title: 'One-Time Device Install', desc: 'Install payload on endpoint and grant permissions in 30 seconds.' },
                            { num: '03', title: 'Access Web Command', desc: 'Sign in to Spynox and view real-time feeds from any browser.' },
                        ].map((s, idx) => (
                            <div key={idx} className="uiverse-card p-6 space-y-3 relative overflow-hidden">
                                <span className="text-3xl font-black text-orange-500/30 font-mono block">
                                    {s.num}
                                </span>
                                <h3 className="text-base font-black text-white">{s.title}</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. High-Impact Bottom CTA */}
                <section className="py-14 sm:py-20 px-4 sm:px-6 border-t border-white/5 bg-[#090b0e] text-center">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="uiverse-icon-convex w-14 h-14 rounded-3xl flex items-center justify-center text-orange-400 mx-auto shadow-[0_0_30px_rgba(249,115,22,0.35)]">
                            <Sparkles size={26} />
                        </div>
                        
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Ready to Take Full Control?
                        </h2>
                        
                        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                            Deploy your first endpoint today with Spynox and experience zero-latency remote surveillance.
                        </p>

                        <div className="pt-2 flex justify-center">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isLoggingIn}
                                className="uiverse-btn-glow px-8 py-3.5 rounded-2xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 cursor-pointer"
                            >
                                <span>{isLoggingIn ? 'Connecting...' : 'Launch Spynox Command Center'}</span>
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* 7. Minimal Clean Footer */}
            <footer className="py-6 px-4 sm:px-8 border-t border-white/5 text-center text-xs font-mono text-white/40">
                <p>© 2026 Spynox Technologies. All rights reserved.</p>
            </footer>

            {/* Video Guide Modal */}
            <VideoModal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                videoUrl="/video/gallery-eye-tutorial.mp4"
            />
        </div>
    );
}
