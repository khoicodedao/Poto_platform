import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Award,
  Calendar,
  FileText,
  MessageCircle,
  Users,
  Video,
  Clock,
} from "lucide-react";
import { getClassesForUser } from "@/lib/actions/classes";
import { getAssignments } from "@/lib/actions/assignments";
import { getFiles } from "@/lib/actions/files";
import { getCurrentSession } from "@/lib/auth";

const quickActions = [
  {
    href: "/classes",
    label: "Lớp học",
    description: "Truy cập lớp trực tuyến",
    icon: Video,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    href: "/assignments",
    label: "Bài tập",
    description: "Theo dõi bài tập & điểm số",
    icon: Award,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    href: "/files",
    label: "Tài liệu",
    description: "Kho tài liệu của lớp",
    icon: FileText,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    href: "/classes/create",
    label: "Tạo lớp",
    description: "Dành cho giáo viên",
    icon: Calendar,
    color: "text-purple-600",
    bg: "bg-purple-50",
    teacherOnly: true,
  },
];

export default async function Dashboard() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/auth/signin");
  }

  const { user } = session;

  const [classes, assignments, files] = await Promise.all([
    getClassesForUser(user.id, user.role as any),
    getAssignments(),
    getFiles(),
  ]);

  const featuredClasses = classes.slice(0, 3);
  const featuredAssignments = assignments.slice(0, 3);
  const recentFiles = files.slice(0, 5);

  const heroStats = [
    {
      label: user.role === "teacher" ? "Lớp phụ trách" : "Lớp tham gia",
      value: classes.length,
    },
    {
      label: "Bài tập",
      value: assignments.length,
    },
    {
      label: "Tài liệu",
      value: files.length,
    },
  ];

  const activities = [
    {
      icon: MessageCircle,
      color: "text-blue-500",
      title: "Tin nhắn mới trong lớp học",
      time: "Vừa cập nhật",
    },
    {
      icon: FileText,
      color: "text-green-600",
      title: "Tài liệu mới đã được chia sẻ",
      time: "1 giờ trước",
    },
    {
      icon: Award,
      color: "text-orange-500",
      title: "Bài tập mới vừa được giao",
      time: "2 giờ trước",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <section className="mt-2 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/70">
              Xin chào
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              {user.name}
            </h1>
            <p className="mt-3 max-w-2xl text-white/80">
              {user.role === "teacher"
                ? "Quản lý lớp học, giao bài và đồng hành cùng học viên."
                : "Theo dõi lộ trình học tập và hoàn thành nhiệm vụ mỗi ngày."}
            </p>
          </div>
          <div className="grid w-full grid-cols-3 gap-4 md:w-auto">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/30 bg-white/10 p-4 text-center backdrop-blur"
              >
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-xs text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions
          .filter((action) => (action.teacherOnly ? user.role === "teacher" : true))
          .map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="transition hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`rounded-2xl ${action.bg} p-3`}>
                      <Icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {action.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {user.role === "teacher"
                  ? "Lớp học đang giảng dạy"
                  : "Lớp học của bạn"}
              </CardTitle>
              <CardDescription>
                Tóm tắt các lớp trực tuyến hoạt động gần đây
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredClasses.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-center text-gray-500">
                  Bạn chưa tham gia lớp học nào.
                </div>
              ) : (
                featuredClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-center justify-between rounded-2xl border p-4 shadow-sm"
                  >
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {classItem.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Giảng viên: {classItem.teacher_name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {classItem.schedule ?? "Chưa cập nhật"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {classItem.student_count ?? 0} học viên
                        </span>
                      </div>
                    </div>
                    <Link href={`/classroom/${classItem.id}`}>
                      <Button size="sm" variant="outline">
                        Vào lớp
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bài tập nổi bật</CardTitle>
              <CardDescription>
                {user.role === "teacher"
                  ? "Những bài tập bạn vừa giao gần đây"
                  : "Những bài tập bạn cần chú ý"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredAssignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-center text-gray-500">
                  Chưa có bài tập nào.
                </div>
              ) : (
                featuredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between rounded-2xl border p-4 shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {assignment.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {assignment.className ?? "Lớp học"}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {assignment.dueDate
                            ? new Date(assignment.dueDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : "Không hạn"}
                        </span>
                        <span>{assignment.maxScore ?? 100} điểm</span>
                      </div>
                    </div>
                    <Link href={`/assignments/${assignment.id}`}>
                      <Button size="sm" variant="ghost">
                        Chi tiết
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>Cập nhật từ hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="rounded-full bg-gray-100 p-2">
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tài liệu mới chia sẻ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentFiles.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Chưa có tài liệu nào được tải lên.
                </p>
              ) : (
                recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-2xl border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.classTitle ?? "Tài liệu chung"}
                      </p>
                    </div>
                    <Link href={file.url} target="_blank">
                      <Button size="sm" variant="outline">
                        Xem
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liên kết nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link href="/help" className="text-blue-600 hover:underline">
                Trung tâm trợ giúp
              </Link>
              <Link href="/settings" className="text-blue-600 hover:underline">
                Cài đặt tài khoản
              </Link>
              <Link
                href="/feedback"
                className="text-blue-600 hover:underline"
              >
                Gửi phản hồi
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
