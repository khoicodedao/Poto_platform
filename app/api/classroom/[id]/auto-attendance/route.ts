import { NextResponse } from "next/server";
import { db } from "@/db";
import { classSessions, attendance, classEnrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { markAttendance } from "@/lib/actions/class-sessions";
import { getCurrentSession } from "@/lib/auth";

/**
 * POST /api/classroom/[id]/auto-attendance
 * Tự động điểm danh khi học viên join vào phòng học
 * - Cho phép điểm danh BẤT CỨ LÚC NÀO
 * - Tìm buổi học GẦN NHẤT của lớp
 * - Muộn > 15 phút → "late"
 * - Trong vòng 15 phút → "present"
 */
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const classId = parseInt(params.id);

        // Lấy thông tin user hiện tại
        const session = await getCurrentSession();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized - Please login" },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const userRole = session.user.role;

        // Kiểm tra xem user có phải là học viên của lớp này không
        if (userRole === "student") {
            const enrollment = await db.query.classEnrollments.findFirst({
                where: and(
                    eq(classEnrollments.classId, classId),
                    eq(classEnrollments.studentId, userId)
                ),
            });

            if (!enrollment) {
                return NextResponse.json(
                    { error: "You are not enrolled in this class" },
                    { status: 403 }
                );
            }
        }

        // Tìm buổi học gần nhất của lớp (KHÔNG giới hạn thời gian)
        const now = new Date();

        const allSessions = await db.query.classSessions.findMany({
            where: eq(classSessions.classId, classId),
            orderBy: (sessions, { desc }) => [desc(sessions.scheduledAt)],
        });

        if (!allSessions || allSessions.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No sessions found for this class",
                    message: "Không tìm thấy buổi học nào cho lớp này",
                },
                { status: 404 }
            );
        }

        // Tìm buổi học gần với thời điểm hiện tại nhất
        let currentSession = allSessions[0];
        let minTimeDiff = Math.abs(
            new Date(allSessions[0].scheduledAt).getTime() - now.getTime()
        );

        for (const session of allSessions) {
            const timeDiff = Math.abs(
                new Date(session.scheduledAt).getTime() - now.getTime()
            );
            if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                currentSession = session;
            }
        }

        console.log("[Auto-Attendance] Found nearest session:", {
            sessionId: currentSession.id,
            title: currentSession.title,
            scheduledAt: currentSession.scheduledAt,
        });

        // Kiểm tra xem đã điểm danh chưa
        const existingAttendance = await db.query.attendance.findFirst({
            where: and(
                eq(attendance.sessionId, currentSession.id),
                eq(attendance.studentId, userId)
            ),
        });

        if (existingAttendance) {
            // Đã điểm danh rồi, không cần làm gì thêm
            return NextResponse.json({
                success: true,
                message: "Bạn đã được điểm danh cho buổi học này",
                sessionId: currentSession.id,
                sessionTitle: currentSession.title,
                attendanceId: existingAttendance.id,
                status: existingAttendance.status,
                alreadyMarked: true,
            });
        }

        // Tự động điểm danh
        const sessionScheduledTime = new Date(currentSession.scheduledAt);
        const minutesLate = Math.floor(
            (now.getTime() - sessionScheduledTime.getTime()) / (1000 * 60)
        );

        // Xác định trạng thái điểm danh: Muộn > 15 phút = "late"
        let attendanceStatus: "present" | "late" = "present";
        if (minutesLate > 15) {
            attendanceStatus = "late"; // Muộn hơn 15 phút
        }

        const result = await markAttendance({
            sessionId: currentSession.id,
            studentId: userId,
            status: attendanceStatus,
            checkInTime: now,
            notes: `Tự động điểm danh khi tham gia phòng học lúc ${now.toLocaleTimeString(
                "vi-VN"
            )}`,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to mark attendance" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Đã điểm danh ${attendanceStatus === "late" ? "muộn" : "thành công"
                } cho buổi học`,
            sessionId: currentSession.id,
            sessionTitle: currentSession.title,
            attendanceId: result.data?.id,
            status: attendanceStatus,
            checkInTime: now,
            minutesLate: minutesLate > 0 ? minutesLate : 0,
        });
    } catch (error) {
        console.error("Error in auto-attendance:", error);
        return NextResponse.json(
            { error: "Internal server error", details: String(error) },
            { status: 500 }
        );
    }
}
