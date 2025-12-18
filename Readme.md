# Online Learning Platform

This repository contains an online learning platform with a Next.js frontend (App Router) and server-side API routes plus a small signaling server. The project uses TypeScript, Tailwind CSS, Drizzle ORM and PostgreSQL for persistence.

## Quick Start

- Install dependencies:

  ```bash
  pnpm install
  ```

- Run development frontend:

  ```bash
  pnpm dev
  ```

- Local LiveKit (optional, self-host):

  ```bash
  docker run --rm --name livekit -p 7880:7880 -p 7881:7881/tcp -p 7882:7882/udp livekit/livekit-server --dev --bind 0.0.0.0
  ```

## Environment variables

- `DATABASE_URL` - PostgreSQL connection string used by Drizzle.
- `LIVEKIT_URL` - WebSocket URL to LiveKit server (e.g. `ws://localhost:7880` for self-hosted or cloud URL)
- `LIVEKIT_API_KEY` - LiveKit API key for token generation
- `LIVEKIT_API_SECRET` - LiveKit API secret for token generation
- `NEXT_PUBLIC_...` - any public client env variables for Next.js.
- `NEXT_PUBLIC_SIGNALING_SERVER` - (optional) custom WebRTC signaling server URL

See `.env.example` for a template.

## Cấu trúc dự án

```
.
├─ app/
│  ├─ api/                # API routes Next.js (auth, lớp học, LiveKit token, ...)
│  ├─ assignments/        # Trang CRUD bài tập, upload bài làm
│  ├─ classes/ & classroom# Lớp học, phòng học live, UI điều khiển video/live stream
│  ├─ files/              # Trang quản lý file, download
│  ├─ auth/, unauthorized/# Trang đăng nhập & trang cấm truy cập
│  ├─ layout.tsx, page.tsx, globals.css
├─ components/
│  ├─ ui/                 # Bộ UI (button, input, dialog, ...)
│  ├─ assignments/, files/# Widget chuyên biệt cho từng module
│  ├─ top-nav.tsx, user-menu.tsx, video-*.tsx, auth-guard.tsx
├─ db/                    # Kết nối Drizzle và schema (schema.ts, index.ts, seed.ts)
├─ drizzle/               # Output migrations do drizzle-kit sinh ra
├─ lib/
│  ├─ actions/            # Server actions: lớp học, bài tập, file, LiveKit token
│  ├─ auth/, validators/  # Helper auth, schema Zod, util chung
│  ├─ uploadthing.ts, livekit.ts, utils.ts
├─ hooks/                 # Custom React hooks (LiveKit, WebRTC, session)
├─ server/                # Signaling server cho WebRTC (`signaling-server.js`)
├─ public/                # Static assets (logo, icons)
├─ styles/                # Tailwind layer bổ sung
├─ config files           # tailwind.config.ts, drizzle.config.ts, tsconfig.json, ...
```

- `app/` chứa toàn bộ UI App Router và API routes; mọi request phía client đi vào `app/api/**` trước khi xuống tầng hành động.
- `lib/` + `db/` là tầng domain: `db/index.ts` khởi tạo client Postgres (Drizzle), `lib/actions/*` ghép schema + logic nghiệp vụ.
- `components/` và `hooks/` gom phần tái sử dụng ở client (UI + state/video hooks) để tránh logic lặp lại giữa trang lớp, bài tập, file.
- `server/` hoạt động tách biệt khỏi Next.js, khởi chạy bằng Node để hỗ trợ signaling WebRTC khi cần.
- Toàn bộ cấu hình build/lint (Tailwind, PostCSS, Drizzle, TS) đặt ở root để dễ chạy trên CI hoặc các script npm.

## Web (Frontend)

- Built with Next.js (app directory) and TypeScript. UI uses Tailwind and a custom UI library in `components/ui/`.
- Server-side API routes live under `app/api/*` — these are Next.js serverless routes that perform authentication, file uploads, class/assignment endpoints, and LiveKit token generation.
- Client-side code calls these API routes (fetch) or uses `lib/api-client.ts` to communicate with backend logic.

## Backend (BE) and Signaling

- There are two backend parts:
  - Next.js API routes (serverless functions) inside `app/api` that handle most business logic (auth, classes, files, chat, LiveKit token generation).
  - A small signaling server in `server/signaling-server.js` used for custom WebRTC signaling if required by the app.

## Database and Data Flow

1. Schema and ORM

   - Database schema is defined in `db/schema.ts` using Drizzle.
   - `drizzle.config.ts` configures Drizzle and uses `DATABASE_URL` (dialect: `postgresql`).

2. Run / Migrate / Seed

   - Generate migrations / run Drizzle commands according to `drizzle-kit` usage. The repo contains `drizzle/` output and an initial seed at `db/seed.ts`.

3. Typical request flow (high level)

   - Frontend user action -> Next.js page or client -> calls `app/api/*` endpoint (e.g., `/api/classes/route`).
   - API route handler (server-side) uses functions in `lib/actions/*` to perform business operations.
   - Those action functions use the Drizzle client from `db/index.ts` to run SQL queries against PostgreSQL via `DATABASE_URL`.
   - Results returned to the API route -> response sent back to frontend.

4. Real-time / media
   - For real-time audio/video the app uses LiveKit. Frontend requests a token from the API route (`app/api/livekit-token/route.ts`) which signs a token using server-side credentials.
   - Media connection goes directly between clients and LiveKit (or through the self-hosted LiveKit instance if running locally). Signaling server (`server/signaling-server.js`) is available for custom WebRTC signaling flows.

## Important Files

- `db/schema.ts` — Drizzle schema definitions.
- `db/index.ts` — Database client bootstrap.
- `drizzle.config.ts` — Drizzle config (uses `DATABASE_URL`).
- `app/api/*` — Next.js API endpoints.
- `lib/actions/*` — Server-side business logic wrappers used by API routes.
- `server/signaling-server.js` — optional signaling server for WebRTC.

## Notes & Next Steps

- To run the full stack locally you need a PostgreSQL instance and set `DATABASE_URL` accordingly.
- If you want, I can add sample `.env.example`, migration/run scripts, or a simple architecture diagram (ASCII or image) showing the flow from browser → API → DB → LiveKit.

## Troubleshooting LiveKit

**Error: "could not establish pc connection"**

- This means the peer connection (WebRTC) failed. Usually caused by:
  1. LiveKit server not reachable/not running
  2. Wrong LIVEKIT_URL format or protocol
  3. Firewall/network blocking UDP ports (7882)
  4. Multiple connection attempts with invalid tokens

**Error: "Received leave request while trying to (re)connect"**

- Server is rejecting the connection mid-setup. Check:
  1. Token is valid (not expired)
  2. Room credentials are correct in API endpoint
  3. LiveKit server has the participant registered

**Steps to debug:**

1. **Verify LiveKit server is running:**

   ```bash
   # Start self-hosted LiveKit with Docker
   docker run --rm --name livekit -p 7880:7880 -p 7881:7881/tcp -p 7882:7882/udp \
     livekit/livekit-server --dev --bind 0.0.0.0

   # Check if it's accessible
   curl -v ws://localhost:7880
   ```

2. **Check environment variables:**

   ```bash
   # Create .env.local with:
   LIVEKIT_URL=ws://localhost:7880
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=secret
   DATABASE_URL=postgresql://...
   ```

3. **Test token endpoint:**

   ```bash
   # Call the token generator API
   curl -X POST http://localhost:5001/api/livekit-token \
     -H "Content-Type: application/json" \
     -d '{
       "roomName": "test-room",
       "userId": "user-123",
       "userName": "Test User"
     }' | jq .

   # Expected response:
   # {
   #   "token": "eyJ0eXAi...",
   #   "url": "ws://localhost:7880"
   # }
   ```

4. **Check browser console for detailed errors:**

   - Open DevTools (F12)
   - Go to Console tab
   - Look for `[LiveKit]` prefixed logs
   - Check Network tab for `/api/livekit-token` request

5. **Common issues:**

   - ❌ `LIVEKIT_URL` is `undefined` → Set in `.env.local`
   - ❌ `Token generation failed` → Check `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
   - ❌ `WebSocket connection failed` → LiveKit server not running or wrong port
   - ❌ `PC connection timeout` → Firewall blocking UDP 7882, or network latency
   - ✅ `Room connected successfully` → All good!

6. **Run the test script (Linux/Mac):**
   ```bash
   bash scripts/test-livekit.sh
   ```

---

If you want me to commit these changes, add `.env.example`, or generate a PNG diagram, tell me which you'd like next.
