"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, MapPin, Clock } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

interface UpcomingSession {
    id: number;
    classId: number;
    title: string;
    scheduledAt: string;
    className: string | null;
    roomId: string | null;
    durationMinutes: number | null;
    status: string;
}

interface TAUpcomingSessionsProps {
    userId: number;
}

export function TAUpcomingSessions({ userId }: TAUpcomingSessionsProps) {
    const [sessions, setSessions] = useState<UpcomingSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUpcomingSessions();
    }, [userId]);

    const fetchUpcomingSessions = async () => {
        try {
            // Get sessions for next 3 days
            const today = new Date();
            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + 3);

            const response = await fetch(
                `/api/ta/sessions?startDate=${today.toISOString()}&endDate=${futureDate.toISOString()}`
            );

            if (response.ok) {
                const data = await response.json();
                // Filter only upcoming sessions (not completed)
                const upcoming = (data.data || []).filter(
                    (s: UpcomingSession) => s.status !== "completed" && s.status !== "cancelled"
                );
                setSessions(upcoming);
            }
        } catch (error) {
            console.error("Error fetching upcoming sessions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-gray-500">Đang tải lịch...</p>
                </CardContent>
            </Card>
        );
    }

    if (sessions.length === 0) {
        return null; // Don't show widget if no upcoming sessions
    }

    return (
        <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarClock className="w-5 h-5 text-purple-600" />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Lịch Trợ Giảng Sắp Tới
                    </span>
                    <Badge variant="secondary" className="ml-auto">
                        {sessions.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sessions.slice(0, 5).map((session) => {
                        const sessionDate = new Date(session.scheduledAt);
                        const isTodaySession = isToday(sessionDate);
                        const isTomorrowSession = isTomorrow(sessionDate);

                        return (
                            <div
                                key={session.id}
                                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        {isTodaySession && (
                                            <Badge className="bg-red-500 hover:bg-red-600 text-xs">
                                                Hôm nay
                                            </Badge>
                                        )}
                                        {isTomorrowSession && (
                                            <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
                                                Ngày mai
                                            </Badge>
                                        )}
                                        <h4 className="font-semibold text-sm truncate">{session.title}</h4>
                                    </div>
                                    <p className="text-sm text-purple-600 font-medium mb-1">
                                        {session.className}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(sessionDate, "HH:mm - EEE, dd/MM", { locale: vi })}
                                        </span>
                                        {session.roomId && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {session.roomId}
                                            </span>
                                        )}
                                        {session.durationMinutes && (
                                            <span>{session.durationMinutes}p</span>
                                        )}
                                    </div>
                                </div>
                                <Link href={`/classes/${session.classId}/sessions/${session.id}`}>
                                    <Button size="sm" variant="outline" className="shrink-0">
                                        Chi tiết
                                    </Button>
                                </Link>
                            </div>
                        );
                    })}

                    {sessions.length > 5 && (
                        <Link href="/ta/dashboard" className="block">
                            <Button variant="ghost" className="w-full text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                Xem tất cả {sessions.length} buổi học →
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
