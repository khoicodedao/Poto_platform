"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker, DateRange } from "@/components/ta/date-range-picker";
import { SessionTimeline } from "@/components/ta/session-timeline";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Calendar, Users, GraduationCap } from "lucide-react";
import { startOfToday, endOfToday } from "date-fns";
import { MeshGradientHeader } from "@/components/ui/mesh-gradient-header";

type TAClass = {
    id: number;
    classId: number;
    className: string | null;
    classDescription: string | null;
    teacherName: string | null;
    canMarkAttendance: boolean | null;
    canManageMaterials: boolean | null;
    canGradeAssignments: boolean | null;
    canManageSessions: boolean | null;
};

type Session = {
    id: number;
    classId: number;
    sessionNumber: number | null;
    title: string;
    description: string | null;
    scheduledAt: Date | string;
    durationMinutes: number | null;
    roomId: string | null;
    platformUrl: string | null;
    status: "scheduled" | "in-progress" | "completed" | "cancelled";
    guestTeacherId: number | null;
    className: string | null;
    classSchedule: string | null;
};

// Predefined color palette for classes
const CLASS_COLORS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#8b5cf6", // purple
    "#f59e0b", // orange
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange-red
    "#84cc16", // lime
];

export default function TADashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [classes, setClasses] = useState<TAClass[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [classColors, setClassColors] = useState<Record<number, string>>({});
    const [dateRange, setDateRange] = useState<DateRange>({
        from: startOfToday(),
        to: endOfToday(),
    });

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (classes.length > 0) {
            fetchSessions();
        }
    }, [dateRange, classes]);

    const fetchClasses = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/ta/classes");
            if (response.status === 401) {
                toast({
                    title: "Không có quyền",
                    description: "Bạn cần đăng nhập với tài khoản Trợ Giảng hoặc Admin",
                    variant: "destructive",
                });
                router.push("/auth/signin");
                return;
            }

            if (!response.ok) throw new Error("Failed to fetch classes");
            const data = await response.json();
            setClasses(data.data || []);

            // Assign colors to classes
            const colors: Record<number, string> = {};
            data.data.forEach((cls: TAClass, index: number) => {
                colors[cls.classId] = CLASS_COLORS[index % CLASS_COLORS.length];
            });
            setClassColors(colors);
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách lớp học",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await fetch(
                `/api/ta/sessions?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
            );
            if (!response.ok) throw new Error("Failed to fetch sessions");
            const data = await response.json();
            setSessions(data.data || []);
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách buổi học",
                variant: "destructive",
            });
        }
    };

    const stats = {
        totalClasses: classes.length,
        totalSessionsInRange: sessions.length,
        upcomingSessions: sessions.filter(s => s.status === "scheduled").length,
        completedSessions: sessions.filter(s => s.status === "completed").length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pt-4 space-y-6">
                {/* Header */}
                <MeshGradientHeader>
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 text-white rounded-xl bg-white/20 backdrop-blur-sm">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Dashboard Trợ Giảng</h1>
                        </div>
                        <p className="text-white/90 max-w-3xl">
                            Quản lý và theo dõi các buổi học từ tất cả các lớp bạn hỗ trợ
                        </p>
                    </div>
                </MeshGradientHeader>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng Lớp Học</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalClasses}</div>
                            <p className="text-xs text-muted-foreground">
                                Lớp được gán
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Buổi Học</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSessionsInRange}</div>
                            <p className="text-xs text-muted-foreground">
                                Trong khoảng thời gian
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sắp Diễn Ra</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
                            <p className="text-xs text-muted-foreground">
                                Buổi học chưa bắt đầu
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Đã Hoàn Thành</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completedSessions}</div>
                            <p className="text-xs text-muted-foreground">
                                Buổi học đã kết thúc
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Date Range Picker */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Chọn Khoảng Thời Gian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DateRangePicker value={dateRange} onChange={setDateRange} />
                    </CardContent>
                </Card>

                {/* Class Legend */}
                {classes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Các Lớp Học
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {classes.map((cls) => (
                                    <div
                                        key={cls.classId}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: classColors[cls.classId] }}
                                        />
                                        <span className="font-medium">{cls.className}</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {cls.teacherName}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sessions Timeline */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Lịch Buổi Học</h2>
                    {isLoading ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-gray-500">Đang tải...</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <SessionTimeline sessions={sessions} classColors={classColors} />
                    )}
                </div>
            </main>
        </div>
    );
}
