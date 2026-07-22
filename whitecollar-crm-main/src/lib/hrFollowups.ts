// ─────────────────────────────────────────────────────────────────────────────
// HR follow-up lifecycle helpers.
//
// Fixes the "closed candidate keeps live follow-ups" bug (audit H1): when a
// candidate transitions into a terminal/closed status (Rejected, Joined,
// Not Suitable, …) their still-open follow-ups must be closed, otherwise they
// keep surfacing in the Call-Now queue and the Overdue / Calls-Due KPIs forever.
// ─────────────────────────────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";
import { CLOSED_STATUS_KEYS } from "@/lib/hrStatus";
import type { HRCandidateStatus } from "@prisma/client";

const CLOSED_SET = new Set<HRCandidateStatus>(CLOSED_STATUS_KEYS);

export function isClosedStatus(status: HRCandidateStatus | string | null | undefined): boolean {
  return !!status && CLOSED_SET.has(status as HRCandidateStatus);
}

/**
 * If `newStatus` is terminal, close every open follow-up for the candidate and
 * clear its next-action pointer. No-op for active statuses. Returns the number
 * of follow-ups closed (0 when nothing to do), so callers can log it.
 *
 * Safe to call unconditionally after any status write.
 */
export async function closeFollowUpsIfTerminal(
  candidateId: string,
  newStatus: HRCandidateStatus | string | null | undefined,
): Promise<number> {
  if (!isClosedStatus(newStatus)) return 0;

  const { count } = await prisma.hRFollowUp.updateMany({
    where: { candidateId, completedAt: null },
    data: { completedAt: new Date() },
  });

  // Cancel any still-open interviews. Without this, a rejected/closed candidate keeps
  // a live SCHEDULED+PENDING interview that lingers in the "Pending confirmation" /
  // "Today's interviews" queues — showing a Rejected badge in a needs-confirmation row.
  // (Same class of bug as the follow-up close above; ATTENDED/NO_SHOW are outcomes we
  // keep as history, so only the in-flight states are cancelled.)
  await prisma.hRInterview.updateMany({
    where: {
      candidateId,
      attendanceStatus: { in: ["SCHEDULED", "RESCHEDULED", "ARRIVED", "LATE", "IN_PROGRESS"] },
    },
    data: { attendanceStatus: "CANCELLED" },
  }).catch(() => { /* non-fatal cleanup */ });

  // With no open follow-ups left, the candidate has no pending next action.
  await prisma.hRCandidate.update({
    where: { id: candidateId },
    data: { nextActionDate: null },
  }).catch(() => { /* candidate may be mid-delete; ignore */ });

  return count;
}

/**
 * Recompute nextActionDate from the SOONEST remaining open follow-up (or null when
 * none remain). Call after deleting/rescheduling follow-ups so a candidate never
 * keeps a stale pointer or silently drops out of the "No Next Action" net. Audit #36.
 */
export async function syncNextActionDate(candidateId: string): Promise<void> {
  const soonest = await prisma.hRFollowUp.findFirst({
    where: { candidateId, completedAt: null },
    orderBy: { dueAt: "asc" },
    select: { dueAt: true },
  });
  await prisma.hRCandidate.update({
    where: { id: candidateId },
    data: { nextActionDate: soonest?.dueAt ?? null },
  }).catch(() => { /* candidate may be mid-delete; ignore */ });
}
