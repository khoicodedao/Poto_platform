"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Bell,
  BookOpen,
  FolderOpen,
} from "lucide-react";
import clsx from "clsx";

const classFeatures = [
  {
    icon: Calendar,
    label: "Buổi Học",
    href: "/sessions",
    description: "Quản lý lịch & điểm danh",
  },
  {
    icon: FileText,
    label: "Bài Tập",
    href: "/assignments",
    description: "Tạo & chấm bài",
  },
  {
    icon: BarChart3,
    label: "Phân Tích",
    href: "/analytics",
    description: "Xem tiến độ học tập",
  },
  {
    icon: Users,
    label: "Học Sinh",
    href: "/students",
    description: "Quản lý danh sách",
  },
  {
    icon: Bell,
    label: "Thông Báo",
    href: "/notifications",
    description: "Gửi thông báo Zalo",
  },
  {
    icon: FolderOpen,
    label: "Học Tập",
    href: "/materials",
    description: "Video & tài liệu bài giảng",
  },
  {
    icon: BookOpen,
    label: "Tài Liệu",
    href: "/files",
    description: "Chia sẻ resources",
  },
];

export function ClassMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const classId = params?.id;

  if (!classId) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-gradient-to-br from-gray-50 to-blue-50">
        <SheetHeader className="border-b border-gray-200 pb-4">
          <SheetTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Chức Năng Lớp Học
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 space-y-2">
          {classFeatures.map((feature) => {
            const Icon = feature.icon;
            const href = `/classes/${classId}${feature.href}`;
            const isActive = pathname?.includes(feature.href);
            return (
              <Link key={href} href={href} onClick={() => setIsOpen(false)}>
                <div
                  className={clsx(
                    "group flex gap-3 rounded-xl p-4 transition-all duration-300 border-2",
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg border-indigo-300 scale-105"
                      : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 border-gray-200 hover:border-indigo-300 hover:shadow-md hover:scale-105"
                  )}
                >
                  <div className={clsx(
                    "flex-shrink-0 p-2 rounded-lg transition-all",
                    isActive
                      ? "bg-white/20"
                      : "bg-indigo-50 group-hover:bg-indigo-100"
                  )}>
                    <Icon className={clsx(
                      "h-5 w-5 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-indigo-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      "font-bold text-sm transition-colors",
                      isActive ? "text-white" : "text-gray-900 group-hover:text-indigo-700"
                    )}>
                      {feature.label}
                    </p>
                    <p className={clsx(
                      "text-xs truncate transition-colors",
                      isActive ? "text-white/80" : "text-gray-500 group-hover:text-indigo-600"
                    )}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
