import { NextRequest, NextResponse } from "next/server";
import { getZaloTokenManager } from "@/lib/zalo-token-manager";

/**
 * GET /api/zalo/token-status
 * Kiểm tra trạng thái token hiện tại
 */
export async function GET(req: NextRequest) {
    try {
        const tokenManager = getZaloTokenManager();
        const tokenInfo = tokenManager.getTokenInfo();

        return NextResponse.json({
            success: true,
            tokenInfo: {
                hasToken: tokenInfo.hasToken,
                expiresAt: tokenInfo.expiresAt,
                expiresInSeconds: tokenInfo.expiresIn,
                expiresInMinutes: tokenInfo.expiresInMinutes,
                expiresInHours: Math.floor(tokenInfo.expiresIn! / 3600),
            },
            message: tokenInfo.hasToken
                ? `✅ Token hợp lệ, còn ${tokenInfo.expiresInMinutes} phút`
                : "❌ Chưa có token",
        });
    } catch (error) {
        console.error("[Zalo] Error getting token status:", error);
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
 * POST /api/zalo/token-status
 * Force refresh token ngay lập tức
 */
export async function POST(req: NextRequest) {
    try {
        const tokenManager = getZaloTokenManager();
        const newToken = await tokenManager.forceRefresh();

        return NextResponse.json({
            success: true,
            message: "✅ Token đã được refresh thành công!",
            accessToken: newToken.substring(0, 30) + "...",
            instructions: {
                step1: "Token đã được cập nhật trong memory",
                step2: "Kiểm tra console logs để lấy token mới",
                step3: "Cập nhật .env.local với token mới để sử dụng sau khi restart",
                note: "Token sẽ tự động refresh khi còn dưới 5 phút",
            },
        });
    } catch (error) {
        console.error("[Zalo] Error forcing refresh:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
