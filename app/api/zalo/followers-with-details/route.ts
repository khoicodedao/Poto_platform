import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";

/**
 * GET /api/zalo/followers-with-details
 * Lấy danh sách followers với thông tin chi tiết (avatar, tên)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only admins, teachers, TAs
        if (!["teacher", "teaching_assistant", "admin"].includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const accessToken = process.env.ZALO_ACCESS_TOKEN;

        if (!accessToken) {
            return NextResponse.json(
                { error: "Missing Zalo configuration" },
                { status: 500 }
            );
        }

        console.log("[Zalo] Fetching followers with details...");

        // Step 1: Get list of followers (user IDs only)
        let allFollowers: string[] = [];
        let offset = 0;
        const batchSize = 50; // Max per request
        let hasMore = true;

        while (hasMore && offset < 10000) {
            const params = {
                offset,
                count: batchSize,
                is_follower: true,
            };

            const listUrl = `https://openapi.zalo.me/v3.0/oa/user/getlist?data=${encodeURIComponent(JSON.stringify(params))}`;

            const listResponse = await fetch(listUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    access_token: accessToken,
                },
            });

            if (!listResponse.ok) {
                console.error("[Zalo] Failed to fetch followers list");
                break;
            }

            const listResult = await listResponse.json();

            if (listResult.error !== 0 || !listResult.data?.users) {
                console.error("[Zalo] API error:", listResult);
                break;
            }

            const userIds = listResult.data.users.map((u: any) => u.user_id);
            allFollowers = [...allFollowers, ...userIds];

            if (listResult.data.users.length < batchSize) {
                hasMore = false;
            } else {
                offset += batchSize;
            }
        }

        console.log(`[Zalo] Found ${allFollowers.length} followers`);

        // Step 2: Get details for each follower (with rate limiting)
        const followersWithDetails = [];

        for (const userId of allFollowers) {
            try {
                const detailParams = { user_id: userId };
                const detailUrl = `https://openapi.zalo.me/v3.0/oa/user/detail?data=${encodeURIComponent(JSON.stringify(detailParams))}`;

                const detailResponse = await fetch(detailUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        access_token: accessToken,
                    },
                });

                if (detailResponse.ok) {
                    const detailResult = await detailResponse.json();

                    if (detailResult.error === 0 && detailResult.data) {
                        followersWithDetails.push({
                            userId: detailResult.data.user_id,
                            displayName: detailResult.data.display_name || "Không có tên",
                            avatar: detailResult.data.avatars?.["120"] || detailResult.data.avatar || null,
                            isFollower: detailResult.data.user_is_follower,
                            lastInteraction: detailResult.data.user_last_interaction_date,
                        });
                    }
                }

                // Rate limiting: wait 100ms between requests
                await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`[Zalo] Error fetching details for ${userId}:`, error);
            }
        }

        console.log(`[Zalo] Got details for ${followersWithDetails.length} followers`);

        return NextResponse.json({
            success: true,
            followers: followersWithDetails,
            total: followersWithDetails.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Zalo] Error fetching followers with details:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
