"use server"

import { revalidatePath } from "next/cache"
import { db, files, classes, users } from "@/db"
import { eq, desc } from "drizzle-orm"
import { requireAuth } from "@/lib/auth"

export interface UploadFileData {
  name: string
  url: string
  type: string
  size: number
  classId?: number
}

export async function getFiles(classId?: number) {
  try {
    const query = db
      .select({
        id: files.id,
        name: files.name,
        url: files.url,
        type: files.type,
        size: files.size,
        classId: files.classId,
        className: classes.name,
        uploadedById: files.uploadedById,
        uploaderName: users.name,
        uploadedAt: files.uploadedAt,
      })
      .from(files)
      .leftJoin(classes, eq(files.classId, classes.id))
      .leftJoin(users, eq(files.uploadedById, users.id))
      .orderBy(desc(files.uploadedAt))

    if (classId) {
      return await query.where(eq(files.classId, classId))
    }

    return await query
  } catch (error) {
    console.error("Error fetching files:", error)
    return []
  }
}

export async function uploadFile(data: UploadFileData) {
  try {
    const user = await requireAuth()

    const [newFile] = await db
      .insert(files)
      .values({
        name: data.name,
        url: data.url,
        type: data.type,
        size: data.size,
        classId: data.classId || null,
        uploadedById: user.id,
      })
      .returning()

    revalidatePath("/files")
    if (data.classId) {
      revalidatePath(`/classes/${data.classId}`)
    }
    
    return { success: true, id: newFile.id }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error: "Không thể tải lên tệp" }
  }
}

export async function deleteFile(id: number) {
  try {
    const user = await requireAuth()

    // Check if user owns the file or is admin
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, id))
      .limit(1)

    if (!file) {
      return { success: false, error: "Không tìm thấy tệp" }
    }

    if (file.uploadedById !== user.id && user.role !== 'admin') {
      return { success: false, error: "Bạn không có quyền xóa tệp này" }
    }

    await db.delete(files).where(eq(files.id, id))

    revalidatePath("/files")
    if (file.classId) {
      revalidatePath(`/classes/${file.classId}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting file:", error)
    return { success: false, error: "Không thể xóa tệp" }
  }
}
