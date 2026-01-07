import { NextResponse } from "next/server";
import {
  markAttendance,
  getSessionAttendance,
  updateCheckOutTime,
} from "@/lib/actions/class-sessions";
import { db } from "@/db";
import { sendZaloMessage } from "@/lib/zalo-integration";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await markAttendance({
      sessionId: body.sessionId,
      studentId: body.studentId,
      status: body.status,
      checkInTime: body.checkInTime ? new Date(body.checkInTime) : undefined,
      notes: body.notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Gửi thông báo Zalo sau khi điểm danh thành công
    try {
      // Lấy thông tin học viên và session
      const student = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, body.studentId),
      });

      if (student?.zaloUserId) {
        const session = await db.query.classSessions.findFirst({
          where: (sessions, { eq }) => eq(sessions.id, body.sessionId),
          with: {
            class: true,
          },
        });

        if (session) {
          const statusMap: Record<string, string> = {
            present: "Có mặt ✅",
            absent: "Vắng mặt ❌",
            late: "Đi muộn ⏰",
            "early-leave": "Về sớm 🚪",
          };
          const statusText = statusMap[body.status] || body.status;

          const sessionClass = session.class as any;
          const message = `📋 THÔNG BÁO ĐIỂM DANH

📚 Lớp: ${sessionClass?.name || "N/A"}
📝 Buổi học: ${session.title}
📅 Ngày: ${new Date(session.scheduledAt).toLocaleDateString("vi-VN")}

✅ Trạng thái: ${statusText}
${body.notes ? `📌 Ghi chú: ${body.notes}` : ""}

${body.status === "absent" ? "⚠️ Bạn đã vắng mặt buổi học này. Hãy liên hệ giáo viên để biết thêm chi tiết." : ""}
${body.status === "late" ? "💡 Hãy cố gắng đến đúng giờ trong các buổi học tiếp theo nhé!" : ""}

Cảm ơn bạn đã tham gia! 🎓`;

          await sendZaloMessage(student.zaloUserId, message);
          console.log(`[Attendance] Sent Zalo notification to student ${student.name}`);
        }
      }
    } catch (zaloError) {
      // Log error nhưng không fail request
      console.error("[Attendance] Failed to send Zalo notification:", zaloError);
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/attendance:", error);
    return NextResponse.json(
      { error: "Failed to mark attendance" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const result = await getSessionAttendance(parseInt(sessionId));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}
