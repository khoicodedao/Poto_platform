"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                <div className="text-center py-8">Đang tải...</div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Tổng Người Dùng",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Học Sinh",
            value: stats?.totalStudents || 0,
            icon: GraduationCap,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Giáo Viên",
            value: stats?.totalTeachers || 0,
            icon: UserCheck,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Lớp Học",
            value: stats?.totalClasses || 0,
            icon: BookOpen,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            title: "Buổi Học",
            value: stats?.totalSessions || 0,
            icon: Calendar,
            color: "from-cyan-500 to-cyan-600",
            bgColor: "bg-cyan-50",
        },
        {
            title: "Lớp Đang Hoạt Động",
            value: stats?.activeClasses || 0,
            icon: TrendingUp,
            color: "from-teal-500 to-teal-600",
            bgColor: "bg-teal-50",
        },
    ];

    return (
        <div className="container mx-auto p-6 pt-24 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                            Admin Dashboard
                        </h1>
                    </div>
                    <p className="text-white/90 text-lg font-medium">
                        Tổng quan hệ thống quản lý học tập
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={index}
                            className={`${stat.bgColor} border-2 hover:shadow-lg transition-all duration-200 hover:scale-105`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-1">
                                            {stat.title}
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div
                                        className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Alert for students needing attention */}
            {stats && stats.studentsNeedAttention > 0 && (
                <Alert className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="text-red-800 font-medium">
                        Có <span className="font-bold">{stats.studentsNeedAttention}</span>{" "}
                        học sinh cần được chú ý đặc biệt
                    </AlertDescription>
                </Alert>
            )}

            {/* Quick Actions */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="text-xl">Quản Lý Nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/admin/users"
                            className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                        >
                            <Users className="w-8 h-8 text-blue-600 mb-2" />
                            <h3 className="font-bold text-gray-900">Quản Lý Người Dùng</h3>
                            <p className="text-sm text-gray-600">
                                Tạo, sửa, xóa tài khoản
                            </p>
                        </a>

                        <a
                            href="/admin/classes"
                            className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                        >
                            <BookOpen className="w-8 h-8 text-purple-600 mb-2" />
                            <h3 className="font-bold text-gray-900">Quản Lý Lớp Học</h3>
                            <p className="text-sm text-gray-600">
                                Tạo lớp, gán giáo viên
                            </p>
                        </a>

                        <a
                            href="/classes"
                            className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                        >
                            <Calendar className="w-8 h-8 text-green-600 mb-2" />
                            <h3 className="font-bold text-gray-900">Xem Tất Cả Lớp</h3>
                            <p className="text-sm text-gray-600">
                                Danh sách lớp học
                            </p>
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
