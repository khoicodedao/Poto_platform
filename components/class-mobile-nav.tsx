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
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Chức Năng Lớp Học</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 space-y-1">
          {classFeatures.map((feature) => {
            const Icon = feature.icon;
            const href = `/classes/${classId}${feature.href}`;
            const isActive = pathname?.includes(feature.href);
            return (
              <Link key={href} href={href} onClick={() => setIsOpen(false)}>
                <div
                  className={clsx(
                    "flex gap-3 rounded-lg p-3 transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{feature.label}</p>
                    <p className="text-xs text-gray-500 truncate">
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
