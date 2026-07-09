"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Image as ImageIcon, 
    Wrench, 
    Smartphone, 
    Settings 
} from 'lucide-react';

interface AppNavigationProps {
    activeTab: 'gallery' | 'tools' | 'devices' | 'settings';
    setActiveTab: (tab: 'gallery' | 'tools' | 'devices' | 'settings') => void;
}

export default function AppNavigation({ activeTab, setActiveTab }: AppNavigationProps) {
    const navItems = [
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'tools', label: 'Tools', icon: Wrench },
        { id: 'devices', label: 'Devices', icon: Smartphone },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Bottom Navigation (Visible on md and smaller) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[var(--safe-bottom,80px)] min-h-[80px] bg-surface/90 backdrop-blur-xl border-t border-white/5 z-50 px-4 pb-safe flex justify-between items-center shadow-neo">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className="relative flex flex-col items-center justify-center w-full h-full pt-2"
                        >
                            <div className={`p-3 rounded-2xl transition-all duration-300 ${isActive ? 'neo-pressed text-accent' : 'text-fg-3 hover:text-fg-1'}`}>
                                <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-medium mt-1 transition-colors ${isActive ? 'text-accent' : 'text-fg-3'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div 
                                    layoutId="mobileNavIndicator"
                                    className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-accent shadow-accent-glow"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Desktop Side Navigation (Visible on md and larger) */}
            <nav className="hidden md:flex fixed top-0 left-0 bottom-0 w-[100px] flex-col items-center py-8 bg-surface/90 backdrop-blur-xl border-r border-white/5 z-50 shadow-neo">
                <div className="w-12 h-12 neo-surface flex items-center justify-center mb-12 shrink-0 shadow-accent-glow">
                    <img src="https://i.ibb.co/V0rWh957/logo-3-removebg-preview.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>

                <div className="flex flex-col gap-8 flex-1 w-full px-4">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className="relative flex flex-col items-center justify-center gap-2 group w-full"
                            >
                                <div className={`p-4 rounded-2xl transition-all duration-300 w-full flex items-center justify-center ${isActive ? 'neo-pressed text-accent' : 'neo-button text-fg-2 hover:text-fg-1'}`}>
                                    <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-xs font-semibold tracking-wide transition-colors ${isActive ? 'text-accent' : 'text-fg-3 group-hover:text-fg-1'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="desktopNavIndicator"
                                        className="absolute -left-4 w-1 h-8 rounded-r-full bg-accent shadow-accent-glow"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
