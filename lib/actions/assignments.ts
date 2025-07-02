"use server"

import { apiClient } from "@/lib/api-client"
import { revalidatePath } from "next/cache"
import type { Assignment } from "@/lib/mock-data"

export interface CreateAssignmentData {
  title: string
  description: string
  class_id: number
  teacher_id: number
  due_date: string
  points: number
}

export async function getAssignments(studentId?: number): Promise<Assignment[]> {
  const params = studentId ? `?student_id=${studentId}` : ""
  const result = await apiClient.get<{ assignments: Assignment[]; total: number }>(`/assignments${params}`)
  return result.success ? result.data.assignments : []
}

export async function getAssignmentById(id: number, studentId?: number): Promise<Assignment | null> {
  const result = await apiClient.get<{ assignment: Assignment }>(`/assignments/${id}`)
  return result.success ? result.data.assignment : null
}

export async function createAssignment(data: CreateAssignmentData) {
  try {
    const result = await apiClient.post<{ assignment: Assignment; message: string }>("/assignments", data)

    if (result.success) {
      revalidatePath("/assignments")
      return { success: true, id: result.data.assignment.id }
    }

    return { success: false, error: result.error || "Failed to create assignment" }
  } catch (error) {
    console.error("Error creating assignment:", error)
    return { success: false, error: "Failed to create assignment" }
  }
}

export async function submitAssignment(assignmentId: number, studentId: number, content: string) {
  try {
    const result = await apiClient.post(`/assignments/${assignmentId}/submit`, {
      student_id: studentId,
      content,
    })

    if (result.success) {
      revalidatePath("/assignments")
      return { success: true }
    }

    return { success: false, error: result.error || "Failed to submit assignment" }
  } catch (error) {
    console.error("Error submitting assignment:", error)
    return { success: false, error: "Failed to submit assignment" }
  }
}
