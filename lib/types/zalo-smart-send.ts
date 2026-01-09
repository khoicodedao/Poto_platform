/**
 * Type definitions for Smart Zalo Messaging System
 */

/**
 * Zalo message types
 */
export type ZaloMessageType = "consultation" | "promotion";

/**
 * Result of sending a smart Zalo message
 */
export interface SmartZaloMessageResult {
    /** Whether the message was sent successfully */
    success: boolean;

    /** Zalo message ID (if successful) */
    messageId?: string;

    /** Type of message that was sent */
    messageType: ZaloMessageType;

    /** Whether quota was used (true for Promotion, false for Consultation) */
    usedQuota: boolean;

    /** Error message (if failed) */
    error?: string;

    /** Zalo error code (if failed) */
    errorCode?: number;
}

/**
 * Individual result in batch send
 */
export interface BatchSendItemResult {
    /** Zalo User ID */
    userId: string;

    /** Whether the message was sent successfully */
    success: boolean;

    /** Type of message that was sent (if successful) */
    messageType?: ZaloMessageType;

    /** Whether quota was used (if successful) */
    usedQuota?: boolean;

    /** Error message (if failed) */
    error?: string;
}

/**
 * Summary statistics for batch send
 */
export interface BatchSendSummary {
    /** Total number of users */
    total: number;

    /** Number of successful sends */
    success: number;

    /** Number of failed sends */
    failed: number;

    /** Number of messages sent via Consultation (FREE) */
    consultationCount: number;

    /** Number of messages sent via Promotion (PAID) */
    promotionCount: number;

    /** Total quota used */
    quotaUsed: number;
}

/**
 * Result of batch smart send
 */
export interface BatchSmartSendResult {
    /** Summary statistics */
    total: number;
    success: number;
    failed: number;
    consultationCount: number;
    promotionCount: number;
    quotaUsed: number;

    /** Detailed results for each user */
    results: BatchSendItemResult[];
}

/**
 * API request body for smart send endpoint (single mode)
 */
export interface SmartSendSingleRequest {
    /** Mode: single user */
    mode: "single";

    /** Zalo User ID */
    userId: string;

    /** Message text content */
    textContent: string;

    /** Promotion attachment ID (optional) */
    promotionAttachmentId?: string;

    /** Custom access token (optional) */
    accessToken?: string;
}

/**
 * API request body for smart send endpoint (batch mode)
 */
export interface SmartSendBatchRequest {
    /** Mode: batch users */
    mode: "batch";

    /** Array of Zalo User IDs */
    userIds: string[];

    /** Message text content */
    textContent: string;

    /** Promotion attachment ID (optional) */
    promotionAttachmentId?: string;

    /** Custom access token (optional) */
    accessToken?: string;
}

/**
 * Union type for API request body
 */
export type SmartSendRequest = SmartSendSingleRequest | SmartSendBatchRequest;

/**
 * API response for single mode
 */
export interface SmartSendSingleResponse {
    /** Success flag */
    success: boolean;

    /** Result data (if successful) */
    result?: {
        messageId: string;
        messageType: ZaloMessageType;
        usedQuota: boolean;
    };

    /** Error message (if failed) */
    error?: string;

    /** Error code (if failed) */
    errorCode?: number;
}

/**
 * API response for batch mode
 */
export interface SmartSendBatchResponse {
    /** Success flag */
    success: boolean;

    /** Summary statistics */
    summary: BatchSendSummary;

    /** Detailed results for each user */
    results: BatchSendItemResult[];
}

/**
 * Union type for API response
 */
export type SmartSendResponse = SmartSendSingleResponse | SmartSendBatchResponse;

/**
 * Zalo error codes
 */
export enum ZaloErrorCode {
    /** User hasn't interacted in 48h */
    NO_INTERACTION_48H = -213,

    /** User hasn't followed OA */
    USER_NOT_FOLLOWED = -201,

    /** Access token expired */
    TOKEN_EXPIRED = -124,

    /** Quota exceeded */
    QUOTA_EXCEEDED = -216,

    /** Invalid recipient */
    INVALID_RECIPIENT = -214,

    /** OA not authorized */
    OA_NOT_AUTHORIZED = -217,
}

/**
 * Quota tracking log entry
 */
export interface ZaloQuotaLog {
    id: number;
    messageId: string | null;
    userId: string;
    messageType: ZaloMessageType;
    usedQuota: boolean;
    createdAt: Date;
}

/**
 * Quota statistics
 */
export interface QuotaStats {
    /** Current month */
    month: string;

    /** Total messages sent */
    totalMessages: number;

    /** Consultation messages (FREE) */
    consultationCount: number;

    /** Promotion messages (PAID) */
    promotionCount: number;

    /** Total quota used */
    quotaUsed: number;

    /** Quota limit */
    quotaLimit: number;

    /** Percentage used */
    percentageUsed: number;
}

/**
 * Helper type guards
 */
export const isSmartSendSingleRequest = (
    req: SmartSendRequest
): req is SmartSendSingleRequest => {
    return req.mode === "single";
};

export const isSmartSendBatchRequest = (
    req: SmartSendRequest
): req is SmartSendBatchRequest => {
    return req.mode === "batch";
};

/**
 * Constants
 */
export const ZALO_QUOTA_LIMIT = 2000; // Default monthly limit
export const ZALO_QUOTA_WARNING_THRESHOLD = 0.9; // 90%

/**
 * Helper functions
 */
export const isQuotaNearLimit = (used: number, limit: number = ZALO_QUOTA_LIMIT): boolean => {
    return used >= limit * ZALO_QUOTA_WARNING_THRESHOLD;
};

export const calculateQuotaPercentage = (
    used: number,
    limit: number = ZALO_QUOTA_LIMIT
): number => {
    return Math.round((used / limit) * 100);
};
