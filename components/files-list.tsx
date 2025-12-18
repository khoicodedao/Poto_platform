"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, File, FileText, Image, Trash2, Upload } from "lucide-react";
import Link from "next/link";

interface ClassFile {
  id: number;
  name: string;
  url: string;
  type: string;
  size?: number;
  uploadedAt?: string;
  uploadedBy?: string;
}

interface FilesListProps {
  classId: number;
  isTeacher?: boolean;
}

export function FilesList({ classId, isTeacher = false }: FilesListProps) {
  const [files, setFiles] = useState<ClassFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, [classId]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/files?classId=${classId}`);
      if (!response.ok) throw new Error("Failed to fetch files");
      const result = await response.json();
      const filesData = result.data || result.files || result;
      setFiles(Array.isArray(filesData) ? filesData : []);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch files",
        variant: "destructive",
      });
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (type: string | undefined) => {
    if (!type) return File;
    if (type.startsWith("image")) return Image;
    if (type.includes("pdf") || type.includes("word") || type.includes("sheet"))
      return FileText;
    return File;
  };

  const handleDelete = async (fileId: number) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete file");

      setFiles(files.filter((f) => f.id !== fileId));
      toast({
        title: "Success",
        description: "Đã xóa tệp thành công",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      {isTeacher && (
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Tải Lên Tệp Mới
        </Button>
      )}

      {files.length === 0 ? (
        <Card className="p-8 text-center">
          <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Chưa có tệp nào trong lớp</p>
          {isTeacher && <Button>Tải Lên Tệp Đầu Tiên</Button>}
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên Tệp</TableHead>
                    <TableHead>Kích Thước</TableHead>
                    <TableHead>Ngày Tải Lên</TableHead>
                    <TableHead>Người Tải Lên</TableHead>
                    <TableHead className="text-right">Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatFileSize(file.size)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {file.uploadedAt
                            ? new Date(file.uploadedAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {file.uploadedBy || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <a href={file.url} download target="_blank">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                            {isTeacher && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(file.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="md:hidden space-y-3">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <Card key={file.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <FileIcon className="h-6 w-6 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{file.name}</h3>
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                          <div>Kích thước: {formatFileSize(file.size)}</div>
                          <div>
                            Tải lên:{" "}
                            {file.uploadedAt
                              ? new Date(file.uploadedAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={file.url} download target="_blank">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                      {isTeacher && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
