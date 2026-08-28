"use client";

import React, { useState } from 'react';
import { 
    MapPin, RefreshCw, Compass, Navigation, Radio, 
    Crosshair, Copy, Check, ExternalLink, Globe, 
    Layers, Zap, Clock, Activity, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationViewProps {
    locationData: { 
        latitude: number; 
        longitude: number; 
        accuracy: number; 
        timestamp: number;
        altitude?: number;
        speed?: number;
        bearing?: number;
        provider?: string;
        isFresh?: boolean;
    } | null;
    isFetchingLocation: boolean;
    locationError: string | null;
    locationHistory: any[];
    fetchLocation: () => void;
}

export default function LocationView({
    locationData,
    isFetchingLocation,
    locationError,
    locationHistory,
    fetchLocation
}: LocationViewProps) {
    const [copied, setCopied] = useState(false);
    const [activeMapLayer, setActiveMapLayer] = useState<'radar' | 'satellite'>('radar');

    const handleCopyCoordinates = () => {
        if (!locationData) return;
        const coords = `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
        navigator.clipboard.writeText(coords);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isLiveFix = locationData && (locationData.isFresh !== false);
    const accuracyRadius = locationData ? Math.round(locationData.accuracy) : null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-400 pb-16">
            
            {/* ── Top Claymorphic Header ── */}
            <div className="clay-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-4 relative z-10">
                    <div className="clay-icon-pod w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                        <Compass className="w-7 h-7 text-orange-400 animate-spin-slow" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                                GPS Telemetry
                            </h2>
                            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                                v3.0 Clay
                            </span>
                        </div>
                        <p className="text-white/50 text-xs sm:text-sm mt-0.5 font-medium">
                            Physical satellite orbit & network positioning node
                        </p>
                    </div>
                </div>

                {/* Live Status Pill */}
                <div className="flex items-center gap-2.5 self-start sm:self-center relative z-10">
                    {locationData ? (
                        <div className={`clay-pill px-4 py-2 flex items-center gap-2 ${
                            isLiveFix 
                                ? 'clay-pill-emerald text-emerald-300' 
                                : 'clay-pill-amber text-amber-300'
                        }`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${
                                isLiveFix 
                                    ? 'bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse' 
                                    : 'bg-amber-400'
                            }`} />
                            <span className="text-xs font-black uppercase tracking-wider font-mono">
                                {isLiveFix ? 'LIVE GPS LOCK' : 'LAST RECORDED'}
                            </span>
                        </div>
                    ) : (
                        <div className="clay-pill px-4 py-2 flex items-center gap-2 text-white/40 border border-white/5">
                            <Radio className="w-3.5 h-3.5" />
                            <span className="text-xs font-mono font-bold uppercase tracking-wider">STANDBY</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Tactile Radar & Visualizer Card ── */}
            <div className="clay-card p-4 sm:p-6 relative overflow-hidden">
                
                {/* Visualizer Frame */}
                <div className="relative rounded-[1.75rem] overflow-hidden border border-white/10 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] bg-[#0a0d14] min-h-[300px] sm:min-h-[340px] flex items-center justify-center">
                    
                    {/* Tactical Radar Grid Background */}
                    <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
                        backgroundImage: `
                            radial-gradient(circle at center, rgba(249,115,22,0.12) 0%, transparent 65%),
                            linear-gradient(rgba(249,115,22,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(249,115,22,0.06) 1px, transparent 1px)
                        `,
                        backgroundSize: '100% 100%, 36px 36px, 36px 36px'
                    }} />

                    {/* Concentric Clay Rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] rounded-full border border-orange-500/10" />
                        <div className="absolute w-[200px] sm:w-[260px] h-[200px] sm:h-[260px] rounded-full border border-orange-500/15" />
                        <div className="absolute w-[120px] sm:w-[160px] h-[120px] sm:h-[160px] rounded-full border border-orange-500/20" />
                    </div>

                    {/* Target Acquired State */}
                    {locationData && !isFetchingLocation && (
                        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
                            {/* Sweeping Ping Waves */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 w-36 h-36 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border-2 border-orange-500/30 animate-ping" style={{ animationDuration: '2.5s' }} />
                                <div className="absolute inset-0 w-24 h-24 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border border-orange-400/40 animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.4s' }} />
                                <div className="clay-target-pin w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.6)] relative z-20 cursor-pointer active:scale-95 transition-transform" onClick={handleCopyCoordinates} title="Click to copy coordinates">
                                    <MapPin className="w-7 h-7 text-white drop-shadow-md" />
                                </div>
                            </div>

                            {/* Coordinates Display Pod */}
                            <div className="clay-coords-badge px-5 py-2.5 rounded-2xl flex items-center gap-3 mb-2 backdrop-blur-md">
                                <Crosshair className="w-4 h-4 text-orange-400" />
                                <span className="text-white font-mono text-base sm:text-lg font-black tracking-wide">
                                    {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                                </span>
                                <button 
                                    onClick={handleCopyCoordinates}
                                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                                    title="Copy Coordinates"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            <p className="text-white/40 text-xs font-mono font-medium">
                                Accuracy Radius: ±{accuracyRadius}m • Provider: {locationData.provider?.toUpperCase() || 'GPS/NETWORK'}
                            </p>
                        </div>
                    )}

                    {/* Acquiring State */}
                    {isFetchingLocation && (
                        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center gap-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Radio className="w-8 h-8 text-orange-400 animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <p className="text-lg font-black text-white tracking-tight">Locking Satellites & NLP</p>
                                <p className="text-xs text-orange-400/80 font-mono mt-0.5 animate-pulse uppercase tracking-widest">
                                    Acquiring live telemetry coordinates...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Standby / No Data */}
                    {!locationData && !isFetchingLocation && (
                        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-white/20">
                                <Globe className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-bold text-white/40">No coordinates recorded for this endpoint yet</p>
                            <p className="text-xs text-white/20">Click the action button below to trigger remote GPS fix</p>
                        </div>
                    )}

                    {/* Bottom Quick Map Launch Overlay */}
                    {locationData && (
                        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="clay-button-sm px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-extrabold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <span>Google Maps</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-orange-300" />
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* ── 4-Col Claymorphic Telemetry Capsules ── */}
            {locationData && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {/* Accuracy */}
                    <div className="clay-capsule p-4 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 flex items-center gap-1">
                            <Crosshair className="w-3 h-3 text-orange-400" /> Accuracy
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono">
                            ±{accuracyRadius}<span className="text-xs font-bold text-white/40 ml-1">meters</span>
                        </div>
                    </div>

                    {/* Latitude */}
                    <div className="clay-capsule p-4 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-emerald-400" /> Latitude
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono truncate">
                            {locationData.latitude.toFixed(4)}°
                        </div>
                    </div>

                    {/* Longitude */}
                    <div className="clay-capsule p-4 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-sky-400" /> Longitude
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono truncate">
                            {locationData.longitude.toFixed(4)}°
                        </div>
                    </div>

                    {/* Altitude / Sensor */}
                    <div className="clay-capsule p-4 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-purple-400" /> Sensor Type
                        </span>
                        <div className="text-base sm:text-lg font-black text-purple-300 font-mono truncate mt-0.5">
                            {locationData.provider?.toUpperCase() || 'FUSED GPS'}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Error Toast if any ── */}
            {locationError && (
                <div className="clay-card-error p-4 rounded-2xl flex items-center gap-3 border border-red-500/30">
                    <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 text-red-400 font-bold">
                        !
                    </div>
                    <p className="text-sm font-semibold text-red-300">{locationError}</p>
                </div>
            )}

            {/* ── Large 3D Tactile Clay Trigger Button ── */}
            <button
                onClick={fetchLocation}
                disabled={isFetchingLocation}
                className={`clay-cta-button w-full py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                    isFetchingLocation 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:scale-[1.01] active:scale-[0.98] cursor-pointer'
                }`}
            >
                {isFetchingLocation ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Acquiring Live Satellite Lock...</span>
                    </>
                ) : (
                    <>
                        <Crosshair className="w-5 h-5 text-white" />
                        <span>{locationData ? 'Refresh Live GPS Fix' : 'Acquire Device Location Now'}</span>
                    </>
                )}
            </button>

            {/* ── Claymorphic History Logs ── */}
            {locationHistory && locationHistory.length > 0 && (
                <div className="clay-card p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">
                                Historical Fixes ({locationHistory.length})
                            </h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-white/40 uppercase">Encrypted Local Log</span>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1.5 custom-scrollbar">
                        {locationHistory.map((loc: any, i: number) => {
                            const timeStr = loc.timeStr || (loc.timestamp ? new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `Fix #${i+1}`);
                            const dateStr = loc.timestamp ? new Date(loc.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                            const isFirst = i === 0;

                            return (
                                <div 
                                    key={i} 
                                    className={`clay-history-item p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                                        isFirst ? 'clay-history-item-active' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-3 h-3 rounded-full shrink-0 ${
                                            isFirst 
                                                ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' 
                                                : 'bg-white/20'
                                        }`} />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-white font-mono text-xs sm:text-sm font-bold truncate">
                                                {typeof loc.latitude === 'number' ? loc.latitude.toFixed(5) : loc.latitude}, {typeof loc.longitude === 'number' ? loc.longitude.toFixed(5) : loc.longitude}
                                            </span>
                                            <span className="text-[10px] sm:text-xs text-white/40 font-mono truncate mt-0.5">
                                                {dateStr} • {timeStr} {loc.accuracy ? `• ±${Math.round(loc.accuracy)}m` : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="clay-history-btn px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 text-xs font-bold text-orange-300 hover:text-white transition-all"
                                        title="View on Google Maps"
                                    >
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Map</span>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {locationData && locationData.timestamp && (
                <div className="text-center text-[11px] font-mono text-white/30">
                    Last Verified Sensor Telemetry: {new Date(locationData.timestamp).toLocaleString()}
                </div>
            )}
        </div>
    );
}
