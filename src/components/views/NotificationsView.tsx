"use client";

import React, { useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';

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
    { key: 'all', label: 'All Notifications', packages: [], img: null },
    { key: 'whatsapp', label: 'WhatsApp', packages: ['com.whatsapp', 'com.whatsapp.w4b'], img: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' },
    { key: 'instagram', label: 'Instagram', packages: ['com.instagram.android'], img: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg' },
    { key: 'facebook', label: 'Facebook / Messenger', packages: ['com.facebook.katana', 'com.facebook.orca', 'com.facebook.lite'], img: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' },
    { key: 'snapchat', label: 'Snapchat', packages: ['com.snapchat.android'], img: 'https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg' },
    { key: 'twitter', label: 'X (Twitter)', packages: ['com.twitter.android'], img: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg' },
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

    const filteredNotifs = notifications.filter(n => {
        const deviceMatch = !n.deviceId || n.deviceId === 'unknown' || !selectedDeviceId || n.deviceId === selectedDeviceId;
        const appMatch = selectedNotifApp === 'all' || 
            notifAppFilters.find(f => f.key === selectedNotifApp)?.packages.includes(n.packageName);
        return deviceMatch && appMatch;
    });

    return (
        <div className="space-y-4 h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Header - status pills */}
            <div className="flex items-center justify-end flex-shrink-0 gap-2 px-1">
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Device Online/Offline pill */}
                    {isDeviceOnline ? (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                            <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Offline</span>
                        </div>
                    )}
                    {filteredNotifs.length > 0 && (
                        <button
                            onClick={onClearAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 text-white/40 hover:text-red-400 text-[11px] font-bold uppercase tracking-widest transition-all"
                        >
                            <Trash2 size={12} />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* App Filter chips */}
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 flex-shrink-0">
                {notifAppFilters.map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => setSelectedNotifApp(filter.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                            selectedNotifApp === filter.key 
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]' 
                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 hover:border-white/10'
                        }`}
                    >
                        {filter.img 
                            ? <img src={filter.img} className="w-4 h-4" alt="" />
                            : <Bell size={13} />
                        }
                        {filter.label}
                        {selectedNotifApp !== filter.key && (
                            <span className="text-[10px] text-white/20 font-data">
                                {filter.key === 'all' 
                                    ? notifications.length 
                                    : notifications.filter(n => filter.packages.includes(n.packageName)).length
                                }
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notification Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-3xl border border-white/5 p-4 sm:p-5">
                {filteredNotifs.length === 0 ? (
                    <div className="h-full min-h-[40vh] flex flex-col items-center justify-center text-center gap-5 text-white/20">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <Bell size={36} strokeWidth={1} />
                        </div>
                        <div>
                            <p className="font-bold text-white/50">No notifications yet</p>
                            <p className="text-sm text-white/25 mt-1">Monitoring is active. Waiting for device alerts...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredNotifs.map((notif: any, i: number) => {
                            const isExpanded = selectedNotification?.id === (notif.id || i);
                            const pkg = notif.packageName || '';
                            const accentColor = 
                                pkg.includes('whatsapp') ? { bg: 'rgba(37,211,102,0.12)', border: 'rgba(37,211,102,0.25)', dot: '#25D366', text: '#25D366' } :
                                pkg.includes('instagram') ? { bg: 'rgba(228,64,95,0.12)', border: 'rgba(228,64,95,0.25)', dot: '#E4405F', text: '#E4405F' } :
                                pkg.includes('facebook') ? { bg: 'rgba(24,119,242,0.12)', border: 'rgba(24,119,242,0.25)', dot: '#1877F2', text: '#1877F2' } :
                                pkg.includes('snapchat') ? { bg: 'rgba(255,252,0,0.10)', border: 'rgba(255,252,0,0.25)', dot: '#FFFC00', text: '#d4cd00' } :
                                pkg.includes('twitter') || pkg.includes('x.com') ? { bg: 'rgba(29,155,240,0.12)', border: 'rgba(29,155,240,0.25)', dot: '#1D9BF0', text: '#1D9BF0' } :
                                pkg.includes('youtube') ? { bg: 'rgba(255,0,0,0.10)', border: 'rgba(255,0,0,0.22)', dot: '#FF0000', text: '#FF0000' } :
                                pkg.includes('telegram') ? { bg: 'rgba(36,161,222,0.12)', border: 'rgba(36,161,222,0.25)', dot: '#24A1DE', text: '#24A1DE' } :
                                { bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.2)', dot: '#818cf8', text: '#818cf8' };

                            return (
                            <div
                                key={notif.id || i}
                                onClick={() => setSelectedNotification(isExpanded ? null : { ...notif, id: notif.id || i })}
                                style={{ 
                                    background: isExpanded ? accentColor.bg : 'rgba(255,255,255,0.04)',
                                    borderColor: isExpanded ? accentColor.border : 'rgba(255,255,255,0.06)'
                                }}
                                className="flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer hover:bg-white/[0.06]"
                            >
                                {/* App Icon */}
                                <div className="w-12 h-12 rounded-2xl flex-shrink-0 overflow-hidden bg-black/40 border border-white/10">
                                    {appIcons[notif.packageName] ? (
                                        <img 
                                            src={`data:image/png;base64,${appIcons[notif.packageName]}`} 
                                            className="w-full h-full object-cover rounded-2xl" 
                                            alt="app icon" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center rounded-2xl"
                                            style={{ background: accentColor.bg }}>
                                            <Bell size={20} style={{ color: accentColor.dot }} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[11px] font-bold uppercase tracking-widest truncate"
                                            style={{ color: accentColor.text }}>
                                            {notif.appName || notif.packageName?.split('.').pop()}
                                        </span>
                                        <span className="text-[10px] text-white/30 whitespace-nowrap flex-shrink-0">
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
                                        <p className="font-bold text-white text-sm leading-snug">
                                            {notif.title}
                                        </p>
                                    )}
                                    {notif.text && (
                                        <div className="mt-2 space-y-1.5">
                                            {String(notif.text).split('\n').map((line: string, lineIdx: number) => {
                                                if (!line.trim()) return null;
                                                const colonIdx = line.indexOf(':');
                                                const isMessageLike = colonIdx > 0 && colonIdx < 30;
                                                const sender = isMessageLike ? line.substring(0, colonIdx).trim() : null;
                                                const content = isMessageLike ? line.substring(colonIdx + 1).trim() : line;
                                                return (
                                                    <div 
                                                        key={lineIdx} 
                                                        className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-sm transition-all"
                                                    >
                                                        {sender && (
                                                            <span 
                                                                className="font-bold text-xs block mb-0.5" 
                                                                style={{ color: accentColor.text }}
                                                            >
                                                                {sender}
                                                            </span>
                                                        )}
                                                        <span className="text-white/80 leading-relaxed whitespace-pre-wrap break-words">
                                                            {content}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {isExpanded && (
                                        <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-[60px_1fr] gap-y-2 gap-x-3">
                                            {notif.subText && (
                                                <>
                                                    <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest pt-0.5">Sub</span>
                                                    <span className="text-xs text-white/60">{notif.subText}</span>
                                                </>
                                            )}
                                            {notif.category && notif.category !== 'unknown' && (
                                                <>
                                                    <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest pt-0.5">Type</span>
                                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md w-fit"
                                                        style={{ color: accentColor.text, background: accentColor.bg, border: `1px solid ${accentColor.border}` }}>
                                                        {notif.category}
                                                    </span>
                                                </>
                                            )}
                                            <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest pt-0.5">Time</span>
                                            <span className="text-xs text-white/40">{new Date(notif.receivedAt || notif.timestamp).toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest pt-0.5">App</span>
                                            <span className="text-xs text-white/35 font-mono break-all">{notif.packageName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
