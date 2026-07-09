"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, Users, Flashlight, Vibrate, 
    Camera, Bell, Mic, Smartphone, Settings, 
    LogOut, ChevronDown, Check, Zap, Crown, Image as ImageIcon, Package
} from 'lucide-react';
import Image from 'next/image';
import PlanBadge from './PlanBadge';

interface AppNavigationProps {
    devices: any[];
    selectedDeviceId: string | null;
    setSelectedDeviceId: (id: string) => void;
    selectedTool: string | null;
    setSelectedTool: (tool: string | null) => void;
    userPlan: 'basic' | 'standard' | 'premium';
    setShowPlansModal: (show: boolean) => void;
    handleSignOut: () => void;
    onOpenAppModal: () => void;
}

export default function AppNavigation({ 
    devices, selectedDeviceId, setSelectedDeviceId, selectedTool, setSelectedTool, 
    userPlan, setShowPlansModal, handleSignOut, onOpenAppModal
}: AppNavigationProps) {
    const [openDropdown, setOpenDropdown] = useState<'tools' | 'devices' | 'profile' | null>(null);
    const navRef = useRef<HTMLDivElement>(null);

    const onlineDevices = devices.filter(d => d.online);
    const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const tools = [
        { id: 'gallery', label: 'Gallery', icon: ImageIcon, color: 'text-pink-400' },
        { id: 'sms', label: 'Messages', icon: MessageSquare, color: 'text-blue-400' },
        { id: 'contacts', label: 'Contacts', icon: Users, color: 'text-emerald-400' },
        { id: 'torch', label: 'Flashlight', icon: Flashlight, color: 'text-amber-400' },
        { id: 'vibration', label: 'Vibrate', icon: Vibrate, color: 'text-rose-400' },
        { id: 'camera', label: 'Camera', icon: Camera, color: 'text-cyan-400' },
        { id: 'audio', label: 'Microphone', icon: Mic, color: 'text-purple-400' },
        { id: 'notifications', label: 'Alerts', icon: Bell, color: 'text-indigo-400' },
    ];

    const currentToolData = tools.find(t => t.id === selectedTool);
    const ToolIcon = currentToolData?.icon || Zap;
    const toolLabel = currentToolData?.label || 'Tools';

    const toggleDropdown = (menu: 'tools' | 'devices' | 'profile') => {
        setOpenDropdown(openDropdown === menu ? null : menu);
    };

    const handleSelectTool = (toolId: string) => {
        setSelectedTool(toolId);
        setOpenDropdown(null);
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } },
        exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <div ref={navRef} className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 md:px-8 pointer-events-none">
            <nav className="max-w-7xl mx-auto flex items-center justify-between glass-panel rounded-2xl p-2 px-4 shadow-neo pointer-events-auto">
                
                {/* Logo & Brand */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 neo-pressed rounded-xl flex items-center justify-center shadow-accent-glow relative overflow-hidden">
                        <img src="https://i.ibb.co/V0rWh957/logo-3-removebg-preview.png" alt="Logo" className="w-6 h-6 object-contain z-10" />
                        <div className="absolute inset-0 bg-accent/10 animate-pulse-soft" />
                    </div>
                    <span className="hidden md:block font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        Gallery Eye
                    </span>
                </div>

                {/* Navigation Items */}
                <div className="flex items-center gap-2 md:gap-3">
                    
                    {/* Tools Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => toggleDropdown('tools')}
                            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all duration-300 ${openDropdown === 'tools' || selectedTool ? 'neo-pressed text-accent' : 'neo-button text-fg-2 hover:text-fg-1'}`}
                        >
                            <ToolIcon className="w-5 h-5" />
                            <span className="hidden sm:block font-semibold text-sm">{toolLabel}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'tools' ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {openDropdown === 'tools' && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="absolute top-[120%] left-1/2 -translate-x-1/2 mt-2 w-[340px] max-w-[95vw] p-4 glass-panel rounded-3xl shadow-neo-xl border border-white/10 backdrop-blur-2xl bg-black/40"
                                >
                                    <div className="grid grid-cols-4 gap-3">
                                        {tools.map((tool) => (
                                            <button
                                                key={tool.id}
                                                onClick={() => handleSelectTool(tool.id)}
                                                className="flex flex-col items-center justify-start gap-3 p-3 rounded-2xl hover:bg-white/10 active:scale-95 transition-all group"
                                            >
                                                <div className={`w-12 h-12 rounded-2xl neo-surface flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all ${selectedTool === tool.id ? 'ring-2 ring-accent shadow-accent-glow' : ''}`}>
                                                    <tool.icon className={`w-6 h-6 ${tool.color} group-hover:scale-110 transition-transform`} />
                                                </div>
                                                <span className="text-[11px] font-medium text-fg-2 group-hover:text-fg-1 text-center leading-tight">{tool.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Devices Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => toggleDropdown('devices')}
                            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all duration-300 ${openDropdown === 'devices' ? 'neo-pressed text-accent' : 'neo-button text-fg-2 hover:text-fg-1'}`}
                        >
                            <Smartphone className="w-5 h-5" />
                            <span className="hidden sm:block font-semibold text-sm max-w-[100px] truncate">
                                {selectedDevice?.model || 'Devices'}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'devices' ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {openDropdown === 'devices' && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="absolute top-[120%] left-1/2 -translate-x-1/2 mt-2 w-[320px] max-w-[95vw] p-4 glass-panel rounded-3xl shadow-neo-xl border border-white/10 backdrop-blur-2xl bg-black/40"
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="text-xs font-bold text-fg-3 uppercase tracking-wider mb-1 px-2">Connected Devices</div>
                                        {devices.length === 0 ? (
                                            <div className="p-6 text-center text-fg-3 text-sm neo-surface rounded-2xl">No devices found in database</div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                {devices.map(device => (
                                                    <button
                                                        key={device.deviceId}
                                                        onClick={() => { setSelectedDeviceId(device.deviceId); setOpenDropdown(null); }}
                                                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all active:scale-95 ${
                                                            selectedDeviceId === device.deviceId ? 'neo-pressed ring-2 ring-accent/50' : 'neo-surface hover:bg-white/5'
                                                        }`}
                                                    >
                                                        <div className="relative">
                                                            <Smartphone className={`w-8 h-8 ${device.online ? 'text-emerald-400' : 'text-fg-4'}`} />
                                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#18191c] ${device.online ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-fg-1 truncate w-full text-center">{device.model || 'Unknown'}</span>
                                                        <span className="text-[9px] text-fg-3 uppercase">{device.online ? 'Online' : 'Offline'}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-px h-8 bg-white/10 mx-1 md:mx-2" />

                    {/* App Maker Button */}
                    <button 
                        onClick={onOpenAppModal}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl neo-button text-accent hover:text-accent-hi transition-all"
                    >
                        <Package className="w-5 h-5" />
                        <span className="hidden sm:block font-bold text-sm">Build App</span>
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => toggleDropdown('profile')}
                            className={`flex items-center justify-center w-10 h-10 md:w-auto md:px-4 py-2 rounded-xl transition-all duration-300 ${openDropdown === 'profile' ? 'neo-pressed text-accent' : 'neo-button text-fg-2 hover:text-fg-1'}`}
                        >
                            <Settings className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:block font-semibold text-sm">Account</span>
                        </button>

                        <AnimatePresence>
                            {openDropdown === 'profile' && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="absolute top-[120%] right-0 mt-1 w-56 p-3 glass-panel rounded-2xl shadow-neo-lg border border-white/10"
                                >
                                    <div className="p-3 mb-2 rounded-xl neo-surface flex flex-col items-center text-center">
                                        <div className="w-12 h-12 rounded-full neo-pressed mb-2 flex items-center justify-center shadow-accent-glow">
                                            <span className="text-xl font-bold text-accent">GE</span>
                                        </div>
                                        <PlanBadge plan={userPlan} />
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => { setShowPlansModal(true); setOpenDropdown(null); }}
                                            className="flex items-center gap-3 p-3 rounded-xl neo-surface hover:neo-pressed transition-all text-accent group"
                                        >
                                            <Crown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-bold">Upgrade Plan</span>
                                        </button>

                                        <button 
                                            onClick={() => { handleSignOut(); setOpenDropdown(null); }}
                                            className="flex items-center gap-3 p-3 rounded-xl neo-surface hover:neo-pressed transition-all text-danger group"
                                        >
                                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                            <span className="text-sm font-bold">Sign Out</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </nav>
        </div>
    );
}
