import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { classes, users, classEnrollments } from "@/db/schema";
import { eq, count } from "drizzle-orm";

// GET /api/admin/classes - Get all classes
export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 403 }
            );
        }

        // Get all classes with teacher info and student count
        const allClasses = await db
            .select({
                id: classes.id,
                name: classes.name,
                description: classes.description,
                teacherId: classes.teacherId,
                teacherName: users.name,
                schedule: classes.schedule,
                maxStudents: classes.maxStudents,
                isActive: classes.isActive,
                createdAt: classes.createdAt,
            })
            .from(classes)
            .leftJoin(users, eq(classes.teacherId, users.id))
            .orderBy(classes.createdAt);

        // Get student counts for each class
        const classesWithCounts = await Promise.all(
            allClasses.map(async (classItem) => {
                const [studentCountResult] = await db
                    .select({ count: count() })
                    .from(classEnrollments)
                    .where(eq(classEnrollments.classId, classItem.id));

                return {
                    ...classItem,
                    studentCount: studentCountResult?.count || 0,
                };
            })
        );

        return NextResponse.json({ classes: classesWithCounts });
    } catch (error) {
        console.error("[Admin Classes] GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch classes" },
            { status: 500 }
        );
    }
}

// POST /api/admin/classes - Create new class
export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, description, teacherId, teachingAssistantId, schedule, maxStudents } = body;

        if (!name || !teacherId) {
            return NextResponse.json(
                { error: "Name and teacher are required" },
                { status: 400 }
            );
        }

        // Verify teacher exists and is actually a teacher
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

        // Create class
        const [newClass] = await db
            .insert(classes)
            .values({
                name,
                description: description || null,
                teacherId,
                teachingAssistantId: teachingAssistantId || null,
                schedule: schedule || null,
                maxStudents: maxStudents || 20,
                isActive: true,
            })
            .returning();

        // If TA assigned, create TA assignment automatically
        if (teachingAssistantId) {
            const { assignTAToClass } = await import("@/lib/actions/teaching-assistant");
            await assignTAToClass({
                userId: parseInt(teachingAssistantId),
                classId: newClass.id,
                canMarkAttendance: true,
                canManageMaterials: true,
                canManageSessions: true,
            });
        }

        return NextResponse.json({
            message: "Class created successfully",
            class: newClass,
        });
    } catch (error) {
        console.error("[Admin Classes] POST Error:", error);
        return NextResponse.json(
            { error: "Failed to create class" },
            { status: 500 }
        );
    }
}
