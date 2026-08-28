"use client";

import React, { useState } from 'react';
import { 
    Mic, RefreshCw, Trash2, Radio, Square, 
    Volume2, Download, Disc
} from 'lucide-react';

interface VoiceViewProps {
    isLiveAudio: boolean;
    audioLevel: number;
    startLiveAudio: () => void;
    stopLiveAudio: () => void;
    voiceRecDuration: number;
    setVoiceRecDuration: (d: number) => void;
    isVoiceRecording: boolean;
    voiceRecProgress: { current: number };
    isVoiceUploading: boolean;
    startVoiceRecording: () => void;
    stopVoiceRecording: () => void;
    capturedVoice: any[];
    setDeleteConfirmation: (data: { isOpen: boolean; ids: string[] }) => void;
    selectedDeviceId: string | null;
}

export default function VoiceView({
    isLiveAudio,
    audioLevel,
    startLiveAudio,
    stopLiveAudio,
    voiceRecDuration,
    setVoiceRecDuration,
    isVoiceRecording,
    voiceRecProgress,
    isVoiceUploading,
    startVoiceRecording,
    stopVoiceRecording,
    capturedVoice,
    setDeleteConfirmation,
    selectedDeviceId
}: VoiceViewProps) {
    const [voiceMode, setVoiceMode] = useState<'live' | 'record'>('live');

    return (
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            
            {/* ── Clean Top Segment Switcher ── */}
            <div className="clay-card p-3 sm:p-4 flex items-center justify-between gap-3">
                {/* Mode Selector */}
                <div className="flex items-center bg-[#0c0e12] p-1.5 rounded-2xl border border-white/5 shadow-inner w-full sm:w-auto">
                    <button 
                        type="button"
                        onClick={() => setVoiceMode('live')} 
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            voiceMode === 'live' 
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_16px_rgba(249,115,22,0.45)]' 
                                : 'bg-transparent text-white/40 hover:text-white/80'
                        }`}
                    >
                        Live Stream
                    </button>
                    <button 
                        type="button"
                        onClick={() => setVoiceMode('record')} 
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            voiceMode === 'record' 
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_16px_rgba(249,115,22,0.45)]' 
                                : 'bg-transparent text-white/40 hover:text-white/80'
                        }`}
                    >
                        Recorder
                    </button>
                </div>

                {/* Status Indicator Pill (Desktop / Tablet only) */}
                <div className="hidden md:flex items-center gap-2">
                    {isLiveAudio ? (
                        <div className="clay-pill px-3.5 py-1.5 clay-pill-emerald text-emerald-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                            <span className="text-[11px] font-mono font-black uppercase tracking-wider">MIC ACTIVE</span>
                        </div>
                    ) : isVoiceRecording ? (
                        <div className="clay-pill px-3.5 py-1.5 bg-red-500/15 border border-red-500/40 text-red-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <span className="text-[11px] font-mono font-black uppercase tracking-wider">
                                REC ({voiceRecProgress.current}s / {voiceRecDuration}s)
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* ── Main Audio Deck & Recordings Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
                
                {/* Main Acoustic Stage (Live & Recording) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="clay-card p-6 sm:p-8 min-h-[380px] sm:min-h-[440px] flex flex-col justify-center items-center relative overflow-hidden">
                        
                        {/* Ambient Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

                        {voiceMode === 'live' ? (
                            <>
                                {/* ── Live Microphone Stream Stage ── */}
                                <div className="w-full flex flex-col items-center justify-center relative z-10 gap-6 my-auto">
                                    <div className="relative">
                                        {/* Pinging Acoustic Wavefronts */}
                                        {isLiveAudio && (
                                            <>
                                                <div className="absolute inset-[-32px] rounded-full border-2 border-orange-500/20 animate-ping pointer-events-none" style={{ animationDuration: '2.4s' }} />
                                                <div className="absolute inset-[-16px] rounded-full border-2 border-orange-400/35 animate-ping pointer-events-none" style={{ animationDuration: '1.6s', animationDelay: '0.3s' }} />
                                            </>
                                        )}

                                        {/* Master 3D Clay Mic Trigger */}
                                        <button 
                                            type="button"
                                            onClick={isLiveAudio ? stopLiveAudio : startLiveAudio}
                                            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative z-20 ${
                                                isLiveAudio 
                                                    ? 'clay-target-pin shadow-[0_0_45px_rgba(249,115,22,0.6)] scale-105' 
                                                    : 'clay-icon-pod hover:scale-105 active:scale-95 border-2 border-white/10'
                                            }`}
                                            title={isLiveAudio ? "Stop Live Audio" : "Start Live Audio Streaming"}
                                        >
                                            <Mic className={`w-12 h-12 sm:w-14 sm:h-14 transition-transform drop-shadow-md ${
                                                isLiveAudio ? 'text-white animate-pulse' : 'text-orange-400/80'
                                            }`} />
                                            <span className={`text-[10px] font-black uppercase font-mono tracking-widest mt-1.5 ${
                                                isLiveAudio ? 'text-white' : 'text-white/40'
                                            }`}>
                                                {isLiveAudio ? 'Tap to Mute' : 'Tap to Listen'}
                                            </span>
                                        </button>
                                    </div>

                                    {/* 28-Bar Live Waveform Equalizer */}
                                    <div className="w-full max-w-sm px-2">
                                        {isLiveAudio && (
                                            <div className="clay-coords-badge p-3.5 rounded-2xl flex items-center justify-center gap-1.5 h-14 w-full">
                                                {Array.from({ length: 28 }).map((_, i) => {
                                                    const barMultiplier = Math.sin((i / 28) * Math.PI);
                                                    const heightPercent = Math.max(14, Math.min(100, Math.round((audioLevel || 0.4) * 100 * (0.4 + 0.6 * barMultiplier) * (0.6 + 0.8 * Math.random()))));
                                                    return (
                                                        <div 
                                                            key={i} 
                                                            className="w-1.5 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-75"
                                                            style={{ height: `${heightPercent}%` }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* ── Voice Recording Studio Stage ── */}
                                <div className="w-full max-w-sm flex flex-col items-center justify-center relative z-10 gap-5 my-auto">
                                    
                                    {/* Duration Selector Pods */}
                                    {!isVoiceRecording ? (
                                        <div className="grid grid-cols-3 gap-2 w-full">
                                            {[60, 120, 300].map((dur) => (
                                                <button
                                                    key={dur}
                                                    type="button"
                                                    onClick={() => setVoiceRecDuration(dur)}
                                                    className={`clay-capsule py-2.5 rounded-xl font-mono text-xs font-black tracking-wider transition-all cursor-pointer text-center ${
                                                        voiceRecDuration === dur 
                                                            ? 'border-orange-500/60 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.3)] bg-orange-500/15' 
                                                            : 'text-white/40 hover:text-white'
                                                    }`}
                                                >
                                                    {dur === 60 ? '1 Min' : dur === 120 ? '2 Mins' : '5 Mins'}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="clay-coords-badge p-3 rounded-xl w-full flex flex-col gap-2">
                                            <div className="flex justify-between items-center text-[11px] font-bold font-mono tracking-widest">
                                                <span className="text-red-400 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> RECORDING
                                                </span>
                                                <span className="text-white font-mono text-xs">{voiceRecProgress.current}s / {voiceRecDuration}s</span>
                                            </div>
                                            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-1000"
                                                    style={{ width: `${Math.min(100, (voiceRecProgress.current / voiceRecDuration) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* 3D Master Recording Shutter Button */}
                                    <div className="relative my-1">
                                        {isVoiceRecording && (
                                            <div className="absolute inset-[-20px] rounded-full border-2 border-red-500/30 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
                                        )}
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (isVoiceUploading) return;
                                                if (isVoiceRecording) {
                                                    stopVoiceRecording();
                                                } else {
                                                    startVoiceRecording();
                                                }
                                            }}
                                            className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer ${
                                                isVoiceUploading 
                                                    ? 'clay-capsule opacity-80 cursor-not-allowed' 
                                                    : isVoiceRecording 
                                                    ? 'clay-target-pin shadow-[0_0_45px_rgba(239,68,68,0.5)] border-red-500 scale-105' 
                                                    : 'clay-target-pin hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(249,115,22,0.4)]'
                                            }`}
                                            title={isVoiceRecording ? "Stop Recording" : "Start Voice Recording"}
                                        >
                                            {isVoiceUploading ? (
                                                <RefreshCw className="w-10 h-10 text-orange-400 animate-spin" />
                                            ) : isVoiceRecording ? (
                                                <Square className="w-10 h-10 text-white animate-pulse" />
                                            ) : (
                                                <Mic className="w-10 h-10 text-white drop-shadow-md" />
                                            )}
                                            <span className="text-[10px] font-black uppercase font-mono tracking-widest text-white mt-1">
                                                {isVoiceUploading ? 'Saving...' : isVoiceRecording ? 'Stop REC' : 'Record Now'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Side Panel: Recent Audio Notes Reel ── */}
                <div className="clay-card p-4 sm:p-5 flex flex-col h-[440px] sm:h-[480px]">
                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
                        <div className="flex items-center gap-2.5">
                            <div className="clay-icon-pod w-8 h-8 rounded-lg flex items-center justify-center">
                                <Volume2 className="w-4 h-4 text-orange-400" />
                            </div>
                            <h3 className="font-black text-xs uppercase tracking-wider text-white">Audio Reel ({capturedVoice.length})</h3>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5">
                        {capturedVoice.length === 0 && (
                            <div className="w-full flex flex-col items-center justify-center text-white/30 text-center gap-2 p-6 min-h-[220px] rounded-2xl border border-white/5 border-dashed">
                                <Mic size={32} strokeWidth={1.5} className="text-orange-400/40" />
                                <p className="text-xs font-mono font-medium text-white/40">
                                    {!selectedDeviceId ? 'Select a device.' : 'No audio notes recorded.'}
                                </p>
                            </div>
                        )}
                        {capturedVoice.map((audio: any, idx: number) => (
                            <div 
                                key={audio.id || idx} 
                                className="clay-capsule p-3 rounded-xl flex flex-col gap-2 transition-all hover:border-orange-500/30 group"
                            >
                                {audio.isTemp ? (
                                    <div className="w-full flex items-center justify-center py-3 text-orange-300 gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                                        <span className="text-xs font-mono font-bold uppercase tracking-widest">Processing...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-400">
                                                    <Volume2 size={12} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white/90 font-mono">Note #{capturedVoice.length - idx}</span>
                                                    <span className="text-[9px] text-white/40 font-mono">{new Date(audio.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <a 
                                                    href={audio.url} 
                                                    download={`audio_note_${audio.id}.mp3`}
                                                    className="clay-button-sm p-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
                                                    title="Download"
                                                >
                                                    <Download size={11} />
                                                </a>
                                                <button 
                                                    type="button"
                                                    onClick={() => setDeleteConfirmation({ isOpen: true, ids: [audio.id] })}
                                                    className="clay-card-error p-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Audio Player Container */}
                                        <div className="w-full rounded-lg bg-black/40 p-1 border border-white/5">
                                            <audio 
                                                src={audio.url} 
                                                controls 
                                                className="w-full h-6 outline-none opacity-80 hover:opacity-100 transition-opacity" 
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
