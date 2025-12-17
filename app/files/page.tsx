import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Folder,
  File,
  ImageIcon,
  Video,
  Music,
  Archive,
  MoreVertical,
  Share2,
  Eye,
} from "lucide-react";
import { getFiles, type FileWithMeta } from "@/lib/actions/files";
import { getCurrentUser } from "@/lib/auth";
import { getClasses, getClassesForUser } from "@/lib/actions/classes";
import { UploadFileDialog } from "@/components/files/upload-dialog";
import { DownloadButton } from "@/components/files/download-button";

const getFileIcon = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes("video")) return <Video className="h-8 w-8 text-purple-500" />;
  if (normalized.includes("audio")) return <Music className="h-8 w-8 text-green-500" />;
  if (normalized.includes("image")) return <ImageIcon className="h-8 w-8 text-pink-500" />;
  if (normalized.includes("zip") || normalized.includes("rar")) {
    return <Archive className="h-8 w-8 text-blue-500" />;
  }
  if (normalized.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
  if (normalized.includes("msword") || normalized.includes("word")) {
    return <FileText className="h-8 w-8 text-orange-500" />;
  }
  return <File className="h-8 w-8 text-gray-500" />;
};

const getCategoryBadge = (category: FileWithMeta["category"]) => {
  const meta = {
    lecture: { variant: "default" as const, label: "Bài giảng" },
    assignment: { variant: "secondary" as const, label: "Bài tập" },
    video: { variant: "outline" as const, label: "Video" },
    audio: { variant: "outline" as const, label: "Audio" },
    reference: { variant: "secondary" as const, label: "Tài liệu tham khảo" },
    resource: { variant: "outline" as const, label: "Tài nguyên" },
  };

  const config = meta[category] ?? meta.reference;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const formatFileSize = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

const formatDate = (value?: Date | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN");
};

const FilesGrid = ({ files }: { files: FileWithMeta[] }) => {
  if (files.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Chưa có tài liệu nào trong danh mục này.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file) => (
        <Card key={file.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {file.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {file.classTitle ?? "Tài liệu chung"} •{" "}
                    {file.uploaderName ?? "Ẩn danh"}
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{formatFileSize(file.size)}</span>
                <span>{formatDate(file.uploadedAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                {getCategoryBadge(file.category)}
                <span className="text-xs text-gray-500">
                  {file.downloads} lượt tải
                </span>
              </div>

              <div className="flex space-x-2">
                <DownloadButton fileId={file.id} fileUrl={file.url} size="sm" className="flex-1">
                  Tải về
                </DownloadButton>
                <Button asChild variant="outline" size="sm">
                  <Link href={file.url} target="_blank">
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default async function FilesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  const files = await getFiles();
  const lectureFiles = files.filter((f) => f.category === "lecture");
  const videoFiles = files.filter((f) => f.category === "video");
  const audioFiles = files.filter((f) => f.category === "audio");
  const assignmentFiles = files.filter((f) => f.category === "assignment");
  const totalDownloads = files.reduce((sum, file) => sum + (file.downloads ?? 0), 0);
  const totalSize = files.reduce((sum, file) => sum + (file.size ?? 0), 0);

  const canUpload = user.role === "teacher" || user.role === "admin";
  const managedClasses = canUpload
    ? user.role === "teacher"
      ? await getClassesForUser(user.id, "teacher")
      : await getClasses()
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tài liệu học tập</h2>
          <p className="text-gray-600">Quản lý và truy cập tài liệu từ các lớp học</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Tìm kiếm tài liệu..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng tài liệu</p>
                  <p className="text-2xl font-bold text-gray-900">{files.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Lượt tải</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDownloads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Video</p>
                  <p className="text-2xl font-bold text-gray-900">{videoFiles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Folder className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Dung lượng</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatFileSize(totalSize)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Tất cả ({files.length})</TabsTrigger>
            <TabsTrigger value="lectures">Bài giảng ({lectureFiles.length})</TabsTrigger>
            <TabsTrigger value="assignments">
              Bài tập ({assignmentFiles.length})
            </TabsTrigger>
            <TabsTrigger value="videos">Video ({videoFiles.length})</TabsTrigger>
            <TabsTrigger value="audio">Audio ({audioFiles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <FilesGrid files={files} />
          </TabsContent>

          <TabsContent value="lectures" className="space-y-4">
            <FilesGrid files={lectureFiles} />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <FilesGrid files={assignmentFiles} />
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <FilesGrid files={videoFiles} />
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <FilesGrid files={audioFiles} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
