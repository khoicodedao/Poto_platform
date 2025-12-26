"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Bell,
  FolderOpen,
} from "lucide-react";

interface ClassDashboardProps {
  classId: number;
  className: string;
}

export function ClassDashboard({ classId, className }: ClassDashboardProps) {
  const features = [
    {
      icon: Calendar,
      title: "Quản Lý Buổi Học",
      description: "Lên lịch, điểm danh, feedback học sinh",
      href: `/classes/${classId}/sessions`,
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: FileText,
      title: "Bài Tập & Bài Kiểm Tra",
      description: "Tạo, phân công, chấm bài tập",
      href: `/classes/${classId}/assignments`,
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: BarChart3,
      title: "Phân Tích & Thống Kê",
      description: "Xem hiệu suất lớp và học sinh",
      href: `/classes/${classId}/analytics`,
      color: "bg-green-50 text-green-600",
    },
    {
      icon: Users,
      title: "Quản Lý Học Sinh",
      description: "Danh sách, tham gia, rời lớp",
      href: `/classes/${classId}/students`,
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: Bell,
      title: "Thông Báo",
      description: "Gửi thông báo qua Zalo & App",
      href: `/classes/${classId}/notifications`,
      color: "bg-red-50 text-red-600",
    },
    {
      icon: FolderOpen,
      title: "Tài Liệu Học Tập",
      description: "Video bài giảng, tài liệu theo unit",
      href: `/classes/${classId}/materials`,
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: BookOpen,
      title: "Tài Liệu & Tài Nguyên",
      description: "Chia sẻ, tải lên file học tập",
      href: `/classes/${classId}/files`,
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">{className}</h2>
        <p className="text-gray-600">Truy cập các chức năng quản lý lớp học</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.href} href={feature.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div
                  className={`inline-block p-3 rounded-lg mb-4 ${feature.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {feature.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Truy Cập
                </Button>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
