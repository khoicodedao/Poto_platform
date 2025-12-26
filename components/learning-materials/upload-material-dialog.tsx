"use client";

import { useState } from "react";
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
import { Upload, Link as LinkIcon, FileUp, Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UploadMaterialDialogProps {
    unitId: number;
    onSuccess?: () => void;
    triggerButton?: React.ReactNode;
}

export function UploadMaterialDialog({
    unitId,
    onSuccess,
    triggerButton,
}: UploadMaterialDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "video" as "video" | "document" | "link" | "other",
        fileUrl: "",
        fileSize: 0,
        uploadMethod: "url" as "url" | "file",
    });

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
            const response = await fetch(`/api/units/${unitId}/materials`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    type: formData.type,
                    fileUrl: formData.fileUrl,
                    fileSize: formData.fileSize || undefined,
                }),
            });

            if (!response.ok) throw new Error("Failed to create material");

            toast({
                title: "Thành công",
                description: "Đã thêm tài liệu mới",
            });

            setFormData({
                title: "",
                description: "",
                type: "video",
                fileUrl: "",
                fileSize: 0,
                uploadMethod: "url",
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
                description: "Không thể thêm tài liệu",
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
                    <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Tài Liệu
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Thêm Tài Liệu Học Tập</DialogTitle>
                        <DialogDescription>
                            Upload video/tài liệu hoặc thêm link tài nguyên học tập
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Type Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="type">
                                Loại Tài Liệu <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, type: value, fileUrl: "", uploadMethod: value === "link" ? "url" : formData.uploadMethod })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">📹 Video Bài Giảng</SelectItem>
                                    <SelectItem value="document">📄 Tài Liệu (PDF/PPT/DOC)</SelectItem>
                                    <SelectItem value="link">🔗 Liên Kết</SelectItem>
                                    <SelectItem value="other">📁 Khác</SelectItem>
                                </SelectContent>
                            </Select>
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
                                        onClick={() => setFormData({ ...formData, uploadMethod: "file", fileUrl: "" })}
                                        className="flex-1"
                                    >
                                        <FileUp className="w-4 h-4 mr-2" />
                                        Upload File
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={formData.uploadMethod === "url" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, uploadMethod: "url", fileUrl: "" })}
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
                                    <span className="text-red-500">*</span>
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
                                    <p className="text-xs text-green-600">✓ File đã upload thành công</p>
                                )}
                                <p className="text-xs text-gray-500">
                                    {formData.type === "video"
                                        ? "Max 500MB. Hỗ trợ: MP4, WebM, OGG, MOV"
                                        : "Max 100MB. Hỗ trợ: PDF, PPT, PPTX, DOC, DOCX"}
                                </p>
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
                                <p className="text-xs text-gray-500">
                                    {formData.type === "video" && "Hỗ trợ: YouTube, Vimeo, hoặc link video trực tiếp"}
                                    {formData.type === "document" && "Hỗ trợ: Google Drive, Dropbox, hoặc link trực tiếp"}
                                    {formData.type === "link" && "Liên kết tới trang web hoặc tài nguyên học tập"}
                                </p>
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
                            {isSubmitting ? "Đang thêm..." : "Thêm Tài Liệu"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
