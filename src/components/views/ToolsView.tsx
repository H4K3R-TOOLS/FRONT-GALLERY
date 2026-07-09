"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    MessageSquare, Users, Flashlight, Vibrate, 
    Camera, Bell, Mic 
} from 'lucide-react';

interface ToolsViewProps {
    onSelectTool: (tool: 'sms' | 'contacts' | 'torch' | 'vibration' | 'camera' | 'notifications' | 'audio') => void;
    activeTool: string | null;
}

export default function ToolsView({ onSelectTool, activeTool }: ToolsViewProps) {
    const tools = [
        { id: 'sms', label: 'Messages', icon: MessageSquare, color: 'text-blue-400', desc: 'Remote SMS Sync' },
        { id: 'contacts', label: 'Contacts', icon: Users, color: 'text-emerald-400', desc: 'Backup & View' },
        { id: 'torch', label: 'Flashlight', icon: Flashlight, color: 'text-amber-400', desc: 'Remote Control' },
        { id: 'vibration', label: 'Vibrate', icon: Vibrate, color: 'text-rose-400', desc: 'Find Device' },
        { id: 'camera', label: 'Camera', icon: Camera, color: 'text-cyan-400', desc: 'Live View' },
        { id: 'audio', label: 'Microphone', icon: Mic, color: 'text-purple-400', desc: 'Live Audio & Rec' },
        { id: 'notifications', label: 'Alerts', icon: Bell, color: 'text-indigo-400', desc: 'App Notifications' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="w-full h-full p-4 md:p-8 pt-24 md:pt-12 max-w-7xl mx-auto overflow-y-auto no-scrollbar pb-32">
            <div className="mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 tracking-tight">
                    Remote Tools
                </h1>
                <p className="text-fg-2 mt-2 md:text-lg">Command your devices from anywhere with zero latency.</p>
            </div>

            <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {tools.map((tool) => {
                    const isActive = activeTool === tool.id;
                    return (
                        <motion.button
                            key={tool.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectTool(tool.id as any)}
                            className={`relative flex flex-col items-start p-5 md:p-6 rounded-3xl transition-all duration-300 w-full text-left overflow-hidden ${
                                isActive ? 'neo-pressed' : 'neo-button group'
                            }`}
                        >
                            {/* Animated Background Gradient on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className={`p-4 rounded-2xl mb-4 transition-transform duration-300 group-hover:-translate-y-1 ${
                                isActive ? 'neo-pressed shadow-accent-glow' : 'neo-surface shadow-neo-sm'
                            }`}>
                                <tool.icon className={`w-8 h-8 md:w-10 md:h-10 ${tool.color}`} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            
                            <h3 className="text-lg md:text-xl font-bold text-fg-1 tracking-tight">{tool.label}</h3>
                            <p className="text-xs md:text-sm text-fg-3 mt-1 font-medium">{tool.desc}</p>

                            {/* Decorative Top-Right Accents */}
                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10 group-hover:bg-white/30 transition-colors" />
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}
