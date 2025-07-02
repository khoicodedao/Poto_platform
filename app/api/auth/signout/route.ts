import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    message: "Đăng xuất thành công",
  })

  // Clear session cookie
  response.cookies.delete("session")

  return response
}
