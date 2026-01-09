import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { sendSmartZaloMessage, batchSmartSend } from "@/lib/zalo-integration";

/**
 * POST /api/zalo/smart-send
 * 
 * API endpoint để gửi tin nhắn Zalo với logic thông minh:
 * - Ưu tiên gửi dạng Consultation (miễn phí)
 * - Tự động fallback sang Promotion khi vi phạm luật 48h
 * 
 * Body:
 * {
 *   "mode": "single" | "batch",
 *   "userId": string,              // Zalo User ID (cho mode single)
 *   "userIds": string[],           // Zalo User IDs (cho mode batch)
 *   "textContent": string,         // Nội dung tin nhắn
 *   "promotionAttachmentId": string, // Attachment ID cho Promotion fallback
 *   "accessToken": string          // Optional: Custom access token
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "result": {
 *     "messageId": "xxx",
 *     "messageType": "consultation" | "promotion",
 *     "usedQuota": false | true
 *   }
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Chỉ teacher, TA và admin mới được gửi
        if (!["teacher", "teaching_assistant", "admin"].includes(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const {
            mode = "single",
            userId,
            userIds,
            textContent,
            promotionAttachmentId,
            accessToken,
        } = body;

        // Validate input
        if (!textContent) {
            return NextResponse.json(
                { error: "textContent is required" },
                { status: 400 }
            );
        }

        // Mode: Single user
        if (mode === "single") {
            if (!userId) {
                return NextResponse.json(
                    { error: "userId is required for single mode" },
                    { status: 400 }
                );
            }

            const result = await sendSmartZaloMessage(
                userId,
                textContent,
                promotionAttachmentId,
                accessToken
            );

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    result: {
                        messageId: result.messageId,
                        messageType: result.messageType,
                        usedQuota: result.usedQuota,
                    },
                });
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        error: result.error,
                        errorCode: result.errorCode,
                    },
                    { status: 500 }
                );
            }
        }

        // Mode: Batch
        if (mode === "batch") {
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return NextResponse.json(
                    { error: "userIds array is required for batch mode" },
                    { status: 400 }
                );
            }

            const batchResult = await batchSmartSend(
                userIds,
                textContent,
                promotionAttachmentId
            );

            return NextResponse.json({
                success: true,
                summary: {
                    total: batchResult.total,
                    success: batchResult.success,
                    failed: batchResult.failed,
                    consultationCount: batchResult.consultationCount,
                    promotionCount: batchResult.promotionCount,
                    quotaUsed: batchResult.quotaUsed,
                },
                results: batchResult.results,
            });
        }

        return NextResponse.json(
            { error: "Invalid mode. Use 'single' or 'batch'" },
            { status: 400 }
        );
    } catch (error) {
        console.error("[Zalo Smart Send API] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
