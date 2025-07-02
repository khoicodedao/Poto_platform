import { type NextRequest, NextResponse } from "next/server"
import { mockClasses, simulateApiDelay } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await simulateApiDelay(300)

  try {
    const classId = Number.parseInt(params.id)
    const class_ = mockClasses.find((c) => c.id === classId)

    if (!class_) {
      return NextResponse.json({ message: "Không tìm thấy lớp học" }, { status: 404 })
    }

    return NextResponse.json({
      class: class_,
    })
  } catch (error) {
    console.error("Get class error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi tải thông tin lớp học" }, { status: 500 })
  }
}
