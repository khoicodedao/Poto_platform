"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Users,
    Plus,
    Edit,
    Trash,
    ArrowLeft,
    GraduationCap,
    UserCheck,
    Shield,
} from "lucide-react";
import Link from "next/link";

interface User {
    id: number;
    email: string;
    name: string;
    role: "student" | "teacher" | "teaching_assistant" | "admin";
    isActive: boolean;
    createdAt: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        role: "student" as "student" | "teacher" | "teaching_assistant" | "admin",
    });

    useEffect(() => {
        checkAuth();
        fetchUsers();
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

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreate = () => {
        setEditingUser(null);
        setFormData({
            email: "",
            password: "",
            name: "",
            role: "student",
        });
        setIsDialogOpen(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            password: "",
            name: user.name,
            role: user.role,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingUser
                ? `/api/admin/users/${editingUser.id}`
                : "/api/admin/users";
            const method = editingUser ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save user");

            toast({
                title: "Thành công",
                description: editingUser
                    ? "Cập nhật người dùng thành công"
                    : "Tạo người dùng thành công",
            });

            setIsDialogOpen(false);
            fetchUsers();
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
            const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete user");

            toast({
                title: "Thành công",
                description: "Xóa người dùng thành công",
            });

            setIsDeleteOpen(false);
            setDeleteTarget(null);
            fetchUsers();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error instanceof Error ? error.message : "Có lỗi xảy ra",
                variant: "destructive",
            });
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                    </Badge>
                );
            case "teacher":
                return (
                    <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Giáo viên
                    </Badge>
                );
            case "teaching_assistant":
                return (
                    <Badge className="bg-gradient-to-r from-purple-400 to-pink-400">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        Trợ Giảng
                    </Badge>
                );
            case "student":
                return (
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        Học sinh
                    </Badge>
                );
            default:
                return <Badge>{role}</Badge>;
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
        <div className="container mx auto p-6 pt-24 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

                <div className="relative flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                                Quản Lý Người Dùng
                            </h1>
                        </div>
                        <p className="text-white/90 text-lg font-medium">
                            Tạo, sửa, xóa tài khoản người dùng
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
                            className="bg-white text-blue-600 hover:bg-white/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo Người Dùng
                        </Button>
                    </div>
                </div>
            </div>

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh Sách Người Dùng ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg">{user.name}</h3>
                                        {getRoleBadge(user.role)}
                                        {!user.isActive && (
                                            <Badge variant="outline">Không hoạt động</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                    <p className="text-xs text-gray-400">
                                        ID: {user.id} • Tạo:{" "}
                                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEdit(user)}
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            setDeleteTarget(user);
                                            setIsDeleteOpen(true);
                                        }}
                                    >
                                        <Trash className="w-4 h-4 mr-1" />
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {users.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Chưa có người dùng nào
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? "Cập Nhật Người Dùng" : "Tạo Người Dùng Mới"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? "Chỉnh sửa thông tin người dùng"
                                : "Tạo tài khoản mới cho hệ thống"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                required
                                disabled={!!editingUser}
                            />
                        </div>

                        {!editingUser && (
                            <div>
                                <Label>Mật khẩu</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    required={!editingUser}
                                    placeholder={editingUser ? "Để trống nếu không đổi" : ""}
                                />
                            </div>
                        )}

                        <div>
                            <Label>Họ và Tên</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label>Vai Trò</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, role: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Học Sinh</SelectItem>
                                    <SelectItem value="teacher">Giáo Viên</SelectItem>
                                    <SelectItem value="teaching_assistant">Trợ Giảng</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
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
                                {editingUser ? "Cập Nhật" : "Tạo"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn sắp xóa người dùng "{deleteTarget?.name}". Hành động này
                            không thể hoàn tác.
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
