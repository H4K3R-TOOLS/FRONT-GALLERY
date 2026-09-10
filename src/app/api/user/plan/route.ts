import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const BACKEND = 'https://p01--gallery-eye--9zr85m7yb6s4.code.run';

/**
 * GET /api/user/plan
 *
 * Returns the live plan for the authenticated session user by querying
 * the backend DB — never trusts the JWT plan field (can be stale after
 * plan upgrades/downgrades without re-login).
 *
 * Called on mount and before APK generation so the UI always reflects
 * the real tier and cannot be spoofed via localStorage, session
 * storage, devtools console, or a Chrome extension.
 */
export async function GET(_req: NextRequest) {
    const session = await getServerSession(authOptions);
    const u = (session as any)?.user;
    const identifier = u?.uuid || u?.id || u?.email;

    if (!identifier) {
        return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    try {
        const queryParam = (u?.uuid && !u.uuid.includes('@'))
            ? `uuid=${encodeURIComponent(u.uuid)}`
            : (u?.id && !u.id.includes('@'))
                ? `uuid=${encodeURIComponent(u.id)}`
                : `email=${encodeURIComponent(u?.email || identifier)}`;

        const backendRes = await fetch(
            `${BACKEND}/user/plan?${queryParam}`,
            { cache: 'no-store' }
        );

        if (!backendRes.ok) {
            return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
        }

        const data = await backendRes.json();

        return NextResponse.json({
            uuid: data.uuid || u?.uuid || identifier,
            plan: ((data.plan as string) || 'basic').toLowerCase(),
            planExpiresAt: (data.planExpiresAt as string) || null,
        });
    } catch (e) {
        console.error('[/api/user/plan] fetch failed:', e);
        return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
    }
}

