"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Bell, MessageSquare } from "lucide-react";

export default function ClassNotificationsPage() {
  const params = useParams();
  const classId = parseInt(params.id as string);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general",
    sentVia: "app",
    sendToZalo: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          classId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send notification");

      toast({
        title: "Success",
        description: "Thông báo được gửi thành công",
      });

      setFormData({
        title: "",
        message: "",
        type: "general",
        sentVia: "app",
        sendToZalo: false,
      });
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
    <div className="container mx-auto p-6 pt-24 space-y-6 animate-in fade-in duration-500">
      {/* Gradient Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

        <div className="relative flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Gửi Thông Báo
              </h1>
            </div>
            <p className="text-white/90 text-lg font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Gửi thông báo đến học sinh qua ứng dụng và Zalo
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/classes/${classId}`}>
              <Button
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay Lại
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            Thông Báo Qua Ứng Dụng & Zalo
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tiêu đề</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="VD: Nhắc nhở về bài kiểm tra"
                required
              />
            </div>

            <div>
              <Label>Nội dung</Label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Viết nội dung thông báo..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label>Loại Thông Báo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">Nhắc Nhở</SelectItem>
                  <SelectItem value="assignment">Bài Tập</SelectItem>
                  <SelectItem value="report">Báo Cáo</SelectItem>
                  <SelectItem value="attendance">Điểm Danh</SelectItem>
                  <SelectItem value="general">Thông Báo Chung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Gửi Qua</Label>
              <Select
                value={formData.sentVia}
                onValueChange={(value) =>
                  setFormData({ ...formData, sentVia: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="app">Ứng Dụng</SelectItem>
                  <SelectItem value="zalo">Zalo</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Checkbox
                checked={formData.sendToZalo}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    sendToZalo: checked as boolean,
                  })
                }
              />
              <Label className="cursor-pointer">
                Gửi thêm vào nhóm Zalo của lớp học
              </Label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Đang gửi..." : "Gửi Thông Báo"}
            </Button>
          </form>
        </Card>

        <Card className="p-6 bg-gray-50">
          <h2 className="text-xl font-bold mb-4">💡 Hướng Dẫn</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold mb-1">🔔 Loại Thông Báo</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>
                  <strong>Nhắc Nhở:</strong> Nhắc về sự kiện sắp tới
                </li>
                <li>
                  <strong>Bài Tập:</strong> Về bài tập được phát hành/hết hạn
                </li>
                <li>
                  <strong>Báo Cáo:</strong> Kết quả học tập hoặc điểm danh
                </li>
                <li>
                  <strong>Điểm Danh:</strong> Thông báo liên quan tới điểm danh
                </li>
                <li>
                  <strong>Thông Báo Chung:</strong> Các thông báo khác
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1">📱 Kênh Gửi</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>
                  <strong>Ứng Dụng:</strong> Gửi qua ứng dụng di động
                </li>
                <li>
                  <strong>Zalo:</strong> Gửi tin nhắn trực tiếp trên Zalo
                </li>
                <li>
                  <strong>Email:</strong> Gửi email đến địa chỉ email
                </li>
              </ul>
            </div>

            <div className="p-3 bg-blue-100 rounded border border-blue-200 text-xs">
              💡 <strong>Mẹo:</strong> Kích chọn "Gửi qua nhóm Zalo" để đảm bảo
              tất cả học sinh nhận được thông báo ngay lập tức.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
