import { type NextRequest, NextResponse } from "next/server";
import { gradeSubmission } from "@/lib/actions/assignments";

export async function POST(request: NextRequest) {
    try {
        const { submissionId, score, feedback } = await request.json();

        if (!submissionId || score === undefined) {
            return NextResponse.json(
                { message: "Thiếu thông tin chấm điểm" },
                { status: 400 }
            );
        }

        const result = await gradeSubmission(
            Number(submissionId),
            Number(score),
            feedback ?? ""
        );

        if (result.success) {
            return NextResponse.json({ message: "Chấm điểm thành công" });
        } else {
            return NextResponse.json({ message: result.error }, { status: 400 });
        }
    } catch (error) {
        console.error("Grading error:", error);
        return NextResponse.json(
            { message: "Có lỗi xảy ra khi chấm điểm" },
            { status: 500 }
        );
    }
}
