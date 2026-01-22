"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, GraduationCap, Clock, MapPin, Users } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { MeshGradientHeader } from "@/components/ui/mesh-gradient-header";

type Session = {
    id: number;
    classId: number;
    sessionNumber: number | null;
    title: string;
    description: string | null;
    scheduledAt: Date | string;
    durationMinutes: number | null;
    roomId: string | null;
    status: "scheduled" | "in-progress" | "completed" | "cancelled";
    className: string | null;
};

type TA = {
    id: number;
    name: string;
    email: string;
};

const CLASS_COLORS = [
    "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#f97316", "#84cc16",
];

export default function TACalendarPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [sessions, setSessions] = useState<Session[]>([]);
    const [classColors, setClassColors] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [tas, setTas] = useState<TA[]>([]);
    const [selectedTA, setSelectedTA] = useState<string>("all");
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (userRole) {
            if (userRole === "admin") {
                fetchAllTAs();
            }
            fetchSessions();
        }
    }, [currentMonth, userRole, selectedTA]);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                if (data.user.role !== "teaching_assistant" && data.user.role !== "admin") {
                    router.push("/");
                    return;
                }
                setUserRole(data.user.role);
                setCurrentUserId(data.user.id);
                // Default to current user for TAs
                if (data.user.role === "teaching_assistant") {
                    setSelectedTA(data.user.id.toString());
                }
            } else {
                router.push("/auth/signin");
            }
        } catch (e) {
            console.error("Auth check error:", e);
            router.push("/auth/signin");
        }
    };

    const fetchAllTAs = async () => {
        try {
            const response = await fetch("/api/admin/teaching-assistants");
            if (response.ok) {
                const data = await response.json();
                setTas(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching TAs:", error);
        }
    };

    const fetchSessions = async () => {
        try {
            setIsLoading(true);
            const startDate = startOfMonth(currentMonth);
            const endDate = endOfMonth(currentMonth);

            const response = await fetch(
                `/api/ta/sessions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            );

            if (response.status === 401) {
                toast({
                    title: "Không có quyền",
                    description: "Bạn cần đăng nhập với tài khoản Trợ Giảng",
                    variant: "destructive",
                });
                router.push("/auth/signin");
                return;
            }

            if (!response.ok) throw new Error("Failed to fetch sessions");

            const data = await response.json();
            setSessions(data.data || []);

            // Assign colors to classes
            const colors: Record<number, string> = {};
            const uniqueClassIds = Array.from(new Set((data.data || []).map((s: Session) => s.classId)));
            uniqueClassIds.forEach((classId, index) => {
                colors[classId] = CLASS_COLORS[index % CLASS_COLORS.length];
            });
            setClassColors(colors);
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể tải lịch",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const getSessionsForDay = (day: Date) => {
        return sessions.filter((session) => {
            const sessionDate = typeof session.scheduledAt === 'string'
                ? parseISO(session.scheduledAt)
                : session.scheduledAt;
            return isSameDay(sessionDate, day);
        });
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleToday = () => setCurrentMonth(new Date());

    const selectedDaySessions = selectedDate ? getSessionsForDay(selectedDate) : [];

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pt-4 space-y-6">
                {/* Header */}
                <MeshGradientHeader>
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 text-white rounded-xl bg-white/20 backdrop-blur-sm">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Lịch Trợ Giảng</h1>
                        </div>
                        <p className="text-white/90 max-w-3xl">
                            Xem tất cả các buổi học trong tháng từ các lớp bạn hỗ trợ
                        </p>
                    </div>
                </MeshGradientHeader>

                {/* TA Selector - Admin Only */}
                {userRole === "admin" && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Users className="w-5 h-5 text-purple-600" />
                                <div className="flex-1">
                                    <label className="text-sm font-medium block mb-2">Xem lịch của:</label>
                                    <Select
                                        value={selectedTA}
                                        onValueChange={setSelectedTA}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">📊 Xem Tất Cả Trợ Giảng</SelectItem>
                                            {tas.map((ta) => (
                                                <SelectItem key={ta.id} value={ta.id.toString()}>
                                                    🎓 {ta.name} ({ta.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {selectedTA !== "all" && (
                                <p className="text-xs text-gray-500 mt-3 ml-9">
                                    ✓ Đang xem lịch của <strong>{tas.find(t => t.id.toString() === selectedTA)?.name}</strong>
                                </p>
                            )}
                            {selectedTA === "all" && (
                                <p className="text-xs text-purple-600 mt-3 ml-9 font-medium">
                                    ✓ Đang xem lịch tổng hợp của tất cả trợ giảng
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">
                                    {format(currentMonth, "MMMM yyyy", { locale: vi })}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleToday}>
                                        Hôm nay
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
                                    <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar days */}
                            <div className="grid grid-cols-7 gap-2">
                                {daysInMonth.map((day) => {
                                    const daySessions = getSessionsForDay(day);
                                    const isCurrentDay = isToday(day);
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    const isCurrentMonth = isSameMonth(day, currentMonth);

                                    return (
                                        <button
                                            key={day.toISOString()}
                                            onClick={() => setSelectedDate(day)}
                                            className={`
                                                min-h-[100px] p-2 rounded-lg border-2 transition-all
                                                ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
                                                ${isCurrentDay ? "bg-yellow-50" : ""}
                                                ${!isCurrentMonth ? "opacity-50" : ""}
                                            `}
                                        >
                                            <div className="text-sm font-semibold mb-1">
                                                {format(day, "d")}
                                            </div>
                                            <div className="space-y-1">
                                                {daySessions.slice(0, 3).map((session) => (
                                                    <div
                                                        key={session.id}
                                                        className="text-xs p-1 rounded truncate text-white"
                                                        style={{ backgroundColor: classColors[session.classId] }}
                                                        title={`${session.className}: ${session.title}`}
                                                    >
                                                        {format(parseISO(session.scheduledAt as string), "HH:mm")}
                                                    </div>
                                                ))}
                                                {daySessions.length > 3 && (
                                                    <div className="text-xs text-gray-500">
                                                        +{daySessions.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected Day Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5" />
                                {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedDate ? (
                                <p className="text-gray-500 text-sm text-center py-8">
                                    Click vào một ngày để xem chi tiết
                                </p>
                            ) : selectedDaySessions.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-8">
                                    Không có buổi học nào
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedDaySessions.map((session) => {
                                        const sessionDate = parseISO(session.scheduledAt as string);
                                        return (
                                            <div
                                                key={session.id}
                                                className="p-4 rounded-lg border-l-4"
                                                style={{ borderLeftColor: classColors[session.classId] }}
                                            >
                                                <div
                                                    className="inline-block px-2 py-1 rounded text-xs font-semibold text-white mb-2"
                                                    style={{ backgroundColor: classColors[session.classId] }}
                                                >
                                                    {session.className}
                                                </div>
                                                <h4 className="font-semibold">{session.title}</h4>
                                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        {format(sessionDate, "HH:mm")} ({session.durationMinutes} phút)
                                                    </div>
                                                    {session.roomId && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4" />
                                                            Phòng {session.roomId}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-3 flex gap-2">
                                                    <Link href={`/classes/${session.classId}/sessions/${session.id}`}>
                                                        <Button size="sm" variant="outline" className="text-xs">
                                                            Chi tiết
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/classes/${session.classId}/sessions/${session.id}/attendance`}>
                                                        <Button size="sm" variant="outline" className="text-xs">
                                                            Điểm danh
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
