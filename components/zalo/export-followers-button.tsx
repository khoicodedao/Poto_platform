"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type ClassOption = {
    id: number;
    name: string;
};

type ExportFollowersButtonProps = {
    classes: ClassOption[];
    defaultClassId?: number;
    showClassSelector?: boolean;
};

export function ExportFollowersButton({
    classes,
    defaultClassId,
    showClassSelector = true,
}: ExportFollowersButtonProps) {
    const [selectedClass, setSelectedClass] = useState<string>(
        defaultClassId ? String(defaultClassId) : ""
    );
    const [isExporting, setIsExporting] = useState(false);
    const [exportAll, setExportAll] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        if (!exportAll && !selectedClass) {
            toast({
                title: "Chưa chọn lớp",
                description: "Vui lòng chọn lớp hoặc export tất cả.",
                variant: "destructive",
            });
            return;
        }

        setIsExporting(true);
        try {
            const url = exportAll
                ? `/api/zalo/export-followers?all=true`
                : `/api/zalo/export-followers?classId=${selectedClass}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Export failed");
            }

            // Download file
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `zalo-students-${exportAll ? "all" : `class-${selectedClass}`}-${Date.now()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            toast({
                title: "Export thành công",
                description: "File Excel đã được tải xuống.",
            });
        } catch (error) {
            toast({
                title: "Lỗi export",
                description: "Không thể export file. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {showClassSelector && (
                <div className="flex gap-2">
                    <Select
                        value={exportAll ? "all" : selectedClass}
                        onValueChange={(value) => {
                            if (value === "all") {
                                setExportAll(true);
                                setSelectedClass("");
                            } else {
                                setExportAll(false);
                                setSelectedClass(value);
                            }
                        }}
                        disabled={isExporting}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Chọn lớp hoặc tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">📊 Tất cả các lớp</SelectItem>
                            {classes.map((cls) => (
                                <SelectItem key={cls.id} value={String(cls.id)}>
                                    {cls.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <Button
                onClick={handleExport}
                disabled={isExporting || (!exportAll && !selectedClass)}
                className="w-full"
            >
                {isExporting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xuất file...
                    </>
                ) : (
                    <>
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel
                    </>
                )}
            </Button>

            <div className="text-xs text-muted-foreground">
                <p className="font-medium">File Excel sẽ bao gồm:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                    <li>Tên, Email học viên</li>
                    <li>Lớp học</li>
                    <li>Zalo User ID</li>
                    <li>Trạng thái kết nối & follow</li>
                </ul>
            </div>
        </div>
    );
}
