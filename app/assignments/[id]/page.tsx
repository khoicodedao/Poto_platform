import Link from "next/link"
import { GradingDialog } from "@/components/assignments/grading-dialog"
import { CustomBreadcrumb } from "@/components/custom-breadcrumb"
import { notFound, redirect } from "next/navigation"
import { getAssignmentDetail } from "@/lib/actions/assignments"
import { getCurrentSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Link2,
  Paperclip,
  Upload,
  Users,
} from "lucide-react"

const formatDate = (value?: Date | string | null) => {
  if (!value) return "Chưa cập nhật"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const formatDateTime = (value?: Date | string | null) => {
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

const formatTime = (value?: Date | string | null) => {
  if (!value) return "--:--"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "--:--"
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatStatusLabel = (status?: string | null) => {
  if (status === "graded") return "Đã chấm"
  if (status === "submitted") return "Đã nộp"
  if (status === "pending") return "Chờ nộp"
  return "Chưa nộp"
}

export default async function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const assignmentId = Number(params.id)
  if (Number.isNaN(assignmentId)) {
    notFound()
  }

  const session = await getCurrentSession()
  if (!session) {
    redirect("/auth/signin")
  }

  const detail = await getAssignmentDetail(assignmentId)
  if (!detail) {
    notFound()
  }

  const { user } = session
  const isStudent = user.role === "student"
  const isTeacherOwner = user.role === "teacher" && detail.teacherId === user.id
  const isAdmin = user.role === "admin"
  const canEdit = isTeacherOwner || isAdmin
  const canSubmit = isStudent
  const submission = detail.mySubmission ?? null
  const teacherSubmissions = Array.isArray(detail.submissions) ? detail.submissions : []
  const dueDate = detail.dueDate ? new Date(detail.dueDate) : null
  const isOverdue = dueDate ? dueDate.getTime() < Date.now() : false

  const statsCards = [
    {
      label: "Bài nộp",
      value: detail.stats.totalSubmissions,
      description: "Tổng số học viên đã gửi bài",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Đã chấm",
      value: detail.stats.gradedSubmissions,
      description: "Bài tập đã có điểm",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Chờ chấm",
      value: detail.stats.pendingSubmissions,
      description: "Bài nộp đang chờ đánh giá",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <CustomBreadcrumb
          items={[
            { label: "Bài tập", href: "/assignments" },
            { label: detail.title },
          ]}
        />

        <Card className="shadow">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-semibold text-gray-900">{detail.title}</CardTitle>
                <CardDescription className="text-base">
                  {detail.className ?? "Lớp học"} • {detail.teacherName ?? "Giáo viên"}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{detail.maxScore ?? 100} điểm</Badge>
                {isOverdue && <Badge variant="destructive">Quá hạn</Badge>}
                {submission && (
                  <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                    {formatStatusLabel(submission.status)}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Hạn nộp: {formatDate(detail.dueDate)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(detail.dueDate)}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/assignments" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách
              </Link>
              {canSubmit && (
                <Link href={`/assignments/${assignmentId}/submit`}>
                  <Button className="inline-flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    {submission ? "Nộp lại bài" : "Nộp bài"}
                  </Button>
                </Link>
              )}
              {canEdit && (
                <Link href={`/assignments/${assignmentId}/edit`}>
                  <Button variant="outline" className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {statsCards.map((card) => (
                <Card key={card.label} className="bg-gray-50 border-none shadow-none">
                  <CardContent className="p-4">
                    <div className={`inline-flex items-center justify-center rounded-full ${card.bg} p-2 mb-3`}>
                      <Users className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Chi tiết bài tập</CardTitle>
              <CardDescription>Thông tin và yêu cầu dành cho học viên</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Mô tả</h3>
                <p className="text-gray-700 whitespace-pre-line">{detail.description ?? "Không có mô tả."}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Lịch học</h4>
                <p className="text-gray-600">{detail.classSchedule || "Chưa cập nhật"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin lớp học</CardTitle>
              <CardDescription>Giáo viên phụ trách và mô tả lớp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Lớp học</p>
                <Link href={`/classes/${detail.classId}`} className="text-base font-semibold text-blue-600 hover:underline">
                  {detail.className ?? `Lớp #${detail.classId}`}
                </Link>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Giáo viên</p>
                <p className="font-medium text-gray-900">{detail.teacherName ?? "Đang cập nhật"}</p>
                {detail.teacherEmail && <p className="text-sm text-gray-600">{detail.teacherEmail}</p>}
              </div>
              {detail.classDescription && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Giới thiệu lớp</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{detail.classDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {isStudent && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Bài làm của bạn</CardTitle>
              <CardDescription>Theo dõi trạng thái chấm điểm và tệp đã nộp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                      {formatStatusLabel(submission.status)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Đã nộp lúc {formatDateTime(submission.submittedAt)}
                    </span>
                  </div>
                  {submission.score !== null && (
                    <p className="text-gray-700">
                      Điểm số: <span className="font-semibold">{submission.score}</span>
                    </p>
                  )}
                  {submission.feedback && (
                    <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                      Nhận xét từ giáo viên: {submission.feedback}
                    </div>
                  )}
                  {submission.fileUrl && (
                    <Link href={submission.fileUrl} target="_blank" className="inline-flex items-center text-sm text-blue-600 hover:underline">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Tải tệp đã nộp
                    </Link>
                  )}
                  {submission.content && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Nội dung</p>
                      <p className="rounded-lg border bg-white p-3 text-sm text-gray-700 whitespace-pre-line">
                        {submission.content}
                      </p>
                    </div>
                  )}
                  <Link href={`/assignments/${assignmentId}/submit`}>
                    <Button variant="outline" className="inline-flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Nộp lại bài
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-white p-6 text-center text-gray-600">
                  <p>Bạn chưa nộp bài cho bài tập này.</p>
                  <Link href={`/assignments/${assignmentId}/submit`} className="inline-flex items-center justify-center mt-4">
                    <Button className="inline-flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Nộp ngay
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(isTeacherOwner || isAdmin) && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Bài nộp của học viên</CardTitle>
              <CardDescription>
                Danh sách học viên đã nộp bài cùng trạng thái chấm điểm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teacherSubmissions.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center text-gray-500">
                  Chưa có học viên nào nộp bài.
                </div>
              ) : (
                <div className="space-y-4">
                  {teacherSubmissions.map((submission) => (
                    <div key={submission.id} className="rounded-2xl border bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900">{submission.studentName ?? "Học viên"}</p>
                          <p className="text-sm text-gray-500">{submission.studentEmail}</p>
                        </div>
                        <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                          {formatStatusLabel(submission.status)}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <GradingDialog
                            submissionId={submission.id}
                            studentName={submission.studentName ?? "Học viên"}
                            initialScore={submission.score}
                            initialFeedback={submission.feedback}
                          />
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 text-sm text-gray-600 md:grid-cols-3">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          {formatDateTime(submission.submittedAt)}
                        </div>
                        <div>
                          Điểm: {submission.score ?? "--"}
                        </div>
                        {submission.fileUrl ? (
                          <Link href={submission.fileUrl} target="_blank" className="inline-flex items-center text-blue-600 hover:underline">
                            <Link2 className="h-4 w-4 mr-1" />Tệp đính kèm
                          </Link>
                        ) : (
                          <span>Không có tệp</span>
                        )}
                      </div>
                      {submission.content && (
                        <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-line">
                          {submission.content}
                        </p>
                      )}
                      {submission.feedback && (
                        <p className="mt-2 text-sm text-gray-600">Nhận xét: {submission.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
