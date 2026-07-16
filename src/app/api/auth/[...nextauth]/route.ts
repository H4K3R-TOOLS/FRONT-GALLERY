import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserRecord, registerUserRecord, syncGoogleUserRecord } from "@/lib/auth-registry"

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
            async authorize(credentials, req) {
                try {
                    const cleanEmail = credentials?.email?.toLowerCase().trim();
                    if (cleanEmail) {
                        const existing = getUserRecord(cleanEmail);
                        if (existing && existing.provider === 'google') {
                            throw new Error("GOOGLE_ACCOUNT_ONLY");
                        }
                    }

                    const res = await fetch("https://p01--gallery-eye--9zr85m7yb6s4.code.run/auth/login", {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" }
                    })

                    if (res.ok) {
                        const user = await res.json()
                        if (user) {
                            if (user.provider === 'google' || user.is_google === true || user.auth_type === 'google') {
                                if (cleanEmail) syncGoogleUserRecord(cleanEmail, user.name);
                                throw new Error("GOOGLE_ACCOUNT_ONLY");
                            }
                            if (cleanEmail) {
                                registerUserRecord(cleanEmail, 'credentials', user.name || cleanEmail.split('@')[0]);
                            }
                            return user;
                        }
                    } else {
                        const text = await res.text();
                        console.error(`[NextAuth] Backend error: ${text}`);
                        if (text.toLowerCase().includes("google") || text.toLowerCase().includes("oauth")) {
                            if (cleanEmail) syncGoogleUserRecord(cleanEmail);
                            throw new Error("GOOGLE_ACCOUNT_ONLY");
                        }
                    }
                } catch (e: any) {
                    console.error("[NextAuth] Authorization error:", e);
                    if (e?.message === "GOOGLE_ACCOUNT_ONLY" || String(e).includes("GOOGLE_ACCOUNT_ONLY")) {
                        throw new Error("GOOGLE_ACCOUNT_ONLY");
                    }
                }
                return null
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
                        } else {
                            const text = await res.text();
                            console.error(`[NextAuth] Backend error: ${text}`);
                        }
                    } catch (e) {
                        console.error("Failed to sync google user", e);
                    }
                } else {
                    token.id = user.id
                    token.uuid = user.uuid
                    token.plan = (user as any).plan || 'basic'
                }
            }
            return token
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id
                session.user.uuid = token.uuid
                session.user.plan = token.plan
            }
            return session
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
        maxAge: 365 * 24 * 60 * 60, // 365 Days
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
