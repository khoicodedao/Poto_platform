"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Plus,
  Clock,
  Timer,
  ArrowLeft,
  Edit,
  Trash,
  Video,
  Calendar,
  CheckCircle2,
  PlayCircle,
  XCircle,
  Circle,
  Eye,
  LogIn,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ClassSessionForm } from "@/components/class-session-form";
import { calculateSessionStatus } from "@/lib/utils/session-status";
import { MeshGradientHeader } from "@/components/ui/mesh-gradient-header";
import { ClassBreadcrumb } from "@/components/class-breadcrumb";

type ClassSession = {
  id: number;
  title: string;
  scheduledAt: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  durationMinutes: number;
  sessionNumber?: number;
  description?: string;
};

export function ClassSessionsPage({
  classId,
  className,
}: {
  classId: number;
  className: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = useState<ClassSession | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  async function fetchUserRole() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user?.role || null);
      }
    } catch (e) {
      console.error("Failed to fetch user role:", e);
    }
  }

  async function fetchSessions() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/class-sessions?classId=${classId}`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(data || []);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setEditingSession(null);
    setIsDialogOpen(true);
  }

  function openEdit(s: ClassSession) {
    setEditingSession(s);
    setIsDialogOpen(true);
  }

  function openDeleteFn(s: ClassSession) {
    setDeleteTarget(s);
    setIsDeleteOpen(true);
  }

  async function doDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/class-sessions/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      await fetchSessions();
    } catch (e) {
      setError(String(e));
    }
  }

  const getStatusConfig = (status: ClassSession["status"]) => {
    switch (status) {
      case "scheduled":
        return {
          label: "Đã Lên Lịch",
          icon: Calendar,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          badgeVariant: "default" as const, // We'll assume a custom mapping or just use styling
        };
      case "in-progress":
        return {
          label: "Đang Diễn Ra",
          icon: PlayCircle,
          color: "text-indigo-600",
          bgColor: "bg-indigo-50",
          borderColor: "border-indigo-200",
          pulse: true,
        };
      case "completed":
        return {
          label: "Đã Kết Thúc",
          icon: CheckCircle2,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
        };
      case "cancelled":
        return {
          label: "Đã Hủy",
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumb Navigation */}
      <ClassBreadcrumb
        classId={classId}
        className={className}
        currentPage="Buổi học"
      />

      {/* Header with Modern Mesh Gradient Background */}
      <MeshGradientHeader>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-3 py-1 text-xs font-medium transition-colors">
                <Video className="mr-1.5 h-3.5 w-3.5" />
                Quản lý buổi học
              </Badge>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-3 py-1 text-xs font-medium transition-colors">
                Lớp: {className}
              </Badge>
            </div>

            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Danh sách buổi học
            </h2>
            <p className="text-blue-100 max-w-2xl">
              Theo dõi lịch trình, tham gia lớp học trực tuyến và quản lý nội dung giảng dạy.
            </p>

            {sessions.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <span>{sessions.length} tổng số</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <span>{sessions.filter((s) => s.status === "completed").length} hoàn thành</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
            {userRole && userRole !== "student" && (
              <Button
                size="lg"
                onClick={openCreate}
                className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg hover:shadow-xl font-bold transition-all hover:-translate-y-0.5 border-0"
              >
                <Plus className="mr-2 h-5 w-5" /> Tạo Buổi Học
              </Button>
            )}
          </div>
        </div>
      </MeshGradientHeader>

      {error && (
        <Alert variant="destructive" className="border-2 animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 w-full rounded-2xl bg-gray-100 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có buổi học nào
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {userRole === "student"
                ? "Giáo viên chưa lên lịch cho buổi học nào. Vui lòng quay lại sau."
                : "Bắt đầu bằng cách tạo buổi học đầu tiên cho lớp của bạn."
              }
            </p>
            {userRole && userRole !== "student" && (
              <Button
                onClick={openCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm buổi học ngay
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s, index) => {
            // Calculate dynamic status based on current time
            const dynamicStatus = calculateSessionStatus(
              s.scheduledAt,
              s.durationMinutes || 60,
              s.status
            );
            const statusConfig = getStatusConfig(dynamicStatus);
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={s.id}
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-${statusConfig.color.split('-')[1]}-200 border-l-4 ${dynamicStatus === 'in-progress' ? 'border-l-indigo-500 shadow-md ring-1 ring-indigo-100' :
                  dynamicStatus === 'completed' ? 'border-l-emerald-500' :
                    dynamicStatus === 'cancelled' ? 'border-l-red-500' : 'border-l-blue-500'
                  }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">

                    {/* Time Box */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl bg-gray-50 p-4 min-w-[100px] border border-gray-100">
                      <span className="text-2xl font-bold text-gray-900">
                        {new Date(s.scheduledAt).getDate()}
                      </span>
                      <span className="text-xs uppercase font-medium text-gray-500">
                        Tháng {new Date(s.scheduledAt).getMonth() + 1}
                      </span>
                      <div className="mt-2 text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded border border-gray-100">
                        {new Date(s.scheduledAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 mb-1">
                        <Badge variant="outline" className={`${statusConfig.color} ${statusConfig.bgColor} border-0 font-bold`}>
                          {statusConfig.pulse && <span className="mr-1.5 relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                          </span>}
                          {statusConfig.label}
                        </Badge>
                        <span className="text-xs text-gray-400 font-medium">Buổi {index + 1}</span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {s.title}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {s.description && (
                          <p className="w-full text-gray-600 line-clamp-1">
                            {s.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{s.durationMinutes} phút</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap md:flex-col gap-3 w-full md:w-auto md:min-w-[180px]">
                      {dynamicStatus === "in-progress" ? (
                        <Link href={`/classroom/${classId}`} className="w-full">
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 animate-pulse font-bold">
                            <LogIn className="mr-2 h-4 w-4" /> Vào Lớp Ngay
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/classes/${classId}/sessions/${s.id}`} className="w-full">
                          <Button variant="outline" className="w-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-medium text-gray-700 transition-colors">
                            <Eye className="mr-2 h-4 w-4" /> Xem Chi Tiết
                          </Button>
                        </Link>
                      )}

                      {userRole && userRole !== "student" && (
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(s)}
                            className="flex-1 h-8 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteFn(s)}
                            className="flex-1 h-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingSession ? "Cập Nhật Buổi Học" : "Tạo Buổi Học Mới"}
            </DialogTitle>
            <DialogDescription>
              {editingSession ? "Thay đổi thông tin chi tiết cho buổi học này." : "Điền thông tin để lên lịch buổi học mới."}
            </DialogDescription>
          </DialogHeader>
          <ClassSessionForm
            classId={classId}
            sessionId={editingSession?.id}
            initialData={
              editingSession
                ? {
                  title: editingSession.title,
                  description: editingSession.description,
                  scheduledAt: new Date(editingSession.scheduledAt),
                  durationMinutes: editingSession.durationMinutes,
                  sessionNumber: editingSession.sessionNumber,
                }
                : undefined
            }
            onSuccess={async () => {
              setIsDialogOpen(false);
              setEditingSession(null);
              await fetchSessions();
              toast({
                title: editingSession ? "Đã cập nhật" : "Đã tạo mới",
                description: `Buổi học đã được ${editingSession ? "cập nhật" : "lên lịch"} thành công.`,
                variant: "default",
                className: "bg-green-50 border-green-200 text-green-900"
              });
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Xóa buổi học này?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn chắc chắn muốn xóa <strong>"{deleteTarget?.title}"</strong>?
              <br />Hành động này sẽ xóa vĩnh viễn dữ liệu buổi học và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
