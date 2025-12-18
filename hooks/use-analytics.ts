import { useEffect, useState } from "react";

export interface AnalyticsData {
  type: string;
  data: any;
  loading: boolean;
  error: string | null;
}

export function useAnalytics(
  type: string,
  params: Record<string, any> = {}
): AnalyticsData {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          type,
          ...params,
        });

        const response = await fetch(`/api/analytics?${queryParams}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [type, JSON.stringify(params)]);

  return { type, data, loading, error };
}

/**
 * Hook for student performance analytics
 */
export function useStudentPerformance(classId: number, studentId: number) {
  return useAnalytics("student-performance", { classId, studentId });
}

/**
 * Hook for class performance analytics
 */
export function useClassPerformance(classId: number) {
  return useAnalytics("class-performance", { classId });
}

/**
 * Hook for top students in class
 */
export function useTopStudents(classId: number) {
  return useAnalytics("top-students", { classId });
}

/**
 * Hook for students needing attention
 */
export function useStudentsNeedingAttention(classId: number) {
  return useAnalytics("students-needing-attention", { classId });
}

/**
 * Hook for assignment performance breakdown
 */
export function useAssignmentPerformance(assignmentId: number) {
  return useAnalytics("assignment-performance", { assignmentId });
}

/**
 * Hook for submission timeline trends
 */
export function useSubmissionTimeline(classId: number, days = 30) {
  return useAnalytics("submission-timeline", { classId, days });
}

/**
 * Hook for attendance trends
 */
export function useAttendanceTrends(classId: number) {
  return useAnalytics("attendance-trends", { classId });
}

/**
 * Hook for platform statistics
 */
export function usePlatformStats() {
  return useAnalytics("platform-stats");
}

/**
 * Hook for class participation metrics
 */
export function useClassParticipation(classId: number) {
  return useAnalytics("class-participation", { classId });
}
