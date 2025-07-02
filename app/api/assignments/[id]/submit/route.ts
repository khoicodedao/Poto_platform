import { type NextRequest, NextResponse } from "next/server"
import { mockAssignments, simulateApiDelay } from "@/lib/mock-data"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  await simulateApiDelay(800)

  try {
    const assignmentId = Number.parseInt(params.id)
    const { student_id, content } = await request.json()

    if (!student_id || !content) {
      return NextResponse.json({ message: "Nội dung bài làm là bắt buộc" }, { status: 400 })
    }

    const assignment = mockAssignments.find((a) => a.id === assignmentId)
    if (!assignment) {
      return NextResponse.json({ message: "Không tìm thấy bài tập" }, { status: 404 })
    }

    // Update assignment submission status (in real app, create submission record)
    assignment.submitted = true
    assignment.submission_date = new Date().toISOString()

    return NextResponse.json({
      message: "Nộp bài thành công",
      submission: {
        id: Date.now(),
        assignment_id: assignmentId,
        student_id,
        content,
        submitted_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Submit assignment error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi nộp bài" }, { status: 500 })
  }
}
