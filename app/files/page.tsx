import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import Link from "next/link"
import { getFiles, getFilesByCategory, incrementDownload } from "@/lib/actions/files"

export default async function FilesPage() {
  const [allFiles, lectureFiles, videoFiles, audioFiles] = await Promise.all([
    getFiles(),
    getFilesByCategory("lecture"),
    getFilesByCategory("video"),
    getFilesByCategory("audio"),
  ])

  const assignmentFiles = allFiles.filter((f) => f.category === "assignment")

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "doc":
        return <FileText className="h-8 w-8 text-red-500" />
      case "video":
        return <Video className="h-8 w-8 text-purple-500" />
      case "audio":
        return <Music className="h-8 w-8 text-green-500" />
      case "presentation":
        return <FileText className="h-8 w-8 text-orange-500" />
      case "archive":
        return <Archive className="h-8 w-8 text-blue-500" />
      case "image":
        return <ImageIcon className="h-8 w-8 text-pink-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const getCategoryBadge = (category: string) => {
    const variants = {
      lecture: { variant: "default" as const, label: "Bài giảng" },
      assignment: { variant: "secondary" as const, label: "Bài tập" },
      video: { variant: "outline" as const, label: "Video" },
      audio: { variant: "outline" as const, label: "Audio" },
      reference: { variant: "secondary" as const, label: "Tài liệu tham khảo" },
      resource: { variant: "outline" as const, label: "Tài nguyên" },
    }

    const config = variants[category as keyof typeof variants] || variants.reference
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDownload = async (fileId: number) => {
    await incrementDownload(fileId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">EduPlatform</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Tải lên
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tài liệu học tập</h2>
          <p className="text-gray-600">Quản lý và truy cập tài liệu từ các lớp học</p>
        </div>

        {/* Search and Filter */}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng tài liệu</p>
                  <p className="text-2xl font-bold text-gray-900">{allFiles.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {allFiles.reduce((sum, file) => sum + file.downloads, 0)}
                  </p>
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
                    {formatFileSize(allFiles.reduce((sum, file) => sum + file.file_size, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Files Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Tất cả ({allFiles.length})</TabsTrigger>
            <TabsTrigger value="lectures">Bài giảng ({lectureFiles.length})</TabsTrigger>
            <TabsTrigger value="assignments">Bài tập ({assignmentFiles.length})</TabsTrigger>
            <TabsTrigger value="videos">Video ({videoFiles.length})</TabsTrigger>
            <TabsTrigger value="audio">Audio ({audioFiles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">{file.original_name}</CardTitle>
                          <CardDescription className="text-xs">
                            {file.class_title} • {file.uploader_name}
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
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>{new Date(file.created_at).toLocaleDateString("vi-VN")}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        {getCategoryBadge(file.category)}
                        <span className="text-xs text-gray-500">{file.downloads} lượt tải</span>
                      </div>

                      <div className="flex space-x-2">
                        <form action={handleDownload.bind(null, file.id)} className="flex-1">
                          <Button size="sm" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Tải về
                          </Button>
                        </form>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lectures" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectureFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">{file.original_name}</CardTitle>
                          <CardDescription className="text-xs">
                            {file.class_title} • {file.uploader_name}
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
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>{new Date(file.created_at).toLocaleDateString("vi-VN")}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        {getCategoryBadge(file.category)}
                        <span className="text-xs text-gray-500">{file.downloads} lượt tải</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Tải về
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignmentFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">{file.original_name}</CardTitle>
                          <CardDescription className="text-xs">
                            {file.class_title} • {file.uploader_name}
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
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>{new Date(file.created_at).toLocaleDateString("vi-VN")}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        {getCategoryBadge(file.category)}
                        <span className="text-xs text-gray-500">{file.downloads} lượt tải</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Tải về
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">{file.original_name}</CardTitle>
                          <CardDescription className="text-xs">
                            {file.class_title} • {file.uploader_name}
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
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>{new Date(file.created_at).toLocaleDateString("vi-VN")}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        {getCategoryBadge(file.category)}
                        <span className="text-xs text-gray-500">{file.downloads} lượt tải</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Tải về
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {audioFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">{file.original_name}</CardTitle>
                          <CardDescription className="text-xs">
                            {file.class_title} • {file.uploader_name}
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
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>{new Date(file.created_at).toLocaleDateString("vi-VN")}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        {getCategoryBadge(file.category)}
                        <span className="text-xs text-gray-500">{file.downloads} lượt tải</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Tải về
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
