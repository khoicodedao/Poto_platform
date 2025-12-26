"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, Video, CheckCircle, XCircle, Circle } from "lucide-react";
import Link from "next/link";

type SessionStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

interface Session {
    id: number;
    classId: number;
    sessionNumber: number | null;
    title: string;
    description: string | null;
    scheduledAt: Date | string;
    durationMinutes: number | null;
    roomId: string | null;
    platformUrl: string | null;
    status: SessionStatus;
    guestTeacherId: number | null;
    className: string | null;
    classSchedule: string | null;
}

interface SessionTimelineProps {
    sessions: Session[];
    classColors: Record<number, string>;
}

const statusConfig = {
    scheduled: {
        label: "Đã lên lịch",
        icon: Circle,
        className: "bg-blue-500 hover:bg-blue-600 text-white",
    },
    "in-progress": {
        label: "Đang diễn ra",
        icon: Video,
        className: "bg-green-500 hover:bg-green-600 text-white",
    },
    completed: {
        label: "Đã hoàn thành",
        icon: CheckCircle,
        className: "bg-gray-500 hover:bg-gray-600 text-white",
    },
    cancelled: {
        label: "Đã hủy",
        icon: XCircle,
        className: "bg-red-500 hover:bg-red-600 text-white",
    },
};

// Function to determine actual status based on time
function getSessionStatus(scheduledAt: Date, durationMinutes: number | null, dbStatus: SessionStatus): SessionStatus {
    // If manually cancelled, always show cancelled
    if (dbStatus === "cancelled") {
        return "cancelled";
    }

    const now = new Date();
    const sessionStart = new Date(scheduledAt);
    const sessionEnd = new Date(sessionStart.getTime() + (durationMinutes || 60) * 60000);

    // Check if session is currently happening
    if (now >= sessionStart && now <= sessionEnd) {
        return "in-progress";
    }

    // Check if session has ended
    if (now > sessionEnd) {
        return "completed";
    }

    // Session is scheduled for future
    return "scheduled";
}

export function SessionTimeline({ sessions, classColors }: SessionTimelineProps) {
    if (sessions.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium mb-2">
                        Không có buổi học nào
                    </p>
                    <p className="text-gray-400 text-sm">
                        Chọn khoảng thời gian khác để xem các buổi học
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {sessions.map((session) => {
                const scheduledDate = typeof session.scheduledAt === 'string'
                    ? new Date(session.scheduledAt)
                    : session.scheduledAt;

                // Calculate actual status based on time
                const actualStatus = getSessionStatus(scheduledDate, session.durationMinutes, session.status);
                const Status = statusConfig[actualStatus];
                const classColor = classColors[session.classId] || "#6366f1";

                return (
                    <Card
                        key={session.id}
                        className="hover:shadow-lg transition-shadow border-l-4"
                        style={{ borderLeftColor: classColor }}
                    >
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                {/* Time & Status */}
                                <div className="flex-shrink-0 space-y-2">
                                    <div className="flex items-center gap-2 text-lg font-bold">
                                        <Clock className="w-5 h-5 text-gray-500" />
                                        {format(scheduledDate, "HH:mm")}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {format(scheduledDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                                    </div>
                                    <Badge className={Status.className}>
                                        <Status.icon className="w-3 h-3 mr-1" />
                                        {Status.label}
                                    </Badge>
                                </div>

                                {/* Session Info */}
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <div
                                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-2"
                                            style={{ backgroundColor: classColor }}
                                        >
                                            {session.className || "Unknown Class"}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {session.title}
                                        </h3>
                                        {session.description && (
                                            <p className="text-gray-600 mt-1">
                                                {session.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        {session.sessionNumber && (
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">Buổi {session.sessionNumber}</span>
                                            </div>
                                        )}
                                        {session.durationMinutes && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {session.durationMinutes} phút
                                            </div>
                                        )}
                                        {session.roomId && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                Phòng {session.roomId}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex flex-col gap-2">
                                    <Link href={`/classes/${session.classId}/sessions/${session.id}`}>
                                        <Button size="sm" className="w-full lg:w-auto">
                                            Xem Chi Tiết
                                        </Button>
                                    </Link>
                                    <Link href={`/classes/${session.classId}/sessions/${session.id}/attendance`}>
                                        <Button size="sm" variant="outline" className="w-full lg:w-auto">
                                            <Users className="w-4 h-4 mr-1" />
                                            Điểm Danh
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
