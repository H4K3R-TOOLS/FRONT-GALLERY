"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Image as ImageIcon, Video, Package, DownloadCloud, 
    X, LayoutGrid, Lock, Crown, Sparkles, Folder, Check
} from 'lucide-react';

interface SyncOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    folder: any;
    userPlan: 'free' | 'basic' | 'standard' | 'premium' | 'enterprise';
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

    const isPremium = userPlan === 'premium' || userPlan === 'enterprise';
    const isBasic = userPlan === 'basic';

    // Get max count for current media type
    const maxCount = mediaType === 'image'
        ? (folder?.imageCount ?? folder?.count ?? 999)
        : (folder?.videoCount ?? folder?.count ?? 999);

    // Compute accurate total count
    const computedTotal = (() => {
        if (folder?.count && folder.count > 0) return folder.count;
        const ic = folder?.imageCount ?? 0;
        const vc = folder?.videoCount ?? 0;
        if (ic + vc > 0) return ic + vc;
        return null;
    })();

    const totalCount = computedTotal;

    // Handle locked feature click
    const handleLockedClick = (feature: string) => {
        setUpgradeMessage(`Upgrade to Premium or Enterprise to unlock "${feature}"`);
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
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="clay-card relative w-full max-w-lg p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
            >
                {/* Close Button */}
                <button 
                    type="button"
                    onClick={onClose} 
                    className="clay-button-sm absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer z-10"
                >
                    <X size={16} />
                </button>

                <div className="space-y-6">
                    
                    {/* Header */}
                    <div className="text-center pt-2">
                        <div className="clay-icon-pod w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                            <Folder className="w-6 h-6 text-orange-400" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                            Folder Sync Config
                        </h2>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 border border-white/5 mt-2">
                            <span className="text-xs font-black text-orange-300 font-mono">{folder.name}</span>
                            {totalCount !== null && (
                                <span className="text-[11px] text-white/40 font-mono">({totalCount} items)</span>
                            )}
                        </div>
                    </div>

                    {/* 1. Media Type Selector */}
                    {(hasImages && hasVideos) && (
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">
                                1. Select Media Type
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setMediaType('image'); setShowManualInput(false); setManualInput(''); }}
                                    className={`clay-capsule p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                                        mediaType === 'image' 
                                            ? 'border-orange-500/60 bg-orange-500/15 shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                                            : 'hover:border-white/20'
                                    }`}
                                >
                                    <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                                        <ImageIcon className={`w-5 h-5 ${mediaType === 'image' ? 'text-orange-400' : 'text-white/40'}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className={`text-xs font-black ${mediaType === 'image' ? 'text-orange-300' : 'text-white'}`}>Photos</div>
                                        <div className="text-[10px] font-mono text-white/40">{folder?.imageCount ?? 'All'} available</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setMediaType('video'); setShowManualInput(false); setManualInput(''); }}
                                    className={`clay-capsule p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                                        mediaType === 'video' 
                                            ? 'border-orange-500/60 bg-orange-500/15 shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                                            : 'hover:border-white/20'
                                    }`}
                                >
                                    <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                                        <Video className={`w-5 h-5 ${mediaType === 'video' ? 'text-red-400' : 'text-white/40'}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className={`text-xs font-black ${mediaType === 'video' ? 'text-orange-300' : 'text-white'}`}>Videos</div>
                                        <div className="text-[10px] font-mono text-white/40">{folder?.videoCount ?? 'All'} available</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. Quantity to Fetch */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">
                            2. Quantity to Pull
                        </span>
                        
                        <div className="grid grid-cols-5 gap-1.5 bg-[#0a0c10] p-1.5 rounded-2xl border border-white/5 shadow-inner">
                            {quantityOptions.map((opt) => {
                                const isActive = opt.value === 'manual'
                                    ? showManualInput
                                    : (fetchCount === opt.value && !showManualInput);

                                return (
                                    <button
                                        key={opt.label}
                                        type="button"
                                        onClick={() => {
                                            if (opt.locked) {
                                                handleLockedClick('Fetch All');
                                                return;
                                            }
                                            if (opt.value === 'manual') {
                                                setShowManualInput(true);
                                                setManualInput('');
                                            } else {
                                                setShowManualInput(false);
                                                setFetchCount(opt.value as any);
                                            }
                                        }}
                                        className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                                            isActive
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_2px_12px_rgba(249,115,22,0.5)] font-black'
                                                : opt.locked
                                                    ? 'text-white/20 cursor-not-allowed opacity-40'
                                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {opt.locked && <Lock size={10} />}
                                        <span>{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Manual Input Field */}
                        <AnimatePresence>
                            {showManualInput && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden pt-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                type="number"
                                                min={1}
                                                max={maxCount}
                                                value={manualInput}
                                                onChange={(e) => setManualInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                                                placeholder={`Enter count (1 - ${maxCount})`}
                                                className="w-full pl-4 pr-14 py-2.5 bg-[#0a0c10] border border-white/10 rounded-xl text-white text-xs font-mono font-bold placeholder:text-white/20 focus:outline-none focus:border-orange-500/60 shadow-inner"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setManualInput(String(maxCount))}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-white/10 text-[9px] font-mono font-black text-orange-400 uppercase"
                                            >
                                                Max
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleManualSubmit}
                                            className="clay-cta-button px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
                                        >
                                            Set
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 3. Sync Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">
                            3. Select Extraction Method
                        </span>

                        <div className="flex flex-col gap-2.5">
                            {/* Option A: One by One */}
                            <button
                                type="button"
                                onClick={() => {
                                    onSync(mediaType, fetchCount, 'oneByOne');
                                    onClose();
                                }}
                                className="clay-capsule w-full flex items-center justify-between p-3.5 rounded-2xl hover:border-orange-500/40 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <LayoutGrid className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-black text-white uppercase tracking-wider">Stream to Gallery</div>
                                        <div className="text-[10px] text-white/40 font-mono">View photos & videos directly inside app</div>
                                    </div>
                                </div>
                                <DownloadCloud size={16} className="text-white/40 group-hover:text-orange-400 transition-colors" />
                            </button>

                            {/* Option B: Download as ZIP */}
                            <button
                                type="button"
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
                                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer relative overflow-hidden ${
                                    isPremium
                                        ? 'clay-cta-button text-white shadow-[0_8px_24px_rgba(249,115,22,0.4)] hover:scale-[1.01] active:scale-[0.98]'
                                        : 'clay-capsule opacity-70 hover:opacity-100'
                                }`}
                            >
                                {isPremium && (
                                    <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-black/40 text-orange-300 text-[8px] font-mono font-black uppercase rounded-bl-lg tracking-widest">
                                        Fastest Batch
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center">
                                        <Package className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                            <span>Download as ZIP Archive</span>
                                            {!isPremium && (
                                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-0.5">
                                                    <Lock size={9} /> PRO
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-white/70 font-mono">Compressed single package extraction</div>
                                    </div>
                                </div>
                                <DownloadCloud size={16} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Premium Upgrade Modal */}
                <AnimatePresence>
                    {showUpgradePopup && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 backdrop-blur-md rounded-[2rem] p-6 text-center"
                        >
                            <div className="max-w-xs space-y-4">
                                <div className="clay-target-pin w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                                    <Crown className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white uppercase tracking-wider">Plan Upgrade Required</h3>
                                    <p className="text-xs text-white/40 font-mono mt-1">{upgradeMessage}</p>
                                </div>
                                <div className="flex flex-col gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setShowUpgradePopup(false); onUpgrade(); }}
                                        className="clay-cta-button w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer"
                                    >
                                        Upgrade Plan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowUpgradePopup(false)}
                                        className="clay-capsule w-full py-2.5 rounded-xl font-bold text-xs text-white/50 hover:text-white cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
