"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getAssignmentById, submitAssignment } from "@/lib/actions/assignments"

export default function SubmitAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [assignment, setAssignment] = useState<any>(null)
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(true)

  // Simulate current user
  const currentUserId = 5

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const assignmentData = await getAssignmentById(Number.parseInt(params.id), currentUserId)
        setAssignment(assignmentData)
      } catch (error) {
        console.error("Error loading assignment:", error)
      } finally {
        setIsLoadingAssignment(false)
      }
    }

    loadAssignment()
  }, [params.id, currentUserId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung bài làm")
      return
    }

    setIsLoading(true)

    try {
      const result = await submitAssignment(Number.parseInt(params.id), currentUserId, content)
      if (result.success) {
        alert("Nộp bài thành công!")
        router.push("/assignments")
      } else {
        alert("Có lỗi xảy ra khi nộp bài")
      }
    } catch (error) {
      console.error("Error submitting assignment:", error)
      alert("Có lỗi xảy ra khi nộp bài")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingAssignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài tập...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy bài tập</h2>
          <Link href="/assignments">
            <Button>Quay lại danh sách bài tập</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOverdue = new Date(assignment.due_date) < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/assignments" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span>Quay lại</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                <CardDescription className="text-base">
                  {assignment.class_title} • {assignment.teacher_name}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={isOverdue ? "destructive" : "outline"}>{assignment.points} điểm</Badge>
                {isOverdue && <Badge variant="destructive">Quá hạn</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Mô tả bài tập:</h3>
                <p className="text-gray-700">{assignment.description}</p>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Hạn nộp: {new Date(assignment.due_date).toLocaleDateString("vi-VN")}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(assignment.due_date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {isOverdue && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    ⚠️ Bài tập này đã quá hạn nộp. Việc nộp muộn có thể ảnh hưởng đến điểm số.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Nộp bài làm</CardTitle>
            <CardDescription>Nhập nội dung bài làm của bạn vào ô bên dưới</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung bài làm *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập bài làm của bạn tại đây..."
                  rows={12}
                  className="min-h-[300px]"
                  required
                />
                <p className="text-sm text-gray-500">Số ký tự: {content.length}</p>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? "Đang nộp..." : isOverdue ? "Nộp muộn" : "Nộp bài"}
                </Button>
                <Link href="/assignments">
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
