import { NextRequest, NextResponse } from "next/server";
import {
  getAssignmentsToClose,
  closeAssignment,
} from "@/lib/actions/assignments";
import { createNotification } from "@/lib/actions/notifications";

/**
 * Cron Job: Auto-close assignments at scheduled time
 * Stops accepting submissions after deadline
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting assignment auto-close job...");

    // Get all assignments scheduled for closing
    const toClose = await getAssignmentsToClose();
    console.log("[Cron] Found assignments to close:", {
      count: toClose.length,
    });

    let closedCount = 0;
    let errorCount = 0;

    for (const assignment of toClose) {
      try {
        // Close the assignment
        await closeAssignment(assignment.id);
        closedCount++;

        console.log("[Cron] Closed assignment:", {
          id: assignment.id,
          title: assignment.title,
          classId: assignment.classId,
        });

        // Create notification for students who haven't submitted
        // TODO: Query students who haven't submitted and notify them
      } catch (error) {
        console.error("[Cron] Error closing assignment:", {
          id: assignment.id,
          error: String(error),
        });
        errorCount++;
      }
    }

    console.log("[Cron] Assignment auto-close job completed:", {
      total: toClose.length,
      closed: closedCount,
      failed: errorCount,
    });

    return NextResponse.json({
      success: true,
      processed: toClose.length,
      closed: closedCount,
      failed: errorCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Fatal error in auto-close:", error);
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
