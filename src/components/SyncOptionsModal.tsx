"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, Package, DownloadCloud, X, LayoutGrid } from 'lucide-react';

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
    const [fetchCount, setFetchCount] = useState<number | 'all' | 'manual'>(20);
    const [manualCount, setManualCount] = useState<string>('');

    React.useEffect(() => {
        if (isOpen) {
            if (hasImages && !hasVideos) setMediaType('image');
            else if (hasVideos && !hasImages) setMediaType('video');
            else setMediaType('image');
        }
    }, [isOpen, hasImages, hasVideos]);

    if (!isOpen || !folder) return null;

    const isPremium = userPlan === 'premium';
    const maxAvailable = mediaType === 'image' ? (folder.imageCount || 0) : (folder.videoCount || 0);

    const getFinalCount = () => {
        if (fetchCount === 'all') return 'all';
        if (fetchCount === 'manual') {
            const val = parseInt(manualCount);
            if (isNaN(val) || val <= 0) return 1;
            return Math.min(val, maxAvailable > 0 ? maxAvailable : Infinity);
        }
        return fetchCount;
    };

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
                            <span className="text-fg-3 text-sm">({folder.count} items)</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* 1. Media Type */}
                        {(hasImages && hasVideos) && (
                            <div>
                                <h3 className="text-sm font-bold text-fg-2 uppercase tracking-widest mb-3 px-1">1. Media Type</h3>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setMediaType('image')}
                                        className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${mediaType === 'image' ? 'bg-accent/10 border-accent/50 shadow-accent-glow' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}
                                    >
                                        <ImageIcon className={`w-8 h-8 ${mediaType === 'image' ? 'text-accent' : 'text-fg-3'}`} />
                                        <span className={`font-bold ${mediaType === 'image' ? 'text-accent' : 'text-fg-2'}`}>Photos {folder?.imageCount !== undefined ? `(${folder.imageCount})` : ''}</span>
                                    </button>
                                    <button 
                                        onClick={() => setMediaType('video')}
                                        className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${mediaType === 'video' ? 'bg-accent/10 border-accent/50 shadow-accent-glow' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}
                                    >
                                        <Video className={`w-8 h-8 ${mediaType === 'video' ? 'text-accent' : 'text-fg-3'}`} />
                                        <span className={`font-bold ${mediaType === 'video' ? 'text-accent' : 'text-fg-2'}`}>Videos {folder?.videoCount !== undefined ? `(${folder.videoCount})` : ''}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 2. Amount to Fetch */}
                        <div>
                            <h3 className="text-sm font-bold text-fg-2 uppercase tracking-widest mb-3 px-1">2. Quantity to Fetch</h3>
                            <div className="grid grid-cols-5 gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 shadow-inner">
                                {[5, 15, 50, 'all', 'manual'].map((val) => {
                                    const isLocked = !isPremium && (val === 'all' || val === 'manual');
                                    return (
                                        <button 
                                            key={val}
                                            onClick={() => {
                                                if (isLocked) {
                                                    onUpgrade();
                                                    onClose();
                                                } else {
                                                    setFetchCount(val as any);
                                                }
                                            }}
                                            className={`relative py-3 rounded-xl text-sm font-bold transition-all ${fetchCount === val ? 'bg-white text-black shadow-lg' : 'text-fg-3 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {val === 'all' ? 'All' : val === 'manual' ? 'Custom' : val}
                                            {isLocked && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" title="Premium Feature" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <AnimatePresence>
                                {fetchCount === 'manual' && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={maxAvailable > 0 ? maxAvailable : undefined}
                                                    value={manualCount}
                                                    onChange={(e) => {
                                                        let val = parseInt(e.target.value);
                                                        if (maxAvailable > 0 && val > maxAvailable) val = maxAvailable;
                                                        setManualCount(e.target.value ? val.toString() : '');
                                                    }}
                                                    placeholder={`Max: ${maxAvailable > 0 ? maxAvailable : 'Unknown'}`}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-center"
                                                />
                                            </div>
                                            <span className="text-xs text-accent/80 text-center font-medium">
                                                Enter exact number of {mediaType}s to fetch
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 3. Actions */}
                        <div className="pt-4 border-t border-white/5">
                            <h3 className="text-sm font-bold text-fg-2 uppercase tracking-widest mb-3 px-1">3. Start Sync</h3>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => {
                                        if (fetchCount === 'manual' && !manualCount) return;
                                        onSync(mediaType, getFinalCount(), 'oneByOne');
                                        onClose();
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${fetchCount === 'manual' && !manualCount ? 'bg-black/60 border-white/5 opacity-50 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
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
                                        if (fetchCount === 'manual' && !manualCount) return;
                                        if (isPremium) {
                                            onSync(mediaType, getFinalCount(), 'zip');
                                            onClose();
                                        } else {
                                            onUpgrade();
                                            onClose();
                                        }
                                    }}
                                    className={`relative w-full flex items-center justify-between p-4 rounded-2xl border transition-all group overflow-hidden ${fetchCount === 'manual' && !manualCount ? 'bg-black/60 border-white/5 opacity-50 cursor-not-allowed' : isPremium ? 'bg-accent text-black border-accent/50 shadow-accent-glow hover:scale-[1.02]' : 'bg-black/60 border-white/5 opacity-70 hover:opacity-100'}`}
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
                                                {!isPremium && <span className="text-[9px] px-2 py-0.5 bg-accent/20 text-accent rounded-full border border-accent/30">PREMIUM</span>}
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
            </motion.div>
        </div>
    );
}
