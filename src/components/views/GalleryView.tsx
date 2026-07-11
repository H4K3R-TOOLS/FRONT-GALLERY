"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, CheckSquare, Square, Trash2, Download, Folder, RefreshCw, Check, X } from 'lucide-react';
import Image from 'next/image';

interface GalleryViewProps {
    images: any[];
    activeTab: 'all' | 'image' | 'video' | 'zip';
    setActiveTab: (tab: 'all' | 'image' | 'video' | 'zip') => void;
    isSelectionMode: boolean;
    setIsSelectionMode: (mode: boolean) => void;
    selectedItems: Set<string>;
    toggleSelection: (id: string) => void;
    selectAll: () => void;
    handleBulkDownload: () => void;
    handleBulkDelete: () => void;
    isDownloading: boolean;
    isDeleting: boolean;
    setPreviewItem: (item: any) => void;
    galleryLoaderRef: React.RefObject<HTMLDivElement>;
    isLoadingMore: boolean;
    galleryHasMore: boolean;
    
    // Folder Props
    folders: any[];
    fetchFolders: () => void;
    selectedDeviceId: string | null;
    setSyncOptionsFolder: (folder: any) => void;
    setShowSyncOptionsModal: (show: boolean) => void;
}

export default function GalleryView({
    images, activeTab, setActiveTab, isSelectionMode, setIsSelectionMode,
    selectedItems, toggleSelection, selectAll, handleBulkDownload, handleBulkDelete,
    isDownloading, isDeleting, setPreviewItem, galleryLoaderRef, isLoadingMore, galleryHasMore,
    folders, fetchFolders, selectedDeviceId, setSyncOptionsFolder, setShowSyncOptionsModal
}: GalleryViewProps) {
    const filteredImages = images.filter(img => activeTab === 'all' || img.type === activeTab || img.resource_type === activeTab);

    return (
        <div className="w-full h-full p-4 md:p-8 pt-24 md:pt-12 max-w-7xl mx-auto overflow-y-auto no-scrollbar pb-32">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 tracking-tight">
                        Gallery
                    </h1>
                    <p className="text-fg-2 mt-2 md:text-lg">
                        Securely synced from your devices.
                    </p>
                </div>

                {/* Selection & Action Bar */}
                <div className="flex flex-wrap items-center gap-6">
                    <button 
                        onClick={fetchFolders}
                        disabled={!selectedDeviceId}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl neo-button text-sm font-bold text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                    >
                        <RefreshCw className="w-5 h-5" /> Fetch Folders
                    </button>

                    <button 
                        onClick={() => document.getElementById('media-grid-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl neo-button text-sm font-bold text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 transition-all hover:scale-105 active:scale-95"
                    >
                        <ImageIcon className="w-5 h-5" /> Media
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {folders.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 mb-12 text-center neo-surface rounded-[2rem] min-h-[30vh]">
                    <div className="w-20 h-20 rounded-full neo-pressed flex items-center justify-center mb-6 shadow-accent-glow">
                        <Folder className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-fg-1 mb-2">No Folders Fetched</h3>
                    <p className="text-fg-3 max-w-sm mx-auto mb-8">Scan and fetch media folders from your connected device to view them here.</p>
                    <button 
                        onClick={fetchFolders} 
                        disabled={!selectedDeviceId} 
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl neo-button text-accent font-bold shadow-accent-glow transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <RefreshCw className="w-5 h-5" /> Fetch Device Folders
                    </button>
                </div>
            )}

            {/* Folders List (Compact 2-Column Grid) */}
            {folders.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-12">
                    {folders.map((folder: any, i: number) => {
                        const nameLower = folder.name?.toLowerCase() || '';
                        const isVideo = nameLower.includes('video') || nameLower.includes('screenrecord') || nameLower.includes('movie');
                        const isImage = nameLower.includes('camera') || nameLower.includes('screenshot') || nameLower.includes('picture');
                        
                        return (
                            <motion.button 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.05, 0.5) }}
                                onClick={() => {
                                    setSyncOptionsFolder(folder);
                                    setShowSyncOptionsModal(true);
                                }}
                                className="group flex flex-col sm:flex-row items-center p-3 sm:p-5 neo-surface rounded-2xl hover:bg-white/5 transition-all duration-300 text-left border border-transparent hover:border-white/10 shadow-sm hover:shadow-accent-glow"
                            >
                                <div className="w-14 h-14 rounded-xl bg-black/40 flex items-center justify-center sm:mr-4 mb-3 sm:mb-0 group-hover:shadow-accent-glow transition-all shrink-0">
                                    {isVideo && !isImage ? <Video className="w-7 h-7 text-accent group-hover:scale-110 transition-transform" /> : 
                                     isImage && !isVideo ? <ImageIcon className="w-7 h-7 text-accent group-hover:scale-110 transition-transform" /> :
                                     <Folder className="w-7 h-7 text-accent group-hover:scale-110 transition-transform" />}
                                </div>
                                <div className="flex-1 overflow-hidden text-center sm:text-left w-full">
                                    <h3 className="text-white font-bold truncate group-hover:text-accent transition-colors text-base sm:text-lg">
                                        {folder.name}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-fg-3 font-semibold tracking-wide mt-0.5">
                                        {folder.imageCount !== undefined && folder.videoCount !== undefined 
                                            ? `${folder.imageCount} pics • ${folder.videoCount} videos`
                                            : `${folder.count} items`}
                                    </p>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {/* Gallery Grid (Always visible below folders) */}
            {filteredImages.length > 0 ? (
                <div id="media-grid-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4 flex-1">
                            <span className="text-xs font-bold text-fg-3 uppercase tracking-widest whitespace-nowrap">Synced Media</span>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>
                        
                        {/* New Relocated Action Bar */}
                        <div className="flex items-center flex-wrap gap-3">
                            <div className="flex items-center neo-surface p-1 rounded-2xl">
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
                                    onClick={() => setActiveTab('zip')}
                                    className={`ml-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${activeTab === 'zip' ? 'neo-pressed text-accent' : 'text-fg-2 hover:text-accent'}`}
                                >
                                    View ZIPs
                                </button>
                            </div>

                            <button 
                                onClick={() => {
                                    if (isSelectionMode) {
                                        setIsSelectionMode(false);
                                        selectedItems.clear();
                                    } else {
                                        setIsSelectionMode(true);
                                    }
                                }}
                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shadow-lg ${isSelectionMode ? 'bg-accent text-black shadow-accent-glow scale-105' : 'bg-white/5 border border-white/10 text-fg-3 hover:text-white hover:bg-white/10'}`}
                                title={isSelectionMode ? 'Cancel Selection' : 'Multi-Select'}
                            >
                                {isSelectionMode ? <X className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
                            </button>

                            <AnimatePresence>
                                {isSelectionMode && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center gap-2 neo-surface px-3 py-1.5 rounded-full shadow-accent-glow"
                                    >
                                        <span className="text-sm font-bold text-accent px-2">{selectedItems.size}</span>
                                        <div className="w-px h-5 bg-white/10 mx-1" />
                                        <button onClick={selectAll} className="p-2 text-fg-3 hover:text-white text-xs font-semibold transition-colors uppercase tracking-wider">
                                            All
                                        </button>
                                        <button onClick={handleBulkDownload} disabled={isDownloading || selectedItems.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50" title="Download Zip">
                                            <Download className="w-4 h-4" /> <span className="text-xs font-bold hidden sm:inline">ZIP</span>
                                        </button>
                                        <button onClick={handleBulkDelete} disabled={isDeleting || selectedItems.size === 0} className="p-2 rounded-xl text-fg-3 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {filteredImages.map((item, index) => {
                            const isSelected = selectedItems.has(item.id);
                            const resourceType = item.type || item.resource_type;
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: Math.min(index * 0.05, 0.5) }}
                                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 ${
                                        isSelectionMode && isSelected ? 'ring-4 ring-accent ring-offset-2 ring-offset-base shadow-accent-glow scale-[0.95]' : 'neo-surface hover:-translate-y-1'
                                    }`}
                                    onClick={() => isSelectionMode ? toggleSelection(item.id) : setPreviewItem(item)}
                                >
                                    {resourceType === 'video' ? (
                                        <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                                            <video src={item.url} className="w-full h-full object-cover pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <Video className="w-12 h-12 text-fg-3 group-hover:text-white transition-colors drop-shadow-lg" />
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={item.url}
                                            alt={item.name || 'Gallery item'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                                            loading="lazy"
                                        />
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                    {/* Type Icon */}
                                    <div className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md pointer-events-none border border-white/10">
                                        {resourceType === 'video' ? <Video className="w-4 h-4 text-accent" /> : <ImageIcon className="w-4 h-4 text-accent" />}
                                    </div>

                                    {/* Selection Checkbox */}
                                    <AnimatePresence>
                                        {isSelectionMode && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="absolute top-3 right-3 z-10"
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-accent border-accent' : 'bg-black/60 border-white/40'}`}>
                                                    {isSelected && <Check className="w-4 h-4 text-base font-bold" strokeWidth={3} />}
                                                </div>
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
            ) : (
                folders.length > 0 && (
                    <div className="text-center p-8 mt-4 border border-dashed border-white/10 rounded-3xl neo-surface">
                        <ImageIcon className="w-12 h-12 text-fg-3 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-fg-1 mb-2">No Synced Media</h3>
                        <p className="text-fg-3">Click on any folder above to sync images or videos directly to your gallery.</p>
                    </div>
                )
            )}
        </div>
    );
}
