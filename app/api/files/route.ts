import { type NextRequest, NextResponse } from "next/server"
import { mockFiles, simulateApiDelay } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  await simulateApiDelay(400)

  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("class_id")
    const category = searchParams.get("category")

    let files = mockFiles

    // Filter by class if provided
    if (classId) {
      files = files.filter((f) => f.class_id === Number.parseInt(classId))
    }

    // Filter by category if provided
    if (category) {
      files = files.filter((f) => f.category === category)
    }

    return NextResponse.json({
      files,
      total: files.length,
    })
  } catch (error) {
    console.error("Get files error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi tải danh sách tài liệu" }, { status: 500 })
  }
}
