/**
 * Zalo Token Manager
 * Tự động quản lý và refresh Zalo access token khi sắp hết hạn
 */

interface TokenData {
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // timestamp
}

class ZaloTokenManager {
    private tokenData: TokenData | null = null;
    private isRefreshing = false;
    private refreshPromise: Promise<string> | null = null;

    constructor() {
        // Khởi tạo với token từ env
        if (process.env.ZALO_ACCESS_TOKEN) {
            this.tokenData = {
                accessToken: process.env.ZALO_ACCESS_TOKEN,
                refreshToken: process.env.ZALO_REFRESH_TOKEN || "",
                // Giả sử token có hiệu lực 24 giờ (Zalo thường cho 86400 giây = 24h)
                expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            };
        }
    }

    /**
     * Lấy access token hợp lệ
     * Tự động refresh nếu token sắp hết hạn (còn dưới 5 phút)
     */
    async getValidAccessToken(): Promise<string> {
        // Nếu chưa có token data, lấy từ env
        if (!this.tokenData) {
            this.tokenData = {
                accessToken: process.env.ZALO_ACCESS_TOKEN || "",
                refreshToken: process.env.ZALO_REFRESH_TOKEN || "",
                expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            };
        }

        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        // Kiểm tra xem token có sắp hết hạn không (còn dưới 5 phút)
        const isExpiringSoon = this.tokenData.expiresAt - now < fiveMinutes;

        if (isExpiringSoon && !this.isRefreshing) {
            console.log("[ZaloTokenManager] Token sắp hết hạn, đang refresh...");
            return this.refreshAccessToken();
        }

        // Nếu đang refresh, đợi refresh hoàn thành
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        return this.tokenData.accessToken;
    }

    /**
     * Refresh access token
     */
    private async refreshAccessToken(): Promise<string> {
        // Nếu đang refresh, trả về promise đang chờ
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;

        this.refreshPromise = (async () => {
            try {
                const appId = process.env.ZALO_APP_ID;
                const appSecret = process.env.ZALO_APP_SECRET;
                const refreshToken = this.tokenData?.refreshToken || process.env.ZALO_REFRESH_TOKEN;

                if (!appId || !appSecret || !refreshToken) {
                    throw new Error("Missing Zalo configuration (APP_ID, APP_SECRET, or REFRESH_TOKEN)");
                }

                console.log("[ZaloTokenManager] Gọi Zalo API để refresh token...");

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

                if (result.error !== 0) {
                    throw new Error(`Zalo refresh token failed: ${result.message || "Unknown error"}`);
                }

                // Cập nhật token data
                this.tokenData = {
                    accessToken: result.access_token,
                    refreshToken: result.refresh_token || refreshToken,
                    expiresAt: Date.now() + (result.expires_in || 86400) * 1000,
                };

                console.log("[ZaloTokenManager] ✅ Token đã được refresh thành công!");
                console.log("[ZaloTokenManager] Token mới sẽ hết hạn lúc:", new Date(this.tokenData.expiresAt).toLocaleString());

                // Log để dev biết cần update .env.local
                console.warn("\n⚠️  LƯU Ý: Token mới đã được tạo. Cần cập nhật .env.local:");
                console.warn(`ZALO_ACCESS_TOKEN=${result.access_token}`);
                if (result.refresh_token) {
                    console.warn(`ZALO_REFRESH_TOKEN=${result.refresh_token}`);
                }
                console.warn("");

                return this.tokenData.accessToken;
            } catch (error) {
                console.error("[ZaloTokenManager] ❌ Lỗi khi refresh token:", error);
                // Nếu refresh thất bại, vẫn trả về token cũ
                return this.tokenData?.accessToken || process.env.ZALO_ACCESS_TOKEN || "";
            } finally {
                this.isRefreshing = false;
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    /**
     * Buộc refresh token ngay lập tức
     */
    async forceRefresh(): Promise<string> {
        return this.refreshAccessToken();
    }

    /**
     * Lấy thông tin về token hiện tại
     */
    getTokenInfo() {
        if (!this.tokenData) {
            return {
                hasToken: false,
                expiresAt: null,
                expiresIn: null,
            };
        }

        const now = Date.now();
        const expiresIn = Math.max(0, this.tokenData.expiresAt - now);

        return {
            hasToken: !!this.tokenData.accessToken,
            expiresAt: new Date(this.tokenData.expiresAt),
            expiresIn: Math.floor(expiresIn / 1000), // giây
            expiresInMinutes: Math.floor(expiresIn / 60000), // phút
        };
    }
}

// Singleton instance
let tokenManager: ZaloTokenManager | null = null;

export function getZaloTokenManager(): ZaloTokenManager {
    if (!tokenManager) {
        tokenManager = new ZaloTokenManager();
    }
    return tokenManager;
}

export default getZaloTokenManager;
