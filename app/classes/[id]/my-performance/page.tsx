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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 lg:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm sm:text-4xl">
                Kết Quả Học Tập
              </h1>
            </div>
            <p className="text-blue-100 text-lg font-medium flex items-center gap-2 max-w-2xl">
              <TrendingUp className="w-5 h-5 text-blue-200" />
              Theo dõi điểm số, điểm danh và tiến độ học tập của bạn.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href={`/classes/${classId}`}>
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay Lại
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <StudentDashboard classId={classId} studentId={user.id} />

      {/* Info Card */}
      <Card className="border-l-4 border-l-indigo-500 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mẹo Cải Thiện Điểm Số</h3>
              <p className="text-sm text-gray-500 mt-1">
                Hãy hoàn thành bài tập sớm để nhận điểm thưởng và theo dõi biểu đồ tiến độ thường xuyên để điều chỉnh cách học.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
