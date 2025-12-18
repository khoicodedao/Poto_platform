"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import {
  Calendar,
  FileText,
  BarChart3,
  Users,
  Bell,
  BookOpen,
  Home,
} from "lucide-react";

const classNavItems = [
  {
    icon: Home,
    label: "Trang Chủ",
    href: "",
    description: "Dashboard lớp",
  },
  {
    icon: Calendar,
    label: "Buổi Học",
    href: "/sessions",
    description: "Lên lịch & điểm danh",
  },
  {
    icon: FileText,
    label: "Bài Tập",
    href: "/assignments",
    description: "Quản lý bài tập",
  },
  {
    icon: BarChart3,
    label: "Phân Tích",
    href: "/analytics",
    description: "Xem tiến độ",
  },
  {
    icon: Users,
    label: "Học Sinh",
    href: "/students",
    description: "Danh sách HS",
  },
  {
    icon: Bell,
    label: "Thông Báo",
    href: "/notifications",
    description: "Gửi thông báo",
  },
  {
    icon: BookOpen,
    label: "Tài Liệu",
    href: "/files",
    description: "Chia sẻ tài liệu",
  },
];

export function ClassNavTabs() {
  const pathname = usePathname();
  const params = useParams();
  const classId = params?.id;

  if (!classId) return null;

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {classNavItems.map((item) => {
            const Icon = item.icon;
            const href =
              item.href === ""
                ? `/classes/${classId}`
                : `/classes/${classId}${item.href}`;
            const isActive =
              item.href === ""
                ? pathname === `/classes/${classId}`
                : pathname?.includes(item.href);

            return (
              <Link key={href} href={href} className="flex-shrink-0">
                <button
                  className={clsx(
                    "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden text-xs">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
