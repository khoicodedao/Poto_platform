import { type NextRequest, NextResponse } from "next/server";
import { getFiles } from "@/lib/actions/files";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classIdParam = searchParams.get("classId") || searchParams.get("class_id");
    const classId = classIdParam ? parseInt(classIdParam) : undefined;

    const files = await getFiles(classId);

    return NextResponse.json({
      files,
      total: files.length,
    });
  } catch (error) {
    console.error("Get files error:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi tải danh sách tài liệu" },
      { status: 500 }
    );
  }
}
