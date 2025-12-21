// lib/authOptions.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcrypt"

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://")

// Supabase admin client for auth operations (untyped for admin_users table)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseAdmin(): ReturnType<typeof createClient<any>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Verify Turnstile token with Cloudflare
async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.error("Missing TURNSTILE_SECRET_KEY")
    return false
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    )

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("Turnstile verification error:", error)
    return false
  }
}

// Admin user type (not in generated types yet)
interface AdminUser {
  id: string
  username: string
  password_hash: string
  failed_login_attempts: number
  locked_until: string | null
  last_failed_login: string | null
  last_login: string | null
  created_at: string
  updated_at: string
}

// Check if account is locked
async function isAccountLocked(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: ReturnType<typeof createClient<any>>,
  username: string
): Promise<{ locked: boolean; remainingMinutes?: number }> {
  const { data: user } = await supabase
    .from("admin_users")
    .select("locked_until")
    .eq("username", username)
    .single()

  if (!user?.locked_until) {
    return { locked: false }
  }

  const lockTime = new Date(user.locked_until)
  const now = new Date()

  if (lockTime > now) {
    const remainingMinutes = Math.ceil((lockTime.getTime() - now.getTime()) / 60000)
    return { locked: true, remainingMinutes }
  }

  return { locked: false }
}

// Record failed login attempt
async function recordFailedLogin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: ReturnType<typeof createClient<any>>,
  username: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const maxAttempts = 5
  const lockoutMinutes = 15

  // Get current user data
  const { data: user } = await supabase
    .from("admin_users")
    .select("failed_login_attempts")
    .eq("username", username)
    .single()

  if (user) {
    const newAttempts = (user.failed_login_attempts || 0) + 1
    const shouldLock = newAttempts >= maxAttempts

    await supabase
      .from("admin_users")
      .update({
        failed_login_attempts: newAttempts,
        last_failed_login: new Date().toISOString(),
        locked_until: shouldLock
          ? new Date(Date.now() + lockoutMinutes * 60 * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("username", username)
  }

  // Log the attempt
  await supabase.from("login_attempts").insert({
    username,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    success: false,
    failure_reason: user ? "Invalid password" : "User not found",
  })
}

// Record successful login
async function recordSuccessfulLogin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: ReturnType<typeof createClient<any>>,
  username: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await supabase
    .from("admin_users")
    .update({
      failed_login_attempts: 0,
      locked_until: null,
      last_failed_login: null,
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("username", username)

  // Log the successful attempt
  await supabase.from("login_attempts").insert({
    username,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    success: true,
  })
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        // Verify Turnstile token
        if (!credentials.turnstileToken) {
          throw new Error("Security verification required")
        }

        const turnstileValid = await verifyTurnstile(credentials.turnstileToken)
        if (!turnstileValid) {
          throw new Error("Security verification failed")
        }

        const username = credentials.username.toLowerCase().trim()
        const supabase = getSupabaseAdmin()

        // Check if account is locked
        const lockStatus = await isAccountLocked(supabase, username)
        if (lockStatus.locked) {
          throw new Error(
            `Account locked. Try again in ${lockStatus.remainingMinutes} minutes.`
          )
        }

        // Get user from database
        const { data: user, error } = await supabase
          .from("admin_users")
          .select("id, username, password_hash")
          .eq("username", username)
          .single()

        if (error || !user) {
          // Record failed attempt even for non-existent users (prevents enumeration)
          await recordFailedLogin(supabase, username)
          throw new Error("Invalid credentials")
        }

        // Verify password
        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )

        if (!passwordValid) {
          await recordFailedLogin(supabase, username)
          throw new Error("Invalid credentials")
        }

        // Successful login
        await recordSuccessfulLogin(supabase, username)

        return {
          id: user.id,
          name: user.username,
          email: `${user.username}@admin.local`,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: useSecureCookies
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
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
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.username as string
      }
      return session
    },
  },
}
