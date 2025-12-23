"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Clock,
  Timer,
  Video,
  Calendar,
  CheckCircle2,
  PlayCircle,
  XCircle,
  Circle,
} from "lucide-react";

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "scheduled":
        return {
          label: "Đã Lên Lịch",
          icon: Circle,
          gradient: "from-blue-500 to-cyan-500",
          bgClass: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10",
          borderClass: "border-blue-500/30",
          textClass: "text-blue-600",
          iconBg: "bg-blue-500/20",
        };
      case "in-progress":
        return {
          label: "Đang Diễn Ra",
          icon: PlayCircle,
          gradient: "from-green-500 to-emerald-500",
          bgClass: "bg-gradient-to-r from-green-500/10 to-emerald-500/10",
          borderClass: "border-green-500/30",
          textClass: "text-green-600",
          iconBg: "bg-green-500/20",
          pulse: true,
        };
      case "completed":
        return {
          label: "Hoàn Thành",
          icon: CheckCircle2,
          gradient: "from-purple-500 to-pink-500",
          bgClass: "bg-gradient-to-r from-purple-500/10 to-pink-500/10",
          borderClass: "border-purple-500/30",
          textClass: "text-purple-600",
          iconBg: "bg-purple-500/20",
        };
      case "cancelled":
        return {
          label: "Bị Hủy",
          icon: XCircle,
          gradient: "from-red-500 to-orange-500",
          bgClass: "bg-gradient-to-r from-red-500/10 to-orange-500/10",
          borderClass: "border-red-500/30",
          textClass: "text-red-600",
          iconBg: "bg-red-500/20",
        };
      default:
        return {
          label: status,
          icon: Circle,
          gradient: "from-gray-500 to-slate-500",
          bgClass: "bg-gradient-to-r from-gray-500/10 to-slate-500/10",
          borderClass: "border-gray-500/30",
          textClass: "text-gray-600",
          iconBg: "bg-gray-500/20",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 animate-pulse" />
          <div className="h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative pl-8" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse" />
            {i < 3 && (
              <div className="absolute left-[7px] top-4 w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent" />
            )}
            <Card className="overflow-hidden border-2 animate-pulse">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                    <div className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                    <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                  </div>
                  <div className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full ml-4" />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-12 text-center animate-in fade-in duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <div className="relative">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Chưa có buổi học nào
          </h3>
          <p className="text-gray-500">
            Hãy tạo buổi học đầu tiên để bắt đầu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with gradient */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Video className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Danh Sách Buổi Học
        </h2>
        <div className="ml-auto">
          <Badge variant="outline" className="text-sm font-semibold">
            {sessions.length} buổi học
          </Badge>
        </div>
      </div>

      {/* Timeline layout */}
      <div className="space-y-6">
        {sessions.map((session, index) => {
          const statusConfig = getStatusConfig(session.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={session.id}
              className="relative pl-8 animate-in fade-in slide-in-from-left-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-0 top-2 w-4 h-4 rounded-full bg-gradient-to-br ${statusConfig.gradient} shadow-lg ${statusConfig.pulse ? "animate-pulse" : ""
                  }`}
              />

              {/* Timeline connector */}
              {index < sessions.length - 1 && (
                <div className="absolute left-[7px] top-6 w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent" />
              )}

              {/* Session card */}
              <Card
                className={`group overflow-hidden border-2 ${statusConfig.borderClass} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 backdrop-blur-sm ${statusConfig.bgClass}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      {/* Title with session number */}
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 px-3 py-1 rounded-full ${statusConfig.iconBg} ${statusConfig.textClass} text-xs font-bold`}>
                          #{index + 1}
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 group-hover:text-gray-900 transition-colors">
                          {session.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed">
                        {session.description}
                      </p>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">
                              Thời gian
                            </div>
                            <div className="font-semibold text-gray-700">
                              {format(new Date(session.scheduledAt), "HH:mm")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(session.scheduledAt), "dd/MM/yyyy")}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                            <Timer className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">
                              Thời lượng
                            </div>
                            <div className="font-semibold text-gray-700">
                              {session.durationMinutes} phút
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                            <Video className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">
                              Phòng học
                            </div>
                            <div className="font-semibold text-gray-700">
                              {session.roomId}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status badge and action */}
                    <div className="flex flex-col gap-3 items-end">
                      <Badge
                        className={`${statusConfig.textClass} ${statusConfig.bgClass} border-2 ${statusConfig.borderClass} px-3 py-1.5 font-semibold shadow-sm flex items-center gap-1.5 ${statusConfig.pulse ? "animate-pulse" : ""
                          }`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`bg-gradient-to-r ${statusConfig.gradient} text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold`}
                      >
                        Chi Tiết
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Bottom gradient accent */}
                <div className={`h-1 bg-gradient-to-r ${statusConfig.gradient} opacity-50`} />
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
