"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Clock, Users } from "lucide-react";

interface ClassSession {
  id: number;
  title: string;
  scheduledAt: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  durationMinutes: number;
  sessionNumber?: number;
  description?: string;
}

interface ClassSessionsPageProps {
  classId: number;
  className: string;
}

export function ClassSessionsPage({
  classId,
  className,
}: ClassSessionsPageProps) {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSessions();
  }, [classId]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/class-sessions?classId=${classId}`);
      if (!response.ok) throw new Error("Failed to fetch sessions");

      const data = await response.json();
      setSessions(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-600">Đã Lên Lịch</Badge>;
      case "in-progress":
        return <Badge className="bg-green-600">Đang Diễn Ra</Badge>;
      case "completed":
        return <Badge className="bg-gray-600">Đã Kết Thúc</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã Hủy</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Các Buổi Học</h2>
          <p className="text-gray-600 mt-1">Lớp: {className}</p>
        </div>
        <Link href={`/classes/${classId}/sessions/new`}>
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Tạo Buổi Học
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <p className="text-gray-500 mb-4">Chưa có buổi học nào</p>
            <Link href={`/classes/${classId}/sessions/new`}>
              <Button>Tạo Buổi Học Đầu Tiên</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/classes/${classId}/sessions/${session.id}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {session.title}
                        </h3>
                        {getStatusBadge(session.status)}
                      </div>

                      {session.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {session.description}
                        </p>
                      )}

                      <div className="flex gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(session.scheduledAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Kéo dài {session.durationMinutes} phút
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
