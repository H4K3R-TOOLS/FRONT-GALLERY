'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';
import axios from 'axios';

// Glassmorphism Card Component
const GlassCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-2xl ${className}`}>
        {children}
    </div>
);

export default function Dashboard() {
    const { data: session } = useSession();
    const [media, setMedia] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
    const [selected, setSelected] = useState<string[]>([]);
    const [previewItem, setPreviewItem] = useState<any | null>(null);
    const [socket, setSocket] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Backend URL
    const API_URL = 'http://localhost:3000'; // Replace with actual backend URL in prod

    useEffect(() => {
        if (session?.user?.email) {
            // Connect Socket
            const newSocket = io(API_URL);
            setSocket(newSocket);

            // Fetch Initial Media
            fetchMedia();

            // Listen for updates
            newSocket.on('connect', () => {
                // We need the UUID to join the room. 
                // Assuming the backend handles auth and we can get the UUID or join by email?
                // For now, let's assume we fetch the UUID from the user profile or the backend handles it.
                // Actually, the backend emits to `web_${uuid}`. We need to know our UUID.
                // Let's fetch the user profile first.
                axios.post(`${API_URL}/auth/google`, { email: session.user.email })
                    .then((res: any) => {
                        const uuid = res.data.uuid;
                        newSocket.emit('join_web', uuid);
                    });
            });

            newSocket.on('new_media', (newFile: any) => {
                setMedia(prev => [newFile, ...prev]);
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, [session]);

    const fetchMedia = async () => {
        if (!session?.user?.email) return;
        setLoading(true);
        try {
            // Get UUID first (should be optimized to context)
            const authRes = await axios.post(`${API_URL}/auth/google`, { email: session.user.email });
            const uuid = authRes.data.uuid;

            const res = await axios.get(`${API_URL}/media?uuid=${uuid}`);
            setMedia(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMedia = media.filter(item => filter === 'all' || item.type === filter);

    const toggleSelect = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const downloadFile = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const downloadSelected = async () => {
        if (selected.length === 0) return;

        const filesToDownload = media
            .filter(m => selected.includes(m.id))
            .map(m => ({ url: m.url, name: `${m.id}.${m.format}` }));

        try {
            const response = await axios.post(`${API_URL}/download-zip`, { files: filesToDownload }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'gallery_download.zip');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Zip download failed', error);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
                <GlassCard className="p-8 text-center">
                    <h1 className="text-3xl font-bold mb-4">Gallery Sync</h1>
                    <p className="mb-6 text-gray-300">Please sign in to view your gallery.</p>
                    <a href="/api/auth/signin" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full transition-all">
                        Sign In with Google
                    </a>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">

            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <img src={session.user?.image || ''} alt="Profile" className="w-10 h-10 rounded-full border-2 border-blue-500" />
                    <div>
                        <h1 className="text-xl font-bold">{session.user?.name}</h1>
                        <p className="text-xs text-gray-400">Connected</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {selected.length > 0 && (
                        <button
                            onClick={downloadSelected}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-all flex items-center gap-2"
                        >
                            <span>Download ({selected.length})</span>
                        </button>
                    )}
                    <button onClick={() => fetchMedia()} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                        🔄
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                {['all', 'image', 'video'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-6 py-2 rounded-full capitalize transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {f}s
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading media...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredMedia.map((item) => (
                        <div
                            key={item.id}
                            className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selected.includes(item.id) ? 'border-blue-500 scale-95' : 'border-transparent hover:border-white/30'
                                }`}
                            onClick={() => toggleSelect(item.id)}
                        >
                            {item.type === 'video' ? (
                                <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                    <video src={item.url} className="w-full h-full object-cover opacity-80" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                            ▶
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs">Video</div>
                                </div>
                            ) : (
                                <img src={item.url} alt="Gallery Item" className="w-full h-full object-cover" />
                            )}

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                                    className="p-2 bg-white/20 rounded-full hover:bg-white/40 backdrop-blur-md"
                                >
                                    👁️
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); downloadFile(item.url, `${item.id}.${item.format}`); }}
                                    className="p-2 bg-white/20 rounded-full hover:bg-white/40 backdrop-blur-md"
                                >
                                    ⬇️
                                </button>
                            </div>

                            {/* Selection Indicator */}
                            {selected.includes(item.id) && (
                                <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">
                                    ✓
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setPreviewItem(null)}>
                    <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewItem(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl"
                        >
                            Close ✕
                        </button>

                        <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">
                            {previewItem.type === 'video' ? (
                                <video src={previewItem.url} controls autoPlay className="w-full max-h-[80vh]" />
                            ) : (
                                <img src={previewItem.url} alt="Preview" className="w-full max-h-[80vh] object-contain" />
                            )}
                        </div>

                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => downloadFile(previewItem.url, `${previewItem.id}.${previewItem.format}`)}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-semibold shadow-lg shadow-blue-500/30 transition-all"
                            >
                                Download Original
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
