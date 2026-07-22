import { NextResponse, type NextRequest } from "next/server";
import { requireHrPermission, hrActiveScopeWhere, hrScopeWhere, hrCan, hrRoleOf } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import { HRCandidateStatus } from "@prisma/client";
import { isClosedStatus } from "@/lib/hrFollowups";
import { audit, reqMeta } from "@/lib/audit";

// Cap the number of candidates a single bulk request can touch, so an oversized
// or malicious payload can't run an unbounded write (audit #45).
const MAX_BULK = 500;

// Bulk actions from the Candidates list: change status, reassign owner, and/or
// set a follow-up date (creates a call-back task + next action for each
// selected candidate — the fast way to put fresh imports into the work queue).
export async function POST(req: NextRequest) {
  // Bulk actions are privileged — Junior HR is blocked entirely.
  const auth = await requireHrPermission("bulkActions");
  if (auth.error) return auth.error;
  const { me } = auth;

  const body = await req.json();
  const requestedIds: string[] = Array.isArray(body.ids) ? body.ids : [];
  if (requestedIds.length === 0) return NextResponse.json({ error: "No candidates selected" }, { status: 400 });
  if (requestedIds.length > MAX_BULK) return NextResponse.json({ error: `Too many candidates selected (max ${MAX_BULK}).` }, { status: 400 });

  // ── RESTORE from recycle bin (audit #13) ── handled first because restore targets
  // SOFT-DELETED candidates, which the active-scope query below deliberately excludes.
  if (body.action === "restore") {
    if (!hrCan(me, "deleteCandidate")) return NextResponse.json({ error: "You don't have permission to restore candidates." }, { status: 403 });
    const restorable = await prisma.hRCandidate.findMany({ where: { AND: [hrScopeWhere(me), { id: { in: requestedIds }, deletedAt: { not: null } }] }, select: { id: true } });
    const rids = restorable.map((c) => c.id);
    if (rids.length === 0) return NextResponse.json({ error: "No restorable candidates in your scope were selected" }, { status: 403 });
    const restored = await prisma.hRCandidate.updateMany({ where: { id: { in: rids } }, data: { deletedAt: null } });
    await prisma.hRActivity.createMany({ data: rids.map((id) => ({ candidateId: id, userId: me.id, type: "NOTE_ADDED" as const, notes: "Candidate restored from recycle bin" })) });
    await audit({ userId: me.id, action: "hr.candidates.restore", entity: "HRCandidate", meta: { ids: rids, count: restored.count }, request: reqMeta(req) });
    return NextResponse.json({ ok: true, restored: restored.count });
  }

  // CRITICAL: restrict the operation to candidates IN SCOPE. Intersect the
  // requested id list with ids matching hrScopeWhere(me) so a user can never act
  // on candidates outside their scope. (Admin/Senior HR scope is {} → all pass.)
  const inScope = await prisma.hRCandidate.findMany({
    where: { AND: [hrActiveScopeWhere(me), { id: { in: requestedIds } }] },
    select: { id: true },
  });
  const ids = inScope.map(c => c.id);
  if (ids.length === 0) return NextResponse.json({ error: "No candidates in your scope were selected" }, { status: 403 });

  // Validate the requested action against the known set so an unrecognised
  // action can't slip through to the update path and return a misleading
  // {updated:0} success. Status/owner/follow-up updates carry NO `action`
  // field (only `delete` is an explicit action), so anything else is invalid.
  const KNOWN_ACTIONS = ["delete"];
  if (body.action != null && !KNOWN_ACTIONS.includes(body.action)) {
    return NextResponse.json({ error: `Unknown bulk action: ${body.action}` }, { status: 400 });
  }

  // Bulk delete — requires the deleteCandidate permission. SOFT-deletes the
  // candidates (recycle bin) by stamping deletedAt; never hard-deletes, so the
  // rows + their workflow history can be recovered.
  if (body.action === "delete") {
    if (!hrCan(me, "deleteCandidate")) return NextResponse.json({ error: "You don't have permission to delete candidates." }, { status: 403 });
    const del = await prisma.hRCandidate.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date(), nextActionDate: null } });
    // Close their open follow-ups too, so a recycle-binned candidate never lingers
    // in the Call-Now queue / Overdue KPIs (audit #52).
    await prisma.hRFollowUp.updateMany({ where: { candidateId: { in: ids }, completedAt: null }, data: { completedAt: new Date() } });
    // Log one activity per candidate so the deletion shows in the timeline
    // (matches the bulk status/owner/follow-up paths below).
    await prisma.hRActivity.createMany({
      data: ids.map(id => ({
        candidateId: id, userId: me.id,
        type: "NOTE_ADDED" as const, notes: "Candidate moved to recycle bin",
      })),
    });
    // Central audit trail — who bulk-deleted which candidates (audit #101/#102).
    await audit({ userId: me.id, action: "hr.candidates.bulk-delete", entity: "HRCandidate", meta: { ids, count: del.count }, request: reqMeta(req) });
    return NextResponse.json({ ok: true, deleted: del.count });
  }

  const data: { status?: HRCandidateStatus; primaryOwnerId?: string } = {};
  if (body.status) data.status = body.status as HRCandidateStatus;
  if (body.primaryOwnerId) {
    // Owner reassignment requires the assign permission.
    if (!hrCan(me, "assign")) return NextResponse.json({ error: "You don't have permission to reassign candidate ownership." }, { status: 403 });
    // Target must be an ACTIVE HR user — never orphan a candidate onto a Sales/inactive user.
    const validOwner = await prisma.user.findFirst({
      where: { id: body.primaryOwnerId, active: true, OR: [{ hrOnly: true }, { hrTeam: true }, { role: "ADMIN" }] },
      select: { id: true },
    });
    if (!validOwner) return NextResponse.json({ error: "Invalid owner — must be an active HR team member." }, { status: 400 });
    data.primaryOwnerId = body.primaryOwnerId;
  }
  if (data.status === "OFFER_RELEASED" && hrRoleOf(me) === "JUNIOR_HR") {
    return NextResponse.json({ error: "Interns can't release offers — ask a manager." }, { status: 403 });
  }

  const followUpDate = typeof body.followUpDate === "string" && body.followUpDate ? new Date(body.followUpDate) : null;
  const validFollowUp = followUpDate && !isNaN(followUpDate.getTime());
  const followUpNote = typeof body.followUpNote === "string" ? body.followUpNote.trim() : "";

  if (Object.keys(data).length === 0 && !validFollowUp) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // 1. Status / owner update (+ timeline).
  if (Object.keys(data).length > 0) {
    await prisma.hRCandidate.updateMany({ where: { id: { in: ids } }, data });
    const note = data.status ? `Bulk update: status → ${data.status.replace(/_/g, " ")}` : "Bulk update: owner reassigned";
    await prisma.hRActivity.createMany({
      data: ids.map(id => ({
        candidateId: id, userId: me.id,
        type: data.status ? ("STATUS_CHANGED" as const) : ("NOTE_ADDED" as const),
        notes: note, newStatus: data.status ?? null,
      })),
    });
    // Bulk-closing candidates must also close their open follow-ups so they
    // don't keep haunting the Call-Now queue / Overdue KPIs (audit H1). Skipped
    // when the same request also sets an explicit follow-up date below.
    if (data.status && isClosedStatus(data.status) && !validFollowUp) {
      await prisma.hRFollowUp.updateMany({ where: { candidateId: { in: ids }, completedAt: null }, data: { completedAt: new Date() } });
      await prisma.hRCandidate.updateMany({ where: { id: { in: ids } }, data: { nextActionDate: null } });
    }
    // Central audit trail for reassignments / bulk status changes (audit #101/#102).
    if (data.primaryOwnerId) {
      await audit({ userId: me.id, action: "hr.candidates.bulk-reassign", entity: "HRCandidate", meta: { ids, newOwnerId: data.primaryOwnerId, count: ids.length }, request: reqMeta(req) });
    }
    if (data.status) {
      await audit({ userId: me.id, action: "hr.candidates.bulk-status", entity: "HRCandidate", meta: { ids, status: data.status, count: ids.length }, request: reqMeta(req) });
    }
  }

  // 2. Bulk follow-up: a call-back task + next action for each candidate.
  if (validFollowUp) {
    const due = followUpDate as Date;
    const noteText = followUpNote || "Follow up with candidate";
    await prisma.hRFollowUp.createMany({ data: ids.map(id => ({ candidateId: id, dueAt: due, type: "CALL_BACK" as const, userId: me.id, notes: noteText })) });
    await prisma.hRCandidate.updateMany({ where: { id: { in: ids } }, data: { nextActionDate: due } });
    const label = due.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
    await prisma.hRActivity.createMany({ data: ids.map(id => ({ candidateId: id, userId: me.id, type: "FOLLOWUP_CREATED" as const, notes: `Bulk follow-up set for ${label}` })) });
  }

  return NextResponse.json({ ok: true, updated: ids.length });
}
