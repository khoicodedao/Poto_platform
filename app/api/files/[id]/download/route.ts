import { type NextRequest, NextResponse } from "next/server"
import { mockFiles, simulateApiDelay } from "@/lib/mock-data"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  await simulateApiDelay(200)

  try {
    const fileId = Number.parseInt(params.id)
    const file = mockFiles.find((f) => f.id === fileId)

    if (!file) {
      return NextResponse.json({ message: "Không tìm thấy tài liệu" }, { status: 404 })
    }

    // Increment download count
    file.downloads++

    return NextResponse.json({
      message: "Tăng lượt tải thành công",
      downloads: file.downloads,
    })
  } catch (error) {
    console.error("Increment download error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 })
  }
}
