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
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 lg:p-10 shadow-xl">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>

                    <div className="relative flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                                    <FolderOpen className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white drop-shadow-sm sm:text-4xl">
                                    Tài Liệu Học Tập
                                </h1>
                            </div>
                            <p className="text-blue-100 text-lg font-medium flex items-center gap-2 max-w-2xl">
                                <FileText className="w-5 h-5 text-blue-200" />
                                Kho tài liệu, bài giảng và video tham khảo cho lớp học.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <Link href={`/classes/${classId}`}>
                                <Button
                                    variant="outline"
                                    className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay Lại
                                </Button>
                            </Link>

                            {canEdit && (
                                <CreateUnitDialog
                                    classId={classId}
                                    onSuccess={fetchUnits}
                                    triggerButton={
                                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 font-bold shadow-lg hover:shadow-xl transition-all">
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
                        {units.map((unit, index) => (
                            <AccordionItem
                                key={unit.id}
                                value={`unit-${unit.id}`}
                                className="border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden"
                            >
                                <AccordionTrigger className="hover:no-underline px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold text-lg">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {unit.title}
                                            </h3>
                                            {unit.description && (
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                                    {unit.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                                                {unit.materials.length} tài liệu
                                            </Badge>
                                            {canEdit && (
                                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <EditUnitDialog
                                                        unit={unit}
                                                        onSuccess={fetchUnits}
                                                        triggerButton={
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
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
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 py-6 bg-gray-50/50 border-t border-gray-100">
                                    {canEdit && (
                                        <div className="mb-6">
                                            <UploadMaterialDialog
                                                unitId={unit.id}
                                                onSuccess={fetchUnits}
                                                triggerButton={
                                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload Tài Liệu Mới
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    )}

                                    {unit.materials.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white">
                                            <FolderOpen className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-gray-500 font-medium">Chưa có tài liệu nào</p>
                                            <p className="text-sm text-gray-400 mt-1">Tài liệu tải lên sẽ xuất hiện ở đây</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {unit.materials.map((material) => (
                                                <Card
                                                    key={material.id}
                                                    className="group border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                                                >
                                                    <CardContent className="p-5">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-indigo-50 transition-colors">
                                                                {getTypeIcon(material.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <h4 className="font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                                        {material.title}
                                                                    </h4>
                                                                </div>
                                                                {material.description && (
                                                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                                                        {material.description}
                                                                    </p>
                                                                )}
                                                                <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-400 mb-4">
                                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                                        {material.type.toUpperCase()}
                                                                    </span>
                                                                    {material.fileSize && (
                                                                        <span>{formatFileSize(material.fileSize)}</span>
                                                                    )}
                                                                    {material.durationSeconds && (
                                                                        <span className="flex items-center gap-1">
                                                                            <PlayCircle className="w-3 h-3" />
                                                                            {formatDuration(material.durationSeconds)}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                                                    {material.fileUrl && (
                                                                        <>
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => setViewingMaterial(material)}
                                                                                className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-0 font-semibold"
                                                                            >
                                                                                Xem
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                asChild
                                                                                className="px-3 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                                                            >
                                                                                <a href={material.fileUrl} download>
                                                                                    <Download className="w-4 h-4" />
                                                                                </a>
                                                                            </Button>
                                                                        </>
                                                                    )}

                                                                    {canEdit && (
                                                                        <div className="flex items-center border-l border-gray-200 pl-2 ml-1 gap-1">
                                                                            <EditMaterialDialog
                                                                                material={material}
                                                                                onSuccess={fetchUnits}
                                                                                triggerButton={
                                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                                                                                        <Edit className="w-3.5 h-3.5" />
                                                                                    </Button>
                                                                                }
                                                                            />
                                                                            <DeleteMaterialDialog
                                                                                materialId={material.id}
                                                                                materialTitle={material.title}
                                                                                onSuccess={fetchUnits}
                                                                                triggerButton={
                                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600">
                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                    </Button>
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
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
