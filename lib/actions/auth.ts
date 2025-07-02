"use server"

import { revalidatePath } from "next/cache"
import { mockUsers, simulateApiDelay } from "@/lib/mock-data"
import { cookies } from "next/headers"

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("Sign in attempt:", { email, password: password ? "***" : "empty" })

  if (!email || !password) {
    return { success: false, error: "Vui lòng điền đầy đủ thông tin" }
  }

  // Simulate API delay
  await simulateApiDelay(800)

  try {
    // Find user by email
    const user = mockUsers.find((u) => u.email === email)

    if (!user) {
      return { success: false, error: "Email hoặc mật khẩu không đúng" }
    }

    // For demo purposes, accept password "123456" for all users
    if (password !== "123456") {
      return { success: false, error: "Email hoặc mật khẩu không đúng" }
    }

    // Generate mock session token
    const sessionToken = `session_${user.id}_${Date.now()}`

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set("session", sessionToken, {
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

  // Simulate API delay
  await simulateApiDelay(1000)

  try {
    // Check if email already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      return { success: false, error: "Email đã được sử dụng" }
    }

    // Create new user (in real app, this would be saved to database)
    const newUser = {
      id: Math.max(...mockUsers.map((u) => u.id)) + 1,
      email,
      name,
      role: role as "student" | "teacher",
      avatar: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add to mock data (in memory only)
    mockUsers.push(newUser)

    // Generate mock session token
    const sessionToken = `session_${newUser.id}_${Date.now()}`

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set("session", sessionToken, {
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
    cookieStore.delete("session")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return { success: false, error: "Có lỗi xảy ra khi đăng xuất" }
  }
}
