import { NextResponse } from "next/server";
import {
  markAttendance,
  getSessionAttendance,
  updateCheckOutTime,
} from "@/lib/actions/class-sessions";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await markAttendance({
      sessionId: body.sessionId,
      studentId: body.studentId,
      status: body.status,
      checkInTime: body.checkInTime ? new Date(body.checkInTime) : undefined,
      notes: body.notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/attendance:", error);
    return NextResponse.json(
      { error: "Failed to mark attendance" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const result = await getSessionAttendance(parseInt(sessionId));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}
