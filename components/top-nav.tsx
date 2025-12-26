"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import type { AuthUser } from "@/lib/auth-types";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import { NotificationCenter } from "@/components/notification-center";
import { ClassMobileNav } from "@/components/class-mobile-nav";
import clsx from "clsx";
import {
  Calendar,
  FileText,
  BarChart3,
  Users,
  Bell,
  BookOpen,
  ChevronDown,
  AlertTriangle,
  MessageSquare,
  FileCheck,
  GraduationCap,
  CalendarDays,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type TopNavProps = {
  user: AuthUser | null;
};

const mainLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/classes", label: "Lớp học" },
  { href: "/assignments", label: "Bài tập" },
  { href: "/files", label: "Tài liệu" },
];

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
    icon: BookOpen,
    label: "Tài Liệu",
    href: "/files",
    description: "Chia sẻ resources",
  },
  {
    icon: AlertTriangle,
    label: "Học Sinh Có Nguy Cơ",
    href: "/at-risk",
    description: "Giám sát tiến độ học tập",
  },
  {
    icon: MessageSquare,
    label: "Phản Hồi Học Sinh",
    href: "/feedback",
    description: "Thu thập ý kiến học sinh",
  },
  {
    icon: FileCheck,
    label: "Báo Cáo Lớp",
    href: "/report",
    description: "Tạo báo cáo buổi học",
  },
];

export function TopNav({ user }: TopNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const classId = params?.id;

  // Hide top nav on auth pages (signin, signup, forgot-password)
  if (pathname?.startsWith("/auth")) return null;

  // Check if we're in a class detail page
  const inClassPage = pathname?.includes("/classes/") && classId;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              E
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                EduPlatform
              </p>
              <p className="text-sm font-semibold text-gray-900">
                Không gian học tập
              </p>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="ml-4 hidden items-center gap-1 rounded-full bg-gray-100 px-1 py-1 text-sm font-medium text-gray-500 md:flex">
            {mainLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "rounded-full px-4 py-1 transition",
                    isActive
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* TA Links - Only for teaching_assistant and admin */}
            {user && (user.role === "teaching_assistant" || user.role === "admin") && (
              <>
                <Link
                  href="/ta/dashboard"
                  className={clsx(
                    "rounded-full px-4 py-1 transition flex items-center gap-2",
                    pathname.startsWith("/ta/dashboard")
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <GraduationCap className="h-4 w-4" />
                  TA Dashboard
                </Link>
                <Link
                  href="/ta/calendar"
                  className={clsx(
                    "rounded-full px-4 py-1 transition flex items-center gap-2",
                    pathname.startsWith("/ta/calendar")
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <CalendarDays className="h-4 w-4" />
                  Lịch TA
                </Link>
              </>
            )}

            {/* Admin Link - Only for admin */}
            {user && user.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className={clsx(
                  "rounded-full px-4 py-1 transition",
                  pathname.startsWith("/admin")
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                ⚡ Admin
              </Link>
            )}
          </nav>

          {/* Class Features Dropdown - Only for teachers/admins */}
          {inClassPage && user && user.role !== "student" && (
            <div className="ml-2 hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Chức năng lớp
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {classFeatures.map((feature) => {
                    const Icon = feature.icon;
                    const href = `/classes/${classId}${feature.href}`;
                    const isActive = pathname?.includes(feature.href);
                    return (
                      <Link key={href} href={href}>
                        <DropdownMenuItem
                          className={clsx(
                            "cursor-pointer gap-3",
                            isActive && "bg-blue-50 text-blue-600"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <div className="flex-1">
                            <p className="font-medium">{feature.label}</p>
                            <p className="text-xs text-gray-500">
                              {feature.description}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Right side: Notifications + User Menu */}
        <div className="flex items-center gap-2 md:gap-3">
          {inClassPage && <ClassMobileNav />}
          {user && <NotificationCenter />}
          {!user ? (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </>
          ) : (
            <UserMenu user={user} />
          )}
        </div>
      </div>
    </header>
  );
}
