import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { sendZaloMessage, sendZaloGroupMessage } from "@/lib/zalo-integration";
import { db } from "@/db";
import { users, classes, classEnrollments } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { createNotification } from "@/lib/actions/notifications";

/**
 * POST /api/zalo/send-message
 * Send Zalo message to individual user or class group
 *
 * Body:
 * {
 *   "recipientId": number,  // User ID (for individual message)
 *   "classId": number,      // Class ID (for group broadcast)
 *   "message": string,
 *   "title": string,
 *   "type": "reminder" | "report" | "assignment" | "attendance" | "general"
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only teachers, TAs, and admins can send Zalo messages
        if (!["teacher", "teaching_assistant", "admin"].includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { recipientId, classId, message, title, type = "general" } = body;

        if (!message || !title) {
            return NextResponse.json(
                { error: "Message and title are required" },
                { status: 400 }
            );
        }

        // Validate send type
        if (!recipientId && !classId) {
            return NextResponse.json(
                { error: "Either recipientId or classId must be provided" },
                { status: 400 }
            );
        }

        const results: any[] = [];
        let successCount = 0;
        let failureCount = 0;

        // Individual message
        if (recipientId) {
            const [recipient] = await db
                .select()
                .from(users)
                .where(eq(users.id, recipientId));

            if (!recipient) {
                return NextResponse.json(
                    { error: "Recipient not found" },
                    { status: 404 }
                );
            }

            if (!recipient.zaloUserId) {
                return NextResponse.json(
                    { error: "Recipient has not connected Zalo account" },
                    { status: 400 }
                );
            }

            try {
                const zaloMessageId = await sendZaloMessage(
                    recipient.zaloUserId,
                    `📢 *${title}*\n\n${message}`
                );

                // Create notification record
                await createNotification({
                    type,
                    title,
                    message,
                    recipientId,
                    classId: classId || null,
                    sentVia: "zalo",
                });

                results.push({
                    userId: recipientId,
                    status: "success",
                    zaloMessageId,
                });
                successCount++;
            } catch (error) {
                results.push({
                    userId: recipientId,
                    status: "failed",
                    error: String(error),
                });
                failureCount++;
            }
        }

        // Broadcast to class
        if (classId) {
            // Get class details
            const [classData] = await db
                .select()
                .from(classes)
                .where(eq(classes.id, classId));

            if (!classData) {
                return NextResponse.json(
                    { error: "Class not found" },
                    { status: 404 }
                );
            }

            // Check if user has permission to send to this class
            if (
                session.user.role === "teacher" &&
                classData.teacherId !== session.user.id
            ) {
                return NextResponse.json(
                    { error: "You don't have permission to send messages to this class" },
                    { status: 403 }
                );
            }

            // Get all students in class
            const enrollments = await db
                .select({
                    studentId: classEnrollments.studentId,
                })
                .from(classEnrollments)
                .where(eq(classEnrollments.classId, classId));

            const studentIds = enrollments.map((e) => e.studentId);

            if (studentIds.length === 0) {
                return NextResponse.json(
                    { error: "No students found in class" },
                    { status: 404 }
                );
            }

            // Get students with Zalo IDs
            const students = await db
                .select()
                .from(users)
                .where(inArray(users.id, studentIds));

            const formattedMessage = `📢 *${title}*\n\n${message}\n\n---\nLớp: ${classData.name}`;

            // Send to each student
            for (const student of students) {
                if (!student.zaloUserId) {
                    results.push({
                        userId: student.id,
                        name: student.name,
                        status: "skipped",
                        reason: "No Zalo ID",
                    });
                    continue;
                }

                try {
                    const zaloMessageId = await sendZaloMessage(
                        student.zaloUserId,
                        formattedMessage
                    );

                    // Create notification record
                    await createNotification({
                        type,
                        title,
                        message,
                        recipientId: student.id,
                        classId,
                        sentVia: "zalo",
                    });

                    results.push({
                        userId: student.id,
                        name: student.name,
                        status: "success",
                        zaloMessageId,
                    });
                    successCount++;
                } catch (error) {
                    results.push({
                        userId: student.id,
                        name: student.name,
                        status: "failed",
                        error: String(error),
                    });
                    failureCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                total: results.length,
                success: successCount,
                failed: failureCount,
                skipped: results.filter((r) => r.status === "skipped").length,
            },
            results,
        });
    } catch (error) {
        console.error("[Zalo] Error sending message:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
