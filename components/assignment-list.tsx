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

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`/api/assignments?classId=${classId}`);
        if (!response.ok) throw new Error("Failed to fetch assignments");
        const result = await response.json();
        const assignmentsData = result.data || result.assignments || result;
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [classId, toast]);

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
              <h3 className="font-bold text-lg mb-2">{assignment.title}</h3>
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

            <div className="flex flex-col gap-2 text-right">
              {getStatusBadge(assignment)}
              <Link href={`/assignments/${assignment.id}`}>
                <Button variant="outline" size="sm">
                  Chi Tiết
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
