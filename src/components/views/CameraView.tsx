"use client";

import React, { useState } from 'react';
import { 
    Camera, Video, Square, RefreshCw, Maximize, Minimize, 
    Settings2, ChevronDown, CheckSquare, Download, Trash2, 
    Image as ImageIcon, Sparkles, Sliders, Radio, Zap
} from 'lucide-react';

interface CameraViewProps {
    cameraMode: 'front' | 'back';
    setCameraMode: (mode: 'front' | 'back') => void;
    cameraQuality: number;
    setCameraQuality: (q: number) => void;
    recordingDuration: number;
    setRecordingDuration: (d: number) => void;
    isLiveStreaming: boolean;
    isCapturingPhoto: boolean;
    isRecording: boolean;
    recordingProgress: { current: number; total: number };
    liveImageRef: React.RefObject<HTMLImageElement>;
    capturedMedia: any[];
    onToggleLiveStream: () => void;
    onCapturePhoto: () => void;
    onToggleRecording: () => void;
    setPreviewItem: (item: any) => void;
    setDeleteConfirmation: (data: { isOpen: boolean; ids: string[] }) => void;
    selectedDeviceId: string | null;
}

export default function CameraView({
    cameraMode,
    setCameraMode,
    cameraQuality,
    setCameraQuality,
    recordingDuration,
    setRecordingDuration,
    isLiveStreaming,
    isCapturingPhoto,
    isRecording,
    recordingProgress,
    liveImageRef,
    capturedMedia,
    onToggleLiveStream,
    onCapturePhoto,
    onToggleRecording,
    setPreviewItem,
    setDeleteConfirmation,
    selectedDeviceId
}: CameraViewProps) {
    const [isCameraFullscreen, setIsCameraFullscreen] = useState(false);
    const [isQualityOpen, setIsQualityOpen] = useState(false);
    const [isDurationOpen, setIsDurationOpen] = useState(false);
    const [isCameraSelectMode, setIsCameraSelectMode] = useState(false);
    const [cameraSelectedItems, setCameraSelectedItems] = useState<Set<string>>(new Set());

    return (
        <div className={`space-y-6 animate-in fade-in zoom-in-95 duration-400 pb-16 ${
            isCameraFullscreen ? 'fixed inset-0 z-[300] bg-[#0a0d14] p-4 md:p-8 overflow-hidden' : ''
        }`}>
            
            {/* ── Top Clay Segment Switcher ── */}
            <div className="clay-card p-3 sm:p-4 flex items-center justify-between gap-4">
                {/* Mode Selector */}
                <div className="flex items-center gap-2 bg-[#0d0e12] p-1.5 rounded-2xl border border-white/5 shadow-inner w-full sm:w-auto">
                    <button 
                        onClick={() => setCameraMode('back')} 
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                            cameraMode === 'back' 
                                ? 'clay-cta-button shadow-[0_4px_16px_rgba(249,115,22,0.4)] text-white' 
                                : 'text-white/40 hover:text-white/80'
                        }`}
                    >
                        Rear Lens
                    </button>
                    <button 
                        onClick={() => setCameraMode('front')} 
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                            cameraMode === 'front' 
                                ? 'clay-cta-button shadow-[0_4px_16px_rgba(249,115,22,0.4)] text-white' 
                                : 'text-white/40 hover:text-white/80'
                        }`}
                    >
                        Front Lens
                    </button>
                </div>

                {/* Status Indicator Pill */}
                <div className="hidden sm:flex items-center gap-2">
                    {isLiveStreaming ? (
                        <div className="clay-pill px-3.5 py-1.5 clay-pill-emerald text-emerald-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                            <span className="text-[11px] font-mono font-black uppercase tracking-wider">LIVE STREAMING</span>
                        </div>
                    ) : isRecording ? (
                        <div className="clay-pill px-3.5 py-1.5 bg-red-500/15 border border-red-500/40 text-red-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <span className="text-[11px] font-mono font-black uppercase tracking-wider">
                                REC ({recordingProgress.current}s / {recordingProgress.total}s)
                            </span>
                        </div>
                    ) : (
                        <div className="clay-pill px-3.5 py-1.5 bg-white/[0.04] border border-white/5 text-white/40 flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 text-orange-400/70" />
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">SENSOR READY</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Viewport Grid ── */}
            <div className={`grid grid-cols-1 ${isCameraFullscreen ? 'h-[calc(100%-80px)]' : 'lg:grid-cols-3'} gap-6`}>
                
                {/* Viewfinder Deck */}
                <div className={`flex flex-col gap-4 ${isCameraFullscreen ? 'h-full' : 'lg:col-span-2'}`}>
                    
                    {/* Viewfinder Monitor Screen */}
                    <div className={`clay-card p-2 sm:p-3 relative overflow-hidden flex flex-col ${
                        isCameraFullscreen ? 'h-full flex-1' : ''
                    }`}>
                        <div className={`w-full bg-[#07090e] rounded-[1.75rem] border border-white/10 overflow-hidden relative flex items-center justify-center shadow-[inset_0_4px_24px_rgba(0,0,0,0.9)] ${
                            isCameraFullscreen ? 'h-full flex-1' : 'aspect-video'
                        }`}>
                            
                            {/* Grid / Reticle Overlay */}
                            <div className="absolute inset-0 opacity-25 pointer-events-none" style={{
                                backgroundImage: `
                                    linear-gradient(rgba(249,115,22,0.06) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(249,115,22,0.06) 1px, transparent 1px)
                                `,
                                backgroundSize: '40px 40px, 40px 40px'
                            }} />

                            {/* Viewport Content */}
                            {isLiveStreaming ? (
                                <img ref={liveImageRef} className="w-full h-full object-contain relative z-10" alt="Live Viewfeed" />
                            ) : isRecording ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-red-500/[0.04] z-10">
                                    <div className="flex flex-col items-center gap-5">
                                        <div className="clay-icon-pod w-20 h-20 rounded-full flex items-center justify-center border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                            <Square className="w-7 h-7 text-red-400 animate-pulse" />
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="text-red-400 font-mono font-black tracking-widest uppercase text-xs sm:text-sm">
                                                Recording in Progress
                                            </span>
                                            <div className="clay-coords-badge px-4 py-1.5 rounded-xl text-white font-mono text-lg font-black">
                                                {recordingProgress.current}s / {recordingProgress.total}s
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-white/20 flex flex-col items-center gap-3 relative z-10">
                                    <div className="clay-icon-pod w-20 h-20 rounded-3xl flex items-center justify-center">
                                        <Camera className="w-10 h-10 text-orange-400/50" />
                                    </div>
                                    <span className="text-xs font-mono font-bold tracking-widest uppercase text-white/30">
                                        Camera Feed Inactive
                                    </span>
                                </div>
                            )}

                            {/* Top Right Controls (Fullscreen Toggle) */}
                            <div className="absolute top-4 right-4 z-20">
                                <button 
                                    onClick={() => setIsCameraFullscreen(!isCameraFullscreen)} 
                                    className="clay-button-sm w-10 h-10 rounded-xl flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
                                    title={isCameraFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                                >
                                    {isCameraFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Tactile Clay Shutter Action Deck ── */}
                    <div className="clay-card p-4 sm:p-5 flex items-center justify-center gap-8 sm:gap-12">
                        
                        {/* Live Stream Trigger */}
                        <button 
                            onClick={onToggleLiveStream}
                            className={`clay-capsule w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isLiveStreaming 
                                    ? 'border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                                    : 'text-white/60 hover:text-white'
                            }`}
                            title="Live Video Stream"
                        >
                            <Video className={`w-5 h-5 sm:w-6 sm:h-6 ${isLiveStreaming ? 'text-emerald-400 animate-pulse' : 'text-orange-400'}`} />
                            <span className="text-[9px] sm:text-[10px] font-black uppercase font-mono tracking-wider">
                                {isLiveStreaming ? 'Stop' : 'Live'}
                            </span>
                        </button>
                        
                        {/* Master 3D Shutter Button */}
                        <button 
                            onClick={onCapturePhoto}
                            disabled={isCapturingPhoto}
                            className={`clay-target-pin w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                isCapturingPhoto 
                                    ? 'opacity-80 scale-95' 
                                    : 'hover:scale-105 active:scale-95 shadow-[0_12px_36px_rgba(249,115,22,0.5)]'
                            }`}
                            title="Capture Remote Photo"
                        >
                            {isCapturingPhoto ? (
                                <RefreshCw className="animate-spin text-white w-8 h-8" />
                            ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/40 flex items-center justify-center shadow-inner">
                                    <Camera className="w-8 h-8 sm:w-9 sm:h-9 text-white drop-shadow-md" />
                                </div>
                            )}
                        </button>

                        {/* Video Record Trigger */}
                        <button 
                            onClick={onToggleRecording}
                            className={`clay-capsule w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isRecording 
                                    ? 'border-red-500/50 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                                    : 'text-white/60 hover:text-white'
                            }`}
                            title="Record Video Clip"
                        >
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${
                                isRecording ? 'bg-red-500 animate-ping' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                            }`} />
                            <span className="text-[9px] sm:text-[10px] font-black uppercase font-mono tracking-wider">
                                {isRecording ? 'Stop' : 'REC'}
                            </span>
                        </button>
                    </div>

                    {/* ── Settings Bar (Quality & Duration) ── */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {/* Quality Pod */}
                        <div className="clay-card p-3 sm:p-4 relative">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5 flex items-center gap-1.5">
                                <Sliders className="w-3 h-3 text-orange-400" /> Resolution
                            </span>
                            <div 
                                onClick={() => { setIsQualityOpen(!isQualityOpen); setIsDurationOpen(false); }}
                                className="clay-capsule px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-between cursor-pointer hover:border-orange-500/40"
                            >
                                <span className="font-mono">
                                    {cameraQuality === 144 ? '144p (Speed)' : cameraQuality === 240 ? '240p' : cameraQuality === 360 ? '360p (SD)' : cameraQuality === 480 ? '480p' : '720p (HD)'}
                                </span>
                                <ChevronDown size={14} className={`text-white/40 transition-transform ${isQualityOpen ? 'rotate-180 text-orange-400' : ''}`} />
                            </div>

                            {isQualityOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 clay-card p-1.5 z-[400] shadow-2xl flex flex-col gap-1">
                                    {[144, 240, 360, 480, 720].map(val => (
                                        <button 
                                            key={val}
                                            onClick={() => { setCameraQuality(val); setIsQualityOpen(false); }}
                                            className={`px-3 py-2 text-xs font-bold text-left rounded-lg transition-colors cursor-pointer font-mono ${
                                                cameraQuality === val 
                                                    ? 'bg-orange-500/20 text-orange-300 font-black' 
                                                    : 'text-white/80 hover:bg-white/5'
                                            }`}
                                        >
                                            {val === 144 ? '144p (Speed)' : val === 240 ? '240p' : val === 360 ? '360p (SD)' : val === 480 ? '480p' : '720p (HD)'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Duration Pod */}
                        <div className="clay-card p-3 sm:p-4 relative">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5 flex items-center gap-1.5">
                                <Video className="w-3 h-3 text-red-400" /> Duration
                            </span>
                            <div 
                                onClick={() => { setIsDurationOpen(!isDurationOpen); setIsQualityOpen(false); }}
                                className="clay-capsule px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-between cursor-pointer hover:border-red-500/40"
                            >
                                <span className="font-mono">
                                    {recordingDuration === 0 ? 'Select Duration' : recordingDuration === 30 ? '30 Seconds' : recordingDuration === 60 ? '1 Minute' : recordingDuration === 120 ? '2 Minutes' : '5 Minutes'}
                                </span>
                                <ChevronDown size={14} className={`text-white/40 transition-transform ${isDurationOpen ? 'rotate-180 text-red-400' : ''}`} />
                            </div>

                            {isDurationOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 clay-card p-1.5 z-[400] shadow-2xl flex flex-col gap-1">
                                    {[30, 60, 120, 300].map(val => (
                                        <button 
                                            key={val}
                                            onClick={() => { setRecordingDuration(val); setIsDurationOpen(false); }}
                                            className={`px-3 py-2 text-xs font-bold text-left rounded-lg transition-colors cursor-pointer font-mono ${
                                                recordingDuration === val 
                                                    ? 'bg-red-500/20 text-red-300 font-black' 
                                                    : 'text-white/80 hover:bg-white/5'
                                            }`}
                                        >
                                            {val === 30 ? '30 Seconds' : val === 60 ? '1 Minute' : val === 120 ? '2 Minutes' : '5 Minutes'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Side Panel: Recent Captures Tray ── */}
                {!isCameraFullscreen && (
                    <div className="clay-card p-5 sm:p-6 flex flex-col h-[500px] lg:h-auto">
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-wider text-white">Recent Captures</h3>
                                    <p className="text-[10px] text-white/40 font-mono">Camera Gallery Reel</p>
                                </div>
                            </div>
                            {capturedMedia.length > 0 && (
                                <button 
                                    onClick={() => {
                                        setIsCameraSelectMode(!isCameraSelectMode);
                                        setCameraSelectedItems(new Set());
                                    }}
                                    className={`clay-button-sm px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                        isCameraSelectMode ? 'border-orange-500 text-orange-300' : 'text-white/70'
                                    }`}
                                >
                                    {isCameraSelectMode ? 'Cancel' : 'Select'}
                                </button>
                            )}
                        </div>
                        
                        {/* Multi-Select Action Bar */}
                        {isCameraSelectMode && cameraSelectedItems.size > 0 && (
                            <div className="clay-coords-badge p-3 rounded-2xl mb-4 flex items-center justify-between animate-in fade-in">
                                <span className="text-xs font-black text-orange-300 font-mono">
                                    {cameraSelectedItems.size} selected
                                </span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            Array.from(cameraSelectedItems).forEach(id => {
                                                const img = capturedMedia.find(i => i.id === id);
                                                if (img) window.open(img.url, '_blank');
                                            });
                                            setIsCameraSelectMode(false);
                                            setCameraSelectedItems(new Set());
                                        }}
                                        className="clay-button-sm p-2 rounded-xl text-white transition-all cursor-pointer"
                                        title="Download Selected"
                                    >
                                        <Download size={14} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setDeleteConfirmation({ isOpen: true, ids: Array.from(cameraSelectedItems) });
                                        }}
                                        className="clay-card-error p-2 rounded-xl text-red-400 hover:text-red-300 transition-all cursor-pointer"
                                        title="Delete Selected"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Captures Grid */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                {capturedMedia.slice(0, 12).map((img: any) => (
                                    <div 
                                        key={img.id} 
                                        className={`clay-capsule flex flex-col overflow-hidden transition-all ${
                                            isCameraSelectMode && cameraSelectedItems.has(img.id) 
                                                ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-95' 
                                                : 'hover:border-white/20'
                                        }`}
                                    >
                                        <div 
                                            onClick={() => {
                                                if (isCameraSelectMode) {
                                                    const newSet = new Set(cameraSelectedItems);
                                                    if (newSet.has(img.id)) newSet.delete(img.id);
                                                    else newSet.add(img.id);
                                                    setCameraSelectedItems(newSet);
                                                } else {
                                                    setPreviewItem(img);
                                                }
                                            }}
                                            className="relative aspect-square cursor-pointer group"
                                        >
                                            {img.isTemp ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 relative">
                                                    <RefreshCw className="w-6 h-6 animate-spin text-orange-400 mb-2" />
                                                    <span className="text-[10px] text-orange-300 font-bold uppercase tracking-widest">
                                                        {img.resource_type === 'video' ? 'Uploading' : 'Saving'}
                                                    </span>
                                                </div>
                                            ) : img.resource_type === 'video' ? (
                                                <div className="w-full h-full bg-gradient-to-br from-orange-950/40 via-black to-black flex flex-col items-center justify-center p-2 text-center">
                                                    <div className="clay-icon-pod w-10 h-10 rounded-full flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform mb-1">
                                                        <Video size={18} />
                                                    </div>
                                                    <span className="text-[9px] font-mono text-orange-300/80 uppercase tracking-widest">Video</span>
                                                </div>
                                            ) : (
                                                <img src={img.url} alt="Captured" className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" />
                                            )}
                                            
                                            {isCameraSelectMode && (
                                                <div className="absolute top-2 right-2">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                        cameraSelectedItems.has(img.id) ? 'bg-orange-500 border-orange-500' : 'bg-black/60 border-white/40'
                                                    }`}>
                                                        {cameraSelectedItems.has(img.id) && <CheckSquare size={12} className="text-white" />}
                                                    </div>
                                                </div>
                                            )}

                                            {img.resource_type === 'video' && (
                                                <div className="absolute top-1.5 left-1.5 bg-black/70 rounded-md px-1.5 py-0.5 pointer-events-none flex items-center gap-1">
                                                    <Video size={10} className="text-orange-400" />
                                                </div>
                                            )}
                                        </div>

                                        {!isCameraSelectMode && (
                                            <div className="flex w-full p-1.5 gap-1.5 bg-black/50 border-t border-white/5 mt-auto">
                                                <button 
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            const response = await fetch(img.url);
                                                            const blob = await response.blob();
                                                            const blobUrl = window.URL.createObjectURL(blob);
                                                            const link = document.createElement('a');
                                                            link.href = blobUrl;
                                                            link.download = img.name || (img.resource_type === 'video' ? 'video.mp4' : 'image.jpg');
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                            window.URL.revokeObjectURL(blobUrl);
                                                        } catch (err) {
                                                            const link = document.createElement('a');
                                                            link.href = img.url;
                                                            link.download = img.name || 'download';
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        }
                                                    }} 
                                                    className="flex-1 py-1.5 flex justify-center items-center bg-white/5 hover:bg-white/15 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
                                                    title="Download"
                                                >
                                                    <Download size={13} />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmation({ isOpen: true, ids: [img.id] });
                                                    }} 
                                                    className="flex-1 py-1.5 flex justify-center items-center bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {capturedMedia.length === 0 && (
                                <div className="w-full flex flex-col items-center justify-center text-white/30 text-center gap-3 p-6 min-h-[220px] rounded-2xl border border-white/5 border-dashed">
                                    <Camera size={36} strokeWidth={1.5} className="text-orange-400/40" />
                                    <p className="text-xs font-mono font-medium whitespace-pre-line text-white/40">
                                        {!selectedDeviceId ? 'No device selected.\nConnect a target endpoint.' : 'No recent captures reel.\nSnap a photo or record video!'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
