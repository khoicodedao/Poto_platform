import { NextRequest, NextResponse } from "next/server";
import {
  getAssignmentsToRelease,
  releaseAssignment,
} from "@/lib/actions/assignments";
import { createNotification } from "@/lib/actions/notifications";

/**
 * Cron Job: Auto-release assignments scheduled for now
 * Typically runs every 30 minutes Monday-Friday at 8 AM
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting assignment auto-release job...");

    // Get all assignments scheduled for release
    const toRelease = await getAssignmentsToRelease();
    console.log("[Cron] Found assignments to release:", {
      count: toRelease.length,
    });

    let releasedCount = 0;
    let errorCount = 0;

    for (const assignment of toRelease) {
      try {
        // Release the assignment
        await releaseAssignment(assignment.id);
        releasedCount++;

        // Create notification for students in the class
        // Note: In production, iterate through all students in class
        // and create individual notification records
        console.log("[Cron] Released assignment:", {
          id: assignment.id,
          title: assignment.title,
          classId: assignment.classId,
        });
      } catch (error) {
        console.error("[Cron] Error releasing assignment:", {
          id: assignment.id,
          error: String(error),
        });
        errorCount++;
      }
    }

    console.log("[Cron] Assignment auto-release job completed:", {
      total: toRelease.length,
      released: releasedCount,
      failed: errorCount,
    });

    return NextResponse.json({
      success: true,
      processed: toRelease.length,
      released: releasedCount,
      failed: errorCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Fatal error in auto-release:", error);
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
