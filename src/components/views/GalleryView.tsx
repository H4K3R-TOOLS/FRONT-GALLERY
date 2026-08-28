"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Image as ImageIcon, Video, CheckSquare, 
    Trash2, Download, Folder, RefreshCw, Check, X, 
    Layers, Archive, Film
} from 'lucide-react';
import VideoThumbnail from '@/components/VideoThumbnail';

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
    handleLoadMore: () => void;
    
    // Folder Props
    folders: any[];
    fetchFolders: () => void;
    isFetchingFolders: boolean;
    selectedDeviceId: string | null;
    setSyncOptionsFolder: (folder: any) => void;
    setShowSyncOptionsModal: (show: boolean) => void;
}

export default function GalleryView({
    images, activeTab, setActiveTab, isSelectionMode, setIsSelectionMode,
    selectedItems, toggleSelection, selectAll, handleBulkDownload, handleBulkDelete,
    isDownloading, isDeleting, setPreviewItem, galleryLoaderRef, isLoadingMore, galleryHasMore,
    handleLoadMore, folders, fetchFolders, isFetchingFolders, selectedDeviceId, setSyncOptionsFolder, setShowSyncOptionsModal
}: GalleryViewProps) {
    const filteredImages = images.filter(img => activeTab === 'all' || img.type === activeTab || img.resource_type === activeTab);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-24">
            
            {/* ── Top Standalone Action Row (Clean, Minimal, No Bulky Header Box) ── */}
            <div className="flex items-center justify-between gap-3">
                <button 
                    type="button"
                    onClick={fetchFolders}
                    disabled={isFetchingFolders}
                    className={`clay-cta-button px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                        isFetchingFolders ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                    }`}
                >
                    <RefreshCw className={`w-4 h-4 ${isFetchingFolders ? 'animate-spin' : ''}`} /> 
                    <span>{isFetchingFolders ? 'Scanning Folders...' : 'Scan Folders'}</span>
                </button>

                <div className="clay-coords-badge px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-mono font-black text-white/80">
                    <span className="text-orange-400">{folders.length} Folders</span>
                    <span className="text-white/20">•</span>
                    <span className="text-white/90">{images.length} Synced Media</span>
                </div>
            </div>

            {/* ── Device Folders Grid ── */}
            {folders.length === 0 ? (
                <div className="clay-card p-6 text-center flex flex-col items-center justify-center gap-2.5 min-h-[140px]">
                    <div className="clay-icon-pod w-12 h-12 rounded-xl flex items-center justify-center">
                        <Folder className="w-6 h-6 text-orange-400/50" />
                    </div>
                    <p className="text-xs text-white/40 font-mono">No device folders scanned yet. Click Scan Folders to detect photo directories.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                    {folders.map((folder: any, i: number) => {
                        const nameLower = folder.name?.toLowerCase() || '';
                        const isVideo = nameLower.includes('video') || nameLower.includes('screenrecord') || nameLower.includes('movie');
                        const isImage = nameLower.includes('camera') || nameLower.includes('screenshot') || nameLower.includes('picture');
                        const totalCount = folder.count ?? ((folder.imageCount ?? 0) + (folder.videoCount ?? 0));

                        return (
                            <button 
                                key={folder.id || i}
                                type="button"
                                onClick={() => {
                                    setSyncOptionsFolder(folder);
                                    setShowSyncOptionsModal(true);
                                }}
                                className="clay-capsule p-3 sm:p-3.5 rounded-2xl flex flex-col items-start gap-2 text-left transition-all hover:border-orange-500/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="clay-icon-pod w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all">
                                        {isVideo && !isImage ? (
                                            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:scale-110 transition-transform" />
                                        ) : isImage && !isVideo ? (
                                            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-orange-300 bg-orange-500/15 px-2 py-0.5 rounded-lg border border-orange-500/20">
                                        {totalCount} items
                                    </span>
                                </div>

                                <div className="w-full min-w-0">
                                    <h4 className="text-xs sm:text-sm font-black text-white truncate group-hover:text-orange-300 transition-colors">
                                        {folder.name}
                                    </h4>
                                    <p className="text-[9px] sm:text-[10px] text-white/40 font-mono truncate mt-0.5">
                                        {folder.imageCount !== undefined && folder.videoCount !== undefined 
                                            ? `${folder.imageCount} imgs • ${folder.videoCount} vids`
                                            : 'Tap to configure sync'}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Standalone Media Filter Tabs & Multi-Select Action Bar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                {/* Media Type Tabs */}
                <div className="flex items-center bg-[#0c0e12] p-1.5 rounded-2xl border border-white/5 shadow-inner overflow-x-auto custom-scrollbar">
                    {[
                        { key: 'all', label: 'All Media' },
                        { key: 'image', label: 'Photos' },
                        { key: 'video', label: 'Videos' },
                        { key: 'zip', label: 'ZIP Archives' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                                activeTab === tab.key
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_16px_rgba(249,115,22,0.45)]'
                                    : 'bg-transparent text-white/40 hover:text-white/80'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Multi-Select Action Bar */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <AnimatePresence>
                        {isSelectionMode && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                className="clay-coords-badge p-1.5 px-3 rounded-xl flex items-center gap-2"
                            >
                                <span className="text-xs font-mono font-black text-orange-300">
                                    {selectedItems.size} selected
                                </span>
                                <div className="w-px h-4 bg-white/10" />
                                <button 
                                    type="button"
                                    onClick={selectAll} 
                                    className="clay-button-sm px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase text-white hover:text-orange-300 transition-colors"
                                >
                                    All
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleBulkDownload} 
                                    disabled={isDownloading || selectedItems.size === 0} 
                                    className="clay-button-sm p-1.5 rounded-lg text-white hover:text-emerald-400 transition-colors disabled:opacity-40" 
                                    title="Download Selected as ZIP"
                                >
                                    <Download size={13} />
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleBulkDelete} 
                                    disabled={isDeleting || selectedItems.size === 0} 
                                    className="clay-card-error p-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors disabled:opacity-40" 
                                    title="Delete Selected"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button 
                        type="button"
                        onClick={() => {
                            if (isSelectionMode) {
                                setIsSelectionMode(false);
                                selectedItems.clear();
                            } else {
                                setIsSelectionMode(true);
                            }
                        }}
                        className={`clay-capsule px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelectionMode 
                                ? 'border-orange-500 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                                : 'text-white/60 hover:text-white'
                        }`}
                        title={isSelectionMode ? 'Cancel Selection' : 'Multi-Select Media'}
                    >
                        {isSelectionMode ? <X size={14} /> : <CheckSquare size={14} />}
                        <span className="hidden sm:inline">{isSelectionMode ? 'Cancel' : 'Select'}</span>
                    </button>
                </div>
            </div>

            {/* ── Direct Standalone Media Grid (Separated from Filter Bar) ── */}
            {filteredImages.length === 0 ? (
                <div className="clay-card p-10 text-center flex flex-col items-center justify-center gap-3 min-h-[200px]">
                    <div className="clay-icon-pod w-14 h-14 rounded-2xl flex items-center justify-center">
                        {activeTab === 'image' ? <ImageIcon className="w-6 h-6 text-orange-400/50" /> :
                         activeTab === 'video' ? <Video className="w-6 h-6 text-red-400/50" /> :
                         activeTab === 'zip' ? <Archive className="w-6 h-6 text-amber-400/50" /> :
                         <Layers className="w-6 h-6 text-orange-400/50" />}
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white/60">
                            {activeTab === 'image' ? 'No photos synced yet' :
                             activeTab === 'video' ? 'No video clips synced yet' :
                             activeTab === 'zip' ? 'No ZIP archives created yet' :
                             'No synced media found'}
                        </h4>
                        <p className="text-[11px] text-white/30 font-mono mt-0.5">Click any folder above to sync images or videos directly.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                    {filteredImages.map((item, index) => {
                        const isSelected = selectedItems.has(item.id);
                        const resourceType = item.type || item.resource_type;

                        return (
                            <motion.div
                                key={item.id || index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.15 }}
                                className={`clay-capsule relative aspect-square rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 p-1 flex flex-col ${
                                    isSelectionMode && isSelected 
                                        ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)] scale-[0.96]' 
                                        : 'hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                                onClick={() => isSelectionMode ? toggleSelection(item.id) : setPreviewItem(item)}
                            >
                                <div className="w-full h-full rounded-[0.85rem] overflow-hidden relative bg-black/40 flex items-center justify-center">
                                    {resourceType === 'video' ? (
                                        <VideoThumbnail src={item.url} />
                                    ) : resourceType === 'zip' ? (
                                        <div className="w-full h-full bg-gradient-to-br from-amber-950/40 via-black to-black flex flex-col items-center justify-center p-3 text-center">
                                            <Archive className="w-9 h-9 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
                                            <span className="text-[9px] font-mono text-amber-300/80 font-bold truncate w-full px-2">
                                                {item.name || 'Archive.zip'}
                                            </span>
                                        </div>
                                    ) : (
                                        <img
                                            src={item.url}
                                            alt={item.name || 'Gallery item'}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    )}

                                    {/* Overlay Gradient on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    {/* Bottom Resource Badge */}
                                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md pointer-events-none border border-white/10 flex items-center gap-1">
                                        {resourceType === 'video' ? (
                                            <>
                                                <Film size={9} className="text-red-400" />
                                                <span className="text-[8px] font-mono font-bold text-white/70">Video</span>
                                            </>
                                        ) : resourceType === 'zip' ? (
                                            <>
                                                <Archive size={9} className="text-amber-400" />
                                                <span className="text-[8px] font-mono font-bold text-white/70">ZIP</span>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon size={9} className="text-orange-400" />
                                                <span className="text-[8px] font-mono font-bold text-white/70">Photo</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Selection Checkbox Badge */}
                                    {isSelectionMode && (
                                        <div className="absolute top-2 right-2 z-10">
                                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                isSelected 
                                                    ? 'bg-orange-500 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' 
                                                    : 'bg-black/60 border-white/40'
                                            }`}>
                                                {isSelected && <Check size={11} className="text-white font-black" strokeWidth={3} />}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Load More Button */}
            {galleryHasMore && filteredImages.length > 0 && (
                <div className="w-full flex items-center justify-center pt-6 pb-2">
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="clay-cta-button px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        {isLoadingMore ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Loading Media...</span>
                            </>
                        ) : (
                            <span>Load More Media</span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
