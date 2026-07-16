'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import VideoModal from '@/components/VideoModal';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'signin' | 'quick'>('signin');
    const router = useRouter();

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
            setError('ACCESS DENIED: Invalid operator credentials or expired cryptographic token.');
        }
    };

    return (
        <main className="min-h-[100dvh] bg-[#050505] text-white font-sans selection:bg-[#FF2A2A] selection:text-white relative overflow-x-hidden">
            {/* Ambient CRT & Scanline Overlay */}
            <div 
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
                style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)`
                }}
            />

            {/* Glowing Cyber Orbs */}
            <div className="pointer-events-none absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#FF2A2A]/20 via-[#E11D48]/10 to-transparent blur-[130px]" />
            <div className="pointer-events-none absolute top-[45%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[#FF2A2A]/15 via-purple-900/10 to-transparent blur-[140px]" />
            <div className="pointer-events-none absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#FF2A2A]/10 to-transparent blur-[150px]" />

            {/* Floating Navigation Bar (Fluid Island Architecture) */}
            <nav className="fixed top-6 left-0 right-0 z-40 mx-auto max-w-6xl px-4">
                <div className="flex items-center justify-between rounded-full border border-white/10 bg-black/60 px-5 py-3 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
                    <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-[#FF2A2A]/40 bg-black shadow-[0_0_15px_rgba(255,42,42,0.4)]">
                            <Image 
                                src="/gallery-eye-logo.jpg" 
                                alt="Gallery Eye Emblem" 
                                fill 
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold tracking-tight text-white text-base">
                                    GALLERY EYE
                                </span>
                                <span className="rounded-full bg-[#FF2A2A]/20 px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-[#FF2A2A] border border-[#FF2A2A]/30">
                                    PRO v2.9
                                </span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                                ADVANCED DEVICE INTERCEPTION SUITE
                            </span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6 font-mono text-xs text-zinc-400">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>ENCRYPTION: AES-256-GCM</span>
                        </div>
                        <div className="h-3 w-px bg-white/15" />
                        <span>PROTOCOL: TLS 1.3</span>
                    </div>

                    <a 
                        href="#auth-portal"
                        className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF2A2A] to-[#DC2626] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,42,42,0.4)] transition-all hover:scale-105 active:scale-95"
                    >
                        <span>Launch Console</span>
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* Left Column: Macro Typography & Value Prop */}
                    <div className={`lg:col-span-7 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <div className="inline-flex items-center gap-2.5 rounded-full bg-[#FF2A2A]/10 border border-[#FF2A2A]/30 px-4 py-1.5 text-xs font-mono font-medium text-[#FF2A2A] mb-6 shadow-[0_0_25px_rgba(255,42,42,0.15)]">
                            <span className="h-2 w-2 rounded-full bg-[#FF2A2A] animate-ping" />
                            <span>CLASSIFIED TELEMETRY & MEDIA INTERCEPTION</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white mb-6">
                            TOTAL DEVICE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-[#FF2A2A]">
                                SURVEILLANCE.
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mb-10 font-normal">
                            Deploy high-stealth background monitoring across modern Android architectures. Extract media files, sync SMS logs, capture live camera snapshots, and track pinpoint GPS telemetry—all through a zero-footprint browser terminal.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-4 mb-14">
                            <a 
                                href="#auth-portal"
                                className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#FF2A2A] via-[#E11D48] to-[#BE123C] px-8 py-4 text-sm font-bold text-white shadow-[0_0_35px_rgba(255,42,42,0.45)] transition-all hover:shadow-[0_0_50px_rgba(255,42,42,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                            >
                                <span>ACCESS COMMAND NODE</span>
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/20 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </a>

                            <a 
                                href="#capabilities"
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-semibold text-zinc-300 backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
                            >
                                <span>Explore Capabilities</span>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                        </div>

                        {/* Telemetry Live Ticker Bar */}
                        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 font-mono text-xs text-zinc-400">
                            <div>
                                <div className="text-[#FF2A2A] font-bold text-sm sm:text-base mb-1">ZERO FOOTPRINT</div>
                                <div className="text-zinc-500">No App Launcher Icon</div>
                            </div>
                            <div>
                                <div className="text-white font-bold text-sm sm:text-base mb-1">&lt; 15ms HEARTBEAT</div>
                                <div className="text-zinc-500">Real-Time Sync Engine</div>
                            </div>
                            <div>
                                <div className="text-emerald-400 font-bold text-sm sm:text-base mb-1">PROGUARD SMALI</div>
                                <div className="text-zinc-500">Play Protect Bypass</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Emblem & Interactive Radar HUD Showcase */}
                    <div className={`lg:col-span-5 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        {/* Double-Bezel Hardware Enclosure */}
                        <div className="relative rounded-[2.5rem] bg-gradient-to-b from-white/15 to-white/5 p-2.5 shadow-[0_0_80px_rgba(255,42,42,0.22)] border border-white/10">
                            <div className="relative rounded-[calc(2.5rem-0.625rem)] bg-[#0A0A0A] p-6 sm:p-8 border border-white/10 overflow-hidden">
                                
                                {/* Background Radar Scan Ring */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                    <div className="w-[380px] h-[380px] rounded-full border border-[#FF2A2A]/40 animate-[spin_12s_linear_infinite] border-t-transparent border-l-transparent" />
                                    <div className="absolute w-[260px] h-[260px] rounded-full border border-white/20" />
                                    <div className="absolute w-[140px] h-[140px] rounded-full border border-[#FF2A2A]/30" />
                                </div>

                                {/* Header Bar */}
                                <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6 font-mono text-xs">
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <span className="h-2 w-2 rounded-full bg-[#FF2A2A]" />
                                        <span>SYSTEM_TARGET: ANDROID_ARM64</span>
                                    </div>
                                    <span className="text-[#FF2A2A] font-semibold bg-[#FF2A2A]/10 px-2.5 py-0.5 rounded border border-[#FF2A2A]/30">
                                        ACTIVE STREAM
                                    </span>
                                </div>

                                {/* Logo Emblem Showcase Centerpiece */}
                                <div className="relative my-6 flex flex-col items-center justify-center">
                                    <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-[#FF2A2A]/50 shadow-[0_0_50px_rgba(255,42,42,0.4)] group transition-transform duration-500 hover:scale-105">
                                        <Image 
                                            src="/gallery-eye-logo.jpg" 
                                            alt="Gallery Eye Spyware Emblem" 
                                            fill 
                                            className="object-cover"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-zinc-300">
                                            <span>HEXA-CORE SPYWARE</span>
                                            <span className="text-[#FF2A2A]">● LIVE</span>
                                        </div>
                                    </div>

                                    {/* HUD Crosshairs */}
                                    <div className="absolute -top-2 -left-2 text-[#FF2A2A] font-mono text-sm opacity-60">+</div>
                                    <div className="absolute -top-2 -right-2 text-[#FF2A2A] font-mono text-sm opacity-60">+</div>
                                    <div className="absolute -bottom-2 -left-2 text-[#FF2A2A] font-mono text-sm opacity-60">+</div>
                                    <div className="absolute -bottom-2 -right-2 text-[#FF2A2A] font-mono text-sm opacity-60">+</div>
                                </div>

                                {/* Terminal Simulated Output Box */}
                                <div className="mt-6 rounded-xl bg-black/80 border border-white/10 p-4 font-mono text-[11px] text-zinc-400 space-y-1.5 shadow-inner">
                                    <div className="flex items-center justify-between text-zinc-500 border-b border-white/5 pb-1 mb-2">
                                        <span>&gt; INTERCEPTION LOG</span>
                                        <span className="text-emerald-400">STATUS: CONNECTED</span>
                                    </div>
                                    <div className="text-zinc-300">
                                        <span className="text-[#FF2A2A] font-bold">[SYS]</span> Handshake verified with node com.gallery.eye
                                    </div>
                                    <div>
                                        <span className="text-emerald-400 font-bold">[SYNC]</span> Batch caching 482 gallery files (14.2 MB/s)
                                    </div>
                                    <div>
                                        <span className="text-cyan-400 font-bold">[SMS]</span> Incremental sync complete (0 duplicates)
                                    </div>
                                    <div className="text-zinc-500 flex items-center gap-1">
                                        <span>&gt; Waiting for remote operator input</span>
                                        <span className="inline-block w-1.5 h-3 bg-[#FF2A2A] animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Asymmetrical Bento Grid: Capabilities Section */}
            <section id="capabilities" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                        TACTICAL TELEMETRY <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A2A] via-rose-500 to-amber-500">
                            ENGINEERED FOR STEALTH.
                        </span>
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg">
                        Designed for precision security and complete monitoring control without triggering host device alerts or visual disruption.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Card 1: Remote Gallery & Media Sync (col-span-7) */}
                    <div className="md:col-span-7 relative rounded-[2rem] bg-gradient-to-b from-white/10 to-white/5 p-2 border border-white/10 shadow-lg group">
                        <div className="h-full rounded-[calc(2rem-0.5rem)] bg-[#0A0A0A] p-8 flex flex-col justify-between border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF2A2A]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#FF2A2A]/20 transition-all duration-500" />
                            
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-zinc-300 mb-6">
                                    <svg className="w-3.5 h-3.5 text-[#FF2A2A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>MEDIA ENGINE</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                                    Instant Gallery & Folder Interception
                                </h3>
                                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-lg">
                                    Extract DCIM, WhatsApp Media, Screen Recordings, and hidden directories with zero-latency batch processing and offline persistence.
                                </p>
                            </div>

                            {/* UI Mock inside Card */}
                            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {['Camera DCIM', 'WhatsApp', 'ScreenRec', 'Downloads'].map((folder, idx) => (
                                    <div key={folder} className="rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col justify-between h-24 hover:border-[#FF2A2A]/50 transition-colors">
                                        <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                                            <span>DIR_0{idx + 1}</span>
                                            <span className="text-[#FF2A2A]">●</span>
                                        </div>
                                        <div className="font-semibold text-white text-xs truncate">{folder}</div>
                                        <div className="text-[10px] font-mono text-zinc-500">{120 + idx * 45} FILES</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Stealth APK Forge (col-span-5) */}
                    <div className="md:col-span-5 relative rounded-[2rem] bg-gradient-to-b from-white/10 to-white/5 p-2 border border-white/10 shadow-lg group">
                        <div className="h-full rounded-[calc(2rem-0.5rem)] bg-[#0A0A0A] p-8 flex flex-col justify-between border border-white/5 relative overflow-hidden">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-zinc-300 mb-6">
                                    <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>APK FORGE</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                                    Icon Camouflage & ProGuard Bypass
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Disguise the client payload as legitimate utilities (Temp Mail, Poki Games, Movie Box) with automated Play Protect scan evasion.
                                </p>
                            </div>

                            <div className="mt-8 space-y-3 font-mono text-xs">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                    <span className="text-zinc-300">Obfuscation Engine</span>
                                    <span className="text-emerald-400 font-bold">ACTIVE (PROGUARD)</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                    <span className="text-zinc-300">Launcher Icon</span>
                                    <span className="text-[#FF2A2A] font-bold">HIDDEN / CAMOUFLAGED</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Live SMS & Contacts Intercept (col-span-5) */}
                    <div className="md:col-span-5 relative rounded-[2rem] bg-gradient-to-b from-white/10 to-white/5 p-2 border border-white/10 shadow-lg group">
                        <div className="h-full rounded-[calc(2rem-0.5rem)] bg-[#0A0A0A] p-8 flex flex-col justify-between border border-white/5 relative overflow-hidden">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-zinc-300 mb-6">
                                    <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>COMMUNICATIONS</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                                    SMS, Contacts & Live Voice Intercept
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Batch query optimized to eliminate Android ANR dialogues while syncing thousands of phone numbers and messages instantly.
                                </p>
                            </div>

                            <div className="mt-8 flex items-center gap-4 text-xs font-mono">
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                                    <div className="text-zinc-400 mb-1">SMS CACHE</div>
                                    <div className="text-white font-bold text-base">INSTANT</div>
                                </div>
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                                    <div className="text-zinc-400 mb-1">CONTACTS</div>
                                    <div className="text-white font-bold text-base">BATCHED</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Multi-Node Grid & Fast Heartbeat (col-span-7) */}
                    <div className="md:col-span-7 relative rounded-[2rem] bg-gradient-to-b from-white/10 to-white/5 p-2 border border-white/10 shadow-lg group">
                        <div className="h-full rounded-[calc(2rem-0.5rem)] bg-[#0A0A0A] p-8 flex flex-col justify-between border border-white/5 relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
                            
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-zinc-300 mb-6">
                                    <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>HEARTBEAT TELEMETRY</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                                    SHA-256 Fingerprint & ~15s Offline Detection
                                </h3>
                                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-lg">
                                    Stable hardware fingerprinting prevents duplicate device nodes on reinstall, while ultra-fast keep-alive ping intervals detect offline states precisely.
                                </p>
                            </div>

                            <div className="mt-8 rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                                    <div>
                                        <div className="text-white font-semibold">PING INTERVAL: 8,000ms</div>
                                        <div className="text-zinc-500 text-[11px]">TIMEOUT: 12,000ms</div>
                                    </div>
                                </div>
                                <div className="text-[#FF2A2A] bg-[#FF2A2A]/10 px-3 py-1 rounded border border-[#FF2A2A]/30">
                                    PRECISION HEARTBEAT
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* THE COMMAND PORTAL (Authentication & Login Card) */}
            <section id="auth-portal" className="py-24 relative max-w-4xl mx-auto px-4 sm:px-6">
                <div className="relative rounded-[2.5rem] bg-gradient-to-b from-white/15 via-white/10 to-transparent p-2 shadow-[0_0_100px_rgba(255,42,42,0.25)] border border-white/15">
                    <div className="rounded-[calc(2.5rem-0.5rem)] bg-[#0A0A0A] p-8 sm:p-12 border border-white/10 relative overflow-hidden">
                        
                        {/* Background subtle cyber rings inside portal */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#FF2A2A]/15 blur-[90px] pointer-events-none" />

                        {/* Top Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8 font-mono">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-[#FF2A2A] animate-pulse" />
                                <span className="text-xs uppercase tracking-widest text-zinc-300 font-bold">
                                    AUTHENTICATION NODE
                                </span>
                            </div>
                            <span className="text-xs text-zinc-500">
                                ACCESS LEVEL: OPERATOR MASTER
                            </span>
                        </div>

                        <div className="max-w-md mx-auto">
                            <div className="text-center mb-8">
                                <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden border border-[#FF2A2A]/40 shadow-[0_0_25px_rgba(255,42,42,0.4)] mb-4 relative">
                                    <Image src="/gallery-eye-logo.jpg" alt="Logo" fill className="object-cover" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                                    Connect Command Console
                                </h2>
                                <p className="text-zinc-400 text-sm">
                                    Verify credentials to initialize real-time device telemetry
                                </p>
                            </div>

                            {/* Google Sign In CTA (Primary Fast Access) */}
                            <button
                                onClick={() => signIn('google', { callbackUrl: '/' })}
                                type="button"
                                className="group w-full flex items-center justify-center gap-3 bg-white text-zinc-950 font-sans font-bold text-sm px-6 py-4 rounded-2xl shadow-[0_4px_25px_rgba(255,255,255,0.2)] hover:bg-zinc-100 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] mb-6"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>INITIALIZE WITH GOOGLE SSO</span>
                                <div className="ml-auto w-7 h-7 rounded-full bg-black/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                                    <svg className="w-3.5 h-3.5 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
                                    OR OPERATOR CREDENTIALS
                                </span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider mb-2">
                                        Operator Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        className="w-full rounded-xl bg-black/80 border border-white/15 px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:border-[#FF2A2A] focus:outline-none focus:ring-1 focus:ring-[#FF2A2A] transition-all font-mono"
                                        placeholder="operator@command.node"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider mb-2">
                                        Cryptographic Key (Password)
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                        className="w-full rounded-xl bg-black/80 border border-white/15 px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:border-[#FF2A2A] focus:outline-none focus:ring-1 focus:ring-[#FF2A2A] transition-all font-mono"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>

                                {/* Error Banner */}
                                {error && (
                                    <div className="rounded-xl bg-[#FF2A2A]/10 border border-[#FF2A2A]/40 p-3.5 flex items-start gap-3 font-mono text-xs text-rose-300">
                                        <svg className="w-4 h-4 text-[#FF2A2A] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group w-full rounded-2xl bg-gradient-to-r from-[#FF2A2A] via-[#E11D48] to-[#BE123C] px-6 py-4 text-sm font-bold tracking-wider uppercase text-white shadow-[0_0_30px_rgba(255,42,42,0.4)] transition-all hover:shadow-[0_0_45px_rgba(255,42,42,0.6)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            <span className="font-mono">VERIFYING HANDSHAKE...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>CONNECT TO TERMINAL</span>
                                            <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Tutorial Modal briefing */}
                        <div className="mt-10 pt-8 border-t border-white/10 text-center">
                            <p className="text-zinc-400 font-mono text-xs mb-3">
                                FIRST-TIME DEPLOYMENT? BRIEFING REQUIRED
                            </p>
                            <VideoModal videoId="0xQaikNVyn0" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Telemetry & Copyright Strip */}
            <footer className="border-t border-white/10 py-8 px-4 bg-black/80 font-mono text-xs text-zinc-500">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-[#FF2A2A]" />
                        <span>GALLERY EYE TELEMETRY NODE v2.9.3</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span>AES-256-GCM TLS 1.3</span>
                        <span>HEXA-CORE ENGINE</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
