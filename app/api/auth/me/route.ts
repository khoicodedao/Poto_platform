import { type NextRequest, NextResponse } from "next/server"
import { mockUsers, simulateApiDelay } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  await simulateApiDelay(300)

  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ message: "Không có phiên đăng nhập" }, { status: 401 })
    }

    // Extract user ID from session token (format: session_userId_timestamp)
    const parts = sessionToken.split("_")
    if (parts.length < 3 || parts[0] !== "session") {
      return NextResponse.json({ message: "Phiên đăng nhập không hợp lệ" }, { status: 401 })
    }

    const userId = Number.parseInt(parts[1])
    if (isNaN(userId)) {
      return NextResponse.json({ message: "Phiên đăng nhập không hợp lệ" }, { status: 401 })
    }

    const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      return NextResponse.json({ message: "Phiên đăng nhập không hợp lệ" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 })
  }
}
