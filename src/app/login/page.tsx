'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
    Camera, Mic, Image as ImageIcon, MessageSquare, 
    Bell, EyeOff, Shield, Zap, ArrowRight, Play, X,
    Smartphone, CheckCircle2, Lock, Sparkles, Download
} from 'lucide-react';
import VideoModal from '@/components/VideoModal';

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();

    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [activeTab, setActiveTab] = useState<'camera' | 'audio' | 'gallery' | 'sms'>('camera');

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

    const features = [
        {
            id: 'camera',
            title: 'Live Dual Camera',
            desc: 'Stream front & rear cameras live with one-tap instant 4K snapshots.',
            icon: Camera,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10 border-cyan-500/30',
        },
        {
            id: 'audio',
            title: 'Live Microphone',
            desc: 'Listen to ambient surroundings in high definition and record voice logs.',
            icon: Mic,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10 border-purple-500/30',
        },
        {
            id: 'gallery',
            title: 'Photos & Videos Vault',
            desc: 'Sync all device gallery media and download entire folders as ZIP.',
            icon: ImageIcon,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/30',
        },
        {
            id: 'sms',
            title: 'SMS & OTP Interceptor',
            desc: 'Real-time extraction of all incoming and outgoing text messages.',
            icon: MessageSquare,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10 border-rose-500/30',
        },
        {
            id: 'notifications',
            title: 'Notification Mirror',
            desc: 'Live feed of WhatsApp, Telegram, Instagram, and system notifications.',
            icon: Bell,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/30',
        },
        {
            id: 'stealth',
            title: '100% Invisible Stealth',
            desc: 'App automatically hides its launcher icon and runs silently in the background.',
            icon: EyeOff,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10 border-orange-500/30',
        },
    ];

    const steps = [
        {
            num: '01',
            title: 'Build APK Binary',
            desc: 'Generate your customized APK installer with your preferred app icon and name.',
        },
        {
            num: '02',
            title: 'One-Time Setup',
            desc: 'Install on target Android device and grant necessary permissions in 30 seconds.',
        },
        {
            num: '03',
            title: 'Take Full Control',
            desc: 'Log in to Spynox dashboard on any browser to view live streams and exfiltrate data.',
        },
    ];

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-300 antialiased">
            
            {/* 1. Ultra-Clean Mobile & Desktop Header */}
            <header className="sticky top-0 z-50 px-4 sm:px-8 py-3.5 bg-[#0a0c10]/90 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-orange-400/40">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg sm:text-xl font-black tracking-tight text-white font-mono">
                            SPYNOX
                        </span>
                    </div>

                    {/* Header Action Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoggingIn}
                        className="clay-cta-button px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_16px_rgba(249,115,22,0.4)] active:scale-95 transition-transform cursor-pointer"
                    >
                        <span>{isLoggingIn ? 'Connecting...' : 'Sign In'}</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </header>

            {/* 2. Hero Section: Clean, Bold, Spacious */}
            <main className="flex-1">
                <section className="pt-10 sm:pt-20 pb-12 sm:pb-20 px-4 sm:px-6 text-center max-w-5xl mx-auto space-y-6 sm:space-y-8">
                    
                    {/* Hero Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                        <span>NEXT-GEN REMOTE CONTROL MATRIX</span>
                    </div>

                    {/* Main Headline (Bold, readable on any screen) */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] text-white">
                        Control and Monitor Any Device <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                            In Real-Time.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
                        Live camera streaming, background audio listening, instant media sync, and hardware remote controls in one seamless web dashboard.
                    </p>

                    {/* Primary Hero CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLoggingIn}
                            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.2)] active:scale-95 transition-all cursor-pointer"
                        >
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>{isLoggingIn ? 'Connecting...' : 'Sign In with Google'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsVideoModalOpen(true)}
                            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-[#141720] hover:bg-[#1a1e2a] border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                        >
                            <Play size={15} className="text-orange-400 fill-orange-400" />
                            <span>Watch 1-Min Demo</span>
                        </button>
                    </div>

                    {/* 3. Interactive Live Dashboard Preview (Mobile & Desktop Perfect) */}
                    <div className="pt-6 sm:pt-10 max-w-4xl mx-auto text-left">
                        <div className="clay-card rounded-3xl p-4 sm:p-6 border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.9)] space-y-4">
                            
                            {/* Device Info Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white flex items-center gap-2">
                                            <span>Galaxy S24 Ultra</span>
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[10px] text-emerald-400 font-mono font-bold">ONLINE</span>
                                        </div>
                                        <div className="text-xs text-zinc-400 font-mono">Battery: 94% • Encrypted Tunnel Active</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-mono font-bold">
                                        E2E SECURED
                                    </span>
                                </div>
                            </div>

                            {/* Interactive Tool Switcher Pills */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('camera')}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        activeTab === 'camera'
                                            ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                            : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Camera size={14} />
                                    <span>Camera</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('audio')}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        activeTab === 'audio'
                                            ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                            : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Mic size={14} />
                                    <span>Microphone</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('gallery')}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        activeTab === 'gallery'
                                            ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                            : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <ImageIcon size={14} />
                                    <span>Media Vault</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('sms')}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        activeTab === 'sms'
                                            ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                                            : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <MessageSquare size={14} />
                                    <span>SMS Logs</span>
                                </button>
                            </div>

                            {/* Active Tab Showcase Viewport */}
                            <div className="bg-[#0e1017] rounded-2xl p-4 sm:p-5 border border-white/10 min-h-[180px] sm:min-h-[220px] flex flex-col justify-center">
                                {activeTab === 'camera' && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="space-y-2 text-center sm:text-left">
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
                                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                                <span>LIVE OPTICAL STREAM (1080P RAW)</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Dual Lens Live Viewfinder</h4>
                                            <p className="text-xs text-zinc-400 max-w-sm">Capture instantaneous high-resolution photos and toggle between Front and Rear optics without target detection.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md shrink-0"
                                        >
                                            Test Optical Stream
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'audio' && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="space-y-2 text-center sm:text-left">
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-mono font-bold">
                                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                                <span>48KHZ LIVE STEREO LISTENING</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Ambient Microphone Interceptor</h4>
                                            <p className="text-xs text-zinc-400 max-w-sm">High-clarity ambient audio streaming with VoIP call routing bypass and background cloud recorder.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md shrink-0"
                                        >
                                            Listen Live Audio
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'gallery' && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="space-y-2 text-center sm:text-left">
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <span>4,218 FILES SYNCED & SECURED</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Full Gallery & Media Vault</h4>
                                            <p className="text-xs text-zinc-400 max-w-sm">Browse high-res pictures, 4K videos, hidden screenshots, and trigger bulk ZIP extractions in one click.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md shrink-0"
                                        >
                                            Open Media Vault
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'sms' && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="space-y-2 text-center sm:text-left">
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 text-xs font-mono font-bold">
                                                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                                                <span>INSTANT SMS & 2FA CAPTURE</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Real-Time SMS & Chat Logs</h4>
                                            <p className="text-xs text-zinc-400 max-w-sm">Capture all incoming verification codes, banking OTPs, and private text conversations live as they arrive.</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md shrink-0"
                                        >
                                            View SMS Stream
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Core Features Grid (Clean, spacious, 6 cards) */}
                <section className="py-12 sm:py-20 px-4 sm:px-6 bg-[#07080b] border-t border-white/5">
                    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
                        
                        <div className="text-center space-y-2 sm:space-y-3">
                            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                                Built for Complete Control
                            </h2>
                            <p className="text-xs sm:text-base text-zinc-400 max-w-lg mx-auto">
                                Everything you need to manage connected endpoints with zero lag and total invisibility.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {features.map((f) => {
                                const IconComponent = f.icon;
                                return (
                                    <div 
                                        key={f.id}
                                        className="clay-card p-5 sm:p-6 rounded-3xl border border-white/10 hover:border-orange-500/40 transition-all space-y-3 group"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${f.bg} ${f.color} shadow-sm group-hover:scale-105 transition-transform`}>
                                            <IconComponent size={22} />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-orange-300 transition-colors">
                                            {f.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                            {f.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 5. How It Works (3 Clear Steps) */}
                <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 sm:space-y-12">
                    <div className="text-center space-y-2 sm:space-y-3">
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Simple 3-Step Setup
                        </h2>
                        <p className="text-xs sm:text-base text-zinc-400 max-w-md mx-auto">
                            Deploy your private client to any device in under a minute.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        {steps.map((s, idx) => (
                            <div key={idx} className="clay-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-3 relative overflow-hidden">
                                <span className="text-3xl sm:text-4xl font-black text-orange-500/30 font-mono block">
                                    {s.num}
                                </span>
                                <h3 className="text-base sm:text-lg font-black text-white">{s.title}</h3>
                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. High-Impact Bottom CTA */}
                <section className="py-12 sm:py-20 px-4 sm:px-6 border-t border-white/5 bg-[#0e1017] text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="w-14 h-14 rounded-3xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                            <Sparkles size={28} />
                        </div>
                        
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Ready to take command with Spynox?
                        </h2>
                        
                        <p className="text-xs sm:text-base text-zinc-400 max-w-lg mx-auto">
                            Connect your first endpoint now and access real-time surveillance tools in seconds.
                        </p>

                        <div className="pt-2 flex justify-center">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isLoggingIn}
                                className="clay-cta-button px-8 py-3.5 rounded-2xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-[0_8px_30px_rgba(249,115,22,0.5)] cursor-pointer active:scale-95 transition-all"
                            >
                                <span>{isLoggingIn ? 'Connecting...' : 'Launch Spynox Terminal'}</span>
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* 7. Minimal Clean Footer */}
            <footer className="py-6 px-4 sm:px-8 border-t border-white/10 text-center text-xs font-mono text-white/40">
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
