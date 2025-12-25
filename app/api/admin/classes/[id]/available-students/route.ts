import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users, classEnrollments } from "@/db/schema";
import { eq, notInArray, and } from "drizzle-orm";

// GET /api/admin/classes/[id]/available-students
// Get students not enrolled in this class
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const classId = parseInt(params.id);

        // Get IDs of students already enrolled
        const enrolledStudentIds = await db
            .select({ studentId: classEnrollments.studentId })
            .from(classEnrollments)
            .where(eq(classEnrollments.classId, classId));

        const enrolledIds = enrolledStudentIds.map((e) => e.studentId);

        // Get all students not enrolled
        let availableStudents;
        if (enrolledIds.length > 0) {
            availableStudents = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                })
                .from(users)
                .where(
                    and(
                        eq(users.role, "student"),
                        notInArray(users.id, enrolledIds)
                    )
                )
                .orderBy(users.name);
        } else {
            availableStudents = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                })
                .from(users)
                .where(eq(users.role, "student"))
                .orderBy(users.name);
        }

        return NextResponse.json({ students: availableStudents });
    } catch (error) {
        console.error("[Admin Available Students] GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch available students" },
            { status: 500 }
        );
    }
}
