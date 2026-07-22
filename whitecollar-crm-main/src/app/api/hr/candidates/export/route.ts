import { type NextRequest } from "next/server";
import { requireHrPermission, hrActiveScopeWhere } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { statusLabel } from "@/lib/hrStatus";
import { istDayRange, isValidDateKey } from "@/lib/datetime";
import { audit, reqMeta } from "@/lib/audit";

const COLS: [string, (c: Cand) => string][] = [
  ["Name", c => c.name],
  ["Phone", c => c.phone ?? ""],
  ["WhatsApp", c => c.whatsappPhone ?? ""],
  ["Email", c => c.email ?? ""],
  ["Location", c => c.location ?? ""],
  ["Present Company", c => c.currentCompany ?? ""],
  ["Designation", c => c.currentProfile ?? ""],
  ["Total Exp", c => c.experience ?? ""],
  ["Sales Exp", c => c.salesExperience ?? ""],
  ["Calling Exp", c => c.callingExperience ?? ""],
  ["Real Estate Exp", c => c.realEstateExperience ?? ""],
  ["Current Salary", c => c.currentSalary != null ? String(c.currentSalary) : ""],
  ["Expected Salary", c => c.expectedSalary != null ? String(c.expectedSalary) : ""],
  ["Notice Period", c => c.noticePeriod ?? ""],
  ["Source Portal", c => c.source ?? ""],
  ["Status", c => statusLabel(c.status)],
  ["Follow Up Date", c => c.nextActionDate ? new Date(c.nextActionDate).toISOString().slice(0, 10) : ""],
  ["Contacted By", c => c.contactedBy ?? ""],
  ["SOP Met", c => c.sopMet ?? ""],
  ["Alt Email", c => c.altEmail ?? ""],
  ["F2F Invite Sent", c => c.inviteMailSent ?? ""],
  ["Acknowledged", c => c.candidateAcknowledged ?? ""],
  ["Arrived On Time", c => c.arrivedOnTime ?? ""],
  ["Personality", c => c.scorePersonality ?? ""],
  ["Confidence", c => c.scoreConfidence ?? ""],
  ["Communication", c => c.scoreCommunication ?? ""],
  ["Behaviour", c => c.scoreBehaviour ?? ""],
  ["Grasping Power", c => c.scoreGrasping ?? ""],
  ["Listening Ability", c => c.scoreListening ?? ""],
  ["Negotiation Ability", c => c.scoreNegotiation ?? ""],
  ["Culture Fit", c => c.scoreCultureFit ?? ""],
  ["Highest Product Sold", c => c.highestProductSold ?? ""],
  ["Deal Value", c => c.dealValue ?? ""],
  ["Avg Incentive", c => c.avgIncentive ?? ""],
  ["Incentive Consistent", c => c.incentiveConsistent ?? ""],
  ["Calls Per Day", c => c.callsPerDay ?? ""],
  ["Connected Calls Per Day", c => c.connectedCallsPerDay ?? ""],
  ["Last Sale Date", c => c.lastSaleDate ?? ""],
  ["HR Decision", c => c.hrDecision ?? ""],
  ["HR Detailed Remarks", c => c.hrDetailedRemarks ?? ""],
  ["Final Status", c => c.finalStatus ?? ""],
  ["Owner", c => c.primaryOwner?.name ?? ""],
  ["Remarks", c => c.remarks ?? ""],
  ["Added", c => new Date(c.createdAt).toISOString().slice(0, 10)],
];
type Cand = Prisma.HRCandidateGetPayload<{ include: { primaryOwner: { select: { name: true } } } }>;
function cell(s: string) { return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }

// Server export (CSV) — supports All + filtered (status/position/source/date) + selected ids.
export async function GET(req: NextRequest) {
  const access = await requireHrPermission("exportData");
  if (access.error) return access.error;
  const { me } = access;
  const sp = req.nextUrl.searchParams;

  const filter: Prisma.HRCandidateWhereInput = {};
  const ids = sp.get("ids");
  if (ids) filter.id = { in: ids.split(",").filter(Boolean) };
  const status = sp.get("status"); if (status) filter.status = status as Cand["status"];
  const source = sp.get("source"); if (source) filter.source = source;
  // Owner filter mirrors the candidate list (incl. "unassigned"), so a report/funnel
  // segment can deep-link to an export of exactly that segment (audit #57).
  const ownerId = sp.get("ownerId"); if (ownerId) filter.primaryOwnerId = ownerId === "unassigned" ? null : ownerId;
  // from/to are "YYYY-MM-DD" calendar dates — treat them as Asia/Kolkata day
  // boundaries (not browser/UTC), so a Jun-30 export captures the whole IST day.
  // gte = start of the `from` IST day; lt = start of the day AFTER `to` (so the
  // whole `to` IST day is inclusive). Ignore malformed params rather than NaN.
  const from = sp.get("from"), to = sp.get("to");
  const fromValid = isValidDateKey(from), toValid = isValidDateKey(to);
  if (fromValid || toValid) {
    const range: Prisma.DateTimeFilter = {};
    if (fromValid) range.gte = istDayRange(from!).start;
    if (toValid) range.lt = istDayRange(to!).end; // end = start of next IST day (exclusive)
    filter.createdAt = range;
  }

  // Defense-in-depth: scope exported rows to what the caller may see + exclude soft-deleted.
  const where: Prisma.HRCandidateWhereInput = { AND: [hrActiveScopeWhere(me), filter] };

  // Audit the candidate-PII export up-front (who · when · IP · device · count + filters).
  const total = await prisma.hRCandidate.count({ where });
  await audit({
    userId: me.id,
    action: "data.export.hr-candidates",
    entity: "HRCandidate",
    meta: { rowCount: total, streamed: true, ids: ids ?? null, status: status ?? null, source: source ?? null },
    request: reqMeta(req),
  });

  // STREAM the CSV with keyset (cursor) pagination so memory stays flat and there's
  // no 25k-row cap — bytes flow as they're read (audit #143).
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode("﻿" + COLS.map((c) => c[0]).join(",") + "\n"));
      let cursor: string | undefined;
      for (;;) {
        const batch = await prisma.hRCandidate.findMany({
          where, orderBy: { id: "asc" }, take: 1000,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          include: { primaryOwner: { select: { name: true } } },
        });
        if (batch.length === 0) break;
        controller.enqueue(encoder.encode(batch.map((c) => COLS.map(([, f]) => cell(f(c))).join(",")).join("\n") + "\n"));
        cursor = batch[batch.length - 1].id;
        if (batch.length < 1000) break;
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="candidates-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
