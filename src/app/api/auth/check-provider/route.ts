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
        if (record && record.provider === 'credentials') {
            return NextResponse.json({ provider: 'credentials', record });
        }

        // 2. Check cloud backend using SAFE read-only /auth/check (never creates users)
        try {
            const res = await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/check", {
                method: 'POST',
                body: JSON.stringify({ email: cleanEmail }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                const data = await res.json();
                if (data?.exists && data?.provider === 'google') {
                    const synced = syncGoogleUserRecord(cleanEmail, data.name);
                    return NextResponse.json({ provider: 'google', record: synced });
                }
                if (data?.exists) {
                    return NextResponse.json({ provider: data.provider || 'credentials' });
                }
                // User doesn't exist in cloud
                return NextResponse.json({ provider: null });
            }
        } catch (cloudErr) {
            console.error("[CheckProvider] Cloud lookup error:", cloudErr);
        }

        // 3. Fallback: Try auth/login (old backend may not have /auth/check)
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
                if (cloudUser && cloudUser.email) {
                    return NextResponse.json({ provider: cloudUser.provider || 'email' });
                }
            } else {
                try {
                    const errorData = await res.json();
                    if (errorData?.error === 'GOOGLE_ACCOUNT_ONLY' || errorData?.provider === 'google') {
                        const synced = syncGoogleUserRecord(cleanEmail);
                        return NextResponse.json({ provider: 'google', record: synced });
                    }
                } catch {}
            }
        } catch {}

        return NextResponse.json({ provider: record ? record.provider : null, record });
    } catch (e) {
        return NextResponse.json({ provider: null });
    }
}
