"use client";

import { useParams } from "next/navigation";
import { ClassSessionsPage } from "@/components/class-sessions-page";

export default function ClassSessionsListPage() {
  const params = useParams();
  const classId = parseInt(params.id as string);

  // TODO: Fetch actual class name from API
  const className = "Lớp Tiếng Anh A1";

  return (
    <div className="container mx-auto px-4 py-8 pt-4">
      <ClassSessionsPage classId={classId} className={className} />
    </div>
  );
}
