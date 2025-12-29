import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";

/**
 * GET /api/zalo/followers
 * Get list of OA followers from Zalo API
 * Admin only
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only admins can view followers list
        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const accessToken = process.env.ZALO_ACCESS_TOKEN;
        const oaId = process.env.ZALO_OA_ID;

        if (!accessToken || !oaId) {
            return NextResponse.json(
                { error: "Missing Zalo configuration" },
                { status: 500 }
            );
        }

        // Get query parameters for pagination
        const searchParams = req.nextUrl.searchParams;
        const offset = parseInt(searchParams.get("offset") || "0");
        const count = parseInt(searchParams.get("count") || "50");

        // Call Zalo API to get followers
        const response = await fetch(
            `https://openapi.zalo.me/v2.0/oa/getfollowers?data={"offset":${offset},"count":${count}}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    access_token: accessToken,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("[Zalo] Error fetching followers:", errorData);
            return NextResponse.json(
                {
                    success: false,
                    error: errorData?.error?.message || "Failed to fetch followers",
                },
                { status: response.status }
            );
        }

        const result = await response.json();

        // Result structure:
        // {
        //   error: 0,
        //   message: "Success",
        //   data: {
        //     total: 100,
        //     count: 50,
        //     offset: 0,
        //     followers: [
        //       { user_id: "123456789" },
        //       { user_id: "987654321" }
        //     ]
        //   }
        // }

        if (result.error !== 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.message || "API returned error",
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            total: result.data?.total || 0,
            count: result.data?.count || 0,
            offset: result.data?.offset || 0,
            followers: result.data?.followers || [],
        });
    } catch (error) {
        console.error("[Zalo] Error in followers endpoint:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
