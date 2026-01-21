"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
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
  GraduationCap,
} from "lucide-react";

const classNavItems = [
  {
    icon: Home,
    label: "Trang Chủ",
    href: "",
    description: "Dashboard lớp",
    teacherOnly: false,
    color: "text-blue-600",
    activeBg: "bg-blue-50",
  },
  {
    icon: Calendar,
    label: "Buổi Học",
    href: "/sessions",
    description: "Lên lịch & điểm danh",
    teacherOnly: false,
    color: "text-indigo-600",
    activeBg: "bg-indigo-50",
  },
  {
    icon: FileText,
    label: "Bài Tập",
    href: "/assignments",
    description: "Quản lý bài tập",
    teacherOnly: false,
    color: "text-emerald-600",
    activeBg: "bg-emerald-50",
  },
  {
    icon: BarChart3,
    label: "Phân Tích",
    href: "/analytics",
    description: "Xem tiến độ",
    teacherOnly: true,
    color: "text-violet-600",
    activeBg: "bg-violet-50",
  },
  {
    icon: Users,
    label: "Học Sinh",
    href: "/students",
    description: "Danh sách HS",
    teacherOnly: true,
    color: "text-rose-600",
    activeBg: "bg-rose-50",
  },
  {
    icon: Bell,
    label: "Thông Báo",
    href: "/notifications",
    description: "Gửi thông báo",
    teacherOnly: true,
    color: "text-orange-600",
    activeBg: "bg-orange-50",
  },
  {
    icon: FolderOpen,
    label: "Học Tập",
    href: "/materials",
    description: "Video & tài liệu",
    teacherOnly: false,
    color: "text-sky-600",
    activeBg: "bg-sky-50",
  },
  {
    icon: BookOpen,
    label: "Tài Liệu",
    href: "/files",
    description: "Chia sẻ tài liệu",
    teacherOnly: false,
    color: "text-teal-600",
    activeBg: "bg-teal-50",
  },
  {
    icon: Sparkles,
    label: "AI Chat",
    href: "/ai-topics",
    description: "Chủ đề chat AI",
    teacherOnly: true,
    color: "text-fuchsia-600",
    activeBg: "bg-fuchsia-50",
  },
  {
    icon: Trophy,
    label: "Kết quả",
    href: "/my-performance",
    description: "Kết quả học tập",
    teacherOnly: false,
    color: "text-amber-600",
    activeBg: "bg-amber-50",
  },
  {
    icon: Settings,
    label: "Cài đặt",
    href: "/edit",
    description: "Cài đặt lớp học",
    teacherOnly: true,
    color: "text-slate-600",
    activeBg: "bg-slate-50",
  },
];

interface ClassSidebarProps {
  className?: string;
}

export function ClassSidebar({ className }: ClassSidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const classId = params?.id;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  if (!classId) return null;

  // Filter nav items based on user role
  const isTeacher = userRole && userRole !== "student";
  const visibleNavItems = classNavItems.filter(
    (item) => !item.teacherOnly || isTeacher
  );

  return (
    <Sidebar collapsible="icon" className={`${className} bg-white border-r border-gray-100 shadow-lg`}>
      <SidebarHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-inner transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="text-base font-bold text-white tracking-wide">Lớp Học</p>
            <p className="text-xs text-blue-100 font-medium">Bảng Điều Khiển</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white pt-4">
        <SidebarGroup>
          <div className="px-4 mb-2 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Chức Năng Chính
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
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

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={`
                        w-full justify-start gap-3 rounded-xl px-3 py-3 transition-all duration-200 group
                        ${isActive
                          ? `${item.activeBg} ${item.color} font-bold shadow-sm ring-1 ring-black/5`
                          : `text-gray-600 hover:bg-gray-50 hover:${item.color} hover:translate-x-1`
                        }
                      `}
                    >
                      <Link href={href} className="flex items-center w-full">
                        <Icon className={`h-5 w-5 transition-colors ${isActive ? item.color : `text-gray-400 group-hover:${item.color}`}`} />
                        <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden ml-3">
                          <span className="text-sm font-medium leading-none">{item.label}</span>
                          <span className={`text-[10px] mt-1 font-normal ${isActive ? item.color : 'text-gray-400'} opacity-80`}>
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 bg-gray-50/50 p-4">
        <div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:hidden">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-700">POTO Platform</span>
            <span className="text-[10px] text-gray-500">Education System</span>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
