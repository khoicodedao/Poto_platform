"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { StudentsList } from "@/components/students-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users, GraduationCap } from "lucide-react";
import { MeshGradientHeader } from "@/components/ui/mesh-gradient-header";
import { ClassBreadcrumb } from "@/components/class-breadcrumb";

export default function ClassStudentsPage() {
  const params = useParams();
  const classId = parseInt(params.id as string);
  const [className, setClassName] = useState<string>("");

  useEffect(() => {
    fetch(`/api/classes/${classId}`)
      .then(res => res.json())
      .then(data => setClassName(data.name || `Lớp ${classId}`))
      .catch(() => setClassName(`Lớp ${classId}`));
  }, [classId]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumb Navigation */}
      <ClassBreadcrumb
        classId={classId}
        className={className || `Lớp ${classId}`}
        currentPage="Học viên"
      />

      {/* Gradient Header Banner */}
      <MeshGradientHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Quản Lý Học Sinh
              </h1>
            </div>
            <p className="text-white/90 text-lg font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Danh sách và thông tin học sinh trong lớp
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
      </MeshGradientHeader>

      <StudentsList classId={classId} />
    </div>
  );
}
