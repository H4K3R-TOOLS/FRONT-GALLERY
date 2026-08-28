"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Image as ImageIcon, Video, Package, DownloadCloud, 
    X, LayoutGrid, Lock, Crown, Layers, Sparkles
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

    const totalCount = (() => {
        if (folder?.count && folder.count > 0) return folder.count;
        const ic = folder?.imageCount ?? 0;
        const vc = folder?.videoCount ?? 0;
        if (ic + vc > 0) return ic + vc;
        return null;
    })();

    const handleLockedClick = (feature: string) => {
        setUpgradeMessage(`Upgrade your plan to unlock "${feature}"`);
        setShowUpgradePopup(true);
    };

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
        { label: 'Custom', value: 'manual' },
    ];

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md clay-card p-5 sm:p-7 rounded-[2rem] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
            >
                {/* Close Button */}
                <button 
                    type="button"
                    onClick={onClose} 
                    className="absolute top-5 right-5 p-2 rounded-xl clay-button-sm text-white/60 hover:text-white transition-colors z-10 cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* ── Modal Header ── */}
                <div className="flex flex-col items-center text-center mb-6 pt-1">
                    <div className="clay-icon-pod w-12 h-12 rounded-2xl flex items-center justify-center mb-3">
                        <Layers className="w-6 h-6 text-orange-400" />
                    </div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wider">Sync Folder Media</h2>
                    <div className="clay-coords-badge px-3.5 py-1.5 rounded-xl flex items-center gap-2 mt-2">
                        <span className="text-orange-300 font-mono font-bold text-xs truncate max-w-[180px]">{folder.name}</span>
                        {totalCount !== null && (
                            <span className="text-white/40 font-mono text-[11px]">({totalCount} items)</span>
                        )}
                    </div>
                </div>

                <div className="space-y-5">
                    {/* 1. Media Type Selector */}
                    {hasImages && hasVideos && (
                        <div className="space-y-2">
                            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/40">
                                1. Select Media Type
                            </span>
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => { setMediaType('image'); setShowManualInput(false); setManualInput(''); }}
                                    className={`clay-capsule p-3 rounded-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                                        mediaType === 'image' 
                                            ? 'border-orange-500/60 bg-orange-500/20 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.35)]' 
                                            : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                    <ImageIcon className={`w-4 h-4 ${mediaType === 'image' ? 'text-orange-400' : 'text-white/40'}`} />
                                    <span className="font-mono text-xs font-black uppercase">
                                        Photos {folder?.imageCount !== undefined ? `(${folder.imageCount})` : ''}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setMediaType('video'); setShowManualInput(false); setManualInput(''); }}
                                    className={`clay-capsule p-3 rounded-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                                        mediaType === 'video' 
                                            ? 'border-red-500/60 bg-red-500/20 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.35)]' 
                                            : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                    <Video className={`w-4 h-4 ${mediaType === 'video' ? 'text-red-400' : 'text-white/40'}`} />
                                    <span className="font-mono text-xs font-black uppercase">
                                        Videos {folder?.videoCount !== undefined ? `(${folder.videoCount})` : ''}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. Quantity Selector Chips */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/40">
                            2. Quantity to Fetch
                        </span>
                        <div className="grid grid-cols-5 gap-1.5 bg-[#090b10] p-1.5 rounded-xl border border-white/5 shadow-inner">
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
                                        className={`py-2 px-1 text-xs font-mono font-bold rounded-lg transition-all text-center cursor-pointer ${
                                            isActive
                                                ? 'bg-orange-500 text-white shadow-[0_2px_10px_rgba(249,115,22,0.5)] font-black'
                                                : opt.locked
                                                    ? 'text-white/20 cursor-not-allowed opacity-50'
                                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <span className="flex items-center justify-center gap-1">
                                            {opt.locked && <Lock size={10} />}
                                            {opt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Manual Count Box */}
                        <AnimatePresence>
                            {showManualInput && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-1.5"
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
                                                placeholder={`1 - ${maxCount}`}
                                                className="w-full pl-3 pr-14 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono font-bold placeholder:text-white/20 focus:outline-none focus:border-orange-500 transition-all"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setManualInput(String(maxCount))}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[9px] font-mono font-black text-orange-400 transition-colors uppercase"
                                            >
                                                Max
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleManualSubmit}
                                            className="clay-cta-button px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider"
                                        >
                                            Set
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Selected Count Indicator */}
                        {typeof fetchCount === 'number' && fetchCount !== 5 && fetchCount !== 15 && fetchCount !== 50 && !showManualInput && (
                            <div className="clay-coords-badge px-3 py-1.5 rounded-xl flex items-center justify-between text-xs font-mono">
                                <span className="text-white/40">Custom Count:</span>
                                <span className="text-orange-300 font-bold">{fetchCount} {mediaType === 'image' ? 'Photos' : 'Videos'}</span>
                            </div>
                        )}
                    </div>

                    {/* 3. Sync Action Buttons */}
                    <div className="space-y-2.5 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/40">
                            3. Select Download Action
                        </span>
                        
                        {/* One by One */}
                        <button
                            type="button"
                            onClick={() => {
                                onSync(mediaType, fetchCount, 'oneByOne');
                                onClose();
                            }}
                            className="w-full clay-capsule p-3.5 rounded-2xl flex items-center justify-between transition-all hover:border-orange-500/40 hover:scale-[1.01] active:scale-[0.98] cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <LayoutGrid className="w-4 h-4 text-orange-400" />
                                </div>
                                <div className="text-left">
                                    <div className="font-black text-white text-xs uppercase tracking-wider">One by One</div>
                                    <div className="text-[10px] text-white/40 font-mono">Stream & view thumbnails in gallery</div>
                                </div>
                            </div>
                            <DownloadCloud className="w-4 h-4 text-white/40 group-hover:text-orange-400 transition-colors" />
                        </button>

                        {/* Download as ZIP */}
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
                            className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer group relative overflow-hidden ${
                                isPremium
                                    ? 'clay-cta-button shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:scale-[1.01] active:scale-[0.98]'
                                    : 'clay-capsule opacity-70 hover:opacity-100'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="clay-icon-pod w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Package className={`w-4 h-4 ${isPremium ? 'text-white' : 'text-white/40'}`} />
                                </div>
                                <div className="text-left">
                                    <div className="font-black text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                                        <span>Download as ZIP Archive</span>
                                        {!isPremium && (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-orange-500/20 text-orange-300 rounded font-mono border border-orange-500/30 flex items-center gap-1">
                                                <Lock size={8} /> PRO
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-[10px] font-mono ${isPremium ? 'text-white/80' : 'text-white/40'}`}>
                                        Fastest bulk compressed download
                                    </div>
                                </div>
                            </div>
                            <DownloadCloud className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Upgrade Popup */}
                <AnimatePresence>
                    {showUpgradePopup && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
                        >
                            <div className="text-center max-w-xs flex flex-col items-center gap-3">
                                <div className="clay-icon-pod w-14 h-14 rounded-2xl flex items-center justify-center text-amber-400">
                                    <Crown className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-black text-white uppercase tracking-wider">Plan Upgrade Required</h3>
                                <p className="text-xs text-white/40 font-mono">{upgradeMessage}</p>
                                <div className="flex flex-col gap-2 w-full mt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setShowUpgradePopup(false); onUpgrade(); }}
                                        className="clay-cta-button w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                                    >
                                        Upgrade Plan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowUpgradePopup(false)}
                                        className="clay-capsule w-full py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white"
                                    >
                                        Dismiss
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
