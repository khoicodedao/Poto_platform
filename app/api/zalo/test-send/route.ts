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

        // Parse error message for better user feedback
        const errorString = String(error);
        let userMessage = "Không thể gửi tin nhắn";
        let errorCode = "UNKNOWN";

        if (errorString.includes("Invalid token") || errorString.includes("-216")) {
            userMessage = "Access token không hợp lệ hoặc đã hết hạn. Vui lòng refresh token.";
            errorCode = "INVALID_TOKEN";
        } else if (errorString.includes("User not found") || errorString.includes("-214")) {
            userMessage = "Không tìm thấy người dùng với Zalo ID này.";
            errorCode = "USER_NOT_FOUND";
        } else if (errorString.includes("User is not follower") || errorString.includes("-213")) {
            userMessage = "Người dùng chưa follow OA hoặc đã unfollow.";
            errorCode = "NOT_FOLLOWER";
        } else if (errorString.includes("7-day") || errorString.includes("interaction")) {
            userMessage = "Không thể gửi tin. Người dùng chưa tương tác với OA trong 7 ngày qua (7-day rule).";
            errorCode = "SEVEN_DAY_RULE";
        } else if (errorString.includes("Rate limit") || errorString.includes("-124")) {
            userMessage = "Đã vượt quá giới hạn số tin nhắn. Vui lòng thử lại sau.";
            errorCode = "RATE_LIMIT";
        } else if (errorString.includes("Quota exceeded")) {
            userMessage = "Đã hết quota tin nhắn hôm nay. Vui lòng thử lại vào ngày mai.";
            errorCode = "QUOTA_EXCEEDED";
        }

        return NextResponse.json(
            {
                success: false,
                error: userMessage,
                errorCode,
                technicalError: errorString,
            },
            { status: 500 }
        );
    }
}
