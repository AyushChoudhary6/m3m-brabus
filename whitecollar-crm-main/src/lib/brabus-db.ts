import { PrismaClient } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// BRABUS DB — read-only connection to the M3M Brabus website's Neon database.
//
// This is a SECOND, EXTERNAL database, separate from the CRM's own Postgres.
// Every lead submitted on the m3m-brabus site is saved to this Neon DB by the
// Brabus backend (and mirrored to Google Sheets), so it is the complete source
// for the "Brabus" tab. We only ever SELECT from it here.
//
// The CRM's generated Prisma client is reused purely to run raw SQL against a
// different datasource URL — the CRM schema's models are irrelevant; the Brabus
// `leads` table is queried via $queryRaw. Set BRABUS_DATABASE_URL in .env.
// ─────────────────────────────────────────────────────────────────────────────

const globalForBrabus = globalThis as unknown as { brabusPrisma?: PrismaClient };

export const brabusConfigured = Boolean(process.env.BRABUS_DATABASE_URL);

export const brabusPrisma =
  globalForBrabus.brabusPrisma ??
  (brabusConfigured
    ? new PrismaClient({ datasourceUrl: process.env.BRABUS_DATABASE_URL })
    : new PrismaClient()); // fallback keeps types happy; queries are guarded by brabusConfigured

if (process.env.NODE_ENV !== "production") globalForBrabus.brabusPrisma = brabusPrisma;

export type BrabusLead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  project: string | null;
  budget: string | null;
  message: string | null;
  source: string;
  status: string;
  page: string | null;
  created_at: Date;
};

/** Fetch the most recent website leads from the Brabus Neon DB (newest first). */
export async function getBrabusLeads(limit = 500): Promise<BrabusLead[]> {
  if (!brabusConfigured) return [];
  const rows = await brabusPrisma.$queryRawUnsafe<BrabusLead[]>(
    `SELECT id, name, phone, email, project, budget, message, source, status, page, created_at
       FROM leads
       ORDER BY created_at DESC
       LIMIT $1`,
    limit,
  );
  return rows;
}
