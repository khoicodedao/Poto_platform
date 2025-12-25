"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AssignmentScheduleForm } from "@/components/assignment-schedule-form";
import { AssignmentList } from "@/components/assignment-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, Plus } from "lucide-react";

export default function ClassAssignmentsPage() {
  const params = useParams();
  const classId = parseInt(params.id as string);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user?.role || null);
      }
    } catch (e) {
      console.error("Failed to fetch user role:", e);
    }
  };

  const isTeacher = userRole && userRole !== "student";

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
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                {isTeacher ? "Quản Lý Bài Tập" : "Bài Tập"}
              </h1>
            </div>
            <p className="text-white/90 text-lg font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {isTeacher ? "Tạo và quản lý bài tập cho lớp học" : "Danh sách bài tập của lớp học"}
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

      {isTeacher ? (
        // Teacher view - full management
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Danh Sách Bài Tập
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tạo Bài Tập Mới
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <AssignmentList classId={classId} isTeacher={true} />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <AssignmentScheduleForm classId={classId} />
          </TabsContent>
        </Tabs>
      ) : (
        // Student view - only see list
        <div className="mt-6">
          <AssignmentList classId={classId} isTeacher={false} />
        </div>
      )}
    </div>
  );
}
