import { type NextRequest, NextResponse } from "next/server";
import { mockClasses, simulateApiDelay } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  await simulateApiDelay(400);

  try {
    return NextResponse.json({
      classes: mockClasses,
      total: mockClasses.length,
    });
  } catch (error) {
    console.error("Get classes error:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi tải danh sách lớp học" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await simulateApiDelay(600);

  try {
    const { title, description, teacher_id, schedule, max_students } =
      await request.json();

    if (!title || !teacher_id) {
      return NextResponse.json(
        { message: "Tên lớp học và giáo viên là bắt buộc" },
        { status: 400 }
      );
    }

    // Create new class (in real app, this would be saved to database)
    const newClass = {
      id: Math.max(...mockClasses.map((c) => c.id)) + 1,
      title,
      description: description || null,
      teacher_id,
      teacher_name: "Giáo viên", // In real app, get from teacher lookup
      schedule: schedule || null,
      max_students: max_students || 20,
      status: "recruiting" as const,
      student_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to mock data (in memory only)
    mockClasses.push(newClass);

    return NextResponse.json({
      class: newClass,
      message: "Tạo lớp học thành công",
    });
  } catch (error) {
    console.error("Create class error:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi tạo lớp học" },
      { status: 500 }
    );
  }
}
