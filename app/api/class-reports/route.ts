import { NextResponse } from "next/server";
import {
  createClassReport,
  getClassReports,
} from "@/lib/actions/class-sessions";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await createClassReport({
      sessionId: body.sessionId,
      summary: body.summary,
      totalStudents: body.totalStudents,
      attendanceCount: body.attendanceCount,
      keyPoints: body.keyPoints,
      nextSessionPreview: body.nextSessionPreview,
      includeFeedbacks: body.includeFeedbacks,
      sendViaZalo: body.sendViaZalo,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/class-reports:", error);
    return NextResponse.json(
      { error: "Failed to create class report" },
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

    const result = await getClassReports(parseInt(classId));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/class-reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch class reports" },
      { status: 500 }
    );
  }
}
