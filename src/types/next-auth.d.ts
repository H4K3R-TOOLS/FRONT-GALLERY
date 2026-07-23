import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            uuid: string
            plan?: 'basic' | 'standard' | 'premium' | 'enterprise'
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        uuid: string
        plan?: 'basic' | 'standard' | 'premium' | 'enterprise'
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        uuid: string
        plan?: 'basic' | 'standard' | 'premium' | 'enterprise'
    }
}
