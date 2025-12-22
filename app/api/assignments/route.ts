import { type NextRequest, NextResponse } from "next/server";
import { getAssignments, createAssignment } from "@/lib/actions/assignments";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classIdParam = searchParams.get("classId") || searchParams.get("class_id");
    const classId = classIdParam ? parseInt(classIdParam) : undefined;

    const assignments = await getAssignments(classId);

    return NextResponse.json({
      assignments,
      total: assignments.length,
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi tải danh sách bài tập" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      classId,
      dueDate,
      maxScore,
      autoReleaseEnabled,
      autoCloseEnabled,
      scheduledReleaseAt,
      scheduledCloseAt,
      isVisible,
      allowPartialSubmission,
    } = body;

    // Use classId (camelCase from frontend) instead of class_id
    if (!title || !classId || !dueDate) {
      return NextResponse.json(
        { message: "Các trường bắt buộc không được để trống" },
        { status: 400 }
      );
    }

    // TODO: Update createAssignment to handle scheduling fields
    const result = await createAssignment({
      title,
      description: description ?? "",
      classId: Number(classId),
      dueDate: new Date(dueDate),
      maxScore: Number(maxScore) || 100,
    });

    if (result.success) {
      return NextResponse.json({
        message: "Tạo bài tập thành công",
        id: result.id,
      });
    } else {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Create assignment error:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi tạo bài tập" },
      { status: 500 }
    );
  }
}
