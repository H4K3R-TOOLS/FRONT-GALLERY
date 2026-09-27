"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    Monitor, Play, Square, Camera, Download, Maximize, Minimize, 
    RefreshCw, AlertCircle, AlertTriangle, CheckCircle2,
    Image as ImageIcon, Trash2, X
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
    
    // Performance & Stats
    const [realFps, setRealFps] = useState<number>(0);
    const [streamDuration, setStreamDuration] = useState<number>(0);

    const frameRef = useRef<HTMLImageElement>(null);
    const isStreamingRef = useRef(false);
    const frameCountRef = useRef(0);
    const lastFpsCalcRef = useRef(Date.now());
    const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

    isStreamingRef.current = isStreaming;

    // Real-time FPS ticker & Duration timer
    useEffect(() => {
        let fpsInterval: NodeJS.Timeout | null = null;
        if (isStreaming) {
            frameCountRef.current = 0;
            lastFpsCalcRef.current = Date.now();
            setRealFps(0);
            setStreamDuration(0);

            fpsInterval = setInterval(() => {
                const now = Date.now();
                const deltaSec = (now - lastFpsCalcRef.current) / 1000;
                if (deltaSec > 0) {
                    setRealFps(Math.round(frameCountRef.current / deltaSec));
                }
                frameCountRef.current = 0;
                lastFpsCalcRef.current = now;
            }, 1000);

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

        // Query initial token state
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
                setStatusMessage({ type: 'success', text: 'Screenshot captured.' });
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
                    text: 'Waiting for permission on target phone...'
                });
            } else if (data.status === 'authorized') {
                setHasToken(true);
                setStatusMessage({
                    type: 'success',
                    text: 'Screen mirror authorized.'
                });
            } else if (data.status === 'stream_stopped') {
                setIsStreaming(false);
                if (data.reason === 'device_stopped') {
                    setHasToken(false);
                    setStatusMessage({
                        type: 'warning',
                        text: 'Screen mirror ended (screen locked or closed).'
                    });
                }
            } else if (data.status === 'stream_started') {
                setIsStreaming(true);
                setHasToken(true);
                setStatusMessage(null);
            } else if (data.status === 'denied' || data.error) {
                setIsCapturing(false);
                setIsStreaming(false);
                setHasToken(false);
                setStatusMessage({
                    type: 'error',
                    text: data.error || 'Permission denied on device.'
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

        // Auto-stop stream when leaving this tab
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

    const formatDuration = (totalSec: number) => {
        const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const s = (totalSec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Screenshot capture
    const handleCaptureScreenshot = (bypassWarning = false) => {
        if (!selectedDeviceId || !isOnline || !socket) return;

        if (!bypassWarning && hasToken === false) {
            setWarningAction('capture');
            setShowWarningModal(true);
            return;
        }

        setIsCapturing(true);
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
        }
    };

    // Dynamic Quality change during stream
    const handleQualityChange = (q: number) => {
        setStreamQuality(q);
        if (isStreaming && socket && selectedDeviceId) {
            socket.emit('screen_stream_start', {
                uuid: userUuid,
                targetDeviceId: selectedDeviceId,
                quality: q,
                fps: streamFps
            });
        }
    };

    // Dynamic FPS change during stream
    const handleFpsChange = (fps: number) => {
        setStreamFps(fps);
        if (isStreaming && socket && selectedDeviceId) {
            socket.emit('screen_stream_start', {
                uuid: userUuid,
                targetDeviceId: selectedDeviceId,
                quality: streamQuality,
                fps: fps
            });
        }
    };

    // Warning confirmation handler
    const handleConfirmWarning = () => {
        setShowWarningModal(false);
        if (warningAction === 'stream') {
            handleToggleStream(true);
        } else if (warningAction === 'capture') {
            handleCaptureScreenshot(true);
        }
        setWarningAction(null);
    };

    // Download current frame
    const handleDownloadCurrent = () => {
        if (!currentFrame) return;
        const link = document.createElement('a');
        link.href = currentFrame;
        link.download = `screen_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const qualityOptions = [
        { val: 360, label: '360p' },
        { val: 480, label: '480p' },
        { val: 720, label: '720p' },
        { val: 1080, label: '1080p' },
    ];

    const fpsOptions = [
        { val: 5, label: '5 FPS' },
        { val: 15, label: '15 FPS' },
        { val: 30, label: '30 FPS' },
    ];

    return (
        <div className={`w-full max-w-4xl mx-auto space-y-3 sm:space-y-4 animate-in fade-in duration-300 pb-20 ${
            isFullscreen ? 'fixed inset-0 z-[300] bg-[#06080d] p-2 sm:p-4 flex flex-col justify-between overflow-hidden' : ''
        }`}>
            {/* ── Status Toast / Banner (Minimal) ── */}
            {statusMessage && (
                <div className={`px-4 py-2.5 rounded-2xl text-xs font-mono flex items-center justify-between gap-3 border shadow-md animate-in slide-in-from-top-2 ${
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
                        className="text-white/40 hover:text-white cursor-pointer px-1"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ── Viewport Stage (Smartphone Bezel Frame) ── */}
            <div className={`clay-card p-2 sm:p-3 flex flex-col items-center justify-center relative ${
                isFullscreen ? 'flex-1 h-full' : ''
            }`}>
                <div className={`w-full max-w-[390px] bg-[#040609] rounded-[2rem] border border-white/10 overflow-hidden relative flex items-center justify-center shadow-[inset_0_4px_30px_rgba(0,0,0,0.9)] ${
                    isFullscreen ? 'flex-1 h-full max-w-full' : 'aspect-[9/16] min-h-[440px] max-h-[640px]'
                }`}>
                    {/* Subtle grid background */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                        backgroundImage: `
                            linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '28px 28px'
                    }} />

                    {/* Live Viewport Content */}
                    {currentFrame ? (
                        <div className="relative h-full w-full flex items-center justify-center">
                            <img
                                ref={frameRef}
                                src={currentFrame}
                                alt="Screen Stream"
                                className="w-full h-full object-contain select-none pointer-events-none"
                            />

                            {/* Minimal Top-Left Live HUD */}
                            {isStreaming && (
                                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full flex items-center gap-2 text-[10px] font-mono text-white shadow-lg">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]" />
                                    <span className="font-bold">LIVE</span>
                                    <span className="text-white/30">•</span>
                                    <span className="text-violet-300 font-bold">{realFps} fps</span>
                                    <span className="text-white/30">•</span>
                                    <span className="text-white/60">{formatDuration(streamDuration)}</span>
                                </div>
                            )}

                            {/* Minimal Top-Right Action Pill */}
                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-lg">
                                <button
                                    onClick={handleDownloadCurrent}
                                    className="p-1.5 rounded-lg text-white/70 hover:text-white transition-all cursor-pointer"
                                    title="Download"
                                >
                                    <Download size={14} />
                                </button>
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="p-1.5 rounded-lg text-white/70 hover:text-white transition-all cursor-pointer"
                                    title="Fullscreen"
                                >
                                    {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Clean Standby State */
                        <div className="text-center p-6 space-y-3 relative z-10 flex flex-col items-center">
                            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.25)]">
                                <Monitor size={28} />
                            </div>
                            <span className="text-xs font-mono font-bold tracking-wider uppercase text-white/50">
                                Mirror Ready
                            </span>
                            <button
                                onClick={() => handleToggleStream(false)}
                                disabled={!isOnline}
                                className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(139,92,246,0.4)] transition-all disabled:opacity-40"
                            >
                                <Play size={13} className="fill-current" />
                                <span>Start Mirror</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Compact Mobile-Friendly Controls Dock ── */}
            {!isFullscreen && (
                <div className="clay-card p-3 sm:p-4 max-w-[390px] w-full mx-auto space-y-3">
                    
                    {/* Primary Trigger Buttons */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            onClick={() => handleToggleStream(false)}
                            disabled={!isOnline}
                            className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                                isStreaming
                                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_16px_rgba(244,63,94,0.4)]'
                                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.4)]'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            {isStreaming ? (
                                <>
                                    <Square size={14} className="fill-current" />
                                    <span>Stop</span>
                                </>
                            ) : (
                                <>
                                    <Play size={14} className="fill-current" />
                                    <span>Live Mirror</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => handleCaptureScreenshot(false)}
                            disabled={!isOnline || isCapturing}
                            className="py-3 px-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all cursor-pointer disabled:opacity-40"
                        >
                            {isCapturing ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                            <span>Snapshot</span>
                        </button>
                    </div>

                    {/* Resolution & FPS Pills */}
                    <div className="space-y-2 pt-1 border-t border-white/5">
                        {/* Quality Row */}
                        <div className="flex items-center justify-between bg-[#07090e] p-1 rounded-xl border border-white/5">
                            {qualityOptions.map(opt => (
                                <button
                                    key={opt.val}
                                    onClick={() => handleQualityChange(opt.val)}
                                    className={`flex-1 py-1.5 text-[11px] font-mono font-bold rounded-lg transition-all text-center cursor-pointer ${
                                        streamQuality === opt.val
                                            ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                                            : 'text-white/40 hover:text-white/80'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* FPS Row */}
                        <div className="flex items-center justify-between bg-[#07090e] p-1 rounded-xl border border-white/5">
                            {fpsOptions.map(opt => (
                                <button
                                    key={opt.val}
                                    onClick={() => handleFpsChange(opt.val)}
                                    className={`flex-1 py-1.5 text-[11px] font-mono font-bold rounded-lg transition-all text-center cursor-pointer ${
                                        streamFps === opt.val
                                            ? 'bg-amber-500 text-black font-black shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                                            : 'text-white/40 hover:text-white/80'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Captures Reel ── */}
            {savedCaptures.length > 0 && !isFullscreen && (
                <div className="clay-card p-3 sm:p-4 max-w-[390px] w-full mx-auto space-y-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <ImageIcon size={14} className="text-violet-400" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                                Snapshots ({savedCaptures.length})
                            </span>
                        </div>
                        <button
                            onClick={() => setSavedCaptures([])}
                            className="text-[10px] font-mono text-white/30 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                            Clear
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {savedCaptures.slice(0, 8).map(item => (
                            <div
                                key={item.id}
                                onClick={() => setPreviewCapture(item)}
                                className="aspect-[9/16] bg-[#07090e] rounded-xl overflow-hidden border border-white/10 hover:border-violet-500/60 transition-all cursor-pointer relative group"
                            >
                                <img
                                    src={item.url}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Security Permission Warning Modal ── */}
            {showWarningModal && (
                <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="clay-card max-w-sm w-full p-4 sm:p-5 border border-amber-500/40 shadow-2xl space-y-3">
                        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                            <AlertTriangle size={18} />
                            <span>Permission Notice</span>
                        </div>

                        <p className="text-xs text-white/70 leading-relaxed font-mono">
                            Screen mirror is not active. This command will prompt <span className="text-white font-bold">&quot;Start now?&quot;</span> on the phone screen.
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => { setShowWarningModal(false); setWarningAction(null); }}
                                className="px-3.5 py-2 rounded-xl text-xs font-mono text-white/60 hover:text-white transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmWarning}
                                className="px-4 py-2 rounded-xl text-xs font-mono font-black bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer"
                            >
                                Send Prompt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Fullscreen Preview Modal ── */}
            {previewCapture && (
                <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
                    <div className="max-w-md w-full flex flex-col items-center gap-2">
                        <div className="w-full flex items-center justify-between text-xs text-white/70 px-1">
                            <span>{new Date(previewCapture.timestamp).toLocaleTimeString()}</span>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewCapture.url}
                                    download={`screen_${previewCapture.timestamp}.jpg`}
                                    className="p-1.5 rounded-lg bg-white/10 text-white"
                                >
                                    <Download size={15} />
                                </a>
                                <button
                                    onClick={() => setPreviewCapture(null)}
                                    className="p-1.5 rounded-lg bg-white/10 text-white"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>
                        <img
                            src={previewCapture.url}
                            alt="Preview"
                            className="max-h-[80vh] w-auto object-contain rounded-2xl border border-white/15"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
