import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { HRActivityType, HRCandidateStatus } from "@prisma/client";
import { loadOwnedCandidate } from "@/lib/hrAccess";
import { closeFollowUpsIfTerminal } from "@/lib/hrFollowups";

// Call outcomes that leave the candidate reachable-later → always get a callback
// follow-up so nobody silently falls out of every queue (audit H2).
const NEEDS_CALLBACK = new Set<HRActivityType>([
  "CALL_NOT_ANSWERED", "CALL_BUSY", "CALL_SWITCHED_OFF", "CALL_LATER",
]);

/** A UTC Date at `hourIST`:00 IST, `daysAhead` days from now. */
function istAt(daysAhead: number, hourIST: number): Date {
  const IST = 5.5 * 3600 * 1000;
  const nowIst = new Date(Date.now() + IST);
  const ms = Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate() + daysAhead, hourIST, 0, 0) - IST;
  return new Date(ms);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await loadOwnedCandidate(id);
  if (access.error) return access.error;
  const { me } = access;
  const body = await req.json();

  const type = body.type as HRActivityType;
  if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });
  // Validate against the enum so a hand-crafted request can't inject an arbitrary
  // activity type (audit #30).
  if (!Object.values(HRActivityType).includes(type)) {
    return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
  }

  const existing = await prisma.hRCandidate.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ── Auto-update candidate status based on activity outcome ──────────
  // Two kinds of mapping:
  //   • UNCONDITIONAL — explicit milestones that should always move the
  //     candidate forward (offer/join). These mirror an intentional action.
  //   • EARLY-STAGE-ONLY — call outcomes (no-answer, busy, switched-off,
  //     wrong-number, call-later, connected) that should classify a candidate
  //     who is still untouched/early, but must NEVER overwrite a more-advanced
  //     pipeline status (e.g. a SHORTLISTED candidate who didn't pick up today
  //     stays SHORTLISTED, not NOT_RESPONDING).
  const unconditionalMap: Partial<Record<HRActivityType, HRCandidateStatus>> = {
    OFFER_RELEASED:    "OFFER_RELEASED",
    OFFER_DECLINED:    "OFFER_DECLINED",
    CANDIDATE_JOINED:  "JOINED",
  };
  // Outcomes that only classify candidates still in an early/neutral state.
  const earlyStageMap: Partial<Record<HRActivityType, HRCandidateStatus>> = {
    CALL_CONNECTED:     "INTERESTED",     // reached & talking → INTERESTED (early only)
    CALL_NOT_ANSWERED:  "NOT_RESPONDING",
    CALL_BUSY:          "NOT_RESPONDING",
    CALL_SWITCHED_OFF:  "SWITCH_OFF",
    CALL_WRONG_NUMBER:  "WRONG_NUMBER",
    CALL_LATER:         "HOLD",
  };
  // Statuses considered "early/neutral" — safe for a call outcome to overwrite.
  const EARLY_STATUSES = new Set<HRCandidateStatus>([
    "NEW",
    "NOT_CALLED",
    "NOT_RESPONDING",
    "SWITCH_OFF",
    "HOLD",
    "INTERESTED",
  ]);

  // Auto-status from call outcomes is DISABLED (user preference): logging a call
  // only records the activity + schedules a callback — it NEVER changes the
  // candidate's status. Status changes only via an explicit newStatus (a manual
  // status change) or the status dropdown. The unconditional/early-stage maps
  // above are intentionally no longer applied.
  const autoStatus: HRCandidateStatus | undefined = body.newStatus ? (body.newStatus as HRCandidateStatus) : undefined;

  const finalStatus = (autoStatus ?? existing.status) as HRCandidateStatus;

  const updates: Record<string, unknown> = {};
  if (autoStatus && autoStatus !== existing.status) updates.status = autoStatus;

  const [activity] = await prisma.$transaction([
    prisma.hRActivity.create({
      data: {
        candidateId: id,
        userId: me.id,
        type,
        notes: body.notes || null,
        oldStatus: existing.status as HRCandidateStatus,
        newStatus: finalStatus,
        // Real interaction time (backdatable) + optional duration (audit #2/#3).
        occurredAt: body.occurredAt ? new Date(body.occurredAt) : null,
        durationSec: Number.isFinite(Number(body.durationSec)) && Number(body.durationSec) > 0 ? Math.round(Number(body.durationSec)) : null,
      },
    }),
    ...(Object.keys(updates).length > 0
      ? [prisma.hRCandidate.update({ where: { id }, data: updates })]
      : []),
  ]);

  // If the outcome closed the candidate (e.g. Wrong Number, Joined), close any
  // open follow-ups (audit H1) and stop — no new callback for a closed record.
  const closedCount = await closeFollowUpsIfTerminal(id, finalStatus);

  // Otherwise, keep the candidate on the board: auto-create a callback follow-up
  // so a call that didn't connect (or an explicit next-action date) always has a
  // real follow-up row backing it — never just a bare nextActionDate (audit H2).
  let followUp = null;
  if (closedCount === 0) {
    const explicitDate = body.nextActionDate ? new Date(body.nextActionDate) : null;
    const wantsFollowUp = !!explicitDate || NEEDS_CALLBACK.has(type);
    if (wantsFollowUp) {
      const dueAt = explicitDate && !isNaN(explicitDate.getTime())
        ? explicitDate
        : istAt(1, 10); // default: tomorrow 10:00 IST
      followUp = await prisma.hRFollowUp.create({
        data: {
          candidateId: id,
          userId: me.id,
          type: "CALL_BACK",
          dueAt,
          notes: body.nextAction || body.notes || null,
          autoCreated: true,
        },
      });
      // Point candidate.nextAction* at the soonest still-open follow-up.
      const soonest = await prisma.hRFollowUp.findFirst({
        where: { candidateId: id, completedAt: null },
        orderBy: { dueAt: "asc" },
        select: { dueAt: true, type: true, notes: true },
      });
      if (soonest) {
        await prisma.hRCandidate.update({
          where: { id },
          data: {
            nextActionDate: soonest.dueAt,
          },
        });
      }
    }
  }

  return NextResponse.json({ activity, followUp }, { status: 201 });
}
