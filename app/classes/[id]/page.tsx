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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { MeshGradientSection } from "@/components/ui/mesh-gradient-header";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 pb-12">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
        <nav className="flex items-center text-sm font-medium text-gray-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
          <Link href="/classes" className="hover:text-indigo-600 transition-colors">
            Lớp học
          </Link>
          <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
          <span className="text-gray-900 font-semibold">{detail.name}</span>
        </nav>

        {/* Hero Section */}
        <MeshGradientSection>
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-4 py-1.5 text-sm font-medium transition-colors">
                Phòng {roomLabel}
              </Badge>
              <Badge className={`border-0 backdrop-blur-md px-4 py-1.5 text-sm font-medium transition-colors ${statusLabel === 'Đang hoạt động'
                ? 'bg-emerald-500/20 text-emerald-100'
                : 'bg-white/20 text-white'
                }`}>
                {statusLabel}
              </Badge>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                    {detail.name}
                  </h1>
                  <p className="text-lg text-blue-100 leading-relaxed max-w-xl">
                    {detail.description ??
                      "Lớp học chưa có phần mô tả chi tiết. Hãy cập nhật để học viên hiểu rõ nội dung."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-6 text-sm font-medium text-blue-100">
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                    <Calendar className="h-4 w-4 text-blue-200" />
                    <span>{detail.schedule ?? "Lịch học đang cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                    <Users className="h-4 w-4 text-blue-200" />
                    <span>
                      {studentCount}/{detail.maxStudents} học viên
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                    <Clock className="h-4 w-4 text-blue-200" />
                    <span>Bắt đầu {formatDate(detail.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md shadow-lg lg:min-w-[280px]">
                <Avatar className="h-16 w-16 border-2 border-white/20 shadow-md">
                  {detail.teacher?.avatar ? (
                    <AvatarImage
                      src={detail.teacher.avatar}
                      alt={detail.teacher.name}
                    />
                  ) : null}
                  <AvatarFallback className="bg-indigo-700 text-xl font-bold text-white">
                    {getInitials(detail.teacher?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs uppercase tracking-wider text-blue-200 font-bold mb-1">
                    Giáo viên phụ trách
                  </p>
                  <p className="text-xl font-bold">
                    {detail.teacher?.name ?? "Chưa cập nhật"}
                  </p>
                  <p className="text-sm text-blue-100 opacity-80">
                    {detail.teacher?.email ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
              <Link href={`/classroom/${detail.id}`}>
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 border-0">
                  <Video className="mr-2 h-5 w-5" />
                  Vào phòng học
                </Button>
              </Link>
              {isOwner && (
                <Link href={`/classes/${detail.id}/edit`}>
                  <Button size="lg" className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-sm font-semibold transition-all hover:-translate-y-0.5">
                    <Pencil className="mr-2 h-5 w-5" />
                    Chỉnh sửa
                  </Button>
                </Link>
              )}
              <Link href="/assignments">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-semibold"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Bài tập
                </Button>
              </Link>
            </div>
          </div>
        </MeshGradientSection>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-2xl bg-blue-50 p-3 group-hover:bg-blue-100 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-medium">
                  {capacityPercent}%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Sĩ số hiện tại</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">{studentCount}</p>
                  <span className="text-sm text-gray-500">/ {detail.maxStudents}</span>
                </div>
              </div>
              <Progress value={capacityPercent} className="mt-4 h-2 bg-blue-100" indicatorClassName="bg-blue-600" />
              <p className="mt-2 text-xs font-medium text-blue-600 flex items-center gap-1">
                <UserPlus className="h-3 w-3" />
                Còn {remainingSlots} chỗ trống
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-2xl bg-indigo-50 p-3 group-hover:bg-indigo-100 transition-colors">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                {overdueAssignments > 0 && (
                  <Badge variant="destructive" className="font-medium animate-pulse">
                    {overdueAssignments} quá hạn
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Bài tập & Nhiệm vụ</p>
                <p className="text-2xl font-bold text-gray-900">{assignmentCount}</p>
              </div>
              <p className="mt-4 text-xs font-medium text-gray-500">
                Lần cuối: {detail.assignments.length > 0 ? formatRelativeTime(detail.assignments[0].createdAt) : "Chưa có"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-2xl bg-purple-50 p-3 group-hover:bg-purple-100 transition-colors">
                  <FolderOpen className="h-6 w-6 text-purple-600" />
                </div>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 font-medium">
                  {fileCount} tệp
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Tài liệu lớp học</p>
                <p className="text-2xl font-bold text-gray-900">{fileCount}</p>
              </div>
              <p className="mt-4 text-xs font-medium text-gray-500">
                Mới nhất: {detail.files.length > 0 ? formatRelativeTime(detail.files[0]?.uploadedAt) : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-2xl bg-rose-50 p-3 group-hover:bg-rose-100 transition-colors">
                  <MessageCircle className="h-6 w-6 text-rose-600" />
                </div>
                <Badge variant="secondary" className="bg-rose-50 text-rose-700 font-medium">
                  {detail.recentMessages.length} tin nhắn
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Thảo luận lớp</p>
                <p className="text-2xl font-bold text-gray-900">{detail.recentMessages.length}</p>
              </div>
              <p className="mt-4 text-xs font-medium text-gray-500">
                Hoạt động: {formatRelativeTime(lastActivity)}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="space-y-8 lg:col-span-2">

            {/* Info Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm border-l-4 border-l-indigo-500">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Lịch Học Định Kỳ</h3>
                  </div>
                  <p className="text-gray-600 pl-8">{detail.schedule ?? "Chưa thiết lập lịch học"}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm border-l-4 border-l-purple-500">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Sĩ Số Lớp</h3>
                  </div>
                  <p className="text-gray-600 pl-8">{detail.maxStudents} học viên tối đa</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Hoạt động gần đây</CardTitle>
                    <CardDescription className="text-purple-100">Cập nhật mới nhất của lớp học</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                      <Clock className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500">Chưa có hoạt động nào được ghi nhận</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {activities.map((activity) => (
                      <div key={activity.id} className="group flex gap-4 p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`rounded-xl p-2.5 ${activity.type === 'assignment' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {activity.type === 'assignment' ? <Award className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate pr-4">
                              {activity.title}
                            </p>
                            <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                              {formatDateTime(activity.createdAt)}
                            </span>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {activity.description}
                            </p>
                          )}

                          {activity.type === "assignment" && activity.assignmentId && (
                            <Link href={`/assignments/${activity.assignmentId}`} className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                              Xem chi tiết <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Students List */}
            <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Danh sách học viên</CardTitle>
                    <CardDescription className="text-blue-100">{studentCount} học viên đã tham gia</CardDescription>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-md">
                  {studentCount}/{detail.maxStudents}
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                {detail.students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có học viên nào tham gia lớp học.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {detail.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all"
                      >
                        <Avatar className="h-10 w-10 border border-gray-200">
                          {student.avatar && <AvatarImage src={student.avatar} alt={student.name} />}
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {formatDate(student.enrolledAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Thảo luận mới nhất</CardTitle>
                    <CardDescription className="text-cyan-100">Tin nhắn từ phòng chat</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {detail.recentMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có tin nhắn nào.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {detail.recentMessages.map((message) => (
                      <div key={message.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-gray-900">{message.senderName ?? "Hệ thống"}</span>
                          <span className="text-xs text-gray-400">{formatRelativeTime(message.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          {message.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Assignments Column */}
            <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Bài tập</CardTitle>
                  </div>
                  <Link href="/assignments" className="text-sm font-medium text-white hover:text-white/80 hover:underline">
                    Xem tất cả
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                {isOwner && (
                  <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-4 text-center hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                    <p className="text-sm font-medium text-indigo-900 mb-3">
                      Quản lý bài tập
                    </p>
                    <CreateAssignmentForm classId={detail.id} />
                  </div>
                )}

                {upcomingAssignments.length === 0 ? (
                  <div className="text-center py-6">
                    <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Chưa có bài tập nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAssignments.map((assignment) => {
                      const status = getAssignmentStatus(assignment.dueDate);
                      return (
                        <div
                          key={assignment.id}
                          className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
                        >
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                              {assignment.title}
                            </h4>
                            <Badge variant={status.variant} className="shrink-0 text-[10px] px-2 py-0.5">
                              {status.label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{assignment.dueDate ? formatDate(assignment.dueDate) : "Không có hạn"}</span>
                            <span className="mx-1">•</span>
                            <span className="font-medium text-gray-700">{assignment.maxScore ?? 100} điểm</span>
                          </div>

                          <div className="flex justify-end border-t border-gray-50 pt-3">
                            {user.role === "student" ? (
                              <Link href={`/assignments/${assignment.id}/submit`} className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                                Nộp bài ngay
                              </Link>
                            ) : isOwner ? (
                              <Link href={`/assignments/${assignment.id}/edit`} className="text-xs font-medium text-gray-600 hover:text-indigo-600 flex items-center gap-1 bg-gray-50 hover:bg-indigo-50 px-2 py-1 rounded transition-colors">
                                <Pencil className="w-3 h-3" /> Chỉnh sửa
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Files Column */}
            <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Tài liệu</CardTitle>
                  </div>
                  <Link href="/files" className="text-sm font-medium text-white hover:text-white/80 hover:underline">
                    Xem thêm
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {detail.files.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    Chưa có tài liệu nào.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detail.files.slice(0, 5).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="rounded-lg bg-teal-50 p-2 text-teal-600 group-hover:bg-teal-100 transition-colors">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate max-w-[150px]">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {formatFileSize(file.size)} • {formatRelativeTime(file.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={file.url}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
