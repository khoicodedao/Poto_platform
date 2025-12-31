import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * PATCH /api/students/[id]/zalo
 * Cập nhật Zalo ID cho student
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only teachers, TAs, and admins
        if (!["teacher", "teaching_assistant", "admin"].includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const studentId = parseInt(params.id);
        const body = await req.json();
        const { zaloUserId } = body;

        // Validate student exists
        const [student] = await db
            .select()
            .from(users)
            .where(eq(users.id, studentId))
            .limit(1);

        if (!student) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        if (student.role !== "student") {
            return NextResponse.json(
                { error: "User is not a student" },
                { status: 400 }
            );
        }

        // Update Zalo ID
        const [updated] = await db
            .update(users)
            .set({
                zaloUserId: zaloUserId || null,
                updatedAt: new Date(),
            })
            .where(eq(users.id, studentId))
            .returning();

        console.log(`[API] Updated Zalo ID for student ${studentId}:`, zaloUserId || "removed");

        return NextResponse.json({
            success: true,
            student: {
                id: updated.id,
                name: updated.name,
                email: updated.email,
                zaloUserId: updated.zaloUserId,
            },
        });
    } catch (error) {
        console.error("[API] Error updating student Zalo ID:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
