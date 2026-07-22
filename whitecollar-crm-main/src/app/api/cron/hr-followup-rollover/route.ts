import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CLOSED_STATUS_KEYS } from "@/lib/hrStatus";
import { istDayRange, istClockOnDay } from "@/lib/datetime";
import { syncNextActionDate } from "@/lib/hrFollowups";
import { startCronRun, finishCronRun } from "@/lib/cronRun";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// HR follow-up rollover (audit #86/#89). Overdue OPEN follow-ups on ACTIVE
// candidates are moved forward to today (10:00 IST) so stale dates never pile up
// as ancient "overdue" — mirroring the Sales rollover. Each affected candidate's
// nextActionDate is resynced. Idempotent (after a run nothing is < today start).
// ?dryRun=1 returns the plan without writing.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";
  const runId = await startCronRun("hr-followup-rollover");
  try {
    const todayStart = istDayRange().start;
    const target = istClockOnDay(new Date(), 10, 0); // today 10:00 IST
    const overdue = await prisma.hRFollowUp.findMany({
      where: { completedAt: null, dueAt: { lt: todayStart }, candidate: { deletedAt: null, status: { notIn: CLOSED_STATUS_KEYS as never[] } } },
      select: { id: true, candidateId: true },
      take: 2000,
    });

    if (dryRun) {
      await finishCronRun(runId, "OK", undefined, { wouldMove: overdue.length });
      return NextResponse.json({ ok: true, dryRun: true, wouldMove: overdue.length });
    }

    if (overdue.length) {
      await prisma.hRFollowUp.updateMany({ where: { id: { in: overdue.map((f) => f.id) } }, data: { dueAt: target } });
      // Resync each affected candidate's next-action pointer to the moved date.
      for (const id of [...new Set(overdue.map((f) => f.candidateId))]) await syncNextActionDate(id);
    }
    await finishCronRun(runId, "OK", undefined, { moved: overdue.length });
    return NextResponse.json({ ok: true, moved: overdue.length });
  } catch (e) {
    await finishCronRun(runId, "ERROR", String(e));
    throw e;
  }
}
