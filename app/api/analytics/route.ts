import { NextRequest, NextResponse } from "next/server";
import {
  getStudentPerformanceStats,
  getClassPerformanceStats,
  getTopStudents,
  getStudentsNeedingAttention,
  getAssignmentPerformance,
  getSubmissionTimeline,
  getAttendanceTrends,
  getPlatformStats,
  getClassParticipationMetrics,
} from "@/lib/actions/analytics";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get("type");
    const classId = parseInt(req.nextUrl.searchParams.get("classId") || "0");
    const studentId = parseInt(
      req.nextUrl.searchParams.get("studentId") || "0"
    );
    const assignmentId = parseInt(
      req.nextUrl.searchParams.get("assignmentId") || "0"
    );
    const days = parseInt(req.nextUrl.searchParams.get("days") || "30");

    switch (type) {
      case "student-performance":
        if (!classId || !studentId) {
          return NextResponse.json(
            { error: "Missing classId or studentId" },
            { status: 400 }
          );
        }
        const studentStats = await getStudentPerformanceStats(
          classId,
          studentId
        );
        return NextResponse.json(studentStats);

      case "class-performance":
        if (!classId) {
          return NextResponse.json(
            { error: "Missing classId" },
            { status: 400 }
          );
        }
        const classStats = await getClassPerformanceStats(classId);
        return NextResponse.json(classStats);

      case "top-students":
        if (!classId) {
          return NextResponse.json(
            { error: "Missing classId" },
            { status: 400 }
          );
        }
        const topStudents = await getTopStudents(classId);
        return NextResponse.json(topStudents);

      case "students-needing-attention":
        if (!classId) {
          return NextResponse.json(
            { error: "Missing classId" },
            { status: 400 }
          );
        }
        const atRiskStudents = await getStudentsNeedingAttention(classId);
        return NextResponse.json(atRiskStudents);

      case "assignment-performance":
        if (!assignmentId) {
          return NextResponse.json(
            { error: "Missing assignmentId" },
            { status: 400 }
          );
        }
        const assignmentStats = await getAssignmentPerformance(assignmentId);
        return NextResponse.json(assignmentStats);

      case "submission-timeline":
        if (!classId) {
          return NextResponse.json(
            { error: "Missing classId" },
            { status: 400 }
          );
        }
        const timeline = await getSubmissionTimeline(classId, days);
        return NextResponse.json(timeline);

      case "attendance-trends":
        if (!classId) {
          return NextResponse.json(
            { error: "Missing classId" },
            { status: 400 }
          );
        }
        const attendanceTrends = await getAttendanceTrends(classId);
        return NextResponse.json(attendanceTrends);

      case "platform-stats":
        const platformStats = await getPlatformStats();
        return NextResponse.json(platformStats);

      case "class-participation":
        if (!classId) {
          return NextResponse.json(
            { error: "Missing classId" },
            { status: 400 }
          );
        }
        const participation = await getClassParticipationMetrics(classId);
        return NextResponse.json(participation);

      default:
        return NextResponse.json(
          { error: "Unknown analytics type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API] Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
