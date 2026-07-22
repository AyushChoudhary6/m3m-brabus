import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CLOSED_STATUS_KEYS } from "@/lib/hrStatus";
import { istDayRange } from "@/lib/datetime";
import { startCronRun, finishCronRun } from "@/lib/cronRun";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// HR data-health scan (audit #80/#82) — READ-ONLY. Surfaces per-owner overdue
// follow-up counts + HR data anomalies (unassigned candidates, candidates owned by
// an inactive/non-HR user, active candidates with no next action). Reports the
// numbers via the cron-run stats so an admin can see drift; mutates nothing.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const runId = await startCronRun("hr-health");
  try {
    const activeCand = { deletedAt: null, status: { notIn: CLOSED_STATUS_KEYS as never[] } };
    const todayStart = istDayRange().start;

    const [overdueByOwner, unassigned, noNextAction, activeHrUsers, ownedRows] = await Promise.all([
      prisma.hRFollowUp.groupBy({ by: ["userId"], where: { completedAt: null, dueAt: { lt: todayStart }, candidate: activeCand }, _count: true }),
      prisma.hRCandidate.count({ where: { ...activeCand, primaryOwnerId: null } }),
      prisma.hRCandidate.count({ where: { ...activeCand, nextActionDate: null } }),
      prisma.user.findMany({ where: { active: true, OR: [{ hrOnly: true }, { hrTeam: true }, { role: "ADMIN" }] }, select: { id: true } }),
      prisma.hRCandidate.findMany({ where: { ...activeCand, primaryOwnerId: { not: null } }, select: { primaryOwnerId: true } }),
    ]);

    const hrIds = new Set(activeHrUsers.map((u) => u.id));
    // Candidates owned by someone who is no longer an active HR user (mis-assigned/orphaned).
    const ownedByNonHrUser = ownedRows.filter((c) => c.primaryOwnerId && !hrIds.has(c.primaryOwnerId)).length;
    const overdueFollowUps = overdueByOwner.reduce((s, r) => s + r._count, 0);

    const stats = { overdueFollowUps, ownersWithOverdue: overdueByOwner.length, unassigned, activeNoNextAction: noNextAction, ownedByNonHrUser };
    await finishCronRun(runId, "OK", undefined, stats);
    return NextResponse.json({ ok: true, ...stats, perOwnerOverdue: overdueByOwner });
  } catch (e) {
    await finishCronRun(runId, "ERROR", String(e));
    throw e;
  }
}
