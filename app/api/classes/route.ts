import { type NextRequest, NextResponse } from "next/server";
import { getClasses, createClass } from "@/lib/actions/classes";

export async function GET(request: NextRequest) {
  try {
    const rows = await getClasses();
    return NextResponse.json({
      classes: rows,
      total: rows.length,
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
  try {
    const body = await request.json();

    const result = await createClass(body);
    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      classId: result.classId,
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
