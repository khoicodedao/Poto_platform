"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Download } from "lucide-react";

interface MaterialViewerProps {
    material: {
        id: number;
        title: string;
        type: string;
        fileUrl: string;
        description?: string | null;
    };
    isOpen: boolean;
    onClose: () => void;
}

export function MaterialViewer({ material, isOpen, onClose }: MaterialViewerProps) {
    const renderContent = () => {
        const url = material.fileUrl;

        // Video player (for uploaded videos)
        if (material.type === "video" && url.startsWith("/uploads/videos/")) {
            return (
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                        controls
                        className="w-full h-full"
                        preload="metadata"
                        controlsList="nodownload"
                    >
                        <source src={url} type="video/mp4" />
                        <source src={url} type="video/webm" />
                        <source src={url} type="video/ogg" />
                        Trình duyệt của bạn không hỗ trợ video tag.
                    </video>
                </div>
            );
        }

        // YouTube embed
        if (material.type === "video" && url.includes("youtube.com")) {
            const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
            return (
                <div className="w-full aspect-video">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }

        // Vimeo embed
        if (material.type === "video" && url.includes("vimeo.com")) {
            const videoId = url.split("/").pop();
            return (
                <div className="w-full aspect-video">
                    <iframe
                        src={`https://player.vimeo.com/video/${videoId}`}
                        className="w-full h-full rounded-lg"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }

        // PDF viewer (for uploaded PDFs)
        if (material.type === "document" && url.endsWith(".pdf")) {
            return (
                <div className="w-full h-[600px] border rounded-lg overflow-hidden">
                    <iframe
                        src={`${url}#toolbar=0`}
                        className="w-full h-full"
                        title={material.title}
                    />
                </div>
            );
        }

        // PowerPoint viewer (using Office Online)
        if (
            material.type === "document" &&
            (url.endsWith(".ppt") || url.endsWith(".pptx"))
        ) {
            // For uploaded files, provide download link
            if (url.startsWith("/uploads/")) {
                return (
                    <div className="text-center p-12 space-y-4">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold">PowerPoint Presentation</h3>
                        <p className="text-gray-600">
                            {material.description || "Click để tải xuống file PowerPoint"}
                        </p>
                        <Button asChild>
                            <a href={url} download>
                                <Download className="w-4 h-4 mr-2" />
                                Tải Xuống Presentation
                            </a>
                        </Button>
                    </div>
                );
            }

            // For external URLs, try Office Online viewer
            return (
                <div className="w-full h-[600px] border rounded-lg overflow-hidden">
                    <iframe
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                        className="w-full h-full"
                        title={material.title}
                    />
                </div>
            );
        }

        // Word document viewer
        if (
            material.type === "document" &&
            (url.endsWith(".doc") || url.endsWith(".docx"))
        ) {
            if (url.startsWith("/uploads/")) {
                return (
                    <div className="text-center p-12 space-y-4">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-lg font-semibold">Word Document</h3>
                        <p className="text-gray-600">
                            {material.description || "Click để tải xuống file Word"}
                        </p>
                        <Button asChild>
                            <a href={url} download>
                                <Download className="w-4 h-4 mr-2" />
                                Tải Xuống Document
                            </a>
                        </Button>
                    </div>
                );
            }

            return (
                <div className="w-full h-[600px] border rounded-lg overflow-hidden">
                    <iframe
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                        className="w-full h-full"
                        title={material.title}
                    />
                </div>
            );
        }

        // Link type - show iframe or link
        if (material.type === "link") {
            return (
                <div className="w-full h-[600px] border rounded-lg overflow-hidden">
                    <iframe
                        src={url}
                        className="w-full h-full"
                        title={material.title}
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                </div>
            );
        }

        // Fallback - show download link
        return (
            <div className="text-center p-12 space-y-4">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-semibold">{material.title}</h3>
                <p className="text-gray-600">
                    {material.description || "Tài liệu học tập"}
                </p>
                <div className="flex gap-2 justify-center">
                    <Button asChild variant="outline">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Mở trong tab mới
                        </a>
                    </Button>
                    <Button asChild>
                        <a href={url} download>
                            <Download className="w-4 h-4 mr-2" />
                            Tải Xuống
                        </a>
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle className="text-xl">{material.title}</DialogTitle>
                            {material.description && (
                                <p className="text-sm text-gray-600 mt-2">
                                    {material.description}
                                </p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="mt-4">{renderContent()}</div>

                <div className="flex gap-2 mt-4">
                    <Button asChild variant="outline" className="flex-1">
                        <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Mở trong tab mới
                        </a>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                        <a href={material.fileUrl} download>
                            <Download className="w-4 h-4 mr-2" />
                            Tải xuống
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
