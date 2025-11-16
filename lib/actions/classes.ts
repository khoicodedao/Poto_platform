"use server"

import { revalidatePath } from "next/cache"
import { db, classes, classEnrollments, users } from "@/db"
import { eq, desc, and } from "drizzle-orm"
import { requireAuth } from "@/lib/auth"

export interface CreateClassData {
  name: string
  description: string
  schedule: string
}

export async function getClasses() {
  try {
    const classList = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        schedule: classes.schedule,
        roomId: classes.roomId,
        teacherId: classes.teacherId,
        teacherName: users.name,
        teacherAvatar: users.avatar,
        createdAt: classes.createdAt,
      })
      .from(classes)
      .leftJoin(users, eq(classes.teacherId, users.id))
      .orderBy(desc(classes.createdAt))

    return classList
  } catch (error) {
    console.error("Error fetching classes:", error)
    return []
  }
}

export async function getClassById(id: number) {
  try {
    const [classData] = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        schedule: classes.schedule,
        roomId: classes.roomId,
        teacherId: classes.teacherId,
        teacherName: users.name,
        teacherEmail: users.email,
        teacherAvatar: users.avatar,
        createdAt: classes.createdAt,
      })
      .from(classes)
      .leftJoin(users, eq(classes.teacherId, users.id))
      .where(eq(classes.id, id))
      .limit(1)

    return classData || null
  } catch (error) {
    console.error("Error fetching class:", error)
    return null
  }
}

export async function createClass(data: CreateClassData) {
  try {
    const user = await requireAuth()
    
    if (user.role !== 'teacher') {
      return { success: false, error: "Chỉ giáo viên mới có thể tạo lớp học" }
    }

    const roomId = `class-${Date.now()}`
    
    const [newClass] = await db
      .insert(classes)
      .values({
        name: data.name,
        description: data.description,
        schedule: data.schedule,
        teacherId: user.id,
        roomId,
      })
      .returning()

    revalidatePath("/classes")
    return { success: true, id: newClass.id }
  } catch (error) {
    console.error("Error creating class:", error)
    return { success: false, error: "Không thể tạo lớp học" }
  }
}

export async function getClassStudents(classId: number) {
  try {
    const students = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        enrolledAt: classEnrollments.enrolledAt,
      })
      .from(classEnrollments)
      .innerJoin(users, eq(classEnrollments.studentId, users.id))
      .where(eq(classEnrollments.classId, classId))
      .orderBy(classEnrollments.enrolledAt)

    return students
  } catch (error) {
    console.error("Error fetching class students:", error)
    return []
  }
}

export async function enrollInClass(classId: number) {
  try {
    const user = await requireAuth()
    
    if (user.role !== 'student') {
      return { success: false, error: "Chỉ học viên mới có thể đăng ký lớp học" }
    }

    // Check if already enrolled
    const [existing] = await db
      .select()
      .from(classEnrollments)
      .where(and(
        eq(classEnrollments.classId, classId),
        eq(classEnrollments.studentId, user.id)
      ))
      .limit(1)

    if (existing) {
      return { success: false, error: "Bạn đã đăng ký lớp này rồi" }
    }

    await db.insert(classEnrollments).values({
      classId,
      studentId: user.id,
    })

    revalidatePath(`/classes`)
    revalidatePath(`/classroom/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Error enrolling in class:", error)
    return { success: false, error: "Không thể đăng ký lớp học" }
  }
}

export async function getMyClasses() {
  try {
    const user = await requireAuth()

    if (user.role === 'admin') {
      // Admin can see all classes
      return await db
        .select({
          id: classes.id,
          name: classes.name,
          description: classes.description,
          schedule: classes.schedule,
          roomId: classes.roomId,
          teacherName: users.name,
          teacherAvatar: users.avatar,
          createdAt: classes.createdAt,
        })
        .from(classes)
        .leftJoin(users, eq(classes.teacherId, users.id))
        .orderBy(desc(classes.createdAt))
    } else if (user.role === 'teacher') {
      // Get classes taught by this teacher
      return await db
        .select({
          id: classes.id,
          name: classes.name,
          description: classes.description,
          schedule: classes.schedule,
          roomId: classes.roomId,
          createdAt: classes.createdAt,
        })
        .from(classes)
        .where(eq(classes.teacherId, user.id))
        .orderBy(desc(classes.createdAt))
    } else {
      // Get classes enrolled by this student
      return await db
        .select({
          id: classes.id,
          name: classes.name,
          description: classes.description,
          schedule: classes.schedule,
          roomId: classes.roomId,
          teacherName: users.name,
          teacherAvatar: users.avatar,
          enrolledAt: classEnrollments.enrolledAt,
        })
        .from(classEnrollments)
        .innerJoin(classes, eq(classEnrollments.classId, classes.id))
        .leftJoin(users, eq(classes.teacherId, users.id))
        .where(eq(classEnrollments.studentId, user.id))
        .orderBy(desc(classEnrollments.enrolledAt))
    }
  } catch (error) {
    console.error("Error fetching my classes:", error)
    return []
  }
}

export async function updateClass(classId: number, data: Partial<CreateClassData>) {
  try {
    const user = await requireAuth()
    
    // Check if user is the teacher of this class
    const [existingClass] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1)

    if (!existingClass) {
      return { success: false, error: "Không tìm thấy lớp học" }
    }

    if (existingClass.teacherId !== user.id && user.role !== 'admin') {
      return { success: false, error: "Bạn không có quyền chỉnh sửa lớp học này" }
    }

    await db
      .update(classes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(classes.id, classId))

    revalidatePath("/classes")
    revalidatePath(`/classes/${classId}`)
    revalidatePath(`/classroom/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating class:", error)
    return { success: false, error: "Không thể cập nhật lớp học" }
  }
}

export async function deleteClass(classId: number) {
  try {
    const user = await requireAuth()
    
    // Check if user is the teacher of this class
    const [existingClass] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1)

    if (!existingClass) {
      return { success: false, error: "Không tìm thấy lớp học" }
    }

    if (user.role === 'teacher' && existingClass.teacherId !== user.id) {
      return { success: false, error: "Bạn không có quyền xóa lớp học này" }
    }

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return { success: false, error: "Bạn không có quyền xóa lớp học" }
    }

    await db.delete(classes).where(eq(classes.id, classId))

    revalidatePath("/classes")
    revalidatePath(`/classes/${classId}`)
    revalidatePath(`/classroom/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting class:", error)
    return { success: false, error: "Không thể xóa lớp học" }
  }
}

export async function unenrollFromClass(classId: number) {
  try {
    const user = await requireAuth()
    
    if (user.role !== 'student') {
      return { success: false, error: "Chỉ học viên mới có thể hủy đăng ký lớp học" }
    }

    const result = await db
      .delete(classEnrollments)
      .where(and(
        eq(classEnrollments.classId, classId),
        eq(classEnrollments.studentId, user.id)
      ))

    revalidatePath("/classes")
    revalidatePath(`/classroom/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Error unenrolling from class:", error)
    return { success: false, error: "Không thể hủy đăng ký lớp học" }
  }
}
