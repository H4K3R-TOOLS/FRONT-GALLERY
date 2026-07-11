"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, Package, DownloadCloud, X, LayoutGrid, Lock, Crown, Keyboard } from 'lucide-react';

interface SyncOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    folder: any;
    userPlan: 'free' | 'basic' | 'standard' | 'premium';
    onSync: (mediaType: 'image' | 'video', count: number | 'all', method: 'oneByOne' | 'zip') => void;
    onUpgrade: () => void;
}

export default function SyncOptionsModal({
    isOpen,
    onClose,
    folder,
    userPlan,
    onSync,
    onUpgrade
}: SyncOptionsModalProps) {
    const hasImages = folder?.imageCount === undefined || folder?.imageCount > 0;
    const hasVideos = folder?.videoCount === undefined || folder?.videoCount > 0;

    const [mediaType, setMediaType] = useState<'image' | 'video'>(hasImages ? 'image' : 'video');
    const [fetchCount, setFetchCount] = useState<number | 'all'>(5);
    const [manualInput, setManualInput] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [showUpgradePopup, setShowUpgradePopup] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (hasImages && !hasVideos) setMediaType('image');
            else if (hasVideos && !hasImages) setMediaType('video');
            else setMediaType('image');
            setFetchCount(5);
            setShowManualInput(false);
            setManualInput('');
            setShowUpgradePopup(false);
        }
    }, [isOpen, hasImages, hasVideos]);

    if (!isOpen || !folder) return null;

    const isPremium = userPlan === 'premium';
    const isBasic = userPlan === 'basic';

    // Get max count for current media type
    const maxCount = mediaType === 'image'
        ? (folder?.imageCount ?? folder?.count ?? 999)
        : (folder?.videoCount ?? folder?.count ?? 999);

    // Compute accurate total count — never show 0 if image/video counts exist
    const computedTotal = (() => {
        if (folder?.count && folder.count > 0) return folder.count;
        const ic = folder?.imageCount ?? 0;
        const vc = folder?.videoCount ?? 0;
        if (ic + vc > 0) return ic + vc;
        return null; // unknown — hide the count
    })();

    const totalCount = computedTotal;

    // Handle locked feature click
    const handleLockedClick = (feature: string) => {
        setUpgradeMessage(`Upgrade to Premium to unlock "${feature}"`);
        setShowUpgradePopup(true);
    };

    // Handle manual input submit
    const handleManualSubmit = () => {
        const val = parseInt(manualInput, 10);
        if (!isNaN(val) && val > 0) {
            const clamped = Math.min(val, maxCount);
            setFetchCount(clamped);
            setShowManualInput(false);
        }
    };

    const quantityOptions: { label: string; value: number | 'all' | 'manual'; locked?: boolean }[] = [
        { label: '5', value: 5 },
        { label: '15', value: 15 },
        { label: '50', value: 50 },
        { label: 'All', value: 'all', locked: isBasic },
        { label: 'Manual', value: 'manual' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg neo-surface rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden"
            >
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-accent/20 to-transparent opacity-50 pointer-events-none" />

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-fg-2 hover:text-white transition-colors z-10">
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 pt-10">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-fg-1 tracking-tight mb-2">Sync Settings</h2>
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/5 shadow-inner">
                            <span className="text-accent font-semibold">{folder.name}</span>
                            {totalCount !== null && (
                                <span className="text-fg-3 text-sm">({totalCount} items)</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* 1. Media Type */}
                        {(hasImages && hasVideos) && (
                            <div>
                                <h3 className="text-sm font-bold text-fg-2 uppercase tracking-widest mb-3 px-1">1. Media Type</h3>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setMediaType('image'); setShowManualInput(false); setManualInput(''); }}
                                        className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${mediaType === 'image' ? 'bg-accent/10 border-accent/50 shadow-accent-glow' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}
                                    >
                                        <ImageIcon className={`w-8 h-8 ${mediaType === 'image' ? 'text-accent' : 'text-fg-3'}`} />
                                        <span className={`font-bold ${mediaType === 'image' ? 'text-accent' : 'text-fg-2'}`}>Photos {folder?.imageCount !== undefined ? `(${folder.imageCount})` : ''}</span>
                                    </button>
                                    <button
                                        onClick={() => { setMediaType('video'); setShowManualInput(false); setManualInput(''); }}
                                        className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${mediaType === 'video' ? 'bg-accent/10 border-accent/50 shadow-accent-glow' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}
                                    >
                                        <Video className={`w-8 h-8 ${mediaType === 'video' ? 'text-accent' : 'text-fg-3'}`} />
                                        <span className={`font-bold ${mediaType === 'video' ? 'text-accent' : 'text-fg-2'}`}>Videos {folder?.videoCount !== undefined ? `(${folder.videoCount})` : ''}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 2. Quantity to Fetch */}
                        <div>
                            <h3 className="text-sm font-bold text-fg-2 uppercase tracking-widest mb-3 px-1">2. Quantity to Fetch</h3>
                            {/* Quantity Buttons — fixed size, color/border glow on active */}
                            <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 shadow-inner">
                                {quantityOptions.map((opt) => {
                                    const isActive = opt.value === 'manual'
                                        ? showManualInput
                                        : (fetchCount === opt.value && !showManualInput);

                                    return (
                                        <button
                                            key={opt.label}
                                            onClick={() => {
                                                if (opt.locked) {
                                                    handleLockedClick('Fetch All');
                                                    return;
                                                }
                                                if (opt.value === 'manual') {
                                                    setShowManualInput(true);
                                                    setManualInput(String(maxCount));
                                                } else {
                                                    setShowManualInput(false);
                                                    setFetchCount(opt.value as any);
                                                }
                                            }}
                                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors duration-200 ${
                                                isActive
                                                    ? 'bg-accent/20 text-accent border border-accent/60 ring-1 ring-accent/30'
                                                    : opt.locked
                                                        ? 'text-fg-4 cursor-not-allowed opacity-50 border border-transparent'
                                                        : 'text-fg-3 hover:text-white hover:bg-white/10 border border-transparent'
                                            }`}
                                        >
                                            <span className="flex items-center justify-center gap-1">
                                                {opt.locked && <Lock className="w-3 h-3" />}
                                                {opt.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Manual Input */}
                            <AnimatePresence>
                                {showManualInput && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={maxCount}
                                                    value={manualInput}
                                                    onChange={(e) => setManualInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                                                    placeholder={String(maxCount)}
                                                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white text-base font-bold placeholder:text-fg-4 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/30 transition-all"
                                                    style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                onClick={handleManualSubmit}
                                                className="px-5 py-3 rounded-xl bg-accent text-black font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-accent-glow"
                                            >
                                                Set
                                            </button>
                                        </div>
                                        {/* Highlight the typed number */}
                                        {manualInput && !isNaN(parseInt(manualInput, 10)) && (
                                            <div className="mt-3 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-between">
                                                <span className="text-xs text-fg-3 font-semibold">Will fetch:</span>
                                                <span className="text-accent font-extrabold text-lg tabular-nums">
                                                    {Math.min(parseInt(manualInput, 10), maxCount)}
                                                    <span className="text-fg-4 text-xs font-semibold ml-1">{mediaType === 'image' ? 'photos' : 'videos'}</span>
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Show custom selected count after setting manual */}
                            {typeof fetchCount === 'number' && fetchCount !== 5 && fetchCount !== 15 && fetchCount !== 50 && !showManualInput && (
                                <div className="mt-3 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-between">
                                    <span className="text-xs text-fg-3 font-semibold">Custom selected:</span>
                                    <span className="text-accent font-extrabold text-lg tabular-nums">
                                        {fetchCount}
                                        <span className="text-fg-4 text-xs font-semibold ml-1">{mediaType === 'image' ? 'photos' : 'videos'}</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 3. Actions */}
                        <div className="pt-4 border-t border-white/5">
                            <h3 className="text-sm font-bold text-fg-2 uppercase tracking-widest mb-3 px-1">3. Start Sync</h3>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        onSync(mediaType, fetchCount, 'oneByOne');
                                        onClose();
                                    }}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <LayoutGrid className="w-5 h-5 text-accent" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-fg-1">One by One</div>
                                            <div className="text-xs text-fg-3">View images directly in the app</div>
                                        </div>
                                    </div>
                                    <DownloadCloud className="w-5 h-5 text-fg-3 group-hover:text-accent transition-colors" />
                                </button>

                                <button
                                    onClick={() => {
                                        if (isBasic) {
                                            handleLockedClick('Download as ZIP');
                                            return;
                                        }
                                        if (isPremium) {
                                            onSync(mediaType, fetchCount, 'zip');
                                            onClose();
                                        } else {
                                            onUpgrade();
                                        }
                                    }}
                                    className={`relative w-full flex items-center justify-between p-4 rounded-2xl border transition-all group overflow-hidden ${
                                        isPremium
                                            ? 'bg-accent text-black border-accent/50 shadow-accent-glow hover:scale-[1.02]'
                                            : 'bg-black/60 border-white/5 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    {isPremium && (
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-black/20 text-black text-[10px] font-extrabold rounded-bl-xl tracking-wider">
                                            RECOMMENDED
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${isPremium ? 'bg-black/20 group-hover:scale-110' : 'bg-white/10'}`}>
                                            <Package className={`w-5 h-5 ${isPremium ? 'text-black' : 'text-fg-3'}`} />
                                        </div>
                                        <div className="text-left mt-1">
                                            <div className="font-bold flex items-center gap-2">
                                                Download as ZIP
                                                {!isPremium && <span className="text-[9px] px-2 py-0.5 bg-accent/20 text-accent rounded-full border border-accent/30 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> PREMIUM</span>}
                                            </div>
                                            <div className={`text-xs ${isPremium ? 'text-black/70' : 'text-fg-4'}`}>Fastest bulk download</div>
                                        </div>
                                    </div>
                                    <DownloadCloud className={`w-5 h-5 transition-colors ${isPremium ? 'text-black' : 'text-fg-3'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium Upgrade Popup */}
                <AnimatePresence>
                    {showUpgradePopup && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-[2rem]"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="p-8 text-center max-w-xs"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Premium Required</h3>
                                <p className="text-fg-3 text-sm mb-6">{upgradeMessage}</p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => { setShowUpgradePopup(false); onUpgrade(); }}
                                        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                    >
                                        Buy Premium
                                    </button>
                                    <button
                                        onClick={() => setShowUpgradePopup(false)}
                                        className="w-full py-3 px-6 rounded-xl bg-white/5 text-fg-3 font-semibold hover:bg-white/10 transition-colors"
                                    >
                                        Maybe Later
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
