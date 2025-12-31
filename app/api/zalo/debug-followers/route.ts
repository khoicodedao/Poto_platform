import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/zalo/debug-followers
 * Debug endpoint để test API getfollowers và xem response thực tế
 * Không cần auth - để debug
 */
export async function GET(req: NextRequest) {
    try {
        const accessToken = process.env.ZALO_ACCESS_TOKEN;
        const oaId = process.env.ZALO_OA_ID;

        if (!accessToken || !oaId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing Zalo configuration",
                    config: {
                        hasAccessToken: !!accessToken,
                        hasOaId: !!oaId,
                    },
                },
                { status: 500 }
            );
        }

        console.log("[Zalo Debug] Testing getfollowers API...");
        console.log("[Zalo Debug] OA ID:", oaId);

        // API v3.0 - Get user list with is_follower filter
        const params = {
            offset: 0,
            count: 10,
            is_follower: true,
        };

        const testUrl = `https://openapi.zalo.me/v3.0/oa/user/getlist?data=${encodeURIComponent(JSON.stringify(params))}`;

        console.log("[Zalo Debug] Request URL (v3.0):", testUrl);

        const response = await fetch(testUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "access_token": accessToken,
            },
        });

        const responseText = await response.text();
        let result;

        try {
            result = JSON.parse(responseText);
        } catch (e) {
            result = { raw: responseText };
        }

        console.log("[Zalo Debug] Response status:", response.status);
        console.log("[Zalo Debug] Response body:", result);

        // Phân tích kết quả (v3.0 API structure)
        const analysis = {
            httpStatus: response.status,
            httpStatusText: response.statusText,
            apiError: result.error,
            apiMessage: result.message,
            hasData: !!result.data,
            users: result.data?.users || [],  // v3.0 uses "users" instead of "followers"
            totalUsers: result.data?.total || 0,
            count: result.data?.count || 0,
            offset: result.data?.offset || 0,
        };

        // Kiểm tra error codes
        let interpretation = "";
        let canUseApi = false;

        if (result.error === 0) {
            interpretation = "✅ API hoạt động tốt! Bạn có thể lấy danh sách followers.";
            canUseApi = true;
        } else if (result.error === -224) {
            interpretation =
                "❌ FREE OA không có quyền dùng API này. Cần upgrade lên Premium OA.";
            canUseApi = false;
        } else if (result.error === -216) {
            interpretation = "❌ Access token không hợp lệ hoặc đã hết hạn.";
            canUseApi = false;
        } else if (result.error === -209) {
            interpretation = "❌ App chưa được approve bởi OA admin.";
            canUseApi = false;
        } else if (result.error) {
            interpretation = `❌ API error: ${result.error} - ${result.message}`;
            canUseApi = false;
        }

        return NextResponse.json({
            success: canUseApi,
            canUseFollowersApi: canUseApi,
            interpretation,
            analysis,
            rawResponse: result,
            timestamp: new Date().toISOString(),
            documentation:
                "https://developers.zalo.me/docs/api/official-account-api/api/lay-danh-sach-nguoi-quan-tam-oa-post-4023",
        });
    } catch (error) {
        console.error("[Zalo Debug] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
                stack: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
