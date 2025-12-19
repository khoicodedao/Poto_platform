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
  Users,
  ArrowLeft,
  Edit,
  Trash,
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

  const statusBadge = (s: ClassSession) => {
    switch (s.status) {
      case "scheduled":
        return <Badge className="bg-blue-600">Đã Lên Lịch</Badge>;
      case "in-progress":
        return <Badge className="bg-green-600">Đang Diễn Ra</Badge>;
      case "completed":
        return <Badge className="bg-gray-600">Đã Kết Thúc</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã Hủy</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Các Buổi Học</h2>
          <p className="text-gray-600 mt-1">Lớp: {className}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <Button size="lg" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Tạo Buổi Học
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <p className="text-gray-500 mb-4">Chưa có buổi học nào</p>
            <Link href={`/classes/${classId}/sessions/new`}>
              <Button>Tạo Buổi Học Đầu Tiên</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <Card key={s.id} className="hover:shadow-md">
              <CardContent>
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                      {statusBadge(s)}
                    </div>
                    {s.description && (
                      <p className="text-sm text-gray-600">{s.description}</p>
                    )}
                    <div className="text-sm text-gray-500 mt-2 flex gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />{" "}
                        {new Date(s.scheduledAt).toLocaleString("vi-VN")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> {s.durationMinutes} phút
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/classes/${classId}/sessions/${s.id}`}>
                      <Button variant="ghost">Xem</Button>
                    </Link>
                    <Button variant="outline" onClick={() => openEdit(s)}>
                      <Edit className="mr-2 h-4 w-4" /> Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openDeleteFn(s)}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Xóa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSession ? "Cập Nhật Buổi Học" : "Tạo Buổi Học"}
            </DialogTitle>
            <DialogDescription>
              {editingSession ? "Chỉnh sửa buổi học" : "Tạo buổi học mới"}
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
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa buổi học này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
