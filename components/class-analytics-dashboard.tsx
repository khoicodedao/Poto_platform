"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, TrendingUp, Users, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClassAnalyticsProps {
  classId: number;
}

interface ClassStats {
  avgScore: number;
  submissionRate: number;
  attendanceRate: number;
  lateSubmissionRate: number;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export function ClassAnalyticsDashboard({ classId }: ClassAnalyticsProps) {
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [submissionChart, setSubmissionChart] = useState<ChartData[]>([]);
  const [attendanceChart, setAttendanceChart] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch class performance stats
        const statsResponse = await fetch(
          `/api/analytics?type=class-performance&classId=${classId}`
        );
        if (!statsResponse.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch submission timeline
        const submissionResponse = await fetch(
          `/api/analytics?type=submission-timeline&classId=${classId}`
        );
        if (!submissionResponse.ok)
          throw new Error("Failed to fetch submissions");
        const submissionData = await submissionResponse.json();
        setSubmissionChart(submissionData.timeline || []);

        // Fetch attendance trends
        const attendanceResponse = await fetch(
          `/api/analytics?type=attendance-trends&classId=${classId}`
        );
        if (!attendanceResponse.ok)
          throw new Error("Failed to fetch attendance");
        const attendanceData = await attendanceResponse.json();
        setAttendanceChart(attendanceData.trends || []);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch analytics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [classId, toast]);

  if (isLoading) {
    return (
      <div className="text-center py-8">Đang tải dữ liệu phân tích...</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Phân Tích Lớp Học</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Điểm Trung Bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avgScore.toFixed(1)}
            </div>
            <p className="text-xs text-gray-600">trên 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tỷ Lệ Nộp Bài
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.submissionRate ?? 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">bài tập nộp</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tỷ Lệ Điểm Danh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.attendanceRate ?? 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">học sinh có mặt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nộp Trễ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.lateSubmissionRate ?? 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">bài nộp trễ hạn</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Xu Hướng Nộp Bài (30 Ngày)</CardTitle>
          </CardHeader>
          <CardContent>
            {submissionChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={submissionChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trendline Điểm Danh</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" />
                  <Bar dataKey="absent" fill="#ef4444" />
                  <Bar dataKey="late" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
