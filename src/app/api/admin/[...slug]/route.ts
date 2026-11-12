import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spynox.collyes2.workers.dev';
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

const verifiedAdminSet = new Set<string>();

async function checkAdminAuthorization(email: string): Promise<boolean> {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();

    if (ADMIN_EMAIL && cleanEmail === ADMIN_EMAIL) {
        return true;
    }

    if (verifiedAdminSet.has(cleanEmail)) {
        return true;
    }

    if (!ADMIN_SECRET) {
        return false;
    }

    try {
        const verifyRes = await fetch(`${BACKEND_URL}/admin/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-secret': ADMIN_SECRET,
            },
            body: JSON.stringify({ email: cleanEmail }),
        });

        if (verifyRes.ok) {
            const data = await verifyRes.json();
            if (data?.authorized) {
                verifiedAdminSet.add(cleanEmail);
                return true;
            }
        }
    } catch {
        return false;
    }

    return false;
}

async function handleProxy(request: NextRequest, { params }: { params: { slug: string[] } }) {
    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email?.trim().toLowerCase();

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
        }

        const isAuthorized = await checkAdminAuthorization(userEmail);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Forbidden: Admin access denied' }, { status: 403 });
        }

        if (!ADMIN_SECRET) {
            return NextResponse.json({ error: 'Server configuration error: ADMIN_SECRET is not configured' }, { status: 500 });
        }

        const path = (params.slug || []).join('/');
        const { search } = new URL(request.url);
        const targetUrl = `${BACKEND_URL}/admin/${path}${search}`;

        const headers: Record<string, string> = {
            'x-admin-secret': ADMIN_SECRET,
            'x-admin-email': userEmail,
        };

        const contentType = request.headers.get('content-type');
        if (contentType) {
            headers['Content-Type'] = contentType;
        }

        let body: string | undefined = undefined;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            const rawBody = await request.text();
            if (rawBody) {
                body = rawBody;
            }
        }

        const backendRes = await fetch(targetUrl, {
            method: request.method,
            headers,
            body,
        });

        const responseData = await backendRes.text();
        const responseHeaders = new Headers();
        const resContentType = backendRes.headers.get('content-type') || 'application/json';
        responseHeaders.set('Content-Type', resContentType);

        return new NextResponse(responseData, {
            status: backendRes.status,
            headers: responseHeaders,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: 'Admin proxy failure', message: err?.message || 'Unknown error' },
            { status: 502 }
        );
    }
}

export async function GET(request: NextRequest, context: { params: { slug: string[] } }) {
    return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: { slug: string[] } }) {
    return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { slug: string[] } }) {
    return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: { slug: string[] } }) {
    return handleProxy(request, context);
}
