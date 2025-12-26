import { NextRequest, NextResponse } from "next/server";
import {
  sendNotification,
  failNotification,
} from "@/lib/actions/notifications";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationId = parseInt(params.id);
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId));

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("[API] Error fetching notification:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationId = parseInt(params.id);
    const body = await req.json();
    const { status, errorMessage, zaloMessageId } = body;

    if (status === "sent") {
      const updated = await sendNotification(notificationId, zaloMessageId);
      return NextResponse.json(updated);
    } else if (status === "failed" && errorMessage) {
      const updated = await failNotification(notificationId, errorMessage);
      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "Invalid status or missing fields" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API] Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationId = parseInt(params.id);

    // Delete from database
    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));

    return NextResponse.json(
      { success: true, message: "Notification deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
