import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/zalo/refresh-token
 * Refresh Zalo Access Token using Refresh Token
 */
export async function POST(req: NextRequest) {
    try {
        const appId = process.env.ZALO_APP_ID;
        const appSecret = process.env.ZALO_APP_SECRET;
        const refreshToken = process.env.ZALO_REFRESH_TOKEN;

        if (!appId || !appSecret || !refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing Zalo configuration (APP_ID, APP_SECRET, or REFRESH_TOKEN)",
                },
                { status: 500 }
            );
        }

        console.log("[Zalo] Refreshing access token...");

        // Call Zalo OAuth API to refresh token
        const response = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "secret_key": appSecret,
            },
            body: new URLSearchParams({
                app_id: appId,
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        });

        const result = await response.json();

        console.log("[Zalo] Refresh token response:", {
            status: response.status,
            error: result.error,
            message: result.message,
        });

        if (result.error !== 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.message || "Failed to refresh token",
                    errorCode: result.error,
                    details: result,
                },
                { status: 400 }
            );
        }

        // Success - return new tokens
        return NextResponse.json({
            success: true,
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            expiresIn: result.expires_in,
            message: "✅ Token refreshed successfully! Update .env.local with new tokens.",
            instructions: {
                step1: "Copy the new access_token below",
                step2: "Update ZALO_ACCESS_TOKEN in .env.local",
                step3: "Update ZALO_REFRESH_TOKEN in .env.local (if provided)",
                step4: "Restart the server",
            },
        });
    } catch (error) {
        console.error("[Zalo] Error refreshing token:", error);
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
 * GET /api/zalo/refresh-token
 * Check current token status
 */
export async function GET(req: NextRequest) {
    const hasRefreshToken = !!process.env.ZALO_REFRESH_TOKEN;
    const hasAccessToken = !!process.env.ZALO_ACCESS_TOKEN;
    const hasAppId = !!process.env.ZALO_APP_ID;
    const hasAppSecret = !!process.env.ZALO_APP_SECRET;

    return NextResponse.json({
        configured: hasRefreshToken && hasAccessToken && hasAppId && hasAppSecret,
        hasRefreshToken,
        hasAccessToken,
        hasAppId,
        hasAppSecret,
        message: hasRefreshToken
            ? "✅ Refresh token configured. Use POST to refresh access token."
            : "❌ Refresh token not configured in .env.local",
    });
}
