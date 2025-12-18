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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Performance</h1>
        <p className="text-gray-500 mt-2">
          Your grades, attendance, and progress
        </p>
      </div>

      <StudentDashboard classId={classId} studentId={user.id} />

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <p>
            View detailed breakdowns of your assignments and session attendance
            in the class.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
