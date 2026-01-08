"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Clock, LogOut } from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
}

interface AttendanceRecord {
  id: number;
  studentId: number;
  status: "present" | "absent" | "late" | "early-leave";
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
}

interface AttendanceChecklistProps {
  sessionId: number;
  students: Student[];
  onSubmit?: (data: AttendanceRecord[]) => void;
}

export function AttendanceChecklist({
  sessionId,
  students,
  onSubmit,
}: AttendanceChecklistProps) {
  const [attendance, setAttendance] = useState<
    Record<number, AttendanceRecord>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Fetch existing attendance for this session
    fetchAttendance();

    // Auto-refresh attendance every 10 seconds to catch auto-attendance from classroom
    const refreshInterval = setInterval(() => {
      fetchAttendance();
    }, 10000); // 10 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, [sessionId]);


  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance?sessionId=${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch attendance");

      const data = await response.json();
      const attendanceMap: Record<number, AttendanceRecord> = {};

      data.forEach((record: AttendanceRecord) => {
        attendanceMap[record.studentId] = record;
      });

      setAttendance(attendanceMap);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const handleStatusChange = (studentId: number, status: string) => {
    const now = new Date();
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        id: prev[studentId]?.id || 0,
        studentId,
        status: status as "present" | "absent" | "late" | "early-leave",
        checkInTime:
          prev[studentId]?.checkInTime ||
          (status !== "absent" ? now : undefined),
      },
    }));
  };

  const handleNotesChange = (studentId: number, notes: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        id: prev[studentId]?.id || 0,
        studentId,
        status: prev[studentId]?.status || "absent",
        notes,
      },
    }));
  };

  const handleCheckOut = (studentId: number) => {
    const now = new Date();
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        id: prev[studentId]?.id || 0,
        studentId,
        status: prev[studentId]?.status || "present",
        checkOutTime: now,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const attendanceRecords = Object.values(attendance);

      for (const record of attendanceRecords) {
        if (record.studentId) {
          const response = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              studentId: record.studentId,
              status: record.status,
              checkInTime: record.checkInTime,
              notes: record.notes,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Failed to mark attendance for student ${record.studentId}`
            );
          }
        }
      }

      setSuccess("✓ Điểm danh đã được lưu thành công");
      if (onSubmit) onSubmit(attendanceRecords);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-600">Có mặt</Badge>;
      case "absent":
        return <Badge variant="destructive">Vắng</Badge>;
      case "late":
        return <Badge className="bg-yellow-600">Muộn</Badge>;
      case "early-leave":
        return <Badge className="bg-orange-600">Về sớm</Badge>;
      default:
        return <Badge variant="secondary">Chưa đánh dấu</Badge>;
    }
  };

  const presentCount = Object.values(attendance).filter(
    (a) => a.status === "present"
  ).length;
  const lateCount = Object.values(attendance).filter(
    (a) => a.status === "late"
  ).length;
  const absentCount = Object.values(attendance).filter(
    (a) => a.status === "absent"
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Điểm Danh Buổi Học</CardTitle>
        <CardDescription>
          Có mặt: {presentCount + lateCount} | Vắng: {absentCount} / Tổng cộng:{" "}
          {students.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-900 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {students.map((student) => {
            const record = attendance[student.id];
            const status = record?.status || "absent";

            return (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={status}
                    onValueChange={(val) => handleStatusChange(student.id, val)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Có mặt</SelectItem>
                      <SelectItem value="late">Muộn</SelectItem>
                      <SelectItem value="absent">Vắng</SelectItem>
                      <SelectItem value="early-leave">Về sớm</SelectItem>
                    </SelectContent>
                  </Select>

                  {status !== "absent" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckOut(student.id)}
                      className="w-20"
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Rời
                    </Button>
                  )}

                  {getStatusBadge(status)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4">
          <Label className="text-base font-semibold mb-3 block">
            Ghi chú chung
          </Label>
          <Input
            placeholder="Ghi chú về buổi học (nếu cần)"
            className="mb-4"
          // Add shared notes if needed
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Đang lưu..." : "Lưu Điểm Danh"}
        </Button>
      </CardContent>
    </Card>
  );
}
