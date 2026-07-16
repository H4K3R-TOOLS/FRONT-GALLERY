'use client';

import { signIn } from 'next-auth/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

/* ═══════ HELPER COMPONENTS ═══════ */

/* Mouse-following ambient glow (desktop only) */
function CursorGlow() {
    const [pos, setPos] = useState({ x: -500, y: -500 });
    useEffect(() => {
        const h = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', h, { passive: true });
        return () => window.removeEventListener('mousemove', h);
    }, []);
    return (
        <div className="fixed pointer-events-none z-[1] hidden md:block" style={{
            left: pos.x - 280, top: pos.y - 280, width: 560, height: 560, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,165,116,0.04) 0%, transparent 55%)',
            transition: 'left 0.12s ease-out, top 0.12s ease-out',
        }} />
    );
}

/* Sticky floating glass nav appearing on scroll */
function StickyNav({ onScrollTo }: { onScrollTo: (id: string) => void }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const h = () => setShow(window.scrollY > window.innerHeight * 0.55);
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);
    return (
        <AnimatePresence>
            {show && (
                <motion.nav
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -80, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] sticky-nav-glass rounded-full px-3 py-2 flex items-center gap-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                >
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/[0.1] mr-1 flex items-center justify-center bg-[#080807]">
                        <Image src="/gallery-eye-logo.jpg" alt="GE" width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                    {['tools', 'capabilities', 'login-section'].map((id) => (
                        <button
                            key={id}
                            onClick={() => onScrollTo(id)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize ${
                                id === 'login-section'
                                    ? 'bg-gradient-to-r from-[#d4a574] to-[#e8966d] text-[#1c1917] font-bold shadow-[0_0_15px_rgba(212,165,116,0.3)] hover:brightness-110'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                            }`}
                        >
                            {id === 'login-section' ? 'Sign In Portal' : id === 'tools' ? '8 Remote Tools' : 'Capabilities'}
                        </button>
                    ))}
                </motion.nav>
            )}
        </AnimatePresence>
    );
}

/* Animated number counter */
function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!inView) return;
        const duration = 2200;
        const start = Date.now();
        const timer = setInterval(() => {
            const progress = Math.min((Date.now() - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(eased * target));
            if (progress >= 1) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);
    return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

/* Scroll-reveal wrapper */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >{children}</motion.div>
    );
}

/* 3D magnetic tilt card */
function MagneticCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({});
    const onMove = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -5;
        const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 5;
        setStyle({ transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)` });
    }, []);
    const onLeave = useCallback(() => setStyle({ transform: 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)' }), []);
    return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={{ ...style, transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1)', willChange: 'transform' }}>{children}</div>;
}

/* ═══════ INTERACTIVE GALLERY SHOWCASE (INSIDE FEATURED TOOL CARD) ═══════ */
function InteractiveGalleryShowcase() {
    const [activeTab, setActiveTab] = useState<'all' | 'camera' | 'whatsapp' | 'videos'>('all');
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([1, 2]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [previewPhoto, setPreviewPhoto] = useState<any | null>(null);

    const photos = [
        {
            id: 1,
            title: 'Sunset_Coastal_HDR.heic',
            path: 'DCIM / Camera / IMG_20260715_1842.heic',
            src: '/synced-photo-1.png',
            fallback: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            size: '4.8 MB',
            res: '4096 × 3072',
            type: 'camera',
            timestamp: 'Synced 12s ago',
            status: 'ENCRYPTED TUNNEL',
            color: '#e8966d'
        },
        {
            id: 2,
            title: 'Cyberpunk_Night_Street.jpg',
            path: 'DCIM / Camera / IMG_20260715_2210.jpg',
            src: '/synced-photo-2.png',
            fallback: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
            size: '3.6 MB',
            res: '3840 × 2160',
            type: 'camera',
            timestamp: 'Synced 1m ago',
            status: 'ENCRYPTED TUNNEL',
            color: '#6ecce8'
        },
        {
            id: 3,
            title: 'Vacation_Resort_Pool.heic',
            path: 'WhatsApp / Media / IMG-2026-WA0088.jpg',
            src: '/gallery-sync-mockup.png',
            fallback: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
            size: '2.1 MB',
            res: '1920 × 1080',
            type: 'whatsapp',
            timestamp: 'Synced 4m ago',
            status: 'ENCRYPTED TUNNEL',
            color: '#6ec4a8'
        },
        {
            id: 4,
            title: 'Mountain_Drone_4K.mp4',
            path: 'Snapchat / Snaps / Video_88219.mp4',
            src: '/remote-camera-mockup.png',
            fallback: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
            size: '18.4 MB',
            res: '4K • 60 FPS',
            type: 'videos',
            timestamp: 'Synced 8m ago',
            status: 'STREAM READY',
            isVideo: true,
            duration: '0:24',
            color: '#b88ae8'
        },
        {
            id: 5,
            title: 'Coffee_Shop_Table.raw',
            path: 'DCIM / Camera / IMG_20260714_0915.dng',
            src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
            fallback: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
            size: '24.2 MB',
            res: '6000 × 4000',
            type: 'camera',
            timestamp: 'Synced 1h ago',
            status: 'ENCRYPTED TUNNEL',
            color: '#e8c46e'
        },
        {
            id: 6,
            title: 'Team_Conference_Call.png',
            path: 'Screenshots / Screen_20260714.png',
            src: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
            fallback: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
            size: '1.4 MB',
            res: '2560 × 1440',
            type: 'whatsapp',
            timestamp: 'Synced 3h ago',
            status: 'ENCRYPTED TUNNEL',
            color: '#7a8ce8'
        }
    ];

    const filtered = activeTab === 'all' ? photos : photos.filter(p => p.type === activeTab);

    const toggleSelect = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedPhotos.includes(id)) {
            setSelectedPhotos(selectedPhotos.filter(i => i !== id));
        } else {
            setSelectedPhotos([...selectedPhotos, id]);
        }
    };

    const triggerBulkZip = () => {
        if (selectedPhotos.length === 0 || isDownloading) return;
        setIsDownloading(true);
        setDownloadProgress(0);
        const interval = setInterval(() => {
            setDownloadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsDownloading(false), 800);
                    return 100;
                }
                return prev + 20;
            });
        }, 120);
    };

    return (
        <div className="mt-8 rounded-3xl border border-white/[0.08] bg-[#0c0c0e]/90 overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            {/* Gallery Header Controls */}
            <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-white/[0.015] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {[
                        { id: 'all', label: 'All Synced Media (12,480)' },
                        { id: 'camera', label: '📷 Camera Roll' },
                        { id: 'whatsapp', label: '💬 WhatsApp & Apps' },
                        { id: 'videos', label: '🎥 4K Videos' },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                                activeTab === t.id
                                    ? 'bg-[#d4a574] text-[#1c1917] shadow-[0_0_20px_rgba(212,165,116,0.35)] scale-[1.02]'
                                    : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs text-zinc-400 font-mono">
                        Selected: <strong className="text-[#d4a574]">{selectedPhotos.length}</strong>
                    </span>
                    <button
                        onClick={triggerBulkZip}
                        disabled={selectedPhotos.length === 0 || isDownloading}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            selectedPhotos.length > 0 && !isDownloading
                                ? 'bg-gradient-to-r from-[#e8966d] to-[#d4a574] text-[#1c1917] shadow-[0_4px_20px_rgba(232,150,109,0.35)] hover:scale-105 active:scale-95'
                                : 'bg-white/[0.05] text-zinc-500 cursor-not-allowed'
                        }`}
                    >
                        {isDownloading ? (
                            <>
                                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                <span>ZIP Archiving {downloadProgress}%...</span>
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                <span>Download Selected ZIP</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Photo Grid Preview */}
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[520px] overflow-y-auto custom-scrollbar">
                {filtered.map(photo => {
                    const isSelected = selectedPhotos.includes(photo.id);
                    return (
                        <div
                            key={photo.id}
                            onClick={() => setPreviewPhoto(photo)}
                            className={`group relative rounded-2xl overflow-hidden border transition-all duration-400 cursor-pointer bg-black/40 ${
                                isSelected
                                    ? 'border-[#d4a574] ring-2 ring-[#d4a574]/40 shadow-[0_10px_30px_rgba(212,165,116,0.2)]'
                                    : 'border-white/[0.08] hover:border-white/[0.25] hover:scale-[1.02]'
                            }`}
                        >
                            {/* Photo Aspect Container */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#16161a]">
                                <Image
                                    src={photo.src}
                                    alt={photo.title}
                                    fill
                                    sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e: any) => { e.currentTarget.src = photo.fallback; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                {/* Selection Checkbox */}
                                <button
                                    onClick={(e) => toggleSelect(photo.id, e)}
                                    className={`absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all z-10 ${
                                        isSelected
                                            ? 'bg-[#d4a574] text-[#1c1917] shadow-[0_0_12px_rgba(212,165,116,0.6)] scale-110 font-bold'
                                            : 'bg-black/60 text-white/50 border border-white/20 hover:border-white hover:text-white backdrop-blur-md'
                                    }`}
                                >
                                    {isSelected ? '✓' : ''}
                                </button>

                                {/* Video duration tag if video */}
                                {photo.isVideo && (
                                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-[11px] text-white font-mono">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        {photo.duration}
                                    </div>
                                )}

                                {/* Bottom Metadata Overlays */}
                                <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col gap-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-[#d4a574] backdrop-blur-md border border-[#d4a574]/20 truncate">
                                            {photo.res}
                                        </span>
                                        <span className="text-[11px] text-zinc-300 font-mono">{photo.size}</span>
                                    </div>
                                    <div className="text-xs font-bold text-white truncate drop-shadow-md mt-0.5">
                                        {photo.title}
                                    </div>
                                    <div className="text-[10px] text-zinc-400 truncate font-mono">
                                        {photo.path}
                                    </div>
                                </div>
                            </div>

                            {/* Status strip */}
                            <div className="px-3.5 py-2 bg-white/[0.02] border-t border-white/[0.05] flex items-center justify-between text-[11px]">
                                <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                                    {photo.status}
                                </span>
                                <span className="text-zinc-500">{photo.timestamp}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Photo Zoom Preview */}
            <AnimatePresence>
                {previewPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewPhoto(null)}
                        className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-2xl p-4 sm:p-10 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-4xl w-full rounded-3xl overflow-hidden border border-white/10 bg-[#121316] shadow-2xl flex flex-col md:flex-row"
                        >
                            <div className="relative aspect-[4/3] md:w-3/5 bg-black flex items-center justify-center">
                                <Image
                                    src={previewPhoto.src}
                                    alt={previewPhoto.title}
                                    fill
                                    className="object-contain"
                                    onError={(e: any) => { e.currentTarget.src = previewPhoto.fallback; }}
                                />
                            </div>
                            <div className="p-6 sm:p-8 md:w-2/5 flex flex-col justify-between bg-white/[0.02]">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                            ✓ WEBRTC TUNNEL DIRECT
                                        </span>
                                        <button onClick={() => setPreviewPhoto(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                                            ✕
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-bold text-white break-all mb-2">{previewPhoto.title}</h3>
                                    <p className="text-xs text-zinc-400 font-mono break-all mb-6">{previewPhoto.path}</p>

                                    <div className="space-y-3 pt-4 border-t border-white/[0.08] text-xs font-mono">
                                        <div className="flex justify-between text-zinc-400"><span>Resolution:</span> <strong className="text-white">{previewPhoto.res}</strong></div>
                                        <div className="flex justify-between text-zinc-400"><span>File Size:</span> <strong className="text-white">{previewPhoto.size}</strong></div>
                                        <div className="flex justify-between text-zinc-400"><span>Storage Location:</span> <strong className="text-white">Device Internal Memory</strong></div>
                                        <div className="flex justify-between text-zinc-400"><span>Sync Latency:</span> <strong className="text-emerald-400">12ms (Direct Peer)</strong></div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!selectedPhotos.includes(previewPhoto.id)) setSelectedPhotos([...selectedPhotos, previewPhoto.id]);
                                        setPreviewPhoto(null);
                                        triggerBulkZip();
                                    }}
                                    className="mt-6 w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#d4a574] to-[#e8966d] text-[#1c1917] shadow-[0_4px_20px_rgba(212,165,116,0.3)] hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Add to ZIP & Instant Export</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ═══════ MAIN PAGE ═══════ */

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 160]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setIsLoading(true);
        const r = await signIn('credentials', { email, password, redirect: false });
        setIsLoading(false);
        if (r?.ok) router.push('/'); else setError('Incorrect email or password.');
    };
    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const tools = [
        { id: 'gallery', name: 'Gallery Sync & Bulk ZIP', desc: 'Browse, filter, and multi-select real-time high-res photos & videos from any connected device. Export full albums right in your browser.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>, accent: '#e8966d', featured: true },
        { id: 'camera', name: 'Remote Camera Stream', desc: 'Capture crystal-clear photos or stream live real-time video from front or rear lenses. Toggle flash, switch lenses, and save captures directly.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>, accent: '#6ecce8' },
        { id: 'audio', name: 'Microphone Surveillance', desc: 'Record ambient room audio remotely. Custom timing and bitrates — files stream directly into your browser with zero latency.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>, accent: '#b88ae8' },
        { id: 'notifications', name: 'Live Alert Intercept', desc: 'Monitor every single system & app notification — full text, titles, packages, and exact timestamps in a live-updating stream feed.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>, accent: '#7a8ce8' },
        { id: 'contacts', name: 'Contact Indexing', desc: 'Instant access to the complete address book — names, phone numbers, and emails. Search, filter, and export contacts in JSON/CSV format.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>, accent: '#6ec4a8' },
        { id: 'sms', name: 'SMS Thread Reader', desc: 'Read live incoming and archived SMS text conversations across devices — complete sender info, timestamps, and instant search capability.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, accent: '#6ea8e8' },
        { id: 'torch', name: 'Remote Flashlight Control', desc: 'Toggle the physical device LED flashlight on or off remotely with a single tap over our ultra-low latency WebSocket tunnel.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, accent: '#e8c46e' },
        { id: 'vibration', name: 'Haptic Vibration Trigger', desc: 'Trigger powerful device vibration remotely — locate a misplaced device under sofa cushions or send immediate silent alerts.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M2 8v8M22 8v8"/></svg>, accent: '#e86e8c' },
    ];

    const marqueeItems = ['⚡ Gallery Sync Engine', '📷 Remote Camera Stream', '🎙️ Live Microphone', '🔔 Alert Intercept Feed', '👥 Contact Indexer', '💬 SMS Thread Reader', '🔦 Flashlight Controller', '📳 Haptic Trigger', '📦 Custom APK Builder', '🔒 P2P WebRTC Direct Tunnel', '👑 Multi-Device Fleet Manager'];

    return (
        <main className="bg-[#080807] text-[#fafaf9] overflow-x-hidden selection:bg-amber-200/20">

            {/* Global effects */}
            <div className="grain-overlay" />
            <CursorGlow />
            <StickyNav onScrollTo={scrollTo} />

            {/* ── Fixed Ambient Background ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute animate-orb-float" style={{ top: '-18%', right: '-12%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,140,100,0.065) 0%, transparent 60%)' }} />
                <div className="absolute animate-orb-float-alt" style={{ bottom: '-22%', left: '-12%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,140,220,0.045) 0%, transparent 60%)' }} />
                <div className="absolute" style={{ top: '45%', left: '30%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(110,170,232,0.035) 0%, transparent 55%)' }} />
            </div>


            {/* ═══ HERO ═══ */}
            <section ref={heroRef} className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-5 py-24 overflow-hidden">
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center text-center max-w-4xl mx-auto">

                    {/* Rotating gradient border logo */}
                    <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="relative mb-12">
                        <div className="relative w-[112px] h-[112px]">
                            <div className="absolute inset-0 rounded-[2rem] animate-spin-slow" style={{ background: 'conic-gradient(from 0deg, #d4a574, #e8966d, #b88ae8, #6ea8e8, #6ec4a8, #e8c46e, #d4a574)' }} />
                            <div className="absolute inset-0 rounded-[2rem] animate-spin-slow blur-xl opacity-50" style={{ background: 'conic-gradient(from 0deg, #d4a574, #e8966d, #b88ae8, #6ea8e8, #6ec4a8, #e8c46e, #d4a574)' }} />
                            <div className="absolute inset-[3px] rounded-[calc(2rem-3px)] overflow-hidden bg-[#080807]">
                                <Image src="/gallery-eye-logo.jpg" alt="Gallery Eye" width={106} height={106} className="w-full h-full object-cover" priority />
                            </div>
                        </div>
                    </motion.div>

                    {/* Status Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md mb-6"
                    >
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-xs font-mono text-zinc-300">v2.6 OS TUNNEL ACTIVE • ZERO CLOUD FOOTPRINT</span>
                    </motion.div>

                    {/* Headline with animated gradient */}
                    <motion.h1 initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="text-[clamp(2.5rem,7.5vw,5.6rem)] font-extrabold tracking-[-0.045em] leading-[1.05]">
                        Total Device Control.
                        <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-[#d4a574] via-[#e8966d] to-[#b88ae8] bg-clip-text text-transparent animate-gradient-text">
                            From Your Browser.
                        </span>
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} className="text-base sm:text-lg md:text-xl text-zinc-400 mt-7 max-w-2xl leading-relaxed font-light">
                        Gallery Sync with instant bulk export, live camera stream, SMS intercept, room mic, contacts, and haptics — all 8 remote tools over direct peer-to-peer WebRTC.
                    </motion.p>

                    {/* CTA */}
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex flex-wrap items-center justify-center gap-4 mt-12">
                        <button onClick={() => scrollTo('login-section')} className="group relative px-9 py-4.5 rounded-full font-bold text-sm text-[#1c1917] overflow-hidden active:scale-[0.96] transition-all shadow-[0_4px_25px_rgba(212,165,116,0.35)] hover:shadow-[0_8px_40px_rgba(212,165,116,0.5)]" style={{ background: 'linear-gradient(to bottom, #faf5ef, #ede5d8)' }}>
                            <span className="relative z-10 flex items-center gap-2 text-base">
                                Open Command Console
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1.5 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                        <button onClick={() => scrollTo('tools')} className="px-8 py-4.5 rounded-full font-semibold text-sm text-zinc-300 border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-400 active:scale-[0.96] flex items-center gap-2">
                            <span>Explore 8 Live Tools</span>
                            <span className="w-2 h-2 rounded-full bg-[#d4a574]" />
                        </button>
                    </motion.div>

                    {/* Tool icon pills with staggered pop-in */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} className="mt-20 flex items-center justify-center gap-3.5 flex-wrap">
                        {tools.map((t, i) => (
                            <motion.div key={t.id} initial={{ opacity: 0, scale: 0, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.9 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="w-13 h-13 p-3 rounded-2xl flex items-center justify-center border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.09] hover:border-white/[0.2] hover:scale-110 hover:-translate-y-1.5 transition-all duration-300 cursor-default group shadow-lg" style={{ color: t.accent }} title={t.name}>
                                <div className="scale-[0.8] group-hover:scale-[0.9] transition-transform">{t.icon}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Scroll to experience</span>
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-5 h-9 rounded-full border border-white/[0.1] flex items-start justify-center pt-2">
                        <div className="w-1.5 h-2.5 rounded-full bg-[#d4a574]" />
                    </motion.div>
                </motion.div>
            </section>


            {/* ═══ MARQUEE STRIP ═══ */}
            <section className="relative z-10 py-6 border-y border-white/[0.05] bg-black/40 backdrop-blur-md overflow-hidden">
                <div className="animate-marquee flex gap-10 whitespace-nowrap">
                    {[...marqueeItems, ...marqueeItems].map((item, i) => (
                        <span key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-400 tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-[#d4a574] shadow-[0_0_8px_#d4a574] flex-shrink-0" />
                            {item}
                        </span>
                    ))}
                </div>
            </section>


            {/* ═══ ALL 8 TOOLS WITH REALISTIC GALLERY SHOWCASE ═══ */}
            <section id="tools" className="relative z-10 py-32 px-5">
                <Reveal className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d4a574]/10 border border-[#d4a574]/30 text-[#d4a574] text-xs font-bold uppercase tracking-widest mb-4">
                        ★ Remote Command Matrix
                    </div>
                    <h2 className="text-3xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.1] mb-5">
                        Everything you need.{' '}
                        <span className="text-zinc-500">Nothing you don&apos;t.</span>
                    </h2>
                    <p className="text-base text-zinc-400 max-w-xl mx-auto">
                        High-fidelity, real-time control over connected devices without needing root access or manual transfers.
                    </p>
                </Reveal>

                <div className="max-w-6xl mx-auto flex flex-col gap-6">
                    {/* Featured card: Gallery Sync with Realistic Interactive Grid */}
                    <Reveal>
                        <div className="card-glow-border rounded-[2.5rem] p-8 sm:p-12 border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] transition-all duration-500 group relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none blur-[100px]" style={{ background: tools[0].accent }} />

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                                <div className="lg:col-span-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/[0.08] pb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/[0.1] bg-white/[0.04] shadow-[0_10px_25px_rgba(232,150,109,0.2)]" style={{ color: tools[0].accent }}>
                                            <div className="scale-125">{tools[0].icon}</div>
                                        </div>
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border" style={{ color: tools[0].accent, borderColor: `${tools[0].accent}40`, background: `${tools[0].accent}15` }}>
                                                ★ Flagship Tool • Live WebRTC Stream
                                            </div>
                                            <h3 className="text-3xl font-extrabold text-white tracking-tight">{tools[0].name}</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                                        Browse high-res internal DCIM folders, WhatsApp media, and Snapchat captures instantly. Select items below and test live ZIP archive generation right here in your browser!
                                    </p>
                                </div>

                                {/* Interactive Realistic Photo Grid Showcase inside Featured Card */}
                                <div className="lg:col-span-12 w-full">
                                    <InteractiveGalleryShowcase />
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* Remaining 7 tools: 2-col & 3-col grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tools.slice(1).map((tool, i) => (
                            <Reveal key={tool.id} delay={i * 0.06}>
                                <MagneticCard className="h-full">
                                    <div className="card-glow-border rounded-3xl p-7 sm:p-8 border border-white/[0.06] bg-white/[0.018] hover:bg-white/[0.04] transition-all duration-500 group h-full flex flex-col justify-between relative overflow-hidden shadow-xl">
                                        <div className="absolute top-6 left-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[50px] pointer-events-none" style={{ background: tool.accent }} />
                                        
                                        <div className="relative z-10">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/[0.08] bg-white/[0.03] group-hover:border-white/[0.18] group-hover:scale-110 transition-all duration-400 shadow-md" style={{ color: tool.accent }}>
                                                {tool.icon}
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#d4a574] transition-colors">{tool.name}</h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed mb-6">{tool.desc}</p>
                                        </div>

                                        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors relative z-10">
                                            <span>Socket Status: <strong className="text-emerald-400">ONLINE</strong></span>
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </div>

                                        {/* Corner accent lines */}
                                        <div className="absolute top-0 right-0 w-24 h-px opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" style={{ background: `linear-gradient(to left, ${tool.accent}50, transparent)` }} />
                                        <div className="absolute top-0 right-0 w-px h-24 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${tool.accent}50, transparent)` }} />
                                    </div>
                                </MagneticCard>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>


            {/* ═══ EXTRA CAPABILITIES ═══ */}
            <section id="capabilities" className="relative z-10 py-28 px-5 border-t border-white/[0.04]">
                <Reveal className="text-center max-w-xl mx-auto mb-16">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-semibold mb-4 text-[#d4a574]">Enterprise Power</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">Built for power users</h2>
                </Reveal>
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                        { name: 'Custom Companion APK Builder', desc: 'Generate a branded Android companion app baked with your custom socket URLs and auto-launch permissions right from the settings tab.', emoji: '📦', badge: '1-Click Build' },
                        { name: 'Multi-Device Command Fleet', desc: 'Connect up to 10 devices simultaneously under a single dashboard with instant switcher pills and battery level telemetry.', emoji: '📱', badge: '10 Max Devices' },
                        { name: 'High-Speed Bulk ZIP Stream', desc: 'Select hundreds of camera raw files or videos and download them as a single compressed archive without server bottlenecks.', emoji: '⚡', badge: '45 MB/sec Stream' },
                        { name: 'Zero-Knowledge Cryptography', desc: 'All WebRTC and WebSocket media packets are end-to-end encrypted. We never index or store your photos on third-party cloud storage.', emoji: '🔒', badge: 'AES-256 GCM' },
                    ].map((f, i) => (
                        <Reveal key={i} delay={i * 0.07}>
                            <div className="card-glow-border rounded-3xl p-7 border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.04] transition-all duration-400 group flex items-start gap-6 shadow-lg h-full">
                                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-400 shadow-md">
                                    {f.emoji}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-white group-hover:text-[#d4a574] transition-colors">{f.name}</h3>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/[0.06] text-zinc-300 border border-white/[0.1]">{f.badge}</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>


            {/* ═══ ANIMATED STATS ═══ */}
            <section className="relative z-10 py-24 px-5 border-y border-white/[0.06] bg-black/40 backdrop-blur-lg">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
                    {[
                        { target: 8, suffix: '', label: 'Remote Tools' },
                        { target: 10, suffix: '', label: 'Max Active Fleet' },
                        { target: 14, prefix: '< ', suffix: 'ms', label: 'WebRTC Latency' },
                        { target: 256, suffix: '-bit', label: 'E2E Encryption' },
                    ].map((s, i) => (
                        <Reveal key={i} delay={i * 0.08}>
                            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
                                <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tight">
                                    <Counter target={s.target} suffix={s.suffix} prefix={s.prefix || ''} />
                                </div>
                                <div className="text-xs text-[#d4a574] mt-3 uppercase tracking-[0.25em] font-bold">{s.label}</div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>


            {/* ═══ SPACIOUS WIDE LUXURY LOGIN PORTAL ("THORA KHULA BETTER DESIGN") ═══ */}
            <section id="login-section" className="relative z-10 py-32 px-5">
                <Reveal className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                        🔐 Secure Command Console Entry
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-5">
                        Access Your Console
                    </h2>
                    <p className="text-base text-zinc-400 max-w-xl mx-auto">
                        Sign in using your Google credentials or secure admin account to establish an instant WebSocket connection to your devices.
                    </p>
                </Reveal>

                <Reveal delay={0.15}>
                    <div className="max-w-6xl mx-auto">
                        <div className="card-glow-border rounded-[2.5rem] p-1 border border-white/[0.1] bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-[0_30px_100px_rgba(0,0,0,0.95)]">
                            <div className="rounded-[calc(2.5rem-2px)] bg-[#0d0d10] grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
                                
                                {/* Left Pane: The Architecture & Trust Hub */}
                                <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 bg-gradient-to-br from-white/[0.04] via-transparent to-black/60 border-b lg:border-b-0 lg:border-r border-white/[0.08] flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#d4a574]/10 blur-[80px] pointer-events-none" />

                                    <div>
                                        <div className="flex items-center gap-3.5 mb-8">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-white/[0.15] shadow-lg">
                                                <Image src="/gallery-eye-logo.jpg" alt="Gallery Eye" width={48} height={48} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-extrabold text-white tracking-tight">Gallery Eye OS</h3>
                                                <span className="text-xs text-[#d4a574] font-mono font-bold">v2.6 Enterprise Command</span>
                                            </div>
                                        </div>

                                        <h4 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-snug">
                                            Total privacy. Zero cloud index.
                                        </h4>
                                        <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                                            Unlike standard cloud solutions that copy your private photos to external servers, Gallery Eye creates a direct WebRTC peer-to-peer tunnel right between your browser and your Android hardware.
                                        </p>

                                        {/* Security Guarantee List */}
                                        <div className="space-y-4 mb-10">
                                            {[
                                                { title: 'Direct WebRTC Media Tunnel', desc: 'Photos & 4K videos stream without touching third-party cloud storage.' },
                                                { title: 'Encrypted WebSocket Control', desc: 'Commands execute in under 18ms over secure 256-bit SSL tunnels.' },
                                                { title: 'Zero Plaintext Storage', desc: 'Your credentials and device tokens are hashed and encrypted at rest.' },
                                            ].map((g, idx) => (
                                                <div key={idx} className="flex items-start gap-3.5">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5 text-xs font-bold">
                                                        ✓
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{g.title}</div>
                                                        <div className="text-xs text-zinc-400 leading-relaxed">{g.desc}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Simulated Live Device Status Pill */}
                                    <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                                            </span>
                                            <div>
                                                <div className="text-xs font-bold text-white">Global Dispatch Server</div>
                                                <div className="text-[10px] text-zinc-400 font-mono">ws://tunnel.galleryeye.net (14ms)</div>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            ALL SYSTEMS GO
                                        </span>
                                    </div>
                                </div>

                                {/* Right Pane: Wide Spacious Form ("Thora Khula Better Design") */}
                                <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 bg-black/40 flex flex-col justify-center">
                                    <div className="max-w-md mx-auto w-full">
                                        <div className="mb-8">
                                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                                                Sign In to Dashboard
                                            </h3>
                                            <p className="text-sm text-zinc-400">
                                                Enter your credentials below or continue with Google One-Tap authentication.
                                            </p>
                                        </div>

                                        {/* Google OAuth Button */}
                                        <button
                                            onClick={() => signIn('google', { callbackUrl: '/' })}
                                            className="w-full py-4 px-6 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] hover:border-[#d4a574]/40 text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3.5 shadow-lg hover:shadow-[0_0_30px_rgba(212,165,116,0.15)] active:scale-98 mb-6"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                            <span>Continue with Google Account</span>
                                        </button>

                                        {/* Divider */}
                                        <div className="flex items-center gap-4 my-7">
                                            <div className="flex-1 h-px bg-white/[0.08]" />
                                            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">OR EMAIL ACCESS</span>
                                            <div className="flex-1 h-px bg-white/[0.08]" />
                                        </div>

                                        {/* Credentials Form */}
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div>
                                                <label htmlFor="email-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    id="email-input"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                                    placeholder="you@example.com"
                                                    required
                                                    autoComplete="email"
                                                    className="w-full py-4 px-5 bg-black/60 border border-white/[0.1] rounded-2xl text-white text-base font-medium outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#d4a574] focus:shadow-[0_0_25px_rgba(212,165,116,0.15)] focus:bg-black"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label htmlFor="password-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                                        Password
                                                    </label>
                                                    <a href="#" className="text-xs text-[#d4a574] hover:underline font-semibold">Forgot password?</a>
                                                </div>
                                                <input
                                                    id="password-input"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                                    placeholder="••••••••••••"
                                                    required
                                                    autoComplete="current-password"
                                                    className="w-full py-4 px-5 bg-black/60 border border-white/[0.1] rounded-2xl text-white text-base font-medium outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#d4a574] focus:shadow-[0_0_25px_rgba(212,165,116,0.15)] focus:bg-black"
                                                />
                                            </div>

                                            {/* Remember Session Option */}
                                            <div className="flex items-center justify-between pt-1">
                                                <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-black/60 text-[#d4a574] focus:ring-0 cursor-pointer" />
                                                    <span>Keep session active for 30 days</span>
                                                </label>
                                            </div>

                                            {error && (
                                                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium flex items-center gap-2.5">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                                                    <span>{error}</span>
                                                </motion.div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="group relative w-full py-4.5 rounded-2xl font-bold text-base text-[#1c1917] overflow-hidden transition-all duration-300 shadow-[0_4px_25px_rgba(212,165,116,0.3)] hover:shadow-[0_8px_35px_rgba(212,165,116,0.45)] active:scale-98 flex items-center justify-center mt-2"
                                                style={{ background: 'linear-gradient(to bottom, #faf5ef, #ede5d8)' }}
                                            >
                                                {isLoading ? (
                                                    <div className="flex items-center gap-2.5 text-base">
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                                        <span>Authenticating Socket...</span>
                                                    </div>
                                                ) : (
                                                    <div className="relative z-10 flex items-center gap-2">
                                                        <span>Sign In to Dashboard</span>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                            </button>
                                        </form>

                                        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
                                            <p className="text-xs text-zinc-500">
                                                By signing in, you agree to our <a href="#" className="text-zinc-300 underline">Terms of Service</a> & <a href="#" className="text-zinc-300 underline">End-to-End Encryption Policy</a>.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>


            {/* ═══ FOOTER ═══ */}
            <footer className="relative z-10 py-16 px-5 border-t border-white/[0.06] bg-black/60">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/[0.1] shadow-lg">
                            <Image src="/gallery-eye-logo.jpg" alt="GE" width={36} height={36} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-white">Gallery Eye OS Console</div>
                            <div className="text-xs text-zinc-500 font-mono">© 2026 Gallery Eye Technologies Inc.</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 text-xs font-semibold text-zinc-400">
                        <a href="#" className="hover:text-[#d4a574] transition-colors">Security Architecture</a>
                        <a href="#" className="hover:text-[#d4a574] transition-colors">WebRTC Specs</a>
                        <a href="#" className="hover:text-[#d4a574] transition-colors">System Status</a>
                        <a href="#" className="hover:text-[#d4a574] transition-colors">Privacy Vault</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
