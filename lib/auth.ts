import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { db, users, sessions } from "@/db"
import { eq, and, gt, lt } from "drizzle-orm"
import crypto from "crypto"

export interface AuthUser {
  id: number
  email: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  avatar: string | null
  createdAt: Date
  updatedAt: Date
  session_id?: string
}

// Generate secure session ID
function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Create session
export async function createSession(userId: number): Promise<string> {
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  })

  return sessionId
}

// Delete session
export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

// Cleanup expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  const now = new Date()
  await db.delete(sessions).where(lt(sessions.expiresAt, now))
}

// Get current session
export async function getCurrentSession(): Promise<{ user: AuthUser } | null> {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session")?.value

    console.log("Session ID from cookie:", sessionId ? sessionId.substring(0, 10) + "..." : "none")

    if (!sessionId) {
      return null
    }

    // Get session from database and check if it's expired
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.id, sessionId),
        gt(sessions.expiresAt, new Date())
      ))
      .limit(1)

    if (!session) {
      console.log("Session not found or expired")
      // Clean up the invalid cookie
      cookieStore.delete("session")
      // Clean up any expired sessions in the background
      cleanupExpiredSessions().catch(err => console.error("Error cleaning up expired sessions:", err))
      return null
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)

    if (!user) {
      console.log("User not found for session")
      // Delete the orphaned session
      await deleteSession(sessionId)
      cookieStore.delete("session")
      return null
    }

    console.log("Found user for session:", user.name)
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }
  } catch (error) {
    console.error("Get current session error:", error)
    return null
  }
}

// Sign in
export async function signIn(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const result = await apiClient.post<{ user: AuthUser; token: string }>("/auth/signin", {
      email,
      password,
    })

    if (!result.success) {
      return { success: false, error: result.error || "Email hoặc mật khẩu không đúng" }
    }

    return {
      success: true,
      user: result.data.user,
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Có lỗi xảy ra khi đăng nhập" }
  }
}

// Sign up
export async function signUp(data: {
  email: string
  password: string
  name: string
  role: "student" | "teacher"
}): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const result = await apiClient.post<{ user: AuthUser; token: string }>("/auth/signup", data)

    if (!result.success) {
      return { success: false, error: result.error || "Đăng ký thất bại" }
    }

    return {
      success: true,
      user: result.data.user,
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "Có lỗi xảy ra khi đăng ký" }
  }
}

// Sign out
export async function signOut(): Promise<void> {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session")?.value

  if (sessionId) {
    await deleteSession(sessionId)
  }

  cookieStore.delete("session")
}

// Require auth middleware
export async function requireAuth(): Promise<AuthUser> {
  const session = await getCurrentSession()
  if (!session) {
    redirect("/auth/signin")
  }
  return session.user
}

// Redirect if authenticated
export async function redirectIfAuthenticated(): Promise<void> {
  const session = await getCurrentSession()
  if (session) {
    redirect("/")
  }
}
