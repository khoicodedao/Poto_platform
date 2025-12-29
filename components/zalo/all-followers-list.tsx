"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
    Users,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
    Link2,
    UserPlus,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function AllFollowersList() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any | null>(null);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [selectedFollower, setSelectedFollower] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [isLinking, setIsLinking] = useState(false);
    const { toast } = useToast();

    const loadFollowers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/zalo/all-followers");
            const result = await response.json();

            if (result.success) {
                setData(result);
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFollowers();
    }, []);

    const handleLinkFollower = (zaloUserId: string) => {
        setSelectedFollower(zaloUserId);
        setSelectedUserId("");
        setLinkDialogOpen(true);
    };

    const confirmLink = async () => {
        if (!selectedUserId || !selectedFollower) return;

        setIsLinking(true);
        try {
            const response = await fetch("/api/zalo/all-followers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: parseInt(selectedUserId),
                    zaloUserId: selectedFollower,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Liên kết thành công",
                    description: `Đã liên kết với ${result.user.name}`,
                });
                setLinkDialogOpen(false);
                loadFollowers(); // Reload data
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể liên kết.",
                variant: "destructive",
            });
        } finally {
            setIsLinking(false);
        }
    };

    if (isLoading && !data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Đang tải danh sách followers...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    const unlinkedFollowers = data?.followers?.filter((f: any) => !f.isLinked) || [];
    const linkedFollowers = data?.followers?.filter((f: any) => f.isLinked) || [];

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Tất cả Followers Zalo OA
                            </CardTitle>
                            <CardDescription>
                                Danh sách TẤT CẢ người đã follow Official Account
                            </CardDescription>
                        </div>
                        <Button
                            onClick={loadFollowers}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                            />
                            Làm mới
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Summary */}
                    {data && (
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                            <div className="rounded-lg bg-purple-50 p-3">
                                <div className="text-2xl font-bold text-purple-700">
                                    {data.summary.totalFollowers}
                                </div>
                                <div className="text-xs text-purple-600">Tổng followers</div>
                            </div>

                            <div className="rounded-lg bg-green-50 p-3">
                                <div className="text-2xl font-bold text-green-700">
                                    {data.summary.linked}
                                </div>
                                <div className="text-xs text-green-600">Đã liên kết</div>
                            </div>

                            <div className="rounded-lg bg-orange-50 p-3">
                                <div className="text-2xl font-bold text-orange-700">
                                    {data.summary.unlinked}
                                </div>
                                <div className="text-xs text-orange-600">Chưa liên kết</div>
                            </div>

                            <div className="rounded-lg bg-blue-50 p-3">
                                <div className="text-2xl font-bold text-blue-700">
                                    {data.summary.totalUsersInDB}
                                </div>
                                <div className="text-xs text-blue-600">Users trong DB</div>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-3">
                                <div className="text-2xl font-bold text-gray-700">
                                    {data.summary.usersWithoutZaloId}
                                </div>
                                <div className="text-xs text-gray-600">Chưa có Zalo</div>
                            </div>
                        </div>
                    )}

                    {/* Unlinked Followers - Cần action */}
                    {unlinkedFollowers.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-medium text-orange-900">
                                ⚠️ Followers chưa liên kết ({unlinkedFollowers.length})
                            </h3>
                            <div className="rounded-lg border">
                                <div className="max-h-64 overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Zalo User ID</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead className="text-right">Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {unlinkedFollowers.map((follower: any, i: number) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-mono text-sm">
                                                        {follower.zaloUserId}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            Chưa liên kết
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleLinkFollower(follower.zaloUserId)}
                                                        >
                                                            <Link2 className="mr-1 h-3 w-3" />
                                                            Liên kết
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Linked Followers */}
                    {linkedFollowers.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-medium text-green-900">
                                ✓ Followers đã liên kết ({linkedFollowers.length})
                            </h3>
                            <div className="rounded-lg border">
                                <div className="max-h-96 overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Zalo User ID</TableHead>
                                                <TableHead>Tên</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Vai trò</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {linkedFollowers.map((follower: any, i: number) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-mono text-xs">
                                                        {follower.zaloUserId.substring(0, 15)}...
                                                    </TableCell>
                                                    <TableCell>{follower.linkedAccount.name}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {follower.linkedAccount.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {follower.linkedAccount.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            <span className="text-xs">Linked</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {data && data.followers.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground">
                            <Users className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            <p>Chưa có followers nào</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Link Dialog */}
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>🔗 Liên kết Follower với Tài khoản</DialogTitle>
                        <DialogDescription>
                            Chọn tài khoản trong hệ thống để liên kết với Zalo follower
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">Zalo User ID:</p>
                            <p className="font-mono text-sm text-muted-foreground">
                                {selectedFollower}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Chọn tài khoản để liên kết:
                            </label>
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn user..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {data?.unlinkedUsers?.map((user: any) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name} ({user.email}) - {user.role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Chỉ hiển thị users chưa có Zalo ID
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setLinkDialogOpen(false)}
                            disabled={isLinking}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={confirmLink}
                            disabled={!selectedUserId || isLinking}
                        >
                            {isLinking ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang liên kết...
                                </>
                            ) : (
                                <>
                                    <Link2 className="mr-2 h-4 w-4" />
                                    Xác nhận liên kết
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
