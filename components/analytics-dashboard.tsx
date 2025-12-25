"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useClassPerformance,
  useSubmissionTimeline,
  useAttendanceTrends,
} from "@/hooks/use-analytics";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function ClassPerformanceDashboard({ classId }: { classId: number }) {
  const {
    data: perfData,
    loading: perfLoading,
    error: perfError,
  } = useClassPerformance(classId);
  const { data: timelineData, loading: timelineLoading } =
    useSubmissionTimeline(classId, 30);
  const { data: attendanceData, loading: attendanceLoading } =
    useAttendanceTrends(classId);

  if (perfLoading) {
    return <div className="text-center py-8">Đang tải dữ liệu phân tích...</div>;
  }

  if (perfError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{perfError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(perfData?.assignments?.averageScore || 0).toFixed(1)}
              <span className="text-sm font-normal text-gray-500">/100</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {perfData?.assignments?.totalAssignments || 0} bài tập
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tỷ lệ nộp bài
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(perfData?.assignments?.submissionRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {perfData?.assignments?.totalSubmissions || 0} bài nộp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tỷ lệ điểm danh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(perfData?.attendance?.averageAttendance || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {perfData?.attendance?.totalSessions || 0} buổi học
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ đi trễ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(perfData?.attendance?.lateRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Học viên đi trễ</p>
          </CardContent>
        </Card>
      </div>

      {/* Submission Timeline Chart */}
      {!timelineLoading && timelineData && (
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ nộp bài (30 ngày qua)</CardTitle>
            <CardDescription>
              Số lượng bài nộp và xu hướng điểm trung bình
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="submissionCount"
                  stroke="#3b82f6"
                  name="Bài nộp"
                />
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#10b981"
                  name="Điểm TB"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Attendance Trends Chart */}
      {!attendanceLoading && attendanceData && (
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng điểm danh</CardTitle>
            <CardDescription>Thống kê điểm danh theo buổi học</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="sessionTitle"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="presentCount"
                  stackId="a"
                  fill="#10b981"
                  name="Có mặt"
                />
                <Bar
                  dataKey="lateCount"
                  stackId="a"
                  fill="#f59e0b"
                  name="Trễ"
                />
                <Bar
                  dataKey="absentCount"
                  stackId="a"
                  fill="#ef4444"
                  name="Vắng"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Student Personal Dashboard
 */
export function StudentDashboard({
  classId,
  studentId,
}: {
  classId: number;
  studentId: number;
}) {
  const { data: perfData, loading } = useAnalytics("student-performance", {
    classId,
    studentId,
  });

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu của bạn...</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Điểm trung bình của bạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(perfData?.overallScore || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {perfData?.assignments?.submittedCount || 0} đã nộp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Điểm danh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {perfData?.attendanceRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {perfData?.attendance?.presentCount || 0} buổi tham gia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bài tập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {perfData?.assignments?.gradedCount || 0}/
              {perfData?.assignments?.totalAssignments || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Đã chấm</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Import for StudentDashboard
import { useAnalytics } from "@/hooks/use-analytics";

/**
 * At-Risk Students Alert Component
 */
export function AtRiskStudentsAlert({ classId }: { classId: number }) {
  const { data: atRiskData, loading } = useAnalytics(
    "students-needing-attention",
    { classId }
  );

  if (loading) return null;

  if (!atRiskData || atRiskData.length === 0) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription>Tất cả học viên đều học tốt!</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-red-50 border-red-200">
      <AlertDescription>
        <strong>{atRiskData.length} học viên</strong> cần chú ý:
        <ul className="mt-2 space-y-1">
          {atRiskData.map((student: any) => (
            <li key={student.studentId} className="text-sm">
              {student.studentName} - {student.issues}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
