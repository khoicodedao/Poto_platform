import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { classes, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/admin/classes/[id] - Update class
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 403 }
            );
        }

        const classId = parseInt(params.id);
        const body = await request.json();
        const { name, description, teacherId, teachingAssistantId, schedule, maxStudents } = body;

        // Check if class exists
        const [existingClass] = await db
            .select()
            .from(classes)
            .where(eq(classes.id, classId))
            .limit(1);

        if (!existingClass) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // If teacherId is being updated, verify the teacher
        if (teacherId) {
            const [teacher] = await db
                .select()
                .from(users)
                .where(eq(users.id, teacherId))
                .limit(1);

            if (!teacher) {
                return NextResponse.json(
                    { error: "Teacher not found" },
                    { status: 404 }
                );
            }

            if (teacher.role !== "teacher" && teacher.role !== "admin") {
                return NextResponse.json(
                    { error: "User is not a teacher" },
                    { status: 400 }
                );
            }
        }

        // If teachingAssistantId is being updated, verify the TA
        if (teachingAssistantId) {
            const [ta] = await db
                .select()
                .from(users)
                .where(eq(users.id, teachingAssistantId))
                .limit(1);

            if (!ta) {
                return NextResponse.json(
                    { error: "Teaching Assistant not found" },
                    { status: 404 }
                );
            }

            if (ta.role !== "teaching_assistant" && ta.role !== "admin") {
                return NextResponse.json(
                    { error: "User is not a teaching assistant" },
                    { status: 400 }
                );
            }
        }

        // Update class
        const [updatedClass] = await db
            .update(classes)
            .set({
                name: name || existingClass.name,
                description: description !== undefined ? description : existingClass.description,
                teacherId: teacherId || existingClass.teacherId,
                teachingAssistantId: teachingAssistantId !== undefined ? (teachingAssistantId || null) : existingClass.teachingAssistantId,
                schedule: schedule !== undefined ? schedule : existingClass.schedule,
                maxStudents: maxStudents || existingClass.maxStudents,
                updatedAt: new Date(),
            })
            .where(eq(classes.id, classId))
            .returning();

        // Handle TA assignment update
        if (teachingAssistantId !== undefined) {
            const { assignTAToClass, removeTAFromClass } = await import("@/lib/actions/teaching-assistant");

            if (teachingAssistantId) {
                // Assign or update TA
                await assignTAToClass({
                    userId: parseInt(teachingAssistantId),
                    classId: classId,
                    canMarkAttendance: true,
                    canManageMaterials: true,
                    canManageSessions: true,
                });
            } else if (existingClass.teachingAssistantId) {
                // Remove TA if previously assigned
                await removeTAFromClass(existingClass.teachingAssistantId, classId);
            }
        }

        return NextResponse.json({
            message: "Class updated successfully",
            class: updatedClass,
        });
    } catch (error) {
        console.error("[Admin Classes] PUT Error:", error);
        return NextResponse.json(
            { error: "Failed to update class" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/classes/[id] - Delete class
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 403 }
            );
        }

        const classId = parseInt(params.id);

        // Check if class exists
        const [existingClass] = await db
            .select()
            .from(classes)
            .where(eq(classes.id, classId))
            .limit(1);

        if (!existingClass) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Delete class (cascade will handle related records)
        await db.delete(classes).where(eq(classes.id, classId));

        return NextResponse.json({
            message: "Class deleted successfully",
        });
    } catch (error) {
        console.error("[Admin Classes] DELETE Error:", error);
        return NextResponse.json(
            { error: "Failed to delete class" },
            { status: 500 }
        );
    }
}
