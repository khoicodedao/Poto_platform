"use client";

import { useParams } from "next/navigation";
import {
  ClassPerformanceDashboard,
  AtRiskStudentsAlert,
} from "@/components/analytics-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClassAnalyticsPage() {
  const params = useParams();
  const classId = parseInt(params.id as string);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Class Analytics</h1>
        <p className="text-gray-500 mt-2">
          Performance metrics and student insights
        </p>
      </div>

      {/* At-Risk Students Alert */}
      <AtRiskStudentsAlert classId={classId} />

      {/* Main Dashboard */}
      <ClassPerformanceDashboard classId={classId} />
    </div>
  );
}
