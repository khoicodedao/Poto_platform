"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface TokenInfo {
    hasToken: boolean;
    expiresAt: string | null;
    expiresInSeconds: number;
    expiresInMinutes: number;
    expiresInHours: number;
}

export function ZaloTokenMonitor() {
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTokenStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/zalo/token-status");
            const data = await response.json();

            if (data.success) {
                setTokenInfo(data.tokenInfo);
            }
        } catch (error) {
            console.error("Error fetching token status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshToken = async () => {
        try {
            setRefreshing(true);
            const response = await fetch("/api/zalo/token-status", {
                method: "POST",
            });
            const data = await response.json();

            if (data.success) {
                alert("✅ Token đã được refresh thành công! Kiểm tra console để lấy token mới.");
                await fetchTokenStatus();
            } else {
                alert("❌ Lỗi refresh token: " + data.error);
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
            alert("❌ Lỗi refresh token: " + error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTokenStatus();

        // Auto refresh status every 60 seconds
        const interval = setInterval(fetchTokenStatus, 60000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        if (!tokenInfo?.hasToken) return "destructive";
        if (tokenInfo.expiresInMinutes < 5) return "destructive";
        if (tokenInfo.expiresInMinutes < 60) return "warning";
        return "success";
    };

    const getStatusIcon = () => {
        if (!tokenInfo?.hasToken) return <AlertCircle className="h-5 w-5" />;
        if (tokenInfo.expiresInMinutes < 5) return <AlertCircle className="h-5 w-5" />;
        return <CheckCircle className="h-5 w-5" />;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Zalo Token Status
                </CardTitle>
                <CardDescription>
                    Theo dõi trạng thái access token và tự động refresh khi cần
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading && !tokenInfo ? (
                    <div className="text-center py-4">Loading...</div>
                ) : tokenInfo ? (
                    <>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getStatusIcon()}
                                <span className="font-medium">Token Status:</span>
                            </div>
                            <Badge variant={getStatusColor() as any}>
                                {tokenInfo.hasToken ? "Active" : "Not Set"}
                            </Badge>
                        </div>

                        {tokenInfo.hasToken && (
                            <>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Hết hạn lúc:</span>
                                        <span className="font-mono">
                                            {tokenInfo.expiresAt
                                                ? new Date(tokenInfo.expiresAt).toLocaleString("vi-VN")
                                                : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Còn lại:</span>
                                        <span className="font-medium">
                                            {tokenInfo.expiresInHours > 0
                                                ? `${tokenInfo.expiresInHours}h ${tokenInfo.expiresInMinutes % 60}m`
                                                : `${tokenInfo.expiresInMinutes}m`}
                                        </span>
                                    </div>
                                </div>

                                {tokenInfo.expiresInMinutes < 60 && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 text-sm">
                                        <p className="text-yellow-800 dark:text-yellow-200">
                                            ⚠️ Token sắp hết hạn. Hệ thống sẽ tự động refresh khi còn dưới 5 phút.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchTokenStatus}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                                Refresh Status
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleRefreshToken}
                                disabled={refreshing}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                                Force Refresh Token
                            </Button>
                        </div>

                        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                            <p className="font-semibold mb-1">💡 Lưu ý:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Token sẽ tự động refresh khi còn dưới 5 phút</li>
                                <li>Token mới sẽ được log ra console</li>
                                <li>Cần cập nhật .env.local để sử dụng sau khi restart server</li>
                            </ul>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        No token information available
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
