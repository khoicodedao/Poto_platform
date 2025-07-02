import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { User } from "@/lib/mock-data"
import { mockUsers } from "@/lib/mock-data"

export interface Session {
  id: string
  user_id: number
  expires_at: string
  created_at: string
}

export interface AuthUser extends User {
  session_id?: string
}

// In-memory sessions storage
const sessions = new Map<string, Session>()

// Generate session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
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

  const session: Session = {
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  }

  sessions.set(sessionId, session)
  return sessionId
}

// Delete session
export async function deleteSession(sessionId: string): Promise<void> {
  sessions.delete(sessionId)
}

// Get current session
export async function getCurrentSession(): Promise<{ user: AuthUser } | null> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session")?.value

    console.log("Session token from cookie:", sessionToken)

    if (!sessionToken) {
      return null
    }

    // Extract user ID from session token (format: session_userId_timestamp)
    const parts = sessionToken.split("_")
    if (parts.length < 3 || parts[0] !== "session") {
      console.log("Invalid session token format:", sessionToken)
      return null
    }

    const userId = Number.parseInt(parts[1])
    if (isNaN(userId)) {
      console.log("Invalid user ID in session token:", parts[1])
      return null
    }

    // Get user from mock data
    const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      console.log("User not found for ID:", userId)
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
        created_at: user.created_at,
        updated_at: user.updated_at,
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
