import { NextResponse } from 'next/server';
import { getUserRecord, registerUserRecord } from '@/lib/auth-registry';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "MISSING_FIELDS", message: "Email and password are required." }, { status: 400 });
        }

        const cleanEmail = email.toLowerCase().trim();
        const existing = getUserRecord(cleanEmail);

        if (existing) {
            if (existing.provider === 'google') {
                return NextResponse.json({
                    error: "GOOGLE_ACCOUNT_ONLY",
                    message: "This email address is registered via Google Sign-In. Please click 'Continue with Google' above to log in securely."
                }, { status: 400 });
            }
            return NextResponse.json({
                error: "ALREADY_REGISTERED",
                message: "An account with this email address already exists. Please switch to Sign In mode and enter your password."
            }, { status: 400 });
        }

        // Try registering with external backend if endpoint exists, otherwise fallback/create local record
        try {
            await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/register", {
                method: 'POST',
                body: JSON.stringify({ email: cleanEmail, password, name, provider: 'credentials' }),
                headers: { "Content-Type": "application/json" }
            });
        } catch (backendError) {
            console.error("[SignUp] Backend registration notice:", backendError);
        }

        // Also hit login endpoint to initialize user UUID/profile on cloud backend
        try {
            await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/login", {
                method: 'POST',
                body: JSON.stringify({ email: cleanEmail, password, name, provider: 'credentials' }),
                headers: { "Content-Type": "application/json" }
            });
        } catch (e) {
            console.error("[SignUp] Backend init notice:", e);
        }

        // Save local record
        const record = registerUserRecord(cleanEmail, 'credentials', name);

        return NextResponse.json({ ok: true, user: record }, { status: 201 });
    } catch (err) {
        console.error("[SignUp] Error:", err);
        return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to process sign-up request." }, { status: 500 });
    }
}
