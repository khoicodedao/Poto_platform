"use server"

import { apiClient } from "@/lib/api-client"
import { revalidatePath } from "next/cache"
import type { FileRecord } from "@/lib/mock-data"

export async function getFiles(classId?: number): Promise<FileRecord[]> {
  const params = classId ? `?class_id=${classId}` : ""
  const result = await apiClient.get<{ files: FileRecord[]; total: number }>(`/files${params}`)
  return result.success ? result.data.files : []
}

export async function getFilesByCategory(category: string): Promise<FileRecord[]> {
  const result = await apiClient.get<{ files: FileRecord[]; total: number }>(`/files?category=${category}`)
  return result.success ? result.data.files : []
}

export async function incrementDownload(id: number) {
  try {
    const result = await apiClient.post(`/files/${id}/download`)

    if (result.success) {
      revalidatePath("/files")
      return { success: true }
    }

    return { success: false, error: result.error || "Failed to increment download" }
  } catch (error) {
    console.error("Error incrementing download:", error)
    return { success: false, error: "Failed to increment download" }
  }
}
