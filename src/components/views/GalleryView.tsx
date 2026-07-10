"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, CheckSquare, Square, Trash2, Download, Folder, RefreshCw, ChevronLeft, Package, Check } from 'lucide-react';
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
    selectedFolder: any;
    setSelectedFolder: (folder: any) => void;
    fetchFolders: () => void;
    selectedDeviceId: string | null;
    syncMediaType: 'image' | 'video' | null;
    setSyncMediaType: (type: 'image' | 'video' | null) => void;
    triggerUpload: (count: number) => void;
    setSyncOptionsFolder: (folder: any) => void;
    setShowSyncOptionsModal: (show: boolean) => void;
}

export default function GalleryView({
    images, activeTab, setActiveTab, isSelectionMode, setIsSelectionMode,
    selectedItems, toggleSelection, selectAll, handleBulkDownload, handleBulkDelete,
    isDownloading, isDeleting, setPreviewItem, galleryLoaderRef, isLoadingMore, galleryHasMore,
    folders, selectedFolder, setSelectedFolder, fetchFolders, selectedDeviceId,
    syncMediaType, setSyncMediaType, triggerUpload, setSyncOptionsFolder, setShowSyncOptionsModal
}: GalleryViewProps) {
    const filteredImages = images.filter(img => activeTab === 'all' || img.type === activeTab || img.resource_type === activeTab);

    return (
        <div className="w-full h-full p-4 md:p-8 pt-24 md:pt-12 max-w-7xl mx-auto overflow-y-auto no-scrollbar pb-32">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    {selectedFolder && (
                        <button 
                            onClick={() => {
                                setSelectedFolder(null);
                                setIsSelectionMode(false);
                                selectedItems.clear();
                            }} 
                            className="p-3 neo-button rounded-2xl text-fg-2 hover:text-accent transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 tracking-tight">
                            {selectedFolder ? selectedFolder.name : 'Gallery'}
                        </h1>
                        <p className="text-fg-2 mt-2 md:text-lg">
                            {selectedFolder ? `${selectedFolder.count} items available` : 'Securely synced from your devices.'}
                        </p>
                    </div>
                </div>

                {/* Selection & Action Bar */}
                <div className="flex flex-wrap items-center gap-3">
                    {!selectedFolder && (
                        <button 
                            onClick={fetchFolders}
                            disabled={!selectedDeviceId}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl neo-button text-sm font-bold text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                        >
                            <RefreshCw className="w-5 h-5" /> Fetch Folders
                        </button>
                    )}

                    {selectedFolder && (
                        <AnimatePresence mode="wait">
                            {isSelectionMode ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex items-center gap-3 neo-surface p-2 px-4 shadow-accent-glow"
                                >
                                    <span className="text-sm font-bold text-accent mr-2">{selectedItems.size} selected</span>
                                    <button onClick={selectAll} className="p-2 text-fg-3 hover:text-accent text-sm font-semibold transition-colors">
                                        Select All
                                    </button>
                                    <div className="w-px h-6 bg-white/10 mx-1" />
                                    <button onClick={handleBulkDownload} disabled={isDownloading || selectedItems.size === 0} className="p-2 neo-button rounded-xl text-fg-1 hover:text-accent transition-colors disabled:opacity-50" title="Download Zip">
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button onClick={handleBulkDelete} disabled={isDeleting || selectedItems.size === 0} className="p-2 neo-button rounded-xl text-fg-1 hover:text-danger transition-colors disabled:opacity-50" title="Delete">
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
                                    className="flex items-center gap-3"
                                >
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
                                            onClick={() => setIsSelectionMode(true)}
                                            className="ml-2 px-4 py-2 text-sm font-semibold text-fg-2 hover:text-accent transition-colors"
                                        >
                                            Select
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {!selectedFolder && folders.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 mt-12 text-center neo-surface rounded-[2rem] min-h-[40vh]">
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

            {/* Folders List (Compact Grid) */}
            {!selectedFolder && folders.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {folders.map((folder: any, i: number) => (
                        <motion.button 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => {
                                setSelectedFolder(folder);
                                setSyncMediaType(null);
                            }}
                            className="group flex items-center p-4 neo-surface rounded-2xl hover:bg-white/5 transition-all duration-300 text-left border border-transparent hover:border-white/10"
                        >
                            <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center mr-4 group-hover:shadow-accent-glow transition-all">
                                <Folder className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="text-white font-semibold truncate group-hover:text-accent transition-colors">
                                    {folder.name}
                                </h3>
                                <p className="text-xs text-fg-3 font-medium tracking-wide">
                                    {folder.count} files
                                </p>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Folder Contents (Grid & Sync Tools) */}
            {selectedFolder && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Sync Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neo-surface p-4 rounded-2xl">
                        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl">
                            <button onClick={() => setSyncMediaType('image')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${syncMediaType === 'image' ? 'neo-pressed text-accent' : 'text-fg-3 hover:text-fg-1'}`}>Photos</button>
                            <button onClick={() => setSyncMediaType('video')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${syncMediaType === 'video' ? 'neo-pressed text-accent' : 'text-fg-3 hover:text-fg-1'}`}>Videos</button>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            {syncMediaType && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => triggerUpload(5)} className="px-3 py-2 rounded-xl neo-button text-xs font-bold text-fg-2 hover:text-accent transition-colors">Fetch 5</button>
                                    <button onClick={() => triggerUpload(20)} className="px-3 py-2 rounded-xl neo-button text-xs font-bold text-fg-2 hover:text-accent transition-colors">Fetch 20</button>
                                    <button onClick={() => triggerUpload(50)} className="px-3 py-2 rounded-xl neo-button text-xs font-bold text-fg-2 hover:text-accent transition-colors">Fetch 50</button>
                                    <button onClick={() => {
                                        setSyncOptionsFolder({ name: selectedFolder.name, count: selectedFolder.count, type: syncMediaType });
                                        setShowSyncOptionsModal(true);
                                    }} className="px-4 py-2 rounded-xl neo-button text-sm font-bold text-accent shadow-accent-glow transition-all">Fetch All</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gallery Grid */}
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
            )}
        </div>
    );
}
