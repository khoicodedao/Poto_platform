import { ClassPerformanceDashboard, AtRiskStudentsAlert } from "@/components/analytics-dashboard";
import { getCurrentSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getClassDetail } from "@/lib/actions/classes";
import { CustomBreadcrumb } from "@/components/custom-breadcrumb";
import { ArrowLeft, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ClassAnalyticsPage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/auth/signin");
  }

  const classId = parseInt(params.id);
  if (isNaN(classId)) return notFound();

  const classDetail = await getClassDetail(classId);
  if (!classDetail) return notFound();

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
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Phân Tích Lớp Học
              </h1>
            </div>
            <p className="text-white/90 text-lg font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Số liệu thống kê và thông tin chi tiết về học viên
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

      <CustomBreadcrumb
        items={[
          { label: "Lớp học", href: "/classes" },
          { label: classDetail.name, href: `/classes/${classId}` },
          { label: "Phân tích" },
        ]}
      />

      {/* At-Risk Students Alert */}
      <AtRiskStudentsAlert classId={classId} />

      {/* Main Dashboard */}
      <ClassPerformanceDashboard classId={classId} />
    </div>
  );
}
