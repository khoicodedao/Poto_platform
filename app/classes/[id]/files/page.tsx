"use client";

import { useParams } from "next/navigation";
import { FilesList } from "@/components/files-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FolderOpen, FileText } from "lucide-react";
import { MeshGradientHeader } from "@/components/ui/mesh-gradient-header";

export default function ClassFilesPage() {
  const params = useParams();
  const classId = parseInt(params.id as string);

  return (
    <div className="container mx-auto p-6 pt-4 space-y-6 animate-in fade-in duration-500">
      {/* Gradient Header Banner */}
      <MeshGradientHeader>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm sm:text-4xl">
                Quản Lý Tài Liệu
              </h1>
            </div>
            <p className="text-blue-100 text-lg font-medium flex items-center gap-2 max-w-2xl">
              <FileText className="w-5 h-5 text-blue-200" />
              Kho lưu trữ tài liệu, bài giảng và tài nguyên tham khảo.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href={`/classes/${classId}`}>
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay Lại
              </Button>
            </Link>
          </div>
        </div>
      </MeshGradientHeader>

      <FilesList classId={classId} isTeacher={true} />
    </div>
  );
}
