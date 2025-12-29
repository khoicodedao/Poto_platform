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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export function ZaloTestSendForm() {
    const [zaloUserId, setZaloUserId] = useState("");
    const [message, setMessage] = useState(
        "🧪 Test message từ Poto Platform!\n\nNếu bạn nhận được tin nhắn này, hệ thống Zalo đang hoạt động tốt! ✅"
    );
    const [isSending, setIsSending] = useState(false);
    const [result, setResult] = useState<any>(null);
    const { toast } = useToast();

    const handleSend = async () => {
        if (!zaloUserId.trim()) {
            toast({
                title: "Thiếu Zalo ID",
                description: "Vui lòng nhập Zalo User ID",
                variant: "destructive",
            });
            return;
        }

        setIsSending(true);
        setResult(null);

        try {
            const response = await fetch("/api/zalo/test-send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    zaloUserId: zaloUserId.trim(),
                    message: message.trim(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
                toast({
                    title: "✅ Gửi thành công!",
                    description: `Message ID: ${data.messageId}`,
                });
            } else {
                toast({
                    title: "❌ Gửi thất bại",
                    description: data.error,
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
            setIsSending(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    🧪 Test Gửi Tin Nhắn Zalo
                </CardTitle>
                <CardDescription>
                    Gửi tin nhắn test đến Zalo ID của bạn để kiểm tra kết nối
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Instructions */}
                <div className="rounded-lg bg-blue-50 p-4 text-sm">
                    <p className="font-medium text-blue-900">📋 Hướng dẫn:</p>
                    <ol className="mt-2 list-inside list-decimal space-y-1 text-blue-800">
                        <li>Follow OA "Công ty TNHH Poto English Hub" trên Zalo</li>
                        <li>Nhắn tin bất kỳ cho OA (ví dụ: "Hello")</li>
                        <li>Xem terminal/console logs để lấy Zalo User ID của bạn</li>
                        <li>Nhập ID vào form dưới đây và click "Gửi Test"</li>
                        <li>Kiểm tra Zalo xem có nhận được tin không</li>
                    </ol>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="zaloUserId">Zalo User ID của bạn:</Label>
                        <Input
                            id="zaloUserId"
                            placeholder="Ví dụ: 1234567890123456789"
                            value={zaloUserId}
                            onChange={(e) => setZaloUserId(e.target.value)}
                            disabled={isSending}
                            className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                            Lấy từ webhook logs hoặc Zalo Developer Console
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Nội dung tin nhắn:</Label>
                        <Textarea
                            id="message"
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isSending}
                        />
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={isSending || !zaloUserId.trim()}
                        className="w-full"
                        size="lg"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang gửi...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Gửi Test Message
                            </>
                        )}
                    </Button>
                </div>

                {/* Result */}
                {result && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <div className="flex-1 space-y-2">
                                <p className="font-medium text-green-900">
                                    ✅ Tin nhắn đã được gửi thành công!
                                </p>
                                <div className="space-y-1 text-sm text-green-800">
                                    <p>
                                        <strong>Message ID:</strong>{" "}
                                        <code className="rounded bg-green-100 px-1">
                                            {result.messageId}
                                        </code>
                                    </p>
                                    <p>
                                        <strong>Gửi đến:</strong>{" "}
                                        <code className="rounded bg-green-100 px-1">
                                            {result.sentTo}
                                        </code>
                                    </p>
                                    <p>
                                        <strong>Thời gian:</strong>{" "}
                                        {new Date(result.timestamp).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                                <p className="mt-2 text-xs text-green-700">
                                    💡 Kiểm tra Zalo trên điện thoại để xem tin nhắn
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tips */}
                <div className="rounded-lg bg-yellow-50 p-4 text-sm">
                    <p className="font-medium text-yellow-900">💡 Lưu ý:</p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-yellow-800">
                        <li>
                            <strong>7-day rule:</strong> FREE OA chỉ gửi được đến user tương
                            tác trong 7 ngày gần nhất
                        </li>
                        <li>Nếu chưa nhắn tin cho OA → Nhắn "Hello" trước khi test</li>
                        <li>Kiểm tra logs để xác nhận message được gửi</li>
                        <li>Nếu không nhận được → Check OA settings</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
