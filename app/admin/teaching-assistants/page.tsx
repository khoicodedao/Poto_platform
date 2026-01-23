"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, BookOpen, Trash2, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";

type TA = {
    id: number;
    email: string;
    name: string;
    avatar: string | null;
    createdAt: string;
};

type Class = {
    id: number;
    name: string;
    description: string | null;
    teacherId: number;
};

type Assignment = {
    id: number;
    userId: number;
    classId: number;
    userName: string;
    className: string;
    canMarkAttendance: boolean;
    canManageMaterials: boolean;
    canGradeAssignments: boolean;
    canManageSessions: boolean;
    isActive: boolean;
};

export default function TeachingAssistantsPage() {
    const { toast } = useToast();
    const [tas, setTas] = useState<TA[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedTA, setSelectedTA] = useState<number | null>(null);
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [permissions, setPermissions] = useState({
        canMarkAttendance: true,
        canManageMaterials: true,
        canGradeAssignments: false,
        canManageSessions: true,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Fetch TAs
            const tasRes = await fetch("/api/admin/teaching-assistants");
            if (tasRes.ok) {
                const tasData = await tasRes.json();
                setTas(tasData.data || []);
            }

            // Fetch Classes
            const classesRes = await fetch("/api/admin/classes");
            if (classesRes.ok) {
                const classesData = await classesRes.json();
                setClasses(classesData.data || []);
            }

            // Fetch Assignments
            const assignmentsRes = await fetch("/api/admin/ta-assignments");
            if (assignmentsRes.ok) {
                const assignmentsData = await assignmentsRes.json();
                setAssignments(assignmentsData.data || []);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể tải dữ liệu",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedTA || !selectedClass) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn trợ giảng và lớp học",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch("/api/admin/ta-assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedTA,
                    classId: selectedClass,
                    ...permissions,
                }),
            });

            if (!response.ok) throw new Error("Failed to assign TA");

            toast({
                title: "Thành công",
                description: "Đã gán trợ giảng vào lớp",
            });

            setIsAssignDialogOpen(false);
            setSelectedTA(null);
            setSelectedClass(null);
            setPermissions({
                canMarkAttendance: true,
                canManageMaterials: true,
                canGradeAssignments: false,
                canManageSessions: true,
            });
            fetchData();
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể gán trợ giảng",
                variant: "destructive",
            });
        }
    };

    const handleRemove = async (userId: number, classId: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa assignment này?")) return;

        try {
            const response = await fetch(
                `/api/admin/ta-assignments?userId=${userId}&classId=${classId}`,
                { method: "DELETE" }
            );

            if (!response.ok) throw new Error("Failed to remove assignment");

            toast({
                title: "Thành công",
                description: "Đã xóa assignment",
            });

            fetchData();
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa assignment",
                variant: "destructive",
            });
        }
    };

    // Group assignments by TA
    const assignmentsByTA = assignments.reduce((acc, assignment) => {
        if (!acc[assignment.userId]) {
            acc[assignment.userId] = [];
        }
        acc[assignment.userId].push(assignment);
        return acc;
    }, {} as Record<number, Assignment[]>);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

                <div className="relative flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                                Quản Lý Trợ Giảng
                            </h1>
                        </div>
                        <p className="text-white/90 text-lg font-medium mb-4">
                            Gán trợ giảng vào các lớp học và quản lý quyền hạn của họ
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
                        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-white text-purple-600 hover:bg-white/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Gán Trợ Giảng
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Gán Trợ Giảng Vào Lớp</DialogTitle>
                                    <DialogDescription>
                                        Chọn trợ giảng, lớp học và cấu hình quyền hạn
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Trợ Giảng</Label>
                                        <Select
                                            value={selectedTA?.toString()}
                                            onValueChange={(value) => setSelectedTA(parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trợ giảng" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tas.map((ta) => (
                                                    <SelectItem key={ta.id} value={ta.id.toString()}>
                                                        {ta.name} ({ta.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Lớp Học</Label>
                                        <Select
                                            value={selectedClass?.toString()}
                                            onValueChange={(value) => setSelectedClass(parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn lớp học" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((cls) => (
                                                    <SelectItem key={cls.id} value={cls.id.toString()}>
                                                        {cls.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t">
                                        <Label>Quyền Hạn</Label>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="attendance" className="cursor-pointer">
                                                    Điểm danh
                                                </Label>
                                                <Switch
                                                    id="attendance"
                                                    checked={permissions.canMarkAttendance}
                                                    onCheckedChange={(checked) =>
                                                        setPermissions({ ...permissions, canMarkAttendance: checked })
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="materials" className="cursor-pointer">
                                                    Quản lý tài liệu
                                                </Label>
                                                <Switch
                                                    id="materials"
                                                    checked={permissions.canManageMaterials}
                                                    onCheckedChange={(checked) =>
                                                        setPermissions({ ...permissions, canManageMaterials: checked })
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="grading" className="cursor-pointer">
                                                    Chấm bài tập
                                                </Label>
                                                <Switch
                                                    id="grading"
                                                    checked={permissions.canGradeAssignments}
                                                    onCheckedChange={(checked) =>
                                                        setPermissions({ ...permissions, canGradeAssignments: checked })
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="sessions" className="cursor-pointer">
                                                    Quản lý buổi học
                                                </Label>
                                                <Switch
                                                    id="sessions"
                                                    checked={permissions.canManageSessions}
                                                    onCheckedChange={(checked) =>
                                                        setPermissions({ ...permissions, canManageSessions: checked })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                        Hủy
                                    </Button>
                                    <Button onClick={handleAssign}>
                                        Gán
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900">{tas.length}</h3>
                                    <p className="text-sm text-gray-600 mt-1">Tổng Trợ Giảng</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                                    <BookOpen className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900">{classes.length}</h3>
                                    <p className="text-sm text-gray-600 mt-1">Lớp Học</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-pink-50 border border-pink-100">
                                    <Settings className="h-6 w-6 text-pink-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900">{assignments.length}</h3>
                                    <p className="text-sm text-gray-600 mt-1">Assignments</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* TA List with Assignments */}
                {isLoading ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-gray-500">Đang tải...</p>
                        </CardContent>
                    </Card>
                ) : tas.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-medium mb-2">
                                Chưa có trợ giảng nào
                            </p>
                            <p className="text-gray-400 text-sm">
                                Tạo user với role teaching_assistant để bắt đầu
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {tas.map((ta) => {
                            const taAssignments = assignmentsByTA[ta.id] || [];
                            return (
                                <Card key={ta.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>{ta.name}</CardTitle>
                                                <p className="text-sm text-gray-500">{ta.email}</p>
                                            </div>
                                            <Badge variant="secondary">
                                                {taAssignments.length} lớp
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {taAssignments.length === 0 ? (
                                            <p className="text-sm text-gray-500">Chưa được gán vào lớp nào</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {taAssignments.map((assignment) => (
                                                    <div
                                                        key={assignment.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-medium">{assignment.className}</p>
                                                            <div className="flex gap-2 mt-1">
                                                                {assignment.canMarkAttendance && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Điểm danh
                                                                    </Badge>
                                                                )}
                                                                {assignment.canManageMaterials && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Tài liệu
                                                                    </Badge>
                                                                )}
                                                                {assignment.canGradeAssignments && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Chấm bài
                                                                    </Badge>
                                                                )}
                                                                {assignment.canManageSessions && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Buổi học
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleRemove(ta.id, assignment.classId)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
