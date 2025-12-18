"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ClassReportFormProps {
  sessionId: number;
  totalStudents: number;
  attendanceCount: number;
  onSuccess?: () => void;
}

export function ClassReportForm({
  sessionId,
  totalStudents,
  attendanceCount,
  onSuccess,
}: ClassReportFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    summary: "",
    keyPoints: "",
    nextSessionPreview: "",
    includeFeedbacks: false,
    sendViaZalo: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/class-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          totalStudents,
          attendanceCount,
          ...formData,
          includeFeedbacks: formData.includeFeedbacks,
          sendViaZalo: formData.sendViaZalo,
        }),
      });

      if (!response.ok) throw new Error("Failed to create report");

      toast({
        title: "Success",
        description: "Báo cáo buổi học được tạo thành công",
      });

      setFormData({
        summary: "",
        keyPoints: "",
        nextSessionPreview: "",
        includeFeedbacks: false,
        sendViaZalo: false,
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

  const attendanceRate =
    totalStudents > 0
      ? ((attendanceCount / totalStudents) * 100).toFixed(1)
      : 0;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Báo Cáo Buổi Học</h2>

      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Tổng Số Học Sinh</p>
          <p className="text-2xl font-bold">{totalStudents}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Có Mặt</p>
          <p className="text-2xl font-bold">{attendanceCount}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-gray-600">Tỷ Lệ Điểm Danh</p>
          <p className="text-2xl font-bold">{attendanceRate}%</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Tóm Tắt Buổi Học</Label>
          <Textarea
            value={formData.summary}
            onChange={(e) =>
              setFormData({ ...formData, summary: e.target.value })
            }
            placeholder="Tóm tắt nội dung và tiến độ buổi học..."
            required
            rows={4}
          />
        </div>

        <div>
          <Label>Điểm Chính</Label>
          <Textarea
            value={formData.keyPoints}
            onChange={(e) =>
              setFormData({ ...formData, keyPoints: e.target.value })
            }
            placeholder="Những điểm quan trọng cần nhớ..."
            rows={3}
          />
        </div>

        <div>
          <Label>Nội Dung Buổi Tiếp Theo</Label>
          <Textarea
            value={formData.nextSessionPreview}
            onChange={(e) =>
              setFormData({
                ...formData,
                nextSessionPreview: e.target.value,
              })
            }
            placeholder="Giới thiệu sơ bộ nội dung buổi tiếp theo..."
            rows={3}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.includeFeedbacks}
              onChange={(e) =>
                setFormData({ ...formData, includeFeedbacks: e.target.checked })
              }
            />
            <span className="text-sm">Kèm nhận xét của từng học viên</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.sendViaZalo}
              onChange={(e) =>
                setFormData({ ...formData, sendViaZalo: e.target.checked })
              }
            />
            <span className="text-sm">Gửi thông báo qua Zalo</span>
          </label>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Đang tạo..." : "Tạo Báo Cáo"}
        </Button>
      </form>
    </Card>
  );
}
