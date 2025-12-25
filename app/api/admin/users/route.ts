import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// GET /api/admin/users - Get all users
export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 403 }
            );
        }

        const allUsers = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                isActive: users.isActive,
                createdAt: users.createdAt,
            })
            .from(users)
            .orderBy(users.createdAt);

        return NextResponse.json({ users: allUsers });
    } catch (error) {
        console.error("[Admin Users] GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

// POST /api/admin/users - Create new user
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
        const { email, password, name, role } = body;

        if (!email || !password || !name || !role) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [newUser] = await db
            .insert(users)
            .values({
                email,
                password: hashedPassword,
                name,
                role,
                isActive: true,
            })
            .returning();

        return NextResponse.json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error("[Admin Users] POST Error:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
