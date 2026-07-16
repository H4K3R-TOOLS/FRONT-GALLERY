import { NextResponse } from 'next/server';
import { getUserRecord, syncGoogleUserRecord } from '@/lib/auth-registry';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');
        if (!email) {
            return NextResponse.json({ provider: null });
        }

        const cleanEmail = email.toLowerCase().trim();

        // 1. Check local registry first
        const record = getUserRecord(cleanEmail);
        if (record && record.provider === 'google') {
            return NextResponse.json({ provider: 'google', record });
        }

        // 2. Check cloud backend — send only email (no password, no provider) to avoid creating/modifying users
        try {
            const res = await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/login", {
                method: 'POST',
                body: JSON.stringify({ email: cleanEmail }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                const cloudUser = await res.json();
                if (cloudUser && cloudUser.provider === 'google') {
                    const synced = syncGoogleUserRecord(cleanEmail, cloudUser.name);
                    return NextResponse.json({ provider: 'google', record: synced });
                }
                // User exists with credentials provider
                return NextResponse.json({ provider: cloudUser?.provider || 'credentials', record });
            } else {
                // Backend returned error — check if it's a Google account rejection or not-found
                try {
                    const errorData = await res.json();
                    if (errorData?.error === 'GOOGLE_ACCOUNT_ONLY' || errorData?.provider === 'google') {
                        const synced = syncGoogleUserRecord(cleanEmail);
                        return NextResponse.json({ provider: 'google', record: synced });
                    }
                    // 401 = user doesn't exist, that's fine
                    if (errorData?.error === 'INVALID_CREDENTIALS') {
                        return NextResponse.json({ provider: null });
                    }
                } catch {}
            }
        } catch (cloudErr) {
            console.error("[CheckProvider] Cloud lookup error:", cloudErr);
        }

        return NextResponse.json({ provider: record ? record.provider : null, record });
    } catch (e) {
        return NextResponse.json({ provider: null });
    }
}
