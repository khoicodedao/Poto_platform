"use client";

import { StudentDashboard } from "@/components/analytics-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";

export default function StudentAnalyticsPage({
  params,
}: {
  params: { id: string };
}) {
  const classId = parseInt(params.id);
  const { user } = useSession();

  if (!user) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kết Quả Học Tập</h1>
          <p className="text-gray-500 mt-2">
            Điểm số, điểm danh và tiến độ học tập của bạn
          </p>
        </div>

        <StudentDashboard classId={classId} studentId={user.id} />

        {/* Detailed Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Tổng Quan Tiến Độ</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>
              Xem chi tiết phân tích về bài tập và điểm danh các buổi học
              trong lớp.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
