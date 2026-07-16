import { NextResponse } from 'next/server';
import { getUserRecord } from '@/lib/auth-registry';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');
        if (!email) {
            return NextResponse.json({ provider: null });
        }

        const record = getUserRecord(email);
        return NextResponse.json({ provider: record ? record.provider : null, record });
    } catch (e) {
        return NextResponse.json({ provider: null });
    }
}
