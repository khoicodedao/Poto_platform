import { type NextRequest, NextResponse } from "next/server"
import { mockUsers, simulateApiDelay } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  await simulateApiDelay(1000) // Simulate network delay

  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ message: "Tất cả các trường là bắt buộc" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ message: "Email đã được sử dụng" }, { status: 409 })
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
    const response = NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar,
      },
      token: sessionToken,
      message: "Đăng ký thành công",
    })

    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Sign up error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi đăng ký" }, { status: 500 })
  }
}
