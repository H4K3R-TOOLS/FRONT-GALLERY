import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            uuid: string
            plan?: 'basic' | 'standard' | 'premium'
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        uuid: string
        plan?: 'basic' | 'standard' | 'premium'
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        uuid: string
        plan?: 'basic' | 'standard' | 'premium'
    }
}
