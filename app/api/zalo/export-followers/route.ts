import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users, classes, classEnrollments } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import * as XLSX from "xlsx";

/**
 * GET /api/zalo/export-followers?classId=X
 * Export danh sách students và followers ra Excel
 * Bao gồm: Name, Email, Zalo ID, Follow Status, Class
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
        const exportAll = searchParams.get("all") === "true"; // Export all classes

        const accessToken = process.env.ZALO_ACCESS_TOKEN;

        if (!accessToken) {
            return NextResponse.json(
                { error: "Missing Zalo configuration" },
                { status: 500 }
            );
        }

        // Get all followers from Zalo OA
        let allFollowers: string[] = [];
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

            const followerIds = result.data.followers.map((f: any) => f.user_id);
            allFollowers = [...allFollowers, ...followerIds];

            if (result.data.count < batchSize) {
                hasMore = false;
            } else {
                offset += batchSize;
            }

            if (offset >= 1000) hasMore = false;
        }

        // Get students data
        let students;

        if (classId && !exportAll) {
            // Query với filter theo class
            students = await db
                .select({
                    studentId: users.id,
                    studentName: users.name,
                    studentEmail: users.email,
                    zaloUserId: users.zaloUserId,
                    classId: classes.id,
                    className: classes.name,
                })
                .from(users)
                .leftJoin(classEnrollments, eq(users.id, classEnrollments.studentId))
                .leftJoin(classes, eq(classEnrollments.classId, classes.id))
                .where(eq(users.role, "student"));

            // Filter by classId after join
            students = students.filter(s => s.classId === parseInt(classId));
        } else {
            // Query tất cả students
            students = await db
                .select({
                    studentId: users.id,
                    studentName: users.name,
                    studentEmail: users.email,
                    zaloUserId: users.zaloUserId,
                    classId: classes.id,
                    className: classes.name,
                })
                .from(users)
                .leftJoin(classEnrollments, eq(users.id, classEnrollments.studentId))
                .leftJoin(classes, eq(classEnrollments.classId, classes.id))
                .where(eq(users.role, "student"));
        }

        // Prepare Excel data
        const excelData = students.map((student) => {
            const hasZaloId = !!student.zaloUserId;
            const isFollowing = hasZaloId && allFollowers.includes(student.zaloUserId!);

            return {
                "Tên học viên": student.studentName,
                "Email": student.studentEmail,
                "Lớp": student.className || "Chưa có lớp",
                "Zalo User ID": student.zaloUserId || "",
                "Đã kết nối Zalo": hasZaloId ? "Có" : "Chưa",
                "Đã follow OA": isFollowing ? "✓ Có" : hasZaloId ? "✗ Chưa" : "N/A",
                "Trạng thái": !hasZaloId
                    ? "Chưa kết nối"
                    : isFollowing
                        ? "Sẵn sàng nhận tin"
                        : "Đã kết nối nhưng chưa follow",
            };
        });

        // Add summary row
        const summary = {
            "Tên học viên": "=== TỔNG HỢP ===",
            "Email": "",
            "Lớp": `Tổng: ${students.length} học viên`,
            "Zalo User ID": `Đã kết nối: ${students.filter(s => s.zaloUserId).length}`,
            "Đã kết nối Zalo": `Đã follow: ${students.filter(s => s.zaloUserId && allFollowers.includes(s.zaloUserId)).length}`,
            "Đã follow OA": `Tổng followers OA: ${allFollowers.length}`,
            "Trạng thái": new Date().toLocaleString("vi-VN"),
        };

        excelData.push({} as any); // Empty row
        excelData.push(summary as any);

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws["!cols"] = [
            { wch: 25 }, // Name
            { wch: 30 }, // Email
            { wch: 20 }, // Class
            { wch: 30 }, // Zalo ID
            { wch: 18 }, // Connected
            { wch: 15 }, // Following
            { wch: 30 }, // Status
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Danh sách");

        // Generate buffer
        const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        // Set filename
        const filename = classId
            ? `zalo-students-class-${classId}-${Date.now()}.xlsx`
            : `zalo-all-students-${Date.now()}.xlsx`;

        // Return file
        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("[Zalo] Error exporting followers:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
