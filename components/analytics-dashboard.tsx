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
import {
  Users,
  CheckCircle2,
  Clock,
  Target,
  LineChart as LineChartIcon,
  BarChart3 as BarChartIcon
} from "lucide-react";

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
    <div className="grid gap-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-2xl bg-blue-50 p-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Điểm số
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Điểm trung bình</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  {Number(perfData?.assignments?.averageScore || 0).toFixed(1)}
                </span>
                <span className="text-sm font-medium text-gray-400">/ 100</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  {perfData?.assignments?.totalAssignments || 0}
                </span>
                bài tập đã giao
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                Tiến độ
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Tỷ lệ nộp bài</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  {Number(perfData?.assignments?.submissionRate || 0).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {perfData?.assignments?.totalSubmissions || 0}
                </span>
                lượt nộp bài
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-2xl bg-purple-50 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Chuyên cần
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Tỷ lệ tham gia</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  {Number(perfData?.attendance?.averageAttendance || 0).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  {perfData?.attendance?.totalSessions || 0}
                </span>
                buổi học đã qua
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-2xl bg-orange-50 p-3">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                Cần lưu ý
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Tỷ lệ đi trễ</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  {Number(perfData?.attendance?.lateRate || 0).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Trung bình mỗi buổi học
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submission Timeline Chart */}
        {!timelineLoading && timelineData && (
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <LineChartIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Hoạt Động Nộp Bài</CardTitle>
                  <CardDescription>
                    Xu hướng nộp bài và điểm số trong 30 ngày qua
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line
                    type="monotone"
                    dataKey="submissionCount"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Số lượng bài nộp"
                  />
                  <Line
                    type="monotone"
                    dataKey="averageScore"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Điểm trung bình"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Attendance Trends Chart */}
        {!attendanceLoading && attendanceData && (
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <BarChartIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Thống Kê Điểm Danh</CardTitle>
                  <CardDescription>
                    Tình hình tham gia học tập theo từng buổi
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="sessionTitle"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar
                    dataKey="presentCount"
                    stackId="a"
                    fill="#10b981"
                    name="Có mặt"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="lateCount"
                    stackId="a"
                    fill="#f59e0b"
                    name="Đi trễ"
                  />
                  <Bar
                    dataKey="absentCount"
                    stackId="a"
                    fill="#ef4444"
                    name="Vắng mặt"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
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

  // Calculate generic chart data for pie chart
  const assignmentStats = [
    { name: 'Đã nộp', value: perfData?.assignments?.submittedCount || 0, color: '#10b981' },
    { name: 'Chưa nộp', value: (perfData?.assignments?.totalAssignments || 0) - (perfData?.assignments?.submittedCount || 0), color: '#ef4444' },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Điểm Số</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">Điểm trung bình</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">
                  {Number(perfData?.overallScore || 0).toFixed(1)}
                </span>
                <span className="text-sm font-medium text-gray-400">/ 100</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Dựa trên {perfData?.assignments?.gradedCount || 0} bài tập đã chấm
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md border-l-4 border-l-purple-500 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Điểm Danh</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">Tỷ lệ tham gia</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">
                  {perfData?.attendanceRate}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Đã tham gia {perfData?.attendance?.presentCount || 0} buổi học
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md border-l-4 border-l-emerald-500 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Bài Tập</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm text-gray-500 font-medium">Hoàn thành</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {perfData?.assignments?.submittedCount || 0}
                  </span>
                  <span className="text-sm font-medium text-gray-400">
                    / {perfData?.assignments?.totalAssignments || 0}
                  </span>
                </div>
                <p className="text-sm text-green-600 font-medium mt-2">
                  Đã nộp bài đầy đủ
                </p>
              </div>
              {/* Mini Pie Chart for visual appeal */}
              <div className="h-16 w-16 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assignmentStats}
                      innerRadius={20}
                      outerRadius={30}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {assignmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
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
