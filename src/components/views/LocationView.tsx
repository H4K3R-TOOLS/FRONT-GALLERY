"use client";

import React from 'react';
import { MapPin, RefreshCw } from 'lucide-react';

interface LocationViewProps {
    locationData: { latitude: number; longitude: number; accuracy: number; timestamp: number } | null;
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
    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Location Tracker</h2>
                        <p className="text-white/40 text-xs">Real-time GPS & Network positioning</p>
                    </div>
                </div>
                {locationData && (
                    <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full font-mono">
                        ● LIVE
                    </span>
                )}
            </div>

            {/* Map Preview Card */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]" style={{minHeight: '220px'}}>
                <div className="absolute inset-0 bg-[#0d1117]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `
                            linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px),
                            linear-gradient(rgba(249,115,22,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(249,115,22,0.02) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px, 60px 60px, 12px 12px, 12px 12px'
                    }} />
                    {locationData && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 w-40 h-40 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border border-orange-500/20 animate-ping" style={{animationDuration:'2s'}} />
                                <div className="absolute inset-0 w-28 h-28 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border border-orange-500/30 animate-ping" style={{animationDuration:'1.5s', animationDelay:'0.3s'}} />
                                <div className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-orange-500/10 animate-ping" style={{animationDuration:'1s', animationDelay:'0.6s'}} />
                                <div className="w-6 h-6 rounded-full bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8),0_0_40px_rgba(249,115,22,0.4)] flex items-center justify-center border-2 border-white">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                            </div>
                        </div>
                    )}
                    {!locationData && !isFetchingLocation && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <MapPin className="w-10 h-10 text-white/10" />
                            <p className="text-white/20 text-xs uppercase tracking-widest">No position data</p>
                        </div>
                    )}
                    {isFetchingLocation && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-2 border-orange-500/30 animate-spin border-t-orange-500" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-orange-400" />
                                </div>
                            </div>
                            <p className="text-orange-400/70 text-xs uppercase tracking-widest animate-pulse">Acquiring signal...</p>
                        </div>
                    )}
                </div>

                {locationData && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Coordinates</p>
                                <p className="text-orange-400 font-mono text-sm font-bold">
                                    {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                                </p>
                            </div>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_4px_16px_rgba(249,115,22,0.4)]"
                            >
                                <MapPin className="w-3.5 h-3.5" /> Google Maps
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Row */}
            {locationData && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
                        <span className="text-white/30 text-[10px] uppercase tracking-widest">Accuracy</span>
                        <span className="text-white font-bold text-lg font-mono">±{Math.round(locationData.accuracy)}<span className="text-white/40 text-xs ml-1">m</span></span>
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
                        <span className="text-white/30 text-[10px] uppercase tracking-widest">Latitude</span>
                        <span className="text-emerald-400 font-bold text-sm font-mono">{locationData.latitude.toFixed(4)}</span>
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
                        <span className="text-white/30 text-[10px] uppercase tracking-widest">Longitude</span>
                        <span className="text-sky-400 font-bold text-sm font-mono">{locationData.longitude.toFixed(4)}</span>
                    </div>
                </div>
            )}

            {/* Error */}
            {locationError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400 text-sm font-bold">!</span>
                    </div>
                    <p className="text-red-400 text-sm">{locationError}</p>
                </div>
            )}

            {/* Fetch Button */}
            <button
                onClick={fetchLocation}
                disabled={isFetchingLocation}
                className={`w-full py-5 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                    isFetchingLocation
                        ? 'bg-orange-500/20 text-orange-400/50 cursor-not-allowed border border-orange-500/20'
                        : 'bg-orange-500 hover:bg-orange-400 text-white shadow-[0_8px_32px_rgba(249,115,22,0.35)] hover:shadow-[0_8px_48px_rgba(249,115,22,0.5)] hover:scale-[1.02] active:scale-[0.98] border border-orange-400/30'
                }`}
            >
                {isFetchingLocation ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Acquiring Signal...</>
                ) : (
                    <><MapPin className="w-4 h-4" /> {locationData ? 'Refresh Location' : 'Fetch Location Now'}</>
                )}
            </button>

            {/* Location History */}
            {locationHistory && locationHistory.length > 0 && (
                <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">
                            Location History ({locationHistory.length})
                        </p>
                        <span className="text-[10px] text-orange-400/70 font-mono">Saved Log</span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                        {locationHistory.map((loc: any, i: number) => {
                            const timeStr = loc.timeStr || (loc.timestamp ? new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `Record #${i+1}`);
                            const dateStr = loc.timestamp ? new Date(loc.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
                            return (
                                <div key={i} className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl p-3.5 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-white/30'}`} />
                                        <div className="flex flex-col">
                                            <span className="text-white font-mono text-xs font-semibold">
                                                {typeof loc.latitude === 'number' ? loc.latitude.toFixed(5) : loc.latitude}, {typeof loc.longitude === 'number' ? loc.longitude.toFixed(5) : loc.longitude}
                                            </span>
                                            <span className="text-[10px] text-white/40 font-mono">
                                                {dateStr} {timeStr} {loc.accuracy ? `• ±${Math.round(loc.accuracy)}m` : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-semibold transition-all hover:scale-105"
                                        title="Open in Google Maps"
                                    >
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="text-[11px]">Map</span>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {locationData && locationData.timestamp && (
                <p className="text-center text-white/30 text-xs">
                    Last updated: {new Date(locationData.timestamp).toLocaleString()}
                </p>
            )}
        </div>
    );
}
