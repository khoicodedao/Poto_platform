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
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { ClassMobileNav } from "@/components/class-mobile-nav";

const classNavItems = [
  {
    icon: Home,
    label: "Trang Chủ",
    href: "",
    description: "Dashboard lớp",
    teacherOnly: false,
    color: "text-blue-400", // Blue for home
  },
  {
    icon: Calendar,
    label: "Buổi Học",
    href: "/sessions",
    description: "Lên lịch & điểm danh",
    teacherOnly: false,
    color: "text-green-400", // Green for calendar
  },
  {
    icon: FileText,
    label: "Bài Tập",
    href: "/assignments",
    description: "Quản lý bài tập",
    teacherOnly: false,
    color: "text-orange-400", // Orange for assignments
  },
  {
    icon: BarChart3,
    label: "Phân Tích",
    href: "/analytics",
    description: "Xem tiến độ",
    teacherOnly: true, // Only for teachers
    color: "text-purple-400", // Purple for analytics
  },
  {
    icon: Users,
    label: "Học Sinh",
    href: "/students",
    description: "Danh sách HS",
    teacherOnly: true, // Only for teachers
    color: "text-teal-400", // Teal for students
  },
  {
    icon: Bell,
    label: "Thông Báo",
    href: "/notifications",
    description: "Gửi thông báo",
    teacherOnly: true, // Only for teachers
    color: "text-pink-400", // Pink for notifications
  },
  {
    icon: FolderOpen,
    label: "Học Tập",
    href: "/materials",
    description: "Video & tài liệu",
    teacherOnly: false,
    color: "text-amber-400", // Amber for materials
  },
  {
    icon: BookOpen,
    label: "Tài Liệu",
    href: "/files",
    description: "Chia sẻ tài liệu",
    teacherOnly: false,
    color: "text-cyan-400", // Cyan for files
  },
  {
    icon: Sparkles,
    label: "AI Chat",
    href: "/ai-topics",
    description: "Chủ đề chat AI",
    teacherOnly: true, // Only for teachers
    color: "text-yellow-400", // Yellow for AI
  },
  {
    icon: Trophy,
    label: "Kết quả",
    href: "/my-performance",
    description: "Kết quả học tập",
    teacherOnly: false,
    color: "text-yellow-500", // Gold for trophy
  },
  {
    icon: Settings,
    label: "Cài đặt",
    href: "/edit",
    description: "Cài đặt lớp học",
    teacherOnly: true, // Only for teachers
    color: "text-gray-300", // Gray for settings
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
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-gray-100/90 backdrop-blur-md shadow-sm">
      <div className="relative w-full flex items-center px-2 lg:px-4">

        {/* Mobile Menu Trigger */}
        <div className="sm:hidden flex-shrink-0 mr-1">
          <ClassMobileNav />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex gap-1 lg:gap-2 overflow-x-auto py-3 justify-start lg:justify-center [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
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
                      "group flex items-center gap-1.5 lg:gap-2 whitespace-nowrap rounded-xl px-2.5 lg:px-4 py-2 text-sm font-bold transition-all duration-200 border",
                      isActive
                        ? "bg-white text-indigo-700 border-indigo-200 shadow-sm"
                        : "bg-transparent text-gray-600 border-transparent hover:bg-gray-200 hover:text-gray-900"
                    )}
                  >
                    <Icon className={clsx("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-indigo-600" : item.color)} />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden text-xs">{label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
