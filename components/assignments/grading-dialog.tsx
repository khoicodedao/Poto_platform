"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PenTool } from "lucide-react";

interface GradingDialogProps {
    submissionId: number;
    studentName: string;
    initialScore?: number | null;
    initialFeedback?: string | null;
}

export function GradingDialog({
    submissionId,
    studentName,
    initialScore,
    initialFeedback,
}: GradingDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(initialScore?.toString() ?? "");
    const [feedback, setFeedback] = useState(initialFeedback ?? "");
    const { toast } = useToast();
    const router = useRouter();

    const handleGrade = async () => {
        if (!score) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập điểm số",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/assignments/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submissionId,
                    score: Number(score),
                    feedback,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to grade");
            }

            toast({
                title: "Thành công",
                description: "Đã chấm điểm bài nộp",
            });
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error instanceof Error ? error.message : "Có lỗi xảy ra",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <PenTool className="h-4 w-4" />
                    {initialScore !== null && initialScore !== undefined
                        ? "Sửa điểm"
                        : "Chấm điểm"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chấm điểm bài nộp</DialogTitle>
                    <DialogDescription>
                        Học viên: <span className="font-semibold">{studentName}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="score">Điểm số (0-100)</Label>
                        <Input
                            id="score"
                            type="number"
                            min="0"
                            max="100"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            placeholder="Nhập điểm..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="feedback">Nhận xét (tùy chọn)</Label>
                        <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Nhập lời nhận xét, góp ý..."
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleGrade} disabled={loading}>
                        {loading ? "Đang lưu..." : "Lưu kết quả"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
