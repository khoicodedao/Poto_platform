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
