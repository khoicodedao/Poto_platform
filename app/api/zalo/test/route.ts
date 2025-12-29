import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { testZaloConnection } from "@/lib/zalo-integration";

/**
 * GET /api/zalo/test
 * Test Zalo OA connection
 * Only accessible by admins
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only admins can test connection
        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const result = await testZaloConnection();

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: "Zalo OA connection successful",
                data: result.data,
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Zalo OA connection failed",
                    error: result.error || `HTTP ${result.status}`,
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("[Zalo] Error testing connection:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
