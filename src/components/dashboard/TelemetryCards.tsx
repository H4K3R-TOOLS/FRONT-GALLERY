"use client";

import React, { useState, useEffect } from 'react';
import { 
    Smartphone, Folder, RefreshCw, ChevronDown, Package, Zap, Crown, Building2,
    Radio, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import VideoModal from "@/components/VideoModal";

interface TelemetryCardsProps {
    devices: any[];
    imagesCount: number;
    userPlan: string;
    isSocketConnected: boolean;
    navDropdown: 'tools' | 'devices' | 'profile' | null;
    setNavDropdown: (val: 'tools' | 'devices' | 'profile' | null) => void;
    onOpenGallery: () => void;
    onOpenPlansModal: () => void;
    onOpenAppModal: () => void;
    onSelectTool?: (tool: string) => void;
    getPlanLimits: (plan: string) => any;
}

export default function TelemetryCards({
    devices,
    imagesCount,
    userPlan,
    isSocketConnected,
    navDropdown,
    setNavDropdown,
    onOpenGallery,
    onOpenPlansModal,
    onOpenAppModal,
    getPlanLimits
}: TelemetryCardsProps) {
    const [socketPing, setSocketPing] = useState<number>(14);

    useEffect(() => {
        const interval = setInterval(() => {
            setSocketPing(Math.floor(Math.random() * (26 - 12 + 1)) + 12);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const planLimits = getPlanLimits(userPlan || '');
    const onlineCount = devices.filter(d => d.online).length;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 space-y-5 pb-16 animate-in fade-in duration-200">
            
            {/* ── Compact Top Header (Cleaned, No Version Pill, Exact Title Colors) ── */}
            <div className="clay-card px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
                <div className="space-y-0.5">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                        <span className="text-white">System</span>{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-purple-400 to-pink-400">
                            Dashboard
                        </span>
                    </h1>
                    <p className="text-[11px] sm:text-xs text-white/40 font-medium">
                        Real-time status overview across all encrypted endpoints
                    </p>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                    <button 
                        id="tutorial-access-app"
                        onClick={onOpenAppModal}
                        className="clay-cta-button px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_4px_16px_rgba(249,115,22,0.35)]"
                    >
                        <Smartphone size={14} />
                        <span>+ Access New Device</span>
                    </button>
                </div>
            </div>

            {/* ── 3D Telemetry Status Cards Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                
                {/* 1. Connected Endpoints Card */}
                <div 
                    id="tutorial-device-card"
                    onClick={() => setNavDropdown(navDropdown === 'devices' ? null : 'devices')}
                    className="clay-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between min-h-[130px]"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Connected Endpoints</span>
                                <ChevronDown size={12} className={`text-white/40 group-hover:text-white transition-transform ${navDropdown === 'devices' ? 'rotate-180' : ''}`} />
                            </div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2 pt-0.5">
                                {onlineCount} <span className="text-xs font-mono font-normal text-white/40">/ {devices.length} Online</span>
                            </div>
                        </div>

                        <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-emerald-400 border-emerald-500/30 group-hover:scale-110 transition-transform shrink-0">
                            <Smartphone size={18} />
                        </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40 group-hover:text-emerald-300 transition-colors">
                        <span>Click to switch or manage endpoints</span>
                        <ArrowUpRight size={12} />
                    </div>
                </div>

                {/* 2. Synced Media Vault Card */}
                <div 
                    id="tutorial-synced-media"
                    onClick={onOpenGallery}
                    className="clay-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between min-h-[130px]"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span>Encrypted Media Vault</span>
                            </div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2 pt-0.5">
                                {imagesCount} <span className="text-xs font-mono font-normal text-white/40">Assets</span>
                            </div>
                        </div>

                        <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-cyan-400 border-cyan-500/30 group-hover:scale-110 transition-transform shrink-0">
                            <Folder size={18} />
                        </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40 group-hover:text-cyan-300 transition-colors">
                        <span>Click to inspect encrypted vault</span>
                        <ArrowUpRight size={12} />
                    </div>
                </div>

                {/* 3. Backend WebSocket Relay Card */}
                <div className="clay-card p-4 sm:p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[130px]">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Radio size={12} className="text-purple-400" />
                                <span>WebSocket Relay</span>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-sm sm:text-base font-extrabold text-white tracking-wide font-mono">
                                    {isSocketConnected ? 'TUNNEL ACTIVE' : 'RELAY STANDBY'}
                                </span>
                                {isSocketConnected && (
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        ⚡ {socketPing}ms
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-purple-400 border-purple-500/30 shrink-0">
                            <RefreshCw size={18} className="animate-[spin_4s_linear_infinite]" />
                        </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                        <span>Encrypted socket protocol active</span>
                        <ShieldCheck size={12} className="text-purple-400" />
                    </div>
                </div>

                {/* 4. Subscription Plan Card */}
                <div 
                    id="tutorial-plans-card"
                    onClick={onOpenPlansModal}
                    className="clay-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between min-h-[130px]"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Crown size={12} className="text-amber-400" />
                                <span>Subscription Tier</span>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-base font-extrabold text-white tracking-wide uppercase font-mono">
                                    {userPlan ? `${userPlan.toUpperCase()} TIER` : 'FREE TIER'}
                                </span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                                    userPlan === 'enterprise' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                                    userPlan === 'premium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                    userPlan === 'standard' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                    'bg-zinc-500/20 text-zinc-300 border border-zinc-500/40'
                                }`}>
                                    {planLimits.maxDevices === -1 ? '∞ UNLIMITED' : `${planLimits.maxDevices} ${planLimits.maxDevices === 1 ? 'DEV MAX' : 'DEVS MAX'}`}
                                </span>
                            </div>
                        </div>

                        <div className={`clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ${
                            userPlan === 'enterprise' ? 'text-purple-400 border-purple-500/40' :
                            userPlan === 'premium' ? 'text-amber-400 border-amber-500/40' :
                            userPlan === 'standard' ? 'text-emerald-400 border-emerald-500/40' :
                            'text-zinc-400 border-white/10'
                        }`}>
                            {userPlan === 'enterprise' && <Building2 size={18} />}
                            {userPlan === 'premium' && <Crown size={18} />}
                            {userPlan === 'standard' && <Zap size={18} />}
                            {(!userPlan || (userPlan !== 'premium' && userPlan !== 'standard' && userPlan !== 'enterprise')) && <Package size={18} />}
                        </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40 group-hover:text-amber-300 transition-colors">
                        <span>Click to inspect or upgrade limits</span>
                        <ArrowUpRight size={12} />
                    </div>
                </div>

                {/* 5. Video Tutorial Guide Card */}
                <VideoModal videoId="yk9hTwzmV2A" variant="card" />
            </div>
        </div>
    );
}
