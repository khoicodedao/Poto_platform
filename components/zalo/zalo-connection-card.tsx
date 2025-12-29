"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Link2, Unlink, Check, X, RefreshCw } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ZaloConnectionCard() {
    const [isConnected, setIsConnected] = useState(false);
    const [zaloUserId, setZaloUserId] = useState("");
    const [inputZaloId, setInputZaloId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    // Check connection status on mount
    useEffect(() => {
        checkConnectionStatus();
    }, []);

    const checkConnectionStatus = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/zalo/connect");
            const result = await response.json();

            if (result.success) {
                setIsConnected(result.connected);
                setZaloUserId(result.zaloUserId || "");
            }
        } catch (error) {
            console.error("Error checking Zalo status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = () => {
        if (!inputZaloId.trim()) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng nhập Zalo User ID của bạn.",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            try {
                const response = await fetch("/api/zalo/connect", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        zaloUserId: inputZaloId.trim(),
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    toast({
                        title: "Kết nối thành công",
                        description: "Bạn đã kết nối tài khoản Zalo thành công!",
                    });
                    setIsConnected(true);
                    setZaloUserId(inputZaloId.trim());
                    setInputZaloId("");
                } else {
                    toast({
                        title: "Không thể kết nối",
                        description: result.error ?? "Vui lòng thử lại sau.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Lỗi",
                    description: "Không thể kết nối đến máy chủ.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleDisconnect = () => {
        startTransition(async () => {
            try {
                const response = await fetch("/api/zalo/connect", {
                    method: "DELETE",
                });

                const result = await response.json();

                if (result.success) {
                    toast({
                        title: "Ngắt kết nối thành công",
                        description: "Bạn đã ngắt kết nối tài khoản Zalo.",
                    });
                    setIsConnected(false);
                    setZaloUserId("");
                } else {
                    toast({
                        title: "Không thể ngắt kết nối",
                        description: result.error ?? "Vui lòng thử lại sau.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Lỗi",
                    description: "Không thể kết nối đến máy chủ.",
                    variant: "destructive",
                });
            }
        });
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Đang tải...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {isConnected ? (
                        <>
                            <Check className="h-5 w-5 text-green-600" />
                            Đã kết nối Zalo
                        </>
                    ) : (
                        <>
                            <X className="h-5 w-5 text-gray-400" />
                            Chưa kết nối Zalo
                        </>
                    )}
                </CardTitle>
                <CardDescription>
                    {isConnected
                        ? "Bạn sẽ nhận thông báo qua Zalo OA của công ty"
                        : "Kết nối tài khoản Zalo để nhận thông báo nhanh chóng"}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isConnected ? (
                    <>
                        <div className="space-y-2">
                            <Label>Zalo User ID</Label>
                            <Input value={zaloUserId} disabled />
                        </div>

                        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                            <p className="font-medium">✅ Tài khoản đã kết nối</p>
                            <p className="mt-1">
                                Bạn sẽ nhận được các thông báo về buổi học, bài tập, và điểm số
                                qua Zalo.
                            </p>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full" disabled={isPending}>
                                    <Unlink className="mr-2 h-4 w-4" />
                                    Ngắt kết nối
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận ngắt kết nối</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bạn có chắc chắn muốn ngắt kết nối tài khoản Zalo? Bạn sẽ
                                        không nhận được thông báo qua Zalo nữa.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDisconnect}>
                                        Xác nhận
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                ) : (
                    <>
                        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                            <p className="font-medium">📱 Cách lấy Zalo User ID:</p>
                            <ol className="mt-2 list-inside list-decimal space-y-1">
                                <li>Follow OA của công ty trên Zalo</li>
                                <li>Nhắn tin "ID" cho OA</li>
                                <li>OA sẽ trả về Zalo User ID của bạn</li>
                                <li>Copy và dán ID vào ô bên dưới</li>
                            </ol>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="zaloId">Zalo User ID</Label>
                            <Input
                                id="zaloId"
                                placeholder="Nhập Zalo User ID của bạn"
                                value={inputZaloId}
                                onChange={(e) => setInputZaloId(e.target.value)}
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                ID có dạng số, ví dụ: 1234567890123456789
                            </p>
                        </div>

                        <Button
                            onClick={handleConnect}
                            className="w-full"
                            disabled={isPending || !inputZaloId.trim()}
                        >
                            {isPending ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Đang kết nối...
                                </>
                            ) : (
                                <>
                                    <Link2 className="mr-2 h-4 w-4" />
                                    Kết nối tài khoản Zalo
                                </>
                            )}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
