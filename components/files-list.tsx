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
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (displayName) {
        formData.append("displayName", displayName);
      }

      const response = await fetch(`/api/classes/${classId}/files`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload file");
      }

      toast({
        title: "Thành công",
        description: "Đã tải lên tệp thành công",
      });

      setShowUploadDialog(false);
      setSelectedFile(null);
      setDisplayName("");
      fetchFiles();
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isTeacher && (
        <>
          <div className="flex justify-end">
            <Button
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:shadow-lg font-bold"
              onClick={() => setShowUploadDialog(true)}
            >
              <Upload className="h-4 w-4" />
              Tải Lên Tệp Mới
            </Button>
          </div>

          {showUploadDialog && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Tải lên tài liệu</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowUploadDialog(false)} className="h-8 w-8 rounded-full">
                    <Trash2 className="h-4 w-4 rotate-45" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Tên hiển thị (tùy chọn)
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Nhập tên tệp..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Chọn tệp
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-indigo-400 transition-all cursor-pointer relative group">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <div className="flex flex-col items-center">
                        <Upload className="h-10 w-10 text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                        <p className="text-sm text-gray-500 font-medium group-hover:text-indigo-600">
                          {selectedFile ? selectedFile.name : "Kéo thả hoặc click để chọn tệp"}
                        </p>
                        {selectedFile && <p className="text-xs text-green-600 mt-1 font-semibold">Đã chọn 1 tệp</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUploadDialog(false);
                        setSelectedFile(null);
                        setDisplayName("");
                      }}
                      disabled={isUploading}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6"
                    >
                      {isUploading ? "Đang xử lý..." : "Tải lên ngay"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {files.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-md rounded-2xl">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <File className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">Chưa có tài liệu nào</p>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Thư mục này hiện đang trống. Hãy tải lên các tài liệu học tập để chia sẻ với lớp học.</p>
          {isTeacher && (
            <Button
              onClick={() => setShowUploadDialog(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md hover:shadow-lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              Tải lên ngay
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block">
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="font-bold text-gray-600">Tên Tệp</TableHead>
                    <TableHead className="font-bold text-gray-600">Kích Thước</TableHead>
                    <TableHead className="font-bold text-gray-600">Ngày Tải Lên</TableHead>
                    <TableHead className="font-bold text-gray-600">Người Tải Lên</TableHead>
                    <TableHead className="text-right font-bold text-gray-600">Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <TableRow key={file.id} className="border-gray-50 hover:bg-indigo-50/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3 py-1">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                              <FileIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <span className="font-semibold text-gray-800">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 font-medium">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">{formatFileSize(file.size)}</span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {file.uploadedAt
                            ? new Date(file.uploadedAt).toLocaleDateString(
                              "vi-VN"
                            )
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-gray-700">
                          {file.uploadedBy || "Giáo viên"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <a href={file.url} download target="_blank">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
                                title="Tải xuống"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                            {isTeacher && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                onClick={() => handleDelete(file.id)}
                                title="Xóa"
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
                <Card key={file.id} className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-indigo-50 rounded-xl">
                        <FileIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{file.name}</h3>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>
                            {file.uploadedAt
                              ? new Date(file.uploadedAt).toLocaleDateString(
                                "vi-VN"
                              )
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <a href={file.url} download target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                      {isTeacher && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
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
