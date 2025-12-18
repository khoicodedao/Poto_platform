import { NextRequest, NextResponse } from "next/server";
import {
  getPendingNotificationsToSend,
  sendNotification,
  failNotification,
} from "@/lib/actions/notifications";
import { formatNotificationTemplate } from "@/lib/notification-utils";
import { sendZaloMessage } from "@/lib/zalo-integration";
import { db } from "@/db";
import { users, classSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Cron Job: Send all pending notifications scheduled to send now
 * Called by external scheduler (e.g., Vercel Cron, GitHub Actions)
 * Authorization: CRON_SECRET header check
 */
export async function POST(req: NextRequest) {
  try {
    // Verify request is from authorized cron scheduler
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret !== process.env.CRON_SECRET) {
      console.warn("[Cron] Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting notification send job...");

    // Get all pending notifications
    const pending = await getPendingNotificationsToSend();
    console.log("[Cron] Found pending notifications:", {
      count: pending.length,
    });

    let successCount = 0;
    let failureCount = 0;

    for (const notification of pending) {
      try {
        // Format message with template variables if needed
        let messageText = notification.message;

        // If session-related notification, fetch session details for formatting
        if (notification.relatedSessionId && notification.type === "reminder") {
          const [session] = await db
            .select()
            .from(classSessions)
            .where(eq(classSessions.id, notification.relatedSessionId));

          if (session) {
            const scheduledTime = new Date(session.scheduledAt).toLocaleString(
              "vi-VN"
            );
            messageText = formatNotificationTemplate(messageText, {
              sessionTitle: session.title,
              scheduledTime,
            });
          }
        }

        // Send via appropriate channel
        if (notification.sentVia === "zalo") {
          const [recipient] = await db
            .select()
            .from(users)
            .where(eq(users.id, notification.recipientId));

          if (!recipient?.zaloUserId) {
            throw new Error("User has no Zalo ID");
          }

          try {
            const zaloMessageId = await sendZaloMessage(
              recipient.zaloUserId,
              messageText
            );
            await sendNotification(notification.id, zaloMessageId);
            successCount++;
            console.log("[Cron] Notification sent via Zalo:", {
              id: notification.id,
              zaloMessageId,
            });
          } catch (zaloError) {
            console.error("[Cron] Failed to send Zalo message:", zaloError);
            await failNotification(
              notification.id,
              `Zalo API error: ${String(zaloError)}`
            );
            failureCount++;
          }
        } else if (notification.sentVia === "email") {
          // TODO: Implement email sending via service (SendGrid, AWS SES, etc)
          console.log("[Cron] Email sending not yet implemented");
          failureCount++;
        } else {
          // App notification (mark as sent without external call)
          await sendNotification(notification.id);
          successCount++;
          console.log("[Cron] App notification marked as sent:", {
            id: notification.id,
          });
        }
      } catch (error) {
        console.error("[Cron] Error processing notification:", {
          id: notification.id,
          error: String(error),
        });
        try {
          await failNotification(notification.id, String(error));
        } catch (failError) {
          console.error(
            "[Cron] Failed to mark notification as failed:",
            failError
          );
        }
        failureCount++;
      }
    }

    console.log("[Cron] Notification send job completed:", {
      total: pending.length,
      success: successCount,
      failed: failureCount,
    });

    return NextResponse.json({
      success: true,
      processed: pending.length,
      succeeded: successCount,
      failed: failureCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Fatal error in send-reminders:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger for testing (GET request)
 * Usage: curl -H "x-cron-secret: your-secret" http://localhost:5001/api/cron/send-reminders
 */
export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Call POST handler
  return POST(req);
}
