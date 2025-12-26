import { NextRequest, NextResponse } from "next/server";
import { getCurrentTA, checkTAPermission } from "@/lib/actions/teaching-assistant";

export async function GET(request: NextRequest) {
    try {
        const ta = await getCurrentTA();
        if (!ta) {
            return NextResponse.json(
                { error: "Unauthorized - Teaching Assistant only" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const classIdParam = searchParams.get("classId");
        const action = searchParams.get("action");

        if (!classIdParam || !action) {
            return NextResponse.json(
                { error: "classId and action are required" },
                { status: 400 }
            );
        }

        const classId = parseInt(classIdParam);
        if (isNaN(classId)) {
            return NextResponse.json(
                { error: "Invalid classId" },
                { status: 400 }
            );
        }

        const validActions = [
            "canMarkAttendance",
            "canManageMaterials",
            "canGradeAssignments",
            "canManageSessions"
        ];

        if (!validActions.includes(action)) {
            return NextResponse.json(
                { error: "Invalid action" },
                { status: 400 }
            );
        }

        const allowed = await checkTAPermission(
            ta.id,
            classId,
            action as any
        );

        return NextResponse.json({ success: true, allowed });
    } catch (error) {
        console.error("Error checking TA permission:", error);
        return NextResponse.json(
            { error: "Failed to check permission" },
            { status: 500 }
        );
    }
}
