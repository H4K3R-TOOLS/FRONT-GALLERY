"use client";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
    requiredPlan: 'standard' | 'premium';
}

export default function UpgradeModal({ isOpen, onClose, feature, requiredPlan }: UpgradeModalProps) {
    if (!isOpen) return null;

    const planDetails = {
        standard: {
            icon: '⭐',
            name: 'Standard',
            color: 'from-purple-500 to-blue-500',
            features: [
                '100 Photos + 50 Videos sync',
                'SMS Access',
                'Contacts Access',
                'Flashlight Control',
                'Vibration Control',
                'Hide App Icon',
                'Advanced Permissions'
            ]
        },
        premium: {
            icon: '👑',
            name: 'Premium',
            color: 'from-yellow-500 to-orange-500',
            features: [
                'Unlimited Photos & Videos',
                'All Standard Features',
                'Bulk Folder Download',
                'Cloud Backup (ZIP)',
                'Priority Support'
            ]
        }
    };

    const plan = planDetails[requiredPlan];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#1a1a1a] border border-white/20 p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 text-center">
                {/* Lock Icon */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                    🔒 {feature}
                </h2>
                <p className="text-white/60 mb-6">
                    This feature requires <span className={`font-semibold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>{plan.name}</span> plan
                </p>

                {/* Features List */}
                <div className="text-left bg-white/5 rounded-xl p-4 mb-6">
                    <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                        {plan.icon} {plan.name} includes:
                    </h3>
                    <ul className="space-y-2">
                        {plan.features.map((f, i) => (
                            <li key={i} className="text-sm text-white/60 flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Info */}
                <p className="text-xs text-white/40 mb-6">
                    Contact admin for upgrade via WhatsApp
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors"
                    >
                        Close
                    </button>
                    <a
                        href="https://wa.me/923177407478?text=I%20want%20to%20upgrade%20my%20GalleryEye%20plan"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 py-3 bg-gradient-to-r ${plan.color} rounded-xl font-semibold hover:scale-105 transition-transform`}
                    >
                        Upgrade Now
                    </a>
                </div>
            </div>
        </div>
    );
}
