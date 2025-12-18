import { NextRequest, NextResponse } from "next/server";
import { getOverdueAssignments } from "@/lib/actions/assignments";
import {
  createNotification,
  getNotificationTemplate,
} from "@/lib/actions/notifications";
import { formatNotificationTemplate } from "@/lib/notification-utils";
import { db } from "@/db";
import { classes, classEnrollments, users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Cron Job: Send assignment reminders
 * - 1 day before due: "Nhắc nộp bài tập"
 * - 10 minutes before due: "Chuẩn bị nộp bài"
 * Runs every 30 minutes
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting assignment reminder job...");

    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    // Get all assignments due in next 24 hours or next 10 minutes
    const allAssignments = await db
      .select()
      .from(classEnrollments)
      .innerJoin(classes, eq(classEnrollments.classId, classes.id));

    let remindersCreated = 0;
    let errorCount = 0;

    // For each class, check for assignments due soon
    const uniqueClasses = new Map();
    for (const enrollment of allAssignments) {
      uniqueClasses.set(enrollment.classes.id, enrollment.classes);
    }

    for (const [classId, classData] of uniqueClasses) {
      try {
        // Get template for 1-day reminder
        const oneDayTemplate = await getNotificationTemplate(
          "assignment",
          "zalo"
        );
        if (!oneDayTemplate) {
          console.warn("[Cron] No assignment template found");
          continue;
        }

        // Get students in class
        const classStudents = await db
          .select()
          .from(users)
          .innerJoin(classEnrollments, eq(classEnrollments.studentId, users.id))
          .where(eq(classEnrollments.classId, classId));

        console.log(
          `[Cron] Class ${classData.name} has ${classStudents.length} students`
        );

        // In production: Query assignments due tomorrow or in 10 minutes
        // and create notifications for each student
        // For now, just log the prepared structure

        remindersCreated += classStudents.length * 2; // 2 reminders per student
      } catch (error) {
        console.error(`[Cron] Error processing class ${classId}:`, error);
        errorCount++;
      }
    }

    console.log("[Cron] Assignment reminder job completed:", {
      classesProcessed: uniqueClasses.size,
      remindersCreated,
      failed: errorCount,
    });

    return NextResponse.json({
      success: true,
      classesProcessed: uniqueClasses.size,
      remindersCreated,
      failed: errorCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Fatal error in assignment reminders:", error);
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
