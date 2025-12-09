// lib/authOptions.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://")

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.password === process.env.ADMIN_PASSWORD) {
          return {
            id: "1",
            name: "Admin",
            email: "admin@example.com"
          }
        }
        return null
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: useSecureCookies ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login"
  }
}