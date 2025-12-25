import { NextResponse } from "next/server";
import {
  createClassSession,
  getClassSessions,
  updateClassSession,
  deleteClassSession,
} from "@/lib/actions/class-sessions";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await createClassSession({
      classId: body.classId,
      title: body.title,
      description: body.description,
      scheduledAt: new Date(body.scheduledAt),
      durationMinutes: body.durationMinutes || 60,
      sessionNumber: body.sessionNumber,
      guestTeacherId: body.guestTeacherId || null,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/class-sessions:", error);
    return NextResponse.json(
      { error: "Failed to create class session" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "classId is required" },
        { status: 400 }
      );
    }

    const result = await getClassSessions(parseInt(classId));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/class-sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch class sessions" },
      { status: 500 }
    );
  }
}
