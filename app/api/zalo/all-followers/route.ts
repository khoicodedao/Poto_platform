import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/zalo/all-followers
 * Lấy TẤT CẢ followers từ Zalo OA (bất kể có trong DB hay không)
 * Kèm thông tin profile từ Zalo
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

        // 1. Get ALL followers from Zalo OA
        let allFollowers: any[] = [];
        let offset = 0;
        const batchSize = 50;
        let hasMore = true;

        console.log("[Zalo] Fetching all followers...");

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

            if (!response.ok) {
                console.error("[Zalo] Failed to fetch followers batch:", offset);
                break;
            }

            const result = await response.json();
            if (result.error !== 0 || !result.data?.followers) {
                console.error("[Zalo] API error:", result);
                break;
            }

            allFollowers = [...allFollowers, ...result.data.followers];

            if (result.data.count < batchSize) {
                hasMore = false;
            } else {
                offset += batchSize;
            }

            // Safety limit
            if (offset >= 1000) {
                console.warn("[Zalo] Reached safety limit of 1000 followers");
                hasMore = false;
            }
        }

        console.log(`[Zalo] Fetched ${allFollowers.length} followers`);

        // 2. Get all users from database (có Zalo ID)
        const dbUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                zaloUserId: users.zaloUserId,
                isActive: users.isActive,
            })
            .from(users);

        // 3. Fetch profile cho từng follower (nếu cần - optional vì rate limit)
        // For now, we'll just match with DB data

        // 4. Match followers với database users
        const followersWithInfo = allFollowers.map((follower) => {
            const zaloId = follower.user_id;

            // Tìm user trong DB có Zalo ID này
            const matchedUser = dbUsers.find((u) => u.zaloUserId === zaloId);

            if (matchedUser) {
                return {
                    zaloUserId: zaloId,
                    isLinked: true,
                    linkedAccount: {
                        id: matchedUser.id,
                        name: matchedUser.name,
                        email: matchedUser.email,
                        role: matchedUser.role,
                        isActive: matchedUser.isActive,
                    },
                    status: "linked",
                };
            } else {
                return {
                    zaloUserId: zaloId,
                    isLinked: false,
                    linkedAccount: null,
                    status: "unlinked",
                    note: "Chưa liên kết với tài khoản trong hệ thống",
                };
            }
        });

        // 5. Get list of users chưa link với Zalo (có trong DB nhưng chưa có Zalo ID)
        const unlinkedUsers = dbUsers
            .filter((u) => !u.zaloUserId)
            .map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                isActive: u.isActive,
                status: "no_zalo_id",
            }));

        // 6. Summary
        const summary = {
            totalFollowers: allFollowers.length,
            linked: followersWithInfo.filter((f) => f.isLinked).length,
            unlinked: followersWithInfo.filter((f) => !f.isLinked).length,
            totalUsersInDB: dbUsers.length,
            usersWithoutZaloId: unlinkedUsers.length,
        };

        return NextResponse.json({
            success: true,
            summary,
            followers: followersWithInfo,
            unlinkedUsers, // Users trong DB chưa có Zalo ID
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Zalo] Error fetching all followers:", error);
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
 * POST /api/zalo/all-followers
 * Link một Zalo follower với user account trong DB
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only admins
        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { userId, zaloUserId } = body;

        if (!userId || !zaloUserId) {
            return NextResponse.json(
                { error: "Missing userId or zaloUserId" },
                { status: 400 }
            );
        }

        // Update user với Zalo ID
        const [updatedUser] = await db
            .update(users)
            .set({
                zaloUserId: zaloUserId,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        if (!updatedUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        console.log(`[Zalo] Linked user ${userId} with Zalo ID ${zaloUserId}`);

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                zaloUserId: updatedUser.zaloUserId,
            },
            message: "Linked successfully",
        });
    } catch (error) {
        console.error("[Zalo] Error linking follower:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
