import { NextRequest, NextResponse } from "next/server";
import { sendZaloMessage } from "@/lib/zalo-integration";

/**
 * POST /api/zalo/test-send
 * Test gửi tin nhắn Zalo đến một Zalo User ID cụ thể
 * Không cần auth - để test nhanh
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { zaloUserId, message } = body;

        if (!zaloUserId) {
            return NextResponse.json(
                { error: "zaloUserId is required" },
                { status: 400 }
            );
        }

        const messageText = message || "🧪 Test message từ Poto Platform!\n\nNếu bạn nhận được tin nhắn này, hệ thống Zalo đang hoạt động tốt! ✅";

        console.log("[Zalo Test] Sending test message to:", zaloUserId);

        const messageId = await sendZaloMessage(zaloUserId, messageText);

        console.log("[Zalo Test] Message sent successfully:", messageId);

        return NextResponse.json({
            success: true,
            messageId,
            sentTo: zaloUserId,
            message: messageText,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Zalo Test] Error sending message:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
