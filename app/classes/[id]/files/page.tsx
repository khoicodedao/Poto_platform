"use client";

import { useParams } from "next/navigation";
import { FilesList } from "@/components/files-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ClassFilesPage() {
  const params = useParams();
  const classId = parseInt(params.id as string);

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản Lý Tài Liệu</h1>
        <Link href={`/classes/${classId}`}>
          <Button variant="outline">Quay Lại</Button>
        </Link>
      </div>

      <FilesList classId={classId} isTeacher={true} />
    </div>
  );
}
