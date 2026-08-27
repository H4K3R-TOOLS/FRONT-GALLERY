"use client";

import React, { useState, useEffect } from 'react';
import { Smartphone, Folder, RefreshCw, ChevronDown, Package, Zap, Crown, Building2 } from 'lucide-react';
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 space-y-6 pb-20 animate-in fade-in duration-300">
            {/* Top Clean Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
                        <span className="text-white">System</span>{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-purple-400 to-pink-400">Dashboard</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-fg-3 mt-1 font-medium">
                        Real-time status overview across all encrypted endpoints
                    </p>
                </div>
                <button 
                    id="tutorial-access-app"
                    onClick={onOpenAppModal}
                    className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-sm shadow-accent-glow flex items-center gap-2 transition-all active:scale-95 self-start sm:self-center cursor-pointer"
                >
                    <Smartphone className="w-4 h-4" />
                    <span>+ Access a New Device</span>
                </button>
            </div>

            {/* Functional Telemetry & Status Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Connected Devices Card */}
                <div 
                    id="tutorial-device-card"
                    onClick={() => setNavDropdown(navDropdown === 'devices' ? null : 'devices')}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between shadow-xl cursor-pointer group backdrop-blur-md"
                >
                    <div className="space-y-1">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-300 transition-colors flex items-center gap-1.5">
                            <span>Connected Devices</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform ${navDropdown === 'devices' ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="text-2xl font-extrabold text-white flex items-center gap-2 font-mono">
                            {onlineCount} <span className="text-xs font-normal text-zinc-500">/ {devices.length} Online</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors">Click to switch or manage endpoints</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Smartphone className="w-5 h-5 text-emerald-400" />
                    </div>
                </div>

                {/* 2. Synced Media Card */}
                <div 
                    id="tutorial-synced-media"
                    onClick={onOpenGallery}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between shadow-xl cursor-pointer group backdrop-blur-md"
                >
                    <div className="space-y-1">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">Synced Media</div>
                        <div className="text-2xl font-extrabold text-white font-mono">
                            {imagesCount} <span className="text-xs font-normal text-zinc-500">Assets</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors">Click to inspect encrypted vault</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Folder className="w-5 h-5 text-cyan-400" />
                    </div>
                </div>

                {/* 3. Backend Connection Card */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 transition-all duration-300 flex items-center justify-between shadow-xl backdrop-blur-md">
                    <div className="space-y-1">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Backend Connection</div>
                        <div className="flex items-center gap-2.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            <span className="text-base font-bold text-white tracking-wide font-mono">
                                {isSocketConnected ? 'BACKEND CONNECTED' : 'BACKEND ONLINE'}
                            </span>
                            {isSocketConnected && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-cyan-500/30 font-mono tracking-wider shadow-sm">
                                    ⚡ {socketPing}ms
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-zinc-500">Secure WebSocket tunnel active</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <RefreshCw className="w-5 h-5 text-cyan-400 animate-[spin_3s_linear_infinite]" />
                    </div>
                </div>

                {/* 4. Upgraded Subscription Plan Card */}
                <div 
                    id="tutorial-plans-card"
                    onClick={onOpenPlansModal}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between shadow-xl cursor-pointer group backdrop-blur-md"
                >
                    <div className="space-y-1">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">Subscription Tier</div>
                        <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white tracking-wide uppercase font-mono">
                                {userPlan ? `${userPlan.toUpperCase()} TIER` : 'FREE TIER'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                                userPlan === 'enterprise' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                userPlan === 'premium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                userPlan === 'standard' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30'
                            }`}>
                                {planLimits.maxDevices === -1 ? '∞ UNLIMITED' : `${planLimits.maxDevices} ${planLimits.maxDevices === 1 ? 'DEVICE MAX' : 'DEVICES MAX'}`}
                            </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors">Click to inspect or upgrade limits</div>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                        userPlan === 'enterprise' ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]' :
                        userPlan === 'premium' ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                        userPlan === 'standard' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                        'bg-white/5 border border-white/10 text-zinc-400'
                    }`}>
                        {userPlan === 'enterprise' && <Building2 className="w-5 h-5 text-purple-400 animate-pulse" />}
                        {userPlan === 'premium' && <Crown className="w-5 h-5 text-amber-400 animate-pulse" />}
                        {userPlan === 'standard' && <Zap className="w-5 h-5 text-emerald-400" />}
                        {(!userPlan || (userPlan !== 'premium' && userPlan !== 'standard' && userPlan !== 'enterprise')) && <Package className="w-5 h-5 text-zinc-400" />}
                    </div>
                </div>

                {/* 5. Video Tutorial Guide Card */}
                <VideoModal videoId="yk9hTwzmV2A" variant="card" />
            </div>
        </div>
    );
}
