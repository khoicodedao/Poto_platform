import { NextResponse } from "next/server";
import {
  addStudentFeedback,
  getSessionFeedbacks,
  removeStudentFeedback,
} from "@/lib/actions/class-sessions";
import { db } from "@/db";
import { sendZaloMessage } from "@/lib/zalo-integration";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await addStudentFeedback({
      sessionId: body.sessionId,
      studentId: body.studentId,
      feedbackText: body.feedbackText,
      rating: body.rating,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Gửi nhận xét qua Zalo sau khi lưu thành công
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
          const rating = body.rating || 0;
          const stars = "⭐".repeat(rating);
          const sessionClass = session.class as any;

          const message = `💬 NHẬN XÉT TỪ GIÁO VIÊN

📚 Lớp: ${sessionClass?.name || "N/A"}
📝 Buổi học: ${session.title}
📅 Ngày: ${new Date(session.scheduledAt).toLocaleDateString("vi-VN")}

${rating > 0 ? `⭐ Đánh giá: ${stars} (${rating}/5 sao)\n` : ""}
💬 Nhận xét:
${body.feedbackText}

${rating >= 4 ? "🎉 Xuất sắc! Hãy tiếp tục phát huy nhé!" : ""}
${rating === 3 ? "💪 Tốt! Hãy cố gắng hơn nữa!" : ""}
${rating <= 2 && rating > 0 ? "📖 Hãy chú ý ôn tập và tham gia tích cực hơn trong các buổi học tiếp theo nhé!" : ""}

Cảm ơn bạn đã tham gia buổi học! 🎓`;

          await sendZaloMessage(student.zaloUserId, message);
          console.log(`[Feedback] Sent Zalo notification to student ${student.name}`);
        }
      }
    } catch (zaloError) {
      // Log error nhưng không fail request
      console.error("[Feedback] Failed to send Zalo notification:", zaloError);
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/student-feedback:", error);
    return NextResponse.json(
      { error: "Failed to add student feedback" },
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

    const result = await getSessionFeedbacks(parseInt(sessionId));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/student-feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch student feedback" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const id = body?.id;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const result = await removeStudentFeedback(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/student-feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete student feedback" },
      { status: 500 }
    );
  }
}
