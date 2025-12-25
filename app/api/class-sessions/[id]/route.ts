import { NextResponse } from "next/server";
import {
  getClassSessionDetail,
  updateClassSession,
  deleteClassSession,
} from "@/lib/actions/class-sessions";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getClassSessionDetail(parseInt(params.id));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(`Error in GET /api/class-sessions/[id]:`, error);
    return NextResponse.json(
      { error: "Failed to fetch class session" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const result = await updateClassSession(parseInt(params.id), {
      title: body.title,
      description: body.description,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      status: body.status,
      durationMinutes: body.durationMinutes,
      guestTeacherId: body.guestTeacherId !== undefined ? body.guestTeacherId : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(`Error in PATCH /api/class-sessions/[id]:`, error);
    return NextResponse.json(
      { error: "Failed to update class session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteClassSession(parseInt(params.id));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/class-sessions/[id]:`, error);
    return NextResponse.json(
      { error: "Failed to delete class session" },
      { status: 500 }
    );
  }
}
