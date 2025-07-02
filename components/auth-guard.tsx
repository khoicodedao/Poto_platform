import type React from "react"
import { getCurrentSession } from "@/lib/auth"
import { redirect } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "student" | "teacher" | "admin"
}

export default async function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const session = await getCurrentSession()

  if (!session) {
    redirect("/auth/signin")
  }

  if (requiredRole && session.user.role !== requiredRole) {
    redirect("/unauthorized")
  }

  return <>{children}</>
}
