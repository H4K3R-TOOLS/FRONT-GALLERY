'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
    Camera, Mic, Image as ImageIcon, MessageSquare, 
    Bell, EyeOff, Shield, Zap, ArrowRight, Play, X,
    Smartphone, CheckCircle2, Lock, Sparkles, Download,
    Radio, Activity, Layers, Terminal, ChevronRight, Eye,
    Flashlight, Vibrate, RefreshCw, Sliders, Volume2, ShieldAlert
} from 'lucide-react';
import VideoModal from '@/components/VideoModal';

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();

    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    // Live Interactive Hardware Controls State
    const [activeTool, setActiveTool] = useState<'camera' | 'mic' | 'vault' | 'sms'>('camera');
    const [cameraFacing, setCameraFacing] = useState<'front' | 'rear'>('rear');
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [isVibrating, setIsVibrating] = useState(false);
    const [isMicStreaming, setIsMicStreaming] = useState(true);
    const [isStealthCloaked, setIsStealthCloaked] = useState(true);
    const [snapshotCount, setSnapshotCount] = useState(14);
    const [isCapturing, setIsCapturing] = useState(false);
    const [actionLog, setActionLog] = useState('System ready. Tunnel connected.');

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

    const triggerSnapshot = () => {
        setIsCapturing(true);
        setActionLog(`Captured 48MP RAW frame from ${cameraFacing.toUpperCase()} sensor.`);
        setTimeout(() => {
            setIsCapturing(false);
            setSnapshotCount(prev => prev + 1);
        }, 400);
    };

    const triggerVibrationPulse = () => {
        setIsVibrating(true);
        setActionLog('Dispatched 3x 500ms haptic vibration sequence to endpoint.');
        setTimeout(() => setIsVibrating(false), 1200);
    };

    const toggleTorch = () => {
        const next = !isTorchOn;
        setIsTorchOn(next);
        setActionLog(`Hardware Flashlight toggled: ${next ? 'HIGH BEAM ON' : 'OFF'}.`);
    };

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-300 antialiased overflow-x-hidden">
            
            {/* Ambient Lighting Orbs */}
            <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-orange-500/12 via-amber-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed top-1/3 right-[-100px] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

            {/* 1. Ultra 3D Header Bar */}
            <header className="sticky top-0 z-50 px-4 sm:px-8 py-3 bg-[#0d0f14]/90 backdrop-blur-2xl border-b border-white/5">
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
                                Next-Gen Remote Matrix
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

            {/* 2. Hero Section: Clean, Bold & Attractive */}
            <main className="flex-1">
                <section className="pt-8 sm:pt-14 pb-8 sm:pb-12 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
                    
                    {/* Glowing Neumorphic Pill */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full uiverse-inset text-orange-400 text-xs font-mono font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
                        <span>LIVE HARDWARE TELEMETRY ONLINE</span>
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
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-1 max-w-md mx-auto">
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
                </section>

                {/* 3. Real Interactive Live Hardware Remote Terminal Showcase */}
                <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-16">
                    <div className="uiverse-card p-4 sm:p-7 space-y-5">
                        
                        {/* Terminal Header Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="uiverse-icon-convex w-11 h-11 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                                    <Smartphone size={22} />
                                </div>
                                <div>
                                    <div className="text-sm sm:text-base font-black text-white flex items-center gap-2 font-mono">
                                        <span>Galaxy S24 Ultra</span>
                                        <span className="text-[10px] text-emerald-400 font-bold px-2.5 py-0.5 rounded-full uiverse-inset">
                                            ● LIVE ONLINE
                                        </span>
                                    </div>
                                    <div className="text-xs text-zinc-400 font-mono mt-0.5">
                                        E2E AES-256 Tunnel • Battery: 94% ⚡
                                    </div>
                                </div>
                            </div>

                            {/* Status Indicator */}
                            <div className="flex items-center gap-2">
                                <div className="uiverse-inset px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-orange-400">
                                    14ms PING
                                </div>
                            </div>
                        </div>

                        {/* Top Module Navigation Bar (3D Convex Pills) */}
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
                                        onClick={() => {
                                            setActiveTool(tab.id as any);
                                            setActionLog(`Switched viewport to ${tab.label}.`);
                                        }}
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

                        {/* Interactive Inset Viewport Deck */}
                        <div className="uiverse-inset p-4 sm:p-6 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
                            
                            {/* Flash Animation on Snapshot */}
                            {isCapturing && (
                                <div className="absolute inset-0 bg-white/40 z-30 pointer-events-none transition-opacity duration-300" />
                            )}

                            {activeTool === 'camera' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold mb-1">
                                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                                <span>OPTICAL FEED: 1080P RAW ACTIVE</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Dual Lens Real-Time Viewfinder</h4>
                                        </div>

                                        {/* Lens Switcher */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const next = cameraFacing === 'rear' ? 'front' : 'rear';
                                                    setCameraFacing(next);
                                                    setActionLog(`Switched optical sensor to: ${next.toUpperCase()} CAMERA.`);
                                                }}
                                                className="uiverse-btn-convex px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <RefreshCw size={12} />
                                                <span>Lens: {cameraFacing.toUpperCase()}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Live Interactive Action Bar */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={triggerSnapshot}
                                            className="uiverse-btn-glow p-3 rounded-2xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Camera size={16} />
                                            <span>Capture Snapshot ({snapshotCount})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={toggleTorch}
                                            className={`uiverse-btn-convex p-3 rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                                                isTorchOn ? 'text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-zinc-400'
                                            }`}
                                        >
                                            <Flashlight size={16} className={isTorchOn ? 'text-amber-400' : ''} />
                                            <span>Torch: {isTorchOn ? 'HIGH BEAM ON ⚡' : 'OFF'}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={triggerVibrationPulse}
                                            className={`uiverse-btn-convex p-3 rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                                                isVibrating ? 'text-orange-300 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.4)] animate-bounce' : 'text-zinc-400'
                                            }`}
                                        >
                                            <Vibrate size={16} />
                                            <span>{isVibrating ? 'Pulsing Device...' : 'Send Haptic Pulse'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTool === 'mic' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold mb-1">
                                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                                <span>48KHZ STEREO LISTENING ACTIVE</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Ambient Microphone Interceptor</h4>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-purple-300 font-bold px-3 py-1 rounded-xl uiverse-inset">
                                                VoIP Bypassed
                                            </span>
                                        </div>
                                    </div>

                                    {/* Real Soundwave Bars */}
                                    <div className="flex items-center gap-1.5 h-10 px-3 rounded-2xl uiverse-inset overflow-hidden">
                                        {[45, 80, 60, 95, 30, 70, 100, 85, 40, 65, 90, 75, 50, 85, 95, 60, 40, 70, 90, 80, 55, 65, 100, 70].map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-gradient-to-t from-purple-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-200"
                                                style={{ height: isMicStreaming ? `${h}%` : '15%' }}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = !isMicStreaming;
                                                setIsMicStreaming(next);
                                                setActionLog(next ? 'Live Audio Stream resumed.' : 'Live Audio Stream paused.');
                                            }}
                                            className="uiverse-btn-convex w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer text-purple-300"
                                        >
                                            <Volume2 size={15} />
                                            <span>{isMicStreaming ? 'Pause Audio Stream' : 'Resume Audio Stream'}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="uiverse-btn-glow w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider cursor-pointer"
                                        >
                                            Open Audio Vault
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTool === 'vault' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <span>4,218 MEDIA FILES SYNCED & SECURED</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Full Gallery Vault & Export</h4>
                                        </div>

                                        <span className="text-xs font-mono text-emerald-400 font-bold px-3 py-1 rounded-xl uiverse-inset">
                                            100% EXIF Data
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {[
                                            { title: 'DCIM Photos', count: '2,842 files', size: '14.2 GB' },
                                            { title: '4K Videos', count: '184 files', size: '38.6 GB' },
                                            { title: 'WhatsApp Media', count: '1,120 files', size: '6.4 GB' },
                                            { title: 'Hidden Screenshots', count: '72 files', size: '420 MB' },
                                        ].map((cat, idx) => (
                                            <div key={idx} className="uiverse-card p-3 space-y-1">
                                                <div className="text-xs font-black text-white truncate">{cat.title}</div>
                                                <div className="text-[10px] font-mono text-emerald-400">{cat.count}</div>
                                                <div className="text-[9px] font-mono text-white/40">{cat.size}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGoogleSignIn}
                                        className="uiverse-btn-glow w-full py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Download size={14} />
                                        <span>Download Bulk ZIP Archive</span>
                                    </button>
                                </div>
                            )}

                            {activeTool === 'sms' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold mb-1">
                                                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                                                <span>SMS & OTP CAPTURE STREAM ACTIVE</span>
                                            </div>
                                            <h4 className="text-base sm:text-lg font-black text-white">Real-Time SMS & Chat Logs</h4>
                                        </div>

                                        <span className="text-xs font-mono text-rose-400 font-bold px-3 py-1 rounded-xl uiverse-inset">
                                            Live Relay
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            { from: 'Bank Verification', text: 'Your 2FA OTP code is 849201. Valid for 5 minutes.', time: 'Just now' },
                                            { from: '+1 (555) 382-9910', text: 'Package delivery has been confirmed at address.', time: '2m ago' },
                                        ].map((msg, idx) => (
                                            <div key={idx} className="uiverse-card p-3 flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-xs font-black text-white">{msg.from}</div>
                                                    <div className="text-[11px] text-zinc-300 truncate">{msg.text}</div>
                                                </div>
                                                <div className="text-[10px] font-mono text-rose-400 shrink-0">{msg.time}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGoogleSignIn}
                                        className="uiverse-btn-glow w-full py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider cursor-pointer"
                                    >
                                        View Full SMS History
                                    </button>
                                </div>
                            )}

                            {/* Live Action Output Bar */}
                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/50">
                                <div className="flex items-center gap-2 truncate">
                                    <Terminal size={13} className="text-orange-400 shrink-0" />
                                    <span className="text-zinc-300 truncate">{actionLog}</span>
                                </div>
                                <span className="text-emerald-400 font-bold hidden sm:inline shrink-0">RELAY OK</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Interactive Live Security & Stealth Switchboard */}
                <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-block px-3.5 py-1 rounded-full uiverse-inset text-[10px] font-mono font-black uppercase tracking-wider text-orange-400">
                            HARDWARE DEFENSE
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Stealth & Security Switchboard
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                            Toggle client stealth modes and background watchdog daemons in real-time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Stealth Switch 1 */}
                        <div className="uiverse-card p-5 sm:p-6 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <EyeOff size={18} className="text-emerald-400" />
                                    <h3 className="text-sm sm:text-base font-black text-white">100% Zero-Icon Cloaking</h3>
                                </div>
                                <p className="text-xs text-zinc-400">Hides the app launcher icon from the target home screen.</p>
                            </div>
                            
                            {/* Live Toggle Switch */}
                            <button
                                type="button"
                                onClick={() => {
                                    const next = !isStealthCloaked;
                                    setIsStealthCloaked(next);
                                    setActionLog(next ? 'Icon cloaking enabled: App is invisible.' : 'Icon cloaking disabled.');
                                }}
                                className="w-14 h-8 rounded-full uiverse-switch p-1 flex items-center cursor-pointer transition-colors shrink-0"
                            >
                                <div 
                                    className={`w-6 h-6 rounded-full transition-transform ${
                                        isStealthCloaked ? 'translate-x-6 uiverse-toggle-knob-active' : 'translate-x-0 uiverse-toggle-knob'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Stealth Switch 2 */}
                        <div className="uiverse-card p-5 sm:p-6 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Activity size={18} className="text-cyan-400" />
                                    <h3 className="text-sm sm:text-base font-black text-white">Watchdog Auto-Restart</h3>
                                </div>
                                <p className="text-xs text-zinc-400">Prevents OS battery task killers from ending background sync.</p>
                            </div>

                            <span className="px-3 py-1 rounded-full uiverse-inset text-xs font-mono font-bold text-cyan-400 shrink-0">
                                ACTIVE
                            </span>
                        </div>

                        {/* Stealth Switch 3 */}
                        <div className="uiverse-card p-5 sm:p-6 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Lock size={18} className="text-amber-400" />
                                    <h3 className="text-sm sm:text-base font-black text-white">AES-256 E2E Encryption</h3>
                                </div>
                                <p className="text-xs text-zinc-400">All payloads are encrypted with hardware keys in transit.</p>
                            </div>

                            <span className="px-3 py-1 rounded-full uiverse-inset text-xs font-mono font-bold text-amber-400 shrink-0">
                                SECURED
                            </span>
                        </div>

                        {/* Stealth Switch 4 */}
                        <div className="uiverse-card p-5 sm:p-6 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert size={18} className="text-purple-400" />
                                    <h3 className="text-sm sm:text-base font-black text-white">Zero Root Access</h3>
                                </div>
                                <p className="text-xs text-zinc-400">Runs smoothly on standard Android 7 through Android 15.</p>
                            </div>

                            <span className="px-3 py-1 rounded-full uiverse-inset text-xs font-mono font-bold text-purple-400 shrink-0">
                                COMPATIBLE
                            </span>
                        </div>
                    </div>
                </section>

                {/* 5. 3-Step Setup Flow (3D Convex Cards) */}
                <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Simple 3-Step Deployment
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                            Generate and pair endpoints in under 60 seconds.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
