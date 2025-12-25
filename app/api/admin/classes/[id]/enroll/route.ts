import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { classEnrollments } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// POST /api/admin/classes/[id]/enroll - Add student to class
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const classId = parseInt(params.id);
        const body = await request.json();
        const { studentId, endDate } = body;

        if (!studentId) {
            return NextResponse.json(
                { error: "Student ID is required" },
                { status: 400 }
            );
        }

        // Check if already enrolled
        const [existing] = await db
            .select()
            .from(classEnrollments)
            .where(
                and(
                    eq(classEnrollments.classId, classId),
                    eq(classEnrollments.studentId, studentId)
                )
            )
            .limit(1);

        if (existing) {
            return NextResponse.json(
                { error: "Student already enrolled" },
                { status: 400 }
            );
        }

        // Enroll student with optional endDate
        await db.insert(classEnrollments).values({
            classId,
            studentId,
            endDate: endDate ? new Date(endDate) : null,
        });

        return NextResponse.json({
            message: "Student enrolled successfully",
        });
    } catch (error) {
        console.error("[Admin Enroll] POST Error:", error);
        return NextResponse.json(
            { error: "Failed to enroll student" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/classes/[id]/enroll - Remove student from class
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const classId = parseInt(params.id);
        const body = await request.json();
        const { studentId } = body;

        if (!studentId) {
            return NextResponse.json(
                { error: "Student ID is required" },
                { status: 400 }
            );
        }

        // Remove enrollment
        await db
            .delete(classEnrollments)
            .where(
                and(
                    eq(classEnrollments.classId, classId),
                    eq(classEnrollments.studentId, studentId)
                )
            );

        return NextResponse.json({
            message: "Student removed successfully",
        });
    } catch (error) {
        console.error("[Admin Unenroll] DELETE Error:", error);
        return NextResponse.json(
            { error: "Failed to remove student" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/classes/[id]/enroll - Update student end date
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const classId = parseInt(params.id);
        const body = await request.json();
        const { studentId, endDate } = body;

        if (!studentId) {
            return NextResponse.json(
                { error: "Student ID is required" },
                { status: 400 }
            );
        }

        // Update end date
        await db
            .update(classEnrollments)
            .set({ endDate: endDate ? new Date(endDate) : null })
            .where(
                and(
                    eq(classEnrollments.classId, classId),
                    eq(classEnrollments.studentId, studentId)
                )
            );

        return NextResponse.json({
            message: "End date updated successfully",
        });
    } catch (error) {
        console.error("[Admin Update End Date] PUT Error:", error);
        return NextResponse.json(
            { error: "Failed to update end date" },
            { status: 500 }
        );
    }
}
