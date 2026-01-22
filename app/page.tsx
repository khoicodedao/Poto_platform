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
  Bell,
  LogIn,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Settings,
  HelpCircle,
} from "lucide-react";
import { getClassesForUser, getGuestSessionsForTeacher } from "@/lib/actions/classes";
import { getAssignments } from "@/lib/actions/assignments";
import { getFiles } from "@/lib/actions/files";
import { getCurrentSession } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { getUpcomingSessions, getImminentSessions } from "@/lib/actions/class-sessions";
import { calculateSessionStatus } from "@/lib/utils/session-status";
import { MascotHeader } from "@/components/gamification/mascot";
import { StreakDisplay } from "@/components/gamification/streak-counter";
import { XPBar, CircularXP } from "@/components/gamification/xp-bar";
import { MeshGradientSection } from "@/components/ui/mesh-gradient-header";
import { MeshGradientCard } from "@/components/ui/mesh-gradient-card";

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

  const [classes, assignments, files, guestSessions, upcomingSessions, imminentSessions] = await Promise.all([
    getClassesForUser(user.id, user.role as any),
    getAssignments(),
    getFiles(),
    user.role === "teacher" ? getGuestSessionsForTeacher(user.id) : Promise.resolve([]),
    getUpcomingSessions(user.id, user.role),
    getImminentSessions(user.id, user.role),
  ]);

  const featuredClasses = classes.slice(0, 3);
  const featuredAssignments = assignments.slice(0, 3);
  const recentFiles = files.slice(0, 5);

  // Get imminent sessions (within 15 minutes) with calculated status
  const imminentSessionsData = imminentSessions.success && Array.isArray(imminentSessions.data)
    ? imminentSessions.data.map(session => ({
      ...session,
      calculatedStatus: calculateSessionStatus(
        session.scheduledAt,
        session.durationMinutes || 60,
        session.status as any
      ),
    }))
    : [];

  // Get upcoming sessions with calculated status, excluding imminent sessions
  const imminentSessionIds = new Set(imminentSessionsData.map(s => s.sessionId));
  const upcomingSessionsData = upcomingSessions.success && Array.isArray(upcomingSessions.data)
    ? upcomingSessions.data
      .filter(session => !imminentSessionIds.has(session.sessionId)) // Exclude imminent sessions
      .map(session => ({
        ...session,
        calculatedStatus: calculateSessionStatus(
          session.scheduledAt,
          session.durationMinutes || 60,
          session.status as any
        ),
      }))
    : [];

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
      {/* Friendly Mascot Greeting */}
      <div className="mt-2">
        <MascotHeader userName={user.name} />
      </div>
      <MeshGradientSection className="mt-2">
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
      </MeshGradientSection>

      {/* Gamification: Streak & XP Cards */}
      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl shadow-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <span className="text-2xl">🔥</span>
              Streak Học Tập
            </CardTitle>
            <CardDescription>Số ngày học liên tiếp</CardDescription>
          </CardHeader>
          <CardContent>
            <StreakDisplay currentStreak={5} longestStreak={30} />
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-lg border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <span className="text-2xl">⭐</span>
              Level & Kinh Nghiệm
            </CardTitle>
            <CardDescription>XP và tiến độ lên level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <CircularXP currentXP={75} targetXP={100} level={3} size="md" />
              <div className="flex-1">
                <XPBar currentXP={75} targetXP={100} level={3} showLabel={false} />
                <p className="mt-2 text-sm text-gray-600">Hoàn thành bài tập để kiếm XP! 🎯</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* URGENT: Imminent Sessions Alert (Within 15 Minutes) */}
      {imminentSessionsData.length > 0 && (
        <section className="mt-6">
          <MeshGradientCard variant="urgent">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md shadow-xl">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-white">
                    KHẨN CẤP: Buổi Học Sắp Bắt Đầu!
                  </CardTitle>
                  <CardDescription className="text-white/90 font-bold text-base">
                    {imminentSessionsData.length} buổi học sẽ bắt đầu trong vòng 15 phút tới
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {imminentSessionsData.map((session, index) => {
                const timeUntilStart = new Date(session.scheduledAt).getTime() - new Date().getTime();
                const minutesUntil = Math.floor(timeUntilStart / (1000 * 60));
                const secondsUntil = Math.floor((timeUntilStart % (1000 * 60)) / 1000);

                return (
                  <div
                    key={session.sessionId}
                    className="flex items-center justify-between rounded-xl border-2 border-white/30 p-5 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] bg-white/90 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {session.calculatedStatus === 'in-progress' ? (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm px-4 py-1.5 shadow-xl font-bold border-2 border-white/40 backdrop-blur-md animate-pulse">
                            ⚡ ĐANG DIỄN RA - VÀO NGAY!
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm px-4 py-1.5 shadow-xl font-bold border-2 border-white/40 backdrop-blur-md animate-pulse">
                            🔥 CÒN {minutesUntil} PHÚT {secondsUntil} GIÂY
                          </Badge>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 text-xl truncate mb-2">
                        {session.sessionTitle}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-red-700 font-bold">
                          <Clock className="h-5 w-5" />
                          {new Date(session.scheduledAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <Link href={`/classroom/${session.classId}`}>
                      <Button
                        size="lg"
                        className="ml-4 font-bold shadow-2xl text-base px-8 py-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 hover:scale-110 transition-all"
                      >
                        <LogIn className="mr-2 h-6 w-6" />
                        VÀO NGAY!
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </CardContent>
          </MeshGradientCard>
        </section>
      )}

      {/* Upcoming Sessions Alert */}
      {upcomingSessionsData.length > 0 && (
        <section className="mt-6">
          <MeshGradientCard variant="warning">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md shadow-lg animate-pulse">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-white drop-shadow-lg">
                    🔔 Buổi Học Sắp Diễn Ra
                  </CardTitle>
                  <CardDescription className="text-white/90 font-semibold">
                    Bạn có {upcomingSessionsData.length} buổi học trong vòng 24 giờ tới
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSessionsData.slice(0, 3).map((session, index) => {
                const timeUntilStart = new Date(session.scheduledAt).getTime() - new Date().getTime();
                const hoursUntil = Math.floor(timeUntilStart / (1000 * 60 * 60));
                const minutesUntil = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
                const isStartingSoon = hoursUntil < 1;

                return (
                  <div
                    key={session.sessionId}
                    className={`flex items-center justify-between rounded-xl border-2 p-4 shadow-md transition-all hover:shadow-lg hover:scale-[1.02] ${isStartingSoon
                      ? 'border-red-300 bg-white/95 backdrop-blur-sm animate-pulse'
                      : 'border-white/30 bg-white/90 backdrop-blur-sm'
                      }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isStartingSoon && (
                          <Badge className="bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold text-xs px-3 py-1 shadow-lg border-2 border-white/30 backdrop-blur-sm animate-bounce">
                            🔥 SẮP BẮT ĐẦU
                          </Badge>
                        )}
                        {session.calculatedStatus === 'in-progress' && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-xs px-3 py-1 shadow-lg border-2 border-white/30 backdrop-blur-sm animate-pulse">
                            ⚡ ĐANG DIỄN RA
                          </Badge>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 text-lg truncate">
                        {session.sessionTitle}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-amber-700 font-semibold">
                          <Clock className="h-4 w-4" />
                          {new Date(session.scheduledAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-gray-600">
                          {isStartingSoon
                            ? `Còn ${minutesUntil} phút`
                            : hoursUntil < 24
                              ? `Còn ${hoursUntil}h ${minutesUntil}m`
                              : 'Sắp tới'}
                        </span>
                      </div>
                    </div>
                    <Link href={`/classroom/${session.classId}`}>
                      <Button
                        className={`ml-4 font-bold shadow-lg ${session.calculatedStatus === 'in-progress'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 animate-pulse'
                          : isStartingSoon
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                          }`}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        {session.calculatedStatus === 'in-progress' ? 'Vào Ngay' : 'Chuẩn Bị'}
                      </Button>
                    </Link>
                  </div>
                );
              })}
              {upcomingSessionsData.length > 3 && (
                <Link href="/classes" className="block">
                  <Button variant="outline" className="w-full mt-2 border-white/40 text-white hover:bg-white/20 backdrop-blur-sm font-semibold">
                    Xem tất cả {upcomingSessionsData.length} buổi học sắp diễn ra
                  </Button>
                </Link>
              )}
            </CardContent>
          </MeshGradientCard>
        </section>
      )}

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
          <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {user.role === "teacher" ? "Lớp giảng dạy" : "Lớp học của bạn"}
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Các lớp học đang hoạt động
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid gap-4">
              {featuredClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Chưa có lớp học nào</p>
                </div>
              ) : (
                featuredClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {classItem.title}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {classItem.teacher_name}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Video className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                          <Clock className="mr-1 w-3 h-3" />
                          {classItem.schedule || "TBA"}
                        </Badge>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                          <Users className="mr-1 w-3 h-3" />
                          {classItem.student_count ?? 0}
                        </Badge>
                      </div>

                      <Link href={`/classroom/${classItem.id}`}>
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mr-2">
                          Vào lớp <ArrowRight className="ml-1 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}

              <Link href="/classes" className="mt-2 block">
                <Button variant="outline" className="w-full border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  Xem tất cả lớp học
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Guest Sessions Card - Only for teachers */}
          {user.role === "teacher" && guestSessions.length > 0 && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    👤 Giáo Viên Khách Mời
                  </Badge>
                  <CardTitle>Buổi Học Được Mời</CardTitle>
                </div>
                <CardDescription>
                  Bạn được mời dạy thay {guestSessions.length} buổi học
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {guestSessions.slice(0, 3).map((session) => (
                  <div
                    key={session.sessionId}
                    className="flex items-center justify-between rounded-xl border border-blue-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {session.sessionTitle}
                      </p>
                      <p className="text-sm text-gray-600">
                        Lớp: {session.className}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          GV: {session.mainTeacherName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.sessionDate).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <Link href={`/classes/${session.classId}/sessions/${session.sessionId}`}>
                      <Button size="sm" className="ml-2">
                        Xem
                      </Button>
                    </Link>
                  </div>
                ))}
                {guestSessions.length > 3 && (
                  <Link href="/classes" className="block">
                    <Button variant="outline" className="w-full mt-2">
                      Xem tất cả {guestSessions.length} buổi học
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Bài tập nổi bật</CardTitle>
                  <CardDescription className="text-orange-100">
                    Nhiệm vụ cần hoàn thành ngay
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {featuredAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Không có bài tập nào</p>
                </div>
              ) : (
                featuredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="group flex items-center gap-4 rounded-xl border border-orange-100 bg-white p-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-orange-200"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100/50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <FileText className="h-6 w-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                        {assignment.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {assignment.className}
                        </span>
                        <span className="flex items-center gap-1 text-orange-600 font-medium">
                          <Calendar className="h-3 w-3" />
                          {assignment.dueDate
                            ? new Date(assignment.dueDate).toLocaleDateString(
                              "vi-VN"
                            )
                            : "Không hạn"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                        {assignment.maxScore ?? 100} đ
                      </span>
                      <Link href={`/assignments/${assignment.id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-orange-600">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
              <Link href="/assignments" className="mt-2 block">
                <Button variant="outline" className="w-full border-dashed border-gray-300 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all">
                  Xem tất cả bài tập
                </Button>
              </Link>
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

          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="border-b border-gray-100 bg-white/50 backdrop-blur-sm pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <span className="text-2xl">🔗</span> Liên kết nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-2">
                {[
                  { href: "/help", label: "Trung tâm trợ giúp", icon: HelpCircle, color: "text-sky-500", bg: "bg-sky-50" },
                  { href: "/settings", label: "Cài đặt tài khoản", icon: Settings, color: "text-slate-500", bg: "bg-slate-50" },
                  { href: "/feedback", label: "Gửi phản hồi", icon: MessageCircle, color: "text-pink-500", bg: "bg-pink-50" },
                ].map((link, i) => (
                  <Link key={link.href} href={link.href}>
                    <div className="group flex items-center justify-between rounded-xl p-3 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${link.bg} transition-colors`}>
                          <link.icon className={`w-4 h-4 ${link.color}`} />
                        </div>
                        <span className="font-medium text-gray-600 group-hover:text-gray-900">{link.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
