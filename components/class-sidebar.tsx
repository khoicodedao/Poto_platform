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
    teacherOnly: true,
  },
  {
    icon: Users,
    label: "Học Sinh",
    href: "/students",
    description: "Danh sách HS",
    teacherOnly: true,
  },
  {
    icon: Bell,
    label: "Thông Báo",
    href: "/notifications",
    description: "Gửi thông báo",
    teacherOnly: true,
  },
  {
    icon: FolderOpen,
    label: "Học Tập",
    href: "/materials",
    description: "Video & tài liệu",
    teacherOnly: false,
  },
  {
    icon: BookOpen,
    label: "Tài Liệu",
    href: "/files",
    description: "Chia sẻ tài liệu",
    teacherOnly: false,
  },
  {
    icon: Sparkles,
    label: "AI Chat",
    href: "/ai-topics",
    description: "Chủ đề chat AI",
    teacherOnly: true,
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
    teacherOnly: true,
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
    <Sidebar collapsible="icon" className={className}>
      <SidebarHeader className="border-b border-sidebar-border/50 bg-gradient-to-br from-sidebar-background to-sidebar-primary">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-bold text-white">Lớp Học</p>
            <p className="text-xs text-white/70">Menu Điều Hướng</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-sidebar-background to-sidebar-primary/90">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/90 font-semibold">
            Chức Năng
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
                      className={
                        isActive
                          ? "bg-white/20 text-white hover:bg-white/30 font-bold shadow-sm backdrop-blur-sm"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }
                    >
                      <Link href={href}>
                        <Icon className={isActive ? "animate-pulse" : ""} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 bg-gradient-to-br from-sidebar-primary to-sidebar-background">
        <div className="px-3 py-2 text-xs text-white/60 group-data-[collapsible=icon]:hidden">
          🎮 Gamified Learning Platform
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
