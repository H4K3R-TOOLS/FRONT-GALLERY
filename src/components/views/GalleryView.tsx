"use client";

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, CheckSquare, Square, Trash2, Download } from 'lucide-react';
import Image from 'next/image';

interface GalleryViewProps {
    images: any[];
    activeTab: 'all' | 'image' | 'video' | 'zip';
    setActiveTab: (tab: 'all' | 'image' | 'video' | 'zip') => void;
    isSelectionMode: boolean;
    setIsSelectionMode: (mode: boolean) => void;
    selectedItems: Set<string>;
    toggleSelection: (id: string) => void;
    handleBulkDownload: () => void;
    handleBulkDelete: () => void;
    setPreviewItem: (item: any) => void;
    galleryLoaderRef: React.RefObject<HTMLDivElement>;
    isLoadingMore: boolean;
    galleryHasMore: boolean;
}

export default function GalleryView({
    images, activeTab, setActiveTab, isSelectionMode, setIsSelectionMode,
    selectedItems, toggleSelection, handleBulkDownload, handleBulkDelete,
    setPreviewItem, galleryLoaderRef, isLoadingMore, galleryHasMore
}: GalleryViewProps) {
    const filteredImages = images.filter(img => activeTab === 'all' || img.type === activeTab);

    return (
        <div className="w-full h-full p-4 md:p-8 pt-24 md:pt-12 max-w-7xl mx-auto overflow-y-auto no-scrollbar pb-32">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 tracking-tight">
                        Gallery
                    </h1>
                    <p className="text-fg-2 mt-2 md:text-lg">Securely synced from your devices.</p>
                </div>

                {/* Selection & Action Bar */}
                <AnimatePresence mode="wait">
                    {isSelectionMode ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex items-center gap-3 neo-surface p-2 px-4 shadow-accent-glow"
                        >
                            <span className="text-sm font-bold text-accent mr-2">{selectedItems.size} selected</span>
                            <button onClick={handleBulkDownload} className="p-2 neo-button rounded-xl text-fg-1 hover:text-accent transition-colors" title="Download">
                                <Download className="w-5 h-5" />
                            </button>
                            <button onClick={handleBulkDelete} className="p-2 neo-button rounded-xl text-fg-1 hover:text-danger transition-colors" title="Delete">
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <div className="w-px h-6 bg-white/10 mx-1" />
                            <button onClick={() => { setIsSelectionMode(false); selectedItems.clear(); }} className="p-2 text-fg-3 hover:text-fg-1 text-sm font-semibold">
                                Cancel
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center neo-surface p-1 rounded-2xl"
                        >
                            {['all', 'image', 'video'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
                                        activeTab === tab ? 'neo-pressed text-accent' : 'text-fg-3 hover:text-fg-1'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                            <button 
                                onClick={() => setIsSelectionMode(true)}
                                className="ml-2 px-4 py-2 text-sm font-semibold text-fg-2 hover:text-accent transition-colors"
                            >
                                Select
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {filteredImages.map((item, index) => {
                    const isSelected = selectedItems.has(item.id);
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: Math.min(index * 0.05, 0.5) }}
                            className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 ${
                                isSelectionMode && isSelected ? 'ring-4 ring-accent ring-offset-2 ring-offset-base shadow-accent-glow' : 'neo-surface hover:-translate-y-1'
                            }`}
                            onClick={() => isSelectionMode ? toggleSelection(item.id) : setPreviewItem(item)}
                        >
                            {item.type === 'video' ? (
                                <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                                    <Video className="w-12 h-12 text-fg-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ) : (
                                <Image
                                    src={item.url}
                                    alt={item.name || 'Gallery item'}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    loading="lazy"
                                />
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Type Icon */}
                            <div className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-md">
                                {item.type === 'video' ? <Video className="w-4 h-4 text-white" /> : <ImageIcon className="w-4 h-4 text-white" />}
                            </div>

                            {/* Selection Checkbox */}
                            <AnimatePresence>
                                {isSelectionMode && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute top-2 right-2 z-10"
                                    >
                                        {isSelected ? (
                                            <CheckSquare className="w-6 h-6 text-accent fill-white/10" />
                                        ) : (
                                            <Square className="w-6 h-6 text-white/70 hover:text-white" />
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Infinite Scroll Loader */}
            <div ref={galleryLoaderRef} className="w-full h-20 flex items-center justify-center mt-8">
                {isLoadingMore && (
                    <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                )}
                {!galleryHasMore && filteredImages.length > 0 && (
                    <p className="text-fg-3 text-sm font-medium">No more media</p>
                )}
            </div>
        </div>
    );
}
