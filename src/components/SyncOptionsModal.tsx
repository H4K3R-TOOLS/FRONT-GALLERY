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
    const [fetchCount, setFetchCount] = useState<number | 'all'>(20);

    React.useEffect(() => {
        if (isOpen) {
            if (hasImages && !hasVideos) setMediaType('image');
            else if (hasVideos && !hasImages) setMediaType('video');
            else setMediaType('image');
        }
    }, [isOpen, hasImages, hasVideos]);

    if (!isOpen || !folder) return null;

    const isPremium = userPlan === 'premium';

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
                            <div className="grid grid-cols-4 gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 shadow-inner">
                                {[5, 20, 50, 'all'].map((val) => (
                                    <button 
                                        key={val}
                                        onClick={() => setFetchCount(val as any)}
                                        className={`py-3 rounded-xl text-sm font-bold transition-all ${fetchCount === val ? 'bg-white text-black shadow-lg' : 'text-fg-3 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {val === 'all' ? 'All' : val}
                                    </button>
                                ))}
                            </div>
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
                                            <div className="font-bold text-fg-1">Fetch to Gallery</div>
                                            <div className="text-xs text-fg-3">View images directly in the app</div>
                                        </div>
                                    </div>
                                    <DownloadCloud className="w-5 h-5 text-fg-3 group-hover:text-accent transition-colors" />
                                </button>

                                <button 
                                    onClick={() => {
                                        if (isPremium) {
                                            onSync(mediaType, fetchCount, 'zip');
                                            onClose();
                                        } else {
                                            onUpgrade();
                                        }
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${isPremium ? 'bg-accent text-black border-accent/50 shadow-accent-glow hover:scale-[1.02]' : 'bg-black/60 border-white/5 opacity-70 hover:opacity-100'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${isPremium ? 'bg-black/20 group-hover:scale-110' : 'bg-white/10'}`}>
                                            <Package className={`w-5 h-5 ${isPremium ? 'text-black' : 'text-fg-3'}`} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold flex items-center gap-2">
                                                Download as ZIP
                                                {!isPremium && <span className="text-[9px] px-2 py-0.5 bg-accent/20 text-accent rounded-full border border-accent/30">PREMIUM</span>}
                                            </div>
                                            <div className={`text-xs ${isPremium ? 'text-black/70' : 'text-fg-3'}`}>Download compressed archive directly</div>
                                        </div>
                                    </div>
                                    {isPremium && <DownloadCloud className="w-5 h-5 text-black/70 group-hover:text-black transition-colors" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
