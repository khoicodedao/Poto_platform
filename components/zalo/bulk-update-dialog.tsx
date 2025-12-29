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
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle } from "lucide-react";

export function BulkUpdateZaloIdsDialog() {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        setFile(selectedFile || null);
        setResult(null);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!file) {
            toast({
                title: "Chưa chọn file",
                description: "Vui lòng chọn file Excel.",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/zalo/bulk-update-ids", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    setResult(data);
                    toast({
                        title: "Cập nhật thành công",
                        description: `Đã cập nhật ${data.summary.success}/${data.summary.total} học viên`,
                    });
                } else {
                    toast({
                        title: "Lỗi",
                        description: data.error || "Không thể cập nhật",
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

    const downloadTemplate = () => {
        const template = `email,zaloUserId
student1@example.com,1234567890
student2@example.com,0987654321`;

        const blob = new Blob([template], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "zalo-bulk-update-template.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        toast({
            title: "Template downloaded",
            description: "Đã tải template CSV. Điền thông tin và upload lại.",
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Bulk Update Zalo IDs
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>📥 Cập nhật hàng loạt Zalo IDs</DialogTitle>
                    <DialogDescription>
                        Upload file Excel/CSV để cập nhật Zalo User ID cho nhiều học viên cùng lúc
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Template download */}
                    <div className="rounded-lg bg-blue-50 p-4">
                        <p className="text-sm font-medium text-blue-900">
                            📋 Chưa có file? Tải template mẫu:
                        </p>
                        <Button
                            type="button"
                            variant="link"
                            onClick={downloadTemplate}
                            className="h-auto p-0 text-blue-700"
                        >
                            Download CSV Template
                        </Button>
                    </div>

                    {/* File upload */}
                    <div className="space-y-2">
                        <Label htmlFor="file">Chọn file Excel/CSV</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            disabled={isPending}
                        />
                        {file && (
                            <p className="text-sm text-muted-foreground">
                                Đã chọn: {file.name}
                            </p>
                        )}
                    </div>

                    {/* Format instructions */}
                    <div className="rounded-lg border p-4 text-sm">
                        <p className="font-medium">Format file:</p>
                        <pre className="mt-2 rounded bg-gray-100 p-2">
                            email,zaloUserId{"\n"}
                            student@example.com,1234567890
                        </pre>
                        <p className="mt-2 text-muted-foreground">
                            Lưu ý: Email phải trùng với email trong database
                        </p>
                    </div>

                    {/* Result summary */}
                    {result && (
                        <div className="space-y-2 rounded-lg border p-4">
                            <h3 className="font-medium">Kết quả:</h3>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="rounded bg-green-50 p-2 text-center">
                                    <div className="text-2xl font-bold text-green-700">
                                        {result.summary.success}
                                    </div>
                                    <div className="text-green-600">Thành công</div>
                                </div>
                                <div className="rounded bg-red-50 p-2 text-center">
                                    <div className="text-2xl font-bold text-red-700">
                                        {result.summary.failed}
                                    </div>
                                    <div className="text-red-600">Thất bại</div>
                                </div>
                                <div className="rounded bg-gray-50 p-2 text-center">
                                    <div className="text-2xl font-bold text-gray-700">
                                        {result.summary.skipped}
                                    </div>
                                    <div className="text-gray-600">Bỏ qua</div>
                                </div>
                            </div>

                            {/* Detail list */}
                            {result.details && result.details.length > 0 && (
                                <div className="max-h-48 space-y-1 overflow-y-auto">
                                    {result.details.slice(0, 10).map((detail: any, i: number) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 text-xs"
                                        >
                                            {detail.status === "success" ? (
                                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                            ) : (
                                                <XCircle className="h-3 w-3 text-red-600" />
                                            )}
                                            <span>{detail.email}</span>
                                            <span className="text-muted-foreground">
                                                - {detail.reason || detail.zaloUserId}
                                            </span>
                                        </div>
                                    ))}
                                    {result.details.length > 10 && (
                                        <p className="text-muted-foreground">
                                            ... và {result.details.length - 10} khác
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                                setFile(null);
                                setResult(null);
                            }}
                            disabled={isPending}
                        >
                            {result ? "Đóng" : "Hủy"}
                        </Button>
                        {!result && (
                            <Button type="submit" disabled={isPending || !file}>
                                {isPending ? (
                                    <>
                                        <Upload className="mr-2 h-4 w-4 animate-pulse" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload & Cập nhật
                                    </>
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
