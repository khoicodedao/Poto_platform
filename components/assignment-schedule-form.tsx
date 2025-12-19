"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface AssignmentScheduleFormProps {
  classId: number;
  assignmentId?: number;
  initialData?: {
    title: string;
    description: string;
    dueDate: Date;
    maxScore: number;
    isVisible: boolean;
    scheduledReleaseAt?: Date;
    scheduledCloseAt?: Date;
    autoReleaseEnabled: boolean;
    autoCloseEnabled: boolean;
  };
  onSuccess?: () => void;
}

export function AssignmentScheduleForm({
  classId,
  assignmentId,
  initialData,
  onSuccess,
}: AssignmentScheduleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return "";
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    maxScore: initialData?.maxScore ?? 100,
    dueDate: formatDateForInput(initialData?.dueDate),
    autoReleaseEnabled: initialData?.autoReleaseEnabled ?? false,
    autoCloseEnabled: initialData?.autoCloseEnabled ?? false,
    scheduledReleaseAt: formatDateForInput(initialData?.scheduledReleaseAt),
    scheduledCloseAt: formatDateForInput(initialData?.scheduledCloseAt),
    allowPartialSubmission: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = assignmentId
        ? `/api/assignments/${assignmentId}`
        : "/api/assignments";
      const method = assignmentId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          classId,
          isVisible: !formData.autoReleaseEnabled,
          dueDate: new Date(formData.dueDate).toISOString(),
          scheduledReleaseAt: formData.scheduledReleaseAt
            ? new Date(formData.scheduledReleaseAt).toISOString()
            : null,
          scheduledCloseAt: formData.scheduledCloseAt
            ? new Date(formData.scheduledCloseAt).toISOString()
            : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${assignmentId ? "update" : "create"} assignment`
        );
      }

      toast({
        title: "Success",
        description: assignmentId
          ? "Cập nhật bài tập thành công"
          : "Bài tập được tạo thành công",
      });

      if (!assignmentId) {
        setFormData({
          title: "",
          description: "",
          maxScore: 100,
          dueDate: "",
          autoReleaseEnabled: false,
          autoCloseEnabled: false,
          scheduledReleaseAt: "",
          scheduledCloseAt: "",
          allowPartialSubmission: false,
        });
      }

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">
        {assignmentId ? "Cập Nhật Bài Tập" : "Tạo Bài Tập Mới"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Tiêu đề bài tập</Label>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="VD: Bài tập chương 1"
            required
          />
        </div>

        <div>
          <Label>Mô tả chi tiết</Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Hướng dẫn chi tiết cho học sinh..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols- gap-4">
          <div>
            <Label>Điểm tối đa </Label>
            <Input
              type="number"
              value={formData.maxScore}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxScore: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label>Hạn nộp</Label>
            <Input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="border p-4 rounded-lg space-y-3">
          <h3 className="font-bold">Lên Lịch Tự Động</h3>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.autoReleaseEnabled}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  autoReleaseEnabled: checked as boolean,
                })
              }
            />
            <Label>Phát hành tự động vào thời gian</Label>
          </div>
          {formData.autoReleaseEnabled && (
            <Input
              type="datetime-local"
              value={formData.scheduledReleaseAt}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scheduledReleaseAt: e.target.value,
                })
              }
              placeholder="Chọn thời gian phát hành"
            />
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.autoCloseEnabled}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  autoCloseEnabled: checked as boolean,
                })
              }
            />
            <Label>Đóng bài tập tự động vào thời gian</Label>
          </div>
          {formData.autoCloseEnabled && (
            <Input
              type="datetime-local"
              value={formData.scheduledCloseAt}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scheduledCloseAt: e.target.value,
                })
              }
              placeholder="Chọn thời gian đóng"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={formData.allowPartialSubmission}
            onCheckedChange={(checked) =>
              setFormData({
                ...formData,
                allowPartialSubmission: checked as boolean,
              })
            }
          />
          <Label>Cho phép nộp bài từng phần</Label>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading
            ? assignmentId
              ? "Đang cập nhật..."
              : "Đang tạo..."
            : assignmentId
            ? "Cập Nhật Bài Tập"
            : "Tạo Bài Tập"}
        </Button>
      </form>
    </Card>
  );
}
