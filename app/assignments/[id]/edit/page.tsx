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
import {
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from "@/lib/actions/assignments";
import { getMyClasses } from "@/lib/actions/classes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function EditAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = Number(params.id);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: 0,
    dueDate: "",
    maxScore: 100,
  });

  useEffect(() => {
    const loadData = async () => {
      const [assignmentData, classList] = await Promise.all([
        getAssignmentById(assignmentId),
        getMyClasses(),
      ]);

      if (assignmentData) {
        setFormData({
          title: assignmentData.title,
          description: assignmentData.description || "",
          classId: assignmentData.classId,
          dueDate: assignmentData.dueDate
            ? new Date(assignmentData.dueDate).toISOString().split("T")[0]
            : "",
          maxScore: assignmentData.maxScore || 100,
        });
      }
      setClasses(classList);
    };
    loadData();
  }, [assignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        classId: formData.classId,
        maxScore: formData.maxScore,
      };

      if (formData.dueDate) {
        updateData.dueDate = new Date(formData.dueDate);
      }

      const result = await updateAssignment(assignmentId, updateData);
      if (result.success) {
        router.push("/assignments");
      } else {
        alert(result.error || "Có lỗi xảy ra khi cập nhật bài tập");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      alert("Có lỗi xảy ra khi cập nhật bài tập");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAssignment(assignmentId);
      if (result.success) {
        router.push("/assignments");
      } else {
        alert(result.error || "Có lỗi xảy ra khi xóa bài tập");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Có lỗi xảy ra khi xóa bài tập");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
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
              <Link href="/assignments" className="flex items-center space-x-2">
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
            <CardTitle>Chỉnh sửa bài tập</CardTitle>
            <CardDescription>Cập nhật thông tin bài tập</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề bài tập *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ví dụ: Bài tập chương 1"
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
                  placeholder="Mô tả chi tiết về bài tập..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Lớp học *</Label>
                <Select
                  value={formData.classId.toString()}
                  onValueChange={(value) =>
                    handleInputChange("classId", Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp học" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Hạn nộp</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxScore">Điểm tối đa</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="0"
                    max="1000"
                    value={formData.maxScore}
                    onChange={(e) =>
                      handleInputChange("maxScore", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Link href="/assignments">
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
                    Xóa bài tập
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Bạn có chắc chắn muốn xóa?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Tất cả bài nộp liên quan
                      sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Xóa bài tập
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
