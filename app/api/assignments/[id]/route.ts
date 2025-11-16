import { type NextRequest, NextResponse } from "next/server"
import { getAssignmentById, updateAssignment, deleteAssignment } from "@/lib/actions/assignments"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assignmentId = Number.parseInt(params.id)
    const assignment = await getAssignmentById(assignmentId)

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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assignmentId = Number.parseInt(params.id)
    const data = await request.json()

    // Convert dueDate string to Date if present
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate)
    }

    const result = await updateAssignment(assignmentId, data)

    if (result.success) {
      return NextResponse.json({ message: "Cập nhật bài tập thành công" })
    } else {
      return NextResponse.json({ message: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Update assignment error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi cập nhật bài tập" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assignmentId = Number.parseInt(params.id)

    const result = await deleteAssignment(assignmentId)

    if (result.success) {
      return NextResponse.json({ message: "Xóa bài tập thành công" })
    } else {
      return NextResponse.json({ message: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Delete assignment error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi xóa bài tập" }, { status: 500 })
  }
}
