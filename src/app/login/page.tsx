"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import VideoModal from "@/components/VideoModal";
import CyberMatrixCanvas from "@/components/CyberMatrixCanvas";
import CyberTerminalSimulator from "@/components/CyberTerminalSimulator";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const [authTab, setAuthTab] = useState<"google" | "credentials">("google");
    const [radarTilt, setRadarTilt] = useState({ rotateX: 0, rotateY: 0 });
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        setIsLoading(false);
        if (result?.ok) {
            router.push("/");
        } else {
            setError("Operator clearance denied: Invalid credentials or unauthorized token.");
        }
    };

    const handleRadarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setRadarTilt({
            rotateX: -(y / rect.height) * 18,
            rotateY: (x / rect.width) * 18
        });
    };

    const handleRadarMouseLeave = () => {
        setRadarTilt({ rotateX: 0, rotateY: 0 });
    };

    return (
        <main className="min-h-[100dvh] relative text-white selection:bg-red-600 selection:text-white font-sans overflow-x-hidden" style={{ background: "#0a0a0c" }}>
            {/* 1. 3D Interactive Matrix Background */}
            <CyberMatrixCanvas />

            {/* Ambient Lighting Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-600/15 blur-[130px] pointer-events-none z-0 animate-pulse-glow" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none z-0" />
            <div className="fixed top-[40%] right-[20%] w-[350px] h-[350px] rounded-full bg-red-500/10 blur-[100px] pointer-events-none z-0" />

            {/* 2. Top Navigation Bar */}
            <header className="relative z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Logo & Brand Identity */}
                    <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.35)] group-hover:scale-105 transition-transform flex items-center justify-center bg-black">
                            <img src="/gallery-eye-logo.jpg" alt="Gallery Eye Spyware Logo" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent pointer-events-none" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-mono uppercase drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
                                    GALLERY <span className="text-red-500">EYE</span>
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 uppercase">
                                    SPYWARE v4.9
                                </span>
                            </div>
                            <span className="text-[11px] text-zinc-400 font-mono tracking-wider uppercase">
                                COVERT ANDROID SURVEILLANCE SUITE
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links (Desktop) */}
                    <nav className="hidden lg:flex items-center gap-8 font-mono text-xs tracking-wider text-zinc-400">
                        <a href="#capabilities" className="hover:text-red-400 transition-colors py-1 relative group">
                            [ CAPABILITIES ]
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-red-500 transition-all group-hover:w-full" />
                        </a>
                        <a href="#live-intercept" className="hover:text-emerald-400 transition-colors py-1 relative group">
                            [ LIVE INTERCEPT ]
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-500 transition-all group-hover:w-full" />
                        </a>
                        <a href="#operator-tiers" className="hover:text-red-400 transition-colors py-1 relative group">
                            [ OPERATOR TIERS ]
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-red-500 transition-all group-hover:w-full" />
                        </a>
                        <a href="#radar-grid" className="hover:text-cyan-400 transition-colors py-1 relative group">
                            [ RADAR GRID ]
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-500 transition-all group-hover:w-full" />
                        </a>
                    </nav>

                    {/* Status Pill & Access CTA */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>PROTOCOL: ONLINE</span>
                        </div>
                        <a
                            href="#operator-portal"
                            className="cyber-button-red px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg hover:shadow-red-500/40"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            ACCESS PORTAL
                        </a>
                    </div>
                </div>
            </header>

            {/* 3. Hero Deck & Operator Login Terminal */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* Left Column: Cyber Command Presentation */}
                    <div className={`lg:col-span-7 space-y-6 ${mounted ? "animate-slideUp" : "opacity-0"}`}>
                        
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 font-mono text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <span>COVERT SURVEILLANCE PROTOCOL // CLASSIFIED</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
                            THE NEXT GENERATION OF <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-emerald-400 drop-shadow-[0_4px_15px_rgba(239,68,68,0.4)]">
                                UNDETECTABLE ANDROID
                            </span> <br />
                            SURVEILLANCE & SYNC.
                        </h1>

                        <p className="text-base sm:text-lg text-zinc-300 max-w-2xl font-normal leading-relaxed">
                            Deploy custom stealth APKs right from your browser. Extract real-time camera captures, high-res gallery media, live SMS streams, and batched contacts without triggering Play Protect or system notifications.
                        </p>

                        {/* Feature Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2 max-w-2xl">
                            <div className="cyber-card p-3 rounded-xl flex items-center gap-3 border border-red-500/20 bg-black/50">
                                <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white font-mono">REMOTE EYE</span>
                                    <span className="text-[11px] text-zinc-400">Live Camera & Mic</span>
                                </div>
                            </div>

                            <div className="cyber-card p-3 rounded-xl flex items-center gap-3 border border-emerald-500/20 bg-black/50">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white font-mono">SILENT EXFIL</span>
                                    <span className="text-[11px] text-zinc-400">R2 Cloud Storage</span>
                                </div>
                            </div>

                            <div className="cyber-card p-3 rounded-xl flex items-center gap-3 border border-purple-500/20 bg-black/50 col-span-2 sm:col-span-1">
                                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white font-mono">PLAY PROTECT</span>
                                    <span className="text-[11px] text-zinc-400">100% Bypass Built</span>
                                </div>
                            </div>
                        </div>

                        {/* Video Tutorial CTA & Action buttons */}
                        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-xl">
                            <a
                                href="#operator-portal"
                                className="cyber-button-red py-3.5 px-6 rounded-xl font-mono font-bold text-sm tracking-wider uppercase text-center flex items-center justify-center gap-2"
                            >
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                LAUNCH OPERATOR CONSOLE
                            </a>
                            <div className="flex-1">
                                <VideoModal videoId="0xQaikNVyn0" label="WATCH COVERT DEMO VIDEO" variant="button" />
                            </div>
                        </div>

                        {/* Key Specs Row */}
                        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400 max-w-xl">
                            <div className="flex items-center gap-1.5">
                                <span className="text-red-400 font-bold">15s</span> FAST OFFLINE DETECT
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-emerald-400 font-bold">SHA-256</span> DEDUPLICATION
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-cyan-400 font-bold">E2EE</span> WSS ENCRYPTED
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Embedded Operator Login Deck */}
                    <div id="operator-portal" className={`lg:col-span-5 ${mounted ? "animate-slideUp" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
                        <div className="cyber-card rounded-3xl p-6 sm:p-8 border border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.2)] bg-black/90 relative">
                            
                            {/* Scanning laser animation line */}
                            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 animate-scan pointer-events-none" />

                            {/* Card Header with Logo */}
                            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-red-500/40 bg-black flex items-center justify-center">
                                        <img src="/gallery-eye-logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h2 className="font-mono font-bold text-base text-white uppercase tracking-wider">
                                            OPERATOR ACCESS
                                        </h2>
                                        <p className="text-xs font-mono text-red-400">
                                            BIOMETRIC / TOKEN CLEARANCE
                                        </p>
                                    </div>
                                </div>
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                            </div>

                            {/* Tab toggles */}
                            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10 mb-6">
                                <button
                                    onClick={() => { setAuthTab("google"); setError(""); }}
                                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                                        authTab === "google"
                                            ? "bg-red-600 text-white shadow-lg"
                                            : "text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    [ GOOGLE OAUTH ]
                                </button>
                                <button
                                    onClick={() => { setAuthTab("credentials"); setError(""); }}
                                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                                        authTab === "credentials"
                                            ? "bg-red-600 text-white shadow-lg"
                                            : "text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    [ CREDENTIALS ]
                                </button>
                            </div>

                            {/* Auth Form / Content */}
                            {authTab === "google" ? (
                                <div className="space-y-5 py-2">
                                    <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-xs text-zinc-300 font-mono leading-relaxed">
                                        <span className="text-red-400 font-bold">SECURE NOTICE:</span> Google OAuth provides instant encrypted session token issuance. Your operator identity is linked to your Cloudflare R2 bucket partition.
                                    </div>

                                    <button
                                        onClick={() => signIn("google", { callbackUrl: "/" })}
                                        className="w-full py-4 px-6 rounded-xl bg-white text-zinc-950 font-mono font-bold text-sm flex items-center justify-center gap-3 hover:bg-zinc-100 transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-[1.01]"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        VERIFY & LOGIN WITH GOOGLE
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1.5">
                                            OPERATOR IDENTIFIER (EMAIL)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                                placeholder="operator@galleryeye.io"
                                                required
                                                className="w-full bg-black/80 border border-white/20 focus:border-red-500 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none transition-colors"
                                            />
                                            <span className="absolute right-3.5 top-3.5 text-red-500 font-mono text-xs">#ID</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1.5">
                                            ENCRYPTION PASSPHRASE
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                            placeholder="••••••••••••••••"
                                            required
                                            className="w-full bg-black/80 border border-white/20 focus:border-red-500 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2">
                                            <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 px-6 rounded-xl cyber-button-red font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                AUTHENTICATING TOKEN...
                                            </>
                                        ) : (
                                            "AUTHORIZE CLEARANCE"
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Security Footer inside Deck */}
                            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>E2EE TLS 1.3 SECURED</span>
                                </div>
                                <span className="text-red-400 font-semibold">NO TIMEOUT RESTRICTIONS</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* 4. Interactive 3D Holographic Radar & Global Telemetry */}
            <section id="radar-grid" className="relative z-10 py-20 border-t border-b border-white/10 bg-black/60 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                        <span className="font-mono text-xs font-bold text-red-500 uppercase tracking-widest px-3 py-1 rounded bg-red-500/10 border border-red-500/30">
                            GLOBAL RADAR TRACKING // SATELLITE TELEMETRY
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                            REAL-TIME 3D RADAR & TARGET SURVEILLANCE
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-base font-normal">
                            Hover over our interactive 3D satellite mapping grid to experience live target lock, node clustering, and sub-15ms socket presence verification.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        
                        {/* Interactive 3D Tilt Radar Canvas Container */}
                        <div
                            className="lg:col-span-7 perspective-1000 cursor-pointer group"
                            onMouseMove={handleRadarMouseMove}
                            onMouseLeave={handleRadarMouseLeave}
                        >
                            <div
                                className="cyber-card rounded-3xl overflow-hidden border border-red-500/40 p-2 sm:p-4 transition-transform duration-200 ease-out shadow-[0_0_50px_rgba(239,68,68,0.25)] bg-black/80"
                                style={{
                                    transform: `rotateX(${radarTilt.rotateX}deg) rotateY(${radarTilt.rotateY}deg)`
                                }}
                            >
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
                                    <img
                                        src="/cyber_radar.png"
                                        alt="Cyber Surveillance Radar"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                                    />
                                    {/* Holographic grid overlay */}
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444415_1px,transparent_1px),linear-gradient(to_bottom,#ef444415_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                                    {/* Live pulsing target lock dots */}
                                    <div className="absolute top-1/4 left-1/3 w-4 h-4 rounded-full border-2 border-red-500 animate-ping" />
                                    <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />

                                    <div className="absolute bottom-1/3 right-1/4 w-4 h-4 rounded-full border-2 border-emerald-500 animate-ping" />
                                    <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />

                                    {/* HUD overlay text inside radar image */}
                                    <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono space-y-1">
                                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            SATELLITE LOCK: ACTIVE (#EU-WEST-09)
                                        </div>
                                        <div className="text-zinc-400 text-[11px]">LAT: 48.8566° N | LON: 2.3522° E | SPEED: 10Gbps</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Telemetry Metrics */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="cyber-card p-5 rounded-2xl border border-white/10 hover:border-red-500/40 transition-all">
                                <div className="text-3xl font-extrabold text-white font-mono tracking-tight mb-1">
                                    1,420,890+
                                </div>
                                <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider mb-1">
                                    ENCRYPTED PACKETS EXFILTRATED TODAY
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Zero loss background synchronization over secure WebSocket endpoints (`wss://`). Automatically queues when target is offline.
                                </p>
                            </div>

                            <div className="cyber-card p-5 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all">
                                <div className="text-3xl font-extrabold text-white font-mono tracking-tight mb-1">
                                    99.98%
                                </div>
                                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
                                    STEALTH SERVICE PERSISTENCE
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    HexaCore engine runs silently in foreground/background. Automatically restarts on device boot without battery warning popups.
                                </p>
                            </div>

                            <div className="cyber-card p-5 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all">
                                <div className="text-3xl font-extrabold text-white font-mono tracking-tight mb-1">
                                    &lt; 15s
                                </div>
                                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                                    INSTANT OFFLINE PRESENCE DETECTION
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Calibrated `pingTimeout` (12000ms) and `pingInterval` (8000ms) guarantee immediate operator notification if target drops connection.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5. Live Cyber Terminal Simulation Section */}
            <section id="live-intercept" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
                    <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30">
                        INTERACTIVE SIMULATOR // LIVE PACKET INSPECTION
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                        EXPERIENCE COVERT DATA EXTRACTION
                    </h2>
                    <p className="text-zinc-400 text-sm sm:text-base">
                        Test live operator commands below. Trigger instant SMS harvesting, covert camera snapshots, remote torch strobing, and custom APK compilation directly in our interactive sandbox terminal.
                    </p>
                </div>

                <CyberTerminalSimulator />
            </section>

            {/* 6. Deep Dive Capabilities Matrix (AI Visuals Showcase) */}
            <section id="capabilities" className="relative z-10 py-20 border-t border-white/10 bg-black/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                        <span className="font-mono text-xs font-bold text-red-500 uppercase tracking-widest px-3 py-1 rounded bg-red-500/10 border border-red-500/30">
                            COVERT ARCHITECTURE // FULL SYSTEM SPECS
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                            ENTERPRISE-GRADE ANDROID SURVEILLANCE SUITE
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-base">
                            Engineered from the metal up. Every module is tailored for zero trace execution, end-to-end encryption, and persistent remote accessibility.
                        </p>
                    </div>

                    {/* Bento Grid Showcase */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        {/* Card 1: Custom APK Forge */}
                        <div className="cyber-card rounded-3xl p-6 border border-white/10 hover:border-red-500/50 transition-all group flex flex-col justify-between">
                            <div>
                                <div className="aspect-video rounded-2xl overflow-hidden mb-6 border border-white/10 relative bg-black">
                                    <img src="/cyber_apk.png" alt="Stealth APK Forge" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-red-600 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                                        DYNAMIC BUILDER
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold font-mono text-white uppercase mb-2 group-hover:text-red-400 transition-colors">
                                    STEALTH APK GENERATOR & FORGE
                                </h3>
                                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-4">
                                    Generate unique, unsigned or signed APK payloads instantly on our high-speed node server (`/usr/src/app/temp`). Customize app names (Poki Games, Temp Mail, Movie Box), app icons, and hide the launcher icon entirely after installation.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-500">
                                <span>SMALI / DEX BYPASS</span>
                                <span className="text-red-400 font-bold">100% STEALTH</span>
                            </div>
                        </div>

                        {/* Card 2: Real-Time Media Extraction Grid */}
                        <div className="cyber-card rounded-3xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
                            <div>
                                <div className="aspect-video rounded-2xl overflow-hidden mb-6 border border-white/10 relative bg-black">
                                    <img src="/cyber_grid.png" alt="Media Extraction Grid" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-600 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                                        EDGE STREAMING
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold font-mono text-white uppercase mb-2 group-hover:text-emerald-400 transition-colors">
                                    HIGH-SPEED MEDIA & GALLERY EXFIL
                                </h3>
                                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-4">
                                    Sync thousands of photos, videos, and live front/back camera captures straight to encrypted Cloudflare R2 partitions. Download folders as instant bulk ZIP bundles with multi-threaded streaming.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-500">
                                <span>CLOUDFLARE R2 EDGE</span>
                                <span className="text-emerald-400 font-bold">ZERO THROTTLING</span>
                            </div>
                        </div>

                        {/* Card 3: Batched SMS & Contacts Harvesting */}
                        <div className="cyber-card rounded-3xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all group flex flex-col justify-between md:col-span-2 lg:col-span-1">
                            <div>
                                <div className="aspect-video rounded-2xl overflow-hidden mb-6 border border-white/10 relative bg-black flex items-center justify-center p-6 bg-gradient-to-br from-black to-zinc-900">
                                    {/* Synthetic UI representation of Contacts/SMS */}
                                    <div className="w-full space-y-3 font-mono text-xs">
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-cyan-300">
                                            <span>+ CONTACTS HARVESTED:</span>
                                            <span className="font-bold text-white">412 RECORDS (BATCH MAP)</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-red-300">
                                            <span>+ SMS CONVERSATIONS:</span>
                                            <span className="font-bold text-white">1,894 THREADS (INCREMENTAL)</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-emerald-300">
                                            <span>+ SHA-256 FINGERPRINT:</span>
                                            <span className="font-bold text-white">UNIQUE DEVICE IDENTIFIER</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-cyan-600 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                                        N+1 OPTIMIZED
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold font-mono text-white uppercase mb-2 group-hover:text-cyan-400 transition-colors">
                                    BATCHED CONTACTS & SMS HARVESTING
                                </h3>
                                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-4">
                                    Eliminate UI freezes and ANR crashes during large extraction. Our Kotlin Android engine uses in-memory hash-mapped phone/email lookups and deduplicates device records by stable hardware fingerprint.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-500">
                                <span>BATCH MAP ALGORITHM</span>
                                <span className="text-cyan-400 font-bold">ANR PROTECTED</span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 7. Operator Tiers & Clearance Matrix */}
            <section id="operator-tiers" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <span className="font-mono text-xs font-bold text-red-500 uppercase tracking-widest px-3 py-1 rounded bg-red-500/10 border border-red-500/30">
                        SUBSCRIPTION PROTOCOLS // ACCESS LEVELS
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                        OPERATOR CLEARANCE TIERS
                    </h2>
                    <p className="text-zinc-400 text-sm sm:text-base">
                        Select your surveillance scale. Upgrade anytime within the operator dashboard to unlock high-frequency live streaming and persistent multi-device monitoring.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    
                    {/* Basic Scout */}
                    <div className="cyber-card rounded-3xl p-8 border border-white/10 flex flex-col justify-between bg-black/60">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-white/10 text-zinc-300">
                                    LEVEL 1 CLEARANCE
                                </span>
                                <span className="font-mono text-sm font-bold text-zinc-400">FREE / DEMO</span>
                            </div>
                            <h3 className="text-2xl font-bold font-mono text-white mb-2">BASIC SCOUT</h3>
                            <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
                                Perfect for testing basic device connectivity, single gallery sync preview, and local hardware ping.
                            </p>
                            <div className="text-4xl font-extrabold font-mono text-white mb-6">
                                $0 <span className="text-xs font-normal text-zinc-500">/ MONTH</span>
                            </div>

                            <ul className="space-y-3 text-xs font-mono text-zinc-300 mb-8">
                                <li className="flex items-center gap-2.5">
                                    <span className="text-emerald-400 font-bold">✔</span> 1 Active Android Device Link
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="text-emerald-400 font-bold">✔</span> Standard Gallery Photos Sync (Top 30)
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="text-emerald-400 font-bold">✔</span> Device Info & Battery Telemetry
                                </li>
                                <li className="flex items-center gap-2.5 text-zinc-600">
                                    <span>✖</span> No Custom APK Generator Forge
                                </li>
                                <li className="flex items-center gap-2.5 text-zinc-600">
                                    <span>✖</span> No Live Covert Camera/Mic Stream
                                </li>
                            </ul>
                        </div>
                        <a href="#operator-portal" className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider text-center transition-all">
                            SELECT BASIC SCOUT
                        </a>
                    </div>

                    {/* Standard Operative */}
                    <div className="cyber-card rounded-3xl p-8 border-2 border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.3)] flex flex-col justify-between bg-black/90 relative scale-[1.02]">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-red-600 font-mono text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg">
                            MOST POPULAR // RECOMMENDED
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-4 mt-2">
                                <span className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                                    LEVEL 2 CLEARANCE
                                </span>
                                <span className="font-mono text-sm font-bold text-red-400">OPERATIVE</span>
                            </div>
                            <h3 className="text-2xl font-bold font-mono text-white mb-2">STANDARD AGENT</h3>
                            <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
                                Full SMS, Contacts, Gallery extraction, and unlimited instant APK generation with custom icons.
                            </p>
                            <div className="text-4xl font-extrabold font-mono text-white mb-6">
                                $29 <span className="text-xs font-normal text-zinc-500">/ MONTH</span>
                            </div>

                            <ul className="space-y-3 text-xs font-mono text-zinc-300 mb-8">
                                <li className="flex items-center gap-2.5">
                                    <span className="text-red-400 font-bold">✔</span> Up to 5 Active Android Target Devices
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="text-red-400 font-bold">✔</span> Unlimited Custom Stealth APK Builder
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="text-red-400 font-bold">✔</span> Full SMS & Contacts Harvesting Map
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="text-red-400 font-bold">✔</span> High-Speed R2 ZIP Bulk Folder Download
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="text-red-400 font-bold">✔</span> Remote Torch & Vibration Triggers
                                </li>
                            </ul>
                        </div>
                        <a href="#operator-portal" className="w-full py-3.5 rounded-xl cyber-button-red font-mono text-xs font-bold uppercase tracking-wider text-center transition-all shadow-lg">
                            AUTHORIZE OPERATIVE TIER
                        </a>
                    </div>

                    {/* Premium Pro Surveillance */}
                    <div className="cyber-card rounded-3xl p-8 border border-emerald-500/40 flex flex-col justify-between bg-black/60">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    LEVEL 3 CLEARANCE
                                </span>
                                <span className="font-mono text-sm font-bold text-emerald-400">PRO COMMAND</span>
                            </div>
                            <h3 className="text-2xl font-bold font-mono text-white mb-2">PREMIUM PRO</h3>
                            <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
                                Unrestricted enterprise command deck. Covert live camera snapshots, remote audio recording, and priority API relay.
                            </p>
                            <div className="text-4xl font-extrabold font-mono text-white mb-6">
                                $99 <span className="text-xs font-normal text-zinc-500">/ MONTH</span>
                            </div>

                            <ul className="space-y-3 text-xs font-mono text-zinc-300 mb-8">
                                <li className="flex items-center gap-2.5">
                                    <span className="text-emerald-400 font-bold">✔</span> Unlimited Android Target Devices
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="text-emerald-400 font-bold">✔</span> Live Covert Front/Back Camera Snapshots
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="text-emerald-400 font-bold">✔</span> Remote Microphone Audio Intercept (`/voice`)
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="text-emerald-400 font-bold">✔</span> Persistent Offline LocalStorage Caching
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <span className="text-emerald-400 font-bold">✔</span> Dedicated Priority Node Socket Channel
                                </li>
                            </ul>
                        </div>
                        <a href="#operator-portal" className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider text-center transition-all shadow-lg shadow-emerald-600/30">
                            SELECT PREMIUM PRO
                        </a>
                    </div>

                </div>
            </section>

            {/* 8. Cyber Footer & System Diagnostics */}
            <footer className="relative z-10 border-t border-white/10 bg-black/80 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs text-zinc-500">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-red-500/40 bg-black">
                            <img src="/gallery-eye-logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <span>© 2026 GALLERY EYE SPYWARE COMMAND // ALL RIGHTS RESERVED</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="hover:text-zinc-300 cursor-pointer">PROTOCOL SPECS</span>
                        <span className="hover:text-zinc-300 cursor-pointer">SECURITY REPORT</span>
                        <span className="hover:text-zinc-300 cursor-pointer">OPERATOR TERMS</span>
                        <span className="text-red-400 font-bold">ENCRYPTED CORE v4.9.2</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
