"use server"

import { apiClient } from "@/lib/api-client"
import { revalidatePath } from "next/cache"
import type { ChatMessage } from "@/lib/mock-data"

export async function getChatMessages(classId: number): Promise<ChatMessage[]> {
  const result = await apiClient.get<{ messages: ChatMessage[]; total: number }>(`/chat/${classId}`)
  return result.success ? result.data.messages : []
}

export async function sendChatMessage(
  classId: number,
  userId: number,
  message: string,
  messageType: "text" | "file" | "system" = "text",
) {
  try {
    const result = await apiClient.post<{ message: ChatMessage; success: boolean }>(`/chat/${classId}`, {
      user_id: userId,
      message,
      message_type: messageType,
    })

    if (result.success) {
      revalidatePath(`/classroom/${classId}`)
      return { success: true, id: result.data.message.id }
    }

    return { success: false, error: result.error || "Failed to send message" }
  } catch (error) {
    console.error("Error sending chat message:", error)
    return { success: false, error: "Failed to send message" }
  }
}
