"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
    Users,
    Search,
    Send,
    Edit,
    CheckCircle2,
    XCircle,
    FileSpreadsheet,
    Loader2,
    ShieldAlert,
    UserPlus,
} from "lucide-react";
import { BulkUpdateZaloIdsDialog, SelectFollowerDialog } from "@/components/zalo";
import { MeshGradientHeader } from "@/components/ui/mesh-gradient-header";

type Student = {
    id: number;
    name: string;
    email: string;
    zaloUserId: string | null;
    isActive: boolean;
    createdAt: string;
};

export default function StudentsManagementPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "connected" | "not_connected">("all");

    // Edit Zalo ID Dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [newZaloId, setNewZaloId] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Send Message Dialog
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Select Follower Dialog
    const [selectFollowerDialogOpen, setSelectFollowerDialogOpen] = useState(false);

    const { toast } = useToast();

    // Check authorization
    useEffect(() => {
        checkAuth();
    }, []);

    // Load students
    useEffect(() => {
        if (isAuthorized) {
            loadStudents();
        }
    }, [isAuthorized]);

    const checkAuth = async () => {
        try {
            const response = await fetch("/api/auth/me");
            const data = await response.json();

            if (!data.user || data.user.role !== "admin") {
                toast({
                    title: "Không có quyền truy cập",
                    description: "Chỉ Admin mới có thể truy cập trang này",
                    variant: "destructive",
                });
                router.push("/");
                return;
            }

            setIsAuthorized(true);
        } catch (error) {
            router.push("/");
        } finally {
            setIsCheckingAuth(false);
        }
    };

    // Filter students
    useEffect(() => {
        let filtered = students;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (s) =>
                    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.zaloUserId?.includes(searchQuery)
            );
        }

        // Filter by status
        if (filterStatus === "connected") {
            filtered = filtered.filter((s) => s.zaloUserId);
        } else if (filterStatus === "not_connected") {
            filtered = filtered.filter((s) => !s.zaloUserId);
        }

        setFilteredStudents(filtered);
    }, [students, searchQuery, filterStatus]);

    const loadStudents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/students");
            const data = await response.json();

            if (data.success) {
                setStudents(data.students || []);
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách học viên",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể kết nối đến server",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditZaloId = (student: Student) => {
        setSelectedStudent(student);
        setNewZaloId(student.zaloUserId || "");
        setEditDialogOpen(true);
    };

    const handleSaveZaloId = async () => {
        if (!selectedStudent) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/students/${selectedStudent.id}/zalo`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ zaloUserId: newZaloId.trim() || null }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Cập nhật thành công",
                    description: `Đã cập nhật Zalo ID cho ${selectedStudent.name}`,
                });
                setEditDialogOpen(false);
                loadStudents();
            } else {
                toast({
                    title: "Lỗi",
                    description: data.error || "Không thể cập nhật",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể kết nối đến server",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectFromFollowers = (student: Student) => {
        setSelectedStudent(student);
        setSelectFollowerDialogOpen(true);
    };

    const handleFollowerSelected = async (zaloUserId: string, followerInfo: any) => {
        if (!selectedStudent) return;

        try {
            const response = await fetch(`/api/students/${selectedStudent.id}/zalo`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ zaloUserId }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Liên kết thành công",
                    description: `Đã liên kết ${selectedStudent.name} với ${followerInfo.displayName}`,
                });
                loadStudents();
            } else {
                toast({
                    title: "Lỗi",
                    description: data.error || "Không thể cập nhật",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể kết nối đến server",
                variant: "destructive",
            });
        }
    };

    const handleSendMessage = (student: Student) => {
        setSelectedStudent(student);
        setMessage(`Xin chào ${student.name}!\n\n`);
        setSendDialogOpen(true);
    };

    const handleSendZalo = async () => {
        if (!selectedStudent || !selectedStudent.zaloUserId) return;

        setIsSending(true);
        try {
            const response = await fetch("/api/zalo/test-send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    zaloUserId: selectedStudent.zaloUserId,
                    message: message.trim(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Gửi thành công",
                    description: `Đã gửi tin nhắn đến ${selectedStudent.name}`,
                });
                setSendDialogOpen(false);
                setMessage("");
            } else {
                // Show detailed error message
                let errorTitle = "❌ Gửi tin nhắn thất bại";
                let errorDescription = data.error || "Không thể gửi tin nhắn";

                // Add suggestions based on error code
                if (data.errorCode === "SEVEN_DAY_RULE") {
                    errorDescription += "\n\n💡 Giải pháp: Nhờ học viên nhắn tin cho OA trước, sau đó thử lại.";
                } else if (data.errorCode === "NOT_FOLLOWER") {
                    errorDescription += "\n\n💡 Giải pháp: Nhờ học viên follow lại OA.";
                } else if (data.errorCode === "INVALID_TOKEN") {
                    errorDescription += "\n\n💡 Giải pháp: Vào /api/zalo/refresh-token để lấy token mới.";
                } else if (data.errorCode === "USER_NOT_FOUND") {
                    errorDescription += "\n\n💡 Giải pháp: Kiểm tra lại Zalo ID hoặc chọn lại từ danh sách followers.";
                }

                toast({
                    title: errorTitle,
                    description: errorDescription,
                    variant: "destructive",
                    duration: 10000, // Show longer for error messages
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi kết nối",
                description: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
    };

    const stats = {
        total: students.length,
        connected: students.filter((s) => s.zaloUserId).length,
        notConnected: students.filter((s) => !s.zaloUserId).length,
    };

    // Show loading while checking auth
    if (isCheckingAuth) {
        return (
            <div className="container mx-auto flex min-h-screen items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
                </div>
            </div>
        );
    }

    // Show unauthorized if not admin
    if (!isAuthorized) {
        return (
            <div className="container mx-auto flex min-h-screen items-center justify-center">
                <div className="text-center space-y-4">
                    <ShieldAlert className="h-16 w-16 mx-auto text-destructive" />
                    <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
                    <p className="text-muted-foreground">
                        Chỉ Admin mới có thể truy cập trang này
                    </p>
                    <Button onClick={() => router.push("/")}>
                        Quay về trang chủ
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <MeshGradientHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                                Quản lý Học viên
                            </h1>
                        </div>
                        <p className="text-white/90 text-lg font-medium">
                            Quản lý thông tin học viên và Zalo ID
                        </p>
                    </div>
                </div>
            </MeshGradientHeader>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                                <p className="text-sm text-gray-600 mt-1">Tổng học viên</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline justify-between">
                                    <h3 className="text-2xl font-bold text-gray-900">{stats.connected}</h3>
                                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                        {stats.total > 0 ? ((stats.connected / stats.total) * 100).toFixed(0) : 0}%
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Đã kết nối Zalo</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                                <XCircle className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline justify-between">
                                    <h3 className="text-2xl font-bold text-gray-900">{stats.notConnected}</h3>
                                    <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-200">
                                        {stats.total > 0 ? ((stats.notConnected / stats.total) * 100).toFixed(0) : 0}%
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Chưa kết nối</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions */}
            <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle className="text-xl">Danh sách học viên</CardTitle>
                        </div>
                        <BulkUpdateZaloIdsDialog />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    {/* Search & Filter */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo tên, email, Zalo ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterStatus === "all" ? "default" : "outline"}
                                onClick={() => setFilterStatus("all")}
                                className={filterStatus === "all" ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" : ""}
                            >
                                Tất cả
                            </Button>
                            <Button
                                variant={filterStatus === "connected" ? "default" : "outline"}
                                onClick={() => setFilterStatus("connected")}
                                className={filterStatus === "connected" ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" : ""}
                            >
                                Đã kết nối
                            </Button>
                            <Button
                                variant={filterStatus === "not_connected" ? "default" : "outline"}
                                onClick={() => setFilterStatus("not_connected")}
                                className={filterStatus === "not_connected" ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700" : ""}
                            >
                                Chưa kết nối
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gradient-to-r from-gray-50 to-purple-50/30">
                                    <TableRow>
                                        <TableHead className="font-semibold">Tên</TableHead>
                                        <TableHead className="font-semibold">Email</TableHead>
                                        <TableHead className="font-semibold">Zalo User ID</TableHead>
                                        <TableHead className="font-semibold">Trạng thái</TableHead>
                                        <TableHead className="text-right font-semibold">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Không tìm thấy học viên nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <TableRow key={student.id} className="hover:bg-purple-50/30 transition-colors">
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {student.email}
                                                </TableCell>
                                                <TableCell>
                                                    {student.zaloUserId ? (
                                                        <code className="rounded bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 px-2 py-1 text-xs text-indigo-700 font-mono">
                                                            {student.zaloUserId.substring(0, 15)}...
                                                        </code>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground italic">Chưa có</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {student.zaloUserId ? (
                                                        <Badge className="gap-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 border-0 text-white shadow-sm">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Đã kết nối
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-700 border-orange-200">
                                                            <XCircle className="h-3 w-3" />
                                                            Chưa kết nối
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditZaloId(student)}
                                                            className="hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
                                                        >
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Sửa ID
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleSelectFromFollowers(student)}
                                                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                                                        >
                                                            <UserPlus className="h-3 w-3 mr-1" />
                                                            Chọn Follower
                                                        </Button>
                                                        {student.zaloUserId && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSendMessage(student)}
                                                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                                            >
                                                                <Send className="h-3 w-3 mr-1" />
                                                                Gửi tin
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Zalo ID Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật Zalo ID</DialogTitle>
                        <DialogDescription>
                            Cập nhật Zalo User ID cho {selectedStudent?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="zaloId">Zalo User ID:</Label>
                            <Input
                                id="zaloId"
                                placeholder="Ví dụ: 1234567890123456789"
                                value={newZaloId}
                                onChange={(e) => setNewZaloId(e.target.value)}
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                Để trống để xóa Zalo ID
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleSaveZaloId} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Lưu"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Message Dialog */}
            <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gửi tin nhắn Zalo</DialogTitle>
                        <DialogDescription>
                            Gửi tin nhắn đến {selectedStudent?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="message">Nội dung tin nhắn:</Label>
                            <textarea
                                id="message"
                                rows={5}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleSendZalo} disabled={isSending || !message.trim()}>
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Gửi tin nhắn
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Select Follower Dialog */}
            <SelectFollowerDialog
                open={selectFollowerDialogOpen}
                onOpenChange={setSelectFollowerDialogOpen}
                studentName={selectedStudent?.name || ""}
                onSelect={handleFollowerSelected}
            />
        </div>
    );
}
