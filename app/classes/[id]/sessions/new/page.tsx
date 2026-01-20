"use client";

import { useParams, useRouter } from "next/navigation";
import { ClassSessionForm } from "@/components/class-session-form";

export default function NewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const classId = parseInt(params.id as string);

  const handleSuccess = () => {
    router.push(`/classes/${classId}/sessions`);
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tạo Buổi Học Mới</h1>
        <p className="text-gray-600 mt-2">
          Thêm một buổi học mới cho lớp của bạn
        </p>
      </div>
      <ClassSessionForm classId={classId} onSuccess={handleSuccess} />
    </div>
  );
}
