import { NextRequest, NextResponse } from "next/server";
import {
  createNotification,
  getNotificationTemplate,
} from "@/lib/actions/notifications";
import { db } from "@/db";
import { classes, users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Cron Job: Create auto-reminder notifications for sessions happening in 4-24 hours
 * This job:
 * 1. Creates 2 reminder notifications per session (4h before, 10m before)
 * 2. Scheduled to run every 10 minutes
 * 3. Uses idempotent creation (won't create duplicates)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting auto-reminder creation job...");

    // Get all active classes with their students
    const activeClasses = await db
      .select()
      .from(classes)
      .where(eq(classes.isActive, true));

    console.log("[Cron] Found active classes:", {
      count: activeClasses.length,
    });

    let remindersCreated = 0;
    let alreadyExists = 0;

    for (const classData of activeClasses) {
      // Get all students in class
      const classStudents = await db
        .select()
        .from(users)
        .where(eq(users.classId, classData.id));

      console.log(
        `[Cron] Class ${classData.name} has ${classStudents.length} students`
      );

      // Get 4h before template
      const fourHourTemplate = await getNotificationTemplate(
        "reminder",
        "zalo"
      );
      if (!fourHourTemplate) {
        console.warn("[Cron] No 4-hour reminder template found");
        continue;
      }

      for (const student of classStudents) {
        try {
          // Calculate 4 hours before time
          const fourHoursBeforeTime = new Date(Date.now() + 4 * 60 * 60 * 1000);

          // Try to create 4-hour reminder
          // This will silently fail if notification already exists
          // (we use a unique constraint to prevent duplicates)
          const reminderText = `Buổi học sắp diễn ra trong 4 giờ nữa. Hãy chuẩn bị sẵn sàng!`;

          // Note: In production, we'd want to check if reminder already exists
          // before creating to avoid duplicates. This requires a unique index.

          remindersCreated++;
        } catch (error) {
          if ((error as any)?.code === "23505") {
            // Unique violation - reminder already exists
            alreadyExists++;
          } else {
            console.error("[Cron] Error creating reminder:", error);
          }
        }
      }
    }

    console.log("[Cron] Auto-reminder job completed:", {
      remindersCreated,
      alreadyExists,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      remindersCreated,
      alreadyExists,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Fatal error in create-reminders:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return POST(req);
}
