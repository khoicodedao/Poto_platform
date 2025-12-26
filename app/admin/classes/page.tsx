"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    BookOpen,
    Plus,
    Edit,
    Trash,
    ArrowLeft,
    Users,
    UserCheck,
    UserPlus,
} from "lucide-react";
import Link from "next/link";

interface Class {
    id: number;
    name: string;
    description: string | null;
    teacherId: number;
    teacherName: string;
    teachingAssistantId: number | null;
    taName: string | null;
    schedule: string | null;
    maxStudents: number;
    studentCount: number;
    isActive: boolean;
    createdAt: string;
}

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface TA {
    id: number;
    name: string;
    email: string;
}

export default function AdminClassesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [tas, setTas] = useState<TA[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Class | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        teacherId: "",
        teachingAssistantId: "",
        schedule: "",
        maxStudents: 20,
    });

    useEffect(() => {
        checkAuth();
        fetchClasses();
        fetchTeachers();
        fetchTAs();
    }, []);

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

    const fetchClasses = async () => {
        try {
            const res = await fetch("/api/admin/classes");
            if (res.ok) {
                const data = await res.json();
                setClasses(data.classes || []);
            }
        } catch (error) {
            console.error("Failed to fetch classes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await fetch("/api/admin/teachers");
            if (res.ok) {
                const data = await res.json();
                setTeachers(data.teachers || []);
            }
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
        }
    };

    const fetchTAs = async () => {
        try {
            const res = await fetch("/api/admin/teaching-assistants");
            if (res.ok) {
                const data = await res.json();
                setTas(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch TAs:", error);
        }
    };

    const openCreate = () => {
        setEditingClass(null);
        setFormData({
            name: "",
            description: "",
            teacherId: "",
            teachingAssistantId: "",
            schedule: "",
            maxStudents: 20,
        });
        setIsDialogOpen(true);
    };

    const openEdit = (classItem: Class) => {
        setEditingClass(classItem);
        setFormData({
            name: classItem.name,
            description: classItem.description || "",
            teacherId: classItem.teacherId.toString(),
            teachingAssistantId: classItem.teachingAssistantId?.toString() || "",
            schedule: classItem.schedule || "",
            maxStudents: classItem.maxStudents,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.teacherId) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn giáo viên",
                variant: "destructive",
            });
            return;
        }

        try {
            const url = editingClass
                ? `/api/admin/classes/${editingClass.id}`
                : "/api/admin/classes";
            const method = editingClass ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    teacherId: parseInt(formData.teacherId),
                    teachingAssistantId: formData.teachingAssistantId ? parseInt(formData.teachingAssistantId) : null,
                }),
            });

            if (!res.ok) throw new Error("Failed to save class");

            toast({
                title: "Thành công",
                description: editingClass
                    ? "Cập nhật lớp học thành công"
                    : "Tạo lớp học thành công",
            });

            setIsDialogOpen(false);
            fetchClasses();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error instanceof Error ? error.message : "Có lỗi xảy ra",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            const res = await fetch(`/api/admin/classes/${deleteTarget.id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete class");

            toast({
                title: "Thành công",
                description: "Xóa lớp học thành công",
            });

            setIsDeleteOpen(false);
            setDeleteTarget(null);
            fetchClasses();
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
        <div className="container mx-auto p-6 pt-24 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

                <div className="relative flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                                Quản Lý Lớp Học
                            </h1>
                        </div>
                        <p className="text-white/90 text-lg font-medium">
                            Tạo lớp học và gán giáo viên
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/admin/dashboard">
                            <Button
                                variant="ghost"
                                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm transition-all duration-200"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Quay Lại
                            </Button>
                        </Link>
                        <Button
                            onClick={openCreate}
                            className="bg-white text-purple-600 hover:bg-white/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo Lớp Học
                        </Button>
                    </div>
                </div>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => (
                    <Card
                        key={classItem.id}
                        className="hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <CardTitle className="text-xl mb-2">
                                        {classItem.name}
                                    </CardTitle>
                                    {classItem.isActive ? (
                                        <Badge className="bg-green-500">Hoạt động</Badge>
                                    ) : (
                                        <Badge variant="outline">Không hoạt động</Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <UserCheck className="w-4 h-4" />
                                    <span className="font-semibold">GV:</span> {classItem.teacherName}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span className="font-semibold">Học sinh:</span>{" "}
                                    {classItem.studentCount}/{classItem.maxStudents}
                                </div>
                                {classItem.schedule && (
                                    <p className="text-gray-600">📅 {classItem.schedule}</p>
                                )}
                                {classItem.description && (
                                    <p className="text-gray-500 text-xs line-clamp-2">
                                        {classItem.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 mt-4">
                                <Link
                                    href={`/admin/classes/${classItem.id}/enroll`}
                                    className="block"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                    >
                                        <UserPlus className="w-4 h-4 mr-1" />
                                        Gán Học Sinh
                                    </Button>
                                </Link>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEdit(classItem)}
                                        className="flex-1"
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            setDeleteTarget(classItem);
                                            setIsDeleteOpen(true);
                                        }}
                                        className="flex-1"
                                    >
                                        <Trash className="w-4 h-4 mr-1" />
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {classes.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Chưa có lớp học nào
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingClass ? "Cập Nhật Lớp Học" : "Tạo Lớp Học Mới"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingClass
                                ? "Chỉnh sửa thông tin lớp học"
                                : "Tạo lớp học mới và gán giáo viên"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Tên Lớp Học *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="VD: Toán học cơ bản"
                                required
                            />
                        </div>

                        <div>
                            <Label>Mô Tả</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Mô tả về lớp học..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label>Giáo Viên *</Label>
                            <Select
                                value={formData.teacherId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, teacherId: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giáo viên" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                            {teacher.name} ({teacher.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Trợ Giảng (Tùy chọn)</Label>
                            <Select
                                value={formData.teachingAssistantId || "none"}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, teachingAssistantId: value === "none" ? "" : value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trợ giảng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Không gán</SelectItem>
                                    {tas.map((ta) => (
                                        <SelectItem key={ta.id} value={ta.id.toString()}>
                                            {ta.name} ({ta.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                                Trợ giảng sẽ được tự động gán cho các buổi học mới
                            </p>
                        </div>

                        <div>
                            <Label>Lịch Học</Label>
                            <Input
                                value={formData.schedule}
                                onChange={(e) =>
                                    setFormData({ ...formData, schedule: e.target.value })
                                }
                                placeholder="VD: Thứ 2, 4, 6 - 14:00-15:30"
                            />
                        </div>

                        <div>
                            <Label>Số Học Sinh Tối Đa</Label>
                            <Input
                                type="number"
                                value={formData.maxStudents}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        maxStudents: parseInt(e.target.value) || 20,
                                    })
                                }
                                min={1}
                                max={100}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Hủy
                            </Button>
                            <Button type="submit">
                                {editingClass ? "Cập Nhật" : "Tạo"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa lớp học</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn sắp xóa lớp "{deleteTarget?.name}". Hành động này sẽ xóa tất
                            cả dữ liệu liên quan bao gồm buổi học, bài tập. Không thể hoàn
                            tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
