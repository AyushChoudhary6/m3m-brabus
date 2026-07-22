import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hrApiAuth, hrScopeWhere } from "@/lib/hrAccess";

// Bulk-triage open follow-ups from the Follow-Ups list: complete (with an optional
// shared completion note) or snooze many at once (audit #87). Scoped to follow-ups on
// candidates the caller may see; capped so an oversized payload can't run an unbounded write.
const MAX_BULK = 100;

export async function POST(req: NextRequest) {
  const auth = await hrApiAuth();
  if (auth.error) return auth.error;
  const { me } = auth;

  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.followUpIds) ? body.followUpIds.filter((x: unknown) => typeof x === "string") : [];
  const action: "complete" | "snooze" = body.action === "snooze" ? "snooze" : "complete";
  const note: string = typeof body.note === "string" ? body.note.trim() : "";
  if (ids.length === 0) return NextResponse.json({ error: "No follow-ups selected" }, { status: 400 });
  if (ids.length > MAX_BULK) return NextResponse.json({ error: `Too many selected (max ${MAX_BULK}).` }, { status: 400 });

  // Restrict to OPEN follow-ups on candidates in the caller's scope — a Junior HR can
  // never act on another recruiter's follow-ups (Admin/Senior scope is {} → all pass).
  const scoped = await prisma.hRFollowUp.findMany({
    where: { id: { in: ids }, completedAt: null, candidate: { AND: [hrScopeWhere(me), { deletedAt: null }] } },
    select: { id: true, candidateId: true, type: true },
  });
  if (scoped.length === 0) return NextResponse.json({ error: "No actionable follow-ups in your scope were selected" }, { status: 403 });
  const scopedIds = scoped.map(f => f.id);
  const candidateIds = [...new Set(scoped.map(f => f.candidateId))];

  if (action === "snooze") {
    const newDue = body.dueAt ? new Date(body.dueAt) : null;
    if (!newDue || isNaN(newDue.getTime())) return NextResponse.json({ error: "A valid snooze date is required" }, { status: 400 });
    if (newDue.getTime() < Date.now() - 60_000) return NextResponse.json({ error: "Snooze date cannot be in the past" }, { status: 400 });
    await prisma.hRFollowUp.updateMany({ where: { id: { in: scopedIds } }, data: { dueAt: newDue } });
    const whenLabel = `${newDue.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })} ${newDue.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}`;
    await prisma.hRActivity.createMany({ data: scoped.map(f => ({ candidateId: f.candidateId, userId: me.id, type: "NOTE_ADDED" as const, notes: `Follow-up snoozed to ${whenLabel}${note ? ` — ${note}` : ""}` })) });
  } else {
    await prisma.hRFollowUp.updateMany({ where: { id: { in: scopedIds } }, data: { completedAt: new Date(), ...(note ? { notes: note } : {}) } });
    await prisma.hRActivity.createMany({ data: scoped.map(f => ({ candidateId: f.candidateId, userId: me.id, type: "FOLLOWUP_COMPLETED" as const, notes: note || `Follow-up completed: ${f.type.replace(/_/g, " ")}` })) });
  }

  // Resync each affected candidate's nextActionDate to the soonest remaining open follow-up.
  await Promise.all(candidateIds.map(async (cid) => {
    const next = await prisma.hRFollowUp.findFirst({ where: { candidateId: cid, completedAt: null }, orderBy: { dueAt: "asc" }, select: { dueAt: true } });
    await prisma.hRCandidate.update({ where: { id: cid }, data: { nextActionDate: next?.dueAt ?? null } }).catch(() => {});
  }));

  return NextResponse.json({ ok: true, affected: scopedIds.length, action });
}
