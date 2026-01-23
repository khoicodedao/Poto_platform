import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Users,
  Clock,
  Search,
  Filter,
  Plus,
  Video,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getClassesForUser, getGuestSessionsForTeacher } from "@/lib/actions/classes";
import { redirect } from "next/navigation";

import { CustomBreadcrumb } from "@/components/custom-breadcrumb";
import { MeshGradientHeader } from "@/components/ui/mesh-gradient-header";

export default async function ClassesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const classes = await getClassesForUser(user.id, user.role as any);

  // Fetch guest sessions for teachers
  const guestSessions = user.role === "teacher"
    ? await getGuestSessionsForTeacher(user.id)
    : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-in fade-in duration-500">
      <CustomBreadcrumb items={[{ label: "Lớp học" }]} />

      {/* Header */}
      <MeshGradientHeader>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              Lớp Học Của Tôi
            </h1>
          </div>
          <p className="text-white/90 text-lg font-medium max-w-2xl">
            {user!.role === "teacher"
              ? "Quản lý các lớp học bạn đang giảng dạy và theo dõi tiến độ"
              : user!.role === "student"
                ? "Theo dõi tiến độ học tập và các lớp học bạn đang tham gia"
                : "Quản lý toàn bộ hệ thống lớp học"}
          </p>
        </div>
      </MeshGradientHeader>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors h-4 w-4" />
          <Input
            placeholder="Tìm kiếm lớp học theo tên..."
            className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all shadow-sm group-hover:shadow-md"
          />
        </div>
        <Button variant="outline" className="border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all">
          <Filter className="h-4 w-4 mr-2" />
          Bộ lọc
        </Button>
        {(user!.role === "teacher" || user!.role === "admin") && (
          <Link href="/classes/create">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-xl transition-all h-10">
              <Plus className="h-4 w-4 mr-2" />
              Tạo lớp học
            </Button>
          </Link>
        )}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((class_) => (
          <Card
            key={class_.id}
            className="group overflow-hidden border-0 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="aspect-video bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center text-white transform group-hover:scale-105 transition-transform duration-300">
                  <h3 className="text-xl font-bold mb-2 drop-shadow-md line-clamp-2">{class_.title}</h3>
                  <p className="text-sm font-medium opacity-90 backdrop-blur-sm bg-white/20 rounded-full px-3 py-1 inline-block">
                    {class_.teacher_name}
                  </p>
                </div>
              </div>
              <div className="absolute top-4 right-4 z-10">
                <Badge
                  className={`${class_.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"} shadow-lg border-0`}
                >
                  {class_.status === "active"
                    ? "Đang hoạt động"
                    : "Đang tuyển sinh"}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {class_.title}
                </CardTitle>
              </div>
              <CardDescription className="line-clamp-2 min-h-[40px]">{class_.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="truncate">{class_.schedule || "Chưa có lịch"}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Users className="h-4 w-4 mr-2 text-indigo-500" />
                  <span>{class_.student_count}/{class_.max_students} học viên</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Clock className="h-4 w-4 mr-2 text-purple-500" />
                  <span>
                    Tạo: {new Date(class_.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/classroom/${class_.id}`} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Tham gia
                  </Button>
                </Link>
                <Link href={`/classes/${class_.id}`}>
                  <Button variant="outline" size="sm" className="hover:bg-gray-100 hover:text-blue-600 transition-colors">
                    Chi tiết
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Guest Sessions Section */}
      {user!.role === "teacher" && guestSessions.length > 0 && (
        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Buổi Học Được Mời</h3>
              <p className="text-gray-500">Các buổi học bạn tham gia với tư cách khách mời</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guestSessions.map((session) => (
              <Card
                key={session.sessionId}
                className="group border-l-4 border-l-purple-500 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-3">
                  <CardTitle className="text-lg group-hover:text-purple-700 transition-colors">{session.sessionTitle}</CardTitle>
                  <CardDescription>Lớp: {session.className}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-md">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="truncate">GV: {session.mainTeacherName}</span>
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-md">
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      <span>
                        {new Date(session.sessionDate).toLocaleString("vi-VN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div>
                      <Badge
                        variant={
                          session.status === "completed" ? "secondary" : "default"
                        }
                        className={`mt-1 ${session.status === 'in-progress' ? 'bg-green-500 hover:bg-green-600 animate-pulse' : ''}`}
                      >
                        {session.status === "completed"
                          ? "Đã kết thúc"
                          : session.status === "in-progress"
                            ? "Đang diễn ra"
                            : "Sắp diễn ra"}
                      </Badge>
                    </div>
                  </div>
                  <Link
                    href={`/classes/${session.classId}/sessions/${session.sessionId}`}
                    className="block"
                  >
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Tham gia buổi học
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {classes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce duration-1000">
            <Users className="h-12 w-12 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Chưa có lớp học nào
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {user!.role === "teacher"
              ? "Bắt đầu hành trình giảng dạy bằng cách tạo lớp học đầu tiên của bạn ngay hôm nay."
              : "Bạn chưa được ghi danh vào lớp học nào. Hãy liên hệ với giáo viên hoặc quản trị viên."}
          </p>
          {(user!.role === "teacher" || user!.role === "admin") && (
            <Link href="/classes/create">
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Tạo lớp học
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
