"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, Send } from "lucide-react";

type ClassOption = {
    id: number;
    name: string;
};

type SendZaloMessageDialogProps = {
    classes: ClassOption[];
    classId?: number; // Pre-select a class
    recipientId?: number; // For sending to individual user
    recipientName?: string;
};

export function SendZaloMessageDialog({
    classes,
    classId: initialClassId,
    recipientId,
    recipientName,
}: SendZaloMessageDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string>(
        initialClassId ? String(initialClassId) : ""
    );
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<string>("general");
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!title.trim() || !message.trim()) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng nhập tiêu đề và nội dung tin nhắn.",
                variant: "destructive",
            });
            return;
        }

        if (!recipientId && !selectedClass) {
            toast({
                title: "Chưa chọn người nhận",
                description: "Vui lòng chọn lớp học để gửi tin nhắn.",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            try {
                const response = await fetch("/api/zalo/send-message", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        recipientId,
                        classId: selectedClass ? parseInt(selectedClass) : undefined,
                        title: title.trim(),
                        message: message.trim(),
                        type: messageType,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    toast({
                        title: "Gửi tin nhắn thành công",
                        description: `Đã gửi thành công đến ${result.summary.success} người. ${result.summary.failed > 0
                                ? `Thất bại: ${result.summary.failed}`
                                : ""
                            }`,
                    });
                    setOpen(false);
                    setTitle("");
                    setMessage("");
                    setMessageType("general");
                } else {
                    toast({
                        title: "Không thể gửi tin nhắn",
                        description: result.error ?? "Vui lòng thử lại sau.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Lỗi",
                    description: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
                    variant: "destructive",
                });
            }
        });
    };

    const disabled = classes.length === 0 && !recipientId;
    const buttonText = recipientId
        ? `Gửi Zalo đến ${recipientName || "học viên"}`
        : "Gửi tin Zalo đến lớp";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button disabled={disabled} variant="default">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>📱 Gửi thông báo Zalo</DialogTitle>
                    <DialogDescription>
                        {recipientId
                            ? `Gửi tin nhắn Zalo đến ${recipientName || "học viên này"}`
                            : "Gửi tin nhắn Zalo đến tất cả học viên trong lớp"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!recipientId && (
                        <div className="space-y-2">
                            <Label>Lớp học</Label>
                            <Select
                                disabled={disabled || !!initialClassId}
                                value={selectedClass}
                                onValueChange={setSelectedClass}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn lớp học" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={String(cls.id)}>
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Loại thông báo</Label>
                        <Select value={messageType} onValueChange={setMessageType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">📢 Thông báo chung</SelectItem>
                                <SelectItem value="reminder">⏰ Nhắc nhở</SelectItem>
                                <SelectItem value="assignment">📝 Bài tập</SelectItem>
                                <SelectItem value="attendance">✅ Điểm danh</SelectItem>
                                <SelectItem value="report">📊 Báo cáo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề</Label>
                        <Input
                            id="title"
                            placeholder="Ví dụ: Thông báo buổi học ngày mai"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">
                            {title.length}/100 ký tự
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Nội dung</Label>
                        <Textarea
                            id="message"
                            placeholder="Nhập nội dung tin nhắn..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                            {message.length}/500 ký tự
                        </p>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                        <p className="font-medium">💡 Lưu ý:</p>
                        <ul className="mt-2 list-inside list-disc space-y-1">
                            <li>Chỉ gửi đến học viên đã kết nối tài khoản Zalo</li>
                            <li>Tin nhắn sẽ được gửi ngay lập tức</li>
                            <li>Học viên cần follow OA của công ty để nhận tin</li>
                        </ul>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Send className="mr-2 h-4 w-4 animate-pulse" />
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
                </form>
            </DialogContent>
        </Dialog>
    );
}
