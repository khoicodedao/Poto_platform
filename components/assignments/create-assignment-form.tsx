"use client";

import { useState, useTransition } from "react";
import { createAssignment } from "@/lib/actions/assignments";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  classId: number;
};

export function CreateAssignmentForm({ classId }: Props) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
  });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Chưa nhập tiêu đề",
        description: "Vui lòng thêm tiêu đề cho bài tập.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await createAssignment({
        title: formData.title.trim(),
        description: formData.description.trim(),
        classId,
        maxScore: formData.maxScore,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });

      if (result.success) {
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          maxScore: 100,
        });
        toast({
          title: "Đã giao bài tập",
          description: "Học viên sẽ thấy bài tập mới trong lớp học.",
        });
      } else {
        toast({
          title: "Không thể giao bài tập",
          description: result.error ?? "Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề *</Label>
        <Input
          id="title"
          placeholder="Ví dụ: Bài tập chương 3"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          placeholder="Hướng dẫn chi tiết cho học viên..."
          rows={4}
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Hạn nộp</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxScore">Điểm tối đa</Label>
          <Input
            id="maxScore"
            type="number"
            min={10}
            max={1000}
            value={formData.maxScore}
            onChange={(e) =>
              handleChange("maxScore", Number.parseInt(e.target.value || "0", 10))
            }
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full md:w-auto">
        {isPending ? "Đang giao..." : "Giao bài tập"}
      </Button>
    </form>
  );
}
