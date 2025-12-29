import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";

/**
 * POST /api/zalo/bulk-update-ids
 * Bulk update Zalo User IDs cho nhiều students
 * 
 * Body: FormData with Excel file
 * Excel format: email, zaloUserId
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only admins can bulk update
        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Read file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Parse Excel
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (data.length === 0) {
            return NextResponse.json(
                { error: "File is empty" },
                { status: 400 }
            );
        }

        // Process each row
        const results = {
            success: 0,
            failed: 0,
            skipped: 0,
            details: [] as any[],
        };

        for (const row of data) {
            const email = row.email || row.Email || row["Email"];
            const zaloUserId = row.zaloUserId || row.zalo_user_id || row["Zalo User ID"] || row["Zalo ID"];

            // Skip if missing data
            if (!email || !zaloUserId) {
                results.skipped++;
                results.details.push({
                    email: email || "N/A",
                    status: "skipped",
                    reason: "Missing email or Zalo ID",
                });
                continue;
            }

            // Trim and clean data
            const cleanEmail = String(email).trim().toLowerCase();
            const cleanZaloId = String(zaloUserId).trim();

            try {
                // Find user by email
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, cleanEmail))
                    .limit(1);

                if (!user) {
                    results.failed++;
                    results.details.push({
                        email: cleanEmail,
                        status: "failed",
                        reason: "User not found",
                    });
                    continue;
                }

                // Update Zalo ID
                await db
                    .update(users)
                    .set({
                        zaloUserId: cleanZaloId,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, user.id));

                results.success++;
                results.details.push({
                    email: cleanEmail,
                    name: user.name,
                    status: "success",
                    zaloUserId: cleanZaloId,
                });
            } catch (error) {
                results.failed++;
                results.details.push({
                    email: cleanEmail,
                    status: "failed",
                    reason: String(error),
                });
            }
        }

        console.log("[Zalo] Bulk update completed:", results);

        return NextResponse.json({
            success: true,
            summary: {
                total: data.length,
                success: results.success,
                failed: results.failed,
                skipped: results.skipped,
            },
            details: results.details,
        });
    } catch (error) {
        console.error("[Zalo] Error in bulk update:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
