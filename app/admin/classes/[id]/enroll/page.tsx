"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
    UserPlus,
    UserMinus,
    ArrowLeft,
    Users,
    GraduationCap,
    Calendar,
    Edit,
    Search,
} from "lucide-react";
import Link from "next/link";

interface Student {
    id: number;
    name: string;
    email: string;
}

interface EnrolledStudent extends Student {
    enrolledAt: string;
    endDate?: string | null;
}

export default function AdminEnrollStudentsPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const classId = parseInt(params.id as string);

    const [className, setClassName] = useState("");
    const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [enrollDialog, setEnrollDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedEnrolled, setSelectedEnrolled] = useState<EnrolledStudent | null>(null);
    const [endDate, setEndDate] = useState("");

    // Search states
    const [searchEnrolled, setSearchEnrolled] = useState("");
    const [searchAvailable, setSearchAvailable] = useState("");

    useEffect(() => {
        checkAuth();
        fetchData();
    }, [classId]);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                if (data.user?.role !== "admin") {
                    router.push("/");
                    return;
                }
                setUserRole(data.user.role);
            } else {
                router.push("/auth/signin");
            }
        } catch (e) {
            console.error("Failed to check auth:", e);
            router.push("/auth/signin");
        }
    };

    const fetchData = async () => {
        try {
            const classRes = await fetch(`/api/classes/${classId}`);
            if (classRes.ok) {
                const classData = await classRes.json();
                setClassName(classData.name || "Lớp học");
            }

            const enrolledRes = await fetch(`/api/admin/classes/${classId}/students`);
            if (enrolledRes.ok) {
                const data = await enrolledRes.json();
                setEnrolledStudents(data.students || []);
            }

            const availableRes = await fetch(
                `/api/admin/classes/${classId}/available-students`
            );
            if (availableRes.ok) {
                const data = await availableRes.json();
                setAvailableStudents(data.students || []);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openEnrollDialog = (student: Student) => {
        setSelectedStudent(student);
        setEndDate("");
        setEnrollDialog(true);
    };

    const openEditDialog = (student: EnrolledStudent) => {
        setSelectedEnrolled(student);
        setEndDate(student.endDate ? student.endDate.split("T")[0] : "");
        setEditDialog(true);
    };

    const handleEnroll = async () => {
        if (!selectedStudent) return;

        try {
            const res = await fetch(`/api/admin/classes/${classId}/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: selectedStudent.id,
                    endDate: endDate || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to enroll student");

            toast({
                title: "Thành công",
                description: "Đã thêm học sinh vào lớp",
            });

            setEnrollDialog(false);
            fetchData();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error instanceof Error ? error.message : "Có lỗi xảy ra",
                variant: "destructive",
            });
        }
    };

    const handleUpdateEndDate = async () => {
        if (!selectedEnrolled) return;

        try {
            const res = await fetch(`/api/admin/classes/${classId}/enroll`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: selectedEnrolled.id,
                    endDate: endDate || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to update end date");

            toast({
                title: "Thành công",
                description: "Đã cập nhật thời gian kết thúc",
            });

            setEditDialog(false);
            fetchData();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error instanceof Error ? error.message : "Có lỗi xảy ra",
                variant: "destructive",
            });
        }
    };

    const handleUnenroll = async (studentId: number) => {
        try {
            const res = await fetch(`/api/admin/classes/${classId}/enroll`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId }),
            });

            if (!res.ok) throw new Error("Failed to remove student");

            toast({
                title: "Thành công",
                description: "Đã xóa học sinh khỏi lớp",
            });

            fetchData();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error instanceof Error ? error.message : "Có lỗi xảy ra",
                variant: "destructive",
            });
        }
    };

    if (isLoading || !userRole) {
        return (
            <div className="container mx-auto p-6 pt-24">
                <div className="text-center py-8">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-teal-600 to-cyan-600 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

                <div className="relative flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                                Gán Học Sinh
                            </h1>
                        </div>
                        <p className="text-white/90 text-lg font-medium">
                            Lớp: {className}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/admin/classes">
                            <Button
                                variant="ghost"
                                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm transition-all duration-200"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Quay Lại
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enrolled Students */}
                <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all duration-200">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50/50 border-b border-green-100/50 pb-4">
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <GraduationCap className="w-5 h-5" />
                            Học Sinh Trong Lớp ({enrolledStudents.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-6">
                        {/* Search Box */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm theo tên hoặc email..."
                                    value={searchEnrolled}
                                    onChange={(e) => setSearchEnrolled(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {(() => {
                                const filtered = enrolledStudents.filter((student) =>
                                    student.name.toLowerCase().includes(searchEnrolled.toLowerCase()) ||
                                    student.email.toLowerCase().includes(searchEnrolled.toLowerCase())
                                );

                                return filtered.length > 0 ? (
                                    filtered.map((student) => (
                                        <div
                                            key={student.id}
                                            className="p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">{student.name}</p>
                                                    <p className="text-sm text-gray-600">{student.email}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(student)}
                                                        className="hover:bg-blue-50 hover:border-blue-300 h-8 w-8 p-0"
                                                        title="Chỉnh sửa thời gian"
                                                    >
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUnenroll(student.id)}
                                                        className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 h-8 w-8 p-0"
                                                        title="Bỏ học sinh khỏi lớp"
                                                    >
                                                        <UserMinus className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(student.enrolledAt).toLocaleDateString("vi-VN")}
                                                </span>
                                                {student.endDate && (
                                                    <Badge variant="outline" className="text-xs border-orange-200 bg-orange-50 text-orange-700">
                                                        Kết thúc:{" "}
                                                        {new Date(student.endDate).toLocaleDateString("vi-VN")}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : searchEnrolled ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Không tìm thấy học sinh nào với từ khóa "{searchEnrolled}"
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Chưa có học sinh nào trong lớp
                                    </div>
                                );
                            })()}
                        </div>
                    </CardContent>
                </Card>

                {/* Available Students */}
                <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all duration-200">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100/50 pb-4">
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <UserPlus className="w-5 h-5" />
                            Học Sinh Chưa Vào Lớp ({availableStudents.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-6">
                        {/* Search Box */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm theo tên hoặc email..."
                                    value={searchAvailable}
                                    onChange={(e) => setSearchAvailable(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {(() => {
                                const filtered = availableStudents.filter((student) =>
                                    student.name.toLowerCase().includes(searchAvailable.toLowerCase()) ||
                                    student.email.toLowerCase().includes(searchAvailable.toLowerCase())
                                );

                                return filtered.length > 0 ? (
                                    filtered.map((student) => (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">{student.name}</p>
                                                <p className="text-sm text-gray-600">{student.email}</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEnrollDialog(student)}
                                                className="hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                                            >
                                                <UserPlus className="w-4 h-4 mr-1" />
                                                Thêm
                                            </Button>
                                        </div>
                                    ))
                                ) : searchAvailable ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Không tìm thấy học sinh nào với từ khóa "{searchAvailable}"
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Không còn học sinh nào
                                    </div>
                                );
                            })()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Enroll Dialog */}
            <Dialog open={enrollDialog} onOpenChange={setEnrollDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm Học Sinh Vào Lớp</DialogTitle>
                        <DialogDescription>
                            Học sinh: {selectedStudent?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Thời Gian Kết Thúc (Tùy chọn)</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Để trống nếu không giới hạn thời gian
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEnrollDialog(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleEnroll}>Thêm Vào Lớp</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit End Date Dialog */}
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập Nhật Thời Gian Kết Thúc</DialogTitle>
                        <DialogDescription>
                            Học sinh: {selectedEnrolled?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Thời Gian Kết Thúc</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Để trống để xóa giới hạn thời gian
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditDialog(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleUpdateEndDate}>Cập Nhật</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
