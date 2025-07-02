import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, BookOpen, Video, MessageCircle, FileText, Award, Clock } from "lucide-react"
import Link from "next/link"
import { getClasses } from "@/lib/actions/classes"
import { getAssignments } from "@/lib/actions/assignments"
import { getFiles } from "@/lib/actions/files"
import { getCurrentSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import UserMenu from "@/components/user-menu"
import { User } from "lucide-react" // Import User icon

export default async function Dashboard() {
  const session = await getCurrentSession()

  // Thêm debug log
  console.log("Current session:", session)

  if (!session) {
    console.log("No session found, redirecting to signin")
    redirect("/auth/signin")
  }

  const { user } = session

  console.log("User authenticated:", user)

  const [classes, assignments, files] = await Promise.all([
    getClasses(),
    getAssignments(user.role === "student" ? user.id : undefined),
    getFiles(),
  ])

  const upcomingClasses = classes.filter((c) => c.status === "active").slice(0, 3)
  const pendingAssignments = user.role === "student" ? assignments.filter((a) => !a.submitted).slice(0, 3) : []
  const recentFiles = files.slice(0, 4)

  const recentActivities = [
    { type: "assignment", title: "Bài tập Toán học đã được chấm", time: "2 giờ trước" },
    { type: "message", title: "Tin nhắn mới từ Thầy Nam", time: "3 giờ trước" },
    { type: "file", title: "Tài liệu mới: Ngữ pháp tiếng Anh", time: "5 giờ trước" },
    { type: "recording", title: "Bản ghi buổi học Vật lý đã sẵn sàng", time: "1 ngày trước" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">EduPlatform</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Tin nhắn
              </Button>
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng trở lại, {user.name}!</h2>
          <p className="text-gray-600">
            {user.role === "student"
              ? `Hôm nay bạn có ${upcomingClasses.length} lớp học và ${pendingAssignments.length} bài tập cần hoàn thành`
              : `Bạn đang quản lý ${classes.length} lớp học`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/classes">
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Video className="h-6 w-6" />
                      <span className="text-sm">{user.role === "teacher" ? "Quản lý lớp" : "Tham gia lớp"}</span>
                    </Button>
                  </Link>
                  {user.role === "teacher" && (
                    <Link href="/classes/create">
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Calendar className="h-6 w-6" />
                        <span className="text-sm">Tạo lớp học</span>
                      </Button>
                    </Link>
                  )}
                  <Link href="/files">
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Tài liệu</span>
                    </Button>
                  </Link>
                  <Link href="/assignments">
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Award className="h-6 w-6" />
                      <span className="text-sm">Bài tập</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Classes */}
            <Card>
              <CardHeader>
                <CardTitle>{user.role === "teacher" ? "Lớp học của bạn" : "Lớp học sắp tới"}</CardTitle>
                <CardDescription>
                  {user.role === "teacher" ? "Các lớp học bạn đang giảng dạy" : "Các buổi học đang hoạt động"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingClasses.map((class_) => (
                    <div key={class_.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{class_.title}</h3>
                          <p className="text-sm text-gray-500">{class_.teacher_name}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {class_.schedule}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {class_.student_count} học viên
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={class_.status === "active" ? "default" : "secondary"}>
                          {class_.status === "active" ? "Đang hoạt động" : "Đang tuyển sinh"}
                        </Badge>
                        <Link href={`/classroom/${class_.id}`}>
                          <Button size="sm">{user.role === "teacher" ? "Vào lớp" : "Tham gia"}</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Assignments - Only for students */}
            {user.role === "student" && (
              <Card>
                <CardHeader>
                  <CardTitle>Bài tập cần hoàn thành</CardTitle>
                  <CardDescription>Các bài tập chưa nộp</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Award className="h-6 w-6 text-orange-600" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                            <p className="text-sm text-gray-500">{assignment.class_title}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Hạn: {new Date(assignment.due_date).toLocaleDateString("vi-VN")}
                              </span>
                              <span className="text-sm text-gray-500">{assignment.points} điểm</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">Chưa nộp</Badge>
                          <Link href={`/assignments/${assignment.id}/submit`}>
                            <Button size="sm">Làm bài</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
                  <div className="text-sm text-gray-500">Lớp học</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {user.role === "student" ? assignments.filter((a) => a.submitted).length : assignments.length}
                  </div>
                  <div className="text-sm text-gray-500">{user.role === "student" ? "Hoàn thành" : "Bài tập"}</div>
                </CardContent>
              </Card>
            </div>

            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin tài khoản</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <Badge variant={user.role === "teacher" ? "default" : "secondary"} className="mt-1">
                        {user.role === "teacher" ? "Giáo viên" : "Học viên"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === "assignment" && <Award className="h-4 w-4 text-orange-500" />}
                        {activity.type === "message" && <MessageCircle className="h-4 w-4 text-blue-500" />}
                        {activity.type === "file" && <FileText className="h-4 w-4 text-green-500" />}
                        {activity.type === "recording" && <Video className="h-4 w-4 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Files */}
            <Card>
              <CardHeader>
                <CardTitle>Tài liệu mới</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentFiles.map((file) => (
                    <div key={file.id} className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{file.original_name}</p>
                        <p className="text-xs text-gray-500">{file.class_title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Liên kết nhanh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/help" className="block text-sm text-blue-600 hover:underline">
                    Trung tâm trợ giúp
                  </Link>
                  <Link href="/settings" className="block text-sm text-blue-600 hover:underline">
                    Cài đặt tài khoản
                  </Link>
                  <Link href="/feedback" className="block text-sm text-blue-600 hover:underline">
                    Gửi phản hồi
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
