"use client";

import { Check, X, Zap, Shield } from 'lucide-react';

interface PlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: 'basic' | 'standard';
    userEmail: string;
    userUuid: string;
}

const FREE_FEATURES = [
    { text: '50 Photos Sync', included: true },
    { text: 'Gallery Viewer', included: true },
    { text: '1 Device', included: true },
    { text: 'Video Sync', included: false },
    { text: 'Camera & Microphone', included: false },
    { text: 'SMS & Contacts', included: false },
    { text: 'Notification Reader', included: false },
    { text: 'Torch & Vibration', included: false },
    { text: 'ZIP Download', included: false },
    { text: 'Bulk Download', included: false },
    { text: 'Hide App Icon', included: false },
];

const STANDARD_FEATURES = [
    { text: 'Unlimited Photos & Videos', included: true },
    { text: 'All Tools Unlocked', included: true },
    { text: 'Up to 10 Devices', included: true },
    { text: 'Camera & Microphone', included: true },
    { text: 'SMS & Contacts Sync', included: true },
    { text: 'Notification Reader', included: true },
    { text: 'Torch & Vibration', included: true },
    { text: 'ZIP & Bulk Download', included: true },
    { text: 'Hide App Icon', included: true },
    { text: 'All Permissions Unlocked', included: true },
    { text: 'Priority Support', included: true },
];

export default function PlansModal({ isOpen, onClose, currentPlan, userEmail, userUuid }: PlansModalProps) {
    if (!isOpen) return null;

    const isStandard = currentPlan === 'standard' || (currentPlan as string) === 'premium';

    const getWhatsAppLink = () => {
        const msg = `🔐 *Plan Upgrade Request*\n\n📧 Email: ${userEmail}\n🆔 UUID: ${userUuid}\n📋 Plan: Standard ($5/year)\n\nI'd like to upgrade my Gallery Eye account to the Standard plan. Please process my request. 🙏`;
        return `https://wa.me/923460257488?text=${encodeURIComponent(msg)}`;
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn" onClick={onClose}>
            <div
                className="w-full max-w-2xl mx-auto bg-[#131417] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Choose Your Plan</h2>
                        <p className="text-sm text-white/50 mt-1">Unlock the full power of Gallery Eye</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Free Plan */}
                    <div className={`rounded-2xl border p-5 ${!isStandard ? 'border-white/20 bg-white/5' : 'border-white/5 bg-white/[0.02]'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#4d5a72]/20 border border-[#4d5a72]/30 flex items-center justify-center">
                                <Shield size={20} className="text-[#4d5a72]" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Free</h3>
                                <p className="text-xs text-white/40">Basic access</p>
                            </div>
                            {!isStandard && (
                                <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black tracking-wider">ACTIVE</span>
                            )}
                        </div>

                        <div className="mb-4">
                            <span className="text-2xl font-black text-white">$0</span>
                            <span className="text-xs text-white/40 ml-1">forever</span>
                        </div>

                        <div className="space-y-2.5">
                            {FREE_FEATURES.map((f, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    {f.included ? (
                                        <Check size={14} className="text-emerald-400 flex-shrink-0" />
                                    ) : (
                                        <X size={14} className="text-white/20 flex-shrink-0" />
                                    )}
                                    <span className={`text-xs ${f.included ? 'text-white/70' : 'text-white/25'}`}>{f.text}</span>
                                </div>
                            ))}
                        </div>

                        {!isStandard && (
                            <div className="mt-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-xs font-bold text-white/40">
                                Current Plan
                            </div>
                        )}
                    </div>

                    {/* Standard Plan */}
                    <div className={`rounded-2xl border p-5 relative overflow-hidden ${isStandard ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-500/20 bg-emerald-500/[0.03]'}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="flex items-center gap-3 mb-4 relative">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                <Zap size={20} className="text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Standard</h3>
                                <p className="text-xs text-emerald-400/60">Full access</p>
                            </div>
                            {isStandard && (
                                <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black tracking-wider animate-pulse">ACTIVE</span>
                            )}
                        </div>

                        <div className="mb-4 relative">
                            <span className="text-2xl font-black text-white">$5</span>
                            <span className="text-xs text-white/40 ml-1">/ year</span>
                        </div>

                        <div className="space-y-2.5 relative">
                            {STANDARD_FEATURES.map((f, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                                    <span className="text-xs text-white/70">{f.text}</span>
                                </div>
                            ))}
                        </div>

                        {isStandard ? (
                            <div className="mt-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-bold text-emerald-400">
                                ✨ Active Plan
                            </div>
                        ) : (
                            <a
                                href={getWhatsAppLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mt-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-center text-sm font-bold text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                            >
                                ⚡ Upgrade to Standard
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
