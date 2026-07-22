# CRM Database Setup

How to make **White Collar CRM** the primary lead store for this backend — i.e.
point the database in the CRM, so every lead captured on the site lands in the
CRM (with Google Sheets continuing as the parallel backup).

This backend was built for exactly this. The application never talks to a
database directly — it talks to a **repository interface**
(`src/services/repositories/lead.repository.js`). Swapping the store is a
config + one-file change. **No frontend, controller, route, or validator
changes. Google Sheets keeps working untouched.**

```
Browser CTA form ──POST /api/leads──► Backend ──┬─► CRM database   (primary, after this guide)
                                                └─► Google Sheets  (backup, unchanged)
```

---

## Choose your integration model

There are two ways to "set up the DB in the CRM". Pick one.

| | **A. Shared database** | **B. CRM API adapter** |
|---|---|---|
| How | Backend writes to the **same Postgres** the CRM reads from | Backend calls the **CRM's REST API**, the CRM owns its DB |
| You need | The CRM's Postgres connection string | The CRM's API base URL + API key |
| Backend change | **None** — just point `DATABASE_URL` at the CRM's Postgres | Add one adapter file, set `LEAD_STORE=crm` |
| Coupling | DB schema is shared (both sides must agree on columns) | Clean — CRM owns its schema behind its API |
| Best when | The CRM is Postgres-based and you control it | The CRM is a product/service with its own API |

> **Recommendation:** if White Collar CRM exposes a REST API, use **Option B** —
> it keeps the two systems decoupled and lets the CRM validate/enrich leads its
> own way. Use **Option A** only if the CRM is a Postgres app you own and you
> want the leads to appear in its tables directly.

Either way, the lead the backend produces is the same shape — see the contract
below.

---

## The lead data contract

Every lead reaching the store is a **NormalisedLead** (built in
`src/services/lead.service.js` → `normalise()`, sanitized and validated). The
CRM's table or API must be able to accept these fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string(120) | ✅ | Sanitised full name |
| `phone` | string(20) | ✅ | Indian (+91) or UAE (+971) mobile |
| `email` | string(160) | — | RFC-validated when present |
| `project` | string(160) | — | Configuration / project of interest |
| `budget` | string(80) | — | Free-form |
| `message` | string(600) | — | |
| `source` | string(60) | ✅ | Defaults to `Website` |
| `status` | string(40) | ✅ | Defaults to `Fresh Lead` |
| `page` | string(255) | — | Landing/submitting page path |
| `ipAddress` | string(64) | — | Captured server-side |
| `utmSource` | string(120) | — | Attribution |
| `utmMedium` | string(120) | — | Attribution |
| `utmCampaign` | string(160) | — | Attribution |
| `referrer` | string(512) | — | Attribution |
| `device` | string(40) | — | Attribution |
| `spamScore` | int | — | Soft triage signal |
| `fillMs` | int | — | Time-to-submit (bot signal) |
| `externalId` | string(64) | — | **Idempotency key** — de-dupe on this |

`externalId` is the same id the browser retry logic and Google Sheets use, so a
buyer on a flaky connection produces **one** lead, not several. Whatever store
you use, treat `externalId` as unique.

---

## Option A — Point the backend at the CRM's Postgres

Use this if White Collar CRM stores leads in a PostgreSQL database you control.

### 1. Get the CRM database connection string

From the CRM's database (Neon, Supabase, RDS, self-hosted Postgres…), obtain a
connection string:

```
postgresql://USER:PASSWORD@HOST:5432/CRM_DB?sslmode=require
```

### 2. Create the `leads` table in the CRM database

Run the committed migration against the CRM database, **or** apply this SQL
directly (it matches `prisma/schema.prisma`):

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

CREATE TABLE IF NOT EXISTS "leads" (
    "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
    "name"        VARCHAR(120) NOT NULL,
    "phone"       VARCHAR(20)  NOT NULL,
    "email"       VARCHAR(160),
    "project"     VARCHAR(160),
    "budget"      VARCHAR(80),
    "message"     TEXT,
    "source"      VARCHAR(60)  NOT NULL DEFAULT 'Website',
    "status"      VARCHAR(40)  NOT NULL DEFAULT 'Fresh Lead',
    "page"        VARCHAR(255),
    "ip_address"  VARCHAR(64),
    "utm_source"  VARCHAR(120),
    "utm_medium"  VARCHAR(120),
    "utm_campaign" VARCHAR(160),
    "referrer"    VARCHAR(512),
    "device"      VARCHAR(40),
    "spam_score"  INTEGER,
    "fill_ms"     INTEGER,
    "external_id" VARCHAR(64),
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "leads_external_id_key" ON "leads"("external_id");
CREATE INDEX IF NOT EXISTS "leads_phone_idx"      ON "leads"("phone");
CREATE INDEX IF NOT EXISTS "leads_email_idx"      ON "leads"("email");
CREATE INDEX IF NOT EXISTS "leads_status_idx"     ON "leads"("status");
CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads"("created_at");
```

The tidy way, using the committed migration:

```bash
cd server
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/CRM_DB?sslmode=require" \
  npx prisma migrate deploy
```

> If the CRM already has its own `leads`/contacts table with different column
> names, prefer **Option B** (an adapter) rather than forcing this schema onto
> it — mismatched schemas are painful to keep in sync.

### 3. Point the backend at it

In `server/.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/CRM_DB?sslmode=require"
LEAD_STORE=prisma      # unchanged — Prisma now talks to the CRM's Postgres
```

### 4. Verify

```bash
cd server && npm run dev
curl http://localhost:4000/api/health          # dependencies.database → "up"
# submit a lead, then check the CRM database:
#   SELECT id, name, phone, status, created_at FROM leads ORDER BY created_at DESC LIMIT 5;
```

Done. Leads now write into the CRM's database (and Google Sheets, in parallel).

---

## Option B — Push leads to the CRM via its API

Use this if White Collar CRM exposes a REST API. The backend keeps Neon (or
drops it) and sends each lead to the CRM. This is the cleaner, decoupled path.

### 1. Get the CRM API details

From White Collar CRM you need:

- **API base URL** — e.g. `https://api.whitecollarcrm.com`
- **Create-lead endpoint** — e.g. `POST /v1/leads`
- **Auth** — an API key / bearer token
- The CRM's expected field names (fill into the mapping in the adapter below)

### 2. Add the CRM env vars

In `server/.env`:

```bash
LEAD_STORE=crm
CRM_API_URL=https://api.whitecollarcrm.com
CRM_API_KEY=your-secret-api-key
CRM_LEADS_PATH=/v1/leads          # optional, defaults below
CRM_TIMEOUT_MS=10000
```

And add them to `src/config/env.js` (in the frozen `config` object):

```js
crm: {
  apiUrl: process.env.CRM_API_URL || "",
  apiKey: process.env.CRM_API_KEY || "",
  leadsPath: process.env.CRM_LEADS_PATH || "/v1/leads",
  timeoutMs: Number(process.env.CRM_TIMEOUT_MS) || 10000,
},
```

### 3. Create the CRM adapter

Create `server/src/services/repositories/crm.lead.repository.js`. It implements
the **same contract** as the Prisma adapter — `{ name, async create(lead) }` —
so nothing above it changes:

```js
"use strict";

const axios = require("axios");
const { config } = require("../../config/env");

/**
 * Map a NormalisedLead onto the CRM's expected request body.
 * Adjust the right-hand side to match White Collar CRM's field names.
 */
function toCrmPayload(lead) {
  return {
    full_name:    lead.name,
    mobile:       lead.phone,
    email:        lead.email || null,
    interest:     lead.project || null,   // configuration / project
    budget:       lead.budget || null,
    notes:        lead.message || null,
    source:       lead.source,            // "Website" / "Contact page" / …
    status:       lead.status,            // "Fresh Lead"
    landing_page: lead.page || null,
    ip_address:   lead.ipAddress || null,
    utm_source:   lead.utmSource || null,
    utm_medium:   lead.utmMedium || null,
    utm_campaign: lead.utmCampaign || null,
    referrer:     lead.referrer || null,
    device:       lead.device || null,
    // Idempotency: the CRM should treat this as a unique key so retries don't
    // create duplicates. Ask White Collar CRM which field it de-dupes on.
    external_id:  lead.externalId || null,
  };
}

/**
 * Create a lead in White Collar CRM.
 * @param {import("./lead.repository").NormalisedLead} lead
 * @returns {Promise<{ id: string, createdAt: Date }>}
 */
async function create(lead) {
  if (!config.crm.apiUrl || !config.crm.apiKey) {
    const err = new Error("CRM_API_URL / CRM_API_KEY are not configured");
    err.code = "crm_not_configured";
    throw err;
  }

  const url = `${config.crm.apiUrl.replace(/\/+$/, "")}${config.crm.leadsPath}`;

  const res = await axios.post(url, toCrmPayload(lead), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.crm.apiKey}`,
    },
    timeout: config.crm.timeoutMs,
    validateStatus: (s) => s >= 200 && s < 300,
  });

  // Adjust to the CRM's response shape.
  const data = res.data || {};
  return {
    id: data.id || data.lead_id || lead.externalId,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
  };
}

module.exports = { name: "crm", create };
```

### 4. Register the adapter

In `src/services/repositories/lead.repository.js`, add it to the registry:

```js
const registry = {
  prisma: () => require("./prisma.lead.repository"),
  crm:    () => require("./crm.lead.repository"),   // ← add this line
};
```

That is the **only** wiring change. The service, controller, routes, validators
and the entire frontend are untouched.

### 5. Verify

```bash
cd server && npm run dev
# submit a lead from the site (or curl the API) and confirm it appears in the CRM.
```

`GET /api/health` will show `leadStore: "crm"`. If the CRM call fails, the lead
still reaches Google Sheets (parallel, independent), and the API returns 502
only if **both** fail — so the browser's retry queue covers a transient CRM
outage.

---

## Environment variables (summary)

| Variable | Option A | Option B | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ CRM Postgres | — | CRM's Postgres connection string |
| `LEAD_STORE` | `prisma` | `crm` | Which repository is primary |
| `CRM_API_URL` | — | ✅ | CRM API base URL |
| `CRM_API_KEY` | — | ✅ | CRM API key/token (secret) |
| `CRM_LEADS_PATH` | — | optional | Create-lead endpoint path |
| `GOOGLE_SCRIPT_URL` | ✅ | ✅ | Sheets backup — keep set, unchanged |
| `CORS_ORIGIN` | ✅ | ✅ | Your live site origin |

Secrets (`DATABASE_URL`, `CRM_API_KEY`) live only in `.env` (git-ignored) or the
host's secret store. **Never commit them.**

---

## Verifying the whole path end-to-end

1. `curl http://localhost:4000/api/health` → check the `dependencies` block.
2. Submit a real lead through a CTA form (or `curl -X POST .../api/leads`).
3. Confirm it appears in **both** the CRM and the Google Sheet.
4. Submit the same lead twice quickly → confirm **one** record in the CRM
   (idempotency on `externalId`), not two.

---

## Rollback

Switching back is a one-line change — no data migration, no redeploy of the
frontend:

```bash
LEAD_STORE=prisma      # back to Neon
# (Option A) or point DATABASE_URL back at Neon
```

Because Google Sheets writes in parallel throughout, you always have a second
copy of every lead while you move between stores.
