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
  onSuccess?: () => void;
}

export function AssignmentScheduleForm({
  classId,
  onSuccess,
}: AssignmentScheduleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
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

      if (!response.ok) throw new Error("Failed to create assignment");

      toast({
        title: "Success",
        description: "Bài tập được tạo thành công",
      });

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
      <h2 className="text-xl font-bold mb-4">Tạo Bài Tập Mới</h2>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Điểm tối đa</Label>
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
          {isLoading ? "Đang tạo..." : "Tạo Bài Tập"}
        </Button>
      </form>
    </Card>
  );
}
