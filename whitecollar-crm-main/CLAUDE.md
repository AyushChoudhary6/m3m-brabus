# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> `@AGENTS.md` (above) carries the **must-read deploy rules**: this is Next.js 16 with
> breaking changes (read `node_modules/next/dist/docs/` before writing framework code),
> and the **Vercel Hobby cron limits** — violating them silently drops the whole deployment.

## Commands

```bash
npm run dev            # Next.js dev server (Turbopack) on :3000
npm run build          # prisma generate && next build
npm run lint           # eslint
npm run db:seed        # tsx prisma/seed.ts — seed dev data
npm run db:reset       # prisma migrate reset --force (DESTRUCTIVE)
npm run regression     # tsx scripts/regression.ts — full regression suite
npm run push           # git push origin main + deploy hook (scripts/deploy.sh)
```

There is no unit-test runner. Behaviour is verified with **standalone `tsx` scripts**
that hit the real dev DB (see `scripts/`), e.g. `npx tsx scripts/qa-hr.ts`. `tsx` resolves
the `@/` path alias, so verification scripts can import app code directly. `noUnusedLocals`
is **off** in tsconfig, so unused locals/imports don't fail typecheck — run
`npx tsc --noEmit -p tsconfig.json` to typecheck.

## Environment & database

- **Prisma 6 + PostgreSQL.** Prisma CLI reads **`.env`** (not `.env.local`) — the
  `DATABASE_URL` and `NEXTAUTH_SECRET` must live in `.env`.
- Use **`npx prisma db push`** for local schema changes, **not** `prisma migrate deploy`:
  a pre-existing migration gap (`LeadProject`) breaks `migrate`. After a schema edit run
  `prisma db push` **and** `prisma generate`.
- ~83 models across two modules (below). **Soft-delete** is via `deletedAt` — scoped
  queries must filter `deletedAt: null`.
- After any schema change the **running dev server must be restarted** — Next.js hot-reloads
  TS but keeps the old generated Prisma client in memory, so writes to new columns fail
  until restart.

## Architecture

This is **two CRMs in one app**, split by route group and by Prisma model — they share auth,
layout, and infra but not data:

- **Sales CRM** — `src/app/(app)/**` (leads, properties, pipeline, calls, reports,
  buyer-data, admin, AI). Core model: **`Lead`**.
- **HR Recruitment** — `src/app/(hr)/hr/**` (candidates, board, interviews, followups,
  import, resume-bank, settings). Core model: **`HRCandidate`**. Shares field *names* with
  `Lead` (`city`, `nextAction`, `tags`, …) but is a **separate model** — editing one never
  touches the other.

`src/app/api/**` holds the route handlers, grouped by domain (`api/hr`, `api/leads`,
`api/intake`, `api/cron`, `api/ai`, `api/telephony`, …).

### Auth (custom — NOT NextAuth)
Bespoke: Server Actions + signed **HttpOnly cookies** (`src/lib/auth.ts`), fronted by a
proxy. There are no standard NextAuth endpoints, so **scripted `curl` login does not work** —
verify authed pages by driving the UI or by querying the DB directly. A page returning
**307** to `/login` means it compiled fine (redirect to auth), not an error.

### HR access control
All HR data access goes through `src/lib/hrAccess.ts` — never query `HRCandidate` raw in an
HR route; use the helpers so role-scoping and soft-delete are enforced:
- `requireHrPage()` / `requireHrPagePermission(perm)` — page guards → `{ me, perms }`.
- `hrApiAuth()` — API-route guard.
- `hrScopeWhere(me)` / `hrActiveScopeWhere(me)` — role-scoped `where` (Junior HR sees only
  own candidates via `{ OR: [primaryOwnerId, secondaryOwnerId] }`; Admin/Senior see all).
- `loadOwnedCandidate(id)` — load one candidate with an ownership check.

Roles → permissions in `hrPermissions.ts` (ADMIN / SENIOR_HR / JUNIOR_HR). HR pickers
(owner/interviewer) only show users flagged **`hrOnly`** or **`hrTeam`** (`getHrUsers()` in
`hrUsers.ts`) — Sales agents are intentionally excluded.

### HR domain libs (`src/lib/hr*.ts`)
- `hrStatus.ts` — canonical statuses, `ACTIVE_STATUS_DEFS`/`CLOSED_STATUS_DEFS`,
  `CLOSED_STATUS_KEYS`, `statusColor`/`statusLabel`/`displayStatus`.
- `hrValidation.ts` — **isomorphic** validators (name, India/UAE phone normalization, email
  typo-detection, resume file, experience-years) used by BOTH the client form and the create
  API, so rules can't be bypassed by a hand-crafted request.
- `hrDuplicates.ts` — dedup `where` (last-10-digit phone / whatsapp / email).
- `hrFollowups.ts` — `closeFollowUpsIfTerminal()` closes open follow-ups on terminal status.

### Timezone (IST)
The business runs on **Asia/Kolkata**. Never use raw `new Date()` for day math — use
`src/lib/datetime.ts`: `fromISTLocalInput()`, `toISTLocalInput()`, `nowISTLocalInput()`,
`istDayRange()`.

### Styling (Tailwind v4, CSS-configured)
No `tailwind.config` file — config lives in `src/app/globals.css`. **Dark mode is NOT the
standard `dark` class**: it uses `@variant dark (&:where([data-theme="dark"], …))` driven by
a `data-theme` attribute on `<html>`. Arbitrary color values like `text-[#1a2e4a]` are **not**
covered by the dark overrides (they render dark-on-dark) — use standard utilities with
explicit `dark:` variants (e.g. `text-indigo-700 dark:text-indigo-200`).

### Ingestion pipelines
- **Website intake** → `api/intake/hr` (real-time, needs an `IntakeKey`; owner default set in
  HR Settings).
- **Bulk import** → `HRImportClient.tsx` + `api/hr/candidates/import`. Column auto-mapping is
  in `CRM_FIELDS`/`GUESS` in the client; the server parses Excel serial dates via `parseHrDate`.
  Fingerprint (`phone|email`) is `@unique` — soft-deleted rows keep their fingerprint, so
  import nulls it on collision to avoid P2002.

### AI (optional)
Anthropic Claude powers lead scoring, summaries, next-best-action, and the in-CRM chat
assistant (`src/lib/ai*.ts`, `api/ai`). Degrades gracefully when no API key is set.

## Conventions

- Scheduled work: **daily-or-less + ≤2 total** cron jobs go in `vercel.json`; anything
  sub-daily goes in `.github/workflows/cron.yml` hitting the same `/api/cron/*` endpoints with
  `Authorization: Bearer ${CRON_SECRET}`.
- Client components cache aggressively in dev — after editing one, a **hard-refresh** (⌘⇧R) is
  often needed for changes to appear.
