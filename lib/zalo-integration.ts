/**
 * Zalo Integration Module
 * Handles Zalo API communication for sending notifications to class groups
 */

import { getZaloTokenManager } from "./zalo-token-manager";

const ZALO_API_BASE = "https://openapi.zalo.me/v3.0";
const ZALO_PHONE_API = "https://graph.zalo.me/v3.0";

interface ZaloConfig {
  accessToken: string;
  oaId: string;
  webhookSignKey?: string;
}

interface ZaloMessage {
  recipient_id: string; // Zalo user ID
  message: {
    text?: string;
    attachment?: {
      type: string;
      payload: any;
    };
  };
}

interface ZaloGroupMessage {
  groupId: string;
  text: string;
  attachment?: any;
}

/**
 * Get Zalo config from environment
 * Tự động lấy valid access token (refresh nếu cần)
 */
async function getZaloConfig(): Promise<ZaloConfig> {
  const tokenManager = getZaloTokenManager();

  // Tự động lấy token hợp lệ (sẽ refresh nếu sắp hết hạn)
  const accessToken = await tokenManager.getValidAccessToken();
  const oaId = process.env.ZALO_OA_ID;
  const webhookSignKey = process.env.ZALO_WEBHOOK_SIGN_KEY;

  if (!accessToken || !oaId) {
    throw new Error(
      "Missing Zalo configuration (ZALO_ACCESS_TOKEN, ZALO_OA_ID)"
    );
  }

  return { accessToken, oaId, webhookSignKey };
}

/**
 * Send message to individual Zalo user
 */
export async function sendZaloMessage(
  zaloUserId: string,
  messageText: string,
  attachment?: any
) {
  try {
    const config = await getZaloConfig();

    const message = {
      recipient: {
        user_id: zaloUserId,
      },
      message: {
        text: messageText,
        ...(attachment && { attachment }),
      },
    };

    // API v3.0 endpoint
    const response = await fetch(
      `https://openapi.zalo.me/v3.0/oa/message/cs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": config.accessToken,
        },
        body: JSON.stringify(message),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error !== 0) {
      console.error("[Zalo] Error sending message:", {
        status: response.status,
        error: result,
      });
      throw new Error(
        `Zalo API error: ${result?.message || response.statusText}`
      );
    }

    console.log("[Zalo] Message sent successfully:", {
      userId: zaloUserId,
      messageId: result?.data?.message_id,
    });

    return result?.data?.message_id;
  } catch (error) {
    console.error("[Zalo] Error in sendZaloMessage:", error);
    throw error;
  }
}

/**
 * Send message to Zalo group
 * Note: Requires OA (Official Account) to have proper permissions
 */
export async function sendZaloGroupMessage(groupId: string, text: string) {
  try {
    const config = await getZaloConfig();

    const message = {
      recipient_id: groupId,
      message_type: 1,
      message: {
        text,
      },
    };

    const response = await fetch(
      `${ZALO_PHONE_API}/me/message?access_token=${config.accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Zalo] Error sending group message:", {
        status: response.status,
        error: errorData,
      });
      throw new Error(
        `Zalo API error: ${errorData?.error?.message || response.statusText}`
      );
    }

    const result = await response.json();
    console.log("[Zalo] Group message sent successfully:", {
      groupId,
      messageId: result?.data?.message_id,
    });

    return result?.data?.message_id;
  } catch (error) {
    console.error("[Zalo] Error in sendZaloGroupMessage:", error);
    throw error;
  }
}

/**
 * Get Zalo user profile (to verify user exists and get phone number if available)
 */
export async function getZaloUserProfile(zaloUserId: string) {
  try {
    const config = await getZaloConfig();

    // API v3.0 endpoint
    const response = await fetch(
      `https://openapi.zalo.me/v3.0/oa/user/detail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": config.accessToken,
        },
        body: JSON.stringify({
          user_id: zaloUserId,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error !== 0) {
      console.warn("[Zalo] User not found or error:", {
        userId: zaloUserId,
        status: response.status,
        error: result,
      });
      return null;
    }

    return result?.data;
  } catch (error) {
    console.error("[Zalo] Error fetching user profile:", error);
    throw error;
  }
}

/**
 * Parse and verify Zalo webhook signature
 * Verify message came from Zalo servers
 */
export async function verifyZaloWebhookSignature(
  body: string,
  signature: string
): Promise<boolean> {
  try {
    const config = await getZaloConfig();
    if (!config.webhookSignKey) {
      console.warn("[Zalo] Webhook signature key not configured");
      return false;
    }

    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha256", config.webhookSignKey)
      .update(body)
      .digest("hex");

    const isValid = hash === signature;
    console.log("[Zalo] Webhook signature verification:", { isValid });

    return isValid;
  } catch (error) {
    console.error("[Zalo] Error verifying webhook signature:", error);
    return false;
  }
}

/**
 * Parse Zalo webhook payload
 */
export function parseZaloWebhook(payload: any) {
  const event = payload?.event;

  switch (event) {
    case "user_send_message":
      return {
        type: "message",
        senderId: payload?.sender_id,
        message: payload?.message?.text,
        timestamp: payload?.timestamp,
      };

    case "user_send_attachment":
      return {
        type: "attachment",
        senderId: payload?.sender_id,
        attachment: payload?.message?.attachment,
        timestamp: payload?.timestamp,
      };

    case "notification_received":
      return {
        type: "notification_received",
        messageId: payload?.message_id,
        timestamp: payload?.timestamp,
      };

    case "notification_read":
      return {
        type: "notification_read",
        messageId: payload?.message_id,
        timestamp: payload?.timestamp,
      };

    default:
      console.log("[Zalo] Unknown webhook event:", event);
      return { type: "unknown", event, payload };
  }
}

/**
 * Format notification template variables for Zalo message
 */
export function formatZaloNotification(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(placeholder, String(value));
  });

  return result;
}

/**
 * Create rich text attachment for Zalo (buttons, links, etc)
 */
export function createZaloAttachment(
  type: "button" | "template" | "card",
  payload: any
) {
  return {
    type: type,
    payload: payload,
  };
}

/**
 * Test Zalo connection
 */
export async function testZaloConnection() {
  try {
    const config = await getZaloConfig();
    console.log("[Zalo] Testing connection with OA:", config.oaId);

    // API v3.0 endpoint to get OA info
    const response = await fetch(
      `https://openapi.zalo.me/v3.0/oa/info`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "access_token": config.accessToken,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("[Zalo] Connection successful:", data);

      // Check if response has error code
      if (data.error === 0) {
        return {
          success: true,
          data: data.data,
          message: "Connected to OA successfully"
        };
      } else {
        return {
          success: false,
          error: data.message || "API returned error",
          errorCode: data.error
        };
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Zalo] Connection failed:", response.status, errorData);
      return {
        success: false,
        status: response.status,
        error: errorData.message || `HTTP ${response.status}`
      };
    }
  } catch (error) {
    console.error("[Zalo] Error testing connection:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * SMART MESSAGE SENDING - Consultation với Promotion Fallback
 * 
 * Luồng xử lý thông minh:
 * 1. Ưu tiên gửi tin dạng Consultation/Text (miễn phí, không trừ quota)
 * 2. Nếu lỗi -213 hoặc -201 (user không tương tác trong 48h)
 * 3. Tự động chuyển sang Promotion (trừ quota, cần attachment_id)
 * 
 * @param zaloUserId - Zalo User ID của người nhận
 * @param textContent - Nội dung tin nhắn dạng text (cho Consultation)
 * @param promotionAttachmentId - Attachment ID (article/banner) cho Promotion message
 * @param accessToken - Optional: Access token (nếu không truyền sẽ tự động lấy)
 * @returns Object chứa kết quả gửi tin
 */
export async function sendSmartZaloMessage(
  zaloUserId: string,
  textContent: string,
  promotionAttachmentId?: string,
  accessToken?: string
): Promise<{
  success: boolean;
  messageId?: string;
  messageType: "consultation" | "promotion";
  usedQuota: boolean;
  error?: string;
  errorCode?: number;
}> {
  try {
    const config = await getZaloConfig();
    const token = accessToken || config.accessToken;

    // BƯỚC 1: Thử gửi tin dạng TƯ VẤN (Consultation/Text) trước
    console.log("[Zalo Smart] Step 1: Attempting Consultation message to", zaloUserId);

    try {
      const consultationPayload = {
        recipient: {
          user_id: zaloUserId,
        },
        message: {
          text: textContent,
        },
      };

      const consultationResponse = await fetch(
        "https://openapi.zalo.me/v3.0/oa/message/cs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "access_token": token,
          },
          body: JSON.stringify(consultationPayload),
        }
      );

      const consultationResult = await consultationResponse.json();

      // Kiểm tra response thành công
      if (consultationResponse.ok && consultationResult.error === 0) {
        console.log("[Zalo Smart] ✅ Consultation message sent successfully!", {
          userId: zaloUserId,
          messageId: consultationResult?.data?.message_id,
        });

        return {
          success: true,
          messageId: consultationResult?.data?.message_id,
          messageType: "consultation",
          usedQuota: false, // Không trừ quota
        };
      }

      // BƯỚC 2: Kiểm tra lỗi liên quan đến 48h rule
      const errorCode = consultationResult.error;
      // Error codes cho 48h/7day rule:
      // -213: User hasn't interacted in 48h (documented)
      // -201: User hasn't followed OA (documented)  
      // -230: User hasn't interacted in 7 days (actual response from Zalo)
      const is48HourError = errorCode === -213 || errorCode === -201 || errorCode === -230;

      console.log("[Zalo Smart] ⚠️ Consultation failed:", {
        errorCode,
        message: consultationResult.message,
        is48HourError,
      });

      if (!is48HourError) {
        // Lỗi khác (không phải 48h), không fallback
        throw new Error(
          `Zalo API error ${errorCode}: ${consultationResult.message}`
        );
      }

      // BƯỚC 3: FALLBACK - Gửi tin TRUYỀN THÔNG (Promotion)
      console.log("[Zalo Smart] Step 2: Falling back to Promotion message...");

      if (!promotionAttachmentId) {
        throw new Error(
          "Promotion message requires attachment_id but none was provided"
        );
      }

      const promotionPayload = {
        recipient: {
          user_id: zaloUserId,
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "promotion",
              elements: [
                {
                  attachment_id: promotionAttachmentId,
                },
              ],
            },
          },
        },
      };

      const promotionResponse = await fetch(
        "https://openapi.zalo.me/v2.0/oa/message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "access_token": token,
          },
          body: JSON.stringify(promotionPayload),
        }
      );

      const promotionResult = await promotionResponse.json();

      if (promotionResponse.ok && promotionResult.error === 0) {
        console.log("[Zalo Smart] ✅ Promotion message sent successfully!", {
          userId: zaloUserId,
          messageId: promotionResult?.data?.message_id,
          quotaUsed: true,
        });

        return {
          success: true,
          messageId: promotionResult?.data?.message_id,
          messageType: "promotion",
          usedQuota: true, // Đã trừ quota
        };
      } else {
        throw new Error(
          `Promotion API error ${promotionResult.error}: ${promotionResult.message}`
        );
      }
    } catch (innerError: any) {
      // Lỗi trong quá trình xử lý
      throw innerError;
    }
  } catch (error: any) {
    console.error("[Zalo Smart] ❌ Error in sendSmartZaloMessage:", error);
    return {
      success: false,
      messageType: "consultation",
      usedQuota: false,
      error: error.message || String(error),
      errorCode: error.errorCode,
    };
  }
}

/**
 * BATCH SMART SEND - Gửi hàng loạt với Smart Logic
 * 
 * Gửi tin nhắn cho nhiều người dùng với logic thông minh
 * Tự động theo dõi quota usage và thống kê
 * 
 * @param recipients - Danh sách user IDs
 * @param textContent - Nội dung text
 * @param promotionAttachmentId - Attachment ID cho Promotion fallback
 * @returns Thống kê chi tiết
 */
export async function batchSmartSend(
  recipients: string[],
  textContent: string,
  promotionAttachmentId?: string
): Promise<{
  total: number;
  success: number;
  failed: number;
  consultationCount: number;
  promotionCount: number;
  quotaUsed: number;
  results: Array<{
    userId: string;
    success: boolean;
    messageType?: "consultation" | "promotion";
    usedQuota?: boolean;
    error?: string;
  }>;
}> {
  const results = [];
  let successCount = 0;
  let failedCount = 0;
  let consultationCount = 0;
  let promotionCount = 0;
  let quotaUsed = 0;

  for (const userId of recipients) {
    try {
      const result = await sendSmartZaloMessage(
        userId,
        textContent,
        promotionAttachmentId
      );

      results.push({
        userId,
        success: result.success,
        messageType: result.messageType,
        usedQuota: result.usedQuota,
        error: result.error,
      });

      if (result.success) {
        successCount++;
        if (result.messageType === "consultation") {
          consultationCount++;
        } else {
          promotionCount++;
          quotaUsed++;
        }
      } else {
        failedCount++;
      }

      // Delay nhỏ để tránh rate limit
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      results.push({
        userId,
        success: false,
        error: String(error),
      });
      failedCount++;
    }
  }

  console.log("[Zalo Batch Smart] Summary:", {
    total: recipients.length,
    success: successCount,
    failed: failedCount,
    consultation: consultationCount,
    promotion: promotionCount,
    quotaUsed,
  });

  return {
    total: recipients.length,
    success: successCount,
    failed: failedCount,
    consultationCount,
    promotionCount,
    quotaUsed,
    results,
  };
}
