import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, FileText, CheckCircle, AlertCircle, Download, Upload } from "lucide-react"
import Link from "next/link"
import { getAssignments } from "@/lib/actions/assignments"

export default async function AssignmentsPage() {
  // Simulate current user (in real app, get from session)
  const currentUserId = 5 // Student ID

  const assignments = await getAssignments(currentUserId)

  const pendingAssignments = assignments.filter((a) => !a.submitted)
  const completedAssignments = assignments.filter((a) => a.submitted && a.grade !== null)
  const overdueAssignments = assignments.filter((a) => !a.submitted && new Date(a.due_date) < new Date())

  const getStatusBadge = (assignment: any) => {
    if (assignment.submitted && assignment.grade !== null) {
      return (
        <Badge variant="default" className="bg-green-500">
          Đã hoàn thành
        </Badge>
      )
    } else if (!assignment.submitted && new Date(assignment.due_date) < new Date()) {
      return <Badge variant="destructive">Quá hạn</Badge>
    } else {
      return <Badge variant="outline">Chưa nộp</Badge>
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">EduPlatform</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>HV</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bài tập & Kiểm tra</h2>
          <p className="text-gray-600">Quản lý và theo dõi tiến độ học tập của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng bài tập</p>
                  <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Chưa nộp</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingAssignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900">{completedAssignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Quá hạn</p>
                  <p className="text-2xl font-bold text-gray-900">{overdueAssignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="pending">Chưa nộp ({pendingAssignments.length})</TabsTrigger>
            <TabsTrigger value="completed">Đã hoàn thành ({completedAssignments.length})</TabsTrigger>
            <TabsTrigger value="overdue">Quá hạn ({overdueAssignments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        {assignment.class_title} • {assignment.teacher_name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(assignment)}
                      <Badge variant="outline">{assignment.points} điểm</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{assignment.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Hạn nộp: {new Date(assignment.due_date).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(assignment.due_date).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {!assignment.submitted && (
                        <div
                          className={`font-medium ${getDaysUntilDue(assignment.due_date) > 0 ? "text-orange-600" : "text-red-600"}`}
                        >
                          {getDaysUntilDue(assignment.due_date) > 0
                            ? `Còn ${getDaysUntilDue(assignment.due_date)} ngày`
                            : "Đã quá hạn"}
                        </div>
                      )}
                    </div>

                    {assignment.grade !== null && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Điểm số</p>
                        <p className="text-lg font-bold text-green-600">
                          {assignment.grade}/{assignment.points}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {!assignment.submitted && (
                      <>
                        <Link href={`/assignments/${assignment.id}/submit`}>
                          <Button size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Nộp bài
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Tải đề bài
                        </Button>
                      </>
                    )}
                    {assignment.submitted && (
                      <Link href={`/assignments/${assignment.id}/view`}>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Xem bài đã nộp
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        {assignment.class_title} • {assignment.teacher_name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(assignment)}
                      <Badge variant="outline">{assignment.points} điểm</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{assignment.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Hạn nộp: {new Date(assignment.due_date).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(assignment.due_date).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div
                        className={`font-medium ${getDaysUntilDue(assignment.due_date) > 0 ? "text-orange-600" : "text-red-600"}`}
                      >
                        {getDaysUntilDue(assignment.due_date) > 0
                          ? `Còn ${getDaysUntilDue(assignment.due_date)} ngày`
                          : "Đã quá hạn"}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/assignments/${assignment.id}/submit`}>
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Nộp bài
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Tải đề bài
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedAssignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        {assignment.class_title} • {assignment.teacher_name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(assignment)}
                      <Badge variant="outline">{assignment.points} điểm</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{assignment.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Đã nộp:{" "}
                        {assignment.submission_date
                          ? new Date(assignment.submission_date).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </div>
                    </div>

                    {assignment.grade !== null && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Điểm số</p>
                        <p className="text-lg font-bold text-green-600">
                          {assignment.grade}/{assignment.points}
                        </p>
                        <Progress value={(assignment.grade / assignment.points) * 100} className="w-20 mt-1" />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/assignments/${assignment.id}/view`}>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Xem bài đã nộp
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            {overdueAssignments.map((assignment) => (
              <Card key={assignment.id} className="border-red-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        {assignment.class_title} • {assignment.teacher_name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(assignment)}
                      <Badge variant="outline">{assignment.points} điểm</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{assignment.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Hạn nộp: {new Date(assignment.due_date).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(assignment.due_date).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-red-600 font-medium">
                        Quá hạn {Math.abs(getDaysUntilDue(assignment.due_date))} ngày
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/assignments/${assignment.id}/submit`}>
                      <Button variant="destructive" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Nộp muộn
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Tải đề bài
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
