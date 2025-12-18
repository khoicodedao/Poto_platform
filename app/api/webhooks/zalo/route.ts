import { NextRequest, NextResponse } from "next/server";
import {
  verifyZaloWebhookSignature,
  parseZaloWebhook,
} from "@/lib/zalo-integration";

/**
 * Zalo Webhook Handler
 * Receives events from Zalo (message read, delivery confirmation, etc)
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-zalo-signature") || "";

    // Verify webhook signature
    if (
      process.env.ZALO_WEBHOOK_SIGN_KEY &&
      !verifyZaloWebhookSignature(body, signature)
    ) {
      console.warn("[Webhook] Invalid Zalo webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    console.log("[Webhook] Received Zalo webhook:", {
      event: payload?.event,
      timestamp: new Date().toISOString(),
    });

    const parsed = parseZaloWebhook(payload);

    // Handle different event types
    switch (parsed.type) {
      case "notification_received":
        // Message delivered to user
        console.log("[Webhook] Message delivered:", {
          messageId: parsed.messageId,
        });
        // TODO: Update notification status to 'delivered' in DB
        break;

      case "notification_read":
        // Message read by user
        console.log("[Webhook] Message read:", {
          messageId: parsed.messageId,
        });
        // TODO: Mark notification as read in DB
        break;

      case "message":
        // User sent message back to OA
        console.log("[Webhook] User message received:", {
          senderId: parsed.senderId,
          message: parsed.message,
        });
        // TODO: Handle user reply if needed
        break;

      case "attachment":
        // User sent attachment
        console.log("[Webhook] User attachment received:", {
          senderId: parsed.senderId,
        });
        break;

      default:
        console.log("[Webhook] Unknown event type:", parsed.type);
    }

    // Always return 200 to acknowledge webhook receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error processing Zalo webhook:", error);
    // Still return 200 to prevent Zalo from retrying
    return NextResponse.json({ success: true });
  }
}

/**
 * GET handler for webhook verification
 * Zalo sends a GET request with verify_token for setup
 */
export async function GET(req: NextRequest) {
  try {
    const verifyToken = req.nextUrl.searchParams.get("verify_token");
    const configuredToken = process.env.ZALO_WEBHOOK_VERIFY_TOKEN;

    console.log("[Webhook] Verification request received");

    if (verifyToken === configuredToken) {
      console.log("[Webhook] Verification successful");
      return NextResponse.json(
        { success: true },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.warn("[Webhook] Verification failed - invalid token");
    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    console.error("[Webhook] Error in webhook verification:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
