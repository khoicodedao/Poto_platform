"use server"

import memoryDb from "@/lib/memory-database"
import { revalidatePath } from "next/cache"

export interface User {
  id: number
  email: string
  name: string
  role: "teacher" | "student" | "admin"
  avatar: string | null
  created_at: string
  updated_at: string
}

export async function getUsers(): Promise<User[]> {
  return memoryDb.getUsers()
}

export async function getUserById(id: number): Promise<User | null> {
  return memoryDb.getUserById(id)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return memoryDb.getUserByEmail(email)
}

export async function createUser(data: { email: string; name: string; role: string; avatar?: string }) {
  try {
    const result = memoryDb.createUser({
      email: data.email,
      name: data.name,
      role: data.role as "teacher" | "student" | "admin",
      avatar: data.avatar || null,
    })

    revalidatePath("/users")
    return { success: true, id: result.id }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function getTeachers(): Promise<User[]> {
  return memoryDb.getUsers().filter((u) => u.role === "teacher")
}

export async function getStudents(): Promise<User[]> {
  return memoryDb.getUsers().filter((u) => u.role === "student")
}
