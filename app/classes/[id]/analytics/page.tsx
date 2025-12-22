import { ClassPerformanceDashboard, AtRiskStudentsAlert } from "@/components/analytics-dashboard";
import { getCurrentSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getClassDetail } from "@/lib/actions/classes";
import { CustomBreadcrumb } from "@/components/custom-breadcrumb";

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <CustomBreadcrumb
          items={[
            { label: "Lớp học", href: "/classes" },
            { label: classDetail.name, href: `/classes/${classId}` },
            { label: "Phân tích" },
          ]}
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phân Tích Lớp Học</h1>
          <p className="text-gray-500 mt-2">
            Số liệu thống kê và thông tin chi tiết về học viên
          </p>
        </div>

        {/* At-Risk Students Alert */}
        <AtRiskStudentsAlert classId={classId} />

        {/* Main Dashboard */}
        <ClassPerformanceDashboard classId={classId} />
      </div>
    </div>
  );
}
