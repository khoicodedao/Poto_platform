import { type NextRequest, NextResponse } from "next/server"
import { getClassById, updateClass, deleteClass } from "@/lib/actions/classes"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const classId = Number.parseInt(params.id)
    const classData = await getClassById(classId)

    if (!classData) {
      return NextResponse.json({ message: "Không tìm thấy lớp học" }, { status: 404 })
    }

    return NextResponse.json({
      class: classData,
    })
  } catch (error) {
    console.error("Get class error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi tải thông tin lớp học" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const classId = Number.parseInt(params.id)
    const data = await request.json()

    const result = await updateClass(classId, data)

    if (result.success) {
      return NextResponse.json({ message: "Cập nhật lớp học thành công" })
    } else {
      return NextResponse.json({ message: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Update class error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi cập nhật lớp học" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const classId = Number.parseInt(params.id)

    const result = await deleteClass(classId)

    if (result.success) {
      return NextResponse.json({ message: "Xóa lớp học thành công" })
    } else {
      return NextResponse.json({ message: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Delete class error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi xóa lớp học" }, { status: 500 })
  }
}
