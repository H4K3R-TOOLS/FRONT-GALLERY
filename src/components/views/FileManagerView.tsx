"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Folder, FileText, Image as ImageIcon, Video, Music, Archive, 
    FileCode, Package, File as FileIcon, ArrowUp, RefreshCw, 
    Download, Trash2, Plus, Edit3, Eye, Search, Grid, List, 
    CheckSquare, Square, Smartphone, HardDrive, DownloadCloud, 
    UploadCloud, X, AlertTriangle, ShieldAlert, Check, Shield,
    FolderPlus, Sparkles, Database, Clock, ChevronRight, FileCheck,
    MessageCircle, Film, Camera, Send
} from 'lucide-react';

interface FileEntry {
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
    lastModified: number;
    extension: string;
    mimeType: string;
    isHidden?: boolean;
    canRead?: boolean;
    canWrite?: boolean;
    itemCount?: number;
}

interface ShortcutRoot {
    label: string;
    path: string;
    icon: string;
    exists: boolean;
}

interface FileManagerViewProps {
    socket: any;
    userUuid?: string;
    selectedDeviceId: string | null;
    isOnline: boolean;
}

export default function FileManagerView({
    socket,
    userUuid,
    selectedDeviceId,
    isOnline
}: FileManagerViewProps) {
    const [currentPath, setCurrentPath] = useState<string>('/storage/emulated/0');
    const [parentPath, setParentPath] = useState<string>('');
    const [entries, setEntries] = useState<FileEntry[]>([]);
    const [roots, setRoots] = useState<ShortcutRoot[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [totalSpace, setTotalSpace] = useState<number>(0);
    const [freeSpace, setFreeSpace] = useState<number>(0);
    const [isAllFilesManager, setIsAllFilesManager] = useState<boolean>(true);

    // Selection
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
    const [isSelectMode, setIsSelectMode] = useState<boolean>(false);

    // Modals
    const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');
    const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
    const [itemToRename, setItemToRename] = useState<FileEntry | null>(null);
    const [renameValue, setRenameValue] = useState<string>('');
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
    const [previewItem, setPreviewItem] = useState<{ name: string; url: string; type: 'image' | 'text' | 'other'; content?: string } | null>(null);

    // Download Streaming state
    const [activeDownload, setActiveDownload] = useState<{
        downloadId: string;
        fileName: string;
        progress: number;
        receivedChunks: number;
        totalChunks: number;
    } | null>(null);
    const downloadChunksRef = useRef<Map<string, string[]>>(new Map());

    // Upload Streaming state
    const [activeUpload, setActiveUpload] = useState<{
        fileName: string;
        progress: number;
        chunkIndex: number;
        totalChunks: number;
        isUploading: boolean;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch directory listing
    const fetchDirectory = (targetPath?: string) => {
        if (!socket || !userUuid || !selectedDeviceId || !isOnline) return;
        setIsLoading(true);
        const pathToSend = targetPath !== undefined ? targetPath : currentPath;
        socket.emit('fm_list_dir', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            path: pathToSend,
            search: searchQuery
        });
    };

    // Auto-fetch on mount or device switch
    useEffect(() => {
        if (selectedDeviceId && isOnline) {
            fetchDirectory(currentPath);
        }
    }, [selectedDeviceId, isOnline]);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleDirContents = (data: any) => {
            setIsLoading(false);
            if (data.error) return;

            setCurrentPath(data.currentPath || '/storage/emulated/0');
            setParentPath(data.parentPath || '');
            setEntries(data.entries || []);
            setRoots(data.roots || []);
            setTotalSpace(data.totalSpace || 0);
            setFreeSpace(data.freeSpace || 0);
            setIsAllFilesManager(data.isAllFilesManager ?? true);
            setSelectedPaths(new Set());
        };

        const handleDownloadChunk = (data: any) => {
            if (!data || !data.downloadId) return;
            const { downloadId, chunkIndex, totalChunks, chunkData, complete, name, error } = data;

            if (error) {
                alert(`Download Error: ${error}`);
                setActiveDownload(null);
                downloadChunksRef.current.delete(downloadId);
                return;
            }

            if (!downloadChunksRef.current.has(downloadId)) {
                downloadChunksRef.current.set(downloadId, []);
            }
            const chunks = downloadChunksRef.current.get(downloadId)!;
            chunks[chunkIndex] = chunkData;

            const progress = Math.min(100, Math.round(((chunkIndex + 1) / totalChunks) * 100));
            setActiveDownload({
                downloadId,
                fileName: name,
                progress,
                receivedChunks: chunkIndex + 1,
                totalChunks
            });

            if (complete || chunkIndex >= totalChunks - 1) {
                // Assemble Base64 parts into Blob and download
                try {
                    const byteArrays: BlobPart[] = [];
                    for (let i = 0; i < totalChunks; i++) {
                        const b64 = chunks[i];
                        if (b64) {
                            const byteChars = atob(b64);
                            const byteNums = new Uint8Array(byteChars.length);
                            for (let j = 0; j < byteChars.length; j++) {
                                byteNums[j] = byteChars.charCodeAt(j);
                            }
                            byteArrays.push(byteNums.buffer as ArrayBuffer);
                        }
                    }
                    const blob = new Blob(byteArrays);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                } catch (err: any) {
                    console.error('Download assembly failed', err);
                }
                setTimeout(() => {
                    setActiveDownload(null);
                    downloadChunksRef.current.delete(downloadId);
                }, 1000);
            }
        };

        const handleUploadStatus = (data: any) => {
            if (data.complete) {
                setActiveUpload(null);
                fetchDirectory(currentPath);
            }
        };

        const handleOpStatus = (data: any) => {
            if (data.success) {
                fetchDirectory(currentPath);
            } else if (data.message) {
                alert(`Operation Failed: ${data.message}`);
            }
        };

        const handleDeleteStatus = (data: any) => {
            fetchDirectory(currentPath);
        };

        socket.on('fm_dir_contents', handleDirContents);
        socket.on('fm_download_chunk', handleDownloadChunk);
        socket.on('fm_upload_status', handleUploadStatus);
        socket.on('fm_op_status', handleOpStatus);
        socket.on('fm_delete_status', handleDeleteStatus);

        return () => {
            socket.off('fm_dir_contents', handleDirContents);
            socket.off('fm_download_chunk', handleDownloadChunk);
            socket.off('fm_upload_status', handleUploadStatus);
            socket.off('fm_op_status', handleOpStatus);
            socket.off('fm_delete_status', handleDeleteStatus);
        };
    }, [socket, currentPath]);

    // Format bytes to readable size
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Format timestamp
    const formatDate = (ms: number) => {
        if (!ms) return 'Unknown';
        const d = new Date(ms);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Category Filter
    const filteredEntries = useMemo(() => {
        return entries.filter(item => {
            if (searchQuery.trim() !== '') {
                if (!item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            }
            if (activeFilter === 'all') return true;
            if (activeFilter === 'folders') return item.isDirectory;
            if (activeFilter === 'images') {
                return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'svg'].includes(item.extension);
            }
            if (activeFilter === 'videos') {
                return ['mp4', 'mkv', 'avi', 'mov', '3gp', 'webm', 'flv'].includes(item.extension);
            }
            if (activeFilter === 'audio') {
                return ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac', 'opus'].includes(item.extension);
            }
            if (activeFilter === 'documents') {
                return ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(item.extension);
            }
            if (activeFilter === 'apks') {
                return item.extension === 'apk';
            }
            if (activeFilter === 'archives') {
                return ['zip', 'rar', '7z', 'tar', 'gz'].includes(item.extension);
            }
            return true;
        });
    }, [entries, searchQuery, activeFilter]);

    // Path Breadcrumbs generator
    const breadcrumbs = useMemo(() => {
        if (!currentPath) return [];
        const parts = currentPath.split('/').filter(Boolean);
        const crumbs: { label: string; path: string }[] = [];
        let accumulated = '';
        parts.forEach((p) => {
            accumulated += '/' + p;
            crumbs.push({ label: p === '0' ? 'Internal Storage' : p, path: accumulated });
        });
        return crumbs;
    }, [currentPath]);

    // Navigation actions
    const handleNavigate = (path: string) => {
        fetchDirectory(path);
    };

    const handleGoUp = () => {
        if (parentPath) {
            fetchDirectory(parentPath);
        }
    };

    // File Actions
    const handleStartDownload = (file: FileEntry) => {
        if (!socket || !userUuid || !selectedDeviceId) return;
        const downloadId = 'dl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        setActiveDownload({
            downloadId,
            fileName: file.name,
            progress: 0,
            receivedChunks: 0,
            totalChunks: 1
        });
        socket.emit('fm_download_file', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            path: file.path,
            downloadId
        });
    };

    // Folder ZIP download (device creates ZIP then streams)
    const handleFolderDownload = (folder: FileEntry) => {
        if (!socket || !userUuid || !selectedDeviceId || !folder.isDirectory) return;
        const downloadId = 'dl_zip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        setActiveDownload({
            downloadId,
            fileName: folder.name + '.zip',
            progress: 0,
            receivedChunks: 0,
            totalChunks: 1
        });
        socket.emit('fm_zip_download', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            path: folder.path,
            downloadId
        });
    };

    // Multi-file/folder ZIP download
    const handleMultiDownload = () => {
        if (!socket || !userUuid || !selectedDeviceId || selectedPaths.size === 0) return;
        const paths = Array.from(selectedPaths);
        
        // If only 1 file selected and it's not a folder, do direct download
        if (paths.length === 1) {
            const item = entries.find(e => e.path === paths[0]);
            if (item && !item.isDirectory) {
                handleStartDownload(item);
                return;
            }
            if (item && item.isDirectory) {
                handleFolderDownload(item);
                return;
            }
        }
        
        const downloadId = 'dl_multi_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        setActiveDownload({
            downloadId,
            fileName: 'selected_files.zip',
            progress: 0,
            receivedChunks: 0,
            totalChunks: 1
        });
        socket.emit('fm_zip_download_multi', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            paths,
            downloadId
        });
    };

    // Chunked File Upload handler (128 KB chunks)
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !socket || !userUuid || !selectedDeviceId) return;

        const CHUNK_SIZE = 128 * 1024;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        setActiveUpload({
            fileName: file.name,
            progress: 0,
            chunkIndex: 0,
            totalChunks,
            isUploading: true
        });

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(file.size, start + CHUNK_SIZE);
            const blobChunk = file.slice(start, end);
            
            const base64Data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    const b64 = result.substring(result.indexOf(',') + 1);
                    resolve(b64);
                };
                reader.readAsDataURL(blobChunk);
            });

            socket.emit('fm_upload_chunk', {
                uuid: userUuid,
                targetDeviceId: selectedDeviceId,
                targetPath: currentPath,
                name: file.name,
                chunkIndex: i,
                totalChunks,
                chunkData: base64Data
            });

            const progress = Math.round(((i + 1) / totalChunks) * 100);
            setActiveUpload(prev => prev ? { ...prev, progress, chunkIndex: i + 1 } : null);
            await new Promise(r => setTimeout(r, 40));
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Delete handling
    const handleDeleteSelected = () => {
        if (selectedPaths.size === 0) return;
        setItemsToDelete(Array.from(selectedPaths));
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (!socket || !userUuid || !selectedDeviceId || itemsToDelete.length === 0) return;
        socket.emit('fm_delete', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            paths: itemsToDelete
        });
        setShowDeleteModal(false);
        setItemsToDelete([]);
        setSelectedPaths(new Set());
    };

    // Create Folder
    const handleCreateFolder = () => {
        if (!socket || !userUuid || !selectedDeviceId || !newFolderName.trim()) return;
        socket.emit('fm_create_folder', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            parentPath: currentPath,
            folderName: newFolderName.trim()
        });
        setNewFolderName('');
        setShowNewFolderModal(false);
    };

    // Rename Item
    const handleConfirmRename = () => {
        if (!socket || !userUuid || !selectedDeviceId || !itemToRename || !renameValue.trim()) return;
        socket.emit('fm_rename', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            oldPath: itemToRename.path,
            newName: renameValue.trim()
        });
        setItemToRename(null);
        setRenameValue('');
        setShowRenameModal(false);
    };

    // Request All Files Access (Permission trigger)
    const handleRequestAllFilesPermission = () => {
        if (!socket || !userUuid || !selectedDeviceId) return;
        socket.emit('fm_request_permission', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId
        });
        alert('Permission intent sent to target device! User will see All Files Access settings.');
    };

    // Icon helper by extension
    const getFileIcon = (item: FileEntry) => {
        if (item.isDirectory) return <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20 shrink-0" />;
        const ext = item.extension.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext)) {
            return <ImageIcon className="w-5 h-5 text-emerald-400 shrink-0" />;
        }
        if (['mp4', 'mkv', 'avi', 'mov', '3gp'].includes(ext)) {
            return <Video className="w-5 h-5 text-cyan-400 shrink-0" />;
        }
        if (['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'].includes(ext)) {
            return <Music className="w-5 h-5 text-purple-400 shrink-0" />;
        }
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
            return <Archive className="w-5 h-5 text-orange-400 shrink-0" />;
        }
        if (['apk'].includes(ext)) {
            return <Package className="w-5 h-5 text-lime-400 shrink-0" />;
        }
        if (['json', 'js', 'html', 'css', 'kt', 'java', 'xml', 'py'].includes(ext)) {
            return <FileCode className="w-5 h-5 text-sky-400 shrink-0" />;
        }
        if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
            return <FileText className="w-5 h-5 text-blue-400 shrink-0" />;
        }
        return <FileIcon className="w-5 h-5 text-zinc-400 shrink-0" />;
    };

    // Shortcut icon helper
    const getShortcutIcon = (iconName: string) => {
        switch (iconName) {
            case 'camera': return <Camera size={14} className="text-emerald-400" />;
            case 'download': return <Download size={14} className="text-blue-400" />;
            case 'image': return <ImageIcon size={14} className="text-teal-400" />;
            case 'file-text': return <FileText size={14} className="text-indigo-400" />;
            case 'music': return <Music size={14} className="text-purple-400" />;
            case 'film': return <Film size={14} className="text-cyan-400" />;
            case 'message-circle': return <MessageCircle size={14} className="text-green-400" />;
            case 'send': return <Send size={14} className="text-sky-400" />;
            case 'hard-drive': return <HardDrive size={14} className="text-amber-400" />;
            default: return <Smartphone size={14} className="text-orange-400" />;
        }
    };

    const usedSpace = totalSpace > 0 ? totalSpace - freeSpace : 0;
    const usedPercentage = totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20 animate-in fade-in duration-200">
            
            {/* Top Control Bar with Claymorphism */}
            <div className="bg-[#101216] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-4">
                
                {/* Header & Storage Gauge */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="clay-icon-pod w-12 h-12 rounded-2xl flex items-center justify-center text-amber-400 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                            <Folder className="w-6 h-6 fill-amber-400/20" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg sm:text-xl font-black text-white tracking-wide">Remote File Manager</h1>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    Live Stream IO
                                </span>
                            </div>
                            <p className="text-xs text-white/50 font-sans mt-0.5">
                                Browse, stream download, upload, and manage device filesystem in real-time.
                            </p>
                        </div>
                    </div>

                    {/* Storage Meter */}
                    {totalSpace > 0 && (
                        <div className="w-full md:w-64 bg-[#16181d] border border-white/10 rounded-2xl p-3 space-y-1.5 shrink-0">
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                                <span className="text-white/60 flex items-center gap-1.5">
                                    <Database size={11} className="text-orange-400" /> Storage Capacity
                                </span>
                                <span className="text-amber-300">{usedPercentage}% Used</span>
                            </div>
                            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500" 
                                    style={{ width: `${usedPercentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[9px] font-mono text-white/40">
                                <span>{formatBytes(usedSpace)} Used</span>
                                <span>{formatBytes(freeSpace)} Free</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Permission Warning Banner */}
                {!isAllFilesManager && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                            <div>
                                <div className="text-xs font-bold text-amber-300">Scoped Storage Mode Active (Android 11+)</div>
                                <div className="text-[11px] text-white/60">
                                    Full device-wide file access requires All Files Access (`MANAGE_EXTERNAL_STORAGE`).
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleRequestAllFilesPermission}
                            className="clay-button px-3.5 py-1.5 rounded-xl text-xs font-mono font-black text-amber-300 border border-amber-500/50 hover:bg-amber-500/20 transition-all cursor-pointer shrink-0"
                        >
                            Prompt Device Settings
                        </button>
                    </div>
                )}

                {/* Quick Access Roots / Shortcuts */}
                {roots.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10">
                        {roots.filter(r => r.exists).map((r, idx) => {
                            const isCurrent = currentPath === r.path;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleNavigate(r.path)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                                        isCurrent 
                                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.25)]' 
                                            : 'bg-[#16181d] text-white/70 hover:text-white border border-white/5 hover:border-white/15'
                                    }`}
                                >
                                    {getShortcutIcon(r.icon)}
                                    <span>{r.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Breadcrumbs Navigation Bar */}
                <div className="bg-[#16181d] border border-white/10 p-2.5 sm:p-3 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto scrollbar-none py-0.5">
                        <button
                            onClick={() => handleNavigate('/storage/emulated/0')}
                            className="clay-button-sm px-2.5 py-1 rounded-xl text-white/70 hover:text-white font-mono text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                            <Smartphone size={13} className="text-orange-400" />
                            <span>Root</span>
                        </button>
                        {breadcrumbs.map((crumb, i) => (
                            <React.Fragment key={crumb.path}>
                                <ChevronRight size={13} className="text-white/25 shrink-0" />
                                <button
                                    onClick={() => handleNavigate(crumb.path)}
                                    className={`text-xs font-mono font-bold shrink-0 hover:underline cursor-pointer ${
                                        i === breadcrumbs.length - 1 ? 'text-amber-300' : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    {crumb.label}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {parentPath && (
                            <button
                                onClick={handleGoUp}
                                title="Go to parent directory"
                                className="clay-button-sm w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                            >
                                <ArrowUp size={15} />
                            </button>
                        )}
                        <button
                            onClick={() => fetchDirectory(currentPath)}
                            title="Refresh directory"
                            className={`clay-button-sm w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white cursor-pointer ${isLoading ? 'animate-spin text-orange-400' : ''}`}
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                {/* Action Bar (Search, Filters, Upload, New Folder, View Mode) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    
                    {/* Search & Filter */}
                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search files & folders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#16181d] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {/* Category filter pills */}
                        <div className="hidden lg:flex items-center gap-1 bg-[#16181d] p-1 rounded-xl border border-white/10 text-[11px] font-mono">
                            {['all', 'folders', 'images', 'videos', 'audio', 'documents', 'apks'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-2.5 py-1 rounded-lg capitalize font-bold transition-all cursor-pointer ${
                                        activeFilter === filter ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'text-white/50 hover:text-white'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 justify-end">
                        
                        {/* Hidden file input for uploading */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="clay-button px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-white bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        >
                            <UploadCloud size={14} className="text-emerald-400" />
                            <span>Upload File</span>
                        </button>

                        <button
                            onClick={() => setShowNewFolderModal(true)}
                            className="clay-button px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-white bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 flex items-center gap-1.5 cursor-pointer"
                        >
                            <FolderPlus size={14} className="text-amber-400" />
                            <span>New Folder</span>
                        </button>

                        {/* Multi-select trigger */}
                        <button
                            onClick={() => {
                                setIsSelectMode(!isSelectMode);
                                setSelectedPaths(new Set());
                            }}
                            className={`clay-button-sm px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                                isSelectMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' : 'text-white/70 hover:text-white'
                            }`}
                        >
                            {isSelectMode ? <CheckSquare size={14} /> : <Square size={14} />}
                            <span className="hidden sm:inline">Select</span>
                        </button>

                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-[#16181d] border border-white/10 rounded-xl p-0.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white/15 text-orange-400' : 'text-white/40 hover:text-white'}`}
                                title="Grid View"
                            >
                                <Grid size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white/15 text-orange-400' : 'text-white/40 hover:text-white'}`}
                                title="List View"
                            >
                                <List size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Batch Actions Bar when items selected */}
                {selectedPaths.size > 0 && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
                        <div className="text-xs font-mono font-bold text-rose-300 flex items-center gap-2">
                            <CheckSquare size={15} />
                            <span>{selectedPaths.size} item(s) selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedPaths(new Set(entries.map(e => e.path)))}
                                className="clay-button-sm px-2.5 py-1 rounded-xl text-[11px] font-mono text-white/70 hover:text-white cursor-pointer"
                            >
                                Select All
                            </button>
                            <button
                                onClick={handleMultiDownload}
                                className="px-3 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.4)] cursor-pointer"
                            >
                                <Download size={13} /> Download{selectedPaths.size > 1 ? ' as ZIP' : ''}
                            </button>
                            <button
                                onClick={handleDeleteSelected}
                                className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.4)] cursor-pointer"
                            >
                                <Trash2 size={13} /> Delete Selected
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Active Download / Upload Banner */}
            {(activeDownload || activeUpload) && (
                <div className="bg-[#101216] border border-orange-500/40 p-4 rounded-3xl shadow-xl space-y-3 animate-in fade-in">
                    {activeDownload && (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-white font-bold flex items-center gap-2">
                                    <DownloadCloud size={16} className="text-orange-400 animate-bounce" />
                                    Downloading: {activeDownload.fileName}
                                </span>
                                <span className="text-orange-300 font-bold">{activeDownload.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-orange-500 rounded-full transition-all duration-150" 
                                    style={{ width: `${activeDownload.progress}%` }} 
                                />
                            </div>
                            <div className="text-[10px] font-mono text-white/40 flex justify-between">
                                <span>Chunk {activeDownload.receivedChunks} of {activeDownload.totalChunks}</span>
                                <span>Streaming via WebSockets</span>
                            </div>
                        </div>
                    )}

                    {activeUpload && (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-white font-bold flex items-center gap-2">
                                    <UploadCloud size={16} className="text-emerald-400 animate-pulse" />
                                    Uploading: {activeUpload.fileName}
                                </span>
                                <span className="text-emerald-300 font-bold">{activeUpload.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-150" 
                                    style={{ width: `${activeUpload.progress}%` }} 
                                />
                            </div>
                            <div className="text-[10px] font-mono text-white/40 flex justify-between">
                                <span>Chunk {activeUpload.chunkIndex} of {activeUpload.totalChunks}</span>
                                <span>Writing to {currentPath}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Content Area */}
            {isLoading ? (
                <div className="p-16 flex flex-col items-center justify-center gap-3 bg-[#101216] border border-white/10 rounded-3xl">
                    <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
                    <span className="text-xs font-mono text-white/50">Reading device directory...</span>
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center gap-3 bg-[#101216] border border-white/10 rounded-3xl text-center">
                    <Folder className="w-12 h-12 text-white/20" />
                    <div className="text-sm font-bold text-white/60">Directory is Empty</div>
                    <p className="text-xs text-white/40 font-mono">No files or folders found in this location.</p>
                </div>
            ) : viewMode === 'grid' ? (
                
                /* Grid View */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {filteredEntries.map((item) => {
                        const isSelected = selectedPaths.has(item.path);
                        return (
                            <div
                                key={item.path}
                                onClick={() => {
                                    if (isSelectMode) {
                                        const next = new Set(selectedPaths);
                                        if (next.has(item.path)) next.delete(item.path);
                                        else next.add(item.path);
                                        setSelectedPaths(next);
                                    } else if (item.isDirectory) {
                                        handleNavigate(item.path);
                                    }
                                }}
                                className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                                    isSelected
                                        ? 'bg-orange-500/15 border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.25)]'
                                        : 'bg-[#101216] border-white/10 hover:border-white/25 hover:bg-[#15171d]'
                                }`}
                            >
                                {/* Top Row: Icon & Selection */}
                                <div className="flex items-start justify-between">
                                    <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                                        {getFileIcon(item)}
                                    </div>

                                    {/* Action buttons (hover) */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (item.isDirectory) {
                                                        handleFolderDownload(item);
                                                    } else {
                                                        handleStartDownload(item);
                                                    }
                                                }}
                                                title={item.isDirectory ? "Download Folder as ZIP" : "Download File"}
                                                className="w-6 h-6 rounded-lg bg-black/60 hover:bg-orange-500/30 text-white/70 hover:text-orange-300 flex items-center justify-center border border-white/10 cursor-pointer"
                                            >
                                                <Download size={11} />
                                            </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setItemToRename(item);
                                                setRenameValue(item.name);
                                                setShowRenameModal(true);
                                            }}
                                            title="Rename"
                                            className="w-6 h-6 rounded-lg bg-black/60 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center border border-white/10 cursor-pointer"
                                        >
                                            <Edit3 size={11} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setItemsToDelete([item.path]);
                                                setShowDeleteModal(true);
                                            }}
                                            title="Delete"
                                            className="w-6 h-6 rounded-lg bg-black/60 hover:bg-rose-500/30 text-white/70 hover:text-rose-400 flex items-center justify-center border border-white/10 cursor-pointer"
                                        >
                                            <Trash2 size={11} />
                                        </button>
                                    </div>
                                </div>

                                {/* Filename & Metadata */}
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors" title={item.name}>
                                        {item.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-white/40 flex items-center justify-between">
                                        <span>{item.isDirectory ? `${item.itemCount || 0} items` : formatBytes(item.size)}</span>
                                        <span className="uppercase text-[9px]">{item.extension || 'DIR'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                
                /* List View */
                <div className="bg-[#101216] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-black/50 border-b border-white/10 text-[10px] font-mono font-black text-white/50 uppercase tracking-wider">
                                <tr>
                                    <th className="p-3.5 pl-5">Name</th>
                                    <th className="p-3.5">Size</th>
                                    <th className="p-3.5">Type</th>
                                    <th className="p-3.5">Date Modified</th>
                                    <th className="p-3.5 pr-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredEntries.map((item) => {
                                    const isSelected = selectedPaths.has(item.path);
                                    return (
                                        <tr
                                            key={item.path}
                                            onClick={() => {
                                                if (isSelectMode) {
                                                    const next = new Set(selectedPaths);
                                                    if (next.has(item.path)) next.delete(item.path);
                                                    else next.add(item.path);
                                                    setSelectedPaths(next);
                                                } else if (item.isDirectory) {
                                                    handleNavigate(item.path);
                                                }
                                            }}
                                            className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                                                isSelected ? 'bg-orange-500/10' : ''
                                            }`}
                                        >
                                            <td className="p-3.5 pl-5 flex items-center gap-3">
                                                {getFileIcon(item)}
                                                <span className="font-bold text-white truncate max-w-xs sm:max-w-md hover:text-amber-300">
                                                    {item.name}
                                                </span>
                                            </td>
                                            <td className="p-3.5 font-mono text-white/60">
                                                {item.isDirectory ? `${item.itemCount || 0} items` : formatBytes(item.size)}
                                            </td>
                                            <td className="p-3.5 font-mono text-white/40 uppercase text-[10px]">
                                                {item.extension || (item.isDirectory ? 'Folder' : 'File')}
                                            </td>
                                            <td className="p-3.5 font-mono text-white/40 text-[11px]">
                                                {formatDate(item.lastModified)}
                                            </td>
                                            <td className="p-3.5 pr-5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (item.isDirectory) {
                                                                    handleFolderDownload(item);
                                                                } else {
                                                                    handleStartDownload(item);
                                                                }
                                                            }}
                                                            title={item.isDirectory ? "Download as ZIP" : "Download"}
                                                            className="clay-button-sm w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-orange-400 cursor-pointer"
                                                        >
                                                            <Download size={13} />
                                                        </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setItemToRename(item);
                                                            setRenameValue(item.name);
                                                            setShowRenameModal(true);
                                                        }}
                                                        title="Rename"
                                                        className="clay-button-sm w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                                                    >
                                                        <Edit3 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setItemsToDelete([item.path]);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        title="Delete"
                                                        className="clay-button-sm w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-rose-400 cursor-pointer"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-[#0f1115] border border-white/15 rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3">
                            <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 border-amber-500/40">
                                <FolderPlus size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Create New Folder</h3>
                                <p className="text-[10px] text-white/40 font-mono truncate max-w-[200px]">{currentPath}</p>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Folder Name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
                            autoFocus
                            className="w-full bg-[#16181d] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={() => setShowNewFolderModal(false)}
                                className="bg-[#16181d] hover:bg-white/10 flex-1 py-2 rounded-xl text-white/60 font-mono text-xs cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateFolder}
                                className="bg-amber-500 hover:bg-amber-600 flex-1 py-2 rounded-xl text-black font-mono font-black text-xs cursor-pointer"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {showRenameModal && itemToRename && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-[#0f1115] border border-white/15 rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3">
                            <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-orange-400 border-orange-500/40">
                                <Edit3 size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Rename Item</h3>
                                <p className="text-[10px] text-white/40 font-mono truncate max-w-[200px]">{itemToRename.name}</p>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmRename(); }}
                            autoFocus
                            className="w-full bg-[#16181d] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={() => setShowRenameModal(false)}
                                className="bg-[#16181d] hover:bg-white/10 flex-1 py-2 rounded-xl text-white/60 font-mono text-xs cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRename}
                                className="bg-orange-500 hover:bg-orange-600 flex-1 py-2 rounded-xl text-black font-mono font-black text-xs cursor-pointer"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && itemsToDelete.length > 0 && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-[#0f1115] border border-rose-500/30 rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3">
                            <div className="clay-icon-pod w-10 h-10 rounded-xl flex items-center justify-center text-rose-400 border-rose-500/40">
                                <Trash2 size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Permanently Delete</h3>
                                <p className="text-[10px] text-rose-400 font-mono">Irreversible Action</p>
                            </div>
                        </div>
                        <p className="text-xs text-white/70 font-sans leading-relaxed">
                            Are you sure you want to delete <strong className="text-white">{itemsToDelete.length} item(s)</strong> from target device storage?
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-[#16181d] hover:bg-white/10 flex-1 py-2 rounded-xl text-white/60 font-mono text-xs cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="bg-rose-500 hover:bg-rose-600 flex-1 py-2 rounded-xl text-white font-mono font-black text-xs cursor-pointer shadow-lg border border-rose-400/40"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
