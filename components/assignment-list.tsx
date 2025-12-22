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
      <h2 className="text-xl font-bold mb-4">Danh Sách Bài Tập</h2>
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <Link href={`/assignments/${assignment.id}`}>
                <h3 className="font-bold text-lg mb-2 hover:text-blue-600 cursor-pointer transition-colors">
                  {assignment.title}
                </h3>
              </Link>
              <p className="text-gray-600 mb-3">{assignment.description}</p>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="font-semibold">Hạn Nộp:</span>
                  {assignment.dueDate
                    ? format(new Date(assignment.dueDate), "HH:mm dd/MM/yyyy", {
                      locale: vi,
                    })
                    : "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Điểm Tối Đa:</span>
                  {assignment.maxScore}
                </div>
              </div>

              {isTeacher && (
                <div className="text-xs text-gray-600 space-y-1">
                  {assignment.autoReleaseEnabled && (
                    <div>
                      📅 Auto-release:{" "}
                      {assignment.scheduledReleaseAt &&
                        format(
                          new Date(assignment.scheduledReleaseAt),
                          "dd/MM HH:mm",
                          { locale: vi }
                        )}
                    </div>
                  )}
                  {assignment.autoCloseEnabled && (
                    <div>
                      ⏱️ Auto-close:{" "}
                      {assignment.scheduledCloseAt &&
                        format(
                          new Date(assignment.scheduledCloseAt),
                          "dd/MM HH:mm",
                          { locale: vi }
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-row gap-2 text-right">
              {isTeacher && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(assignment)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteFn(assignment)}
                  >
                    <Trash className="mr-2 h-4 w-4" /> Xóa
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}

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
