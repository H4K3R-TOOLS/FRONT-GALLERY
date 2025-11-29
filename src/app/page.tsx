'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MediaLightbox from '@/components/MediaLightbox';

interface MediaFile {
    id: string;
    url: string;
    created_at: string;
    type: 'image' | 'video';
}

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [filteredMedia, setFilteredMedia] = useState<MediaFile[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos'>('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user?.id) {
            fetchMedia();
        }
    }, [session]);

    useEffect(() => {
        filterMedia();
    }, [activeTab, media]);

    const getMediaType = (url: string): 'image' | 'video' => {
        const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
        return videoExtensions.some(ext => url.toLowerCase().includes(ext)) ? 'video' : 'image';
    };

    const fetchMedia = async () => {
        try {
            const res = await fetch(`/api/images?uuid=${session?.user?.id}`);
            const data = await res.json();
            const mediaWithTypes = data.map((item: any) => ({
                ...item,
                type: getMediaType(item.url)
            }));
            setMedia(mediaWithTypes);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch media:', error);
            setLoading(false);
        }
    };

    const filterMedia = () => {
        if (activeTab === 'all') {
            setFilteredMedia(media);
        } else if (activeTab === 'images') {
            setFilteredMedia(media.filter(m => m.type === 'image'));
        } else {
            setFilteredMedia(media.filter(m => m.type === 'video'));
        }
    };

    const downloadAll = async () => {
        try {
            const urls = filteredMedia.map(m => m.url);
            const res = await fetch('/api/download-bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls })
            });

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gallery_${activeTab}_${Date.now()}.zip`;
            a.click();
        } catch (error) {
            console.error('Failed to download:', error);
            alert('Download failed');
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!session) return null;

    const hasVideos = media.some(m => m.type === 'video');

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="glass-effect p-6 rounded-2xl mb-6 border border-white/10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold gradient-text mb-2">Your Gallery</h1>
                            <p className="text-gray-400">{filteredMedia.length} files</p>
                        </div>
                        {filteredMedia.length > 0 && (
                            <button
                                onClick={downloadAll}
                                className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download All {filteredMedia.length > 1 && `(${filteredMedia.length})`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'glass-effect text-gray-400 hover:text-white'
                            }`}
                    >
                        All ({media.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'images'
                                ? 'bg-purple-600 text-white'
                                : 'glass-effect text-gray-400 hover:text-white'
                            }`}
                    >
                        Images ({media.filter(m => m.type === 'image').length})
                    </button>
                    {hasVideos && (
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'videos'
                                    ? 'bg-purple-600 text-white'
                                    : 'glass-effect text-gray-400 hover:text-white'
                                }`}
                        >
                            Videos ({media.filter(m => m.type === 'video').length})
                        </button>
                    )}
                </div>

                {/* Grid */}
                {filteredMedia.length === 0 ? (
                    <div className="glass-effect p-12 rounded-2xl text-center border border-white/10">
                        <p className="text-gray-400 text-lg">No {activeTab === 'all' ? 'media' : activeTab} found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMedia.map((item, index) => (
                            <div
                                key={item.id}
                                onClick={() => setLightboxIndex(index)}
                                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group glass-effect border border-white/10 hover:scale-105 transition-transform"
                            >
                                {item.type === 'image' ? (
                                    <img
                                        src={item.url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="relative w-full h-full bg-gray-800">
                                        <video
                                            src={item.url}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <MediaLightbox
                    media={filteredMedia}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNavigate={setLightboxIndex}
                />
            )}
        </div>
    );
}
