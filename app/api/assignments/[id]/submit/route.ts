import { type NextRequest, NextResponse } from "next/server";
import { submitAssignment } from "@/lib/actions/assignments";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = Number.parseInt(params.id);
    const { content, fileUrl } = await request.json();

    if (!content && !fileUrl) {
      return NextResponse.json(
        { message: "Nội dung bài làm hoặc tệp đính kèm là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await submitAssignment(assignmentId, content, fileUrl);

    if (result.success) {
      return NextResponse.json({
        message: "Nộp bài thành công",
      });
    } else {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Submit assignment error:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi nộp bài" },
      { status: 500 }
    );
  }
}
