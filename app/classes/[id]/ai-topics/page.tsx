"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Sparkles, MessageSquare, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { ClassBreadcrumb } from "@/components/class-breadcrumb";
import { MeshGradientHeader } from "@/components/ui/mesh-gradient-header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Topic {
    id: number;
    title: string;
    description: string;
    systemPrompt: string;
    isActive: boolean;
    createdAt: string;
}

export default function AITopicsPage() {
    const params = useParams();
    const classId = params.id as string;
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [className, setClassName] = useState<string>("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        systemPrompt: "",
        isActive: true,
    });

    useEffect(() => {
        fetchTopics();
        fetch(`/api/classes/${classId}`)
            .then(res => res.json())
            .then(data => setClassName(data.name || `Lớp ${classId}`))
            .catch(() => setClassName(`Lớp ${classId}`));
    }, [classId]);

    const fetchTopics = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/ai-chat/topics?classId=${classId}`);
            const data = await response.json();
            setTopics(data.topics || []);
        } catch (error) {
            console.error("Failed to fetch topics:", error);
            toast.error("Không thể tải danh sách chủ đề");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = "/api/ai-chat/topics";
            const method = editingTopic ? "PUT" : "POST";
            const body = editingTopic
                ? { id: editingTopic.id, ...formData }
                : { classId, ...formData };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error("Failed to save topic");

            toast.success(
                editingTopic ? "Cập nhật chủ đề thành công!" : "Tạo chủ đề mới thành công!"
            );

            setIsDialogOpen(false);
            resetForm();
            fetchTopics();
        } catch (error) {
            console.error("Failed to save topic:", error);
            toast.error("Có lỗi xảy ra khi lưu chủ đề");
        }
    };

    const handleEdit = (topic: Topic) => {
        setEditingTopic(topic);
        setFormData({
            title: topic.title,
            description: topic.description,
            systemPrompt: topic.systemPrompt,
            isActive: topic.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa chủ đề này?")) return;

        try {
            const response = await fetch(`/api/ai-chat/topics?id=${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete topic");

            toast.success("Xóa chủ đề thành công!");
            fetchTopics();
        } catch (error) {
            console.error("Failed to delete topic:", error);
            toast.error("Có lỗi xảy ra khi xóa chủ đề");
        }
    };

    const toggleActive = async (topic: Topic) => {
        try {
            const response = await fetch("/api/ai-chat/topics", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: topic.id,
                    isActive: !topic.isActive,
                    title: topic.title,
                    description: topic.description,
                    systemPrompt: topic.systemPrompt,
                }),
            });

            if (!response.ok) throw new Error("Failed to update topic");

            toast.success(
                topic.isActive ? "Đã ẩn chủ đề" : "Đã kích hoạt chủ đề"
            );
            fetchTopics();
        } catch (error) {
            console.error("Failed to toggle topic:", error);
            toast.error("Có lỗi xảy ra");
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            systemPrompt: "",
            isActive: true,
        });
        setEditingTopic(null);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumb Navigation */}
            <ClassBreadcrumb
                classId={parseInt(classId)}
                className={className || `Lớp ${classId}`}
                currentPage="AI Learning Topics"
            />

            {/* Header */}
            <MeshGradientHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                                AI Learning Topics
                            </h1>
                        </div>
                        <p className="text-white/90 text-lg">
                            Tạo và quản lý các chủ đề để học sinh trao đổi với AI
                        </p>
                    </div>
                    <Link href={`/classes/${classId}`}>
                        <Button
                            variant="ghost"
                            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm transition-all duration-200"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Quay Lại
                        </Button>
                    </Link>
                </div>
            </MeshGradientHeader>

            {/* Content */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">Danh sách chủ đề</h2>
                        <p className="text-gray-600 text-sm">
                            Học sinh có thể chat với AI về các chủ đề bạn tạo
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
                                <Plus className="h-5 w-5 mr-2" />
                                Tạo chủ đề mới
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    {editingTopic ? "Chỉnh sửa chủ đề" : "Tạo chủ đề mới"}
                                </DialogTitle>
                                <DialogDescription>
                                    Tạo một chủ đề để học sinh có thể trao đổi với AI trợ lý
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Tiêu đề chủ đề *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        placeholder="VD: Luyện tập từ vựng tiếng Anh"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        placeholder="Mô tả ngắn về chủ đề này..."
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="systemPrompt">
                                        Hướng dẫn cho AI (System Prompt) *
                                    </Label>
                                    <Textarea
                                        id="systemPrompt"
                                        value={formData.systemPrompt}
                                        onChange={(e) =>
                                            setFormData({ ...formData, systemPrompt: e.target.value })
                                        }
                                        placeholder="VD: Bạn là một giáo viên tiếng Anh. Hãy giúp học sinh luyện tập từ vựng bằng cách đưa ra các từ mới, giải thích nghĩa, và tạo ví dụ. Hãy kiên nhẫn và khuyến khích học sinh."
                                        rows={6}
                                        required
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Hướng dẫn này sẽ định hình cách AI trả lời học sinh
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isActive: checked })
                                        }
                                    />
                                    <Label htmlFor="isActive">Kích hoạt chủ đề</Label>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsDialogOpen(false);
                                            resetForm();
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    >
                                        {editingTopic ? "Cập nhật" : "Tạo chủ đề"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Topics Grid */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : topics.length === 0 ? (
                    <Card className="border-dashed border-2 border-purple-200">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <MessageSquare className="h-16 w-16 text-purple-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Chưa có chủ đề nào
                            </h3>
                            <p className="text-gray-500 text-center mb-6">
                                Tạo chủ đề đầu tiên để học sinh có thể trao đổi với AI
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topics.map((topic) => (
                            <Card
                                key={topic.id}
                                className={`group hover:shadow-xl transition-all duration-300 border-2 ${topic.isActive
                                    ? "border-purple-200 hover:border-purple-400"
                                    : "border-gray-200 bg-gray-50"
                                    }`}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Sparkles
                                                    className={`h-5 w-5 ${topic.isActive ? "text-purple-600" : "text-gray-400"
                                                        }`}
                                                />
                                                {topic.title}
                                            </CardTitle>
                                            <CardDescription className="mt-2">
                                                {topic.description || "Không có mô tả"}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toggleActive(topic)}
                                            className="ml-2"
                                        >
                                            {topic.isActive ? (
                                                <Eye className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-purple-50 rounded-lg p-3 mb-4">
                                        <p className="text-xs font-semibold text-purple-700 mb-1">
                                            System Prompt:
                                        </p>
                                        <p className="text-xs text-gray-600 line-clamp-3 font-mono">
                                            {topic.systemPrompt}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handleEdit(topic)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Sửa
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(topic.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Xóa
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
