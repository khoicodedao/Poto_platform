"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Calendar, Clock, CheckCircle2, Paperclip, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getAssignmentDetail, submitAssignmentWithUpload } from "@/lib/actions/assignments"
import { useSession } from "@/hooks/useSession"

type AssignmentDetailData = NonNullable<Awaited<ReturnType<typeof getAssignmentDetail>>>

const formatDate = (value?: string | Date | null) => {
  if (!value) return "Chưa cập nhật"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const formatTime = (value?: string | Date | null) => {
  if (!value) return "--:--"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "--:--"
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "--"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "--"
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes <= 0) return ""
  const units = ["B", "KB", "MB", "GB"]
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / Math.pow(1024, index)
  const digits = value >= 10 ? 0 : 1
  return `${value.toFixed(digits)} ${units[index]}`
}

const getStatusBadge = (status?: string | null) => {
  if (status === "graded") {
    return (
      <Badge variant="default" className="bg-green-600">
        Đã chấm
      </Badge>
    )
  }
  if (status === "submitted") {
    return <Badge variant="default">Đã nộp</Badge>
  }
  if (status === "pending") {
    return <Badge variant="secondary">Chờ nộp</Badge>
  }
  return <Badge variant="outline">Chưa nộp</Badge>
}

export default function SubmitAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const assignmentId = Number.parseInt(params.id, 10)
  const backHref = Number.isNaN(assignmentId) ? "/assignments" : `/assignments/${assignmentId}`
  const { user, loading: sessionLoading } = useSession()
  const [assignment, setAssignment] = useState<AssignmentDetailData | null>(null)
  const [content, setContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionLoading) {
      return
    }

    if (Number.isNaN(assignmentId)) {
      setLoadError("Đường dẫn bài tập không hợp lệ")
      setIsLoadingAssignment(false)
      return
    }

    if (!user || user.role !== "student") {
      setIsLoadingAssignment(false)
      return
    }

    const loadAssignment = async () => {
      setIsLoadingAssignment(true)
      setLoadError(null)
      try {
        const assignmentData = await getAssignmentDetail(assignmentId)
        if (!assignmentData) {
          setAssignment(null)
          setLoadError("Không tìm thấy bài tập hoặc bạn không có quyền truy cập")
        } else {
          setAssignment(assignmentData)
          setContent(assignmentData.mySubmission?.content ?? "")
        }
      } catch (error) {
        console.error("Error loading assignment:", error)
        setLoadError("Không thể tải thông tin bài tập")
      } finally {
        setIsLoadingAssignment(false)
        setSelectedFile(null)
      }
    }

    loadAssignment()
  }, [assignmentId, sessionLoading, user?.id, user?.role])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!assignment || Number.isNaN(assignmentId)) {
      alert("Không tìm thấy bài tập để nộp")
      return
    }

    if (!content.trim() && !selectedFile) {
      alert("Vui lòng nhập nội dung bài làm hoặc đính kèm tệp")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("assignmentId", String(assignmentId))
      formData.append("content", content)
      if (selectedFile) {
        formData.append("file", selectedFile)
      }

      const result = await submitAssignmentWithUpload(formData)
      if (result.success) {
        alert("Nộp bài thành công!")
        router.push(`/assignments/${assignmentId}`)
      } else {
        alert(result.error ?? "Có lỗi xảy ra khi nộp bài")
      }
    } catch (error) {
      console.error("Error submitting assignment:", error)
      alert("Có lỗi xảy ra khi nộp bài")
    } finally {
      setIsLoading(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Đang tải thông tin...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <p className="text-lg text-gray-700">Bạn cần đăng nhập để nộp bài tập.</p>
        <Link href="/auth/signin">
          <Button>Đăng nhập</Button>
        </Link>
      </div>
    )
  }

  if (user.role !== "student") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <p className="text-lg text-gray-700">Chỉ học viên mới có thể nộp bài tập.</p>
        <Link href={backHref}>
          <Button>Quay lại bài tập</Button>
        </Link>
      </div>
    )
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

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <p className="text-lg text-gray-700">{loadError}</p>
        <Link href="/assignments">
          <Button>Quay lại danh sách bài tập</Button>
        </Link>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <p className="text-lg text-gray-700">Không tìm thấy bài tập.</p>
        <Link href="/assignments">
          <Button>Quay lại danh sách bài tập</Button>
        </Link>
      </div>
    )
  }

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
  const isOverdue = dueDate ? dueDate.getTime() < Date.now() : false
  const submission = assignment.mySubmission

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href={backHref} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                <CardDescription className="text-base">
                  {assignment.className ?? "Lớp học"} • {assignment.teacherName ?? "Giáo viên"}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={isOverdue ? "destructive" : "outline"}>{assignment.maxScore ?? 100} điểm</Badge>
                {isOverdue && <Badge variant="destructive">Quá hạn</Badge>}
                {getStatusBadge(submission?.status)}
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Hạn nộp: {formatDate(assignment.dueDate)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(assignment.dueDate)}
              </div>
            </div>
            {assignment.classDescription && (
              <p className="text-sm text-gray-500">{assignment.classDescription}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Mô tả bài tập</h3>
              <p className="text-gray-700 whitespace-pre-line">{assignment.description || "Không có mô tả."}</p>
            </div>

            {submission ? (
              <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Đã nộp vào {formatDateTime(submission.submittedAt)}
                </div>
                {submission.score !== null && (
                  <p className="text-sm text-gray-600">Điểm: <span className="font-semibold text-gray-900">{submission.score}</span></p>
                )}
                {submission.feedback && (
                  <p className="text-sm text-gray-600">Nhận xét: {submission.feedback}</p>
                )}
                {submission.fileUrl && (
                  <Link href={submission.fileUrl} target="_blank" className="flex items-center text-sm text-blue-600 hover:underline">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Xem tệp đã nộp
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed bg-white p-4 text-sm text-gray-600">
                Bạn chưa nộp bài cho bài tập này. Điền nội dung hoặc tải tệp để nộp bài.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nộp bài làm</CardTitle>
            <CardDescription>
              Viết bài làm của bạn hoặc đính kèm file (PDF, DOCX, PPT, ZIP...)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung bài làm *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Nhập bài làm của bạn tại đây..."
                  rows={10}
                  className="min-h-[240px]"
                />
                <p className="text-sm text-gray-500">Số ký tự: {content.length}</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="file">Tệp đính kèm</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <div className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Gỡ
                    </Button>
                  </div>
                )}
                {submission?.fileUrl && !selectedFile && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Paperclip className="h-4 w-4 mr-2" />
                    <Link href={submission.fileUrl} target="_blank" className="text-blue-600 hover:underline">
                      Đang sử dụng tệp đã nộp
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? "Đang nộp..." : isOverdue ? "Nộp muộn" : submission ? "Nộp lại" : "Nộp bài"}
                </Button>
                <Link href={backHref} className="w-full sm:w-auto">
                  <Button type="button" variant="outline" className="w-full">
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
