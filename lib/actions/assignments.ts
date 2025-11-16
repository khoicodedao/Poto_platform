"use server"

import { revalidatePath } from "next/cache"
import { db, assignments, assignmentSubmissions, users, classes } from "@/db"
import { eq, and, desc } from "drizzle-orm"
import { requireAuth } from "@/lib/auth"

export interface CreateAssignmentData {
  title: string
  description: string
  classId: number
  dueDate: Date
  maxScore: number
}

export async function getAssignments(classId?: number) {
  try {
    const user = await requireAuth()
    
    const query = db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        classId: assignments.classId,
        className: classes.name,
        dueDate: assignments.dueDate,
        maxScore: assignments.maxScore,
        createdAt: assignments.createdAt,
      })
      .from(assignments)
      .leftJoin(classes, eq(assignments.classId, classes.id))
      .orderBy(desc(assignments.createdAt))

    if (classId) {
      return await query.where(eq(assignments.classId, classId))
    }

    return await query
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return []
  }
}

export async function getAssignmentById(id: number) {
  try {
    const [assignment] = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        classId: assignments.classId,
        className: classes.name,
        dueDate: assignments.dueDate,
        maxScore: assignments.maxScore,
        createdAt: assignments.createdAt,
      })
      .from(assignments)
      .leftJoin(classes, eq(assignments.classId, classes.id))
      .where(eq(assignments.id, id))
      .limit(1)

    return assignment || null
  } catch (error) {
    console.error("Error fetching assignment:", error)
    return null
  }
}

export async function createAssignment(data: CreateAssignmentData) {
  try {
    const user = await requireAuth()

    if (user.role !== 'teacher') {
      return { success: false, error: "Chỉ giáo viên mới có thể tạo bài tập" }
    }

    const [newAssignment] = await db
      .insert(assignments)
      .values({
        title: data.title,
        description: data.description,
        classId: data.classId,
        dueDate: data.dueDate,
        maxScore: data.maxScore,
      })
      .returning()

    revalidatePath("/assignments")
    revalidatePath(`/classes/${data.classId}`)
    return { success: true, id: newAssignment.id }
  } catch (error) {
    console.error("Error creating assignment:", error)
    return { success: false, error: "Không thể tạo bài tập" }
  }
}

export async function submitAssignment(assignmentId: number, content: string, fileUrl?: string) {
  try {
    const user = await requireAuth()

    if (user.role !== 'student') {
      return { success: false, error: "Chỉ học viên mới có thể nộp bài tập" }
    }

    // Check if already submitted
    const [existing] = await db
      .select()
      .from(assignmentSubmissions)
      .where(and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.studentId, user.id)
      ))
      .limit(1)

    if (existing) {
      // Update existing submission
      await db
        .update(assignmentSubmissions)
        .set({
          content,
          fileUrl,
          submittedAt: new Date(),
          status: 'submitted',
        })
        .where(eq(assignmentSubmissions.id, existing.id))
    } else {
      // Create new submission
      await db
        .insert(assignmentSubmissions)
        .values({
          assignmentId,
          studentId: user.id,
          content,
          fileUrl,
          submittedAt: new Date(),
          status: 'submitted',
        })
    }

    revalidatePath("/assignments")
    revalidatePath(`/assignments/${assignmentId}`)
    return { success: true }
  } catch (error) {
    console.error("Error submitting assignment:", error)
    return { success: false, error: "Không thể nộp bài tập" }
  }
}

export async function gradeSubmission(submissionId: number, score: number, feedback: string) {
  try {
    const user = await requireAuth()

    if (user.role !== 'teacher') {
      return { success: false, error: "Chỉ giáo viên mới có thể chấm điểm" }
    }

    await db
      .update(assignmentSubmissions)
      .set({
        score,
        feedback,
        gradedAt: new Date(),
        status: 'graded',
      })
      .where(eq(assignmentSubmissions.id, submissionId))

    revalidatePath("/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error grading submission:", error)
    return { success: false, error: "Không thể chấm điểm" }
  }
}

export async function getMySubmissions(assignmentId?: number) {
  try {
    const user = await requireAuth()

    if (user.role !== 'student') {
      return []
    }

    const query = db
      .select({
        id: assignmentSubmissions.id,
        assignmentId: assignmentSubmissions.assignmentId,
        assignmentTitle: assignments.title,
        className: classes.name,
        content: assignmentSubmissions.content,
        fileUrl: assignmentSubmissions.fileUrl,
        status: assignmentSubmissions.status,
        score: assignmentSubmissions.score,
        feedback: assignmentSubmissions.feedback,
        submittedAt: assignmentSubmissions.submittedAt,
        gradedAt: assignmentSubmissions.gradedAt,
      })
      .from(assignmentSubmissions)
      .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
      .leftJoin(classes, eq(assignments.classId, classes.id))
      .orderBy(desc(assignmentSubmissions.submittedAt))

    if (assignmentId) {
      return await query.where(and(
        eq(assignmentSubmissions.studentId, user.id),
        eq(assignmentSubmissions.assignmentId, assignmentId)
      ))
    }

    return await query.where(eq(assignmentSubmissions.studentId, user.id))
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return []
  }
}

export async function updateAssignment(assignmentId: number, data: Partial<CreateAssignmentData>) {
  try {
    const user = await requireAuth()

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return { success: false, error: "Chỉ giáo viên mới có thể chỉnh sửa bài tập" }
    }

    // Verify the assignment exists and belongs to teacher's class
    const [assignment] = await db
      .select({
        id: assignments.id,
        classId: assignments.classId,
        teacherId: classes.teacherId,
      })
      .from(assignments)
      .leftJoin(classes, eq(assignments.classId, classes.id))
      .where(eq(assignments.id, assignmentId))
      .limit(1)

    if (!assignment) {
      return { success: false, error: "Không tìm thấy bài tập" }
    }

    if (user.role === 'teacher' && assignment.teacherId !== user.id) {
      return { success: false, error: "Bạn không có quyền chỉnh sửa bài tập này" }
    }

    await db
      .update(assignments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(assignments.id, assignmentId))

    revalidatePath("/assignments")
    revalidatePath(`/assignments/${assignmentId}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating assignment:", error)
    return { success: false, error: "Không thể cập nhật bài tập" }
  }
}

export async function deleteAssignment(assignmentId: number) {
  try {
    const user = await requireAuth()

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return { success: false, error: "Chỉ giáo viên mới có thể xóa bài tập" }
    }

    // Verify the assignment exists and belongs to teacher's class
    const [assignment] = await db
      .select({
        id: assignments.id,
        classId: assignments.classId,
        teacherId: classes.teacherId,
      })
      .from(assignments)
      .leftJoin(classes, eq(assignments.classId, classes.id))
      .where(eq(assignments.id, assignmentId))
      .limit(1)

    if (!assignment) {
      return { success: false, error: "Không tìm thấy bài tập" }
    }

    if (user.role === 'teacher' && assignment.teacherId !== user.id) {
      return { success: false, error: "Bạn không có quyền xóa bài tập này" }
    }

    await db.delete(assignments).where(eq(assignments.id, assignmentId))

    revalidatePath("/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return { success: false, error: "Không thể xóa bài tập" }
  }
}

export async function deleteSubmission(submissionId: number) {
  try {
    const user = await requireAuth()

    // Get submission details
    const [submission] = await db
      .select()
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.id, submissionId))
      .limit(1)

    if (!submission) {
      return { success: false, error: "Không tìm thấy bài nộp" }
    }

    // Students can only delete their own submissions, teachers can delete any
    if (user.role === 'student' && submission.studentId !== user.id) {
      return { success: false, error: "Bạn không có quyền xóa bài nộp này" }
    }

    if (user.role === 'teacher') {
      // Verify teacher owns the class
      const [assignment] = await db
        .select({
          teacherId: classes.teacherId,
        })
        .from(assignments)
        .leftJoin(classes, eq(assignments.classId, classes.id))
        .where(eq(assignments.id, submission.assignmentId))
        .limit(1)

      if (assignment && assignment.teacherId !== user.id) {
        return { success: false, error: "Bạn không có quyền xóa bài nộp này" }
      }
    }

    await db.delete(assignmentSubmissions).where(eq(assignmentSubmissions.id, submissionId))

    revalidatePath("/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error deleting submission:", error)
    return { success: false, error: "Không thể xóa bài nộp" }
  }
}

export async function getAllSubmissions(assignmentId: number) {
  try {
    const user = await requireAuth()

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return []
    }

    // Verify teacher owns the class (skip for admin)
    if (user.role === 'teacher') {
      const [assignment] = await db
        .select({
          teacherId: classes.teacherId,
        })
        .from(assignments)
        .leftJoin(classes, eq(assignments.classId, classes.id))
        .where(eq(assignments.id, assignmentId))
        .limit(1)

      if (!assignment || assignment.teacherId !== user.id) {
        return []
      }
    }

    const submissions = await db
      .select({
        id: assignmentSubmissions.id,
        studentId: assignmentSubmissions.studentId,
        studentName: users.name,
        studentEmail: users.email,
        content: assignmentSubmissions.content,
        fileUrl: assignmentSubmissions.fileUrl,
        status: assignmentSubmissions.status,
        score: assignmentSubmissions.score,
        feedback: assignmentSubmissions.feedback,
        submittedAt: assignmentSubmissions.submittedAt,
        gradedAt: assignmentSubmissions.gradedAt,
      })
      .from(assignmentSubmissions)
      .innerJoin(users, eq(assignmentSubmissions.studentId, users.id))
      .where(eq(assignmentSubmissions.assignmentId, assignmentId))
      .orderBy(desc(assignmentSubmissions.submittedAt))

    return submissions
  } catch (error) {
    console.error("Error fetching all submissions:", error)
    return []
  }
}
