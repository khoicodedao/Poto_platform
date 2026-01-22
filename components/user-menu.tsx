"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut, BookOpen, GraduationCap, Calendar as CalendarIcon, Users } from "lucide-react"
import { signOutAction } from "@/lib/actions/auth"
import type { AuthUser } from "@/lib/auth-types"
import Link from "next/link"

interface UserMenuProps {
  user: AuthUser
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOutAction()
      router.push("/auth/signin")
      router.refresh()
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "teacher":
        return <Badge variant="default">Giáo viên</Badge>
      case "student":
        return <Badge variant="secondary">Học viên</Badge>
      case "teaching_assistant":
        return <Badge variant="outline" className="border-purple-500 text-purple-700">Trợ Giảng</Badge>
      case "admin":
        return <Badge variant="destructive">Quản trị</Badge>
      default:
        return null
    }
  }

  // Check if user is TA or Admin (who can also access TA views)
  const showTAMenu = user.role === "teaching_assistant" || user.role === "admin"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || "/placeholder.svg?height=32&width=32"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <div className="pt-1">{getRoleBadge(user.role)}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* TA Menu Items (visible to TA and Admin) */}
        {showTAMenu && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/ta/dashboard">
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>TA Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/ta/calendar">
                <CalendarIcon className="mr-2 h-4 w-4 text-white" />
                <span>Lịch Trợ Giảng</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/ta/classes">
                <Users className="mr-2 h-4 w-4" />
                <span>Lớp Của Tôi</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Hồ sơ</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Cài đặt</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <BookOpen className="mr-2 h-4 w-4" />
          <span>Lớp học của tôi</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Đang đăng xuất..." : "Đăng xuất"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
