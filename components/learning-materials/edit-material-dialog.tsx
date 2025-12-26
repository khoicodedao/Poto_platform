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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Link as LinkIcon, FileUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Material {
    id: number;
    title: string;
    description: string | null;
    type: "video" | "document" | "link" | "other";
    fileUrl: string | null;
    fileSize: number | null;
    durationSeconds: number | null;
    orderIndex: number;
}

interface EditMaterialDialogProps {
    material: Material;
    onSuccess?: () => void;
    triggerButton?: React.ReactNode;
}

export function EditMaterialDialog({
    material,
    onSuccess,
    triggerButton,
}: EditMaterialDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        title: material.title,
        description: material.description || "",
        type: material.type,
        fileUrl: material.fileUrl || "",
        fileSize: material.fileSize || 0,
        uploadMethod: "url" as "url" | "file",
    });

    useEffect(() => {
        if (open) {
            setFormData({
                title: material.title,
                description: material.description || "",
                type: material.type,
                fileUrl: material.fileUrl || "",
                fileSize: material.fileSize || 0,
                uploadMethod: "url",
            });
        }
    }, [open, material]);

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(10);

        try {
            const fd = new FormData();
            fd.append("file", file);

            const uploadEndpoint =
                formData.type === "video"
                    ? "/api/upload/video"
                    : "/api/upload/document";

            setUploadProgress(30);

            const response = await fetch(uploadEndpoint, {
                method: "POST",
                body: fd,
            });

            setUploadProgress(70);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Upload failed");
            }

            const result = await response.json();

            setFormData(prev => ({
                ...prev,
                fileUrl: result.url,
                fileSize: result.size,
            }));

            setUploadProgress(100);

            toast({
                title: "Thành công",
                description: "File đã upload lên server",
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Lỗi upload",
                description: error.message || "Không thể upload file",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tên tài liệu",
                variant: "destructive",
            });
            return;
        }

        if (!formData.fileUrl.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập URL hoặc upload file",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/materials/${material.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    fileUrl: formData.fileUrl,
                    fileSize: formData.fileSize || undefined,
                }),
            });

            if (!response.ok) throw new Error("Failed to update material");

            toast({
                title: "Thành công",
                description: "Đã cập nhật tài liệu",
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
                description: "Không thể cập nhật tài liệu",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPlaceholder = () => {
        if (formData.uploadMethod === "file") return "Upload file từ máy tính";

        switch (formData.type) {
            case "video":
                return "https://youtube.com/watch?v=... hoặc URL video khác";
            case "document":
                return "https://drive.google.com/... hoặc URL file PDF/DOC";
            case "link":
                return "https://example.com/resource";
            default:
                return "Nhập URL tài liệu";
        }
    };

    const showFileUpload = formData.uploadMethod === "file" && (formData.type === "video" || formData.type === "document");
    const showUrlInput = formData.uploadMethod === "url" || formData.type === "link" || formData.type === "other";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Sửa
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Chỉnh Sửa Tài Liệu</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin tài liệu học tập
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Type Display (Read-only) */}
                        <div className="space-y-2">
                            <Label>Loại Tài Liệu</Label>
                            <Input value={formData.type} disabled />
                            <p className="text-xs text-gray-500">
                                Không thể thay đổi loại tài liệu
                            </p>
                        </div>

                        {/* Upload Method for Video/Document */}
                        {(formData.type === "video" || formData.type === "document") && (
                            <div className="space-y-2">
                                <Label>Phương Thức</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={formData.uploadMethod === "file" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, uploadMethod: "file" })}
                                        className="flex-1"
                                    >
                                        <FileUp className="w-4 h-4 mr-2" />
                                        Upload File Mới
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={formData.uploadMethod === "url" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, uploadMethod: "url" })}
                                        className="flex-1"
                                    >
                                        <LinkIcon className="w-4 h-4 mr-2" />
                                        Nhập URL
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Tên Tài Liệu <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="VD: Bài giảng phần 1 - Giới thiệu"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                required
                            />
                        </div>

                        {/* File Upload */}
                        {showFileUpload && (
                            <div className="space-y-2">
                                <Label htmlFor="file">
                                    {formData.type === "video" ? "Video File" : "Document File"}{" "}
                                </Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept={
                                        formData.type === "video"
                                            ? "video/mp4,video/webm,video/ogg,video/quicktime"
                                            : "application/pdf,.pdf,.ppt,.pptx,.doc,.docx"
                                    }
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file);
                                    }}
                                    disabled={isUploading}
                                    className="cursor-pointer"
                                />
                                {isUploading && (
                                    <div className="space-y-2">
                                        <Progress value={uploadProgress} />
                                        <p className="text-xs text-gray-500">Đang upload... {uploadProgress}%</p>
                                    </div>
                                )}
                                {formData.fileUrl && !isUploading && (
                                    <p className="text-xs text-green-600">✓ File đã cập nhật</p>
                                )}
                            </div>
                        )}

                        {/* URL Input */}
                        {showUrlInput && (
                            <div className="space-y-2">
                                <Label htmlFor="fileUrl">
                                    URL <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="fileUrl"
                                    type="url"
                                    placeholder={getPlaceholder()}
                                    value={formData.fileUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fileUrl: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Mô Tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Mô tả ngắn gọn về nội dung tài liệu..."
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
                            disabled={isSubmitting || isUploading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting || isUploading}>
                            {isSubmitting ? "Đang cập nhật..." : "Cập Nhật"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
