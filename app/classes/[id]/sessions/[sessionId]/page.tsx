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
import { AlertCircle, Clock, Users, Star } from "lucide-react";
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);

  useEffect(() => {
    fetchUserInfo();
    fetchSessionData();
    fetchClassStudents();
    fetchFeedbacks();
    fetchClassDetails();
    fetchAttendanceCount();
  }, [sessionId, classId]);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        // User is not authenticated
        console.warn("User is not authenticated - 401");
        setIsUnauthenticated(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user?.role || null);
        setCurrentUserId(data.user?.id || null);
      }
    } catch (e) {
      console.error("Failed to fetch user info:", e);
    }
  };

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

      {/* Show login prompt if unauthenticated */}
      {isUnauthenticated ? (
        <Card className="mt-6 border-red-300">
          <CardContent className="py-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Bạn chưa đăng nhập
              </h3>
              <p className="text-gray-600 mb-4">
                Vui lòng đăng nhập để xem nội dung buổi học
              </p>
              <a
                href="/auth/signin"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đăng nhập
              </a>
            </div>
          </CardContent>
        </Card>
      ) : !userRole ? (
        <Card className="mt-6">
          <CardContent className="py-8">
            <div className="text-center text-gray-500">Đang tải thông tin người dùng...</div>
          </CardContent>
        </Card>
      ) : userRole === 'student' ? (
        // Student view - only see their own feedback
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá của bạn</CardTitle>
            <CardDescription>
              Đánh giá của giáo viên về buổi học này
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feedbacks.filter(f => f.studentId === currentUserId).length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Chưa có đánh giá nào cho bạn trong buổi học này
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks
                  .filter(f => f.studentId === currentUserId)
                  .map((f: any) => {
                    const rating = f.rating || 0;
                    return (
                      <div key={f.id} className="p-5 border-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 shadow-md">
                        <div className="flex justify-between items-center mb-3">
                          <div className="font-semibold text-purple-700 text-base">Đánh giá của giáo viên</div>
                          <div className="text-sm text-gray-500">
                            {new Date(f.createdAt).toLocaleString("vi-VN")}
                          </div>
                        </div>

                        {/* Star Rating Display */}
                        {rating > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-6 h-6 ${star <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-300"
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-gray-700 ml-1">
                              {rating}/5 sao
                            </span>
                          </div>
                        )}

                        <div className="text-sm text-gray-800 leading-relaxed bg-white p-3 rounded-lg border border-purple-100">
                          {f.feedbackText}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Teacher/Admin view - full management features
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
      )}

      {/* Feedback list - only for teachers/admins */}
      {userRole && userRole !== 'student' && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá đã lưu</CardTitle>
              <CardDescription>
                Danh sách đánh giá cho buổi học này
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedbacks.length === 0 ? (
                <div className="text-gray-500">Chưa có đánh giá nào</div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((f: any) => {
                    const studentName =
                      students.find((s) => s.studentId === f.studentId)?.name ||
                      "Học sinh";
                    const rating = f.rating || 0;
                    return (
                      <div key={f.id} className="p-4 border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-3">
                          <div className="font-semibold text-lg text-gray-800">{studentName}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(f.createdAt).toLocaleString("vi-VN")}
                          </div>
                        </div>

                        {/* Star Rating Display */}
                        {rating > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${star <= rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-300"
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-gray-700 ml-1">
                              {rating}/5 sao
                            </span>
                          </div>
                        )}

                        <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md">
                          {f.feedbackText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
