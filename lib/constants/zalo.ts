/**
 * Constants and configuration for Smart Zalo Messaging System
 */

/**
 * Zalo API Endpoints
 */
export const ZALO_ENDPOINTS = {
    /** Consultation message endpoint (v3.0) - FREE */
    CONSULTATION: "https://openapi.zalo.me/v3.0/oa/message/cs",

    /** Promotion message endpoint (v2.0) - PAID (uses quota) */
    PROMOTION: "https://openapi.zalo.me/v2.0/oa/message",

    /** Get OA info */
    OA_INFO: "https://openapi.zalo.me/v3.0/oa/info",

    /** Get user profile */
    USER_PROFILE: "https://openapi.zalo.me/v3.0/oa/user/detail",

    /** Get articles/attachments */
    GET_ARTICLES: "https://openapi.zalo.me/v2.0/oa/article/getslice",

    /** Create article */
    CREATE_ARTICLE: "https://openapi.zalo.me/v2.0/oa/article/create",

    /** Refresh token */
    REFRESH_TOKEN: "https://oauth.zaloapp.com/v4/oa/access_token",
} as const;

/**
 * Zalo Error Codes
 * Reference: https://developers.zalo.me/docs/api/official-account-api/phu-luc/ma-loi-post-3234
 */
export const ZALO_ERROR_CODES = {
    /** User hasn't interacted with OA in 48 hours (documented) */
    NO_INTERACTION_48H: -213,

    /** User hasn't followed the OA (documented) */
    USER_NOT_FOLLOWED: -201,

    /** User hasn't interacted with OA in 7 days (actual API response) */
    NO_INTERACTION_7_DAYS: -230,

    /** Access token has expired */
    TOKEN_EXPIRED: -124,

    /** Monthly quota has been exceeded */
    QUOTA_EXCEEDED: -216,

    /** Invalid recipient user ID */
    INVALID_RECIPIENT: -214,

    /** OA is not authorized for this action */
    OA_NOT_AUTHORIZED: -217,

    /** Invalid parameter */
    INVALID_PARAMETER: -215,

    /** System error */
    SYSTEM_ERROR: -1,

    /** Success */
    SUCCESS: 0,
} as const;

/**
 * Error messages in Vietnamese
 */
export const ZALO_ERROR_MESSAGES: Record<number, string> = {
    [ZALO_ERROR_CODES.NO_INTERACTION_48H]:
        "Người dùng chưa tương tác với OA trong 48 giờ. Hệ thống sẽ tự động thử gửi Promotion.",

    [ZALO_ERROR_CODES.USER_NOT_FOLLOWED]:
        "Người dùng chưa follow OA. Vui lòng yêu cầu người dùng follow trước.",

    [ZALO_ERROR_CODES.NO_INTERACTION_7_DAYS]:
        "Người dùng chưa tương tác với OA trong 7 ngày. Hệ thống sẽ tự động thử gửi Promotion.",

    [ZALO_ERROR_CODES.TOKEN_EXPIRED]:
        "Access token đã hết hạn. Hệ thống sẽ tự động refresh token.",

    [ZALO_ERROR_CODES.QUOTA_EXCEEDED]:
        "Đã hết hạn mức gửi tin (quota). Vui lòng chờ reset hoặc mua thêm gói tin.",

    [ZALO_ERROR_CODES.INVALID_RECIPIENT]:
        "User ID không hợp lệ hoặc không tồn tại.",

    [ZALO_ERROR_CODES.OA_NOT_AUTHORIZED]:
        "OA chưa được cấp quyền thực hiện hành động này.",

    [ZALO_ERROR_CODES.INVALID_PARAMETER]:
        "Tham số không hợp lệ. Vui lòng kiểm tra lại.",

    [ZALO_ERROR_CODES.SYSTEM_ERROR]:
        "Lỗi hệ thống Zalo. Vui lòng thử lại sau.",

    [ZALO_ERROR_CODES.SUCCESS]:
        "Thành công",
};

/**
 * Check if error code is a 48-hour/7-day rule violation
 */
export const is48HourError = (errorCode: number): boolean => {
    return errorCode === ZALO_ERROR_CODES.NO_INTERACTION_48H ||
        errorCode === ZALO_ERROR_CODES.USER_NOT_FOLLOWED ||
        errorCode === ZALO_ERROR_CODES.NO_INTERACTION_7_DAYS;
};

/**
 * Get human-readable error message
 */
export const getErrorMessage = (errorCode: number): string => {
    return ZALO_ERROR_MESSAGES[errorCode] || `Lỗi không xác định (code: ${errorCode})`;
};

/**
 * Quota configuration
 */
export const QUOTA_CONFIG = {
    /** Default monthly limit for paid OA */
    MONTHLY_LIMIT: 2000,

    /** Warning threshold (90%) */
    WARNING_THRESHOLD: 0.9,

    /** Critical threshold (95%) */
    CRITICAL_THRESHOLD: 0.95,

    /** Get warning threshold value */
    getWarningLimit: () => Math.floor(QUOTA_CONFIG.MONTHLY_LIMIT * QUOTA_CONFIG.WARNING_THRESHOLD),

    /** Get critical threshold value */
    getCriticalLimit: () => Math.floor(QUOTA_CONFIG.MONTHLY_LIMIT * QUOTA_CONFIG.CRITICAL_THRESHOLD),
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
    /** Delay between batch messages (ms) */
    BATCH_DELAY_MS: 100,

    /** Maximum concurrent requests */
    MAX_CONCURRENT: 5,

    /** Retry attempts on rate limit */
    MAX_RETRIES: 3,

    /** Retry delay (ms) */
    RETRY_DELAY_MS: 1000,
} as const;

/**
 * Message type configuration
 */
export const MESSAGE_TYPE_CONFIG = {
    CONSULTATION: {
        name: "Consultation",
        displayName: "Tư vấn",
        cost: 0,
        requiresAttachment: false,
        emoji: "🆓",
    },
    PROMOTION: {
        name: "Promotion",
        displayName: "Truyền thông",
        cost: 1,
        requiresAttachment: true,
        emoji: "💸",
    },
} as const;

/**
 * Default messages
 */
export const DEFAULT_MESSAGES = {
    /** Test message */
    TEST: "🧪 Đây là tin nhắn test từ hệ thống",

    /** Class reminder */
    CLASS_REMINDER: (className: string, time: string) =>
        `📢 Nhắc nhở: Lớp ${className} sẽ bắt đầu lúc ${time}`,

    /** Assignment notification */
    ASSIGNMENT: (title: string) =>
        `📚 Bài tập mới: ${title}`,

    /** Attendance notification */
    ATTENDANCE: (status: string) =>
        `📝 Điểm danh: ${status}`,

    /** General notification */
    NOTIFICATION: (title: string, message: string) =>
        `📢 ${title}\n\n${message}`,
} as const;

/**
 * Environment variable keys
 */
export const ENV_KEYS = {
    ACCESS_TOKEN: "ZALO_ACCESS_TOKEN",
    REFRESH_TOKEN: "ZALO_REFRESH_TOKEN",
    OA_ID: "ZALO_OA_ID",
    APP_ID: "ZALO_APP_ID",
    APP_SECRET: "ZALO_APP_SECRET",
    DEFAULT_ATTACHMENT_ID: "ZALO_DEFAULT_ATTACHMENT_ID",
    REMINDER_ATTACHMENT_ID: "ZALO_REMINDER_ATTACHMENT_ID",
    ASSIGNMENT_ATTACHMENT_ID: "ZALO_ASSIGNMENT_ATTACHMENT_ID",
} as const;

/**
 * Validation rules
 */
export const VALIDATION = {
    /** Minimum message length */
    MIN_MESSAGE_LENGTH: 1,

    /** Maximum message length */
    MAX_MESSAGE_LENGTH: 2000,

    /** Zalo User ID pattern (numeric string) */
    USER_ID_PATTERN: /^\d+$/,

    /** Attachment ID pattern */
    ATTACHMENT_ID_PATTERN: /^[a-zA-Z0-9_-]+$/,

    /** Validate user ID */
    isValidUserId: (userId: string): boolean => {
        return VALIDATION.USER_ID_PATTERN.test(userId);
    },

    /** Validate attachment ID */
    isValidAttachmentId: (attachmentId: string): boolean => {
        return VALIDATION.ATTACHMENT_ID_PATTERN.test(attachmentId);
    },

    /** Validate message length */
    isValidMessageLength: (message: string): boolean => {
        return message.length >= VALIDATION.MIN_MESSAGE_LENGTH &&
            message.length <= VALIDATION.MAX_MESSAGE_LENGTH;
    },
} as const;

/**
 * Logging prefixes
 */
export const LOG_PREFIX = {
    SMART_SEND: "[Zalo Smart]",
    BATCH_SEND: "[Zalo Batch]",
    API: "[Zalo API]",
    QUOTA: "[Zalo Quota]",
    ERROR: "[Zalo Error]",
    SUCCESS: "[Zalo Success]",
} as const;

/**
 * Helper function: Check if quota is near limit
 */
export const isQuotaNearLimit = (used: number): boolean => {
    return used >= QUOTA_CONFIG.getWarningLimit();
};

/**
 * Helper function: Check if quota is critical
 */
export const isQuotaCritical = (used: number): boolean => {
    return used >= QUOTA_CONFIG.getCriticalLimit();
};

/**
 * Helper function: Calculate quota percentage
 */
export const calculateQuotaPercentage = (used: number): number => {
    return Math.round((used / QUOTA_CONFIG.MONTHLY_LIMIT) * 100);
};

/**
 * Helper function: Get quota status
 */
export const getQuotaStatus = (
    used: number
): "safe" | "warning" | "critical" | "exceeded" => {
    if (used >= QUOTA_CONFIG.MONTHLY_LIMIT) return "exceeded";
    if (isQuotaCritical(used)) return "critical";
    if (isQuotaNearLimit(used)) return "warning";
    return "safe";
};

/**
 * Helper function: Format quota display
 */
export const formatQuotaDisplay = (used: number): string => {
    const percentage = calculateQuotaPercentage(used);
    const status = getQuotaStatus(used);

    const emoji = {
        safe: "✅",
        warning: "⚠️",
        critical: "🚨",
        exceeded: "❌",
    }[status];

    return `${emoji} ${used}/${QUOTA_CONFIG.MONTHLY_LIMIT} (${percentage}%)`;
};
