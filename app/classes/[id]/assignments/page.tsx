"use client";

import { useParams } from "next/navigation";
import { AssignmentScheduleForm } from "@/components/assignment-schedule-form";
import { AssignmentList } from "@/components/assignment-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ClassAssignmentsPage() {
  const params = useParams();
  const classId = parseInt(params.id as string);

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản Lý Bài Tập</h1>
        <Link href={`/classes/${classId}`}>
          <Button variant="outline">Quay Lại</Button>
        </Link>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Danh Sách Bài Tập</TabsTrigger>
          <TabsTrigger value="create">Tạo Bài Tập Mới</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <AssignmentList classId={classId} isTeacher={true} />
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <AssignmentScheduleForm classId={classId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
