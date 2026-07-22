import { requireHrPage, hrScopeWhere } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { HRCandidateStatus } from "@prisma/client";
import HRCandidateTable from "@/components/HRCandidateTable";
import { CLOSED_STATUS_KEYS } from "@/lib/hrStatus";
import { getHrUsers } from "@/lib/hrUsers";
import { istDayRange, isValidDateKey } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<Record<string,string>> }) {
  const { me, perms } = await requireHrPage();
  const sp = await searchParams;
  // Default view shows ALL candidates (active + closed) so the "All" count always
  // equals the total and matches the rows on screen. `?closed=0` narrows to the
  // active-only view for decluttering.
  const showClosed = sp.closed !== "0";
  const filterStatus = sp.status as HRCandidateStatus | undefined;

  const scope = hrScopeWhere(me);
  // ALWAYS exclude soft-deleted (recycle-bin) candidates from the list + counts.
  const where: NonNullable<Parameters<typeof prisma.hRCandidate.findMany>[0]>["where"] = { ...scope, deletedAt: null };
  if (sp.batch) {
    // Viewing the records created by a specific import batch — show all statuses.
    where.importBatchId = sp.batch;
  } else if (filterStatus) {
    where.status = filterStatus;
  } else {
    where.status = { notIn: showClosed ? [] : CLOSED_STATUS_KEYS };
  }

  // Drill-down filters so report/dashboard tiles can deep-link into an exact
  // candidate segment (audit #55/#5/#118): source, owner, and a created-date range.
  if (sp.source) where.source = sp.source;
  if (sp.ownerId) where.primaryOwnerId = sp.ownerId === "unassigned" ? null : sp.ownerId;
  if (sp.from || sp.to) {
    const created: { gte?: Date; lt?: Date } = {};
    if (sp.from && isValidDateKey(sp.from)) created.gte = istDayRange(sp.from).start;
    if (sp.to && isValidDateKey(sp.to)) created.lt = istDayRange(sp.to).end;
    if (created.gte || created.lt) where.createdAt = created;
  }

  // SERVER-SIDE SEARCH (spans ALL pages). A non-empty ?q= is applied as an OR over
  // the headline candidate fields, combined with the existing scope + status/batch
  // filters via AND — so it filters the whole result set BEFORE pagination, not
  // just the 50 rows the client already received. We use `where.AND` (rather than a
  // top-level `where.OR`) so this NEVER clobbers the scope's own OR clause — the
  // JUNIOR_HR scope is `{ OR: [primaryOwnerId, secondaryOwnerId] }`, and overwriting
  // that would leak candidates outside the user's scope.
  const q = (sp.q ?? "").trim();
  if (q) {
    const contains = { contains: q, mode: "insensitive" as const };
    // Kept under where.AND (NOT a top-level where.OR) so the JUNIOR_HR scope OR
    // (primaryOwnerId / secondaryOwnerId) is preserved. Broadened to also cover
    // whatsappPhone, city, remarks and the primary owner's NAME (via relation).
    where.AND = [{
      OR: [
        { name: contains },
        { phone: contains },
        { whatsappPhone: contains },
        { email: contains },
        { currentCompany: contains },
        { location: contains },
        { remarks: contains },
        { primaryOwner: { is: { name: contains } } },
      ],
    }];
  }

  // Server pagination — 50 rows/page, navigated via ?page= (1-based). This caps
  // the per-row include fan-out (follow-ups / interviews / activities / resume
  // count) to a single page instead of the old fixed 300-row load.
  const PAGE_SIZE = 50;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  // Whether any narrowing filter (beyond the default status/closed view) is active.
  // When NONE is, the paginated total is derived from the chip `groupBy` below —
  // avoiding a SECOND full-scope aggregate (count) on the default load. Audit #144.
  const hasNarrowingFilter = !!(filterStatus || sp.source || sp.ownerId || sp.from || sp.to || sp.batch || q);

  const [candidates, agents, counts] = await Promise.all([
    prisma.hRCandidate.findMany({
      where,
      orderBy: [{ nextActionDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      take: PAGE_SIZE,
      skip,
      include: {
        primaryOwner: { select: { id: true, name: true } },
        followUps: { where: { completedAt: null }, orderBy: { dueAt: "asc" }, take: 1, select: { dueAt: true } },
        interviews: { orderBy: { scheduledAt: "desc" }, take: 5, select: { scheduledAt: true, type: true, confirmationStatus: true, attendanceStatus: true } },
        // A small window of recent activity feeds both the "Last Activity" column
        // (index 0) and the hover preview (most-recent NOTE_ADDED + CALL_* lookup).
        activities: { orderBy: { createdAt: "desc" }, take: 12, select: { type: true, createdAt: true, notes: true, user: { select: { name: true } } } },
        // Resume presence stays a per-row relation count (cheap, direct relation).
        _count: { select: { resumes: true } },
      },
    }),
    getHrUsers(),
    prisma.hRCandidate.groupBy({ by: ["status"], where: { ...scope, deletedAt: null }, _count: { id: true } }),
  ]);

  // Total for pagination: derive from the chip groupBy on the default view (no 2nd
  // aggregate), else a targeted count for the filtered set. Audit #144.
  const CLOSED_SET = new Set<string>(CLOSED_STATUS_KEYS);
  const total = hasNarrowingFilter
    ? await prisma.hRCandidate.count({ where })
    : counts.reduce((sum, r) => sum + ((!showClosed && CLOSED_SET.has(r.status)) ? 0 : r._count.id), 0);

  // Unread-signal counts in TWO grouped queries over JUST the visible page's ids,
  // instead of a correlated subquery per candidate row.
  const pageIds = candidates.map(c => c.id);
  const [voiceGroups, escGroups] = pageIds.length === 0
    ? [[], []]
    : await Promise.all([
        // UNREAD voice guidance for the current viewer — GUIDANCE messages this
        // user has NOT yet marked understood (no HRVoiceMessageRead row).
        prisma.hRVoiceMessage.groupBy({
          by: ["candidateId"],
          where: { candidateId: { in: pageIds }, kind: "GUIDANCE", reads: { none: { userId: me.id } } },
          _count: { _all: true },
        }),
        // Open escalation threads (anything not yet RESOLVED).
        prisma.hREscalation.groupBy({
          by: ["candidateId"],
          where: { candidateId: { in: pageIds }, status: { not: "RESOLVED" } },
          _count: { _all: true },
        }),
      ]);
  const voiceMap = new Map(voiceGroups.map(g => [g.candidateId, g._count._all]));
  const escMap = new Map(escGroups.map(g => [g.candidateId, g._count._all]));

  const countMap: Record<string, number> = {};
  counts.forEach(r => { countMap[r.status] = r._count.id; });
  const rows = candidates.map(c => {
    const unreadVoiceCount = voiceMap.get(c.id) ?? 0;
    const openEscalationCount = escMap.get(c.id) ?? 0;
    return {
      ...c,
      hasResume: c._count.resumes > 0,
      unreadVoiceCount,
      openEscalationCount,
      hasUnread: unreadVoiceCount > 0 || openEscalationCount > 0,
    };
  });

  // Pagination window for the prev/next controls + "showing X of N".
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const fromRow = total === 0 ? 0 : skip + 1;
  const toRow = Math.min(skip + PAGE_SIZE, total);
  // Preserve the current query string (closed / status / batch / q) across page links.
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.closed) params.set("closed", sp.closed);
    if (sp.status) params.set("status", sp.status);
    if (sp.batch) params.set("batch", sp.batch);
    if (sp.source) params.set("source", sp.source);
    if (sp.ownerId) params.set("ownerId", sp.ownerId);
    if (sp.from) params.set("from", sp.from);
    if (sp.to) params.set("to", sp.to);
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/hr/candidates?${params.toString()}`;
  };
  // Active drill-down filters → a small dismissible banner so the segment is obvious.
  const activeFilters = [
    filterStatus && `Status: ${filterStatus.replace(/_/g, " ")}`,
    sp.source && `Source: ${sp.source}`,
    sp.ownerId && `Owner: ${agents.find(a => a.id === sp.ownerId)?.name ?? sp.ownerId}`,
    (sp.from || sp.to) && `Added: ${sp.from ?? "…"} → ${sp.to ?? "…"}`,
  ].filter(Boolean) as string[];

  return (
    <div className="p-4 sm:p-6 max-w-full space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Candidates</h1>
        <div className="flex gap-2">
          <Link href={showClosed ? "/hr/candidates?closed=0" : "/hr/candidates"}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition">
            {showClosed ? "Active only" : "Show all"}
          </Link>
          {perms.importData && (
            <Link href="/hr/import" className="text-sm px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">📥 Import</Link>
          )}
          {perms.deleteCandidate && (
            <Link href="/hr/candidates/recycle-bin" className="text-sm px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition">🗑 Recycle Bin</Link>
          )}
          <Link href="/hr/candidates/new"
            className="text-sm px-4 py-1.5 rounded-lg bg-[#1a2e4a] text-white font-semibold hover:bg-[#243d60] transition">
            + Add Candidate
          </Link>
        </div>
      </div>
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg px-3 py-2">
          <span className="font-semibold text-blue-800 dark:text-blue-300">Filtered:</span>
          {activeFilters.map(f => <span key={f} className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">{f}</span>)}
          <Link href="/hr/candidates" className="ml-auto text-blue-700 dark:text-blue-300 underline hover:no-underline">Clear ✕</Link>
        </div>
      )}
      <HRCandidateTable
        candidates={rows as never}
        agents={agents}
        countMap={countMap}
        serverSearch={q}
        showClosed={showClosed}
        meId={me.id}
        meRole={me.role}
        perms={{
          importData: perms.importData,
          exportData: perms.exportData,
          bulkActions: perms.bulkActions,
          assign: perms.assign,
          deleteCandidate: perms.deleteCandidate,
        }}
      />

      {/* Server pagination — prev/next + showing X of N */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="text-xs text-gray-500 dark:text-slate-400">
          {total === 0 ? "No candidates" : <>Showing <span className="font-semibold text-gray-700 dark:text-slate-200">{fromRow}–{toRow}</span> of <span className="font-semibold text-gray-700 dark:text-slate-200">{total}</span></>}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1
              ? <Link href={pageHref(page - 1)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition">← Prev</Link>
              : <span className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 text-gray-300 dark:text-slate-600 cursor-not-allowed">← Prev</span>}
            <span className="text-xs text-gray-500 dark:text-slate-400">Page {page} of {totalPages}</span>
            {page < totalPages
              ? <Link href={pageHref(page + 1)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition">Next →</Link>
              : <span className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 text-gray-300 dark:text-slate-600 cursor-not-allowed">Next →</span>}
          </div>
        )}
      </div>
    </div>
  );
}
