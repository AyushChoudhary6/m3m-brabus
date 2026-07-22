import { requireHrPage, hrScopeWhere } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import HRFollowUpBulkList, { type FollowUpItem } from "@/components/HRFollowUpBulkList";
import { istDayRange } from "@/lib/datetime";
import { CLOSED_STATUS_KEYS } from "@/lib/hrStatus";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage({ searchParams }: { searchParams: Promise<Record<string,string>> }) {
  const { me } = await requireHrPage();
  const sp = await searchParams;
  // IST day boundaries so Today/Overdue match the dashboard (audit #8/#27).
  const { start, end } = istDayRange();

  const filter = sp.filter ?? "today";
  // Scope to candidates the user may see, not soft-deleted, AND not in a closed
  // status — a closed candidate's stale follow-ups must not surface here (#37).
  const candidateScope = { AND: [hrScopeWhere(me), { deletedAt: null, status: { notIn: CLOSED_STATUS_KEYS as never[] } }] };
  let where: NonNullable<Parameters<typeof prisma.hRFollowUp.findMany>[0]>["where"] = { completedAt: null, candidate: candidateScope };
  // Tomorrow = the IST day after today; Upcoming is now BOUNDED to the next 7 days
  // beyond tomorrow (was date-unbounded) so the tab can't grow forever (audit #119).
  const tomEnd = new Date(end.getTime() + 24 * 3600_000);
  const weekOut = new Date(start.getTime() + 8 * 24 * 3600_000);
  if (filter === "today")    where = { ...where, dueAt: { gte: start, lt: end } };
  if (filter === "tomorrow") where = { ...where, dueAt: { gte: end, lt: tomEnd } };
  if (filter === "overdue")  where = { ...where, dueAt: { lt: start } };
  if (filter === "upcoming") where = { ...where, dueAt: { gte: tomEnd, lt: weekOut } };
  if (filter === "confirm")  where = { ...where, type: "INTERVIEW_CONFIRMATION" };
  if (filter === "no-show")  where = { ...where, type: "NO_SHOW_RECOVERY" };
  // Offer / Joining tabs: pending follow-ups for candidates in those lifecycle stages.
  if (filter === "offer")    where = { ...where, candidate: { AND: [hrScopeWhere(me), { deletedAt: null, status: "OFFER_RELEASED" }] } };
  if (filter === "joining")  where = { ...where, candidate: { AND: [hrScopeWhere(me), { deletedAt: null, status: "EXPECTED_JOINING" }] } };

  const LIST_CAP = 100;
  const [followUps, total] = await Promise.all([
    prisma.hRFollowUp.findMany({
      where,
      orderBy: { dueAt: "asc" },
      take: LIST_CAP,
      include: {
        candidate: { select: { id: true, name: true, phone: true, primaryOwner: { select: { name: true } } } },
        user: { select: { name: true } },
      },
    }),
    prisma.hRFollowUp.count({ where }), // real total so truncation is never silent (#145/#127)
  ]);

  const tabs = [
    { key: "today",    label: "Today" },
    { key: "tomorrow", label: "Tomorrow" },
    { key: "overdue",  label: "Overdue" },
    { key: "upcoming", label: "Upcoming (7d)" },
    { key: "confirm",  label: "Interview Confirmation" },
    { key: "no-show",  label: "No Show Recovery" },
    { key: "offer",    label: "Offer Follow-up" },
    { key: "joining",  label: "Joining Follow-up" },
  ];

  const items: FollowUpItem[] = followUps.map(fu => ({
    id: fu.id,
    candidateId: fu.candidateId,
    candidateName: fu.candidate.name,
    phone: fu.candidate.phone,
    type: fu.type,
    dueAt: new Date(fu.dueAt).toISOString(),
    notes: fu.notes,
    userName: fu.user?.name ?? null,
    ownerFirst: fu.candidate.primaryOwner?.name?.split(" ")[0] ?? null,
  }));

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Follow-Ups</h1>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-gray-200 dark:border-slate-700">
        {tabs.map(t => (
          <Link key={t.key} href={`/hr/followups?filter=${t.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition
              ${filter===t.key ? "border-[#1a2e4a] text-[#1a2e4a] dark:border-blue-400 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-slate-500">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
          <div className="text-sm">No follow-ups in this category.</div>
        </div>
      ) : (
        <HRFollowUpBulkList items={items} />
      )}

      {total > 0 && (
        <div className="text-xs text-gray-500 dark:text-slate-400 pt-1">
          Showing <span className="font-semibold text-gray-700 dark:text-slate-200">{Math.min(total, LIST_CAP)}</span> of <span className="font-semibold text-gray-700 dark:text-slate-200">{total}</span>
          {total > LIST_CAP && <span className="text-amber-600 dark:text-amber-400"> · {total - LIST_CAP} more not shown — narrow with a filter</span>}
        </div>
      )}
    </div>
  );
}
