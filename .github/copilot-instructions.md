# Copilot / AI Agent Instructions

Purpose: quick, actionable guidance so an AI coding agent can be immediately productive in this repo.

- **Big picture**: This is a Next.js (App Router) TypeScript frontend + Next API routes runtime. A small separate Node signaling server lives in `server/`. Postgres + Drizzle ORM is the data layer. LiveKit is used for media (token generation server-side). Typical flow: browser → `app` pages/components → call `app/api/*` server routes → `lib/actions/*` → `db/index.ts` (Drizzle) → Postgres.

- **Key files & directories** (start here):

  - `app/` — Next.js App Router pages and `app/api/*` server routes (business entry points).
  - `lib/actions/` — server-side business logic used by API routes.
  - `db/schema.ts` and `db/index.ts` — Drizzle schema and DB bootstrap (source of truth for data model).
  - `drizzle.config.ts` — drizzle-kit config and migrations output in `drizzle/` (do not edit generated SQL).
  - `components/` and `hooks/` — shared UI and client hooks (e.g., `use-livekit-classroom`, `use-webrtc`).
  - `server/` — separate signaling server (socket.io) for custom WebRTC flows (`server/signaling-server.js`, `server/README.md`).
  - `lib/api-client.ts` — client helper used by pages to call internal API routes.

- **Dev / run commands** (from repo root):

  - Install: `pnpm install` (project uses pnpm in docs; `package-lock.json` exists too).
  - Frontend dev: `pnpm dev` (runs `next dev -p 5001 -H 0.0.0.0`). The app listens on port `5001` in dev.
  - Build / start: `pnpm build && pnpm start` (start binds to `:5001`).
  - DB: `pnpm db:push` (drizzle-kit push), `pnpm db:seed` (runs `tsx db/seed.ts`).
  - Signaling server: `cd server && npm run dev` (server README documents port `3001` by default).

- **Environment variables** the agent should expect and reference when editing server-side code:

  - `DATABASE_URL` — Postgres connection used by Drizzle.
  - `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` — LiveKit integration & token signing.
  - `NEXT_PUBLIC_SIGNALING_SERVER` — optional public URL for the signaling server.

- **Patterns & conventions (project-specific)**

  - App Router + server components: many files in `app/` are server components that call `lib` server helpers directly. Prefer using `lib/actions/*` for business logic instead of duplicating DB queries in routes.
  - DB access centralization: use `db/index.ts` Drizzle client and `db/schema.ts` types; align queries with the schema enums (e.g., `assignment_status`, `session_status`).
  - LiveKit pattern: token generation is server-side (API route). Frontend requests a token and then connects directly to LiveKit (or uses the self-hosted LiveKit in `Readme.md` examples).
  - Signaling: `server/signaling-server.js` uses `socket.io` and exposes `join-room`, `offer`, `answer`, `ice-candidate`, etc. Only change this when implementing non-LiveKit custom signaling flows.
  - File uploads and client requests normally go through `app/api/*` routes (not directly into `lib`), so preserve route shapes when adding endpoints.

- **What to change vs what to avoid**

  - Change: `lib/actions/*` for business rules, API route handlers to wire endpoints, and `components/*` for UI work.
  - Avoid: editing generated SQL in `drizzle/` or changing Drizzle config without updating migrations and `drizzle` output.

- **Quick examples to reference in PRs**

  - If you add an API route, mirror existing patterns in `app/api/livekit-token/` and call a new or existing `lib/actions/*.ts` function.
  - When adding DB fields, update `db/schema.ts`, run `pnpm db:push`, and add seed updates in `db/seed.ts` as appropriate.

- **Debugging notes**
  - Dev server port: `5001`. If testing LiveKit locally, start a LiveKit Docker image (ports `7880`-`7882`) as shown in `Readme.md`.
  - Signaling server port: `3001` (see `server/README.md`).

If anything is unclear or you want me to include code snippets for common edits (example API route + action + migration), tell me which change you'd like to prototype and I'll add it.
