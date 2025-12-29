import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth Callback Handler for Zalo OA
 * This endpoint receives the authorization code after admin grants permission
 * 
 * Flow:
 * 1. Admin clicks authorization URL
 * 2. Zalo redirects here with code
 * 3. Exchange code for access_token
 * 4. Save token to database or env
 */

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const code = searchParams.get("code");
        const oaId = searchParams.get("oa_id");
        const error = searchParams.get("error");

        // Handle error from Zalo
        if (error) {
            console.error("[Zalo OAuth] Authorization error:", error);
            return NextResponse.json(
                {
                    success: false,
                    error: "User denied permission or authorization failed",
                    details: error,
                },
                { status: 400 }
            );
        }

        // Validate code
        if (!code) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No authorization code received",
                },
                { status: 400 }
            );
        }

        console.log("[Zalo OAuth] Received authorization code:", {
            code: code.substring(0, 10) + "...",
            oaId,
        });

        // Exchange code for access token
        const appId = process.env.ZALO_APP_ID;
        const appSecret = process.env.ZALO_APP_SECRET;

        if (!appId || !appSecret) {
            throw new Error("Missing ZALO_APP_ID or ZALO_APP_SECRET");
        }

        const tokenResponse = await fetch(
            "https://oauth.zaloapp.com/v4/oa/access_token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    app_id: appId,
                    code: code,
                    grant_type: "authorization_code",
                }),
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || tokenData.error) {
            console.error("[Zalo OAuth] Token exchange failed:", tokenData);
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to exchange code for token",
                    details: tokenData,
                },
                { status: 500 }
            );
        }

        const { access_token, refresh_token, expires_in } = tokenData;

        console.log("[Zalo OAuth] Successfully obtained tokens:", {
            hasAccessToken: !!access_token,
            hasRefreshToken: !!refresh_token,
            expiresIn: expires_in,
        });

        // TODO: Save tokens to database
        // For now, we'll just display them for manual update

        // Return success page with tokens
        return new NextResponse(
            `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Zalo OA Authorization Success</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .success {
              color: #22c55e;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .token-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 4px;
              margin: 10px 0;
              word-break: break-all;
              font-family: monospace;
              font-size: 12px;
            }
            .label {
              font-weight: bold;
              color: #666;
              margin-bottom: 5px;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffc107;
              padding: 15px;
              border-radius: 4px;
              margin-top: 20px;
            }
            button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 10px;
            }
            button:hover {
              background: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ Authorization Successful!</div>
            <p>Zalo OA has been authorized successfully. Copy the tokens below:</p>
            
            <div class="label">Access Token:</div>
            <div class="token-box" id="accessToken">${access_token}</div>
            <button onclick="copyToken('accessToken')">Copy Access Token</button>
            
            ${refresh_token
                ? `
              <div class="label" style="margin-top: 20px;">Refresh Token:</div>
              <div class="token-box" id="refreshToken">${refresh_token}</div>
              <button onclick="copyToken('refreshToken')">Copy Refresh Token</button>
            `
                : ""
            }
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ol>
                <li>Copy the Access Token above</li>
                <li>Add it to your <code>.env.local</code> file:
                  <pre style="margin-top: 10px;">ZALO_ACCESS_TOKEN=${access_token.substring(0, 30)}...</pre>
                </li>
                <li>Restart your dev server</li>
                <li>Token expires in: ${expires_in} seconds (${Math.floor(expires_in / 86400)} days)</li>
              </ol>
            </div>
          </div>
          
          <script>
            function copyToken(elementId) {
              const element = document.getElementById(elementId);
              const text = element.textContent;
              navigator.clipboard.writeText(text).then(() => {
                alert('Token copied to clipboard!');
              });
            }
          </script>
        </body>
      </html>
      `,
            {
                status: 200,
                headers: {
                    "Content-Type": "text/html",
                },
            }
        );
    } catch (error) {
        console.error("[Zalo OAuth] Error processing callback:", error);
        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
