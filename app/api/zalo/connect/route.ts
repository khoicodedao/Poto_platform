import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getZaloUserProfile } from "@/lib/zalo-integration";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/zalo/connect
 * Connect user's Zalo account by verifying and saving Zalo User ID
 *
 * Body:
 * {
 *   "zaloUserId": string  // Zalo User ID from user
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { zaloUserId } = body;

        if (!zaloUserId) {
            return NextResponse.json(
                { error: "Zalo User ID is required" },
                { status: 400 }
            );
        }

        // Optional: Verify Zalo User ID is valid by fetching profile
        // This may fail if access token doesn't have permission
        let zaloProfile = null;
        try {
            zaloProfile = await getZaloUserProfile(zaloUserId);
        } catch (error) {
            console.warn("[Zalo] Could not verify Zalo profile:", error);
            // Continue anyway - profile fetch may not work with all token types
        }

        // Update user's Zalo ID
        await db
            .update(users)
            .set({
                zaloUserId: zaloUserId,
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            success: true,
            message: "Zalo account connected successfully",
            zaloUserId,
            profile: zaloProfile,
        });
    } catch (error) {
        console.error("[Zalo] Error connecting Zalo account:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/zalo/connect
 * Disconnect user's Zalo account
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Remove Zalo ID from user
        await db
            .update(users)
            .set({
                zaloUserId: null,
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            success: true,
            message: "Zalo account disconnected successfully",
        });
    } catch (error) {
        console.error("[Zalo] Error disconnecting Zalo account:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/zalo/connect
 * Get current user's Zalo connection status
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [user] = await db
            .select({
                zaloUserId: users.zaloUserId,
            })
            .from(users)
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            success: true,
            connected: !!user?.zaloUserId,
            zaloUserId: user?.zaloUserId || null,
        });
    } catch (error) {
        console.error("[Zalo] Error getting Zalo connection status:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
