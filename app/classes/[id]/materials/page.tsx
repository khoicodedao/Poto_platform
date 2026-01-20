"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    PlayCircle,
    FileText,
    Link as LinkIcon,
    FolderOpen,
    Plus,
    Upload,
    ChevronDown,
    ChevronRight,
    Edit,
    Trash2,
    Download,
    ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { CreateUnitDialog } from "@/components/learning-materials/create-unit-dialog";
import { UploadMaterialDialog } from "@/components/learning-materials/upload-material-dialog";
import { EditMaterialDialog } from "@/components/learning-materials/edit-material-dialog";
import { DeleteMaterialDialog } from "@/components/learning-materials/delete-material-dialog";
import { EditUnitDialog } from "@/components/learning-materials/edit-unit-dialog";
import { DeleteUnitDialog } from "@/components/learning-materials/delete-unit-dialog";
import { MaterialViewer } from "@/components/learning-materials/material-viewer";

type Material = {
    id: number;
    title: string;
    description: string | null;
    type: "video" | "document" | "link" | "other";
    fileUrl: string | null;
    fileSize: number | null;
    durationSeconds: number | null;
    orderIndex: number;
    uploadedBy: number | null;
    createdAt: string;
};

type Unit = {
    id: number;
    title: string;
    description: string | null;
    orderIndex: number;
    classId: number;
    materials: Material[];
};

export default function LearningMaterialsPage() {
    const params = useParams();
    const classId = parseInt(params.id as string);
    const { toast } = useToast();
    const [units, setUnits] = useState<Unit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null);
    const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null);

    // Check if user can edit (admin or teacher)
    const canEdit = currentUser?.role === "admin" || currentUser?.role === "teacher";

    useEffect(() => {
        fetchUnits();
        fetchCurrentUser();
    }, [classId]);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch("/api/session");
            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data.user);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    };

    const fetchUnits = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/classes/${classId}/units`);
            if (!response.ok) throw new Error("Failed to fetch units");
            const data = await response.json();
            setUnits(data.data || []);
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách units",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "video":
                return <PlayCircle className="w-5 h-5 text-red-500" />;
            case "document":
                return <FileText className="w-5 h-5 text-blue-500" />;
            case "link":
                return <LinkIcon className="w-5 h-5 text-green-500" />;
            default:
                return <FolderOpen className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTypeBadge = (type: string) => {
        const config = {
            video: { label: "Video", className: "bg-red-100 text-red-700" },
            document: { label: "Tài  liệu", className: "bg-blue-100 text-blue-700" },
            link: { label: "Liên kết", className: "bg-green-100 text-green-700" },
            other: { label: "Khác", className: "bg-gray-100 text-gray-700" },
        };
        const { label, className } = config[type as keyof typeof config] || config.other;
        return <Badge className={className}>{label}</Badge>;
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return "";
        const units = ["B", "KB", "MB", "GB"];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return "";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="mx-auto max-w-7xl px4 py-8 sm:px-6 lg:px-8 pt-4 space-y-6">
                {/* Header */}
                <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-2xl">
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                                <FolderOpen className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold">Tài Liệu Học Tập</h1>
                        </div>
                        <p className="text-white/90 max-w-3xl">
                            Video bài giảng, tài liệ và nguồn học tập được tổ chức theo từng unit
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href={`/classes/${classId}`}>
                                <Button variant="ghost" className="text-white hover:bg-white/20">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Quay lại lớp học
                                </Button>
                            </Link>
                            {canEdit && (
                                <CreateUnitDialog
                                    classId={classId}
                                    onSuccess={fetchUnits}
                                    triggerButton={
                                        <Button className="bg-white text-purple-700 hover:bg-white/90">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Thêm Unit
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Units List */}
                {isLoading ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-gray-500">Đang tải...</p>
                        </CardContent>
                    </Card>
                ) : units.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">
                                Chưa có unit nào. Tạo unit đầu tiên để bắt đầu!
                            </p>
                            <CreateUnitDialog
                                classId={classId}
                                onSuccess={fetchUnits}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <Accordion type="multiple" className="space-y-4">
                        {units.map((unit) => (
                            <AccordionItem
                                key={unit.id}
                                value={`unit-${unit.id}`}
                                className="border-2 rounded-xl bg-white shadow-sm"
                            >
                                <AccordionTrigger className="hover:no-underline px-6 py-4">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="flex-1 text-left">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {unit.title}
                                            </h3>
                                            {unit.description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {unit.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {unit.materials.length} tài liệu
                                            </Badge>
                                            {canEdit && (
                                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <EditUnitDialog
                                                        unit={unit}
                                                        onSuccess={fetchUnits}
                                                        triggerButton={
                                                            <Button size="sm" variant="ghost">
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        }
                                                    />
                                                    <DeleteUnitDialog
                                                        unitId={unit.id}
                                                        unitTitle={unit.title}
                                                        materialsCount={unit.materials.length}
                                                        onSuccess={fetchUnits}
                                                        triggerButton={
                                                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    {canEdit && (
                                        <div className="space-y-3 mb-4">
                                            <UploadMaterialDialog
                                                unitId={unit.id}
                                                onSuccess={fetchUnits}
                                                triggerButton={
                                                    <Button size="sm" className="w-full sm:w-auto">
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload Tài Liệu
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    )}

                                    {unit.materials.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-8">
                                            Chưa có tài liệu nào trong unit này
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {unit.materials.map((material) => (
                                                <Card
                                                    key={material.id}
                                                    className="hover:shadow-md transition-shadow"
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-3 rounded-lg bg-gray-50">
                                                                {getTypeIcon(material.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        {material.title}
                                                                    </h4>
                                                                    {getTypeBadge(material.type)}
                                                                </div>
                                                                {material.description && (
                                                                    <p className="text-sm text-gray-600 mb-2">
                                                                        {material.description}
                                                                    </p>
                                                                )}
                                                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                                                    {material.fileSize && (
                                                                        <span>{formatFileSize(material.fileSize)}</span>
                                                                    )}
                                                                    {material.durationSeconds && (
                                                                        <span>⏱️ {formatDuration(material.durationSeconds)}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {material.fileUrl && (
                                                                <div className="flex flex-col gap-2">
                                                                    {/* View/Play Button */}
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => setViewingMaterial(material)}
                                                                        className="w-full"
                                                                    >
                                                                        <PlayCircle className="w-4 h-4 mr-1" />
                                                                        Xem
                                                                    </Button>

                                                                    {/* Download Button */}
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        asChild
                                                                        className="w-full"
                                                                    >
                                                                        <a href={material.fileUrl} download>
                                                                            <Download className="w-4 h-4 mr-1" />
                                                                            Tải
                                                                        </a>
                                                                    </Button>

                                                                    {/* Edit Button */}
                                                                    {canEdit && (
                                                                        <EditMaterialDialog
                                                                            material={material}
                                                                            onSuccess={fetchUnits}
                                                                            triggerButton={
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="secondary"
                                                                                    className="w-full"
                                                                                >
                                                                                    <Edit className="w-4 h-4 mr-1" />
                                                                                    Sửa
                                                                                </Button>
                                                                            }
                                                                        />
                                                                    )}

                                                                    {/* Delete Button */}
                                                                    {canEdit && (
                                                                        <DeleteMaterialDialog
                                                                            materialId={material.id}
                                                                            materialTitle={material.title}
                                                                            onSuccess={fetchUnits}
                                                                            triggerButton={
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="destructive"
                                                                                    className="w-full"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                                                    Xóa
                                                                                </Button>
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}

                {/* Material Viewer Modal */}
                {viewingMaterial && viewingMaterial.fileUrl && (
                    <MaterialViewer
                        material={{
                            id: viewingMaterial.id,
                            title: viewingMaterial.title,
                            type: viewingMaterial.type,
                            fileUrl: viewingMaterial.fileUrl,
                            description: viewingMaterial.description,
                        }}
                        isOpen={!!viewingMaterial}
                        onClose={() => setViewingMaterial(null)}
                    />
                )}

                {/* TODO: Add Create Unit Dialog */}
                {/* TODO: Add Upload Material Dialog */}
            </main>
        </div>
    );
}
