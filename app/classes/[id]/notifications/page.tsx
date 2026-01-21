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
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  Clock,
  FileText,
  BarChart3,
  CheckCircle,
  MessagesSquare,
  Smartphone,
  Mail,
  Zap,
  Lightbulb,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";

export default function ClassNotificationsPage() {
  const params = useParams();
  const classId = parseInt(params.id as string);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general",
    sentVia: "app",
    sendToZalo: false,
    imageUrl: "", // New field for image
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chỉ chọn file hình ảnh",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));

      toast({
        title: "Thành công",
        description: "Đã upload hình ảnh",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể upload hình ảnh",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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
        imageUrl: "",
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
    <div className="container mx-auto p-6 pt-4 space-y-6 animate-in fade-in duration-500">
      {/* Gradient Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 lg:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm sm:text-4xl">
                Gửi Thông Báo
              </h1>
            </div>
            <p className="text-blue-100 text-lg font-medium flex items-center gap-2 max-w-2xl">
              <MessageSquare className="w-5 h-5 text-blue-200" />
              Gửi thông báo nhanh chóng đến tất cả học sinh qua Ứng dụng, Email và Zalo.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href={`/classes/${classId}`}>
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
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

            {/* Image Upload Section */}
            <div>
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Hình Ảnh Đính Kèm (Tùy chọn)
              </Label>

              <div className="mt-2">
                {formData.imageUrl ? (
                  <div className="relative border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                    <img
                      src={formData.imageUrl}
                      alt="Upload preview"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Hình ảnh đã được tải lên
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, imageUrl: "" })}
                        className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className={`w-8 h-8 mb-2 text-gray-400 ${isUploading ? 'animate-bounce' : ''}`} />
                      <p className="text-sm text-gray-600 font-medium">
                        {isUploading ? "Đang tải lên..." : "Click để chọn hình ảnh"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF (Tối đa 5MB)
                      </p>
                    </div>
                  </label>
                )}
              </div>
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

            <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md hover:shadow-lg transition-all">
              {isLoading ? "Đang gửi..." : "Gửi Thông Báo"}
            </Button>
          </form>
        </Card>

        {/* Enhanced Guide Section */}
        <div className="space-y-4">
          {/* Guide Header Card */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Hướng Dẫn Sử Dụng
              </h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Gửi thông báo nhanh chóng đến tất cả học sinh qua nhiều kênh khác nhau
            </p>
          </Card>

          {/* Types of Notifications */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-purple-700">
              <Bell className="w-5 h-5" />
              Loại Thông Báo
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg transition-all hover:bg-white hover:shadow-md">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Nhắc Nhở</p>
                  <p className="text-xs text-gray-600">Nhắc về sự kiện sắp tới</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg transition-all hover:bg-white hover:shadow-md">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Bài Tập</p>
                  <p className="text-xs text-gray-600">Về bài tập được phát hành/hết hạn</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg transition-all hover:bg-white hover:shadow-md">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Báo Cáo</p>
                  <p className="text-xs text-gray-600">Kết quả học tập hoặc điểm danh</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg transition-all hover:bg-white hover:shadow-md">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Điểm Danh</p>
                  <p className="text-xs text-gray-600">Thông báo liên quan tới điểm danh</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg transition-all hover:bg-white hover:shadow-md">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MessagesSquare className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Thông Báo Chung</p>
                  <p className="text-xs text-gray-600">Các thông báo khác</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Channels */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-700">
              <Smartphone className="w-5 h-5" />
              Kênh Gửi
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg transition-all hover:bg-white hover:shadow-md">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Ứng Dụng</p>
                  <p className="text-xs text-gray-600">Gửi qua ứng dụng di động</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg transition-all hover:bg-white hover:shadow-md">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Zalo</p>
                  <p className="text-xs text-gray-600">Gửi tin nhắn trực tiếp trên Zalo</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg transition-all hover:bg-white hover:shadow-md">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Email</p>
                  <p className="text-xs text-gray-600">Gửi email đến địa chỉ email</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Pro Tip */}
          <Card className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-800 mb-1">Mẹo Quan Trọng</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Kích chọn <span className="font-semibold text-amber-700">"Gửi thêm vào nhóm Zalo"</span> để đảm bảo
                  tất cả học sinh nhận được thông báo ngay lập tức và có thể thảo luận chung.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
