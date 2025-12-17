import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { getClassDetail } from "@/lib/actions/classes";
import { getCurrentUser } from "@/lib/auth";
import { CreateAssignmentForm } from "@/components/assignments/create-assignment-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  FolderOpen,
  MessageCircle,
  Pencil,
  Users,
  Video,
  Award,
  UserPlus,
  ChevronRight,
} from "lucide-react";

type PageProps = {
  params: { id: string };
};

const toDate = (value?: Date | string | null): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value?: Date | string | null) => {
  const date = toDate(value);
  if (!date) return "Đang cập nhật";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatRelativeTime = (value?: Date | string | null) => {
  const date = toDate(value);
  if (!date) return "Chưa có";
  return formatDistanceToNow(date, { addSuffix: true, locale: vi });
};

const formatDateTime = (value?: Date | string | null) => {
  const date = toDate(value);
  if (!date) return "Vừa xong";
  return date.toLocaleString("vi-VN");
};

const formatFileSize = (size?: number | null) => {
  if (!size || size <= 0) return "Không rõ";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(size) / Math.log(1024))
  );
  const value = size / Math.pow(1024, index);
  const digits = value >= 10 || index === 0 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[index]}`;
};

const getInitials = (name?: string | null) => {
  if (!name) return "NA";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "NA";
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  const initials = `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
  return initials || "NA";
};

const getAssignmentStatus = (date?: Date | string | null) => {
  const due = toDate(date);
  if (!due) {
    return { label: "Chưa có hạn", variant: "outline" as const };
  }

  const now = new Date();
  if (due.getTime() < now.getTime()) {
    return { label: "Quá hạn", variant: "destructive" as const };
  }

  const diff = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return {
    label: diff === 0 ? "Hạn nộp hôm nay" : `Còn ${diff} ngày`,
    variant: diff <= 1 ? ("destructive" as const) : ("secondary" as const),
  };
};

export default async function ClassDetailPage({ params }: PageProps) {
  const classId = Number(params.id);
  if (Number.isNaN(classId)) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  const detail = await getClassDetail(classId);
  if (!detail) {
    notFound();
  }

  const studentCount = detail.students.length;
  const assignmentCount = detail.assignments.length;
  const fileCount = detail.files.length;
  const capacityPercent =
    detail.maxStudents > 0
      ? Math.min(100, Math.round((studentCount / detail.maxStudents) * 100))
      : 0;
  const remainingSlots = Math.max(detail.maxStudents - studentCount, 0);
  const overdueAssignments = detail.assignments.filter((assignment) => {
    const due = toDate(assignment.dueDate);
    return due ? due.getTime() < Date.now() : false;
  }).length;
  const lastActivity =
    detail.recentMessages[0]?.createdAt ||
    detail.files[0]?.uploadedAt ||
    detail.assignments[0]?.createdAt ||
    detail.updatedAt ||
    detail.createdAt;
  const roomLabel = detail.roomId || `class-${detail.id}`;
  const statusLabel =
    studentCount >= detail.maxStudents
      ? "Đã đủ học viên"
      : studentCount === 0
      ? "Đang tuyển sinh"
      : "Đang hoạt động";
  const isOwner = user.role === "admin" || user.id === detail.teacherId;
  const upcomingAssignments = [...detail.assignments]
    .sort((a, b) => {
      const aDate = toDate(a.dueDate ?? a.createdAt);
      const bDate = toDate(b.dueDate ?? b.createdAt);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 3);
  const activities = detail.activities ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-gray-900">
                Trang chủ
              </Link>
            </li>
            <li className="text-gray-400">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li>
              <Link href="/classes" className="hover:text-gray-900">
                Lớp học
              </Link>
            </li>
            <li className="text-gray-400">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li className="font-medium text-gray-700">{detail.name}</li>
          </ol>
        </nav>

        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-white/20 text-white backdrop-blur">
                Phòng {roomLabel}
              </Badge>
              <Badge className="bg-white/20 text-white backdrop-blur">
                {statusLabel}
              </Badge>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/70">
                    Lớp học trực tuyến
                  </p>
                  <h1 className="text-3xl font-bold sm:text-4xl">
                    {detail.name}
                  </h1>
                </div>
                <p className="max-w-3xl text-white/90">
                  {detail.description ??
                    "Lớp học chưa có phần mô tả chi tiết. Hãy cập nhật để học viên hiểu rõ nội dung."}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{detail.schedule ?? "Lịch học đang cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {studentCount}/{detail.maxStudents} học viên
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Bắt đầu {formatDate(detail.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <Avatar className="h-14 w-14 border border-white/40">
                  {detail.teacher?.avatar ? (
                    <AvatarImage
                      src={detail.teacher.avatar}
                      alt={detail.teacher.name}
                    />
                  ) : null}
                  <AvatarFallback className="text-lg text-white">
                    {getInitials(detail.teacher?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Giáo viên phụ trách
                  </p>
                  <p className="text-lg font-semibold">
                    {detail.teacher?.name ?? "Chưa cập nhật"}
                  </p>
                  <p className="text-sm text-white/80">
                    {detail.teacher?.email ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/classroom/${detail.id}`}>
                <Button className="bg-white text-blue-700 hover:bg-blue-50">
                  <Video className="mr-2 h-4 w-4" />
                  Vào phòng học
                </Button>
              </Link>
              {isOwner ? (
                <Link href={`/classes/${detail.id}/edit`}>
                  <Button className="border-white/50 bg-white/10 text-white hover:bg-white/20">
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa lớp học
                  </Button>
                </Link>
              ) : null}
              <Link href="/assignments">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Xem danh sách bài tập
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sĩ số hiện tại</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {studentCount} học viên
                  </p>
                </div>
                <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <Progress value={capacityPercent} className="mt-4" />
              <p className="mt-2 text-xs text-gray-500">
                Còn {remainingSlots} chỗ trống
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Bài tập & kiểm tra</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignmentCount}
                  </p>
                </div>
                <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {overdueAssignments} bài tập quá hạn
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tài liệu lớp học</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {fileCount}
                  </p>
                </div>
                <div className="rounded-full bg-purple-50 p-3 text-purple-600">
                  <FolderOpen className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Cập nhật gần nhất {formatRelativeTime(detail.files[0]?.uploadedAt)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Hoạt động</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {detail.recentMessages.length || "0"}
                  </p>
                </div>
                <div className="rounded-full bg-rose-50 p-3 text-rose-600">
                  <MessageCircle className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Hoạt động gần nhất {formatRelativeTime(lastActivity)}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin tổng quan</CardTitle>
                <CardDescription>
                  Lịch học, phòng học và các mốc quan trọng của lớp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <dt className="text-sm text-gray-500">Lịch học</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {detail.schedule ?? "Chưa thiết lập"}
                    </dd>
                  </div>
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <dt className="text-sm text-gray-500">Phòng học</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {roomLabel}
                    </dd>
                  </div>
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <dt className="text-sm text-gray-500">Số lượng tối đa</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {detail.maxStudents} học viên
                    </dd>
                  </div>
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <dt className="text-sm text-gray-500">Ngày tạo</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {formatDate(detail.createdAt)}
                    </dd>
                  </div>
                </dl>

                <div className="rounded-2xl border p-5">
                  <p className="text-sm font-semibold text-gray-900">
                    Ghi chú nhanh
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    {detail.description
                      ? detail.description
                      : "Chưa có ghi chú cho lớp học này."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>
                  Cập nhật khi có bài tập mới hoặc học viên tham gia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Lớp học chưa có hoạt động nào gần đây.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between rounded-2xl border p-4"
                      >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-gray-100 p-2">
                          {activity.type === "assignment" ? (
                            <Award className="h-5 w-5 text-orange-500" />
                          ) : (
                            <UserPlus className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {activity.title}
                          </p>
                          {activity.description && (
                            <p className="text-sm text-gray-500">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-gray-400">
                          {formatDateTime(activity.createdAt)}
                        </p>
                        {activity.type === "assignment" &&
                          activity.assignmentId && (
                            <Link
                              href={`/assignments/${activity.assignmentId}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Xem bài
                            </Link>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Danh sách học viên</CardTitle>
                  <CardDescription>
                    Quản lý học viên đã được ghi danh
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {studentCount}/{detail.maxStudents} học viên
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {detail.students.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Chưa có học viên nào trong lớp học này.
                  </p>
                ) : (
                  detail.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between rounded-2xl border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {student.avatar ? (
                            <AvatarImage
                              src={student.avatar}
                              alt={student.name}
                            />
                          ) : null}
                          <AvatarFallback>
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Ghi danh</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(student.enrolledAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>
                  Nhật ký tin nhắn và cập nhật trong lớp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {detail.recentMessages.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Chưa có hoạt động nào. Bắt đầu trao đổi trong phòng học để
                    cập nhật tiến độ lớp.
                  </p>
                ) : (
                  detail.recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="flex gap-3 rounded-2xl border p-4"
                    >
                      <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">
                            {message.senderName ?? "Hệ thống"}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Bài tập trong lớp</CardTitle>
                  <CardDescription>
                    Sắp xếp theo hạn nộp gần nhất
                  </CardDescription>
                </div>
                <Link href="/assignments" className="text-sm text-blue-600">
                  Xem tất cả
                </Link>
              </CardHeader>
              <CardContent className="space-y-6">
                {isOwner ? (
                  <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-3">
                      Giao bài tập mới
                    </p>
                    <CreateAssignmentForm classId={detail.id} />
                  </div>
                ) : null}
                {upcomingAssignments.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Lớp học chưa có bài tập nào.
                  </p>
                ) : (
                  upcomingAssignments.map((assignment) => {
                    const status = getAssignmentStatus(assignment.dueDate);
                    return (
                      <div
                        key={assignment.id}
                        className="rounded-2xl border p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {assignment.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              Điểm tối đa: {assignment.maxScore ?? 100}
                            </p>
                          </div>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {assignment.description ?? "Không có mô tả."}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {assignment.dueDate
                              ? formatDate(assignment.dueDate)
                              : "Chưa có deadline"}
                          </div>
                          <div className="flex items-center gap-2">
                            {user.role === "student" ? (
                              <Link
                                href={`/assignments/${assignment.id}/submit`}
                                className="text-blue-600 hover:underline"
                              >
                                Nộp bài
                              </Link>
                            ) : isOwner ? (
                              <Link
                                href={`/assignments/${assignment.id}/edit`}
                                className="text-blue-600 hover:underline"
                              >
                                Chỉnh sửa
                              </Link>
                            ) : (
                              <span />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tài liệu & tài nguyên</CardTitle>
                  <CardDescription>
                    Các tệp được chia sẻ trong lớp
                  </CardDescription>
                </div>
                <Link href="/files" className="text-sm text-blue-600">
                  Quản lý tệp
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {detail.files.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Chưa có tài liệu cho lớp này.
                  </p>
                ) : (
                  detail.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-2xl border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-gray-100 p-2 text-gray-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.type ?? "N/A"} • {formatFileSize(file.size)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Cập nhật {formatRelativeTime(file.uploadedAt)} bởi{" "}
                            {file.uploaderName ?? "Ẩn danh"}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        Tải xuống
                      </Link>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
