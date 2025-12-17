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
- `NEXT_PUBLIC_...` - any public client env variables for Next.js.
- LiveKit / real-time keys if using a hosted LiveKit instance (e.g. `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`).

## Project Structure (high level)

- `app/` — Next.js App Router UI, pages and server API routes under `app/api`.
- `components/` — shared React components and UI primitives.
- `db/` — Drizzle schema (`db/schema.ts`), DB entry `db/index.ts`, seeds `db/seed.ts`.
- `drizzle/` — generated migrations / output.
- `lib/` — client wrappers, utilities, and server-side actions (`lib/actions`).
- `hooks/` — React hooks used by the app (WebRTC, LiveKit helpers, session hooks).
- `server/` — small standalone signaling server and helper scripts (`server/signaling-server.js`).
- `public/` — static assets.

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

---

If you want me to commit these changes, add `.env.example`, or generate a PNG diagram, tell me which you'd like next.
