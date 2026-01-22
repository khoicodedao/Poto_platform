import { ClassPerformanceDashboard, AtRiskStudentsAlert } from "@/components/analytics-dashboard";
import { getCurrentSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getClassDetail } from "@/lib/actions/classes";
import { CustomBreadcrumb } from "@/components/custom-breadcrumb";
import { ArrowLeft, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MeshGradientHeader } from "@/components/ui/mesh-gradient-header";

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
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-in fade-in duration-500">
      {/* Gradient Header Banner */}
      <MeshGradientHeader>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm sm:text-4xl">
                Phân Tích Lớp Học
              </h1>
            </div>
            <p className="text-blue-100 text-lg font-medium flex items-center gap-2 max-w-2xl">
              <TrendingUp className="w-5 h-5 text-blue-200" />
              Theo dõi hiệu suất, mức độ tương tác và sự chuyên cần của học viên.
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
      </MeshGradientHeader>

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
