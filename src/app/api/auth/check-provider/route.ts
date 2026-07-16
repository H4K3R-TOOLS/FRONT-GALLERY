import { NextResponse } from 'next/server';
import { getUserRecord, getMongoUserRecord, syncGoogleUserRecord } from '@/lib/auth-registry';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');
        if (!email) {
            return NextResponse.json({ provider: null });
        }

        const cleanEmail = email.toLowerCase().trim();
        const localRecord = getUserRecord(cleanEmail);

        // 1. Check local registry first
        if (localRecord && localRecord.provider === 'google') {
            return NextResponse.json({ provider: 'google', record: localRecord });
        }

        // 2. Check attached MongoDB database directly if configured
        const mongoRecord = await getMongoUserRecord(cleanEmail);
        if (mongoRecord && mongoRecord.provider === 'google') {
            const synced = syncGoogleUserRecord(cleanEmail, mongoRecord.name);
            return NextResponse.json({ provider: 'google', record: synced });
        }

        // 3. Check cloud API backend directly so remote Google accounts across sessions are caught immediately
        try {
            const res = await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/login", {
                method: 'POST',
                body: JSON.stringify({ email: cleanEmail, password: 'check_only_dummy_password', provider: 'credentials' }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                const cloudUser = await res.json();
                if (cloudUser && (cloudUser.provider === 'google' || cloudUser.is_google === true || cloudUser.auth_type === 'google')) {
                    const synced = syncGoogleUserRecord(cleanEmail, cloudUser.name);
                    return NextResponse.json({ provider: 'google', record: synced });
                }
            }
        } catch (cloudErr) {
            console.error("[CheckProvider] Cloud lookup notice:", cloudErr);
        }

        return NextResponse.json({ provider: localRecord ? localRecord.provider : (mongoRecord ? mongoRecord.provider : null), record: localRecord || mongoRecord });
    } catch (e) {
        return NextResponse.json({ provider: null });
    }
}
