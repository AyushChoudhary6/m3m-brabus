# M3M Brabus — Backend

A small, production-shaped Express API that receives every CTA lead from the
React frontend, **validates and sanitizes** it, then **persists it to Neon
PostgreSQL (via Prisma)** and **forwards it to the existing Google Apps Script
(Google Sheets)** — in parallel and independently. Google Sheets stays as a
business backup; Neon becomes the primary source for future CRM work.

```
Browser (CTA form)
      │  POST /api/leads   (one request)
      ▼
Node backend ─┬─► Neon PostgreSQL   (primary, via Prisma)      ┐ run in parallel;
              └─► Google Apps Script (backup, Google Sheets)   ┘ neither blocks the other
```

If the database is down the sheet still gets the lead; if the sheet is down the
database still saves it. Only when **both** fail does the API return an error,
so the frontend's existing offline-queue/retry logic kicks in.

---

## Project layout

```
server/
├─ src/
│  ├─ config/        env.js (all env vars), logger.js
│  ├─ controllers/   lead.controller.js, system.controller.js
│  ├─ middlewares/   requestContext, rateLimiter, errorHandler
│  ├─ routes/        lead.routes, system.routes, index.js
│  ├─ services/      lead.service (orchestration), googleSheets.service,
│  │                 prismaClient, repositories/ (swappable persistence)
│  ├─ validators/    lead.validator.js
│  ├─ utils/         asyncHandler, response, sanitize
│  ├─ app.js         Express app (middleware + routes)
│  └─ server.js      bootstrap + graceful shutdown
├─ prisma/
│  ├─ schema.prisma  Lead model (UUID ids, Neon)
│  └─ migrations/    initial migration
├─ .env.example
├─ package.json
└─ README.md
```

Clean architecture: **routes → controllers → services → repositories**. The
controller has no business logic; the service knows nothing about HTTP; only the
repository knows about Prisma.

---

## API

| Method | Path           | Purpose                                        |
| ------ | -------------- | ---------------------------------------------- |
| POST   | `/api/leads`   | Create a lead (validate → Neon + Sheets)       |
| GET    | `/api/health`  | Liveness + dependency probe (DB, Sheets)       |
| GET    | `/api/version` | Service name, version, Node version            |

### `POST /api/leads`

Request body (JSON). Extra fields the frontend sends — attribution, spam
signals, `leadId`, alias keys — are accepted and ignored/forwarded as needed.

```jsonc
{
  "name": "Ayush Choudhary",     // required
  "phone": "9876543210",          // required — Indian (+91) or UAE (+971) mobile
  "email": "ayush@example.com",   // optional, RFC-validated when present
  "project": "5 BHK Residence",   // optional (also accepts "config")
  "budget": "6-8 Cr",             // optional
  "message": "Call after 6pm",    // optional
  "source": "Contact page",       // optional (defaults to "Website")
  "leadId": "…"                   // optional idempotency key (from the client)
}
```

Success (`201`):

```json
{ "success": true, "message": "Lead received.", "data": { "id": "uuid", "saved": true, "backedUp": true } }
```

Errors: `422` validation (with a `details` field map), `429` rate limited,
`502` both downstream targets unavailable.

---

## Installation

Requires **Node ≥ 18**.

```bash
cd server
cp .env.example .env      # then fill in the values
npm install               # also runs `prisma generate`
```

## Connecting Neon

1. Create a project at <https://neon.tech> and a database.
2. Neon → **Connection Details** → **Prisma** tab. Copy the connection string
   (keep `?sslmode=require`). Use the **pooled** string for the app.
3. Put it in `.env` as `DATABASE_URL`.

## Running Prisma migration

```bash
# apply the committed migration to your Neon database
npm run prisma:deploy      # prisma migrate deploy  (production/CI)

# or, while iterating on the schema locally
npm run prisma:migrate     # prisma migrate dev
```

`gen_random_uuid()` is provided by `pgcrypto`, enabled by the first migration.

## Generating Prisma Client

```bash
npm run prisma:generate    # runs automatically on `npm install` too
```

## Running the backend

```bash
npm run dev     # nodemon, http://localhost:4000
npm start       # production
```

Check it: `curl http://localhost:4000/api/health`

## Running the frontend against the backend

The frontend already works with Google Sheets directly. To route it through this
backend instead, set **one** variable in the **root** project's `.env`:

```bash
# in the repo root (not server/)
VITE_API_URL=http://localhost:4000      # dev
# VITE_API_URL=https://api.your-domain.com   # production
```

When `VITE_API_URL` is set, the CTA forms POST to `${VITE_API_URL}/api/leads`.
When it is **unset**, they post to Apps Script directly, exactly as before — so
nothing breaks while the backend is being stood up. No other frontend change.

---

## Environment variables

| Variable               | Required | Description                                              |
| ---------------------- | -------- | -------------------------------------------------------- |
| `DATABASE_URL`         | prod     | Neon PostgreSQL connection string (Prisma)               |
| `GOOGLE_SCRIPT_URL`    | prod     | Existing Apps Script `/exec` URL (Google Sheets backup)  |
| `PORT`                 | no       | API port (default 4000)                                  |
| `NODE_ENV`             | no       | `development` \| `production`                            |
| `CORS_ORIGIN`          | prod     | Comma-separated allowed browser origins                  |
| `LEAD_STORE`           | no       | Primary store: `prisma` (default) \| `crm` (future)      |
| `RATE_LIMIT`           | no       | Max `POST /api/leads` per IP per window (default 30)     |
| `RATE_LIMIT_WINDOW_MS` | no       | Rate-limit window in ms (default 900000 = 15 min)        |
| `JSON_BODY_LIMIT`      | no       | Max request body size (default 16kb)                     |
| `GOOGLE_TIMEOUT_MS`    | no       | Apps Script call timeout (default 10000)                 |
| `LOG_LEVEL`            | no       | `error`\|`warn`\|`info`\|`debug`                          |

Secrets live only in `.env` (git-ignored). Nothing is hard-coded.

---

## Security

- **Helmet** security headers, `x-powered-by` disabled
- **CORS** allow-list (exact origins), not `*` in production
- **Rate limiting** per IP on the write endpoint
- **Validation** (express-validator) + **sanitization** before persist/forward
- **Request size limit** (payload-bomb defence)
- **Parameterised queries** via Prisma (no string-built SQL → no SQL injection)
- **Env-based secrets**, never exposed in responses; generic 5xx messages in prod

## Logging

Every lead logs, as one JSON line: timestamp, request id, lead id, IP address,
database result, Google Sheets result, processing time, and any errors — each
target independently, so a partial failure is visible.

---

## Future CRM support

The application depends on a **repository interface**
(`src/services/repositories/lead.repository.js`), not on Prisma. To make White
Collar CRM the primary store later:

1. Add `src/services/repositories/crm.lead.repository.js` exporting
   `{ name, async create(lead) }` (POST to the CRM API).
2. Register it in the `registry` map in `lead.repository.js`.
3. Set `LEAD_STORE=crm`.

No controller, route, validator, service, or **frontend** line changes. Google
Sheets forwarding is independent and keeps working regardless.

---

## Production deployment

The React site is a static build (Vercel). This backend is a **Node process** and
must run somewhere that runs Node — e.g. **Render, Railway, Fly.io**, or Vercel
**Serverless Functions**. It does not run on static hosting.

Typical (Render/Railway):

1. Create a Web Service from this repo, **root directory `server/`**.
2. Build: `npm install`  ·  Start: `npm start`.
3. Set the env vars above (`DATABASE_URL`, `GOOGLE_SCRIPT_URL`, `CORS_ORIGIN`
   = your live site origin, `NODE_ENV=production`).
4. Run the migration once: `npm run prisma:deploy`.
5. In the **frontend** project, set `VITE_API_URL` to the deployed backend URL
   and redeploy the site.

`app.set('trust proxy', 1)` is already configured so client IPs and rate
limiting work correctly behind a platform proxy.
