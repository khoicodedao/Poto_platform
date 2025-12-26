import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teachingAssistantAssignments, users, classes } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { assignTAToClass, removeTAFromClass } from "@/lib/actions/teaching-assistant";
import { eq, and } from "drizzle-orm";

// GET - Get all TA assignments
export async function GET(request: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 401 }
            );
        }

        const assignments = await db
            .select({
                id: teachingAssistantAssignments.id,
                userId: teachingAssistantAssignments.userId,
                classId: teachingAssistantAssignments.classId,
                canMarkAttendance: teachingAssistantAssignments.canMarkAttendance,
                canManageMaterials: teachingAssistantAssignments.canManageMaterials,
                canGradeAssignments: teachingAssistantAssignments.canGradeAssignments,
                canManageSessions: teachingAssistantAssignments.canManageSessions,
                isActive: teachingAssistantAssignments.isActive,
                userName: users.name,
                className: classes.name,
            })
            .from(teachingAssistantAssignments)
            .leftJoin(users, eq(teachingAssistantAssignments.userId, users.id))
            .leftJoin(classes, eq(teachingAssistantAssignments.classId, classes.id))
            .where(eq(teachingAssistantAssignments.isActive, true));

        return NextResponse.json({ success: true, data: assignments });
    } catch (error) {
        console.error("Error fetching TA assignments:", error);
        return NextResponse.json(
            { error: "Failed to fetch assignments" },
            { status: 500 }
        );
    }
}

// POST - Create new TA assignment
export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const result = await assignTAToClass(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error creating TA assignment:", error);
        return NextResponse.json(
            { error: "Failed to create assignment" },
            { status: 500 }
        );
    }
}

// DELETE - Remove TA assignment
export async function DELETE(request: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const userId = parseInt(searchParams.get("userId") || "");
        const classId = parseInt(searchParams.get("classId") || "");

        if (!userId || !classId) {
            return NextResponse.json(
                { error: "userId and classId are required" },
                { status: 400 }
            );
        }

        const result = await removeTAFromClass(userId, classId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing TA assignment:", error);
        return NextResponse.json(
            { error: "Failed to remove assignment" },
            { status: 500 }
        );
    }
}
