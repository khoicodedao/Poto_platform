"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getClassById, updateClass, deleteClass } from "@/lib/actions/classes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = Number(params.id);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    schedule: "",
  });

  useEffect(() => {
    const loadClass = async () => {
      const classData = await getClassById(classId);
      if (classData) {
        setFormData({
          title: classData.name,
          description: classData.description || "",
          schedule: classData.schedule || "",
        });
      }
    };
    loadClass();
  }, [classId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateClass(classId, formData);
      if (result.success) {
        router.push("/classes");
      } else {
        alert(result.error || "Có lỗi xảy ra khi cập nhật lớp học");
      }
    } catch (error) {
      console.error("Error updating class:", error);
      alert("Có lỗi xảy ra khi cập nhật lớp học");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteClass(classId);
      if (result.success) {
        router.push("/classes");
      } else {
        alert(result.error || "Có lỗi xảy ra khi xóa lớp học");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("Có lỗi xảy ra khi xóa lớp học");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/classes" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span>Quay lại</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa lớp học</CardTitle>
            <CardDescription>Cập nhật thông tin lớp học</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tên lớp học *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ví dụ: Toán học cơ bản"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Mô tả ngắn về nội dung lớp học..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Lịch học</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={formData.schedule}
                  onChange={(e) =>
                    handleInputChange("schedule", e.target.value)
                  }
                  placeholder="Ví dụ: Thứ 2, 4, 6 - 14:00-15:30"
                />
              </div>

              <div className="flex space-x-4 pt-6">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Link href="/classes">
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa lớp học
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Bạn có chắc chắn muốn xóa?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan
                      đến lớp học sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Xóa lớp học
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
