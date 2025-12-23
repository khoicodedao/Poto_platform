"use client";

import { StudentDashboard } from "@/components/analytics-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";
import { Trophy, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6 animate-in fade-in duration-500">
      {/* Gradient Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

        <div className="relative flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Kết Quả Học Tập
              </h1>
            </div>
            <p className="text-white/90 text-lg font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Điểm số, điểm danh và tiến độ học tập của bạn
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/classes/${classId}`}>
              <Button
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay Lại
              </Button>
            </Link>
          </div>
        </div>
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
  );
}
