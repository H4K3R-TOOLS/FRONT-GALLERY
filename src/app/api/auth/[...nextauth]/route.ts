import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserRecord, registerUserRecord, syncGoogleUserRecord, verifyPassword } from "@/lib/auth-registry"

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const cleanEmail = credentials?.email?.toLowerCase().trim();
                    const password = credentials?.password;

                    if (!cleanEmail || !password) return null;

                    // ═══ LAYER 1: LOCAL REGISTRY CHECK ═══
                    const localRecord = getUserRecord(cleanEmail);

                    // Block Google-bound accounts immediately
                    if (localRecord && localRecord.provider === 'google') {
                        throw new Error("GOOGLE_ACCOUNT_ONLY");
                    }

                    // If user exists locally with a password hash, VERIFY PASSWORD LOCALLY (independent of cloud)
                    if (localRecord && localRecord.passwordHash) {
                        const isValid = await verifyPassword(cleanEmail, password);
                        if (!isValid) {
                            // Wrong password — REJECT immediately, don't even call cloud
                            return null;
                        }
                        // Password verified locally! Now get user profile from cloud
                        try {
                            const res = await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/login", {
                                method: 'POST',
                                body: JSON.stringify({ email: cleanEmail, password }),
                                headers: { "Content-Type": "application/json" }
                            });
                            if (res.ok) {
                                const user = await res.json();
                                if (user && (user.provider === 'google')) {
                                    syncGoogleUserRecord(cleanEmail, user.name);
                                    throw new Error("GOOGLE_ACCOUNT_ONLY");
                                }
                                return user;
                            }
                        } catch (e: any) {
                            if (e?.message === "GOOGLE_ACCOUNT_ONLY") throw e;
                            console.error("[NextAuth] Cloud fetch failed, using local auth:", e);
                        }
                        // Cloud failed but local password was valid — create a minimal user object
                        return { id: cleanEmail, email: cleanEmail, name: localRecord.name || cleanEmail.split('@')[0] };
                    }

                    // ═══ LAYER 2: NO LOCAL RECORD — Check cloud backend ═══
                    const res = await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/login", {
                        method: 'POST',
                        body: JSON.stringify({ email: cleanEmail, password }),
                        headers: { "Content-Type": "application/json" }
                    });

                    if (res.ok) {
                        const user = await res.json();
                        if (user) {
                            // Cloud says Google-bound? Block!
                            if (user.provider === 'google' || user.is_google === true) {
                                syncGoogleUserRecord(cleanEmail, user.name);
                                throw new Error("GOOGLE_ACCOUNT_ONLY");
                            }
                            // Cloud accepted login — save locally with password hash for future local verification
                            await registerUserRecord(cleanEmail, 'credentials', user.name || cleanEmail.split('@')[0], password);
                            return user;
                        }
                    } else {
                        // Cloud rejected — check if it's a Google account error
                        try {
                            const errorData = await res.json();
                            if (errorData?.error === 'GOOGLE_ACCOUNT_ONLY' || errorData?.provider === 'google') {
                                syncGoogleUserRecord(cleanEmail);
                                throw new Error("GOOGLE_ACCOUNT_ONLY");
                            }
                            if (errorData?.error === 'INVALID_CREDENTIALS') {
                                // Backend properly rejected — wrong password or user not found
                                return null;
                            }
                        } catch (parseErr: any) {
                            if (parseErr?.message === "GOOGLE_ACCOUNT_ONLY") throw parseErr;
                        }
                    }
                } catch (e: any) {
                    console.error("[NextAuth] Authorization error:", e);
                    if (e?.message === "GOOGLE_ACCOUNT_ONLY" || String(e).includes("GOOGLE_ACCOUNT_ONLY")) {
                        throw new Error("GOOGLE_ACCOUNT_ONLY");
                    }
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }: any) {
            if (user) {
                if (account?.provider === "google") {
                    if (user?.email) {
                        syncGoogleUserRecord(user.email, user.name);
                    }
                    try {
                        const res = await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/login", {
                            method: 'POST',
                            body: JSON.stringify({
                                email: user.email,
                                name: user.name,
                                image: user.image,
                                provider: 'google'
                            }),
                            headers: { "Content-Type": "application/json" }
                        });

                        if (res.ok) {
                            const backendUser = await res.json();
                            if (backendUser && backendUser.uuid) {
                                token.uuid = backendUser.uuid;
                                token.id = backendUser.id;
                                token.plan = backendUser.plan || 'basic';
                            }
                        }
                    } catch (e) {
                        console.error("Failed to sync google user", e);
                    }
                } else {
                    token.id = user.id;
                    token.uuid = user.uuid;
                    token.plan = (user as any).plan || 'basic';
                }
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
                session.user.uuid = token.uuid;
                session.user.plan = token.plan;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
        maxAge: 365 * 24 * 60 * 60,
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
