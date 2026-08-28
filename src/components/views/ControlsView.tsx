"use client";

import React, { useState } from 'react';
import { Flashlight, Vibrate, Zap, Radio, Power, Sparkles, Activity } from 'lucide-react';

interface FlashlightViewProps {
    isTorchOn: boolean;
    toggleTorch: () => void;
}

export function FlashlightView({ isTorchOn, toggleTorch }: FlashlightViewProps) {
    return (
        <div className="max-w-xl mx-auto space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            
            {/* ── Main 3D Clay Torch Reactor Card ── */}
            <div className="clay-card p-6 sm:p-10 min-h-[460px] flex flex-col items-center justify-between relative overflow-hidden text-center">
                
                {/* Radiant Beam Aura */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[110px] pointer-events-none transition-all duration-700 ${
                    isTorchOn ? 'bg-amber-400/25 scale-125' : 'bg-orange-500/5 scale-90'
                }`} />

                {/* Status Indicator Pill */}
                <div className="relative z-10">
                    <div className={`clay-pill px-4 py-1.5 flex items-center gap-2 ${
                        isTorchOn 
                            ? 'clay-pill-amber text-amber-200' 
                            : 'bg-white/[0.04] border border-white/5 text-white/40'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${
                            isTorchOn ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]' : 'bg-white/20'
                        }`} />
                        <span className="text-[11px] font-mono font-black uppercase tracking-wider">
                            {isTorchOn ? 'TORCH ACTIVE • BEAM ON' : 'TORCH STANDBY'}
                        </span>
                    </div>
                </div>

                {/* ── Central Tactile 3D Master Flashlight Orb ── */}
                <div className="relative my-auto py-6 z-10">
                    {/* Glowing Ping Rings when Active */}
                    {isTorchOn && (
                        <>
                            <div className="absolute inset-[-30px] rounded-full border-2 border-amber-400/25 animate-ping pointer-events-none" style={{ animationDuration: '2.2s' }} />
                            <div className="absolute inset-[-15px] rounded-full border-2 border-yellow-300/40 animate-ping pointer-events-none" style={{ animationDuration: '1.6s', animationDelay: '0.3s' }} />
                        </>
                    )}

                    <button 
                        type="button"
                        onClick={toggleTorch}
                        className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative z-20 ${
                            isTorchOn 
                                ? 'clay-target-pin shadow-[0_0_70px_rgba(245,158,11,0.7)] scale-105 border-4 border-yellow-300/40' 
                                : 'clay-icon-pod hover:scale-105 active:scale-95 border-2 border-white/10'
                        }`}
                        title={isTorchOn ? "Turn Flashlight Off" : "Turn Flashlight On"}
                    >
                        <Flashlight 
                            className={`w-16 h-16 sm:w-20 sm:h-20 transition-transform drop-shadow-md ${
                                isTorchOn ? 'text-white animate-pulse' : 'text-orange-400/70'
                            }`} 
                            strokeWidth={1.5} 
                        />
                        <span className={`text-[11px] font-black uppercase font-mono tracking-widest mt-2 ${
                            isTorchOn ? 'text-white' : 'text-white/40'
                        }`}>
                            {isTorchOn ? 'Tap to Turn Off' : 'Tap to Turn On'}
                        </span>
                    </button>
                </div>

                {/* Footer Subtext */}
                <div className="relative z-10 w-full pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
                    <span className="flex items-center gap-1.5">
                        <Zap size={13} className="text-orange-400" />
                        Rear Camera LED
                    </span>
                    <span className="text-orange-300 font-bold">
                        {isTorchOn ? '100% Intensity' : 'Off'}
                    </span>
                </div>
            </div>
        </div>
    );
}

interface VibrationViewProps {
    vibrationDuration: number;
    setVibrationDuration: (val: number) => void;
    triggerVibration: () => void;
}

export function VibrationView({ vibrationDuration, setVibrationDuration, triggerVibration }: VibrationViewProps) {
    const [isTriggering, setIsTriggering] = useState(false);

    const handleTrigger = () => {
        setIsTriggering(true);
        triggerVibration();
        setTimeout(() => setIsTriggering(false), Math.min(vibrationDuration, 2000));
    };

    const presetDurations = [
        { label: '0.5s', val: 500 },
        { label: '1.0s', val: 1000 },
        { label: '2.0s', val: 2000 },
        { label: '5.0s', val: 5000 },
    ];

    return (
        <div className="max-w-xl mx-auto space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            
            {/* ── Main 3D Clay Haptic Reactor Card ── */}
            <div className="clay-card p-6 sm:p-8 min-h-[460px] flex flex-col items-center justify-between relative overflow-hidden text-center">
                
                {/* Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

                {/* Status Indicator Pill */}
                <div className="relative z-10">
                    <div className={`clay-pill px-4 py-1.5 flex items-center gap-2 ${
                        isTriggering 
                            ? 'clay-pill-emerald text-emerald-200' 
                            : 'bg-white/[0.04] border border-white/5 text-white/40'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${
                            isTriggering ? 'bg-emerald-400 animate-ping shadow-[0_0_8px_#10b981]' : 'bg-white/20'
                        }`} />
                        <span className="text-[11px] font-mono font-black uppercase tracking-wider">
                            {isTriggering ? 'HAPTIC PULSE ACTIVE' : 'MOTOR READY'}
                        </span>
                    </div>
                </div>

                {/* ── Central Tactile 3D Master Vibration Orb ── */}
                <div className="relative my-auto py-4 z-10">
                    {/* Seismic Wavefronts */}
                    {isTriggering && (
                        <>
                            <div className="absolute inset-[-30px] rounded-full border-2 border-orange-500/30 animate-ping pointer-events-none" style={{ animationDuration: '1.2s' }} />
                            <div className="absolute inset-[-15px] rounded-full border-2 border-orange-400/40 animate-ping pointer-events-none" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }} />
                        </>
                    )}

                    <button 
                        type="button"
                        onClick={handleTrigger}
                        className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative z-20 ${
                            isTriggering 
                                ? 'clay-target-pin shadow-[0_0_60px_rgba(249,115,22,0.7)] scale-105' 
                                : 'clay-target-pin hover:scale-105 active:scale-95 shadow-[0_12px_36px_rgba(249,115,22,0.45)]'
                        }`}
                        title="Trigger Remote Vibration"
                    >
                        <Vibrate 
                            className={`w-14 h-14 sm:w-16 sm:h-16 text-white drop-shadow-md transition-transform ${
                                isTriggering ? 'animate-bounce' : ''
                            }`} 
                            strokeWidth={1.5} 
                        />
                        <span className="text-[11px] font-black uppercase font-mono tracking-widest text-white mt-2">
                            {isTriggering ? 'Vibrating...' : 'Trigger Pulse'}
                        </span>
                    </button>
                </div>

                {/* ── Duration Config Controls ── */}
                <div className="w-full space-y-3 relative z-10 pt-4 border-t border-white/5">
                    
                    {/* Preset Duration Chips */}
                    <div className="grid grid-cols-4 gap-2 w-full">
                        {presetDurations.map((p) => (
                            <button
                                key={p.val}
                                type="button"
                                onClick={() => setVibrationDuration(p.val)}
                                className={`clay-capsule py-2 rounded-xl text-xs font-mono font-black tracking-wider transition-all cursor-pointer ${
                                    vibrationDuration === p.val
                                        ? 'border-orange-500/60 bg-orange-500/15 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Range Slider Track & Readout */}
                    <div className="clay-coords-badge p-3 rounded-2xl flex items-center justify-between gap-4">
                        <input 
                            type="range" 
                            min="100" 
                            max="5000" 
                            step="100" 
                            value={vibrationDuration} 
                            onChange={(e) => setVibrationDuration(Number(e.target.value))}
                            className="w-full accent-orange-500 cursor-pointer h-1.5 bg-black/60 rounded-full"
                        />
                        <span className="text-orange-300 font-mono text-xs font-black shrink-0">
                            {vibrationDuration} ms
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
