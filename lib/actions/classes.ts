"use server"

import { apiClient } from "@/lib/api-client"
import { revalidatePath } from "next/cache"
import type { Class } from "@/lib/mock-data"

export interface CreateClassData {
  title: string
  description: string
  teacher_id: number
  schedule: string
  max_students: number
}

export async function getClasses(): Promise<Class[]> {
  const result = await apiClient.get<{ classes: Class[]; total: number }>("/classes")
  return result.success ? result.data.classes : []
}

export async function getClassById(id: number): Promise<Class | null> {
  const result = await apiClient.get<{ class: Class }>(`/classes/${id}`)
  return result.success ? result.data.class : null
}

export async function createClass(data: CreateClassData) {
  try {
    const result = await apiClient.post<{ class: Class; message: string }>("/classes", data)

    if (result.success) {
      revalidatePath("/classes")
      return { success: true, id: result.data.class.id }
    }

    return { success: false, error: result.error || "Failed to create class" }
  } catch (error) {
    console.error("Error creating class:", error)
    return { success: false, error: "Failed to create class" }
  }
}

export async function getClassStudents(classId: number) {
  // Mock implementation - in real app, this would be a separate API endpoint
  return []
}
