import { NextResponse } from "next/server";
import { getClassDetail } from "@/lib/actions/classes";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classId = Number.parseInt(params.id);
    const detail = await getClassDetail(classId);
    if (!detail) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ students: detail.students || [] });
  } catch (error) {
    console.error("Error in GET /api/classes/[id]/students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
