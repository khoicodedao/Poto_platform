"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { Edit, Trash } from "lucide-react";
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
import { AssignmentScheduleForm } from "@/components/assignment-schedule-form";

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  isVisible: boolean;
  scheduledReleaseAt?: string;
  scheduledCloseAt?: string;
  autoReleaseEnabled: boolean;
  autoCloseEnabled: boolean;
}

interface AssignmentListProps {
  classId: number;
  isTeacher?: boolean;
}

export function AssignmentList({
  classId,
  isTeacher = false,
}: AssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [classId, toast]);

  async function fetchAssignments() {
    try {
      const response = await fetch(`/api/assignments?classId=${classId}`);
      if (!response.ok) throw new Error("Failed to fetch assignments");
      const result = await response.json();
      const assignmentsData = result.data || result.assignments || result;
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function openEdit(assignment: Assignment) {
    setEditingAssignment(assignment);
    setIsDialogOpen(true);
  }

  function openDeleteFn(assignment: Assignment) {
    setDeleteTarget(assignment);
    setIsDeleteOpen(true);
  }

  async function doDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/assignments/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      await fetchAssignments();
      toast({
        title: "Thành công",
        description: "Xóa bài tập thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Xóa bài tập thất bại",
        variant: "destructive",
      });
    }
  }

  const getStatusBadge = (assignment: Assignment) => {
    if (!assignment.isVisible) {
      return <Badge variant="outline">Chưa Phát Hành</Badge>;
    }

    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    if (now > dueDate) {
      return <Badge variant="destructive">Quá Hạn</Badge>;
    }

    const daysLeft = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft <= 1) {
      return <Badge variant="destructive">Sắp Hết Hạn</Badge>;
    }

    if (daysLeft <= 3) {
      return <Badge variant="secondary">Sắp Hết Hạn</Badge>;
    }

    return <Badge variant="outline">Đang Thực Hiện</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">Chưa có bài tập nào</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {assignments.map((assignment) => {
          const now = new Date();
          const dueDate = new Date(assignment.dueDate);
          const isOverdue = now > dueDate;
          // Determine status color: Red if overdue, Green if active, Gray if hidden
          const statusColor = !assignment.isVisible
            ? "border-l-gray-400"
            : isOverdue
              ? "border-l-red-500"
              : "border-l-emerald-500";

          const statusShadow = !assignment.isVisible
            ? "hover:shadow-gray-200"
            : isOverdue
              ? "hover:shadow-red-200"
              : "hover:shadow-emerald-200 shadow-sm";

          return (
            <Card
              key={assignment.id}
              className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 ${statusColor} ${statusShadow}`}
            >
              <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">

                {/* Status/Score Box */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl bg-gray-50 p-4 min-w-[100px] border border-gray-100">
                  <span className="text-2xl font-bold text-gray-900">
                    {assignment.maxScore}
                  </span>
                  <span className="text-xs uppercase font-medium text-gray-500">
                    Điểm tối đa
                  </span>
                  <div className={`mt-2 text-xs font-bold px-2 py-1 rounded border ${!assignment.isVisible ? 'bg-gray-100 text-gray-500 border-gray-200' : isOverdue ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {getStatusBadge(assignment)}
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/assignments/${assignment.id}`} className="group-hover:text-indigo-600 transition-colors">
                      <h3 className="font-bold text-xl text-gray-900">
                        {assignment.title}
                      </h3>
                    </Link>
                  </div>

                  <p className="text-gray-600 line-clamp-2 text-sm">{assignment.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-700">Hạn nộp:</span>
                      {assignment.dueDate
                        ? format(new Date(assignment.dueDate), "HH:mm dd/MM/yyyy", {
                          locale: vi,
                        })
                        : "Không thời hạn"}
                    </div>

                    {isTeacher && (
                      <>
                        {assignment.autoReleaseEnabled && (
                          <div className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                            📅 Mở: {assignment.scheduledReleaseAt && format(new Date(assignment.scheduledReleaseAt), "dd/MM HH:mm", { locale: vi })}
                          </div>
                        )}
                        {assignment.autoCloseEnabled && (
                          <div className="flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">
                            ⏱️ Đóng: {assignment.scheduledCloseAt && format(new Date(assignment.scheduledCloseAt), "dd/MM HH:mm", { locale: vi })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2 min-w-fit w-full md:w-auto">
                  <Link href={`/assignments/${assignment.id}`} className="w-full">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all font-medium">
                      Chi Tiết
                    </Button>
                  </Link>

                  {isTeacher && (
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(assignment)}
                        className="flex-1 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteFn(assignment)}
                        className="flex-1 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAssignment ? "Cập Nhật Bài Tập" : "Tạo Bài Tập"}
            </DialogTitle>
            <DialogDescription>
              {editingAssignment
                ? "Chỉnh sửa thông tin bài tập"
                : "Tạo một bài tập mới"}
            </DialogDescription>
          </DialogHeader>
          {editingAssignment && (
            <AssignmentScheduleForm
              classId={classId}
              assignmentId={editingAssignment.id}
              initialData={{
                title: editingAssignment.title,
                description: editingAssignment.description,
                dueDate: new Date(editingAssignment.dueDate),
                maxScore: editingAssignment.maxScore,
                isVisible: editingAssignment.isVisible,
                scheduledReleaseAt: editingAssignment.scheduledReleaseAt
                  ? new Date(editingAssignment.scheduledReleaseAt)
                  : undefined,
                scheduledCloseAt: editingAssignment.scheduledCloseAt
                  ? new Date(editingAssignment.scheduledCloseAt)
                  : undefined,
                autoReleaseEnabled: editingAssignment.autoReleaseEnabled,
                autoCloseEnabled: editingAssignment.autoCloseEnabled,
              }}
              onSuccess={async () => {
                setIsDialogOpen(false);
                setEditingAssignment(null);
                await fetchAssignments();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài tập</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa bài tập "{deleteTarget?.title}". Hành động này không
              thể hoàn tác.
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
