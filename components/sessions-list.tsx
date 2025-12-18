"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Session {
  id: number;
  title: string;
  description: string;
  scheduledAt: string;
  status: string;
  durationMinutes: number;
  roomId: string;
}

interface SessionsListProps {
  classId: number;
}

export function SessionsList({ classId }: SessionsListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`/api/class-sessions?classId=${classId}`);
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch sessions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [classId, toast]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "scheduled":
        return "outline";
      case "in-progress":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      scheduled: "Đã Lên Lịch",
      "in-progress": "Đang Diễn Ra",
      completed: "Hoàn Thành",
      cancelled: "Bị Hủy",
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">Chưa có buổi học nào</div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Danh Sách Buổi Học</h2>
      {sessions.map((session) => (
        <Card key={session.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">{session.title}</h3>
              <p className="text-gray-600 mb-3">{session.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Thời gian:</span>{" "}
                  {format(new Date(session.scheduledAt), "HH:mm dd/MM/yyyy")}
                </div>
                <div>
                  <span className="font-semibold">Thời lượng:</span>{" "}
                  {session.durationMinutes} phút
                </div>
                <div>
                  <span className="font-semibold">Phòng:</span> {session.roomId}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <Badge variant={getStatusBadgeVariant(session.status)}>
                {getStatusLabel(session.status)}
              </Badge>
              <Button variant="outline" size="sm">
                Chi Tiết
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
