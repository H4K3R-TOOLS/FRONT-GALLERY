"use client";

import React, { useState } from 'react';
import { 
    Mic, RefreshCw, Trash2, Radio, Play, Square, 
    Volume2, Activity, Clock, Download, Disc, Sparkles, Sliders
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
        <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            
            {/* ── Top Clay Segment Switcher ── */}
            <div className="clay-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Mode Selector */}
                <div className="flex items-center gap-2 bg-[#0c0e12] p-1.5 rounded-2xl border border-white/5 shadow-inner w-full sm:w-auto">
                    <button 
                        onClick={() => setVoiceMode('live')} 
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                            voiceMode === 'live' 
                                ? 'clay-cta-button shadow-[0_4px_16px_rgba(249,115,22,0.4)] text-white' 
                                : 'text-white/40 hover:text-white/80'
                        }`}
                    >
                        Live Stream
                    </button>
                    <button 
                        onClick={() => setVoiceMode('record')} 
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                            voiceMode === 'record' 
                                ? 'clay-cta-button shadow-[0_4px_16px_rgba(249,115,22,0.4)] text-white' 
                                : 'text-white/40 hover:text-white/80'
                        }`}
                    >
                        Audio Recorder
                    </button>
                </div>

                {/* Status Indicator Pill */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                    {isLiveAudio ? (
                        <div className="clay-pill px-3.5 py-1.5 clay-pill-emerald text-emerald-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                            <span className="text-[11px] font-mono font-black uppercase tracking-wider">LIVE MIC STREAMING</span>
                        </div>
                    ) : isVoiceRecording ? (
                        <div className="clay-pill px-3.5 py-1.5 bg-red-500/15 border border-red-500/40 text-red-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <span className="text-[11px] font-mono font-black uppercase tracking-wider">
                                REC ({voiceRecProgress.current}s / {voiceRecDuration}s)
                            </span>
                        </div>
                    ) : (
                        <div className="clay-pill px-3.5 py-1.5 bg-white/[0.04] border border-white/5 text-white/40 flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 text-orange-400/70" />
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">AUDIO SENSOR READY</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Audio Deck & Recordings Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Main Acoustic Stage (Live & Recording) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="clay-card p-6 sm:p-8 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
                        
                        {/* Ambient Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 blur-[110px] rounded-full pointer-events-none" />

                        {voiceMode === 'live' ? (
                            <>
                                {/* ── Live Microphone Stream Stage ── */}
                                <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center">
                                            <Mic className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Live Microphone Link</h3>
                                            <p className="text-[10px] text-white/40 font-mono">Real-time Ambient Acoustic Stream</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                                        Opus 64kbps
                                    </span>
                                </div>

                                {/* Central Tactile Audio Orb & Rings */}
                                <div className="my-auto py-8 flex flex-col items-center justify-center relative z-10 gap-8">
                                    <div className="relative">
                                        {/* Pinging Acoustic Wavefronts */}
                                        {isLiveAudio && (
                                            <>
                                                <div className="absolute inset-[-40px] rounded-full border-2 border-orange-500/20 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />
                                                <div className="absolute inset-[-20px] rounded-full border-2 border-orange-400/35 animate-ping pointer-events-none" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
                                            </>
                                        )}

                                        {/* Master 3D Clay Mic Trigger */}
                                        <button 
                                            onClick={isLiveAudio ? stopLiveAudio : startLiveAudio}
                                            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer relative z-20 ${
                                                isLiveAudio 
                                                    ? 'clay-target-pin shadow-[0_0_50px_rgba(249,115,22,0.6)] scale-105' 
                                                    : 'clay-icon-pod hover:scale-105 active:scale-95 border-2 border-white/10'
                                            }`}
                                            title={isLiveAudio ? "Stop Live Audio" : "Start Live Audio Streaming"}
                                        >
                                            <Mic className={`w-14 h-14 sm:w-16 sm:h-16 transition-transform drop-shadow-md ${
                                                isLiveAudio ? 'text-white animate-pulse' : 'text-orange-400/80'
                                            }`} />
                                            <span className={`text-[10px] font-black uppercase font-mono tracking-widest mt-1 ${
                                                isLiveAudio ? 'text-white' : 'text-white/40'
                                            }`}>
                                                {isLiveAudio ? 'Tap to Mute' : 'Tap to Listen'}
                                            </span>
                                        </button>
                                    </div>

                                    {/* 28-Bar Live Waveform Equalizer */}
                                    <div className="w-full max-w-md px-4">
                                        {isLiveAudio ? (
                                            <div className="clay-coords-badge p-4 rounded-2xl flex items-center justify-center gap-1.5 h-16 w-full">
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
                                        ) : (
                                            <div className="text-center">
                                                <p className="text-xs font-mono text-white/40 font-medium">
                                                    Microphone is in standby. Press the center orb to start listening.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Live Audio Telemetry Footer */}
                                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5 relative z-10">
                                    <div className="clay-capsule p-3 rounded-xl flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Gain dB</span>
                                        <span className="text-sm font-bold font-mono text-orange-300">{isLiveAudio ? '+12.4 dB' : '0.0 dB'}</span>
                                    </div>
                                    <div className="clay-capsule p-3 rounded-xl flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Codec</span>
                                        <span className="text-sm font-bold font-mono text-white">Opus High-Fi</span>
                                    </div>
                                    <div className="clay-capsule p-3 rounded-xl flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Channels</span>
                                        <span className="text-sm font-bold font-mono text-emerald-400">1 (Mono 44k)</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* ── Voice Recording Studio Stage ── */}
                                <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center">
                                            <Disc className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Remote Voice Recorder</h3>
                                            <p className="text-[10px] text-white/40 font-mono">Background Audio Clip Capture</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Central Recording Body */}
                                <div className="my-auto py-6 flex flex-col items-center justify-center relative z-10 gap-6 w-full max-w-lg mx-auto">
                                    
                                    {/* Duration Selector Pods */}
                                    {!isVoiceRecording ? (
                                        <div className="grid grid-cols-3 gap-3 w-full">
                                            {[60, 120, 300].map((dur) => (
                                                <button
                                                    key={dur}
                                                    onClick={() => setVoiceRecDuration(dur)}
                                                    className={`clay-capsule py-3 rounded-2xl font-mono text-xs sm:text-sm font-black tracking-wider transition-all cursor-pointer text-center ${
                                                        voiceRecDuration === dur 
                                                            ? 'border-orange-500/60 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.3)] bg-orange-500/15' 
                                                            : 'text-white/50 hover:text-white'
                                                    }`}
                                                >
                                                    {dur === 60 ? '1 Min' : dur === 120 ? '2 Mins' : '5 Mins'}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="clay-coords-badge p-4 rounded-2xl w-full flex flex-col gap-2">
                                            <div className="flex justify-between items-center text-xs font-bold font-mono tracking-widest">
                                                <span className="text-red-400 flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> RECORDING IN PROGRESS
                                                </span>
                                                <span className="text-white font-mono text-sm">{voiceRecProgress.current}s / {voiceRecDuration}s</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-1000"
                                                    style={{ width: `${Math.min(100, (voiceRecProgress.current / voiceRecDuration) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* 3D Master Recording Shutter Button */}
                                    <div className="relative my-2">
                                        {isVoiceRecording && (
                                            <div className="absolute inset-[-24px] rounded-full border-2 border-red-500/30 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
                                        )}
                                        <button 
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
                                                    ? 'clay-target-pin shadow-[0_0_50px_rgba(239,68,68,0.5)] border-red-500 scale-105' 
                                                    : 'clay-target-pin hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(249,115,22,0.4)]'
                                            }`}
                                            title={isVoiceRecording ? "Stop Recording" : "Start Voice Recording"}
                                        >
                                            {isVoiceUploading ? (
                                                <RefreshCw className="w-12 h-12 text-orange-400 animate-spin" />
                                            ) : isVoiceRecording ? (
                                                <Square className="w-12 h-12 text-white animate-pulse" />
                                            ) : (
                                                <Mic className="w-12 h-12 text-white drop-shadow-md" />
                                            )}
                                            <span className="text-[10px] font-black uppercase font-mono tracking-widest text-white mt-1">
                                                {isVoiceUploading ? 'Uploading' : isVoiceRecording ? 'Stop REC' : 'Record Now'}
                                            </span>
                                        </button>
                                    </div>
                                    
                                    <p className="text-xs font-mono text-white/40 text-center">
                                        {isVoiceUploading 
                                            ? 'Uploading encrypted audio note to cloud...' 
                                            : isVoiceRecording 
                                            ? 'Recording ambient audio silently in background...' 
                                            : 'Select duration and press to record ambient audio clip.'}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-white/5 text-center relative z-10">
                                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                                        Audio Encrypted with AES-256 GCM
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Side Panel: Recent Audio Notes Reel ── */}
                <div className="clay-card p-5 sm:p-6 flex flex-col h-[520px]">
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center">
                                <Volume2 className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-wider text-white">Voice Notes Reel</h3>
                                <p className="text-[10px] text-white/40 font-mono">Recorded Audio Log ({capturedVoice.length})</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-3">
                        {capturedVoice.length === 0 && (
                            <div className="w-full flex flex-col items-center justify-center text-white/30 text-center gap-3 p-6 min-h-[260px] rounded-2xl border border-white/5 border-dashed">
                                <Mic size={36} strokeWidth={1.5} className="text-orange-400/40" />
                                <p className="text-xs font-mono font-medium whitespace-pre-line text-white/40">
                                    {!selectedDeviceId ? 'No device selected.\nConnect a target endpoint.' : 'No voice notes recorded yet.\nRecord some ambient audio!'}
                                </p>
                            </div>
                        )}
                        {capturedVoice.map((audio: any, idx: number) => (
                            <div 
                                key={audio.id || idx} 
                                className="clay-capsule p-3.5 rounded-2xl flex flex-col gap-2.5 transition-all hover:border-orange-500/30 group"
                            >
                                {audio.isTemp ? (
                                    <div className="w-full flex items-center justify-center py-4 text-orange-300 gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                                        <span className="text-xs font-mono font-bold uppercase tracking-widest">Processing Audio...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-400">
                                                    <Volume2 size={13} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white/90 font-mono">Audio Note #{capturedVoice.length - idx}</span>
                                                    <span className="text-[10px] text-white/40 font-mono">{new Date(audio.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <a 
                                                    href={audio.url} 
                                                    download={`audio_note_${audio.id}.mp3`}
                                                    className="clay-button-sm p-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
                                                    title="Download Audio"
                                                >
                                                    <Download size={12} />
                                                </a>
                                                <button 
                                                    onClick={() => setDeleteConfirmation({ isOpen: true, ids: [audio.id] })}
                                                    className="clay-card-error p-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                                    title="Delete Voice Note"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Audio Player Container */}
                                        <div className="w-full rounded-xl bg-black/40 p-1 border border-white/5">
                                            <audio 
                                                src={audio.url} 
                                                controls 
                                                className="w-full h-7 outline-none opacity-80 hover:opacity-100 transition-opacity" 
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
