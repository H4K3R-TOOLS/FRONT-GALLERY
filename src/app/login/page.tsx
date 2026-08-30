'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
    Camera, Mic, Image as ImageIcon, MessageSquare, 
    Bell, EyeOff, Shield, Zap, ArrowRight, Play, X,
    Smartphone, CheckCircle2, Lock, Sparkles, Download,
    Radio, Activity, Layers, Terminal, ChevronRight, Eye,
    Flashlight, Vibrate, RefreshCw, Volume2, ShieldAlert,
    Cpu, HardDrive, Wifi, Globe, Key, Crosshair
} from 'lucide-react';
import VideoModal from '@/components/VideoModal';

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();

    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    // Interactive Bento Cards State
    const [cameraFacing, setCameraFacing] = useState<'rear' | 'front'>('rear');
    const [isNightMode, setIsNightMode] = useState(false);
    const [snapshotCount, setSnapshotCount] = useState(24);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isAudioLive, setIsAudioLive] = useState(true);
    const [isGhostActive, setIsGhostActive] = useState(true);
    const [isZipExtracting, setIsZipExtracting] = useState(false);

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

    const handleSnapshot = () => {
        setIsCapturing(true);
        setTimeout(() => {
            setIsCapturing(false);
            setSnapshotCount(prev => prev + 1);
        }, 300);
    };

    const handleZipExtraction = () => {
        setIsZipExtracting(true);
        setTimeout(() => {
            setIsZipExtracting(false);
        }, 1500);
    };

    const marqueeItems = [
        { label: 'SPYNOX OS v3.4', icon: Zap, color: 'text-orange-400' },
        { label: 'AES-256 E2E ENCRYPTED', icon: Lock, color: 'text-amber-400' },
        { label: '10,000+ CONNECTED ENDPOINTS', icon: Smartphone, color: 'text-emerald-400' },
        { label: '4K DUAL OPTICAL STREAM', icon: Camera, color: 'text-cyan-400' },
        { label: '48kHz VOIP AMBIENT RECORDING', icon: Mic, color: 'text-purple-400' },
        { label: '100% ZERO-ICON GHOST STEALTH', icon: EyeOff, color: 'text-rose-400' },
        { label: 'ZERO-ROOT REQUIRED (ANDROID 7-15)', icon: ShieldAlert, color: 'text-yellow-400' },
    ];

    return (
        <div className="min-h-screen bg-[#090b0e] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-300 antialiased overflow-x-hidden">
            
            {/* Ambient Background Lighting Mesh */}
            <div className="fixed top-[-150px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-orange-500/12 via-amber-500/5 to-transparent rounded-full blur-[160px] pointer-events-none" />
            <div className="fixed top-1/2 right-[-150px] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />
            <div className="fixed bottom-0 left-[-150px] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none" />

            {/* 1. Header Bar */}
            <header className="sticky top-0 z-50 px-4 sm:px-8 py-3 bg-[#090b0e]/90 backdrop-blur-2xl border-b border-white/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    
                    {/* Brand Pod */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-orange-400/40">
                            <Shield size={20} className="stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tight text-white font-mono flex items-center gap-1.5">
                                <span>SPYNOX</span>
                                <span className="text-[9px] font-extrabold text-orange-400 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30">v3.4</span>
                            </span>
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest hidden sm:block">
                                Remote Command Suite
                            </span>
                        </div>
                    </div>

                    {/* Header Action Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoggingIn}
                        className="clay-cta-button px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                    >
                        <span>{isLoggingIn ? 'Connecting...' : 'Sign In'}</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </header>

            {/* 2. Live Telemetry Marquee Ticker Bar */}
            <div className="w-full bg-[#0d1015] border-b border-white/5 py-2 overflow-hidden flex items-center shadow-inner">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[...marqueeItems, ...marqueeItems].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx} className="flex items-center gap-2 mx-5 text-[11px] font-mono font-bold text-white/70">
                                <Icon size={13} className={item.color} />
                                <span>{item.label}</span>
                                <span className="text-white/20 ml-3">•</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. Hero Section: 3D Holographic Core & Headline */}
            <main className="flex-1">
                <section className="pt-10 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-7">
                    
                    {/* Top Beacon Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold shadow-[0_0_25px_rgba(249,115,22,0.2)]">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
                        <span>TACTICAL HARDWARE INTELLIGENCE</span>
                    </div>

                    {/* 3D Gyroscopic Holographic Cyber Core (Pure GPU CSS 3D - Zero Lag) */}
                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto my-2 flex items-center justify-center [perspective:1000px]">
                        
                        {/* Outer Gyro Ring X (Orange) */}
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-500/50 animate-gyro-x pointer-events-none shadow-[0_0_30px_rgba(249,115,22,0.3)]" />
                        
                        {/* Middle Gyro Ring Y (Cyan) */}
                        <div className="absolute inset-2 rounded-full border-2 border-cyan-400/40 animate-gyro-y pointer-events-none shadow-[0_0_30px_rgba(6,182,212,0.25)]" />
                        
                        {/* Inner Gyro Ring Z (Purple) */}
                        <div className="absolute inset-4 rounded-full border border-purple-500/40 animate-gyro-z pointer-events-none shadow-[0_0_25px_rgba(168,85,247,0.25)]" />
                        
                        {/* Radar Sweep Reticle */}
                        <div className="absolute inset-6 rounded-full border border-white/10 overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-transparent to-transparent animate-radar-sweep origin-center" />
                        </div>

                        {/* Center Hologram Shield Avatar */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#181b22] to-[#0c0e12] border border-orange-400/50 flex items-center justify-center text-orange-400 shadow-[0_0_40px_rgba(249,115,22,0.5)] z-10">
                            <Shield size={32} className="stroke-[2.5] animate-pulse" />
                        </div>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12] text-white">
                        Unified Remote Intelligence. <br />
                        <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                            Engineered for Absolute Control.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
                        Real-time optical streams, ambient audio interceptor, encrypted media vaults, and low-level hardware diagnostics across any Android endpoint.
                    </p>

                    {/* Primary Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md mx-auto">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLoggingIn}
                            className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl bg-white hover:bg-zinc-100 text-black font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-[0_12px_35px_rgba(255,255,255,0.25)] active:scale-95 transition-transform cursor-pointer"
                        >
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>{isLoggingIn ? 'Connecting...' : 'Launch Spynox Console'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsVideoModalOpen(true)}
                            className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-[#13161f] hover:bg-[#1a1e2a] border border-white/10 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                        >
                            <Play size={14} className="text-orange-400 fill-orange-400" />
                            <span>1-Min Walkthrough</span>
                        </button>
                    </div>
                </section>

                {/* 4. Interactive Cyber Bento Showcase (4 Luxury High-Impact Cards) */}
                <section className="py-8 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
                    
                    <div className="text-center space-y-2">
                        <div className="inline-block px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-[10px] font-mono font-black uppercase tracking-wider text-orange-400">
                            SURVEILLANCE ARCHITECTURE
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Command & Control Capabilities
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        
                        {/* Bento Card 1 (Large 2-Column Hero): Optical Vision Viewfinder */}
                        <div className="lg:col-span-2 clay-card p-5 sm:p-7 rounded-[2.5rem] border border-white/10 space-y-5 relative overflow-hidden flex flex-col justify-between">
                            
                            {isCapturing && (
                                <div className="absolute inset-0 bg-white/40 z-30 pointer-events-none transition-opacity duration-300" />
                            )}

                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                                            <Camera size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-black text-white">Live Optical Viewfinder</h3>
                                            <p className="text-xs text-zinc-400 font-mono">1080p RAW Stream • Zero Latency</p>
                                        </div>
                                    </div>

                                    {/* Lens Controls */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCameraFacing(prev => prev === 'rear' ? 'front' : 'rear')}
                                            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <RefreshCw size={12} />
                                            <span>Lens: {cameraFacing.toUpperCase()}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsNightMode(prev => !prev)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer border ${
                                                isNightMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-white/5 text-zinc-400 border-white/10'
                                            }`}
                                        >
                                            <span>IR Night</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Simulated Viewfinder HUD */}
                                <div className="mt-4 rounded-2xl bg-[#090b0f] border border-white/10 p-5 min-h-[160px] flex flex-col justify-between relative">
                                    <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                                        <span>SENSOR: SONY IMX989</span>
                                        <span className="text-emerald-400 font-bold">● 60 FPS RELAY</span>
                                    </div>

                                    {/* Targeting Crosshair */}
                                    <div className="flex items-center justify-center my-3">
                                        <div className="w-24 h-24 border border-cyan-500/30 rounded-2xl flex items-center justify-center relative">
                                            <Crosshair size={24} className="text-cyan-400/60" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                                        <span>ISO 100 • 24mm f/1.7</span>
                                        <span>AUTO EXPOSURE</span>
                                    </div>
                                </div>
                            </div>

                            {/* Snapshot Action */}
                            <button
                                type="button"
                                onClick={handleSnapshot}
                                className="clay-cta-button w-full py-3.5 rounded-2xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-95 transition-transform"
                            >
                                <Camera size={15} />
                                <span>Capture Live RAW Snapshot ({snapshotCount})</span>
                            </button>
                        </div>

                        {/* Bento Card 2: Ambient Audio Interceptor */}
                        <div className="clay-card p-5 sm:p-7 rounded-[2.5rem] border border-white/10 space-y-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                                    <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                                        <Mic size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-white">Audio Interceptor</h3>
                                        <p className="text-xs text-zinc-400 font-mono">48kHz Stereo Listening</p>
                                    </div>
                                </div>

                                {/* Dancing Soundwave Spectrum */}
                                <div className="mt-5 space-y-2">
                                    <div className="text-[10px] font-mono text-purple-300 flex items-center justify-between">
                                        <span>VoIP Bypass Active</span>
                                        <span className="text-emerald-400">SYNCED</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 h-14 px-3 rounded-2xl bg-black/40 border border-white/5 overflow-hidden">
                                        {[40, 75, 55, 90, 30, 85, 100, 60, 45, 80, 95, 70, 50, 85, 90, 65, 40].map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-gradient-to-t from-purple-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-200"
                                                style={{ height: isAudioLive ? `${h}%` : '15%' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsAudioLive(prev => !prev)}
                                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-purple-300 flex items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                                <Volume2 size={14} />
                                <span>{isAudioLive ? 'Pause Ambient Stream' : 'Resume Ambient Stream'}</span>
                            </button>
                        </div>

                        {/* Bento Card 3: Encrypted Media Vault */}
                        <div className="clay-card p-5 sm:p-7 rounded-[2.5rem] border border-white/10 space-y-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                        <ImageIcon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-white">Media Vault Dump</h3>
                                        <p className="text-xs text-zinc-400 font-mono">4,218 Files Synced</p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                                    <div className="p-2.5 rounded-xl bg-[#12141c] border border-white/5">
                                        <div className="text-zinc-400 text-[10px]">Photos</div>
                                        <div className="text-white font-black">14.2 GB</div>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-[#12141c] border border-white/5">
                                        <div className="text-zinc-400 text-[10px]">Videos</div>
                                        <div className="text-white font-black">38.6 GB</div>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-[#12141c] border border-white/5">
                                        <div className="text-zinc-400 text-[10px]">WhatsApp</div>
                                        <div className="text-white font-black">6.4 GB</div>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-[#12141c] border border-white/5">
                                        <div className="text-zinc-400 text-[10px]">Vault</div>
                                        <div className="text-emerald-400 font-black">100% EXIF</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleZipExtraction}
                                className="clay-cta-button w-full py-3 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                            >
                                <Download size={14} />
                                <span>{isZipExtracting ? 'Packaging Archive...' : 'Download Bulk ZIP'}</span>
                            </button>
                        </div>

                        {/* Bento Card 4 (2-Column): 100% Zero-Icon Ghost Cloaking */}
                        <div className="lg:col-span-2 clay-card p-5 sm:p-7 rounded-[2.5rem] border border-white/10 space-y-4 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                                            <EyeOff size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-black text-white">Zero-Icon Ghost Cloaking</h3>
                                            <p className="text-xs text-zinc-400">100% Invisibility with Watchdog Persistence</p>
                                        </div>
                                    </div>

                                    {/* Live Toggle Switch */}
                                    <button
                                        type="button"
                                        onClick={() => setIsGhostActive(prev => !prev)}
                                        className="w-14 h-8 rounded-full bg-black/60 border border-white/10 p-1 flex items-center cursor-pointer transition-colors shrink-0"
                                    >
                                        <div 
                                            className={`w-6 h-6 rounded-full transition-transform ${
                                                isGhostActive ? 'translate-x-6 uiverse-toggle-knob-active' : 'translate-x-0 uiverse-toggle-knob'
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                                    <div className="p-3 rounded-2xl bg-[#12141c] border border-white/5 flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                        <span>No Launcher Icon</span>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-[#12141c] border border-white/5 flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                                        <span>Auto-Restart on Boot</span>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-[#12141c] border border-white/5 flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                                        <span>Battery Killer Proof</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-[11px] font-mono text-white/40 pt-2 flex items-center justify-between">
                                <span>Status: {isGhostActive ? 'CLOAKED & INVISIBLE' : 'ICON VISIBLE'}</span>
                                <span className="text-emerald-400 font-bold">DAEMON RUNNING</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. 3-Step Deployment Walkthrough */}
                <section className="py-10 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Simple 3-Step Deployment
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { num: '01', title: 'Generate Stealth APK', desc: 'Build your customized APK binary in 10 seconds with custom name and icon.' },
                            { num: '02', title: 'One-Time Setup', desc: 'Install payload on endpoint and grant necessary permissions in 30 seconds.' },
                            { num: '03', title: 'Take Live Command', desc: 'Sign in to Spynox and view real-time feeds from any browser instantly.' },
                        ].map((s, idx) => (
                            <div key={idx} className="clay-card p-6 rounded-3xl border border-white/10 space-y-2 relative overflow-hidden">
                                <span className="text-3xl font-black text-orange-500/30 font-mono block">
                                    {s.num}
                                </span>
                                <h3 className="text-base font-black text-white">{s.title}</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. High-Impact Bottom Sign-In Banner */}
                <section className="py-14 sm:py-20 px-4 sm:px-6 border-t border-white/5 bg-[#08090d] text-center">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="w-14 h-14 rounded-3xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(249,115,22,0.35)]">
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
                                className="clay-cta-button px-8 py-3.5 rounded-2xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 cursor-pointer shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95 transition-transform"
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
