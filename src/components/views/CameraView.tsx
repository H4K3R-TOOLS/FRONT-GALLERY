"use client";

import React, { useState } from 'react';
import { Camera, Video, Square, RefreshCw, Maximize, Minimize, Settings2, ChevronDown, CheckSquare, Download, Trash2, Image as ImageIcon } from 'lucide-react';

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
        <div className={`space-y-6 ${isCameraFullscreen ? 'fixed inset-0 z-[300] bg-[#0a0a0c] p-4 md:p-8' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 px-6 py-4 rounded-[2rem] border border-white/10 shadow-neo-xl">
                <div className="flex flex-wrap items-center gap-3 w-full justify-between">
                    <div className="flex items-center bg-black/40 border border-white/10 p-1.5 rounded-2xl w-full sm:w-auto justify-center sm:justify-start">
                        <button 
                            onClick={() => setCameraMode('back')} 
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${cameraMode === 'back' ? 'bg-cyan-500 text-black' : 'text-white/50'}`}
                        >
                            Rear Camera
                        </button>
                        <button 
                            onClick={() => setCameraMode('front')} 
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${cameraMode === 'front' ? 'bg-cyan-500 text-black' : 'text-white/50'}`}
                        >
                            Front Camera
                        </button>
                    </div>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${isCameraFullscreen ? 'h-[calc(100%-100px)]' : 'lg:grid-cols-3'} gap-6`}>
                {/* Main Stage */}
                <div className={`flex flex-col gap-4 ${isCameraFullscreen ? 'h-full' : 'lg:col-span-2'}`}>
                    <div className={`w-full bg-black rounded-[2rem] border-2 overflow-hidden relative flex items-center justify-center border-white/10 ${isCameraFullscreen ? 'h-full flex-1' : 'aspect-video'}`}>
                        {isLiveStreaming ? (
                            <img ref={liveImageRef} className="w-full h-full object-contain" alt="Live Feed" />
                        ) : isRecording ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-500/5">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                        <Square className="w-8 h-8 text-red-400" />
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-red-400 font-bold tracking-[0.2em] uppercase text-sm">Recording in Progress</span>
                                        <span className="text-white font-data text-xl">{recordingProgress.current}s / {recordingProgress.total}s</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-white/20 flex flex-col items-center gap-4">
                                <Camera size={64} strokeWidth={1} className="text-cyan-500/30" />
                                <span className="text-sm font-bold tracking-widest uppercase text-white/30">Camera Standby</span>
                            </div>
                        )}

                        {/* Top Overlay Controls */}
                        <div className="absolute top-4 right-4 flex items-center justify-end pointer-events-none">
                            <div className="flex items-center gap-3 pointer-events-auto">
                                {!isCameraFullscreen ? (
                                    <button onClick={() => setIsCameraFullscreen(true)} className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 transition-colors flex items-center justify-center border border-white/10 text-white/70 hover:text-white shadow-lg backdrop-blur-md">
                                        <Maximize size={18} />
                                    </button>
                                ) : (
                                    <button onClick={() => setIsCameraFullscreen(false)} className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 transition-colors flex items-center justify-center border border-white/10 text-white shadow-lg backdrop-blur-md">
                                        <Minimize size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-center gap-8 py-2">
                        <button 
                            onClick={onToggleLiveStream}
                            className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center gap-1.5 transition-all ${isLiveStreaming ? 'bg-red-500 text-white' : 'bg-white/5 text-white/70 border border-white/5 hover:bg-white/10'}`}
                            title="Live Stream"
                        >
                            <Video size={24} />
                            <span className="text-[10px] font-bold tracking-widest uppercase">{isLiveStreaming ? 'Stop' : 'Live'}</span>
                        </button>
                        
                        <button 
                            onClick={onCapturePhoto}
                            disabled={isCapturingPhoto}
                            className={`w-24 h-24 rounded-full flex items-center justify-center border-[6px] transition-all ${isCapturingPhoto ? 'border-cyan-500 bg-cyan-500/20' : 'border-white bg-white/5 hover:bg-white/10 active:scale-95'}`}
                            title="Capture Photo"
                        >
                            {isCapturingPhoto ? (
                                <RefreshCw className="animate-spin text-cyan-400" size={32}/>
                            ) : (
                                <div className="w-[72px] h-[72px] rounded-full bg-white" />
                            )}
                        </button>

                        <button 
                            onClick={onToggleRecording}
                            className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center gap-1.5 transition-all ${isRecording ? 'bg-black text-white border-2 border-red-500' : 'bg-white/5 text-white/70 border border-white/5 hover:bg-white/10'}`}
                            title="Record Video"
                        >
                            <div className={`w-5 h-5 rounded-full ${isRecording ? 'bg-red-500' : 'bg-red-500'}`} />
                            <span className="text-[10px] font-bold tracking-widest uppercase">{isRecording ? 'Stop' : 'REC'}</span>
                        </button>
                    </div>

                    {/* Settings Bar */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-row items-center sm:justify-start gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden sm:flex w-8 h-8 rounded-full bg-cyan-500/20 items-center justify-center border border-cyan-500/30 shrink-0">
                                <Settings2 size={16} className="text-cyan-400" />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 pl-1">Quality</span>
                                <div 
                                    onClick={() => { setIsQualityOpen(!isQualityOpen); setIsDurationOpen(false); }}
                                    className="bg-black/40 border border-white/10 rounded-xl pl-3 pr-8 py-2.5 text-xs sm:text-sm font-bold text-white hover:border-cyan-500/50 w-full cursor-pointer transition-colors shadow-inner flex items-center justify-between"
                                >
                                    {cameraQuality === 144 ? '144p (Fast)' : cameraQuality === 240 ? '240p' : cameraQuality === 360 ? '360p (SD)' : cameraQuality === 480 ? '480p' : '720p (HD)'}
                                    <ChevronDown size={14} className="absolute right-3 text-white/40 pointer-events-none" />
                                </div>
                                {isQualityOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a24] border border-white/10 rounded-xl overflow-hidden z-[400] shadow-2xl flex flex-col animate-in fade-in slide-in-from-top-2">
                                        {[144, 240, 360, 480, 720].map(val => (
                                            <button 
                                                key={val}
                                                onClick={() => { setCameraQuality(val); setIsQualityOpen(false); }}
                                                className={`px-3 py-2.5 text-xs sm:text-sm font-bold text-left hover:bg-cyan-500/20 transition-colors ${cameraQuality === val ? 'text-cyan-400 bg-cyan-500/10' : 'text-white'}`}
                                            >
                                                {val === 144 ? '144p (Fast)' : val === 240 ? '240p' : val === 360 ? '360p (SD)' : val === 480 ? '480p' : '720p (HD)'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden sm:flex w-8 h-8 rounded-full bg-red-500/20 items-center justify-center border border-red-500/30 shrink-0">
                                <Video size={16} className="text-red-400" />
                            </div>
                            <div className="flex flex-col w-full relative">
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 pl-1">Duration</span>
                                <div 
                                    onClick={() => { setIsDurationOpen(!isDurationOpen); setIsQualityOpen(false); }}
                                    className="bg-black/40 border border-white/10 rounded-xl pl-3 pr-8 py-2.5 text-xs sm:text-sm font-bold text-white hover:border-red-500/50 w-full cursor-pointer transition-colors shadow-inner flex items-center justify-between"
                                >
                                    {recordingDuration === 0 ? <span className="text-white/50">Select Duration</span> : recordingDuration === 30 ? '30 Sec' : recordingDuration === 60 ? '1 Min' : recordingDuration === 120 ? '2 Mins' : '5 Mins'}
                                    <ChevronDown size={14} className="absolute right-3 text-white/40 pointer-events-none" />
                                </div>
                                {isDurationOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a24] border border-white/10 rounded-xl overflow-hidden z-[400] shadow-2xl flex flex-col animate-in fade-in slide-in-from-top-2">
                                        {[30, 60, 120, 300].map(val => (
                                            <button 
                                                key={val}
                                                onClick={() => { setRecordingDuration(val); setIsDurationOpen(false); }}
                                                className={`px-3 py-2.5 text-xs sm:text-sm font-bold text-left hover:bg-red-500/20 transition-colors ${recordingDuration === val ? 'text-red-400 bg-red-500/10' : 'text-white'}`}
                                            >
                                                {val === 30 ? '30 Sec' : val === 60 ? '1 Min' : val === 120 ? '2 Mins' : '5 Mins'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Side Panel: Recent Captures */}
                {!isCameraFullscreen && (
                    <div className="bg-black/40 border border-white/10 rounded-[2rem] p-6 flex flex-col h-[500px] lg:h-auto shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                                    <ImageIcon size={20} className="text-pink-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white/90 leading-tight">Recent Media</h3>
                                    <p className="text-[10px] text-pink-400 font-data tracking-widest uppercase">From Camera</p>
                                </div>
                            </div>
                            {capturedMedia.length > 0 && (
                                <button 
                                    onClick={() => {
                                        setIsCameraSelectMode(!isCameraSelectMode);
                                        setCameraSelectedItems(new Set());
                                    }}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${isCameraSelectMode ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}
                                >
                                    {isCameraSelectMode ? 'Cancel' : 'Select'}
                                </button>
                            )}
                        </div>
                        
                        {isCameraSelectMode && cameraSelectedItems.size > 0 && (
                            <div className="flex items-center justify-between bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 mb-4 animate-in fade-in slide-in-from-top-2">
                                <span className="text-xs font-bold text-cyan-400">{cameraSelectedItems.size} selected</span>
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
                                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                        title="Download Selected"
                                    >
                                        <Download size={14} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setDeleteConfirmation({ isOpen: true, ids: Array.from(cameraSelectedItems) });
                                        }}
                                        className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 flex items-center justify-center text-red-400 transition-colors"
                                        title="Delete Selected"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                            <div className="grid grid-cols-2 gap-3">
                                {capturedMedia.slice(0, 10).map((img: any) => (
                                    <div 
                                        key={img.id} 
                                        className={`flex flex-col bg-black/40 border transition-all rounded-xl overflow-hidden ${isCameraSelectMode && cameraSelectedItems.has(img.id) ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-95' : 'border-white/5 hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.15)]'}`}
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
                                                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-500 mb-2" />
                                                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{img.resource_type === 'video' ? 'Uploading' : 'Saving'}</span>
                                                </div>
                                            ) : img.resource_type === 'video' ? (
                                                <div className="w-full h-full bg-gradient-to-br from-pink-950/40 via-black to-black/80 flex flex-col items-center justify-center p-2 text-center">
                                                    <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(236,72,153,0.3)] mb-1">
                                                        <Video size={18} />
                                                    </div>
                                                    <span className="text-[9px] font-mono text-pink-300/80 uppercase tracking-widest">Video</span>
                                                </div>
                                            ) : (
                                                <img src={img.url} alt="Recent" className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" />
                                            )}
                                            
                                            {isCameraSelectMode && (
                                                <div className="absolute top-2 right-2">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${cameraSelectedItems.has(img.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-black/40 border-white/40'}`}>
                                                        {cameraSelectedItems.has(img.id) && <CheckSquare size={12} className="text-black" />}
                                                    </div>
                                                </div>
                                            )}

                                            {img.resource_type === 'video' && (
                                                <div className="absolute top-1 left-1 bg-black/60 rounded px-1 py-0.5 pointer-events-none">
                                                    <Video size={10} className="text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {!isCameraSelectMode && (
                                            <div className="flex w-full p-1.5 gap-1.5 bg-black/60 border-t border-white/5 mt-auto">
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
                                                    className="flex-1 py-2 flex justify-center items-center bg-white/5 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-colors"
                                                >
                                                    <Download size={14} />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmation({ isOpen: true, ids: [img.id] });
                                                    }} 
                                                    className="flex-1 py-2 flex justify-center items-center bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {capturedMedia.length === 0 && (
                                <div className="w-full flex flex-col items-center justify-center text-white/30 text-center gap-3 p-4 min-h-[200px] bg-white/5 rounded-2xl border border-white/5 border-dashed mt-2">
                                    <Camera size={40} strokeWidth={1} />
                                    <p className="text-xs font-medium whitespace-pre-line">{!selectedDeviceId ? 'No device selected.\nSelect a device to view camera captures.' : 'No recent captures.\nSnap a photo or record a video!'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
