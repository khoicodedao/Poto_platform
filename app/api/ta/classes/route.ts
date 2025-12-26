import { NextRequest, NextResponse } from "next/server";
import { getCurrentTA, getTAAssignedClasses } from "@/lib/actions/teaching-assistant";
import { db } from "@/db";
import { teachingAssistantAssignments, classes, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const ta = await getCurrentTA();
        if (!ta) {
            return NextResponse.json(
                { error: "Unauthorized - Teaching Assistant only" },
                { status: 401 }
            );
        }

        // If admin, fetch ALL classes that have TA assignments
        if (ta.role === "admin") {
            const allTAClasses = await db
                .selectDistinct({
                    id: teachingAssistantAssignments.id,
                    classId: teachingAssistantAssignments.classId,
                    className: classes.name,
                    classDescription: classes.description,
                    teacherName: users.name,
                    canMarkAttendance: teachingAssistantAssignments.canMarkAttendance,
                    canManageMaterials: teachingAssistantAssignments.canManageMaterials,
                    canGradeAssignments: teachingAssistantAssignments.canGradeAssignments,
                    canManageSessions: teachingAssistantAssignments.canManageSessions,
                })
                .from(teachingAssistantAssignments)
                .innerJoin(classes, eq(teachingAssistantAssignments.classId, classes.id))
                .innerJoin(users, eq(classes.teacherId, users.id))
                .where(eq(teachingAssistantAssignments.isActive, true));

            // Further deduplicate by classId on the client side
            const uniqueClasses = allTAClasses.reduce((acc: any[], curr) => {
                if (!acc.find(c => c.classId === curr.classId)) {
                    acc.push(curr);
                }
                return acc;
            }, []);

            return NextResponse.json({ success: true, data: uniqueClasses });
        }

        // Regular TA - fetch only their assigned classes
        const result = await getTAAssignedClasses(ta.id);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error in TA classes API:", error);
        return NextResponse.json(
            { error: "Failed to fetch classes" },
            { status: 500 }
        );
    }
}
