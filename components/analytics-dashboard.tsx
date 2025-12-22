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
    return <div className="text-center py-8">Loading analytics...</div>;
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
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(perfData?.assignments?.averageScore || 0).toFixed(1)}
              <span className="text-sm font-normal text-gray-500">/100</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {perfData?.assignments?.totalAssignments || 0} assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Submission Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(perfData?.assignments?.submissionRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {perfData?.assignments?.totalSubmissions || 0} submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(perfData?.attendance?.averageAttendance || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {perfData?.attendance?.totalSessions || 0} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Late Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(perfData?.attendance?.lateRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Students arriving late</p>
          </CardContent>
        </Card>
      </div>

      {/* Submission Timeline Chart */}
      {!timelineLoading && timelineData && (
        <Card>
          <CardHeader>
            <CardTitle>Submission Timeline (Last 30 Days)</CardTitle>
            <CardDescription>
              Daily submission count and average score trend
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
                  name="Submissions"
                />
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#10b981"
                  name="Avg Score"
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
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Per session attendance breakdown</CardDescription>
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
                  name="Present"
                />
                <Bar
                  dataKey="lateCount"
                  stackId="a"
                  fill="#f59e0b"
                  name="Late"
                />
                <Bar
                  dataKey="absentCount"
                  stackId="a"
                  fill="#ef4444"
                  name="Absent"
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
    return <div className="text-center py-8">Loading your analytics...</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Your Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(perfData?.overallScore || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {perfData?.assignments?.submittedCount || 0} submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {perfData?.attendanceRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {perfData?.attendance?.presentCount || 0} classes attended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {perfData?.assignments?.gradedCount || 0}/
              {perfData?.assignments?.totalAssignments || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Graded</p>
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
        <AlertDescription>All students are doing well!</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-red-50 border-red-200">
      <AlertDescription>
        <strong>{atRiskData.length} students</strong> need attention:
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
