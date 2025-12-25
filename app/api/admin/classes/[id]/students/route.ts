import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users, classEnrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/admin/classes/[id]/students - Get enrolled students
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

        const enrolledStudents = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                enrolledAt: classEnrollments.enrolledAt,
                endDate: classEnrollments.endDate,
            })
            .from(classEnrollments)
            .innerJoin(users, eq(classEnrollments.studentId, users.id))
            .where(eq(classEnrollments.classId, classId))
            .orderBy(classEnrollments.enrolledAt);

        return NextResponse.json({ students: enrolledStudents });
    } catch (error) {
        console.error("[Admin Classes Students] GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch students" },
            { status: 500 }
        );
    }
}
