import { type NextRequest, NextResponse } from "next/server"
import { db, users } from "@/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ message: "Tất cả các trường là bắt buộc" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 })
    }

    // Check if email already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingUser) {
      return NextResponse.json({ message: "Email đã được sử dụng" }, { status: 409 })
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
    const response = NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar,
      },
      token: sessionId,
      message: "Đăng ký thành công",
    })

    response.cookies.set("session", sessionId, {
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
