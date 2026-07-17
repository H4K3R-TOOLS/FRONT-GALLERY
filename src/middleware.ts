
import { withAuth } from "next-auth/middleware";

export default withAuth({
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "gallery_eye_super_secret_key_2026_fallback",
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"]
};
