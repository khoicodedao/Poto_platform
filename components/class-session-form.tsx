"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ClassSessionFormProps {
  classId: number;
  sessionId?: number;
  initialData?: {
    title: string;
    description?: string;
    scheduledAt: Date;
    durationMinutes?: number;
    sessionNumber?: number;
  };
  onSuccess?: () => void;
}

export function ClassSessionForm({
  classId,
  sessionId,
  initialData,
  onSuccess,
}: ClassSessionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    scheduledAt: initialData?.scheduledAt
      ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
      : "",
    durationMinutes: initialData?.durationMinutes || 60,
    sessionNumber: initialData?.sessionNumber || 1,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "durationMinutes" || name === "sessionNumber"
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = sessionId
        ? `/api/class-sessions/${sessionId}`
        : "/api/class-sessions";

      const method = sessionId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          ...formData,
          scheduledAt: new Date(formData.scheduledAt),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save class session");
      }

      setSuccess(
        sessionId ? "✓ Buổi học đã được cập nhật" : "✓ Buổi học đã được tạo"
      );
      setTimeout(() => {
        if (onSuccess) onSuccess();
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {sessionId ? "Cập Nhật Buổi Học" : "Tạo Buổi Học Mới"}
        </CardTitle>
        <CardDescription>
          {sessionId
            ? "Chỉnh sửa thông tin buổi học"
            : "Tạo một buổi học mới cho lớp"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionNumber">Buổi Thứ</Label>
              <Input
                id="sessionNumber"
                name="sessionNumber"
                type="number"
                min="1"
                value={formData.sessionNumber}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Thời Lượng (phút)</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min="15"
                step="15"
                value={formData.durationMinutes}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Tiêu Đề Buổi Học *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="VD: Buổi 1 - Luyện đọc cơ bản"
              value={formData.title}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Thời Gian Dự Kiến *</Label>
            <Input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô Tả</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Mô tả chi tiết nội dung buổi học (nếu cần)..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading
              ? "Đang lưu..."
              : sessionId
              ? "Cập Nhật Buổi Học"
              : "Tạo Buổi Học"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
