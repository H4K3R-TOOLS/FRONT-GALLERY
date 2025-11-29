"use client";

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const socket = io(API_URL);

interface FileData {
    id: string;
    url: string;
    type: string;
    format?: string;
    created_at: string;
}

export default function Home() {
    const [uuid, setUuid] = useState('');
    const [files, setFiles] = useState<FileData[]>([]);
    const [activeTab, setActiveTab] = useState('image'); // 'image' or 'video'
    const [selectedFiles, setSelectedFiles] = useState(new Set());
    const [previewFile, setPreviewFile] = useState(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    useEffect(() => {
        // Auto-generate or get UUID
        let storedUuid = localStorage.getItem('device_uuid');
        if (!storedUuid) {
            storedUuid = crypto.randomUUID();
            localStorage.setItem('device_uuid', storedUuid);
        }
        setUuid(storedUuid);

        socket.emit('register_web', { uuid: storedUuid });

        fetchFiles(storedUuid);

        socket.on('new_image', (newFile) => {
            setFiles(prev => [newFile, ...prev]);
        });

        return () => {
            socket.off('new_image');
        };
    }, []);

    const fetchFiles = async (id) => {
        try {
            const res = await fetch(`${API_URL}/images?uuid=${id}`);
            const data = await res.json();
            setFiles(data);
        } catch (e) {
            console.error(e);
        }
    };

    const filteredFiles = files.filter(f => f.type === activeTab);

    const toggleSelection = (id) => {
        const newSet = new Set(selectedFiles);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedFiles(newSet);
    };

    const handleDownload = async () => {
        const filesToDownload = files.filter(f => selectedFiles.has(f.id));
        if (filesToDownload.length === 0) return;

        try {
            const res = await fetch(`${API_URL}/zip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: filesToDownload.map(f => ({
                        url: f.url,
                        filename: `${f.id}.${f.format || (f.type === 'video' ? 'mp4' : 'jpg')}`
                    }))
                })
            });

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gallery_download.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert('Download failed');
        }
    };

    return (
        <div className="min-h-screen bg-[#e0e5ec] text-gray-800 font-sans p-4 sm:p-8">

            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] flex items-center justify-center">
                        <span className="text-2xl">👁️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-700 tracking-wide">Gallery Eye</h1>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                        className={`px-6 py-2 rounded-xl font-medium transition-all ${isSelectionMode ? 'bg-blue-500 text-white shadow-inner' : 'bg-[#e0e5ec] text-gray-600 shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]'}`}
                    >
                        {isSelectionMode ? 'Cancel' : 'Select'}
                    </button>

                    {selectedFiles.size > 0 && (
                        <button
                            onClick={handleDownload}
                            className="px-6 py-2 rounded-xl bg-green-500 text-white font-medium shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] active:shadow-inner transition-all"
                        >
                            Download ({selectedFiles.size})
                        </button>
                    )}
                </div>
            </header>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="p-1.5 bg-[#e0e5ec] rounded-2xl shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] flex gap-2">
                    {['image', 'video'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-2.5 rounded-xl font-medium transition-all duration-300 ${activeTab === tab
                                ? 'bg-[#e0e5ec] text-blue-600 shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <AnimatePresence>
                    {filteredFiles.map((file) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            key={file.id}
                            className={`relative group aspect-square rounded-2xl overflow-hidden bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] cursor-pointer transition-transform hover:scale-[1.02] ${selectedFiles.has(file.id) ? 'ring-4 ring-blue-400' : ''}`}
                            onClick={() => isSelectionMode ? toggleSelection(file.id) : setPreviewFile(file)}
                        >
                            {file.type === 'video' ? (
                                <video src={file.url} className="w-full h-full object-cover pointer-events-none" />
                            ) : (
                                <img src={file.url} alt="Gallery" className="w-full h-full object-cover" loading="lazy" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                            {/* Type Icon */}
                            {file.type === 'video' && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
                                    ▶️
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredFiles.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl">No {activeTab}s found</p>
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {previewFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                        onClick={() => setPreviewFile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-w-5xl max-h-[90vh] w-full rounded-2xl overflow-hidden shadow-2xl bg-black"
                            onClick={e => e.stopPropagation()}
                        >
                            {previewFile.type === 'video' ? (
                                <video src={previewFile.url} controls autoPlay className="w-full h-full max-h-[85vh] object-contain" />
                            ) : (
                                <img src={previewFile.url} alt="Preview" className="w-full h-full max-h-[85vh] object-contain" />
                            )}

                            <div className="absolute top-4 right-4 flex gap-3">
                                <a
                                    href={previewFile.url}
                                    download
                                    target="_blank"
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-colors"
                                    title="Download"
                                >
                                    ⬇️
                                </a>
                                <button
                                    onClick={() => setPreviewFile(null)}
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
