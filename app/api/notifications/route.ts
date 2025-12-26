import { NextRequest, NextResponse } from "next/server";
import {
  createNotification,
  getUserNotifications,
} from "@/lib/actions/notifications";
import { getClassStudentsForAttendance } from "@/lib/actions/class-sessions";
import { getCurrentSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      title,
      message,
      recipientId,
      classId,
      relatedSessionId,
      relatedAssignmentId,
      sentVia,
      scheduledSendAt,
      imageUrl,
    } = body;

    // Basic validation for required fields
    if (!type || !title || !message || !classId) {
      return NextResponse.json(
        { error: "Missing required fields (type/title/message/classId)" },
        { status: 400 }
      );
    }

    // If recipientId provided, create single notification
    if (recipientId) {
      const notification = await createNotification({
        type,
        title,
        message,
        recipientId,
        classId,
        relatedSessionId,
        relatedAssignmentId,
        sentVia,
        imageUrl,
        scheduledSendAt: scheduledSendAt
          ? new Date(scheduledSendAt)
          : undefined,
      });
      return NextResponse.json(notification, { status: 201 });
    }

    // No recipientId: create notifications for all students in the class
    const studentsRes = await getClassStudentsForAttendance(classId);
    if (
      !studentsRes ||
      !studentsRes.success ||
      !Array.isArray(studentsRes.data) ||
      studentsRes.data.length === 0
    ) {
      return NextResponse.json(
        { error: "No recipients found for class" },
        { status: 400 }
      );
    }

    const created = [] as any[];
    for (const s of studentsRes.data) {
      const studentId = (s as any).studentId ?? (s as any).id ?? null;
      if (!studentId) continue;
      // createNotification will check session again; that's fine in server context
      const n = await createNotification({
        type,
        title,
        message,
        recipientId: studentId,
        classId,
        relatedSessionId,
        relatedAssignmentId,
        sentVia,
        imageUrl,
        scheduledSendAt: scheduledSendAt
          ? new Date(scheduledSendAt)
          : undefined,
      });
      created.push(n);
    }

    return NextResponse.json(
      { success: true, createdCount: created.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

    const result = await getUserNotifications(session.user.id, limit, offset);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
