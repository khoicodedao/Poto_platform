import { type NextRequest, NextResponse } from "next/server"
import { mockAssignments, simulateApiDelay } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  await simulateApiDelay(400)

  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("student_id")

    let assignments = mockAssignments

    // Filter by student if provided (simulate enrollment check)
    if (studentId) {
      // In real app, you'd check which classes the student is enrolled in
      assignments = assignments.filter((a) => a.status === "published")
    }

    return NextResponse.json({
      assignments,
      total: assignments.length,
    })
  } catch (error) {
    console.error("Get assignments error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi tải danh sách bài tập" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  await simulateApiDelay(600)

  try {
    const { title, description, class_id, teacher_id, due_date, points } = await request.json()

    if (!title || !class_id || !teacher_id || !due_date) {
      return NextResponse.json({ message: "Các trường bắt buộc không được để trống" }, { status: 400 })
    }

    // Create new assignment (in real app, this would be saved to database)
    const newAssignment = {
      id: Math.max(...mockAssignments.map((a) => a.id)) + 1,
      title,
      description: description || null,
      class_id,
      class_title: "Lớp học", // In real app, get from class lookup
      teacher_id,
      teacher_name: "Giáo viên", // In real app, get from teacher lookup
      due_date,
      points: points || 10,
      status: "published" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted: false,
    }

    // Add to mock data (in memory only)
    mockAssignments.push(newAssignment)

    return NextResponse.json({
      assignment: newAssignment,
      message: "Tạo bài tập thành công",
    })
  } catch (error) {
    console.error("Create assignment error:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi tạo bài tập" }, { status: 500 })
  }
}
