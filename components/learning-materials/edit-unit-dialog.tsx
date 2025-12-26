"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Edit } from "lucide-react";

interface Unit {
    id: number;
    title: string;
    description: string | null;
    orderIndex: number;
    classId: number;
}

interface EditUnitDialogProps {
    unit: Unit;
    onSuccess?: () => void;
    triggerButton?: React.ReactNode;
}

export function EditUnitDialog({
    unit,
    onSuccess,
    triggerButton,
}: EditUnitDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: unit.title,
        description: unit.description || "",
    });

    useEffect(() => {
        if (open) {
            setFormData({
                title: unit.title,
                description: unit.description || "",
            });
        }
    }, [open, unit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tên unit",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/units/${unit.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description || null,
                }),
            });

            if (!response.ok) throw new Error("Failed to update unit");

            toast({
                title: "Thành công",
                description: "Đã cập nhật unit",
            });

            setOpen(false);

            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật unit",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Sửa Unit
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Chỉnh Sửa Unit</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin unit học tập
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Tên Unit <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="VD: Unit 1 - Giới thiệu"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Mô Tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Mô tả ngắn gọn về nội dung unit..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Đang cập nhật..." : "Cập Nhật"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
