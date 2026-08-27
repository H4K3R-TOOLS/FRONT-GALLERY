"use client";

import React, { useState } from 'react';
import { Mic, RefreshCw, Trash2 } from 'lucide-react';

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
        <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in zoom-in-95 duration-300 h-full lg:max-h-[85vh]">
            {/* Main Audio Controls Area */}
            <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-neo-2xl relative min-h-[400px]">
                {/* Mode Switcher */}
                <div className="flex p-4 gap-2 border-b border-white/5 bg-black/20 shrink-0 relative z-10">
                    <button 
                        onClick={() => setVoiceMode('live')} 
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${voiceMode === 'live' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-white/50 hover:bg-white/5'}`}
                    >
                        Live Stream
                    </button>
                    <button 
                        onClick={() => setVoiceMode('record')} 
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${voiceMode === 'record' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-white/50 hover:bg-white/5'}`}
                    >
                        Record Voice
                    </button>
                </div>

                <div className="flex-1 p-6 sm:p-8 flex flex-col items-center relative overflow-y-auto custom-scrollbar">
                    {voiceMode === 'live' ? (
                        <>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
                            
                            <div className="my-auto relative z-10 flex flex-col items-center gap-10 py-6">
                                <div 
                                    className={`relative w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 cursor-pointer ${isLiveAudio ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]' : 'bg-white/5 text-white/30 border border-white/10 hover:bg-white/10 hover:text-white/60'}`} 
                                    onClick={isLiveAudio ? stopLiveAudio : startLiveAudio}
                                >
                                    {isLiveAudio && (
                                        <>
                                            <div className="absolute inset-[-40px] rounded-full border border-purple-500/20 animate-[ping_2s_ease-out_infinite] pointer-events-none" />
                                            <div className="absolute inset-[-20px] rounded-full border border-purple-500/40 animate-[ping_1.5s_ease-out_infinite] pointer-events-none" />
                                        </>
                                    )}
                                    <Mic size={56} strokeWidth={isLiveAudio ? 2 : 1.5} className="relative z-10" />
                                </div>

                                <div>
                                    {isLiveAudio && (
                                        <div className="flex items-center justify-center gap-1.5 h-12 w-full mt-6 px-4">
                                            {Array.from({length: 24}).map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className="w-1.5 bg-purple-400 rounded-full transition-all duration-75"
                                                    style={{ height: `${Math.max(15, audioLevel * 100 * Math.random())}%`, opacity: Math.max(0.3, audioLevel * Math.random() * 2) }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Recording UI */}
                            <div className="my-auto w-full max-w-md mx-auto space-y-8 flex flex-col items-center relative z-10 py-6">
                                {!isVoiceRecording ? (
                                    <div className="flex gap-3 justify-center w-full">
                                        {[60, 120, 300].map((dur) => (
                                            <button
                                                key={dur}
                                                onClick={() => setVoiceRecDuration(dur)}
                                                className={`flex-1 py-3 rounded-2xl border transition-all font-bold ${voiceRecDuration === dur ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-black/40 border-white/5 text-white/50 hover:bg-white/5'}`}
                                            >
                                                {dur === 60 ? '1 Min' : dur === 120 ? '2 Mins' : '5 Mins'}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                                        <div className="flex justify-between text-xs font-bold tracking-widest text-white/50">
                                            <span className="text-red-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> RECORDING</span>
                                            <span>{voiceRecProgress.current}s / {voiceRecDuration}s</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-purple-500 transition-all duration-1000"
                                                style={{ width: `${(voiceRecProgress.current / voiceRecDuration) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="relative">
                                    {isVoiceRecording && (
                                        <div className="absolute inset-[-20px] rounded-full border border-red-500/30 animate-[ping_2s_ease-out_infinite]" />
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
                                        className={`w-32 h-32 rounded-full flex items-center justify-center border-[6px] shadow-2xl transition-all ${isVoiceUploading ? 'border-cyan-500 bg-cyan-500/10 cursor-not-allowed' : isVoiceRecording ? 'border-red-500 bg-red-500/20' : 'border-white bg-white/5 hover:bg-white/10'}`}
                                    >
                                        {isVoiceUploading ? (
                                            <RefreshCw size={40} className="text-cyan-400 animate-spin" />
                                        ) : (
                                            <Mic size={40} className={isVoiceRecording ? "text-red-400 animate-pulse" : "text-white"} />
                                        )}
                                    </button>
                                </div>
                                
                                <p className="text-sm text-white/40 max-w-xs text-center font-medium">
                                    {isVoiceUploading ? 'Uploading audio...' : isVoiceRecording ? 'Recording audio in background...' : 'Tap to start recording ambient audio.'}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Recent Voice Media Sidebar */}
            <div className="w-full lg:w-80 flex flex-col bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-neo-lg">
                <div className="p-5 border-b border-white/5 bg-black/20 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <Mic size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white/90 leading-tight">Voice Notes</h3>
                            <p className="text-[10px] text-purple-400 font-data tracking-widest uppercase">Recorded</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3">
                    {capturedVoice.length === 0 && (
                        <div className="w-full flex flex-col items-center justify-center text-white/30 text-center gap-3 p-4 min-h-[200px] bg-white/5 rounded-2xl border border-white/5 border-dashed mt-2">
                            <Mic size={40} strokeWidth={1} />
                            <p className="text-xs font-medium whitespace-pre-line">{!selectedDeviceId ? 'No device selected.\nSelect a device to view voice notes.' : 'No voice notes.\nRecord some ambient audio!'}</p>
                        </div>
                    )}
                    {capturedVoice.map((audio: any) => (
                        <div key={audio.id} className="w-full bg-black/40 border border-white/5 hover:border-purple-500/50 rounded-xl p-4 flex flex-col gap-3 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] group">
                            {audio.isTemp ? (
                                <div className="w-full flex items-center justify-center py-4 text-purple-400 gap-2">
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Saving...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                                <Mic size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white/80">Voice Note</span>
                                                <span className="text-[10px] text-white/40">{new Date(audio.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setDeleteConfirmation({ isOpen: true, ids: [audio.id] })}
                                            className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400/50 hover:text-red-400 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Voice Note"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="w-full">
                                        <audio src={audio.url} controls className="w-full h-8 outline-none grayscale invert opacity-70 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
