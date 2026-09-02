"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Folder, FileText, Image as ImageIcon, Video, Music, Archive, 
    FileCode, Package, File as FileIcon, ArrowUp, RefreshCw, 
    Download, Trash2, Edit3, Eye, Search, Grid, List, 
    CheckSquare, Square, Smartphone, HardDrive, DownloadCloud, 
    UploadCloud, X, AlertTriangle, ShieldAlert, Check, Shield,
    FolderPlus, Sparkles, Database, Clock, ChevronRight, FileCheck,
    MessageCircle, Film, Camera, Send, MoreVertical, Copy, Share2,
    Info, ChevronDown, Play, FileImage, ArrowLeft, Home, Plus,
    SlidersHorizontal, Layers, CheckCircle2, CornerDownRight, ExternalLink
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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [totalSpace, setTotalSpace] = useState<number>(0);
    const [freeSpace, setFreeSpace] = useState<number>(0);
    const [isAllFilesManager, setIsAllFilesManager] = useState<boolean>(true);
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [showQuickAccess, setShowQuickAccess] = useState<boolean>(false);

    // Multi-Selection State
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
    const [activeActionItem, setActiveActionItem] = useState<FileEntry | null>(null);

    // Live Preview State (Image, Video, Audio, Text/Code)
    const [previewItem, setPreviewItem] = useState<{
        entry: FileEntry;
        type: 'image' | 'video' | 'audio' | 'text';
        loading: boolean;
        blobUrl?: string;
        textContent?: string;
        fileSizeStr: string;
        progress: number;
    } | null>(null);
    const previewChunksRef = useRef<Map<string, string[]>>(new Map());
    const previewDownloadIdRef = useRef<string>('');

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

    // Long press detection for mobile
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const isLongPressActive = useRef<boolean>(false);

    // ─── Socket & Directory Fetching ──────────────────────────────────────────

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

    useEffect(() => {
        if (selectedDeviceId && isOnline) {
            fetchDirectory(currentPath);
        }
    }, [selectedDeviceId, isOnline]);

    // Handle ESC key to close preview and modals
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closePreview();
                setActiveActionItem(null);
                setShowNewFolderModal(false);
                setShowRenameModal(false);
                setShowDeleteModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
            setIsSelectMode(false);
        };

        const handleDownloadChunk = (data: any) => {
            if (!data || !data.downloadId) return;
            const { downloadId, chunkIndex, totalChunks, chunkData, complete, name, error } = data;

            // Check if this chunk belongs to Live Preview
            if (downloadId === previewDownloadIdRef.current) {
                if (error) {
                    alert(`Preview error: ${error}`);
                    setPreviewItem(null);
                    previewChunksRef.current.delete(downloadId);
                    return;
                }

                if (!previewChunksRef.current.has(downloadId)) {
                    previewChunksRef.current.set(downloadId, []);
                }
                const pChunks = previewChunksRef.current.get(downloadId)!;
                pChunks[chunkIndex] = chunkData;

                const progress = Math.min(100, Math.round(((chunkIndex + 1) / totalChunks) * 100));
                setPreviewItem(prev => prev ? { ...prev, progress } : null);

                if (complete || chunkIndex >= totalChunks - 1) {
                    try {
                        const byteArrays: BlobPart[] = [];
                        for (let i = 0; i < totalChunks; i++) {
                            const b64 = pChunks[i];
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
                        const ext = name.split('.').pop()?.toLowerCase() || '';
                        const isText = ['txt', 'log', 'json', 'xml', 'html', 'css', 'js', 'ts', 'tsx', 'jsx', 'kt', 'java', 'py', 'md', 'cfg', 'ini', 'sh', 'bat', 'yaml', 'yml', 'toml', 'csv', 'env', 'properties', 'sql'].includes(ext);

                        if (isText) {
                            blob.text().then(text => {
                                setPreviewItem(prev => prev ? { ...prev, loading: false, textContent: text } : null);
                            });
                        } else {
                            const blobUrl = URL.createObjectURL(blob);
                            setPreviewItem(prev => prev ? { ...prev, loading: false, blobUrl } : null);
                        }
                    } catch (err) {
                        console.error('Preview decode failed', err);
                        alert('Could not decode file for preview');
                        setPreviewItem(null);
                    }
                    previewChunksRef.current.delete(downloadId);
                }
                return;
            }

            // Normal file or ZIP download handler
            if (error) {
                alert(`Download error: ${error}`);
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
                }, 1200);
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

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (ms: number) => {
        if (!ms) return '';
        const d = new Date(ms);
        const now = new Date();
        const diff = now.getTime() - ms;
        if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // Extension & Filter Matching
    const filteredEntries = useMemo(() => {
        return entries.filter(item => {
            if (searchQuery.trim() !== '') {
                if (!item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            }
            if (activeFilter === 'all') return true;
            if (activeFilter === 'folders') return item.isDirectory;
            if (activeFilter === 'images') return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'svg'].includes(item.extension.toLowerCase());
            if (activeFilter === 'videos') return ['mp4', 'mkv', 'avi', 'mov', '3gp', 'webm', 'flv'].includes(item.extension.toLowerCase());
            if (activeFilter === 'audio') return ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac', 'opus'].includes(item.extension.toLowerCase());
            if (activeFilter === 'docs') return ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(item.extension.toLowerCase());
            if (activeFilter === 'apks') return item.extension.toLowerCase() === 'apk';
            if (activeFilter === 'archives') return ['zip', 'rar', '7z', 'tar', 'gz'].includes(item.extension.toLowerCase());
            return true;
        });
    }, [entries, searchQuery, activeFilter]);

    // Clamping: check if user is at Internal Storage root
    const isAtStorageRoot = useMemo(() => {
        if (!currentPath) return true;
        const norm = currentPath.replace(/\/+$/, '');
        return norm === '/storage/emulated/0' || norm === '/storage/emulated' || norm === '/storage' || norm === '';
    }, [currentPath]);

    // Current Folder name
    const currentFolderName = useMemo(() => {
        if (isAtStorageRoot) return 'Internal Storage';
        const parts = currentPath.split('/').filter(Boolean);
        const last = parts[parts.length - 1];
        return last === '0' ? 'Internal Storage' : last || 'Storage';
    }, [currentPath, isAtStorageRoot]);

    // Path Breadcrumbs (strictly relative from Internal Storage down)
    const breadcrumbs = useMemo(() => {
        if (!currentPath || isAtStorageRoot) return [];
        const norm = currentPath.replace(/\/+$/, '');
        const relative = norm.replace(/^\/storage\/emulated\/0\/?/, '');
        if (!relative) return [];

        const parts = relative.split('/').filter(Boolean);
        const crumbs: { label: string; path: string }[] = [];
        let accumulated = '/storage/emulated/0';
        parts.forEach((p) => {
            accumulated += '/' + p;
            crumbs.push({ label: p, path: accumulated });
        });
        return crumbs;
    }, [currentPath, isAtStorageRoot]);

    // ─── Actions ──────────────────────────────────────────────────────────────

    const handleNavigate = (path: string) => {
        if (searchQuery) setSearchQuery('');
        fetchDirectory(path);
    };

    const handleGoUp = () => {
        if (isAtStorageRoot) return; // Clamped! Never go behind Internal Storage
        if (!parentPath || parentPath === '/storage/emulated' || parentPath === '/storage' || parentPath === '/') {
            fetchDirectory('/storage/emulated/0');
            return;
        }
        fetchDirectory(parentPath);
    };

    // Single File Download
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

    // Folder ZIP Download
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

    // Multi-select / ZIP Download
    const handleMultiDownload = () => {
        if (!socket || !userUuid || !selectedDeviceId || selectedPaths.size === 0) return;
        const paths = Array.from(selectedPaths);
        
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

    // Upload
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

    // Multi-Select Delete
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
        setIsSelectMode(false);
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

    // Rename
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

    // Permission Prompt
    const handleRequestAllFilesPermission = () => {
        if (!socket || !userUuid || !selectedDeviceId) return;
        socket.emit('fm_request_permission', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId
        });
    };

    // ─── Live Preview Handling ────────────────────────────────────────────────

    const canPreview = (item: FileEntry): 'image' | 'video' | 'audio' | 'text' | null => {
        if (item.isDirectory) return null;
        const ext = item.extension.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) return 'image';
        if (['mp4', 'webm', 'ogg', 'mov', 'mkv', '3gp'].includes(ext)) return 'video';
        if (['mp3', 'wav', 'm4a', 'aac', 'flac', 'opus'].includes(ext)) return 'audio';
        if (['txt', 'log', 'json', 'xml', 'html', 'css', 'js', 'ts', 'tsx', 'jsx', 'kt', 'java', 'py', 'md', 'cfg', 'ini', 'sh', 'bat', 'yaml', 'yml', 'toml', 'csv', 'env', 'properties', 'sql'].includes(ext)) return 'text';
        return null;
    };

    const handlePreview = (item: FileEntry) => {
        const previewType = canPreview(item);
        if (!previewType || !socket || !userUuid || !selectedDeviceId) return;

        const downloadId = 'preview_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        previewDownloadIdRef.current = downloadId;

        setPreviewItem({
            entry: item,
            type: previewType,
            loading: true,
            fileSizeStr: formatBytes(item.size),
            progress: 0
        });

        socket.emit('fm_download_file', {
            uuid: userUuid,
            targetDeviceId: selectedDeviceId,
            path: item.path,
            downloadId
        });
    };

    const closePreview = () => {
        if (previewItem?.blobUrl) {
            URL.revokeObjectURL(previewItem.blobUrl);
        }
        setPreviewItem(null);
        previewDownloadIdRef.current = '';
    };

    // ─── Touch & Selection Logic ──────────────────────────────────────────────

    const toggleSelectPath = (path: string) => {
        const next = new Set(selectedPaths);
        if (next.has(path)) {
            next.delete(path);
        } else {
            next.add(path);
        }
        setSelectedPaths(next);
        if (next.size === 0) {
            setIsSelectMode(false);
        }
    };

    const handleItemClick = (item: FileEntry) => {
        if (isLongPressActive.current) {
            isLongPressActive.current = false;
            return;
        }

        if (isSelectMode) {
            toggleSelectPath(item.path);
            return;
        }

        if (item.isDirectory) {
            handleNavigate(item.path);
        } else if (canPreview(item)) {
            handlePreview(item);
        } else {
            // Open action sheet
            setActiveActionItem(item);
        }
    };

    const handleTouchStart = (item: FileEntry) => {
        isLongPressActive.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPressActive.current = true;
            setIsSelectMode(true);
            toggleSelectPath(item.path);
            if (navigator.vibrate) navigator.vibrate(40);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    // ─── Icons ────────────────────────────────────────────────────────────────

    const getFileIcon = (item: FileEntry, size = 20) => {
        if (item.isDirectory) return <Folder className="text-amber-400 fill-amber-400/25" style={{ width: size, height: size }} />;
        const ext = item.extension.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) return <ImageIcon className="text-emerald-400" style={{ width: size, height: size }} />;
        if (['mp4', 'mkv', 'avi', 'mov', '3gp', 'webm'].includes(ext)) return <Video className="text-cyan-400" style={{ width: size, height: size }} />;
        if (['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'].includes(ext)) return <Music className="text-purple-400" style={{ width: size, height: size }} />;
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <Archive className="text-orange-400" style={{ width: size, height: size }} />;
        if (['apk'].includes(ext)) return <Package className="text-lime-400" style={{ width: size, height: size }} />;
        if (['json', 'js', 'ts', 'html', 'css', 'kt', 'java', 'xml', 'py'].includes(ext)) return <FileCode className="text-sky-400" style={{ width: size, height: size }} />;
        if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) return <FileText className="text-blue-400" style={{ width: size, height: size }} />;
        return <FileIcon className="text-zinc-400" style={{ width: size, height: size }} />;
    };

    const getShortcutIcon = (iconName: string, size = 15) => {
        const s = { width: size, height: size };
        switch (iconName) {
            case 'camera': return <Camera className="text-emerald-400 shrink-0" style={s} />;
            case 'download': return <Download className="text-blue-400 shrink-0" style={s} />;
            case 'image': return <ImageIcon className="text-teal-400 shrink-0" style={s} />;
            case 'file-text': return <FileText className="text-indigo-400 shrink-0" style={s} />;
            case 'music': return <Music className="text-purple-400 shrink-0" style={s} />;
            case 'film': return <Film className="text-cyan-400 shrink-0" style={s} />;
            case 'message-circle': return <MessageCircle className="text-green-400 shrink-0" style={s} />;
            case 'send': return <Send className="text-sky-400 shrink-0" style={s} />;
            case 'hard-drive': return <HardDrive className="text-amber-400 shrink-0" style={s} />;
            default: return <Smartphone className="text-orange-400 shrink-0" style={s} />;
        }
    };

    const usedSpace = totalSpace > 0 ? totalSpace - freeSpace : 0;
    const usedPercentage = totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0;

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col h-full select-none pb-24 sm:pb-8 animate-in fade-in duration-200">
            
            {/* ── TOP MOBILE-FIRST OS HEADER ── */}
            <div className="bg-[#0e1015]/95 backdrop-blur-md sticky top-0 z-30 border-b border-white/[0.08] shadow-sm">
                
                {/* Main Action Bar */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {!isAtStorageRoot ? (
                            <button 
                                onClick={handleGoUp}
                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 text-white/80 hover:text-white transition-all shrink-0 cursor-pointer"
                                title="Go Back"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        ) : (
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                                <Folder size={18} className="fill-amber-400/25" />
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <h2 className="text-sm sm:text-base font-black text-white truncate tracking-tight flex items-center gap-1.5">
                                <span>{currentFolderName}</span>
                                {entries.length > 0 && (
                                    <span className="text-[11px] font-mono text-white/35 font-normal">
                                        ({filteredEntries.length})
                                    </span>
                                )}
                            </h2>
                            <div className="text-[10px] text-white/40 font-mono truncate max-w-xs sm:max-w-md">
                                {currentPath.replace('/storage/emulated/0', 'Internal Storage')}
                            </div>
                        </div>
                    </div>

                    {/* Quick Tools in Header */}
                    <div className="flex items-center gap-1 shrink-0">
                        {/* New Folder button */}
                        <button
                            onClick={() => setShowNewFolderModal(true)}
                            className="h-8.5 px-2 sm:px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer shrink-0"
                            title="New Folder"
                        >
                            <FolderPlus size={15} />
                            <span className="hidden md:inline text-[11px]">Folder</span>
                        </button>

                        {/* Upload button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8.5 px-2 sm:px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer shrink-0"
                            title="Upload File"
                        >
                            <UploadCloud size={15} />
                            <span className="hidden md:inline text-[11px]">Upload</span>
                        </button>

                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                showSearch || searchQuery ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                            }`}
                            title="Search"
                        >
                            <Search size={16} />
                        </button>

                        <button
                            onClick={() => {
                                setIsSelectMode(!isSelectMode);
                                if (isSelectMode) setSelectedPaths(new Set());
                            }}
                            className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                isSelectMode ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                            }`}
                            title="Multi-select"
                        >
                            <CheckSquare size={16} />
                        </button>

                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                            title="Toggle Grid/List"
                        >
                            {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
                        </button>

                        <button
                            onClick={() => fetchDirectory(currentPath)}
                            disabled={isLoading}
                            className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer ${
                                isLoading ? 'animate-spin text-amber-400' : ''
                            }`}
                            title="Refresh"
                        >
                            <RefreshCw size={15} />
                        </button>
                    </div>
                </div>

                {/* Search Bar Input (Expandable) */}
                {showSearch && (
                    <div className="px-3 sm:px-4 pb-2.5 animate-in slide-in-from-top-1 duration-150">
                        <div className="relative flex items-center">
                            <Search className="w-4 h-4 text-white/40 absolute left-3 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search files and folders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                className="w-full bg-[#16181e] border border-white/[0.1] rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 text-white/40 hover:text-white p-1"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Horizontal Scrollable Breadcrumbs Navigation */}
                <div className="flex items-center gap-1.5 px-3 sm:px-4 pb-2 overflow-x-auto scrollbar-none text-[11px] font-medium">
                    <button
                        onClick={() => handleNavigate('/storage/emulated/0')}
                        className="text-white/40 hover:text-white flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md hover:bg-white/[0.05]"
                    >
                        <Home size={12} />
                        <span>Storage</span>
                    </button>

                    {breadcrumbs.slice(3).map((crumb, idx, arr) => (
                        <React.Fragment key={crumb.path}>
                            <ChevronRight size={11} className="text-white/20 shrink-0" />
                            <button
                                onClick={() => handleNavigate(crumb.path)}
                                className={`shrink-0 px-2 py-0.5 rounded-md transition-colors truncate max-w-[120px] ${
                                    idx === arr.length - 1 
                                        ? 'text-amber-400 font-bold bg-amber-500/10' 
                                        : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                                }`}
                            >
                                {crumb.label}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {/* Filter Tabs / Quick Categories */}
                <div className="flex items-center gap-1.5 px-3 sm:px-4 pb-2.5 overflow-x-auto scrollbar-none border-t border-white/[0.04] pt-2">
                    {[
                        { id: 'all', label: 'All Files' },
                        { id: 'folders', label: 'Folders' },
                        { id: 'images', label: 'Images' },
                        { id: 'videos', label: 'Videos' },
                        { id: 'audio', label: 'Audio' },
                        { id: 'docs', label: 'Documents' },
                        { id: 'apks', label: 'APKs' },
                        { id: 'archives', label: 'Archives' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-tight shrink-0 transition-all cursor-pointer ${
                                activeFilter === tab.id
                                    ? 'bg-amber-500 text-black shadow-sm'
                                    : 'bg-white/[0.04] text-white/50 hover:text-white border border-white/[0.05]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── ALL FILES PERMISSION WARNING BANNER ── */}
            {!isAllFilesManager && (
                <div className="mx-3 sm:mx-4 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 shadow-md animate-in fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                            <ShieldAlert size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-amber-200">Limited Storage Access</div>
                            <div className="text-[10px] text-white/50 truncate">Enable "All Files Access" on device for full control</div>
                        </div>
                    </div>
                    <button
                        onClick={handleRequestAllFilesPermission}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shrink-0 cursor-pointer shadow-sm active:scale-95 transition-all"
                    >
                        Grant
                    </button>
                </div>
            )}

            {/* ── QUICK ACCESS ROOT SHORTCUTS (Collapsible) ── */}
            {roots.length > 0 && (
                <div className="px-3 sm:px-4 mt-3">
                    <button 
                        onClick={() => setShowQuickAccess(!showQuickAccess)}
                        className="flex items-center justify-between w-full py-1 text-[11px] font-bold text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/60"
                    >
                        <span className="flex items-center gap-1.5">
                            <SlidersHorizontal size={12} />
                            <span>Quick Folders</span>
                        </span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${showQuickAccess ? 'rotate-180 text-amber-400' : ''}`} />
                    </button>

                    {showQuickAccess && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-150">
                            {roots.filter(r => r.exists).map((r, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleNavigate(r.path)}
                                    className={`p-2.5 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                                        currentPath === r.path
                                            ? 'bg-amber-500/20 border border-amber-500/50 shadow-sm'
                                            : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]'
                                    }`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
                                        {getShortcutIcon(r.icon, 14)}
                                    </div>
                                    <span className="text-xs font-medium text-white/80 truncate">{r.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── STORAGE GAUGE ── */}
            {totalSpace > 0 && (
                <div className="px-3 sm:px-4 mt-2.5">
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                        <HardDrive size={14} className="text-white/30 shrink-0" />
                        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                                style={{ width: `${usedPercentage}%` }}
                            />
                        </div>
                        <div className="text-[10px] font-mono text-white/40 shrink-0">
                            {formatBytes(freeSpace)} free / {formatBytes(totalSpace)}
                        </div>
                    </div>
                </div>
            )}

            {/* ── TRANSFER STATUS BANNER (Downloads / Uploads) ── */}
            {(activeDownload || activeUpload) && (
                <div className="mx-3 sm:mx-4 mt-3 p-3 rounded-2xl bg-[#13151b] border border-white/[0.08] shadow-lg space-y-2 animate-in fade-in">
                    {activeDownload && (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-white/90 flex items-center gap-2 truncate">
                                    <DownloadCloud size={14} className="text-amber-400 animate-bounce shrink-0" />
                                    <span className="truncate">{activeDownload.fileName}</span>
                                </span>
                                <span className="font-mono text-amber-400 font-bold ml-2 shrink-0">{activeDownload.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-amber-500 rounded-full transition-all duration-150"
                                    style={{ width: `${activeDownload.progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {activeUpload && (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-white/90 flex items-center gap-2 truncate">
                                    <UploadCloud size={14} className="text-emerald-400 animate-pulse shrink-0" />
                                    <span className="truncate">{activeUpload.fileName}</span>
                                </span>
                                <span className="font-mono text-emerald-400 font-bold ml-2 shrink-0">{activeUpload.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-150"
                                    style={{ width: `${activeUpload.progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── MULTI-SELECT FLOATING ACTION BAR ── */}
            {isSelectMode && (
                <div className="sticky top-[108px] z-20 mx-3 sm:mx-4 mt-3 p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 backdrop-blur-md flex items-center justify-between gap-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center gap-2 min-w-0">
                        <button
                            onClick={() => {
                                setIsSelectMode(false);
                                setSelectedPaths(new Set());
                            }}
                            className="w-8 h-8 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white flex items-center justify-center cursor-pointer shrink-0"
                        >
                            <X size={16} />
                        </button>
                        <span className="text-xs font-black text-amber-200 truncate">
                            {selectedPaths.size} selected
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => {
                                if (selectedPaths.size === filteredEntries.length) {
                                    setSelectedPaths(new Set());
                                } else {
                                    setSelectedPaths(new Set(filteredEntries.map(e => e.path)));
                                }
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-[11px] font-bold text-white cursor-pointer"
                        >
                            {selectedPaths.size === filteredEntries.length ? 'Deselect' : 'Select All'}
                        </button>

                        {selectedPaths.size > 0 && (
                            <>
                                <button
                                    onClick={handleMultiDownload}
                                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                                    title="Download selected"
                                >
                                    <Download size={14} />
                                    <span>ZIP</span>
                                </button>
                                <button
                                    onClick={handleDeleteSelected}
                                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                                    title="Delete selected"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── FILE / FOLDER BROWSER CONTENT ── */}
            <div className="flex-1 mt-3 px-2 sm:px-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                        <span className="text-xs text-white/40 font-mono">Scanning folder...</span>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/20">
                            <Folder size={32} />
                        </div>
                        <div className="text-sm font-bold text-white/40">Folder is empty</div>
                        <div className="text-xs text-white/20">Upload a file or create a folder to begin</div>
                    </div>
                ) : viewMode === 'list' ? (
                    /* ── Mobile-Optimized List View ── */
                    <div className="divide-y divide-white/[0.04] bg-[#111318]/60 border border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
                        {filteredEntries.map((item) => {
                            const isSelected = selectedPaths.has(item.path);
                            const previewType = canPreview(item);

                            return (
                                <div
                                    key={item.path}
                                    onClick={() => handleItemClick(item)}
                                    onTouchStart={() => handleTouchStart(item)}
                                    onTouchEnd={handleTouchEnd}
                                    onTouchCancel={handleTouchEnd}
                                    className={`flex items-center gap-3 px-3.5 py-3 transition-colors cursor-pointer active:bg-white/[0.08] ${
                                        isSelected 
                                            ? 'bg-amber-500/15' 
                                            : 'hover:bg-white/[0.03]'
                                    }`}
                                >
                                    {/* Selection or Icon */}
                                    {isSelectMode ? (
                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                                            isSelected 
                                                ? 'bg-amber-500 border-amber-500 text-black' 
                                                : 'border-white/30 bg-black/20'
                                        }`}>
                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                        </div>
                                    ) : (
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            item.isDirectory ? 'bg-amber-500/10' : 'bg-white/[0.04]'
                                        }`}>
                                            {getFileIcon(item, 20)}
                                        </div>
                                    )}

                                    {/* Name & Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs sm:text-sm font-semibold text-white truncate">
                                            {item.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-white/35 font-mono">
                                            <span>
                                                {item.isDirectory 
                                                    ? `${item.itemCount || 0} items` 
                                                    : formatBytes(item.size)}
                                            </span>
                                            {item.lastModified > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span>{formatDate(item.lastModified)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preview badge if media */}
                                    {!isSelectMode && previewType && (
                                        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] text-white/40 font-mono">
                                            {previewType}
                                        </span>
                                    )}

                                    {/* Quick 3-Dots Action Button */}
                                    {!isSelectMode && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveActionItem(item);
                                            }}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] shrink-0 cursor-pointer"
                                            title="Actions"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── Mobile-Optimized Grid View ── */
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                        {filteredEntries.map((item) => {
                            const isSelected = selectedPaths.has(item.path);
                            return (
                                <div
                                    key={item.path}
                                    onClick={() => handleItemClick(item)}
                                    onTouchStart={() => handleTouchStart(item)}
                                    onTouchEnd={handleTouchEnd}
                                    onTouchCancel={handleTouchEnd}
                                    className={`relative p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition-all cursor-pointer active:scale-95 border ${
                                        isSelected 
                                            ? 'bg-amber-500/15 border-amber-500/50 shadow-md' 
                                            : 'bg-[#111318]/60 hover:bg-white/[0.05] border-white/[0.05]'
                                    }`}
                                >
                                    {isSelectMode && (
                                        <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            isSelected ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/30 bg-black/40'
                                        }`}>
                                            {isSelected && <Check size={10} strokeWidth={3} />}
                                        </div>
                                    )}

                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mt-1 ${
                                        item.isDirectory ? 'bg-amber-500/10' : 'bg-white/[0.04]'
                                    }`}>
                                        {getFileIcon(item, 26)}
                                    </div>

                                    <div className="w-full">
                                        <div className="text-xs font-semibold text-white truncate leading-tight">
                                            {item.name}
                                        </div>
                                        <div className="text-[10px] text-white/35 font-mono mt-0.5">
                                            {item.isDirectory ? `${item.itemCount || 0} items` : formatBytes(item.size)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── FLOATING ACTION BUTTONS (Upload & New Folder) ── */}
            {!isSelectMode && (
                <div className="fixed bottom-24 right-5 sm:bottom-28 sm:right-6 flex flex-col gap-3 z-30">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
                        title="Upload File"
                    >
                        <UploadCloud size={22} />
                    </button>

                    <button
                        onClick={() => setShowNewFolderModal(true)}
                        className="w-12 h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-black flex items-center justify-center shadow-xl shadow-amber-500/30 transition-all cursor-pointer font-bold"
                        title="New Folder"
                    >
                        <FolderPlus size={22} />
                    </button>
                </div>
            )}

            {/* ── ACTION SHEET / CONTEXT MENU (Mobile Bottom Sheet) ── */}
            {activeActionItem && (
                <div 
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
                    onClick={() => setActiveActionItem(null)}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    
                    <div 
                        className="relative bg-[#16181f] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-1.5 pb-8 sm:pb-3 shadow-2xl animate-in slide-in-from-bottom duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header preview */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08]">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
                                {getFileIcon(activeActionItem, 20)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-white truncate">
                                    {activeActionItem.name}
                                </div>
                                <div className="text-[11px] text-white/40 font-mono">
                                    {activeActionItem.isDirectory ? `${activeActionItem.itemCount || 0} items` : formatBytes(activeActionItem.size)}
                                    {activeActionItem.lastModified > 0 && ` • ${formatDate(activeActionItem.lastModified)}`}
                                </div>
                            </div>
                        </div>

                        {/* Menu Options */}
                        <div className="py-1">
                            {canPreview(activeActionItem) && (
                                <button
                                    onClick={() => {
                                        handlePreview(activeActionItem);
                                        setActiveActionItem(null);
                                    }}
                                    className="w-full flex items-center gap-3.5 px-4 py-3 text-left hover:bg-white/[0.06] active:bg-white/[0.1] text-xs font-bold text-white/90 cursor-pointer"
                                >
                                    <Eye size={18} className="text-cyan-400 shrink-0" />
                                    <span>Live Preview</span>
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    if (activeActionItem.isDirectory) {
                                        handleFolderDownload(activeActionItem);
                                    } else {
                                        handleStartDownload(activeActionItem);
                                    }
                                    setActiveActionItem(null);
                                }}
                                className="w-full flex items-center gap-3.5 px-4 py-3 text-left hover:bg-white/[0.06] active:bg-white/[0.1] text-xs font-bold text-white/90 cursor-pointer"
                            >
                                <Download size={18} className="text-amber-400 shrink-0" />
                                <span>{activeActionItem.isDirectory ? 'Download as ZIP' : 'Download File'}</span>
                            </button>

                            <button
                                onClick={() => {
                                    setItemToRename(activeActionItem);
                                    setRenameValue(activeActionItem.name);
                                    setShowRenameModal(true);
                                    setActiveActionItem(null);
                                }}
                                className="w-full flex items-center gap-3.5 px-4 py-3 text-left hover:bg-white/[0.06] active:bg-white/[0.1] text-xs font-bold text-white/90 cursor-pointer"
                            >
                                <Edit3 size={18} className="text-white/60 shrink-0" />
                                <span>Rename</span>
                            </button>

                            <button
                                onClick={() => {
                                    setIsSelectMode(true);
                                    setSelectedPaths(new Set([activeActionItem.path]));
                                    setActiveActionItem(null);
                                }}
                                className="w-full flex items-center gap-3.5 px-4 py-3 text-left hover:bg-white/[0.06] active:bg-white/[0.1] text-xs font-bold text-white/90 cursor-pointer"
                            >
                                <CheckSquare size={18} className="text-white/60 shrink-0" />
                                <span>Select</span>
                            </button>

                            <button
                                onClick={() => {
                                    setItemsToDelete([activeActionItem.path]);
                                    setShowDeleteModal(true);
                                    setActiveActionItem(null);
                                }}
                                className="w-full flex items-center gap-3.5 px-4 py-3 text-left hover:bg-rose-500/10 active:bg-rose-500/20 text-xs font-bold text-rose-400 cursor-pointer"
                            >
                                <Trash2 size={18} className="text-rose-400 shrink-0" />
                                <span>Delete</span>
                            </button>
                        </div>

                        {/* Dismiss */}
                        <div className="px-3 pt-1">
                            <button
                                onClick={() => setActiveActionItem(null)}
                                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white/60 hover:text-white cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── LIVE PREVIEW MODAL (Image / Video / Audio / Text) ── */}
            {previewItem && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in"
                    onClick={closePreview}
                >
                    {/* Top Bar */}
                    <div 
                        className="flex items-center justify-between px-3.5 sm:px-5 py-3 bg-[#0d0f14] border-b border-white/[0.08] shadow-md shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                                {getFileIcon(previewItem.entry, 18)}
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-bold text-white truncate">
                                    {previewItem.entry.name}
                                </div>
                                <div className="text-[10px] text-white/40 font-mono">
                                    {previewItem.fileSizeStr}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => handleStartDownload(previewItem.entry)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm active:scale-95 transition-all"
                            >
                                <Download size={14} />
                                <span className="hidden sm:inline">Download</span>
                            </button>

                            {/* Prominent High-Visibility Close Button */}
                            <button
                                onClick={closePreview}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 shadow-md transition-all"
                                title="Close Preview (Esc)"
                            >
                                <X size={15} strokeWidth={2.5} />
                                <span>Close</span>
                            </button>
                        </div>
                    </div>

                    {/* Preview Viewport */}
                    <div 
                        className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-auto"
                        onClick={(e) => {
                            // If clicking directly in the viewport outside media, close preview
                            if (e.target === e.currentTarget) closePreview();
                        }}
                    >
                        {previewItem.loading ? (
                            <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                <RefreshCw className="w-9 h-9 text-amber-400 animate-spin" />
                                <div className="text-xs text-white/60 font-mono">
                                    Streaming {previewItem.progress}%...
                                </div>
                                <div className="w-48 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-amber-500 rounded-full transition-all duration-150"
                                        style={{ width: `${previewItem.progress}%` }}
                                    />
                                </div>
                            </div>
                        ) : previewItem.type === 'image' && previewItem.blobUrl ? (
                            <div className="relative max-w-full max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                <img
                                    src={previewItem.blobUrl}
                                    alt={previewItem.entry.name}
                                    className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                                />
                            </div>
                        ) : previewItem.type === 'video' && previewItem.blobUrl ? (
                            <div className="w-full max-w-4xl max-h-[82vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                <video
                                    src={previewItem.blobUrl}
                                    controls
                                    autoPlay
                                    className="w-full max-h-[78vh] rounded-xl shadow-2xl bg-black"
                                />
                            </div>
                        ) : previewItem.type === 'audio' && previewItem.blobUrl ? (
                            <div className="flex flex-col items-center gap-6 p-8 bg-[#16181f] border border-white/[0.08] rounded-3xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                                <div className="w-24 h-24 rounded-3xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                    <Music size={42} />
                                </div>
                                <div className="text-center">
                                    <h4 className="text-sm font-bold text-white truncate max-w-xs">{previewItem.entry.name}</h4>
                                    <p className="text-xs text-white/40 font-mono mt-1">{previewItem.fileSizeStr}</p>
                                </div>
                                <audio src={previewItem.blobUrl} controls autoPlay className="w-full" />
                            </div>
                        ) : previewItem.type === 'text' && previewItem.textContent !== undefined ? (
                            <div className="w-full max-w-4xl h-full flex flex-col bg-[#101217] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06] text-xs font-mono">
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-blue-400" />
                                        <span className="text-white/80 font-bold truncate max-w-[160px] sm:max-w-md">{previewItem.entry.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                if (previewItem.textContent) {
                                                    navigator.clipboard.writeText(previewItem.textContent);
                                                    alert('Copied to clipboard');
                                                }
                                            }}
                                            className="hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] flex items-center gap-1 cursor-pointer text-white/70 text-[11px]"
                                        >
                                            <Copy size={12} />
                                            <span>Copy</span>
                                        </button>
                                        <button
                                            onClick={closePreview}
                                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 font-bold flex items-center gap-1 cursor-pointer border border-rose-500/30 text-[11px]"
                                        >
                                            <X size={12} strokeWidth={2.5} />
                                            <span>Close</span>
                                        </button>
                                    </div>
                                </div>
                                <pre className="flex-1 p-4 text-xs font-mono text-white/80 leading-relaxed overflow-auto whitespace-pre-wrap break-words">
                                    {previewItem.textContent}
                                </pre>
                            </div>
                        ) : (
                            <div className="text-xs text-white/40" onClick={(e) => e.stopPropagation()}>Preview not available</div>
                        )}
                    </div>
                </div>
            )}

            {/* ── CREATE FOLDER MODAL ── */}
            {showNewFolderModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
                    onClick={() => setShowNewFolderModal(false)}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div 
                        className="relative bg-[#16181f] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                                <FolderPlus size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Create New Folder</h3>
                                <p className="text-[10px] text-white/40 font-mono truncate max-w-[200px]">
                                    {currentPath.replace('/storage/emulated/0', 'Internal Storage')}
                                </p>
                            </div>
                        </div>

                        <input
                            type="text"
                            placeholder="Folder Name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
                            autoFocus
                            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500"
                        />

                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={() => setShowNewFolderModal(false)}
                                className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white/60 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateFolder}
                                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs cursor-pointer shadow-md active:scale-95"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── RENAME MODAL ── */}
            {showRenameModal && itemToRename && (
                <div 
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
                    onClick={() => setShowRenameModal(false)}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div 
                        className="relative bg-[#16181f] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/60">
                                <Edit3 size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-bold text-white">Rename</h3>
                                <p className="text-[10px] text-white/40 truncate">{itemToRename.name}</p>
                            </div>
                        </div>

                        <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmRename(); }}
                            autoFocus
                            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500"
                        />

                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={() => setShowRenameModal(false)}
                                className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white/60 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRename}
                                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs cursor-pointer shadow-md active:scale-95"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE CONFIRMATION MODAL ── */}
            {showDeleteModal && itemsToDelete.length > 0 && (
                <div 
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div 
                        className="relative bg-[#16181f] border border-rose-500/20 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">
                                    Delete {itemsToDelete.length} item{itemsToDelete.length > 1 ? 's' : ''}?
                                </h3>
                                <p className="text-[10px] text-rose-400/80 font-mono">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white/60 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer shadow-md active:scale-95"
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
