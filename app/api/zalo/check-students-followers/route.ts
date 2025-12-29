import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users, classes, classEnrollments } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";

/**
 * GET /api/zalo/check-students-followers
 * Check which students in a class have followed the OA
 * Returns list of students with their follow status
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

        const searchParams = req.nextUrl.searchParams;
        const classId = searchParams.get("classId");

        if (!classId) {
            return NextResponse.json(
                { error: "classId is required" },
                { status: 400 }
            );
        }

        const accessToken = process.env.ZALO_ACCESS_TOKEN;

        if (!accessToken) {
            return NextResponse.json(
                { error: "Missing Zalo configuration" },
                { status: 500 }
            );
        }

        // Get all students in the class
        const enrollments = await db
            .select({
                studentId: classEnrollments.studentId,
                studentName: users.name,
                studentEmail: users.email,
                zaloUserId: users.zaloUserId,
            })
            .from(classEnrollments)
            .innerJoin(users, eq(users.id, classEnrollments.studentId))
            .where(eq(classEnrollments.classId, parseInt(classId)));

        if (enrollments.length === 0) {
            return NextResponse.json({
                success: true,
                total: 0,
                students: [],
                summary: {
                    total: 0,
                    connected: 0,
                    notConnected: 0,
                    following: 0,
                    notFollowing: 0,
                },
            });
        }

        // Get all followers from Zalo OA
        let allFollowers: string[] = [];
        let offset = 0;
        const batchSize = 50;
        let hasMore = true;

        // Fetch all followers (paginated)
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
                console.warn("[Zalo] Failed to fetch followers batch:", offset);
                break;
            }

            const result = await response.json();

            if (result.error !== 0 || !result.data?.followers) {
                break;
            }

            const followerIds = result.data.followers.map(
                (f: any) => f.user_id
            );
            allFollowers = [...allFollowers, ...followerIds];

            // Check if there are more followers
            if (result.data.count < batchSize) {
                hasMore = false;
            } else {
                offset += batchSize;
            }

            // Safety limit: max 1000 followers per request
            if (offset >= 1000) {
                hasMore = false;
            }
        }

        // Match students with followers
        const studentsStatus = enrollments.map((student) => {
            const hasZaloId = !!student.zaloUserId;
            const isFollowing = hasZaloId
                ? allFollowers.includes(student.zaloUserId!)
                : false;

            return {
                id: student.studentId,
                name: student.studentName,
                email: student.studentEmail,
                zaloUserId: student.zaloUserId,
                hasConnected: hasZaloId,
                isFollowing: isFollowing,
                status: !hasZaloId
                    ? "not_connected"
                    : isFollowing
                        ? "following"
                        : "not_following",
            };
        });

        // Calculate summary
        const summary = {
            total: studentsStatus.length,
            connected: studentsStatus.filter((s) => s.hasConnected).length,
            notConnected: studentsStatus.filter((s) => !s.hasConnected).length,
            following: studentsStatus.filter((s) => s.isFollowing).length,
            notFollowing: studentsStatus.filter(
                (s) => s.hasConnected && !s.isFollowing
            ).length,
        };

        return NextResponse.json({
            success: true,
            total: studentsStatus.length,
            students: studentsStatus,
            summary,
            totalFollowers: allFollowers.length,
        });
    } catch (error) {
        console.error("[Zalo] Error checking students followers:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
