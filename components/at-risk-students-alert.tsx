"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AtRiskStudent {
  id: number;
  name: string;
  email: string;
  avgScore: number;
  attendanceRate: number;
  submissionRate: number;
  riskFactors: string[];
}

interface AtRiskStudentsProps {
  classId: number;
}

export function AtRiskStudentsAlert({ classId }: AtRiskStudentsProps) {
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAtRiskStudents = async () => {
      try {
        const response = await fetch(
          `/api/analytics?type=students-needing-attention&classId=${classId}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setStudents(data.students || []);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch students",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAtRiskStudents();
  }, [classId, toast]);

  if (isLoading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  if (students.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Không có học sinh nào cần chú ý tại thời điểm này 👍
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-900 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Học Sinh Cần Chú Ý ({students.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="p-3 bg-white rounded-lg border border-orange-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                <div>
                  <span className="text-gray-600">Điểm TB:</span>
                  <p className="font-bold text-lg">
                    {student.avgScore.toFixed(1)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Điểm Danh:</span>
                  <p className="font-bold text-lg">
                    {(student.attendanceRate * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Nộp Bài:</span>
                  <p className="font-bold text-lg">
                    {(student.submissionRate * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {student.riskFactors.map((factor, idx) => (
                  <Badge key={idx} variant="destructive" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
