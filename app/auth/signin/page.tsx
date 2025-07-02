"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { signInAction } from "@/lib/actions/auth"

export default function SignInPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signInAction(formData)

      if (result.success) {
        console.log("Login successful, redirecting to dashboard...")
        router.push("/")
        router.refresh()
      } else {
        setError(result.error || "Có lỗi xảy ra")
        console.error("Sign in failed:", result.error)
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("Có lỗi xảy ra khi đăng nhập")
    } finally {
      setIsLoading(false)
    }
  }

  // Thêm nút đăng nhập nhanh
  const handleQuickLogin = async (type: "student" | "teacher") => {
    setIsLoading(true)
    setError("")

    const email = type === "student" ? "student1@example.com" : "teacher1@example.com"
    const password = "123456"

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    try {
      const result = await signInAction(formData)

      if (result.success) {
        console.log("Quick login successful, redirecting to dashboard...")
        router.push("/")
        router.refresh()
      } else {
        setError(result.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Quick login error:", error)
      setError("Có lỗi xảy ra khi đăng nhập nhanh")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>Đăng nhập vào tài khoản EduPlatform của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" required disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          {/* Nút đăng nhập nhanh */}
          <div className="mt-6">
            <p className="text-sm text-center font-medium text-gray-700 mb-3">Đăng nhập nhanh:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => handleQuickLogin("student")} disabled={isLoading}>
                Học viên
              </Button>
              <Button variant="outline" onClick={() => handleQuickLogin("teacher")} disabled={isLoading}>
                Giáo viên
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Tài khoản demo:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Giáo viên: teacher1@example.com / 123456</p>
              <p>Học viên: student1@example.com / 123456</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
