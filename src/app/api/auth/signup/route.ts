import { NextResponse } from 'next/server';
import { getUserRecord, registerUserRecord, syncGoogleUserRecord } from '@/lib/auth-registry';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "MISSING_FIELDS", message: "Email and password are required." }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "WEAK_PASSWORD", message: "Password must be at least 6 characters." }, { status: 400 });
        }

        const cleanEmail = email.toLowerCase().trim();
        const existing = getUserRecord(cleanEmail);

        if (existing) {
            if (existing.provider === 'google') {
                return NextResponse.json({
                    error: "GOOGLE_ACCOUNT_ONLY",
                    message: "This email is registered via Google Sign-In. Please use 'Continue with Google'."
                }, { status: 400 });
            }
            return NextResponse.json({
                error: "ALREADY_REGISTERED",
                message: "An account with this email already exists. Please switch to Sign In."
            }, { status: 400 });
        }

        // Check cloud backend for existing accounts (read-only, send only email)
        try {
            const checkRes = await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/login", {
                method: 'POST',
                body: JSON.stringify({ email: cleanEmail }),
                headers: { "Content-Type": "application/json" }
            });

            if (checkRes.ok) {
                const cloudUser = await checkRes.json();
                if (cloudUser && cloudUser.provider === 'google') {
                    syncGoogleUserRecord(cleanEmail, cloudUser.name);
                    return NextResponse.json({
                        error: "GOOGLE_ACCOUNT_ONLY",
                        message: "This email is registered via Google Sign-In. Please use 'Continue with Google'."
                    }, { status: 400 });
                }
                // If user exists on cloud with any provider, block duplicate
                if (cloudUser && cloudUser.email) {
                    // Register locally so future checks are instant
                    await registerUserRecord(cleanEmail, 'credentials', cloudUser.name || name);
                    return NextResponse.json({
                        error: "ALREADY_REGISTERED",
                        message: "An account with this email already exists. Please switch to Sign In."
                    }, { status: 400 });
                }
            }
            // 401/403/404 = user doesn't exist, proceed with registration
        } catch (cloudErr) {
            console.error("[SignUp] Cloud check notice:", cloudErr);
        }

        // Try cloud registration endpoint (new backend has /auth/register)
        try {
            await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/register", {
                method: 'POST',
                body: JSON.stringify({ email: cleanEmail, password, name, provider: 'credentials' }),
                headers: { "Content-Type": "application/json" }
            });
        } catch (e) {
            console.error("[SignUp] Cloud register notice:", e);
        }

        // Save locally WITH bcrypt password hash (this is the critical security layer)
        const record = await registerUserRecord(cleanEmail, 'credentials', name, password);

        return NextResponse.json({ ok: true, user: { email: record.email, name: record.name, provider: record.provider } }, { status: 201 });
    } catch (err) {
        console.error("[SignUp] Error:", err);
        return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to process sign-up request." }, { status: 500 });
    }
}
