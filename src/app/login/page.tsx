'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import VideoModal from '@/components/VideoModal';

// --- Lightweight Interactive Canvas Background for 60FPS Performance ---
function CyberCanvasBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // Particle nodes representing remote devices/telemetry streams
        const particleCount = Math.min(Math.floor((width * height) / 22000), 50);
        const particles: { x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number }[] = [];
        const colors = ['#ff183e', '#ff3b5c', '#00f2ff', '#10b981'];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                radius: Math.random() * 2 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.6 + 0.2
            });
        }

        let mouseX = width / 2;
        let mouseY = height / 2;
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Subtle cyber grid lines
            ctx.strokeStyle = 'rgba(255, 24, 62, 0.035)';
            ctx.lineWidth = 1;
            const gridSize = 60;
            const offsetX = (Date.now() * 0.01) % gridSize;
            const offsetY = (Date.now() * 0.01) % gridSize;

            for (let x = offsetX; x < width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = offsetY; y < height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw and update particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Mouse interaction distance
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    p.x -= (dx / dist) * 0.5;
                    p.y -= (dy / dist) * 0.5;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();

                // Draw connecting lines between nearby nodes
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const pdx = p.x - p2.x;
                    const pdy = p.y - p2.y;
                    const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
                    if (pDist < 130) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = p.color;
                        ctx.globalAlpha = (1 - pDist / 130) * 0.25;
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.85 }}
        />
    );
}

// --- Simulated Live Interception Terminal ---
interface TelemetryLog {
    type: string;
    msg: string;
    color: string;
    time?: string;
}

const SIMULATED_TELEMETRY: TelemetryLog[] = [
    { type: 'INTERCEPT', msg: 'Encrypted payload exfiltrated from node [Target_S24_Ultra]', color: '#00f2ff' },
    { type: 'BYPASS', msg: 'Google Play Protect heuristic scan evaded (SHA-256 fingerprinting)', color: '#10b981' },
    { type: 'GPS_LOCK', msg: 'Real-time telemetry coordinates: 37.7749° N, 122.4194° W', color: '#ff3b5c' },
    { type: 'MEDIA_SYNC', msg: 'Silent dual-camera frame capture completed in background', color: '#a855f7' },
    { type: 'SMS_TAP', msg: 'Live OTP verification code intercepted from SMS daemon', color: '#f59e0b' },
    { type: 'AUDIO_STREAM', msg: 'Ambient microphone audio stream active (128kbps OPUS)', color: '#00f2ff' }
];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Hero 3D Tilt Ref
    const heroCardRef = useRef<HTMLDivElement>(null);
    // Login section scroll target for mobile
    const loginSectionRef = useRef<HTMLDivElement>(null);

    // Simulated terminal logs
    const [logs, setLogs] = useState<TelemetryLog[]>(SIMULATED_TELEMETRY.slice(0, 3));
    const [isStreamPaused, setIsStreamPaused] = useState(false);

    // Feature preview switcher
    const [activeTab, setActiveTab] = useState<'grid' | 'radar' | 'apk'>('grid');

    useEffect(() => {
        setMounted(true);

        const interval = setInterval(() => {
            if (isStreamPaused) return;
            const randomEntry = SIMULATED_TELEMETRY[Math.floor(Math.random() * SIMULATED_TELEMETRY.length)];
            const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
            setLogs(prev => [{ ...randomEntry, time: timeStr }, ...prev.slice(0, 5)]);
        }, 3500);

        return () => clearInterval(interval);
    }, [isStreamPaused]);

    const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!heroCardRef.current) return;
        const rect = heroCardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = (y / (rect.height / 2)) * -10;
        const rotateY = (x / (rect.width / 2)) * 10;
        heroCardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleTiltLeave = () => {
        if (!heroCardRef.current) return;
        heroCardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };

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
            setError('ACCESS DENIED: Invalid credentials or expired terminal session.');
        }
    };

    const scrollToLogin = () => {
        loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const previewTabs = {
        grid: {
            title: 'Interception Grid',
            subtitle: 'Real-time multi-device gallery and media synchronization',
            img: '/cyber_grid.png',
            badge: 'LIVE EXFILTRATION'
        },
        radar: {
            title: 'Surveillance Radar',
            subtitle: 'Real-time telemetry, location tracking & connection monitoring',
            img: '/cyber_radar.png',
            badge: 'GPS & TELEMETRY'
        },
        apk: {
            title: 'Stealth APK Forge',
            subtitle: 'Custom payload generator with camouflage app icons & services',
            img: '/cyber_apk.png',
            badge: 'PAYLOAD BUILDER'
        }
    };

    return (
        <main className="min-h-[100dvh] bg-[#05060a] text-white overflow-x-hidden relative font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#ff183e] selection:text-white">
            {/* Interactive Particle & Grid Canvas */}
            <CyberCanvasBackground />

            {/* Ambient Cyber Glow Orbs */}
            <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,24,62,0.14)_0%,transparent_70%)] blur-[90px] pointer-events-none z-0" />
            <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,242,255,0.08)_0%,transparent_70%)] blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-[5%] left-[20%] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(255,59,92,0.10)_0%,transparent_70%)] blur-[80px] pointer-events-none z-0" />

            {/* Top Navigation Bar */}
            <nav className="relative z-20 border-b border-white/[0.08] bg-[#05060a]/80 backdrop-blur-xl sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff183e] to-[#990a21] p-[1px] shadow-[0_0_20px_rgba(255,24,62,0.4)] flex items-center justify-center">
                            <div className="w-full h-full rounded-[11px] bg-[#0b0e17] flex items-center justify-center">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#ff183e] animate-ping" />
                            </div>
                        </div>
                        <div>
                            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-white/90 to-[#ff3b5c] bg-clip-text text-transparent">
                                GALLERY EYE
                            </span>
                            <span className="hidden sm:inline-block ml-2.5 px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest text-[#ff183e] bg-[#ff183e]/10 border border-[#ff183e]/30 rounded">
                                ANDROID SPYWARE v4.2
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white/70">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            SURVEILLANCE DAEMON: ACTIVE
                        </div>
                        <button
                            onClick={scrollToLogin}
                            className="px-4 py-2 rounded-xl bg-[#ff183e] hover:bg-[#ff2b4e] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-[0_0_25px_rgba(255,24,62,0.4)] hover:shadow-[0_0_35px_rgba(255,24,62,0.6)] hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Terminal Login →
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Hero & Command Center */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Column: Surveillance Showcase & App Intro */}
                    <div className={`lg:col-span-7 space-y-8 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
                        {/* Status Pill */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#ff183e]/10 border border-[#ff183e]/30 shadow-[0_0_20px_rgba(255,24,62,0.15)]">
                            <span className="w-2 h-2 rounded-full bg-[#ff183e] animate-ping" />
                            <span className="text-xs font-mono font-semibold text-[#ff3b5c] tracking-widest uppercase">
                                UNDETECTABLE REMOTE INTERCEPTION SUITE
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                            Complete Android <br />
                            <span className="bg-gradient-to-r from-[#ff183e] via-[#ff4d6d] to-[#00f2ff] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,24,62,0.3)]">
                                Surveillance Domination.
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed font-normal">
                            Connect to any Android device remotely from your web browser. Intercept gallery media, live camera streams, microphone audio, SMS messages, and exact telemetry with zero battery drain and complete Google Play Protect evasion.
                        </p>

                        {/* Interactive Hero 3D Logo Showcase Card */}
                        <div
                            ref={heroCardRef}
                            onMouseMove={handleTiltMove}
                            onMouseLeave={handleTiltLeave}
                            style={{ transition: 'transform 0.15s ease-out' }}
                            className="relative group rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-1 border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
                        >
                            {/* Scanning Laser Animation */}
                            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff183e] to-transparent shadow-[0_0_15px_#ff183e] animate-[scan_4s_ease-in-out_infinite] z-20 pointer-events-none" />

                            <div className="relative rounded-[22px] bg-[#090b12] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                                {/* Attached Logo Display with Glowing Halo */}
                                <div className="relative flex-shrink-0 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-[#05060a] border border-[#ff183e]/40 shadow-[0_0_30px_rgba(255,24,62,0.3)] group-hover:shadow-[0_0_50px_rgba(255,24,62,0.5)] transition-all">
                                    <img
                                        src="/gallery-eye-logo.jpg"
                                        alt="Gallery Eye Android Spyware Emblem"
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                </div>

                                {/* Logo Info & Live Metrics */}
                                <div className="flex-1 text-center sm:text-left space-y-3">
                                    <div className="inline-block px-2.5 py-0.5 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[11px] font-mono font-bold text-[#00f2ff]">
                                        EMBLEM VERIFIED // PROTOCOL ACTIVE
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#ff3b5c] transition-colors">
                                        Gallery Eye Spyware Core
                                    </h3>
                                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                                        Engineered for high-reliability stealth exfiltration. Features real-time WebSocket connection tunnels and SHA-256 hardware device deduplication.
                                    </p>
                                    <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-white/50 justify-center sm:justify-start">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            PING: 8ms
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff]" />
                                            ENCRYPTION: AES-256
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff183e]" />
                                            STEALTH: 100%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Telemetry Terminal Widget */}
                        <div className="rounded-2xl bg-[#090b12] border border-white/[0.08] overflow-hidden shadow-2xl">
                            <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                    <span className="ml-2 text-xs font-mono text-white/60">live_intercept_stream.log</span>
                                </div>
                                <button
                                    onClick={() => setIsStreamPaused(!isStreamPaused)}
                                    className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-mono text-white/70 transition-colors"
                                >
                                    {isStreamPaused ? '▶ RESUME' : '■ PAUSE'}
                                </button>
                            </div>
                            <div className="p-4 space-y-2.5 font-mono text-xs max-h-44 overflow-y-auto">
                                {logs.map((log, index) => (
                                    <div key={index} className="flex items-start gap-3 animate-fadeIn">
                                        <span className="text-white/40 flex-shrink-0">[{log.time || 'LIVE'}]</span>
                                        <span
                                            className="font-bold flex-shrink-0 px-1.5 py-0.2 rounded text-[10px]"
                                            style={{ backgroundColor: `${log.color}15`, color: log.color, border: `1px solid ${log.color}30` }}
                                        >
                                            {log.type}
                                        </span>
                                        <span className="text-white/80 break-all">{log.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Embedded Cyber Command Login Portal */}
                    <div ref={loginSectionRef} className="lg:col-span-5 w-full">
                        <div className="relative rounded-3xl bg-gradient-to-b from-[#131722]/90 to-[#0a0d14]/90 p-6 sm:p-8 border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                            
                            {/* Decorative Cyber Corner Accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#ff183e] rounded-tl-3xl pointer-events-none" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#ff183e] rounded-tr-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ff183e] rounded-bl-3xl pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ff183e] rounded-br-3xl pointer-events-none" />

                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff183e]/10 border border-[#ff183e]/30 text-[#ff3b5c] text-xs font-mono font-bold mb-3">
                                    <span className="w-2 h-2 rounded-full bg-[#ff183e] animate-pulse" />
                                    TERMINAL ACCESS PORTAL
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                    Operator Authentication
                                </h2>
                                <p className="text-xs sm:text-sm text-white/50 mt-1.5 font-normal">
                                    Enter authorized credentials or proceed with encrypted Google SSO
                                </p>
                            </div>

                            {/* Google Sign-In */}
                            <button
                                onClick={() => signIn('google', { callbackUrl: '/' })}
                                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white hover:bg-white/90 text-[#0b0e17] font-bold text-sm sm:text-base transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:-translate-y-0.5 active:translate-y-0 mb-6 cursor-pointer"
                            >
                                <GoogleIcon />
                                Continue with Google SSO
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 h-px bg-white/[0.08]" />
                                <span className="text-xs font-mono text-white/40 uppercase tracking-widest">or encrypted credentials</span>
                                <div className="flex-1 h-px bg-white/[0.08]" />
                            </div>

                            {/* Credentials Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                                        Terminal Operator Email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                            placeholder="operator@surveillance.net"
                                            required
                                            className="w-full rounded-xl bg-[#06080e] border border-white/[0.12] focus:border-[#ff183e] focus:ring-2 focus:ring-[#ff183e]/30 px-4 py-3 text-sm text-white placeholder-white/30 transition-all outline-none"
                                        />
                                        <div className="absolute right-3.5 top-3.5 text-white/30 font-mono text-xs">
                                            [ID]
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-mono font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                                        Decryption Passkey
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                            placeholder="••••••••••••"
                                            required
                                            className="w-full rounded-xl bg-[#06080e] border border-white/[0.12] focus:border-[#ff183e] focus:ring-2 focus:ring-[#ff183e]/30 px-4 py-3 text-sm text-white placeholder-white/30 transition-all outline-none"
                                        />
                                        <div className="absolute right-3.5 top-3.5 text-white/30 font-mono text-xs">
                                            [KEY]
                                        </div>
                                    </div>
                                </div>

                                {/* Error Display */}
                                {error && (
                                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 flex items-start gap-3 text-red-400 text-xs font-mono animate-shake">
                                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#ff183e] to-[#d10024] hover:from-[#ff2b4e] hover:to-[#e60028] text-white font-extrabold text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(255,24,62,0.4)] hover:shadow-[0_0_35px_rgba(255,24,62,0.6)] flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            ESTABLISHING HANDSHAKE…
                                        </>
                                    ) : (
                                        <>
                                            <span>INITIALIZE TERMINAL</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Tutorial Video Link */}
                            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
                                <p className="text-xs text-white/50 mb-3 font-medium">
                                    Need protocol onboarding instructions?
                                </p>
                                <VideoModal videoId="0xQaikNVyn0" label="Watch Surveillance Deployment Guide" />
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* --- Interactive Feature Preview & Visual Showcase Section --- */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.08]">
                <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-xs font-mono font-bold text-[#00f2ff] uppercase tracking-wider">
                        LIVE TELEMETRY ARCHITECTURE
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                        Visualizing Total Control
                    </h2>
                    <p className="text-sm sm:text-base text-white/60">
                        Examine our real-time interception grid, live radar mapping, and custom stealth payload generator below.
                    </p>

                    {/* Tab Buttons */}
                    <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                        {(['grid', 'radar', 'apk'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                                    activeTab === tab
                                        ? 'bg-[#ff183e] text-white shadow-[0_0_20px_rgba(255,24,62,0.4)] border border-[#ff183e]'
                                        : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] border border-white/[0.08]'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${activeTab === tab ? 'bg-white animate-ping' : 'bg-white/40'}`} />
                                {previewTabs[tab].title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Preview Box */}
                <div className="rounded-3xl bg-[#090b12] border border-white/[0.12] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
                    {/* Glowing Header Bar inside box */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/[0.08] gap-2">
                        <div>
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff183e]/20 text-[#ff3b5c] mr-2">
                                {previewTabs[activeTab].badge}
                            </span>
                            <span className="text-sm sm:text-base font-bold text-white">
                                {previewTabs[activeTab].subtitle}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            LIVE FEED SYNCHRONIZED
                        </div>
                    </div>

                    {/* Preview Image Frame */}
                    <div className="relative rounded-2xl overflow-hidden bg-[#05060a] border border-white/[0.08] aspect-video sm:aspect-[21/9] flex items-center justify-center group">
                        <img
                            src={previewTabs[activeTab].img}
                            alt={previewTabs[activeTab].title}
                            className="w-full h-full object-cover sm:object-contain transform group-hover:scale-[1.01] transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090b12] via-transparent to-transparent opacity-40 pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* --- 4 Core Spyware Pillars Bento Grid --- */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-6 hover:border-[#ff183e]/40 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-[#ff183e]/15 border border-[#ff183e]/30 flex items-center justify-center text-[#ff3b5c] mb-5 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Silent Media Tap</h3>
                        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                            Intercept front and rear camera snapshots silently. Live gallery sync and high-fidelity ambient microphone recording (`/voice`) in real time.
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-6 hover:border-[#00f2ff]/40 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-[#00f2ff]/15 border border-[#00f2ff]/30 flex items-center justify-center text-[#00f2ff] mb-5 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Exfiltration & OTPs</h3>
                        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                            Full SMS inbox cloning with instant verification OTP interception. Live contact directory sync and notification mirroring without alerts.
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-6 hover:border-emerald-500/40 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Stealth Camouflage</h3>
                        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                            Generate disguised APKs (`Temp Mail`, `Poki Games`, `Movie Box`). Operates as a background system service (`Google Play checking for updates`).
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-6 hover:border-purple-500/40 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Zero-Latency C2</h3>
                        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                            SHA-256 hardware deduplication ensures robust device identity. ~15s instant offline detection (`pingTimeout`) and encrypted WebSocket command tunnel.
                        </p>
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/[0.08] py-8 text-center text-xs font-mono text-white/40">
                <p>GALLERY EYE SURVEILLANCE SUITE // RESTRICTED OPERATOR ACCESS ONLY</p>
                <p className="mt-1 text-white/20">&copy; {new Date().getFullYear()} Gallery Eye Systems. All rights reserved.</p>
            </footer>

            {/* Sticky Mobile Bottom Bar for Quick Login Access */}
            <div className="fixed bottom-4 left-4 right-4 z-50 sm:hidden">
                <button
                    onClick={scrollToLogin}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#ff183e] to-[#c90022] text-white font-extrabold text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(255,24,62,0.6)] border border-white/20 flex items-center justify-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    Open Terminal Login →
                </button>
            </div>
        </main>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}
