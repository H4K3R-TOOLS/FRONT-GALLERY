import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { syncGoogleUserRecord } from "@/lib/auth-registry"

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }: any) {
            if (user && account?.provider === "google") {
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
                            token.id = backendUser.uuid;
                            token.plan = backendUser.plan || 'basic';
                        }
                    }
                } catch (e) {
                    console.error("Failed to sync google user", e);
                }
            }

            // Live plan sync every 60s
            const now = Date.now();
            const lastPlanCheck = (token.lastPlanCheck as number) || 0;
            const needsUuid = !token.uuid || token.uuid === token.email;
            if (token.email && (now - lastPlanCheck > 60000 || !token.plan || needsUuid)) {
                token.lastPlanCheck = now;
                try {
                    const planRes = await fetch(
                        `https://p01--gallery-eye--9zr85m7yb6s4.code.run/user/plan?uuid=${encodeURIComponent(token.uuid || '')}&email=${encodeURIComponent(token.email)}`,
                        { cache: 'no-store' }
                    );
                    if (planRes.ok) {
                        const planData = await planRes.json();
                        if (planData?.plan) token.plan = planData.plan.toLowerCase();
                        if (planData?.uuid && (!token.uuid || token.uuid === token.email)) {
                            token.uuid = planData.uuid;
                            token.id = planData.uuid;
                        }
                    }
                } catch (e) { /* retain token.plan */ }
            }

            if (!token.uuid) token.uuid = token.id || token.sub || token.email;
            if (!token.id) token.id = token.uuid;

            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                const resolvedId = token.uuid || token.id || token.sub || session.user.email;
                session.user.id = resolvedId;
                session.user.uuid = resolvedId;
                session.user.plan = token.plan || 'basic';
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "gallery_eye_super_secret_key_2026_fallback",
    session: {
        strategy: "jwt",
        maxAge: 365 * 24 * 60 * 60,
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
