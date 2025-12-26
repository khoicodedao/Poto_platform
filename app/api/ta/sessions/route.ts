import { NextRequest, NextResponse } from "next/server";
import { getCurrentTA, getTASessions } from "@/lib/actions/teaching-assistant";
import { db } from "@/db";
import { classSessions, classes, teachingAssistantAssignments } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

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
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");
        const taIdParam = searchParams.get("taId");

        if (!startDateParam || !endDateParam) {
            return NextResponse.json(
                { error: "startDate and endDate are required" },
                { status: 400 }
            );
        }

        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            );
        }

        // If admin and taId specified, fetch that TA's sessions
        if (ta.role === "admin" && taIdParam) {
            const result = await getTASessions(parseInt(taIdParam), startDate, endDate);
            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: 500 });
            }
            return NextResponse.json({ success: true, data: result.data });
        }

        // If admin and no taId, fetch ALL TA sessions
        if (ta.role === "admin" && !taIdParam) {
            const allSessions = await db
                .select({
                    id: classSessions.id,
                    classId: classSessions.classId,
                    sessionNumber: classSessions.sessionNumber,
                    title: classSessions.title,
                    description: classSessions.description,
                    scheduledAt: classSessions.scheduledAt,
                    durationMinutes: classSessions.durationMinutes,
                    roomId: classSessions.roomId,
                    status: classSessions.status,
                    className: classes.name,
                })
                .from(classSessions)
                .innerJoin(classes, eq(classSessions.classId, classes.id))
                .innerJoin(
                    teachingAssistantAssignments,
                    eq(classes.id, teachingAssistantAssignments.classId)
                )
                .where(
                    and(
                        eq(teachingAssistantAssignments.isActive, true),
                        gte(classSessions.scheduledAt, startDate),
                        lte(classSessions.scheduledAt, endDate)
                    )
                )
                .orderBy(classSessions.scheduledAt);

            return NextResponse.json({ success: true, data: allSessions });
        }

        // Regular TA - fetch their own sessions
        const result = await getTASessions(ta.id, startDate, endDate);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error in TA sessions API:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}
