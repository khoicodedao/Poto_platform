import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sendSmartZaloMessage } from "@/lib/zalo-integration";

/**
 * POST /api/class-sessions/[id]/send-reminder
 * Gửi tin nhắn nhắc nhở qua Zalo cho tất cả học viên trong buổi học
 * 
 * Sử dụng Smart Messaging:
 * - Ưu tiên gửi Consultation (FREE)
 * - Tự động fallback sang Promotion (PAID) khi vi phạm luật 48h
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const sessionId = parseInt(params.id);

        if (isNaN(sessionId)) {
            return NextResponse.json(
                { error: "Invalid session ID" },
                { status: 400 }
            );
        }

        // Lấy thông tin buổi học
        const session = await db.query.classSessions.findFirst({
            where: (sessions, { eq }) => eq(sessions.id, sessionId),
            with: {
                class: {
                    with: {
                        enrollments: {
                            with: {
                                student: true,
                            },
                        },
                    },
                },
            },
        });

        if (!session) {
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            );
        }

        // Lấy danh sách học viên có Zalo ID
        const sessionClass = session.class as any;
        const students = sessionClass.enrollments
            .map((e: any) => e.student)
            .filter((s: any) => s.zaloUserId);

        if (students.length === 0) {
            return NextResponse.json({
                success: true,
                message: "Không có học viên nào có Zalo ID",
                sent: 0,
                failed: 0,
            });
        }

        // Tính thời gian đến buổi học
        const scheduledAt = new Date(session.scheduledAt);
        const now = new Date();
        const hoursUntilClass = Math.round(
            (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60)
        );
        const minutesUntilClass = Math.round(
            (scheduledAt.getTime() - now.getTime()) / (1000 * 60)
        );

        const timeUntilText =
            hoursUntilClass > 0
                ? `${hoursUntilClass} giờ ${minutesUntilClass % 60} phút`
                : `${minutesUntilClass} phút`;

        // Tạo nội dung tin nhắn
        const className = (session.class as any).name;
        const message = `🔔 NHẮC NHỞ BUỔI HỌC

📚 Lớp: ${className}
📝 Buổi học: ${session.title}
⏰ Thời gian: ${scheduledAt.toLocaleString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })}

⏳ Còn ${timeUntilText} nữa là đến giờ học!

${session.description ? `📌 Ghi chú: ${session.description}\n` : ""}💡 Hãy chuẩn bị sẵn sàng và tham gia đúng giờ nhé!

Chúc bạn học tập hiệu quả! 🎓`;

        // Gửi tin nhắn cho từng học viên với Smart Logic
        // Lấy attachment ID từ env (fallback cho Promotion)
        const attachmentId = process.env.ZALO_REMINDER_ATTACHMENT_ID || process.env.ZALO_DEFAULT_ATTACHMENT_ID;

        let consultationCount = 0;
        let promotionCount = 0;
        let quotaUsed = 0;

        const results = await Promise.allSettled(
            students.map(async (student: any) => {
                const result = await sendSmartZaloMessage(
                    student.zaloUserId!,
                    message,
                    attachmentId
                );

                if (result.success) {
                    // Track message type
                    if (result.messageType === "consultation") {
                        consultationCount++;
                    } else {
                        promotionCount++;
                        quotaUsed++;
                    }

                    console.log(
                        `[Reminder] ✅ Sent to ${student.name} via ${result.messageType.toUpperCase()} ` +
                        `(Quota: ${result.usedQuota ? "YES ❌" : "NO ✅"})`
                    );

                    return {
                        success: true,
                        studentId: student.id,
                        studentName: student.name,
                        messageType: result.messageType,
                        usedQuota: result.usedQuota,
                    };
                } else {
                    console.error(
                        `[Reminder] ❌ Failed to send to ${student.name}:`,
                        result.error
                    );

                    return {
                        success: false,
                        studentId: student.id,
                        studentName: student.name,
                        error: result.error,
                        errorCode: result.errorCode,
                    };
                }
            })
        );

        const successCount = results.filter(
            (r: any) => r.status === "fulfilled" && r.value.success
        ).length;
        const failedCount = results.length - successCount;

        const failedStudents = results
            .filter((r: any) => r.status === "fulfilled" && !r.value.success)
            .map((r: any) => r.value.studentName);

        return NextResponse.json({
            success: true,
            message: `Đã gửi nhắc nhở thành công cho ${successCount}/${students.length} học viên`,
            sent: successCount,
            failed: failedCount,
            failedStudents,
            totalStudents: students.length,
            // Smart messaging statistics
            statistics: {
                consultationCount,
                promotionCount,
                quotaUsed,
                savedQuota: consultationCount, // Số quota đã tiết kiệm
            },
        });
    } catch (error) {
        console.error("[Reminder] Error sending reminders:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
