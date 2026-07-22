import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadOwnedCandidate, hrRoleOf } from "@/lib/hrAccess";
import { audit, reqMeta } from "@/lib/audit";

// Merge a duplicate candidate INTO this one (audit #74) — ADMIN only, since it is
// destructive. Re-parents every child record (activities, remarks, interviews,
// follow-ups, resumes, applications, voice, escalations, intake logs) from the
// loser to the survivor, then soft-deletes the loser and nulls its fingerprint so
// it no longer blocks future dedup. All in one transaction.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: survivorId } = await params;
  const access = await loadOwnedCandidate(survivorId);
  if (access.error) return access.error;
  const { me } = access;
  if (hrRoleOf(me) !== "ADMIN") return NextResponse.json({ error: "Only an Admin can merge candidates." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const loserId = typeof body.loserId === "string" ? body.loserId : "";
  if (!loserId) return NextResponse.json({ error: "loserId required" }, { status: 400 });
  if (loserId === survivorId) return NextResponse.json({ error: "Can't merge a candidate into itself." }, { status: 400 });

  const loser = await prisma.hRCandidate.findFirst({ where: { id: loserId, deletedAt: null }, select: { id: true, name: true } });
  if (!loser) return NextResponse.json({ error: "Duplicate candidate not found." }, { status: 404 });

  const reparent = { candidateId: loserId };
  await prisma.$transaction([
    prisma.hRActivity.updateMany({ where: reparent, data: { candidateId: survivorId } }),
    prisma.hRRemark.updateMany({ where: reparent, data: { candidateId: survivorId } }),
    prisma.hRInterview.updateMany({ where: reparent, data: { candidateId: survivorId } }),
    prisma.hRFollowUp.updateMany({ where: reparent, data: { candidateId: survivorId } }),
    prisma.hRResume.updateMany({ where: reparent, data: { candidateId: survivorId } }),
    prisma.hRApplication.updateMany({ where: reparent, data: { candidateId: survivorId } }),
    prisma.hRVoiceMessage.updateMany({ where: reparent, data: { candidateId: survivorId } }),
    prisma.hREscalation.updateMany({ where: reparent, data: { candidateId: survivorId } }),
    prisma.hRIntakeLog.updateMany({ where: reparent, data: { candidateId: survivorId } }),
    prisma.hRCandidate.update({ where: { id: loserId }, data: { deletedAt: new Date(), fingerprint: null, nextActionDate: null } }),
    prisma.hRActivity.create({ data: { candidateId: survivorId, userId: me.id, type: "NOTE_ADDED", notes: `Merged duplicate "${loser.name}" into this candidate — all history moved here.` } }),
  ]);

  await audit({ userId: me.id, action: "hr.candidates.merge", entity: "HRCandidate", entityId: survivorId, meta: { survivorId, loserId, loserName: loser.name }, request: reqMeta(req) });
  return NextResponse.json({ ok: true });
}
