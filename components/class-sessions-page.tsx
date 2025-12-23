"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = useState<ClassSession | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

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
          icon: Circle,
          gradient: "from-blue-500 to-cyan-500",
          bgClass: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10",
          borderClass: "border-blue-500/30",
          textClass: "text-blue-600",
        };
      case "in-progress":
        return {
          label: "Đang Diễn Ra",
          icon: PlayCircle,
          gradient: "from-green-500 to-emerald-500",
          bgClass: "bg-gradient-to-r from-green-500/10 to-emerald-500/10",
          borderClass: "border-green-500/30",
          textClass: "text-green-600",
          pulse: true,
        };
      case "completed":
        return {
          label: "Đã Kết Thúc",
          icon: CheckCircle2,
          gradient: "from-purple-500 to-pink-500",
          bgClass: "bg-gradient-to-r from-purple-500/10 to-pink-500/10",
          borderClass: "border-purple-500/30",
          textClass: "text-purple-600",
        };
      case "cancelled":
        return {
          label: "Đã Hủy",
          icon: XCircle,
          gradient: "from-red-500 to-orange-500",
          bgClass: "bg-gradient-to-r from-red-500/10 to-orange-500/10",
          borderClass: "border-red-500/30",
          textClass: "text-red-600",
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

        <div className="relative flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                Các Buổi Học
              </h2>
            </div>
            <p className="text-white/90 text-lg font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Lớp: {className}
            </p>
            {sessions.length > 0 && (
              <div className="mt-4 flex gap-3">
                <div className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">
                    {sessions.length}
                  </div>
                  <div className="text-xs text-white/80">Tổng buổi học</div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">
                    {sessions.filter((s) => s.status === "completed").length}
                  </div>
                  <div className="text-xs text-white/80">Đã hoàn thành</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
            <Button
              size="lg"
              onClick={openCreate}
              className="bg-white text-purple-600 hover:bg-white/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" /> Tạo Buổi Học
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-2 animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="overflow-hidden border-2 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                    <div className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                    <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                    <div className="h-10 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Chưa có buổi học nào
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy tạo buổi học đầu tiên để bắt đầu lộ trình học tập
            </p>
            <Button
              onClick={openCreate}
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Plus className="mr-2 h-5 w-5" />
              Tạo Buổi Học Đầu Tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((s, index) => {
            const statusConfig = getStatusConfig(s.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={s.id}
                className={`group overflow-hidden border-2 ${statusConfig.borderClass} ${statusConfig.bgClass} hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      {/* Title and status */}
                      <div className="flex items-start gap-3 flex-wrap">
                        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${statusConfig.gradient} text-white text-xs font-bold shadow-sm`}>
                          #{index + 1}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 flex-1">
                          {s.title}
                        </h3>
                        <Badge
                          className={`${statusConfig.textClass} ${statusConfig.bgClass} border-2 ${statusConfig.borderClass} px-3 py-1 font-semibold shadow-sm flex items-center gap-1.5 ${statusConfig.pulse ? "animate-pulse" : ""
                            }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Description */}
                      {s.description && (
                        <p className="text-gray-600 leading-relaxed">
                          {s.description}
                        </p>
                      )}

                      {/* Info grid */}
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">
                              Thời gian
                            </div>
                            <div className="font-semibold text-gray-700">
                              {new Date(s.scheduledAt).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                            <Timer className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">
                              Thời lượng
                            </div>
                            <div className="font-semibold text-gray-700">
                              {s.durationMinutes} phút
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 min-w-fit">
                      <Link href={`/classes/${classId}/sessions/${s.id}`}>
                        <Button
                          variant="outline"
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                        >
                          <Eye className="mr-2 h-4 w-4" /> Xem
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => openEdit(s)}
                        className="w-full hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-200"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Sửa
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openDeleteFn(s)}
                        className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                      >
                        <Trash className="mr-2 h-4 w-4" /> Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>

                {/* Bottom gradient accent */}
                <div className={`h-1 bg-gradient-to-r ${statusConfig.gradient} opacity-60`} />
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {editingSession ? "Cập Nhật Buổi Học" : "Tạo Buổi Học"}
            </DialogTitle>
            <DialogDescription>
              {editingSession ? "Chỉnh sửa thông tin buổi học" : "Tạo buổi học mới cho lớp"}
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
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa buổi học <strong>"{deleteTarget?.title}"</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
