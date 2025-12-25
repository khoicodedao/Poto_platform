import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users, classes, classSessions } from "@/db/schema";
import { eq, count, and, sql } from "drizzle-orm";

export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 403 }
            );
        }

        // Get total users by role
        const [totalUsersResult] = await db
            .select({ count: count() })
            .from(users);

        const [studentsResult] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.role, "student"));

        const [teachersResult] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.role, "teacher"));

        const [adminsResult] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.role, "admin"));

        // Get total classes
        const [totalClassesResult] = await db
            .select({ count: count() })
            .from(classes);

        const [activeClassesResult] = await db
            .select({ count: count() })
            .from(classes)
            .where(eq(classes.isActive, true));

        // Get total sessions
        const [totalSessionsResult] = await db
            .select({ count: count() })
            .from(classSessions);

        // For now, set studentsNeedAttention to 0
        // You can implement more complex logic later
        const studentsNeedAttention = 0;

        return NextResponse.json({
            totalUsers: totalUsersResult.count || 0,
            totalStudents: studentsResult.count || 0,
            totalTeachers: teachersResult.count || 0,
            totalAdmins: adminsResult.count || 0,
            totalClasses: totalClassesResult.count || 0,
            activeClasses: activeClassesResult.count || 0,
            totalSessions: totalSessionsResult.count || 0,
            studentsNeedAttention,
        });
    } catch (error) {
        console.error("[Admin Stats] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch admin stats" },
            { status: 500 }
        );
    }
}
