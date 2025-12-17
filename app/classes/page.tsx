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
import { getClassesForUser } from "@/lib/actions/classes";
import { redirect } from "next/navigation";

export default async function ClassesPage() {
  const user = await getCurrentUser();

  // if (!user) {
  //   // chưa đăng nhập → tuỳ bạn, có thể redirect
  //   redirect("/login");
  // }

  const classes = await getClassesForUser(user.id, user.role as any);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-gray-900">
                Trang chủ
              </Link>
            </li>
            <li className="text-gray-400">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li className="font-medium text-gray-700">Lớp học</li>
          </ol>
        </nav>
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Lớp học của tôi
          </h2>
          <p className="text-gray-600">
            {user.role === "teacher"
              ? "Các lớp bạn đang giảng dạy"
              : user.role === "student"
              ? "Các lớp bạn đang tham gia"
              : "Quản lý tất cả lớp học trên hệ thống"}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Tìm kiếm lớp học..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </Button>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((class_) => (
            <Card
              key={class_.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-bold mb-2">{class_.title}</h3>
                    <p className="text-sm opacity-90">{class_.teacher_name}</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={
                      class_.status === "active" ? "default" : "secondary"
                    }
                  >
                    {class_.status === "active"
                      ? "Đang hoạt động"
                      : "Đang tuyển sinh"}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{class_.title}</CardTitle>
                <CardDescription>{class_.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {class_.schedule}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {class_.student_count}/{class_.max_students} học viên
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Tạo:{" "}
                    {new Date(class_.created_at).toLocaleDateString("vi-VN")}
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Link href={`/classroom/${class_.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        Tham gia
                      </Button>
                    </Link>
                    <Link href={`/classes/${class_.id}`}>
                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {classes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có lớp học nào
            </h3>
            <p className="text-gray-500 mb-6">
              {user.role === "teacher"
                ? "Bắt đầu bằng cách tạo lớp học đầu tiên của bạn"
                : "Bạn chưa được ghi danh vào lớp học nào"}
            </p>
            {user.role === "teacher" || user.role === "admin" ? (
              <Link href="/classes/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo lớp học
                </Button>
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
