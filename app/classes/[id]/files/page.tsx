"use client";

import { useParams } from "next/navigation";
import { FilesList } from "@/components/files-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FolderOpen, FileText } from "lucide-react";

export default function ClassFilesPage() {
  const params = useParams();
  const classId = parseInt(params.id as string);

  return (
    <div className="container mx-auto p-6 pt-24 space-y-6 animate-in fade-in duration-500">
      {/* Gradient Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

        <div className="relative flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Quản Lý Tài Liệu
              </h1>
            </div>
            <p className="text-white/90 text-lg font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Tài liệu học tập và tài nguyên cho lớp học
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/classes/${classId}`}>
              <Button
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay Lại
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <FilesList classId={classId} isTeacher={true} />
    </div>
  );
}
