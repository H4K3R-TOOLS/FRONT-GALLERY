"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default function GlobalGalleryRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/adminh4k3r009');
    }, [router]);

    return (
        <div className="min-h-screen bg-base text-fg-1 flex flex-col items-center justify-center p-4">
            <div className="clay-card p-8 rounded-3xl flex flex-col items-center gap-4 max-w-sm w-full text-center shadow-2xl animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 text-accent flex items-center justify-center shadow-md">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h2 className="text-base font-bold text-white">Unified Command Center</h2>
                    <p className="text-xs text-fg-2 font-mono mt-1">Redirecting to primary admin portal...</p>
                </div>
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mt-2" />
            </div>
        </div>
    );
}
