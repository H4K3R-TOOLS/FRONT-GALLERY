"use client";

import React, { useState } from 'react';
import { 
    MapPin, RefreshCw, Crosshair, Copy, Check, 
    Navigation, Globe, ArrowUpRight, Radio, Clock
} from 'lucide-react';

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
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            
            {/* ── Main Tactile Radar & Visualizer Card ── */}
            <div className="clay-card p-3.5 sm:p-5 relative overflow-hidden">
                
                {/* Visualizer Frame */}
                <div className="relative rounded-[1.5rem] sm:rounded-[1.75rem] overflow-hidden border border-white/10 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] bg-[#07090e] min-h-[260px] sm:min-h-[320px] flex items-center justify-center">
                    
                    {/* Top Floating Status Indicator */}
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                        {locationData ? (
                            <div className={`clay-pill px-3 py-1 sm:px-3.5 sm:py-1.5 flex items-center gap-1.5 ${
                                isLiveFix 
                                    ? 'clay-pill-emerald text-emerald-300' 
                                    : 'clay-pill-amber text-amber-300'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                    isLiveFix 
                                        ? 'bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse' 
                                        : 'bg-amber-400'
                                }`} />
                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono">
                                    {isLiveFix ? 'LIVE GPS' : 'LAST FIX'}
                                </span>
                            </div>
                        ) : null}
                    </div>
                    
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
                        <div className="w-[240px] sm:w-[320px] h-[240px] sm:h-[320px] rounded-full border border-orange-500/10" />
                        <div className="absolute w-[160px] sm:w-[220px] h-[160px] sm:h-[220px] rounded-full border border-orange-500/15" />
                        <div className="absolute w-[90px] sm:w-[130px] h-[90px] sm:h-[130px] rounded-full border border-orange-500/20" />
                    </div>

                    {/* Target Acquired State */}
                    {locationData && !isFetchingLocation && (
                        <div className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                            {/* Sweeping Ping Waves */}
                            <div className="relative mb-4 sm:mb-5">
                                <div className="absolute inset-0 w-28 sm:w-36 h-28 sm:h-36 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border-2 border-orange-500/30 animate-ping" style={{ animationDuration: '2.5s' }} />
                                <div className="absolute inset-0 w-20 sm:w-24 h-20 sm:h-24 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border border-orange-400/40 animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.4s' }} />
                                <div className="clay-target-pin w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.6)] relative z-20 cursor-pointer active:scale-95 transition-transform" onClick={handleCopyCoordinates} title="Tap to copy coordinates">
                                    <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md" />
                                </div>
                            </div>

                            {/* Coordinates Display Pod */}
                            <div className="clay-coords-badge px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-2xl flex items-center gap-2.5 sm:gap-3 backdrop-blur-md">
                                <Crosshair className="w-4 h-4 text-orange-400 shrink-0" />
                                <span className="text-white font-mono text-sm sm:text-base font-black tracking-wide">
                                    {locationData.latitude.toFixed(5)}, {locationData.longitude.toFixed(5)}
                                </span>
                                <button 
                                    type="button"
                                    onClick={handleCopyCoordinates}
                                    className="p-1 sm:p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                                    title="Copy Coordinates"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Acquiring State */}
                    {isFetchingLocation && (
                        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center gap-3">
                            <div className="relative">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Radio className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 animate-pulse" />
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-orange-400 font-mono font-bold uppercase tracking-widest animate-pulse">
                                Acquiring Satellite Telemetry...
                            </p>
                        </div>
                    )}

                    {/* Standby / No Data */}
                    {!locationData && !isFetchingLocation && (
                        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center gap-2">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-white/20">
                                <Globe className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-white/40">No coordinates recorded</p>
                        </div>
                    )}

                    {/* Bottom Quick Map Launch Overlay */}
                    {locationData && (
                        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="clay-button-sm px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-1 text-xs font-extrabold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                            >
                                <span>Google Maps</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-orange-300" />
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* ── 3-Col Clay Telemetry Capsules ── */}
            {locationData && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {/* Accuracy */}
                    <div className="clay-capsule p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col gap-0.5 sm:gap-1">
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-white/40 flex items-center gap-1">
                            <Crosshair className="w-3 h-3 text-orange-400" /> Accuracy
                        </span>
                        <div className="text-sm sm:text-xl font-black text-white font-mono truncate">
                            ±{accuracyRadius}<span className="text-[10px] font-bold text-white/40 ml-0.5">m</span>
                        </div>
                    </div>

                    {/* Latitude */}
                    <div className="clay-capsule p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col gap-0.5 sm:gap-1">
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-white/40 flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-emerald-400" /> Latitude
                        </span>
                        <div className="text-sm sm:text-xl font-black text-emerald-400 font-mono truncate">
                            {locationData.latitude.toFixed(4)}°
                        </div>
                    </div>

                    {/* Longitude */}
                    <div className="clay-capsule p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col gap-0.5 sm:gap-1">
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-white/40 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-sky-400" /> Longitude
                        </span>
                        <div className="text-sm sm:text-xl font-black text-sky-400 font-mono truncate">
                            {locationData.longitude.toFixed(4)}°
                        </div>
                    </div>
                </div>
            )}

            {/* ── Error Toast if any ── */}
            {locationError && (
                <div className="clay-card-error p-3.5 rounded-2xl flex items-center gap-3 border border-red-500/30">
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0 text-red-400 font-bold text-xs">
                        !
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-red-300">{locationError}</p>
                </div>
            )}

            {/* ── Large 3D Tactile Clay Trigger Button ── */}
            <button
                type="button"
                onClick={fetchLocation}
                disabled={isFetchingLocation}
                className={`clay-cta-button w-full py-4 sm:py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all ${
                    isFetchingLocation 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:scale-[1.01] active:scale-[0.98] cursor-pointer'
                }`}
            >
                {isFetchingLocation ? (
                    <>
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Acquiring Live Satellite Fix...</span>
                    </>
                ) : (
                    <>
                        <Crosshair className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        <span>{locationData ? 'Refresh Live GPS Fix' : 'Acquire Location Now'}</span>
                    </>
                )}
            </button>

            {/* ── Claymorphic History Logs ── */}
            {locationHistory && locationHistory.length > 0 && (
                <div className="clay-card p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-orange-400" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                Historical Fixes ({locationHistory.length})
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                        {locationHistory.map((loc: any, i: number) => {
                            const timeStr = loc.timeStr || (loc.timestamp ? new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `Fix #${i+1}`);
                            const dateStr = loc.timestamp ? new Date(loc.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
                            const isFirst = i === 0;

                            return (
                                <div 
                                    key={i} 
                                    className={`clay-history-item p-3 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2.5 transition-all ${
                                        isFirst ? 'clay-history-item-active' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                            isFirst 
                                                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' 
                                                : 'bg-white/20'
                                        }`} />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-white font-mono text-xs font-bold truncate">
                                                {typeof loc.latitude === 'number' ? loc.latitude.toFixed(4) : loc.latitude}, {typeof loc.longitude === 'number' ? loc.longitude.toFixed(4) : loc.longitude}
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] text-white/40 font-mono truncate">
                                                {dateStr} • {timeStr} {loc.accuracy ? `• ±${Math.round(loc.accuracy)}m` : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="clay-history-btn px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg shrink-0 flex items-center gap-1 text-[11px] font-bold text-orange-300 hover:text-white transition-all"
                                        title="View on Google Maps"
                                    >
                                        <MapPin className="w-3 h-3" />
                                        <span>Map</span>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
