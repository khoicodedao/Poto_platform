"use server"

import { revalidatePath } from "next/cache"
import { db, messages, users } from "@/db"
import { eq, desc, and } from "drizzle-orm"
import { requireAuth } from "@/lib/auth"

export interface SendMessageData {
  classId: number
  content: string
}

export async function getChatMessages(classId: number) {
  try {
    const messageList = await db
      .select({
        id: messages.id,
        classId: messages.classId,
        senderId: messages.senderId,
        senderName: users.name,
        senderAvatar: users.avatar,
        senderRole: users.role,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.classId, classId))
      .orderBy(messages.createdAt)

    return messageList
  } catch (error) {
    console.error("Error fetching messages:", error)
    return []
  }
}

export async function sendChatMessage(classId: number, content: string) {
  try {
    const user = await requireAuth()

    const [newMessage] = await db
      .insert(messages)
      .values({
        classId,
        senderId: user.id,
        content,
      })
      .returning()

    revalidatePath(`/classroom/${classId}`)
    return { success: true, message: newMessage }
  } catch (error) {
    console.error("Error sending message:", error)
    return { success: false, error: "Không thể gửi tin nhắn" }
  }
}

export async function deleteMessage(messageId: number) {
  try {
    const user = await requireAuth()

    // Check if user owns the message or is admin
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1)

    if (!message) {
      return { success: false, error: "Không tìm thấy tin nhắn" }
    }

    if (message.senderId !== user.id && user.role !== 'admin') {
      return { success: false, error: "Bạn không có quyền xóa tin nhắn này" }
    }

    await db.delete(messages).where(eq(messages.id, messageId))

    revalidatePath(`/classroom/${message.classId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting message:", error)
    return { success: false, error: "Không thể xóa tin nhắn" }
  }
}
