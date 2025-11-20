"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClass, getStudents } from "@/lib/actions/classes";

type Student = {
  id: number;
  name: string;
  email: string;
};

export default function CreateClassPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    schedule: "",
    max_students: 20,
    teacher_id: 1, // TODO: lấy từ session user nếu là giáo viên
  });

  useEffect(() => {
    // load danh sách học sinh
    (async () => {
      const data = await getStudents();
      setStudents(data);
    })();
  }, []);

  const toggleStudent = (id: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createClass({
        ...formData,
        student_ids: selectedStudentIds,
      });

      if (result.success) {
        router.push("/classes");
      } else {
        alert(result.error ?? "Có lỗi xảy ra khi tạo lớp học");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Có lỗi xảy ra khi tạo lớp học");
    } finally {
      setIsLoading(false);
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
      {/* Header */}
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Tạo lớp học mới</CardTitle>
            <CardDescription>
              Điền thông tin để tạo lớp học trực tuyến mới
            </CardDescription>
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
                  value={formData.schedule}
                  onChange={(e) =>
                    handleInputChange("schedule", e.target.value)
                  }
                  placeholder="Ví dụ: Thứ 2, 4, 6 - 14:00-15:30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_students">Số học viên tối đa</Label>
                <Select
                  value={formData.max_students.toString()}
                  onValueChange={(value) =>
                    handleInputChange("max_students", Number.parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 học viên</SelectItem>
                    <SelectItem value="15">15 học viên</SelectItem>
                    <SelectItem value="20">20 học viên</SelectItem>
                    <SelectItem value="25">25 học viên</SelectItem>
                    <SelectItem value="30">30 học viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chọn học sinh */}
              <div className="space-y-2">
                <Label>Gán học viên vào lớp</Label>
                <div className="border rounded-md max-h-64 overflow-y-auto p-2 space-y-1">
                  {students.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Chưa có học viên nào.
                    </p>
                  )}
                  {students.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedStudentIds.includes(s.id)}
                        onChange={() => toggleStudent(s.id)}
                      />
                      <span>
                        {s.name}{" "}
                        <span className="text-xs text-gray-500">
                          ({s.email})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Đang tạo..." : "Tạo lớp học"}
                </Button>
                <Link href="/classes">
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
