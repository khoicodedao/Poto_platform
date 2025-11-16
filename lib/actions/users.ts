"use server"

import { revalidatePath } from "next/cache"
import { db, users } from "@/db"
import { eq, like, or, desc, and } from "drizzle-orm"
import { requireAuth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function getUsers(role?: 'student' | 'teacher' | 'admin', search?: string) {
  try {
    const user = await requireAuth()

    if (user.role !== 'admin' && user.role !== 'teacher') {
      return { success: false, error: "Bạn không có quyền xem danh sách người dùng", users: [] }
    }

    const query = db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))

    // Apply filters
    const conditions = []
    if (role) {
      conditions.push(eq(users.role, role))
    }
    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      )
    }

    if (conditions.length > 0) {
      return { success: true, users: await query.where(and(...conditions)) }
    }

    return { success: true, users: await query }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, error: "Không thể tải danh sách người dùng", users: [] }
  }
}

export async function getUserById(id: number) {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    return user || null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    return user || null
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

export async function updateUser(id: number, data: { name?: string; email?: string; role?: 'student' | 'teacher' | 'admin'; avatar?: string }) {
  try {
    const currentUser = await requireAuth()

    // Only admin or the user themselves can update
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return { success: false, error: "Bạn không có quyền cập nhật người dùng này" }
    }

    // Only admin can change role
    if (data.role && currentUser.role !== 'admin') {
      delete data.role
    }

    await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error: "Không thể cập nhật người dùng" }
  }
}

export async function deleteUser(id: number) {
  try {
    const currentUser = await requireAuth()

    if (currentUser.role !== 'admin') {
      return { success: false, error: "Chỉ admin mới có thể xóa người dùng" }
    }

    if (currentUser.id === id) {
      return { success: false, error: "Bạn không thể xóa chính mình" }
    }

    await db.delete(users).where(eq(users.id, id))

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Không thể xóa người dùng" }
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  try {
    const user = await requireAuth()

    // Get user with password
    const [userWithPassword] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (!userWithPassword) {
      return { success: false, error: "Không tìm thấy người dùng" }
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userWithPassword.password)
    if (!isValid) {
      return { success: false, error: "Mật khẩu hiện tại không đúng" }
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return { success: true }
  } catch (error) {
    console.error("Error updating password:", error)
    return { success: false, error: "Không thể cập nhật mật khẩu" }
  }
}

export async function getTeachers() {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, 'teacher'))
      .orderBy(users.name)
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return []
  }
}

export async function getStudents() {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, 'student'))
      .orderBy(users.name)
  } catch (error) {
    console.error("Error fetching students:", error)
    return []
  }
}
