import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/admin/teachers - Get all teachers
export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 403 }
            );
        }

        const teachers = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
            })
            .from(users)
            .where(eq(users.role, "teacher"))
            .orderBy(users.name);

        return NextResponse.json({ teachers });
    } catch (error) {
        console.error("[Admin Teachers] GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch teachers" },
            { status: 500 }
        );
    }
}
