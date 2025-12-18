import { NextResponse } from "next/server";
import {
  addStudentFeedback,
  getSessionFeedbacks,
} from "@/lib/actions/class-sessions";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await addStudentFeedback({
      sessionId: body.sessionId,
      studentId: body.studentId,
      feedbackText: body.feedbackText,
      attitudeScore: body.attitudeScore,
      participationLevel: body.participationLevel,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/student-feedback:", error);
    return NextResponse.json(
      { error: "Failed to add student feedback" },
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

    const result = await getSessionFeedbacks(parseInt(sessionId));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/student-feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch student feedback" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const id = body?.id;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const result = await removeStudentFeedback(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/student-feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete student feedback" },
      { status: 500 }
    );
  }
}
