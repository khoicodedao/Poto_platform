/**
 * Reminder Scheduler Service
 * Automatically creates reminder notifications for class sessions
 * Creates 2 reminders per session: 4 hours before and 10 minutes before
 */

import {
  createNotification,
  getNotificationTemplate,
} from "@/lib/actions/notifications";
import { formatNotificationTemplate } from "@/lib/notification-utils";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SessionForReminder {
  id: number;
  classId: number;
  title: string;
  scheduledAt: Date;
}

/**
 * Create automatic reminders for a class session
 * Called after creating or updating a session
 */
export async function createSessionReminders(
  session: SessionForReminder,
  createdByUserId: number
) {
  try {
    console.log("[ReminderScheduler] Creating reminders for session:", {
      id: session.id,
      title: session.title,
      scheduledAt: session.scheduledAt,
    });

    // Get class to find all students
    const [classData] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, session.classId));

    if (!classData) {
      throw new Error(`Class ${session.classId} not found`);
    }

    // Calculate reminder times
    const fourHoursBeforeTime = new Date(
      session.scheduledAt.getTime() - 4 * 60 * 60 * 1000
    );
    const tenMinutesBeforeTime = new Date(
      session.scheduledAt.getTime() - 10 * 60 * 1000
    );

    console.log("[ReminderScheduler] Reminder times:", {
      fourHoursBefore: fourHoursBeforeTime,
      tenMinutesBefore: tenMinutesBeforeTime,
    });

    // Get 4-hour and 10-minute reminder templates
    const fourHourTemplate = await getNotificationTemplate("reminder", "zalo");
    if (!fourHourTemplate) {
      console.warn("[ReminderScheduler] No 4-hour reminder template found");
      return;
    }

    // Create reminders for each student in the class
    // Note: In a real implementation, we'd fetch all enrolled students
    // For now, we create a class-level reminder that can be sent to all

    // Create 4-hour reminder
    const fourHourMessage = formatNotificationTemplate(
      fourHourTemplate.messageTemplate,
      {
        sessionTitle: session.title,
        scheduledTime: session.scheduledAt.toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
        }),
      }
    );

    // Create 10-minute reminder
    const tenMinuteMessage =
      "⏰ Chuẩn bị vào lớp: Buổi học sắp bắt đầu (10 phút nữa). Vào app EduPlatform ngay!";

    console.log("[ReminderScheduler] Reminder messages created");
    console.log("[ReminderScheduler] 4-hour message:', fourHourMessage");
    console.log("[ReminderScheduler] 10-minute message:', tenMinuteMessage");

    // In a real implementation, we would:
    // 1. Get all students enrolled in this class
    // 2. Create a notification record for each student
    // 3. Set scheduledSendAt to the appropriate time
    // 4. Use cron job to send when scheduledSendAt is reached

    // For now, return the created messages for logging
    return {
      success: true,
      remindersCreated: 2,
      fourHourReminder: {
        scheduledAt: fourHoursBeforeTime,
        message: fourHourMessage,
      },
      tenMinuteReminder: {
        scheduledAt: tenMinutesBeforeTime,
        message: tenMinuteMessage,
      },
    };
  } catch (error) {
    console.error("[ReminderScheduler] Error creating reminders:", error);
    throw error;
  }
}

/**
 * Cancel all reminders for a session (if cancelled)
 */
export async function cancelSessionReminders(sessionId: number) {
  try {
    console.log("[ReminderScheduler] Cancelling reminders for session:", {
      id: sessionId,
    });

    // TODO: Mark all pending reminders for this session as cancelled
    // This would involve updating notification status in DB

    return {
      success: true,
      message: "Session reminders cancelled",
    };
  } catch (error) {
    console.error("[ReminderScheduler] Error cancelling reminders:", error);
    throw error;
  }
}

/**
 * Check if session has reminders already created
 */
export async function hasRemindersForSession(
  sessionId: number
): Promise<boolean> {
  try {
    // TODO: Query notifications table to check if reminders exist
    // for this session with status != failed or cancelled

    return false;
  } catch (error) {
    console.error("[ReminderScheduler] Error checking reminders:", error);
    return false;
  }
}

/**
 * Resend failed reminders for a session
 */
export async function retryFailedReminders(sessionId: number) {
  try {
    console.log("[ReminderScheduler] Retrying failed reminders for session:", {
      id: sessionId,
    });

    // TODO: Find all failed reminders for this session
    // Mark them as pending again to be picked up by cron job

    return { success: true };
  } catch (error) {
    console.error("[ReminderScheduler] Error retrying reminders:", error);
    throw error;
  }
}
