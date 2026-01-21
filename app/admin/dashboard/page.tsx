"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    TrendingUp,
    AlertCircle,
    UserCheck,
    BarChart3,
    ArrowRight,
    Settings,
    Shield,
    FileText
} from "lucide-react";

interface DashboardStats {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number;
    totalClasses: number;
    totalSessions: number;
    activeClasses: number;
    studentsNeedAttention: number;
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
        fetchStats();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                if (data.user?.role !== "admin") {
                    router.push("/");
                    return;
                }
                setUserRole(data.user.role);
            } else {
                router.push("/auth/signin");
            }
        } catch (e) {
            console.error("Failed to check auth:", e);
            router.push("/auth/signin");
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !userRole) {
        return (
            <div className="container mx-auto p-6 pt-24">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-500 font-medium">Đang tải dữ liệu quản trị...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Tổng Người Dùng",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100",
            border: "border-blue-100",
        },
        {
            title: "Học Sinh",
            value: stats?.totalStudents || 0,
            icon: GraduationCap,
            color: "text-green-600",
            bg: "bg-green-100",
            border: "border-green-100",
        },
        {
            title: "Giáo Viên",
            value: stats?.totalTeachers || 0,
            icon: UserCheck,
            color: "text-purple-600",
            bg: "bg-purple-100",
            border: "border-purple-100",
        },
        {
            title: "Lớp Học",
            value: stats?.totalClasses || 0,
            icon: BookOpen,
            color: "text-orange-600",
            bg: "bg-orange-100",
            border: "border-orange-100",
        },
        {
            title: "Buổi Học",
            value: stats?.totalSessions || 0,
            icon: Calendar,
            color: "text-cyan-600",
            bg: "bg-cyan-100",
            border: "border-cyan-100",
        },
        {
            title: "Lớp Đang Hoạt Động",
            value: stats?.activeClasses || 0,
            icon: TrendingUp,
            color: "text-teal-600",
            bg: "bg-teal-100",
            border: "border-teal-100",
        },
    ];

    const quickActions = [
        {
            href: "/admin/users",
            title: "Quản Lý Người Dùng",
            description: "Thêm, sửa, xóa tài khoản hệ thống",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            hoverAccents: "group-hover:text-blue-600 group-hover:bg-blue-600",
        },
        {
            href: "/admin/classes",
            title: "Quản Lý Lớp Học",
            description: "Tạo lớp mới và phân công giáo viên",
            icon: BookOpen,
            color: "text-purple-600",
            bg: "bg-purple-50",
            hoverAccents: "group-hover:text-purple-600 group-hover:bg-purple-600",
        },
        {
            href: "/classes",
            title: "Xem Tất Cả Lớp",
            description: "Truy cập trực tiếp danh sách lớp học",
            icon: Calendar,
            color: "text-green-600",
            bg: "bg-green-50",
            hoverAccents: "group-hover:text-green-600 group-hover:bg-green-600",
        },
        {
            href: "/admin/files",
            title: "Quản Lý Tài Liệu",
            description: "Kiểm duyệt và quản lý tài liệu",
            icon: FileText,
            color: "text-amber-600",
            bg: "bg-amber-50",
            hoverAccents: "group-hover:text-amber-600 group-hover:bg-amber-600",
        }
    ];

    return (
        <div className="container mx-auto p-4 pb-12 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <section className="mt-2 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-10 -translate-y-10">
                    <Shield className="w-64 h-64 text-white" />
                </div>

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm uppercase tracking-widest text-white/80 font-semibold">
                                Khu Vực Quản Trị
                            </p>
                        </div>
                        <h1 className="text-3xl font-bold sm:text-4xl">
                            Admin Dashboard
                        </h1>
                        <p className="mt-2 max-w-xl text-white/90 text-lg">
                            Tổng quan hệ thống, quản lý người dùng và theo dõi hoạt động học tập.
                        </p>
                    </div>
                </div>
            </section>

            {/* Alert for students needing attention */}
            {stats && stats.studentsNeedAttention > 0 && (
                <Alert className="rounded-2xl border-l-4 border-l-red-500 border-t-0 border-r-0 border-b-0 bg-white shadow-md">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="text-gray-800 flex items-center gap-2">
                        <span className="font-medium">Chú ý:</span>
                        Có <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{stats.studentsNeedAttention}</span> học sinh cần được chú ý đặc biệt do thành tích hoặc điểm danh.
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={index}
                            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className={`absolute top-0 right-0 p-3 opacity-10 transform translate-x-2 -translate-y-2 rounded-bl-3xl ${stat.bg}`}>
                                <Icon className={`w-20 h-20 ${stat.color}`} />
                            </div>

                            <div className="relative z-10">
                                <div className={`inline-flex p-3 rounded-xl ${stat.bg} mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <p className="text-sm font-medium text-gray-500">
                                    {stat.title}
                                </p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                    {stat.value.toLocaleString('vi-VN')}
                                </h3>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Truy Cập Nhanh</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickActions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <Link key={idx} href={action.href}>
                                <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg bg-white/50 backdrop-blur-sm border-gray-100">
                                    <CardContent className="flex flex-col gap-4 p-6 h-full justify-between">
                                        <div className="flex items-start justify-between">
                                            <div className={`rounded-2xl ${action.bg} p-3 transition-colors`}>
                                                <Icon className={`h-6 w-6 ${action.color}`} />
                                            </div>
                                            <div className="text-gray-300">
                                                <ArrowRight className="w-5 h-5 group-hover:text-gray-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-gray-900 mb-1">
                                                {action.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {action.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
