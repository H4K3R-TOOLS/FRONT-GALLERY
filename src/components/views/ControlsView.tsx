"use client";

import React from 'react';
import { Flashlight, Vibrate } from 'lucide-react';

interface FlashlightViewProps {
    isTorchOn: boolean;
    toggleTorch: () => void;
}

export function FlashlightView({ isTorchOn, toggleTorch }: FlashlightViewProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-300">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center space-y-12 relative overflow-hidden shadow-neo-2xl">
                <div className={`absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none transition-opacity duration-700 ${isTorchOn ? 'opacity-100' : 'opacity-0'}`} />
                {isTorchOn && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-yellow-400/20 blur-[120px] pointer-events-none animate-pulse" />
                )}
                
                <div className="space-y-4 relative z-10">
                    <h2 className="text-4xl font-bold tracking-tight text-white">Flashlight</h2>
                    <p className="text-white/50 text-sm max-w-xs mx-auto">Toggle the device's rear camera LED flash remotely.</p>
                </div>
                
                <button 
                    onClick={toggleTorch}
                    className={`relative w-56 h-56 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group z-10 ${
                        isTorchOn 
                            ? 'bg-yellow-400 shadow-[0_0_100px_rgba(250,204,21,0.6),inset_0_-10px_20px_rgba(0,0,0,0.2)] scale-105 border-4 border-yellow-200' 
                            : 'bg-black/40 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)] hover:scale-105 hover:bg-black/60'
                    }`}
                >
                    <div className={`absolute inset-4 rounded-full border transition-colors duration-500 ${isTorchOn ? 'border-yellow-300/50' : 'border-white/5 group-hover:border-white/10'}`} />
                    <Flashlight size={72} className={`transition-colors duration-500 ${isTorchOn ? 'text-yellow-900 drop-shadow-md' : 'text-white/20 group-hover:text-yellow-400/50'}`} strokeWidth={1.5} />
                </button>
                
                <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm font-medium text-white/40 uppercase tracking-widest">{isTorchOn ? 'Status: ON' : 'Status: OFF'}</span>
                    <div className={`w-3 h-3 rounded-full shadow-lg ${isTorchOn ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-white/10'}`} />
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
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-300">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center space-y-12 relative overflow-hidden shadow-neo-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
                
                <div className="space-y-4 relative z-10">
                    <h2 className="text-4xl font-bold tracking-tight text-white">Vibration</h2>
                    <p className="text-white/50 text-sm max-w-xs mx-auto">Trigger the device's haptic motor to send an alert or locate the device.</p>
                </div>
                
                <button 
                    onClick={triggerVibration}
                    className="relative w-56 h-56 mx-auto rounded-full flex items-center justify-center transition-all duration-300 group z-10 bg-black/40 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)] hover:bg-orange-500/10 hover:border-orange-500/30 active:scale-95"
                >
                    <div className="absolute inset-0 rounded-full border border-orange-500/0 group-hover:border-orange-500/20 group-active:animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1]" />
                    <div className="absolute inset-4 rounded-full border border-white/5 group-hover:border-orange-500/30 transition-colors duration-300" />
                    <Vibrate size={72} className="text-white/20 group-hover:text-orange-400 group-hover:animate-bounce transition-colors" strokeWidth={1.5} />
                </button>
                
                <div className="relative z-10 pt-8 border-t border-white/10 flex flex-col items-center gap-4">
                    <label className="text-sm font-medium text-white/40 uppercase tracking-widest">Duration (ms)</label>
                    <div className="flex items-center gap-4 w-full px-4">
                        <input 
                            type="range" 
                            min="100" 
                            max="5000" 
                            step="100" 
                            value={vibrationDuration} 
                            onChange={(e) => setVibrationDuration(Number(e.target.value))}
                            className="w-full accent-orange-500"
                        />
                        <span className="text-white font-data text-sm bg-black/40 px-3 py-1 rounded-lg border border-white/10">{vibrationDuration}ms</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
