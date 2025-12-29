"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { TestTube, Check, X, Loader2 } from "lucide-react";

export function ZaloTestConnection() {
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
        data?: any;
    } | null>(null);
    const { toast } = useToast();

    const handleTest = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const response = await fetch("/api/zalo/test");
            const result = await response.json();

            setTestResult({
                success: result.success,
                message: result.message || result.error || "Unknown error",
                data: result.data,
            });

            if (result.success) {
                toast({
                    title: "✅ Kết nối thành công",
                    description: "Zalo OA đã sẵn sàng để gửi tin nhắn.",
                });
            } else {
                toast({
                    title: "❌ Kết nối thất bại",
                    description: result.message || result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            setTestResult({
                success: false,
                message: "Không thể kết nối đến máy chủ",
            });
            toast({
                title: "Lỗi",
                description: "Không thể test kết nối Zalo OA.",
                variant: "destructive",
            });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Test Zalo OA Connection
                </CardTitle>
                <CardDescription>
                    Kiểm tra kết nối đến Zalo Official Account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleTest} disabled={isTesting} className="w-full">
                    {isTesting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang test...
                        </>
                    ) : (
                        <>
                            <TestTube className="mr-2 h-4 w-4" />
                            Test Connection
                        </>
                    )}
                </Button>

                {testResult && (
                    <div
                        className={`rounded-lg p-4 ${testResult.success
                                ? "bg-green-50 text-green-800"
                                : "bg-red-50 text-red-800"
                            }`}
                    >
                        <div className="flex items-start gap-2">
                            {testResult.success ? (
                                <Check className="h-5 w-5 flex-shrink-0" />
                            ) : (
                                <X className="h-5 w-5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <p className="font-medium">{testResult.message}</p>
                                {testResult.data && (
                                    <pre className="mt-2 overflow-x-auto text-xs">
                                        {JSON.stringify(testResult.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                    <p className="font-medium">💡 Thông tin cần thiết:</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>ZALO_OA_ID</li>
                        <li>ZALO_APP_ID</li>
                        <li>ZALO_APP_SECRET</li>
                        <li>ZALO_ACCESS_TOKEN</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
