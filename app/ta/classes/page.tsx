"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Users, CheckCircle, XCircle, FileText, Calendar } from "lucide-react";
import Link from "next/link";

type TAClass = {
    id: number;
    classId: number;
    className: string | null;
    classDescription: string | null;
    classSchedule: string | null;
    teacherName: string | null;
    teacherEmail: string | null;
    canMarkAttendance: boolean | null;
    canManageMaterials: boolean | null;
    canGradeAssignments: boolean | null;
    canManageSessions: boolean | null;
};

const CLASS_COLORS = [
    "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#f97316", "#84cc16",
];

export default function TAClassesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [classes, setClasses] = useState<TAClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/ta/classes");

            if (response.status === 401) {
                toast({
                    title: "Không có quyền",
                    description: "Bạn cần đăng nhập với tài khoản Trợ Giảng",
                    variant: "destructive",
                });
                router.push("/auth/signin");
                return;
            }

            if (!response.ok) throw new Error("Failed to fetch classes");

            const data = await response.json();
            setClasses(data.data || []);
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách lớp học",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pt-4 space-y-6">
                {/* Header */}
                <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-2xl">
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold">Lớp Học Của Tôi</h1>
                        </div>
                        <p className="text-white/90 max-w-3xl">
                            Quản lý và truy cập tất cả các lớp học bạn được gán làm trợ giảng
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng Lớp</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{classes.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Điểm Danh</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {classes.filter(c => c.canMarkAttendance).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tài Liệu</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {classes.filter(c => c.canManageMaterials).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Chấm Bài</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {classes.filter(c => c.canGradeAssignments).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Classes List */}
                {isLoading ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-gray-500">Đang tải...</p>
                        </CardContent>
                    </Card>
                ) : classes.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-medium mb-2">
                                Chưa được gán vào lớp nào
                            </p>
                            <p className="text-gray-400 text-sm">
                                Liên hệ admin để được gán vào các lớp học
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {classes.map((cls, index) => (
                            <Card
                                key={cls.id}
                                className="hover:shadow-lg transition-shadow border-t-4"
                                style={{ borderTopColor: CLASS_COLORS[index % CLASS_COLORS.length] }}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div
                                                className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-2"
                                                style={{ backgroundColor: CLASS_COLORS[index % CLASS_COLORS.length] }}
                                            >
                                                Lớp {index + 1}
                                            </div>
                                            <CardTitle className="text-xl">{cls.className}</CardTitle>
                                            {cls.classDescription && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    {cls.classDescription}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Teacher Info */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="w-4 h-4" />
                                        <span>Giảng viên: <strong>{cls.teacherName}</strong></span>
                                    </div>

                                    {/* Schedule */}
                                    {cls.classSchedule && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>{cls.classSchedule}</span>
                                        </div>
                                    )}

                                    {/* Permissions */}
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Quyền hạn của bạn:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {cls.canMarkAttendance && (
                                                <Badge variant="outline" className="text-xs">
                                                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                                    Điểm danh
                                                </Badge>
                                            )}
                                            {cls.canManageMaterials && (
                                                <Badge variant="outline" className="text-xs">
                                                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                                    Tài liệu
                                                </Badge>
                                            )}
                                            {cls.canGradeAssignments && (
                                                <Badge variant="outline" className="text-xs">
                                                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                                    Chấm bài
                                                </Badge>
                                            )}
                                            {cls.canManageSessions && (
                                                <Badge variant="outline" className="text-xs">
                                                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                                    Buổi học
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Links */}
                                    <div className="pt-4 border-t flex flex-wrap gap-2">
                                        <Link href={`/classes/${cls.classId}`}>
                                            <Button size="sm" variant="outline">
                                                Trang Lớp
                                            </Button>
                                        </Link>
                                        {cls.canMarkAttendance && (
                                            <Link href={`/classes/${cls.classId}/sessions`}>
                                                <Button size="sm" variant="outline">
                                                    Buổi Học
                                                </Button>
                                            </Link>
                                        )}
                                        {cls.canManageMaterials && (
                                            <Link href={`/classes/${cls.classId}/materials`}>
                                                <Button size="sm" variant="outline">
                                                    Tài Liệu
                                                </Button>
                                            </Link>
                                        )}
                                        {cls.canGradeAssignments && (
                                            <Link href={`/classes/${cls.classId}/assignments`}>
                                                <Button size="sm" variant="outline">
                                                    Bài Tập
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
