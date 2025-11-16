import { type NextRequest, NextResponse } from "next/server"
import { db, users } from "@/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email và mật khẩu là bắt buộc" }, { status: 400 })
    }

    // Find user by email in database
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (!user) {
      return NextResponse.json({ message: "Email hoặc mật khẩu không đúng" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ message: "Email hoặc mật khẩu không đúng" }, { status: 401 })
    }

    // Create secure session in database
    const sessionId = await createSession(user.id)

    // Set session cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token: sessionId,
      message: "Đăng nhập thành công",
    })

    response.cookies.set("session", sessionId, {
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
