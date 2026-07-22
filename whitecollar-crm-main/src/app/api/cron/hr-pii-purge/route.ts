import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// HR data-retention purge (audit #107). The verbatim raw-submission sinks —
// HRApplication.rawPayload and HRIntakeLog.payload/ip — are write-only PII with no
// product use after the candidate is created. This nulls them past a retention
// window (default 180 days). The candidate record + all structured fields are
// untouched; only the raw blobs disappear. Idempotent (safe to re-run).
//
// Auth: bearer CRON_SECRET, fail-closed. ?days=N overrides the window (min 30).
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = Math.max(30, Math.min(3650, parseInt(new URL(req.url).searchParams.get("days") ?? "180", 10) || 180));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [apps, logs] = await Promise.all([
    prisma.hRApplication.updateMany({
      where: { createdAt: { lt: cutoff }, NOT: { rawPayload: { equals: Prisma.DbNull } } },
      data: { rawPayload: Prisma.DbNull },
    }),
    prisma.hRIntakeLog.updateMany({
      where: { receivedAt: { lt: cutoff } },
      data: { payload: Prisma.DbNull, ip: null },
    }),
  ]);

  return NextResponse.json({ ok: true, retentionDays: days, cutoff: cutoff.toISOString(), applicationPayloadsPurged: apps.count, intakeLogsPurged: logs.count });
}
