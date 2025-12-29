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
    UserCheck,
    UserX,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Account = {
    id: number;
    name: string;
    email: string;
    role: string;
    zaloUserId: string;
    isActive: boolean;
    isFollowing: boolean;
    registeredAt: string;
    status: string;
};

export function RegisteredAccountsList() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any | null>(null);
    const { toast } = useToast();

    const loadAccounts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/zalo/registered-accounts");
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
        loadAccounts();
    }, []);

    const getRoleBadge = (role: string) => {
        const roleMap: Record<string, { label: string; variant: any }> = {
            student: { label: "Học viên", variant: "default" },
            teacher: { label: "Giáo viên", variant: "secondary" },
            teaching_assistant: { label: "Trợ giảng", variant: "outline" },
            admin: { label: "Admin", variant: "destructive" },
        };

        const config = roleMap[role] || { label: role, variant: "default" };
        return (
            <Badge variant={config.variant} className="text-xs">
                {config.label}
            </Badge>
        );
    };

    const getStatusBadge = (account: Account) => {
        if (account.isFollowing) {
            return (
                <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs">Đang follow</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-1 text-orange-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs">Chưa follow</span>
                </div>
            );
        }
    };

    if (isLoading && !data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Đang tải...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Danh sách Tài khoản đã Đăng ký OA
                        </CardTitle>
                        <CardDescription>
                            Các tài khoản đã kết nối Zalo ID trong hệ thống
                        </CardDescription>
                    </div>
                    <Button
                        onClick={loadAccounts}
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
                {/* Summary Statistics */}
                {data && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-lg bg-blue-50 p-3">
                            <div className="text-2xl font-bold text-blue-700">
                                {data.summary.total.registered}
                            </div>
                            <div className="text-xs text-blue-600">Đã đăng ký</div>
                        </div>

                        <div className="rounded-lg bg-green-50 p-3">
                            <div className="text-2xl font-bold text-green-700">
                                {data.summary.total.matched}
                            </div>
                            <div className="text-xs text-green-600">Đang follow OA</div>
                        </div>

                        <div className="rounded-lg bg-orange-50 p-3">
                            <div className="text-2xl font-bold text-orange-700">
                                {data.summary.total.unmatched.registeredButNotFollowing}
                            </div>
                            <div className="text-xs text-orange-600">Chưa follow</div>
                        </div>

                        <div className="rounded-lg bg-purple-50 p-3">
                            <div className="text-2xl font-bold text-purple-700">
                                {data.summary.total.following}
                            </div>
                            <div className="text-xs text-purple-600">Tổng followers OA</div>
                        </div>
                    </div>
                )}

                {/* Role breakdown */}
                {data && (
                    <div className="rounded-lg border p-3">
                        <h4 className="mb-2 text-sm font-medium">Phân loại theo vai trò:</h4>
                        <div className="flex flex-wrap gap-3 text-sm">
                            <div>
                                <span className="text-muted-foreground">Học viên:</span>{" "}
                                <strong>{data.summary.byRole.students}</strong>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Giáo viên:</span>{" "}
                                <strong>{data.summary.byRole.teachers}</strong>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Trợ giảng:</span>{" "}
                                <strong>{data.summary.byRole.teachingAssistants}</strong>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Admin:</span>{" "}
                                <strong>{data.summary.byRole.admins}</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* Accounts Table */}
                {data && data.accounts.registered.length > 0 && (
                    <div className="rounded-lg border">
                        <div className="max-h-[500px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Vai trò</TableHead>
                                        <TableHead>Zalo User ID</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="w-[100px]">Follow</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.accounts.registered.map((account: Account) => (
                                        <TableRow key={account.id}>
                                            <TableCell className="font-medium">
                                                {account.name}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {account.email}
                                            </TableCell>
                                            <TableCell>{getRoleBadge(account.role)}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {account.zaloUserId.substring(0, 15)}...
                                            </TableCell>
                                            <TableCell>
                                                {account.isActive ? (
                                                    <Badge variant="outline" className="text-xs">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(account)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Unregistered Followers */}
                {data && data.accounts.unregisteredFollowers.length > 0 && (
                    <div className="rounded-lg bg-yellow-50 p-4">
                        <h4 className="mb-2 flex items-center gap-2 font-medium text-yellow-900">
                            <UserX className="h-4 w-4" />
                            Followers chưa đăng ký trong hệ thống (
                            {data.accounts.unregisteredFollowers.length})
                        </h4>
                        <p className="text-sm text-yellow-800">
                            Có {data.accounts.unregisteredFollowers.length} tài khoản đã follow OA
                            nhưng chưa kết nối Zalo ID trong hệ thống.
                        </p>
                        <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                            {data.accounts.unregisteredFollowers.slice(0, 5).map((follower: any, i: number) => (
                                <div
                                    key={i}
                                    className="text-xs font-mono text-yellow-700"
                                >
                                    Zalo ID: {follower.zaloUserId}
                                </div>
                            ))}
                            {data.accounts.unregisteredFollowers.length > 5 && (
                                <p className="text-xs text-yellow-600">
                                    ... và {data.accounts.unregisteredFollowers.length - 5} khác
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {data && data.accounts.registered.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                        <UserX className="mx-auto h-12 w-12 mb-2 opacity-50" />
                        <p>Chưa có tài khoản nào đăng ký Zalo</p>
                    </div>
                )}

                {/* Instructions */}
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                    <p className="font-medium">💡 Giải thích:</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>
                            <strong>Đã đăng ký:</strong> Đã nhập Zalo ID trong hệ thống
                        </li>
                        <li>
                            <strong>Đang follow OA:</strong> Đã follow Zalo OA của công ty
                        </li>
                        <li>
                            <strong>Chưa follow:</strong> Đã có ID nhưng chưa follow OA
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
