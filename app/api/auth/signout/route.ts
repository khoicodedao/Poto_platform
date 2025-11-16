import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Get session ID from cookie
    const sessionId = request.cookies.get("session")?.value
    
    // Delete session from database if it exists
    if (sessionId) {
      await deleteSession(sessionId)
    }
    
    const response = NextResponse.json({
      message: "Đăng xuất thành công",
    })

    // Clear session cookie
    response.cookies.delete("session")

    return response
  } catch (error) {
    console.error("Sign out error:", error)
    const response = NextResponse.json({
      message: "Đăng xuất thành công",
    })
    response.cookies.delete("session")
    return response
  }
}
