"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Send } from "lucide-react";

export function SmartZaloSendDemo() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Single mode state
    const [singleUserId, setSingleUserId] = useState("");
    const [singleText, setSingleText] = useState("📢 Xin chào! Đây là tin nhắn test từ hệ thống.");

    // Batch mode state
    const [batchUserIds, setBatchUserIds] = useState("");
    const [batchText, setBatchText] = useState("📢 Thông báo: Buổi học sẽ bắt đầu sau 1 giờ nữa.");

    // Common
    const [attachmentId, setAttachmentId] = useState("");

    const handleSingleSend = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch("/api/zalo/smart-send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: "single",
                    userId: singleUserId,
                    textContent: singleText,
                    promotionAttachmentId: attachmentId || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send message");
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBatchSend = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const userIds = batchUserIds
                .split("\n")
                .map((id) => id.trim())
                .filter(Boolean);

            if (userIds.length === 0) {
                throw new Error("Please enter at least one user ID");
            }

            const response = await fetch("/api/zalo/smart-send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: "batch",
                    userIds: userIds,
                    textContent: batchText,
                    promotionAttachmentId: attachmentId || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send messages");
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Smart Zalo Message Sending 🚀</h1>
                <p className="text-muted-foreground">
                    Gửi tin nhắn thông minh với auto-fallback: Consultation → Promotion
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>How it works</CardTitle>
                    <CardDescription>
                        Hệ thống tự động thử gửi tin dạng <Badge variant="secondary">Consultation (FREE)</Badge> trước.
                        Nếu lỗi 48h (-213/-201), tự động chuyển sang <Badge variant="destructive">Promotion (Trừ quota)</Badge>
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Attachment ID (Optional)</CardTitle>
                    <CardDescription>
                        Cần thiết cho Promotion fallback. Tạo article/banner trên Zalo OA Console
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="attachmentId">Promotion Attachment ID</Label>
                        <Input
                            id="attachmentId"
                            placeholder="e.g., abc123xyz456"
                            value={attachmentId}
                            onChange={(e) => setAttachmentId(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            💡 Tip: Xem workflow <code>/zalo-oa-integration</code> để biết cách lấy Attachment ID
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">Single Mode</TabsTrigger>
                    <TabsTrigger value="batch">Batch Mode</TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gửi tin cho 1 người</CardTitle>
                            <CardDescription>Test với user ID cụ thể</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="singleUserId">Zalo User ID</Label>
                                <Input
                                    id="singleUserId"
                                    placeholder="e.g., 1234567890123456789"
                                    value={singleUserId}
                                    onChange={(e) => setSingleUserId(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="singleText">Message Content</Label>
                                <Textarea
                                    id="singleText"
                                    placeholder="Enter your message..."
                                    value={singleText}
                                    onChange={(e) => setSingleText(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <Button
                                onClick={handleSingleSend}
                                disabled={loading || !singleUserId || !singleText}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Message
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="batch" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gửi tin hàng loạt</CardTitle>
                            <CardDescription>Gửi cho nhiều user cùng lúc</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="batchUserIds">Zalo User IDs (one per line)</Label>
                                <Textarea
                                    id="batchUserIds"
                                    placeholder="1234567890123456789&#10;9876543210987654321&#10;..."
                                    value={batchUserIds}
                                    onChange={(e) => setBatchUserIds(e.target.value)}
                                    rows={6}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Mỗi User ID một dòng. Hệ thống sẽ tự động delay 100ms giữa các request.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="batchText">Message Content</Label>
                                <Textarea
                                    id="batchText"
                                    placeholder="Enter your message..."
                                    value={batchText}
                                    onChange={(e) => setBatchText(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <Button
                                onClick={handleBatchSend}
                                disabled={loading || !batchUserIds || !batchText}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send to All
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Results */}
            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Result
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                            {JSON.stringify(result, null, 2)}
                        </pre>

                        {result.summary && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{result.summary.success}</div>
                                    <div className="text-xs text-muted-foreground">Success</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{result.summary.failed}</div>
                                    <div className="text-xs text-muted-foreground">Failed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{result.summary.consultationCount}</div>
                                    <div className="text-xs text-muted-foreground">Consultation (FREE)</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{result.summary.promotionCount}</div>
                                    <div className="text-xs text-muted-foreground">Promotion (Paid)</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-500">{result.summary.quotaUsed}</div>
                                    <div className="text-xs text-muted-foreground">Quota Used</div>
                                </div>
                            </div>
                        )}

                        {result.result && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant={result.result.messageType === "consultation" ? "secondary" : "destructive"}>
                                        {result.result.messageType}
                                    </Badge>
                                    {result.result.usedQuota && (
                                        <Badge variant="outline" className="text-red-500">Quota Used</Badge>
                                    )}
                                </div>
                                <p className="text-sm">
                                    <strong>Message ID:</strong> {result.result.messageId}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="text-blue-900 dark:text-blue-100">💡 Pro Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Luôn cung cấp Attachment ID để tránh lỗi khi fallback</li>
                        <li>Monitor quota usage để quản lý budget hiệu quả</li>
                        <li>Sử dụng Batch mode cho hiệu quả cao (built-in rate limiting)</li>
                        <li>Check logs để xem tỷ lệ Consultation vs Promotion</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
