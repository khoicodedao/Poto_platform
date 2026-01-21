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
    <div className="container mx-auto p-6 pt-4 space-y-6 animate-in fade-in duration-500">
      {/* Gradient Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 lg:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm sm:text-4xl">
                {isTeacher ? "Quản Lý Bài Tập" : "Bài Tập Lớp Học"}
              </h1>
            </div>
            <p className="text-blue-100 text-lg font-medium flex items-center gap-2 max-w-2xl">
              <FileText className="w-5 h-5 text-blue-200" />
              {isTeacher
                ? "Tạo, giao bài và chấm điểm bài tập cho học viên."
                : "Theo dõi và hoàn thành các bài tập được giao."}
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
