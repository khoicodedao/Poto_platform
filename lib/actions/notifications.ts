"use server";

import { db } from "@/db";
import {
  notifications,
  notificationTemplates,
  classSessions,
  users,
} from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { eq, and, lte, isNull, desc, inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface NotificationInput {
  type: "reminder" | "report" | "assignment" | "attendance" | "general";
  title: string;
  message: string;
  recipientId: number;
  classId: number;
  relatedSessionId?: number;
  relatedAssignmentId?: number;
  sentVia?: "app" | "zalo" | "email";
  scheduledSendAt?: Date;
  imageUrl?: string; // Image attachment URL
}

/**
 * Create a new notification record
 */
export async function createNotification(input: NotificationInput) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const [notification] = await db
      .insert(notifications)
      .values({
        type: input.type,
        title: input.title,
        message: input.message,
        recipientId: input.recipientId,
        classId: input.classId,
        relatedSessionId: input.relatedSessionId,
        relatedAssignmentId: input.relatedAssignmentId,
        sentVia: input.sentVia || "app",
        scheduledSendAt: input.scheduledSendAt,
        status: input.scheduledSendAt ? "pending" : "pending",
        imageUrl: input.imageUrl,
      })
      .returning();

    console.log("[Notification] Created notification", {
      id: notification?.id,
      type: input.type,
      recipient: input.recipientId,
    });

    return notification;
  } catch (error) {
    console.error("[Notification] Error creating notification:", error);
    throw error;
  }
}

/**
 * Send notification now (mark as sent and integrate with Zalo)
 */
export async function sendNotification(
  notificationId: number,
  zaloMessageId?: string
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const [updated] = await db
      .update(notifications)
      .set({
        status: "sent",
        sentAt: new Date(),
        zaloMessageId: zaloMessageId,
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    console.log("[Notification] Sent notification", {
      id: notificationId,
      zaloId: zaloMessageId,
    });

    return updated;
  } catch (error) {
    console.error("[Notification] Error sending notification:", error);
    throw error;
  }
}

/**
 * Mark notification as failed with error message
 */
export async function failNotification(
  notificationId: number,
  errorMessage: string
) {
  try {
    const [updated] = await db
      .update(notifications)
      .set({
        status: "failed",
        errorMessage: errorMessage,
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    console.error("[Notification] Marked as failed", {
      id: notificationId,
      error: errorMessage,
    });

    return updated;
  } catch (error) {
    console.error("[Notification] Error failing notification:", error);
    throw error;
  }
}

/**
 * Get all notifications for a user (paginated)
 */
export async function getUserNotifications(
  userId: number,
  limit = 20,
  offset = 0
) {
  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(notifications)
      .where(eq(notifications.recipientId, userId));

    return {
      data: userNotifications,
      total: countResult.count,
      limit,
      offset,
    };
  } catch (error) {
    console.error("[Notification] Error fetching user notifications:", error);
    throw error;
  }
}

/**
 * Get pending notifications scheduled to send (for cron job)
 */
export async function getPendingNotificationsToSend() {
  try {
    const now = new Date();

    const pending = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.status, "pending"),
          lte(notifications.scheduledSendAt, now)
        )
      )
      .orderBy(notifications.scheduledSendAt)
      .limit(100);

    console.log("[Notification] Found pending notifications to send:", {
      count: pending.length,
    });

    return pending;
  } catch (error) {
    console.error(
      "[Notification] Error fetching pending notifications:",
      error
    );
    throw error;
  }
}

/**
 * Get failed notifications for retry (not sent in last 1 hour)
 */
export async function getFailedNotificationsForRetry() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const failed = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.status, "failed"),
          lte(notifications.createdAt, oneHourAgo)
        )
      )
      .orderBy(notifications.createdAt)
      .limit(50);

    console.log("[Notification] Found failed notifications to retry:", {
      count: failed.length,
    });

    return failed;
  } catch (error) {
    console.error("[Notification] Error fetching failed notifications:", error);
    throw error;
  }
}

/**
 * Get notification template by type and channel
 */
export async function getNotificationTemplate(
  type: string,
  channel: "app" | "zalo" | "email" = "zalo"
) {
  try {
    const [template] = await db
      .select()
      .from(notificationTemplates)
      .where(
        and(
          eq(notificationTemplates.type, type as any),
          eq(notificationTemplates.channel, channel),
          eq(notificationTemplates.isActive, true)
        )
      )
      .limit(1);

    return template;
  } catch (error) {
    console.error("[Notification] Error fetching template:", error);
    throw error;
  }
}

/**
 * Insert default notification templates (if not exist)
 */
export async function insertNotificationTemplates() {
  try {
    // Check if templates already exist
    const existing = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(notificationTemplates);

    if (existing[0].count > 0) {
      console.log("[Notification] Templates already exist, skipping insert");
      return { message: "Templates already exist" };
    }

    const defaultTemplates = [
      // Reminder templates
      {
        type: "reminder",
        name: "4 hours before class",
        titleTemplate: "🎓 Nhắc lịch học",
        messageTemplate:
          'Buổi học "{sessionTitle}" sẽ bắt đầu lúc {scheduledTime}. Các em hãy chuẩn bị kỹ!',
        channel: "zalo",
        isActive: true,
      },
      {
        type: "reminder",
        name: "10 minutes before class",
        titleTemplate: "⏰ Chuẩn bị vào lớp",
        messageTemplate:
          "Buổi học sắp bắt đầu (10 phút nữa). Vào app EduPlatform ngay!",
        channel: "zalo",
        isActive: true,
      },

      // Report template
      {
        type: "report",
        name: "Class session report",
        titleTemplate: "📊 Báo cáo buổi học",
        messageTemplate:
          "Báo cáo buổi học {sessionTitle}:\n- Học sinh có mặt: {attendanceCount}/{totalStudents}\n- Nội dung: {summary}\n\nChi tiết: {reportLink}",
        channel: "zalo",
        isActive: true,
      },

      // Assignment templates
      {
        type: "assignment",
        name: "Assignment released",
        titleTemplate: "📝 Bài tập tuần này",
        messageTemplate:
          'Bài tập "{assignmentTitle}" đã được giao.\nHạn nộp: {dueDate}\nChi tiết: {assignmentLink}',
        channel: "zalo",
        isActive: true,
      },
      {
        type: "assignment",
        name: "Assignment reminder 1 day",
        titleTemplate: "⏰ Nhắc nộp bài tập",
        messageTemplate:
          'Nhắc nhở: Còn 1 ngày để nộp bài "{assignmentTitle}".\nHạn nộp: {dueDate}\nNộp ngay: {assignmentLink}',
        channel: "zalo",
        isActive: true,
      },

      // Attendance template
      {
        type: "attendance",
        name: "Attendance reminder",
        titleTemplate: "📋 Nhắc điểm danh",
        messageTemplate:
          "Học sinh chưa vào lớp. Liên hệ ngay với phụ huynh để hỗ trợ.",
        channel: "app",
        isActive: true,
      },
    ];

    // Insert all templates
    for (const template of defaultTemplates) {
      await db.insert(notificationTemplates).values(template as any);
    }

    console.log("[Notification] Inserted default templates:", {
      count: defaultTemplates.length,
    });

    return { inserted: defaultTemplates.length };
  } catch (error) {
    console.error("[Notification] Error inserting templates:", error);
    throw error;
  }
}

/**
 * Get unread notification count for user
 */
export async function getUnreadNotificationCount(userId: number) {
  try {
    const [result] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, userId),
          eq(notifications.status, "sent")
        )
      );

    return result?.count || 0;
  } catch (error) {
    console.error("[Notification] Error getting unread count:", error);
    return 0;
  }
}
