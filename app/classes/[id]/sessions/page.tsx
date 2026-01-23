"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ClassSessionsPage } from "@/components/class-sessions-page";

export default function ClassSessionsListPage() {
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ClassSessionsPage classId={classId} className={className} />
    </div>
  );
}
