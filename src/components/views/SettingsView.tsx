"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, LogOut, Check, ChevronRight } from 'lucide-react';
import PlanBadge from '../PlanBadge';

interface SettingsViewProps {
    userPlan: 'basic' | 'standard' | 'premium';
    setShowPlansModal: (show: boolean) => void;
    devices: any[];
    selectedDeviceId: string | null;
    setSelectedDeviceId: (id: string) => void;
    handleSignOut: () => void;
}

export default function SettingsView({
    userPlan, setShowPlansModal, devices, selectedDeviceId, setSelectedDeviceId, handleSignOut
}: SettingsViewProps) {
    const onlineDevices = devices.filter(d => d.online);
    const offlineDevices = devices.filter(d => !d.online);

    return (
        <div className="w-full h-full p-4 md:p-8 pt-24 md:pt-12 max-w-3xl mx-auto overflow-y-auto no-scrollbar pb-32">
            <div className="mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 tracking-tight">
                    Settings
                </h1>
                <p className="text-fg-2 mt-2 md:text-lg">Manage your devices and account.</p>
            </div>

            {/* Account Section */}
            <div className="mb-10">
                <h2 className="text-sm font-bold text-fg-3 uppercase tracking-wider mb-4 px-2">Account</h2>
                <div className="neo-surface p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-surface-3 flex items-center justify-center neo-inner shadow-accent-glow">
                            <span className="text-2xl font-bold text-accent">GE</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-fg-1">Your Profile</h3>
                                <PlanBadge plan={userPlan} />
                            </div>
                            <p className="text-sm text-fg-3 mt-1">Manage your subscription</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowPlansModal(true)}
                        className="neo-button px-6 py-3 rounded-xl text-accent font-bold hover:text-accent-hi transition-colors w-full md:w-auto"
                    >
                        Upgrade Plan
                    </button>
                </div>
            </div>

            {/* Devices Section */}
            <div className="mb-10">
                <h2 className="text-sm font-bold text-fg-3 uppercase tracking-wider mb-4 px-2">Connected Devices</h2>
                
                <div className="space-y-4">
                    {onlineDevices.length === 0 && offlineDevices.length === 0 && (
                        <div className="neo-surface p-8 text-center text-fg-3">
                            <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No devices connected yet.</p>
                            <p className="text-sm mt-2">Install the app on your phone to get started.</p>
                        </div>
                    )}

                    {onlineDevices.map(device => (
                        <motion.button
                            key={device.deviceId}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setSelectedDeviceId(device.deviceId)}
                            className={`w-full flex items-center p-5 rounded-2xl transition-all duration-300 text-left ${
                                selectedDeviceId === device.deviceId 
                                    ? 'neo-pressed border border-accent/20 shadow-accent-glow' 
                                    : 'neo-surface hover:border-white/5'
                            }`}
                        >
                            <div className={`p-3 rounded-xl mr-4 ${selectedDeviceId === device.deviceId ? 'bg-accent text-white' : 'neo-surface text-fg-2'}`}>
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-fg-1">{device.model || 'Unknown Device'}</h3>
                                <p className="text-xs text-success flex items-center mt-1">
                                    <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
                                    Online • {device.appVersion || 'App Active'}
                                </p>
                            </div>
                            {selectedDeviceId === device.deviceId ? (
                                <Check className="w-6 h-6 text-accent" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-fg-3" />
                            )}
                        </motion.button>
                    ))}

                    {offlineDevices.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <h3 className="text-xs font-semibold text-fg-3 uppercase mb-4 px-2">Offline Devices</h3>
                            {offlineDevices.map(device => (
                                <div key={device.deviceId} className="flex items-center p-4 neo-surface opacity-60 rounded-xl mb-3">
                                    <div className="p-2 neo-pressed rounded-lg mr-4">
                                        <Smartphone className="w-5 h-5 text-fg-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-fg-2">{device.model || 'Unknown Device'}</h4>
                                        <p className="text-xs text-fg-4 mt-1">Offline</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-12 pt-8 border-t border-danger/20">
                <button 
                    onClick={handleSignOut}
                    className="w-full neo-button p-4 rounded-xl flex items-center justify-center gap-3 text-danger hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold">Sign Out</span>
                </button>
            </div>
        </div>
    );
}
