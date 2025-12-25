"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useState, useEffect } from "react";
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
  Trophy,
  Settings,
} from "lucide-react";

const classNavItems = [
  {
    icon: Home,
    label: "Trang Chủ",
    href: "",
    description: "Dashboard lớp",
    teacherOnly: false,
  },
  {
    icon: Calendar,
    label: "Buổi Học",
    href: "/sessions",
    description: "Lên lịch & điểm danh",
    teacherOnly: false,
  },
  {
    icon: FileText,
    label: "Bài Tập",
    href: "/assignments",
    description: "Quản lý bài tập",
    teacherOnly: false,
  },
  {
    icon: BarChart3,
    label: "Phân Tích",
    href: "/analytics",
    description: "Xem tiến độ",
    teacherOnly: true, // Only for teachers
  },
  {
    icon: Users,
    label: "Học Sinh",
    href: "/students",
    description: "Danh sách HS",
    teacherOnly: true, // Only for teachers
  },
  {
    icon: Bell,
    label: "Thông Báo",
    href: "/notifications",
    description: "Gửi thông báo",
    teacherOnly: true, // Only for teachers
  },
  {
    icon: BookOpen,
    label: "Tài Liệu",
    href: "/files",
    description: "Chia sẻ tài liệu",
    teacherOnly: false,
  },
  {
    icon: Trophy,
    label: "Kết quả",
    href: "/my-performance",
    description: "Kết quả học tập",
    teacherOnly: false,
  },
  {
    icon: Settings,
    label: "Cài đặt",
    href: "/edit",
    description: "Cài đặt lớp học",
    teacherOnly: true, // Only for teachers
  },
];

interface ClassNavTabsProps {
  className?: string;
}

export function ClassNavTabs({ className }: ClassNavTabsProps) {
  const pathname = usePathname();
  const params = useParams();
  const classId = params?.id;
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user?.role || null);
      }
    } catch (e) {
      console.error("Failed to fetch user role:", e);
    }
  };

  if (!classId) return null;

  // Filter nav items based on user role
  const isTeacher = userRole && userRole !== "student";
  const visibleNavItems = classNavItems.filter(
    (item) => !item.teacherOnly || isTeacher
  );

  return (
    <div className="border-b border-indigo-500 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const href =
              item.href === ""
                ? `/classes/${classId}`
                : `/classes/${classId}${item.href}`;
            const isActive =
              item.href === ""
                ? pathname === `/classes/${classId}`
                : pathname?.includes(item.href);

            const label =
              item.label === "Trang Chủ" && className ? className : item.label;

            return (
              <Link key={href} href={href} className="flex-shrink-0">
                <button
                  className={clsx(
                    "flex items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white text-indigo-700 shadow-sm translate-y-0.5"
                      : "text-indigo-100 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className={clsx("h-4 w-4", isActive ? "text-indigo-600" : "text-indigo-200")} />
                  <span className="hidden sm:inline font-bold">{label}</span>
                  <span className="sm:hidden text-xs">{label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
