"use client";

import React, { useState } from 'react';
import { 
    Bell, Trash2, Radio, MessageSquare, 
    ChevronDown, CheckCheck, Clock
} from 'lucide-react';

interface NotificationsViewProps {
    notifications: any[];
    selectedDeviceId: string | null;
    isDeviceOnline: boolean;
    appIcons: Record<string, string>;
    onClearAll: () => void;
}

interface AppFilter {
    key: string;
    label: string;
    packages: string[];
    img: string | null;
}

const notifAppFilters: AppFilter[] = [
    { key: 'all', label: 'All Alerts', packages: [], img: null },
    { key: 'whatsapp', label: 'WhatsApp', packages: ['com.whatsapp', 'com.whatsapp.w4b'], img: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' },
    { key: 'instagram', label: 'Instagram', packages: ['com.instagram.android'], img: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg' },
    { key: 'facebook', label: 'Facebook', packages: ['com.facebook.katana', 'com.facebook.orca', 'com.facebook.lite'], img: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' },
    { key: 'snapchat', label: 'Snapchat', packages: ['com.snapchat.android'], img: 'https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg' },
    { key: 'twitter', label: 'X', packages: ['com.twitter.android'], img: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg' },
    { key: 'telegram', label: 'Telegram', packages: ['org.telegram.messenger', 'org.thunderdog.challegram'], img: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg' },
    { key: 'youtube', label: 'YouTube', packages: ['com.google.android.youtube'], img: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
];

export default function NotificationsView({
    notifications,
    selectedDeviceId,
    isDeviceOnline,
    appIcons,
    onClearAll
}: NotificationsViewProps) {
    const [selectedNotifApp, setSelectedNotifApp] = useState('all');
    const [selectedNotification, setSelectedNotification] = useState<any>(null);

    const deviceNotifs = notifications.filter(n => {
        if (!selectedDeviceId) return true;
        return n.deviceId === selectedDeviceId;
    });

    const filteredNotifs = deviceNotifs.filter(n => {
        const appMatch = selectedNotifApp === 'all' || 
            notifAppFilters.find(f => f.key === selectedNotifApp)?.packages.includes(n.packageName);
        return appMatch;
    });

    return (
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-400 pb-16">
            
            {/* ── App Filter Chips & Quick Actions Bar (With ample vertical padding to avoid top clip) ── */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-2.5 px-1 flex-1">
                    {notifAppFilters.map(filter => {
                        const count = filter.key === 'all' 
                            ? deviceNotifs.length 
                            : deviceNotifs.filter(n => filter.packages.includes(n.packageName)).length;

                        return (
                            <button
                                key={filter.key}
                                type="button"
                                onClick={() => setSelectedNotifApp(filter.key)}
                                className={`clay-capsule flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                    selectedNotifApp === filter.key 
                                        ? 'border-orange-500/60 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.3)] bg-orange-500/15 font-black' 
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                {filter.img ? (
                                    <img src={filter.img} className="w-4 h-4 object-contain shrink-0" alt="" />
                                ) : (
                                    <Bell size={13} className={selectedNotifApp === filter.key ? 'text-orange-400' : 'text-white/40'} />
                                )}
                                <span>{filter.label}</span>
                                {count > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                                        selectedNotifApp === filter.key ? 'bg-orange-500/30 text-orange-200' : 'bg-white/10 text-white/40'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {filteredNotifs.length > 0 && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="clay-card-error px-3 py-2 rounded-xl text-red-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        title="Clear all alerts"
                    >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Clear All</span>
                    </button>
                )}
            </div>

            {/* ── Notification Feed Reel ── */}
            <div className="clay-card p-3.5 sm:p-5 flex flex-col min-h-[420px] max-h-[75vh] overflow-y-auto custom-scrollbar space-y-2.5 sm:space-y-3">
                {filteredNotifs.length === 0 ? (
                    <div className="my-auto flex flex-col items-center justify-center text-center gap-3 p-8 text-white/30">
                        <div className="clay-icon-pod w-16 h-16 rounded-2xl flex items-center justify-center">
                            <Bell size={28} strokeWidth={1.5} className="text-orange-400/40" />
                        </div>
                        <div>
                            <p className="font-bold text-white/60 text-sm">No Alerts Recorded</p>
                            <p className="text-xs text-white/30 mt-0.5 font-mono">Incoming push messages from device will appear here in real-time.</p>
                        </div>
                    </div>
                ) : (
                    filteredNotifs.map((notif: any, i: number) => {
                        const isExpanded = selectedNotification?.id === (notif.id || i);
                        const pkg = notif.packageName || '';
                        const accentColor = 
                            pkg.includes('whatsapp') ? { dot: '#25D366', text: '#25D366' } :
                            pkg.includes('instagram') ? { dot: '#E4405F', text: '#E4405F' } :
                            pkg.includes('facebook') ? { dot: '#1877F2', text: '#1877F2' } :
                            pkg.includes('snapchat') ? { dot: '#FFFC00', text: '#d4cd00' } :
                            pkg.includes('twitter') || pkg.includes('x.com') ? { dot: '#1D9BF0', text: '#1D9BF0' } :
                            pkg.includes('youtube') ? { dot: '#FF0000', text: '#FF0000' } :
                            pkg.includes('telegram') ? { dot: '#24A1DE', text: '#24A1DE' } :
                            { dot: '#f97316', text: '#f97316' };

                        return (
                            <div
                                key={notif.id || i}
                                onClick={() => setSelectedNotification(isExpanded ? null : { ...notif, id: notif.id || i })}
                                className={`clay-capsule p-3 sm:p-4 rounded-2xl flex items-start gap-3 transition-all cursor-pointer ${
                                    isExpanded ? 'border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'hover:border-white/20'
                                }`}
                            >
                                {/* App Icon Pod */}
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0 overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                                    {appIcons[notif.packageName] ? (
                                        <img 
                                            src={`data:image/png;base64,${appIcons[notif.packageName]}`} 
                                            className="w-full h-full object-cover rounded-xl" 
                                            alt="icon" 
                                        />
                                    ) : (
                                        <Bell size={18} style={{ color: accentColor.dot }} />
                                    )}
                                </div>

                                {/* Main Text Body */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[11px] font-black uppercase tracking-wider font-mono truncate" style={{ color: accentColor.text }}>
                                            {notif.appName || notif.packageName?.split('.').pop()}
                                        </span>
                                        <span className="text-[10px] text-white/35 font-mono whitespace-nowrap shrink-0">
                                            {(() => {
                                                const d = new Date(notif.receivedAt || notif.timestamp);
                                                const now = new Date();
                                                const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
                                                if (diff < 60) return `${diff}s ago`;
                                                if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
                                                if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
                                                return d.toLocaleDateString();
                                            })()}
                                        </span>
                                    </div>

                                    {notif.title && (
                                        <p className="font-bold text-white text-xs sm:text-sm leading-snug">
                                            {notif.title}
                                        </p>
                                    )}

                                    {notif.text && (
                                        <div className="mt-1.5 space-y-1">
                                            {String(notif.text).split('\n').map((line: string, lineIdx: number) => {
                                                if (!line.trim()) return null;
                                                const colonIdx = line.indexOf(':');
                                                const isMessageLike = colonIdx > 0 && colonIdx < 30;
                                                const sender = isMessageLike ? line.substring(0, colonIdx).trim() : null;
                                                const content = isMessageLike ? line.substring(colonIdx + 1).trim() : line;
                                                return (
                                                    <div 
                                                        key={lineIdx} 
                                                        className="bg-black/30 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white/85 leading-relaxed"
                                                    >
                                                        {sender && (
                                                            <span className="font-bold text-[11px] block mb-0.5" style={{ color: accentColor.text }}>
                                                                {sender}:
                                                            </span>
                                                        )}
                                                        <span className="whitespace-pre-wrap break-words">{content}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Expanded Detail Tray */}
                                    {isExpanded && (
                                        <div className="mt-2.5 pt-2.5 border-t border-white/5 grid grid-cols-[50px_1fr] gap-1.5 text-[10px] font-mono text-white/40">
                                            <span>Time</span>
                                            <span className="text-white/70">{new Date(notif.receivedAt || notif.timestamp).toLocaleString()}</span>
                                            <span>Package</span>
                                            <span className="text-white/50 break-all">{notif.packageName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
