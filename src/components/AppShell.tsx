"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Image as ImageIcon, 
    MessageSquare, 
    Users, 
    Flashlight, 
    Vibrate, 
    Camera, 
    Bell, 
    Mic, 
    Settings,
    LogOut,
    Smartphone,
    Download,
    Menu,
    X,
    ChevronDown,
    Check
} from 'lucide-react';
import PlanBadge from './PlanBadge';

interface AppShellProps {
    children: React.ReactNode;
    session: any;
    userPlan: 'basic' | 'standard' | 'premium';
    devices: any[];
    selectedDeviceId: string | null;
    setSelectedDeviceId: (id: string) => void;
    onlineDeviceCount: number;
    selectedTool: string;
    setSelectedTool: (tool: any) => void;
    onLogout: () => void;
    onOpenSettings: () => void;
    onOpenPlans: () => void;
    onOpenAppModal: () => void;
}

const tools = [
    { id: 'gallery', label: 'Gallery', icon: ImageIcon, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'sms', label: 'Messages', icon: MessageSquare, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { id: 'contacts', label: 'Contacts', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'camera', label: 'Camera', icon: Camera, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { id: 'audio', label: 'Live Audio', icon: Mic, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'notifications', label: 'Alerts', icon: Bell, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { id: 'torch', label: 'Flashlight', icon: Flashlight, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'vibration', label: 'Vibration', icon: Vibrate, color: 'text-orange-400', bg: 'bg-orange-400/10' },
];

export default function AppShell({
    children,
    session,
    userPlan,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    onlineDeviceCount,
    selectedTool,
    setSelectedTool,
    onLogout,
    onOpenSettings,
    onOpenPlans,
    onOpenAppModal
}: AppShellProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);

    const activeDevice = devices.find(d => d.deviceId === selectedDeviceId);

    const DeviceSelector = () => (
        <div className="relative w-full">
            <button 
                onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg ${activeDevice?.online ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                        <Smartphone size={16} />
                        {activeDevice?.online && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0d0f13] animate-pulse" />
                        )}
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-white truncate max-w-[100px]">
                            {activeDevice ? activeDevice.name : 'Select Device'}
                        </span>
                        <span className="text-xs text-white/40">
                            {onlineDeviceCount} Online
                        </span>
                    </div>
                </div>
                <ChevronDown size={16} className={`text-white/40 transition-transform ${isDeviceMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isDeviceMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl glass-strong border border-white/10 z-50 shadow-2xl flex flex-col gap-1"
                    >
                        {devices.length === 0 ? (
                            <div className="p-3 text-center text-sm text-white/40">No devices connected</div>
                        ) : (
                            devices.map(device => (
                                <button
                                    key={device.deviceId}
                                    onClick={() => { setSelectedDeviceId(device.deviceId); setIsDeviceMenuOpen(false); }}
                                    className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${selectedDeviceId === device.deviceId ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${device.online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
                                        <span className="text-sm text-white">{device.name}</span>
                                    </div>
                                    {selectedDeviceId === device.deviceId && <Check size={14} className="text-emerald-400" />}
                                </button>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="flex h-[100dvh] w-full bg-[#08090b] text-white overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            <aside className="hidden md:flex flex-col w-72 h-full glass-strong border-r border-white/5 z-10 p-5 flex-shrink-0">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Camera size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Gallery Eye</h1>
                        <PlanBadge plan={userPlan} onClick={onOpenPlans} />
                    </div>
                </div>

                <div className="mb-8">
                    <DeviceSelector />
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide -mx-2 px-2 pb-4">
                    <div className="text-xs font-semibold tracking-wider text-white/30 uppercase mb-3 ml-2">Tools</div>
                    <nav className="flex flex-col gap-1">
                        {tools.map(tool => {
                            const isActive = selectedTool === tool.id;
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => setSelectedTool(tool.id)}
                                    className={`group relative flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                >
                                    {isActive && (
                                        <motion.div layoutId="activeTabIndicator" className="absolute inset-0 rounded-xl bg-white/10 border border-white/10" style={{ zIndex: -1 }} />
                                    )}
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${isActive ? tool.bg : 'bg-white/5 group-hover:bg-white/10'}`}>
                                        <tool.icon size={16} className={isActive ? tool.color : 'text-white/50 group-hover:text-white'} />
                                    </div>
                                    <span className="font-medium text-sm">{tool.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="pt-4 border-t border-white/10 mt-auto flex flex-col gap-2">
                    <button onClick={onOpenAppModal} className="flex items-center gap-3 w-full p-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <Download size={18} />
                        <span className="font-medium text-sm">Download APK</span>
                    </button>
                    <button onClick={onOpenSettings} className="flex items-center gap-3 w-full p-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <Settings size={18} />
                        <span className="font-medium text-sm">Settings</span>
                    </button>
                    
                    <div className="flex items-center justify-between p-3 mt-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold text-sm">
                                {session?.user?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-sm font-medium truncate">{session?.user?.name}</span>
                        </div>
                        <button onClick={onLogout} className="p-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Camera size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-lg">Gallery Eye</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeDevice?.online ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 pt-16 md:pt-0 pb-[80px] md:pb-0">
                <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 scrollbar-hide">
                    <div className="max-w-6xl mx-auto w-full h-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedTool}
                                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                                className="w-full h-full min-h-[100dvh] md:min-h-0"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] glass-strong border-t border-white/10 z-40 px-6 pb-safe">
                <div className="flex items-center justify-between h-full max-w-md mx-auto">
                    {tools.slice(0, 4).map(tool => {
                        const isActive = selectedTool === tool.id;
                        return (
                            <button
                                key={tool.id}
                                onClick={() => setSelectedTool(tool.id)}
                                className="flex flex-col items-center justify-center gap-1 min-w-[60px]"
                            >
                                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isActive ? tool.bg : 'bg-transparent'}`}>
                                    <tool.icon size={20} className={isActive ? tool.color : 'text-white/40'} />
                                    {isActive && <motion.div layoutId="mobileTabIndicator" className="absolute -bottom-2 w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}>
                                    {tool.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="md:hidden fixed inset-0 z-50 bg-[#08090b]/80 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <span className="font-bold text-lg">All Tools & Settings</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                            <div>
                                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 ml-1">Device</h3>
                                <DeviceSelector />
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 ml-1">More Tools</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {tools.slice(4).map(tool => (
                                        <button
                                            key={tool.id}
                                            onClick={() => { setSelectedTool(tool.id); setIsMobileMenuOpen(false); }}
                                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 transition-all"
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.bg}`}>
                                                <tool.icon size={24} className={tool.color} />
                                            </div>
                                            <span className="text-sm font-medium">{tool.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-white/10">
                                <button onClick={() => { onOpenSettings(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                                    <Settings size={20} className="text-white/60" />
                                    <span className="font-medium">Settings & Permissions</span>
                                </button>
                                <button onClick={() => { onOpenAppModal(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                                    <Download size={20} className="text-white/60" />
                                    <span className="font-medium">Download App APK</span>
                                </button>
                                <button onClick={onLogout} className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 text-red-400">
                                    <LogOut size={20} />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
