"use server";

import { revalidatePath } from "next/cache";
import { db, messages, users } from "@/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export type ChatMessage = {
  id: number;
  classId: number;
  userId: number;
  userName: string;
  userAvatar: string | null;
  userRole: string;
  message: string;
  createdAt: string;
};

export async function getChatMessages(classId: number): Promise<ChatMessage[]> {
  try {
    const rows = await db
      .select({
        id: messages.id,
        classId: messages.classId,
        senderId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
        userName: users.name,
        userAvatar: users.avatar,
        userRole: users.role,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.classId, classId))
      .orderBy(messages.createdAt);

    return rows.map((r) => ({
      id: r.id,
      classId: r.classId,
      userId: r.senderId,
      userName: r.userName ?? "Ẩn danh",
      userAvatar: r.userAvatar ?? null,
      userRole: r.userRole ?? "student",
      message: r.content,
      createdAt:
        (r.createdAt as any)?.toISOString?.() ??
        String(r.createdAt ?? new Date().toISOString()),
    }));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export async function sendChatMessage(classId: number, content: string) {
  try {
    const user = await requireAuth();

    const [inserted] = await db
      .insert(messages)
      .values({
        classId,
        senderId: user.id,
        content,
      })
      .returning();

    const message: ChatMessage = {
      id: inserted.id,
      classId: inserted.classId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userRole: user.role,
      message: inserted.content,
      createdAt:
        (inserted.createdAt as any)?.toISOString?.() ??
        String(inserted.createdAt ?? new Date().toISOString()),
    };

    revalidatePath(`/classroom/${classId}`);

    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Không thể gửi tin nhắn" as const };
  }
}

export async function deleteMessage(messageId: number) {
  try {
    const user = await requireAuth();

    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!message) {
      return { success: false, error: "Không tìm thấy tin nhắn" as const };
    }

    if (message.senderId !== user.id && user.role !== "admin") {
      return {
        success: false,
        error: "Bạn không có quyền xóa tin nhắn này" as const,
      };
    }

    await db.delete(messages).where(eq(messages.id, messageId));

    revalidatePath(`/classroom/${message.classId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { success: false, error: "Không thể xóa tin nhắn" as const };
  }
}
