import { type NextRequest, NextResponse } from "next/server"
import { mockAssignments, simulateApiDelay } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await simulateApiDelay(300)

  try {
    const assignmentId = Number.parseInt(params.id)
    const assignment = mockAssignments.find((a) => a.id === assignmentId)

    if (!assignment) {
      return NextResponse.json({ message: "Không tìm thấy bài tập" }, { status: 404 })
    }

    return NextResponse.json({
      assignment,
    })
  } catch (error) {
    console.error("Get assignment error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi tải thông tin bài tập" }, { status: 500 })
  }
}
