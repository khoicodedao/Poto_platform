import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/students
 * Lấy danh sách tất cả students
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only admins can access
        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
        }

        // Get all students
        const students = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                zaloUserId: users.zaloUserId,
                isActive: users.isActive,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.role, "student"))
            .orderBy(users.name);

        return NextResponse.json({
            success: true,
            students,
            total: students.length,
        });
    } catch (error) {
        console.error("[API] Error fetching students:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
