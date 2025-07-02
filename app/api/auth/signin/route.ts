import { type NextRequest, NextResponse } from "next/server"
import { mockUsers, simulateApiDelay } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  await simulateApiDelay(800) // Simulate network delay

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email và mật khẩu là bắt buộc" }, { status: 400 })
    }

    // Find user by email
    const user = mockUsers.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json({ message: "Email hoặc mật khẩu không đúng" }, { status: 401 })
    }

    // For demo purposes, accept password "123456" for all users
    if (password !== "123456") {
      return NextResponse.json({ message: "Email hoặc mật khẩu không đúng" }, { status: 401 })
    }

    // Generate mock session token
    const sessionToken = `session_${user.id}_${Date.now()}`

    // Set session cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token: sessionToken,
      message: "Đăng nhập thành công",
    })

    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi đăng nhập" }, { status: 500 })
  }
}
