import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isNotNull, eq } from "drizzle-orm";

/**
 * GET /api/zalo/registered-accounts
 * Lấy danh sách các tài khoản đã đăng ký (có Zalo ID) và followers của OA
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only teachers, TAs, and admins
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

        // 1. Get all followers from Zalo OA
        let allFollowers: any[] = [];
        let offset = 0;
        const batchSize = 50;
        let hasMore = true;

        while (hasMore) {
            const response = await fetch(
                `https://openapi.zalo.me/v2.0/oa/getfollowers?data={"offset":${offset},"count":${batchSize}}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        access_token: accessToken,
                    },
                }
            );

            if (!response.ok) break;

            const result = await response.json();
            if (result.error !== 0 || !result.data?.followers) break;

            allFollowers = [...allFollowers, ...result.data.followers];

            if (result.data.count < batchSize) {
                hasMore = false;
            } else {
                offset += batchSize;
            }

            if (offset >= 1000) hasMore = false;
        }

        // 2. Get all users có Zalo ID từ database
        const registeredUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                zaloUserId: users.zaloUserId,
                isActive: users.isActive,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(isNotNull(users.zaloUserId));

        // 3. Match users với followers
        const followerIds = allFollowers.map((f) => f.user_id);

        const accountsData = registeredUsers.map((user) => {
            const isFollowing = followerIds.includes(user.zaloUserId!);

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                zaloUserId: user.zaloUserId,
                isActive: user.isActive,
                isFollowing: isFollowing,
                registeredAt: user.createdAt,
                status: isFollowing ? "following" : "registered_not_following",
            };
        });

        // 4. Get followers chưa register (có trong OA nhưng không có trong DB)
        const unregisteredFollowers = allFollowers
            .filter((follower) => {
                return !registeredUsers.some((u) => u.zaloUserId === follower.user_id);
            })
            .map((follower) => ({
                zaloUserId: follower.user_id,
                status: "following_not_registered",
                isFollowing: true,
                note: "Đã follow OA nhưng chưa kết nối trong hệ thống",
            }));

        // 5. Summary statistics
        const summary = {
            total: {
                registered: registeredUsers.length,
                following: allFollowers.length,
                matched: accountsData.filter((a) => a.isFollowing).length,
                unmatched: {
                    registeredButNotFollowing: accountsData.filter((a) => !a.isFollowing)
                        .length,
                    followingButNotRegistered: unregisteredFollowers.length,
                },
            },
            byRole: {
                students: accountsData.filter((a) => a.role === "student").length,
                teachers: accountsData.filter((a) => a.role === "teacher").length,
                teachingAssistants: accountsData.filter(
                    (a) => a.role === "teaching_assistant"
                ).length,
                admins: accountsData.filter((a) => a.role === "admin").length,
            },
        };

        return NextResponse.json({
            success: true,
            summary,
            accounts: {
                registered: accountsData,
                unregisteredFollowers,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Zalo] Error getting registered accounts:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
