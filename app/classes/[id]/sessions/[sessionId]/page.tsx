"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, Users } from "lucide-react";
import { AttendanceChecklist } from "@/components/attendance-checklist";
import { StudentFeedbackForm } from "@/components/student-feedback-form";
import { ClassReportForm } from "@/components/class-report-form";
import { CustomBreadcrumb } from "@/components/custom-breadcrumb";

interface ClassSession {
  id: number;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
}

interface Student {
  studentId: number;
  name?: string;
  email?: string;
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = parseInt(params.sessionId as string);
  const classId = parseInt(params.id as string);

  const [session, setSession] = useState<ClassSession | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [className, setClassName] = useState<string>("");

  useEffect(() => {
    fetchSessionData();
    fetchClassStudents();
    fetchFeedbacks();
    fetchClassDetails();
    fetchAttendanceCount();
  }, [sessionId, classId]);

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/class-sessions/${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch session");
      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError(String(err));
    }
  };

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setClassName(data.class?.name || "Lớp học");
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
    }
  };

  const fetchClassStudents = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}/students`);
      if (!response.ok) throw new Error("Failed to fetch class students");
      const result = await response.json();
      const studentsData = result.students || result.data || [];
      setStudents(
        Array.isArray(studentsData)
          ? studentsData.map((s: any) => ({
            studentId: s.id ?? s.studentId,
            name: s.name ?? "Học sinh",
            email: s.email ?? "",
          }))
          : []
      );
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceCount = async () => {
    try {
      const res = await fetch(`/api/attendance?sessionId=${sessionId}`);
      if (!res.ok) return setAttendanceCount(0);
      const data = await res.json();
      // Only count students who are present, late, or early-leave (not absent)
      const validAttendance = Array.isArray(data)
        ? data.filter((record: any) => record.status !== "absent")
        : [];
      setAttendanceCount(validAttendance.length);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setAttendanceCount(0);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`/api/student-feedback?sessionId=${sessionId}`);
      if (!res.ok) return setFeedbacks([]);
      const data = await res.json();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setFeedbacks([]);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Không thể tải buổi học"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <CustomBreadcrumb
        items={[
          { label: "Quản lý lớp học", href: "/classes" },
          { label: className || `Lớp ${classId}`, href: `/classes/${classId}` },
          { label: session.title, href: `/classes/${classId}/sessions/${sessionId}` },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{session.title}</h1>
        {session.description && (
          <p className="text-gray-600 mt-2">{session.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Thời gian</p>
                <p className="font-semibold">
                  {formatDate(session.scheduledAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Thời lượng</p>
                <p className="font-semibold">{session.durationMinutes} phút</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              <p className="font-semibold capitalize">{session.status}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="attendance">Điểm Danh</TabsTrigger>
          <TabsTrigger value="feedback">Nhận Xét</TabsTrigger>
          <TabsTrigger value="report">Báo Cáo</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Điểm Danh Học Sinh</CardTitle>
              <CardDescription>
                Đánh dấu sự tham gia của học sinh trong buổi học
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <AttendanceChecklist
                  sessionId={sessionId}
                  students={students.map((s) => ({
                    id: s.studentId,
                    name: s.name || "Học sinh",
                    email: s.email || "",
                  }))}
                  onSubmit={() => fetchAttendanceCount()}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có dữ liệu học sinh để điểm danh</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="space-y-4">
            {students.length === 0 && (
              <Card>
                <CardContent className="text-center text-gray-500">
                  Chưa có học sinh để nhận xét
                </CardContent>
              </Card>
            )}

            {students.map((s) => (
              <div key={s.studentId} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.email}</p>
                </div>
                <div>
                  <Button
                    onClick={() => {
                      setSelectedStudentId(s.studentId);
                      setSelectedStudentName(s.name || "Học sinh");
                    }}
                  >
                    Nhận Xét
                  </Button>
                </div>
              </div>
            ))}

            {selectedStudentId && (
              <StudentFeedbackForm
                sessionId={sessionId}
                studentId={selectedStudentId}
                studentName={selectedStudentName}
                onSuccess={() => {
                  setSelectedStudentId(null);
                  // refresh feedback list after successful save
                  fetchFeedbacks();
                }}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="report">
          <div className="space-y-4">
            <ClassReportForm
              sessionId={sessionId}
              totalStudents={students.length}
              attendanceCount={attendanceCount}
              onSuccess={() => {
                // optionally refresh reports or notify
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Feedback list */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Nhận xét đã lưu</CardTitle>
            <CardDescription>
              Danh sách nhận xét cho buổi học này
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feedbacks.length === 0 ? (
              <div className="text-gray-500">Chưa có nhận xét nào</div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((f: any) => {
                  const studentName =
                    students.find((s) => s.studentId === f.studentId)?.name ||
                    "Học sinh";
                  return (
                    <div key={f.id} className="p-4 border rounded">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{studentName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(f.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </div>
                      <div className="text-sm text-gray-800 mb-2">
                        {f.feedbackText}
                      </div>
                      <div className="text-xs text-gray-600">
                        Điểm thái độ: {f.attitudeScore ?? "-"} • Mức độ:{" "}
                        {f.participationLevel}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
