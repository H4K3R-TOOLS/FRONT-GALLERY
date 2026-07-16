import { NextResponse } from 'next/server';
import { getUserRecord, registerUserRecord, syncGoogleUserRecord } from '@/lib/auth-registry';

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

        // Register via the dedicated cloud /auth/register endpoint (with bcrypt password hashing)
        try {
            const registerRes = await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/register", {
                method: 'POST',
                body: JSON.stringify({ email: cleanEmail, password, name, provider: 'credentials' }),
                headers: { "Content-Type": "application/json" }
            });

            const registerData = await registerRes.json();

            if (!registerRes.ok) {
                if (registerData?.error === 'GOOGLE_ACCOUNT_ONLY') {
                    syncGoogleUserRecord(cleanEmail, registerData.name);
                    return NextResponse.json({
                        error: "GOOGLE_ACCOUNT_ONLY",
                        message: "This email address is registered via Google Sign-In. Please click 'Continue with Google' above to log in securely."
                    }, { status: 400 });
                }
                if (registerData?.error === 'ALREADY_REGISTERED') {
                    return NextResponse.json({
                        error: "ALREADY_REGISTERED",
                        message: registerData.message || "An account with this email already exists."
                    }, { status: 400 });
                }
                return NextResponse.json({
                    error: registerData?.error || "REGISTRATION_FAILED",
                    message: registerData?.message || "Failed to create account on server."
                }, { status: registerRes.status });
            }

            // Save local credentials record
            registerUserRecord(cleanEmail, 'credentials', name);

            return NextResponse.json({ ok: true, user: registerData }, { status: 201 });
        } catch (cloudErr) {
            console.error("[SignUp] Cloud registration error:", cloudErr);
            return NextResponse.json({ error: "NETWORK_ERROR", message: "Could not connect to authentication server." }, { status: 503 });
        }
    } catch (err) {
        console.error("[SignUp] Error:", err);
        return NextResponse.json({ error: "INTERNAL_ERROR", message: "Failed to process sign-up request." }, { status: 500 });
    }
}
