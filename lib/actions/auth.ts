"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { db, users } from "@/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { createSession, deleteSession } from "@/lib/auth"

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("Sign in attempt:", { email, password: password ? "***" : "empty" })

  if (!email || !password) {
    return { success: false, error: "Vui lòng điền đầy đủ thông tin" }
  }

  try {
    // Find user by email in database
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (!user) {
      return { success: false, error: "Email hoặc mật khẩu không đúng" }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: "Email hoặc mật khẩu không đúng" }
    }

    // Create secure session in database
    const sessionId = await createSession(user.id)

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    console.log("Login successful for user:", user.email)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Có lỗi xảy ra khi đăng nhập" }
  }
}

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const name = formData.get("name") as string
  const role = formData.get("role") as "student" | "teacher"

  if (!email || !password || !name || !role) {
    return { success: false, error: "Vui lòng điền đầy đủ thông tin" }
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Mật khẩu xác nhận không khớp" }
  }

  if (password.length < 6) {
    return { success: false, error: "Mật khẩu phải có ít nhất 6 ký tự" }
  }

  try {
    // Check if email already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingUser) {
      return { success: false, error: "Email đã được sử dụng" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user in database
    const [newUser] = await db.insert(users).values({
      email,
      name,
      password: hashedPassword,
      role: role as "student" | "teacher",
      avatar: null,
    }).returning()

    // Create secure session in database
    const sessionId = await createSession(newUser.id)

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    console.log("Signup successful for user:", newUser.email)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "Có lỗi xảy ra khi đăng ký" }
  }
}

export async function signOutAction() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session")?.value
    
    // Delete session from database if it exists
    if (sessionId) {
      await deleteSession(sessionId)
    }
    
    // Delete session cookie
    cookieStore.delete("session")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return { success: false, error: "Có lỗi xảy ra khi đăng xuất" }
  }
}
