import { type NextRequest, NextResponse } from "next/server"
import { mockChatMessages, mockUsers, simulateApiDelay } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: { classId: string } }) {
  await simulateApiDelay(300)

  try {
    const classId = Number.parseInt(params.classId)
    const messages = mockChatMessages.filter((m) => m.class_id === classId)

    return NextResponse.json({
      messages,
      total: messages.length,
    })
  } catch (error) {
    console.error("Get chat messages error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi tải tin nhắn" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { classId: string } }) {
  await simulateApiDelay(400)

  try {
    const classId = Number.parseInt(params.classId)
    const { user_id, message, message_type = "text" } = await request.json()

    if (!user_id || !message) {
      return NextResponse.json({ message: "User ID và nội dung tin nhắn là bắt buộc" }, { status: 400 })
    }

    const user = mockUsers.find((u) => u.id === user_id)
    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 })
    }

    // Create new message (in real app, this would be saved to database)
    const newMessage = {
      id: Math.max(...mockChatMessages.map((m) => m.id)) + 1,
      class_id: classId,
      user_id,
      user_name: user.name,
      user_role: user.role,
      message,
      message_type,
      created_at: new Date().toISOString(),
    }

    // Add to mock data (in memory only)
    mockChatMessages.push(newMessage)

    return NextResponse.json({
      message: newMessage,
      success: true,
    })
  } catch (error) {
    console.error("Send chat message error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi gửi tin nhắn" }, { status: 500 })
  }
}
