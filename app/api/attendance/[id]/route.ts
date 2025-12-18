import { NextResponse } from "next/server";
import { updateCheckOutTime } from "@/lib/actions/class-sessions";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    if (!body.checkOutTime) {
      return NextResponse.json(
        { error: "checkOutTime is required" },
        { status: 400 }
      );
    }

    const result = await updateCheckOutTime(
      parseInt(params.id),
      new Date(body.checkOutTime)
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(`Error in PATCH /api/attendance/[id]:`, error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}
