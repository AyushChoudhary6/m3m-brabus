import { requireHrPagePermission } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { statusLabel, CLOSED_STATUS_KEYS } from "@/lib/hrStatus";
import { istDayRange, istDateKey, isValidDateKey } from "@/lib/datetime";
import { getHrUsers } from "@/lib/hrUsers";
import HRRecruiterCsvButton, { type RecruiterRow } from "@/components/HRRecruiterCsvButton";

export const dynamic = "force-dynamic";

const CALL_TYPES = ["CALL_CONNECTED", "CALL_NOT_ANSWERED", "CALL_BUSY", "CALL_SWITCHED_OFF", "CALL_WRONG_NUMBER", "CALL_LATER"];
const FUNNEL = ["NEW", "NOT_CALLED", "INTERESTED", "PIPELINE", "VIRTUAL_INTERVIEW_SCHEDULED", "F2F_INTERVIEW_SCHEDULED", "INTERVIEW_HELD", "SHORTLISTED", "OFFER_RELEASED", "JOINED"];
// Saturated status dot per funnel stage (matches the chip colours in hrStatus.ts).
// Full static class strings so Tailwind emits them (no dynamic `bg-${x}` interpolation).
const FUNNEL_DOT: Record<string, string> = {
  NEW: "bg-blue-500 dark:bg-blue-400",
  NOT_CALLED: "bg-slate-400 dark:bg-slate-500",
  INTERESTED: "bg-emerald-500 dark:bg-emerald-400",
  PIPELINE: "bg-emerald-500 dark:bg-emerald-400",
  VIRTUAL_INTERVIEW_SCHEDULED: "bg-indigo-500 dark:bg-indigo-400",
  F2F_INTERVIEW_SCHEDULED: "bg-purple-500 dark:bg-purple-400",
  INTERVIEW_HELD: "bg-cyan-500 dark:bg-cyan-400",
  SHORTLISTED: "bg-teal-500 dark:bg-teal-400",
  OFFER_RELEASED: "bg-amber-500 dark:bg-amber-400",
  JOINED: "bg-green-500 dark:bg-green-400",
};

function countBy<T extends string>(arr: { _count: number }[], key: T): Record<string, number> {
  const m: Record<string, number> = {};
  for (const r of arr) { const k = (r as Record<string, unknown>)[key]; if (k) m[String(k)] = r._count; }
  return m;
}

export default async function HRReportsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireHrPagePermission("reports");
  const sp = await searchParams;
  const period = sp.period ?? "30d";

  // IST-anchored period boundaries so "Today"/"This month" match the dashboard +
  // export (they previously used server-local midnight, ~5.5h off). Audit #31.
  let since: Date | undefined;
  if (period === "today") { since = istDayRange().start; }
  else if (period === "7d") since = new Date(Date.now() - 7 * 864e5);
  else if (period === "30d") since = new Date(Date.now() - 30 * 864e5);
  else if (period === "month") { since = new Date(`${istDateKey().slice(0, 7)}-01T00:00:00+05:30`); }
  else if (period === "custom") { since = sp.from && isValidDateKey(sp.from) ? istDayRange(sp.from).start : undefined; } // audit #56
  // Period end — funnel/time-to-hire count activity that happened up to "now" (or the
  // custom `to` day end) within the window.
  const periodEnd = (period === "custom" && sp.to && isValidDateKey(sp.to)) ? istDayRange(sp.to).end : new Date();
  const actWhere = since ? { createdAt: { gte: since }, candidate: { deletedAt: null } } : { candidate: { deletedAt: null } };
  // Candidate counts in this report are "current snapshot" of candidates ADDED in the period.
  const candWhere = since ? { createdAt: { gte: since }, deletedAt: null } : { deletedAt: null };
  // Activity-timestamp window for the PERIOD-SCOPED conversion funnel + time-to-hire.
  // Counts the progression EVENTS that occurred inside the selected period.
  const actWindow = since ? { gte: since, lte: periodEnd } : { lte: periodEnd };

  // TRUE-COHORT funnel: DISTINCT candidates who were ADDED in the period (candWhere)
  // AND reached each stage (milestone activity by period-end). Restricting to the
  // added-in-period cohort guarantees every stage is a subset of "Applied", so a
  // conversion % can never exceed 100% by counting a candidate added before the
  // window (previously the numerators counted any candidate active in-window).
  const distinctCandActivity = (types: string[]) =>
    prisma.hRActivity.groupBy({
      by: ["candidateId"],
      where: { type: { in: types as never[] }, createdAt: { lte: periodEnd }, candidate: candWhere },
      _count: true,
    });

  // Per-recruiter, period-scoped, DISTINCT-candidate activity counting.
  // groupBy [userId, candidateId] → one row per (recruiter, candidate). Counting
  // rows per userId then yields DISTINCT candidates that recruiter progressed in
  // the window — so a reschedule / re-log does NOT double-credit the recruiter
  // (matches how the funnel counts distinct candidates, not activity rows).
  const distinctPerRecruiter = (filter: Prisma.HRActivityWhereInput) =>
    prisma.hRActivity.groupBy({
      by: ["userId", "candidateId"],
      where: { ...filter, userId: { not: null }, createdAt: actWindow, candidate: { deletedAt: null } },
    });
  // Collapse [userId, candidateId] rows → distinct-candidate count per userId.
  const distinctByUser = (rows: { userId: string | null }[]): Record<string, number> => {
    const m: Record<string, number> = {};
    for (const r of rows) if (r.userId) m[r.userId] = (m[r.userId] ?? 0) + 1;
    return m;
  };

  // Per-promise fallback: one failed query must NOT blank the whole report.
  // `safe` preserves the SUCCESS type (fallback must match it), so no widened
  // union breaks downstream inference — on error it logs and yields the fallback.
  const safe = <T,>(label: string, p: Promise<T>, fallback: T): Promise<T> =>
    p.catch((e) => { console.error(`[hr-reports] query failed: ${label}`, e); return fallback; });

  const [
    users, calls, added, ivSchedRows, ivDoneRows, shortlistedRows, offerRows, joinedRows, funnel,
    sourceGroup, joinedThisPeriod, offersReleasedPeriod,
    pvInterviewed, pvOffered, pvJoined, timeToHireRaw,
  ] = await Promise.all([
    safe("users", getHrUsers(), []),
    safe("calls", prisma.hRActivity.groupBy({ by: ["userId"], where: { type: { in: CALL_TYPES as never[] }, ...actWhere }, _count: true }), []),
    safe("added", prisma.hRCandidate.groupBy({ by: ["primaryOwnerId"], where: candWhere, _count: true }), []),
    // Iv Sched / Iv Done — DISTINCT candidates per recruiter, in-window (not activity rows).
    safe("ivSched", distinctPerRecruiter({ type: "INTERVIEW_SCHEDULED" }), []),
    safe("ivDone", distinctPerRecruiter({ type: "INTERVIEW_ATTENDED" }), []),
    // Shortlisted / Offers / Joined — PERIOD-SCOPED via progression activities in-window,
    // DISTINCT candidate per recruiter, replacing the previous all-time status snapshot.
    // Shortlisted has no dedicated activity type → detect STATUS_CHANGED → SHORTLISTED.
    safe("shortlisted", distinctPerRecruiter({ type: "STATUS_CHANGED", newStatus: "SHORTLISTED" }), []),
    safe("offers", distinctPerRecruiter({ type: "OFFER_RELEASED" }), []),
    safe("joined", distinctPerRecruiter({ type: "CANDIDATE_JOINED" }), []),
    safe("funnel", prisma.hRCandidate.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }), []),
    // Source performance — group candidates added in the period by source.
    safe("sourceGroup", prisma.hRCandidate.groupBy({ by: ["source"], where: candWhere, _count: true }), []),
    safe("joinedThisPeriod", prisma.hRActivity.count({ where: { type: "CANDIDATE_JOINED", ...actWhere } }), 0),
    safe("offersReleasedPeriod", prisma.hRActivity.count({ where: { type: "OFFER_RELEASED", ...actWhere } }), 0),
    // ── Period-scoped conversion funnel (distinct candidates by activity type, in-window) ──
    // "Attended Interview" = candidates who ATTENDED (INTERVIEW_ATTENDED), not merely
    // scheduled — scheduled-but-no-show should not count as having reached interview.
    safe("pvInterviewed", distinctCandActivity(["INTERVIEW_ATTENDED"]), []),
    safe("pvOffered", distinctCandActivity(["OFFER_RELEASED"]), []),
    safe("pvJoined", distinctCandActivity(["CANDIDATE_JOINED"]), []),
    // ── Time-to-hire: days from candidate.createdAt → earliest CANDIDATE_JOINED activity in-window ──
    // DISTINCT-on candidateId (GROUP BY) to avoid double counting if multiple join activities exist.
    safe("timeToHire", prisma.$queryRaw<{ avg_days: number | null; min_days: number | null; max_days: number | null; n: bigint }[]>(
      Prisma.sql`
      SELECT
        AVG(diff_days)::float AS avg_days,
        MIN(diff_days)::float AS min_days,
        MAX(diff_days)::float AS max_days,
        COUNT(*)::bigint      AS n
      FROM (
        SELECT
          a."candidateId",
          EXTRACT(EPOCH FROM (MIN(a."createdAt") - c."createdAt")) / 86400.0 AS diff_days
        FROM "HRActivity" a
        JOIN "HRCandidate" c ON c.id = a."candidateId"
        WHERE a."type" = 'CANDIDATE_JOINED'
          AND c."deletedAt" IS NULL
          AND a."createdAt" <= ${periodEnd}
          ${since ? Prisma.sql`AND a."createdAt" >= ${since}` : Prisma.empty}
        GROUP BY a."candidateId", c."createdAt"
      ) sub
      WHERE diff_days >= 0
    `), []),
  ]);

  // ── Call-outcome breakdown + connect rate (audit #75) and candidate aging by
  //    current stage (audit #76). Kept out of the big Promise.all above for clarity. ──
  const [callsByOutcome, agingRows] = await Promise.all([
    safe("callsByOutcome", prisma.hRActivity.groupBy({ by: ["type"], where: { type: { in: CALL_TYPES as never[] }, ...actWhere }, _count: true }), [] as { type: string; _count: number }[]),
    safe("agingRows", prisma.hRCandidate.findMany({ where: { deletedAt: null, status: { notIn: CLOSED_STATUS_KEYS as never[] } }, select: { status: true, createdAt: true }, take: 5000 }), [] as { status: string; createdAt: Date }[]),
  ]);

  const cCalls = countBy(calls, "userId"), cAdded = countBy(added, "primaryOwnerId");
  // Iv Sched / Iv Done / Shortlisted / Offers / Joined — distinct candidates per recruiter,
  // in-period (activity-derived; credited to the recruiter who logged the progression).
  const cSched = distinctByUser(ivSchedRows), cDone = distinctByUser(ivDoneRows);
  const cShort = distinctByUser(shortlistedRows), cOff = distinctByUser(offerRows), cJoin = distinctByUser(joinedRows);
  const fmap = countBy(funnel, "status");

  // ── Call-outcome breakdown + connect rate (#75) ──
  const CALL_LABEL: Record<string, string> = {
    CALL_CONNECTED: "Connected", CALL_NOT_ANSWERED: "Not Answered", CALL_BUSY: "Busy",
    CALL_SWITCHED_OFF: "Switched Off", CALL_WRONG_NUMBER: "Wrong Number", CALL_LATER: "Call Later",
  };
  const callOutcomeMap: Record<string, number> = {};
  for (const r of callsByOutcome) callOutcomeMap[r.type] = r._count;
  const callsTotalAll = CALL_TYPES.reduce((n, t) => n + (callOutcomeMap[t] ?? 0), 0);
  const connectedCalls = callOutcomeMap["CALL_CONNECTED"] ?? 0;
  const connectRate = callsTotalAll > 0 ? Math.round((connectedCalls / callsTotalAll) * 100) : 0;
  const callOutcomeRows = CALL_TYPES.map(t => ({ type: t, label: CALL_LABEL[t] ?? t, n: callOutcomeMap[t] ?? 0 }))
    .filter(r => r.n > 0).sort((a, b) => b.n - a.n);

  // ── Candidate aging by current stage (#76) — days since added, active candidates ──
  const AGE_BUCKETS: [string, number, number][] = [["0–3d", 0, 3], ["4–7d", 4, 7], ["8–14d", 8, 14], ["15–30d", 15, 30], ["30d+", 31, Infinity]];
  const refMs = periodEnd.getTime();
  const agingByStatus: Record<string, number[]> = {};
  for (const c of agingRows) {
    const ageDays = Math.floor((refMs - new Date(c.createdAt).getTime()) / 86_400_000);
    let idx = AGE_BUCKETS.findIndex(([, lo, hi]) => ageDays >= lo && ageDays <= hi);
    if (idx < 0) idx = AGE_BUCKETS.length - 1;
    (agingByStatus[c.status] ??= new Array(AGE_BUCKETS.length).fill(0))[idx]++;
  }
  const agingStatusRows = Object.entries(agingByStatus)
    .map(([status, counts]) => ({ status, counts, total: counts.reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total);

  const rows = users.map(u => ({
    name: u.name,
    calls: cCalls[u.id] ?? 0, added: cAdded[u.id] ?? 0, sched: cSched[u.id] ?? 0, done: cDone[u.id] ?? 0,
    short: cShort[u.id] ?? 0, off: cOff[u.id] ?? 0, join: cJoin[u.id] ?? 0,
  })).filter(r => r.calls || r.added || r.sched || r.done || r.short || r.off || r.join)
    .sort((a, b) => (b.calls + b.added + b.sched + b.done) - (a.calls + a.added + a.sched + a.done));

  // Owner attribution (audit #38): "Added" is credited to a candidate's CURRENT primary
  // owner (there is no creator field), so reassignment moves the credit. Candidates with
  // no owner — or owned by a user not in this HR list (e.g. deactivated) — would otherwise
  // vanish from this table while still counting in the funnel's "Applied". Surface them as
  // an explicit Unassigned row so the Added column reconciles exactly with Applied.
  const totalAdded = added.reduce((a, r) => a + r._count, 0);
  const listedAdded = rows.reduce((n, r) => n + r.added, 0);
  const unassignedAdded = Math.max(0, totalAdded - listedAdded);
  if (unassignedAdded > 0) {
    rows.push({ name: "Unassigned", calls: 0, added: unassignedAdded, sched: 0, done: 0, short: 0, off: 0, join: 0 });
  }

  const totals = rows.reduce((t, r) => ({
    calls: t.calls + r.calls, added: t.added + r.added, sched: t.sched + r.sched, done: t.done + r.done,
    short: t.short + r.short, off: t.off + r.off, join: t.join + r.join,
  }), { calls: 0, added: 0, sched: 0, done: 0, short: 0, off: 0, join: 0 });

  const csvRows: RecruiterRow[] = rows.map(r => ({ ...r }));

  // ── Source performance ──
  const sourceRows = sourceGroup
    .map(s => ({ source: (s.source && s.source.trim()) || "Unknown", n: s._count }))
    .sort((a, b) => b.n - a.n);
  const sourceTotal = sourceRows.reduce((t, s) => t + s.n, 0);
  const maxSource = Math.max(1, ...sourceRows.map(s => s.n));

  // ── Conversion funnel (PERIOD-SCOPED) ──
  // Applied = candidates ADDED in the period (all owners, not just those with later activity).
  // Each later stage = DISTINCT candidates with the matching progression activity IN-WINDOW.
  // "all" period → these become lifetime totals (since/window unbounded below), accurately.
  // Clamp to [0,100] — a conversion rate is a proportion and can't exceed 100%.
  // (Guards the rare edge where a cohort candidate is offered without a logged
  //  "attended" activity, which would otherwise make offered% > attended%.)
  const pct = (n: number, d: number) => d > 0 ? Math.min(100, Math.round((n / d) * 1000) / 10) : 0;
  // Reuse the same total the recruiter table reconciles to (incl. the Unassigned row),
  // so "Applied" here === the Added column's sum, by construction (audit #38).
  const appliedAll = totalAdded;
  // "Attended Interview" = candidates who actually ATTENDED (INTERVIEW_ATTENDED) in-window —
  // NOT merely scheduled. Scheduled-but-no-show no longer inflates this stage.
  const interviewedN = pvInterviewed.length;   // distinct candidates who attended an interview in-window
  const offeredN = pvOffered.length;           // distinct candidates with offer-released activity in-window
  const joinedN = pvJoined.length;             // distinct candidates with join activity in-window
  const conv = [
    { label: "Applied", n: appliedAll, of: "added in period" },
    { label: "Attended Interview", n: interviewedN, of: appliedAll > 0 ? `${pct(interviewedN, appliedAll)}% of applied` : "—" },
    { label: "Offered", n: offeredN, of: interviewedN > 0 ? `${pct(offeredN, interviewedN)}% of attended` : "—" },
    { label: "Joined", n: joinedN, of: offeredN > 0 ? `${pct(joinedN, offeredN)}% of offered` : "—" },
  ];

  // ── Time-to-hire (PERIOD-SCOPED): avg days from candidate.createdAt → join activity, for in-window joins ──
  const tth = timeToHireRaw?.[0];
  const tthCount = tth?.n != null ? Number(tth.n) : 0;
  // Round to 1dp; guard against negative/zero diffs (e.g. a join activity backdated
  // before the candidate's createdAt) — these are meaningless as a "time to hire",
  // so collapse anything ≤ 0 (or non-finite) to null → renders "—", never a negative.
  const fmt1 = (v: number | null | undefined) =>
    v == null || !Number.isFinite(v) || v <= 0 ? null : Math.round(v * 10) / 10;
  const tthAvg = tthCount > 0 ? fmt1(tth?.avg_days) : null;
  const tthMin = tthCount > 0 ? fmt1(tth?.min_days) : null;
  const tthMax = tthCount > 0 ? fmt1(tth?.max_days) : null;
  const dayStr = (v: number | null) => v == null ? "—" : `${v} ${v === 1 ? "day" : "days"}`;

  // ── Offers / Joining summary (current snapshot) ──
  const offerSummary = [
    { label: "Offers Released", n: fmap["OFFER_RELEASED"] ?? 0, color: "text-amber-700 dark:text-amber-400", status: "OFFER_RELEASED" },
    { label: "Expected Joinings", n: fmap["EXPECTED_JOINING"] ?? 0, color: "text-lime-700 dark:text-lime-400", status: "EXPECTED_JOINING" },
    { label: "Joined (total)", n: fmap["JOINED"] ?? 0, color: "text-green-700 dark:text-green-400", status: "JOINED" },
    { label: "Offers Declined", n: fmap["OFFER_DECLINED"] ?? 0, color: "text-orange-700 dark:text-orange-400", status: "OFFER_DECLINED" },
  ];

  const periods = [["today", "Today"], ["7d", "Last 7 days"], ["30d", "Last 30 days"], ["month", "This month"], ["all", "All time"]];
  const maxFunnel = Math.max(1, ...FUNNEL.map(s => fmap[s] ?? 0));
  const funnelTotal = FUNNEL.reduce((sum, s) => sum + (fmap[s] ?? 0), 0);
  const periodLabel = period === "custom"
    ? `${sp.from ?? "start"} → ${sp.to ?? "today"}`
    : (periods.find(p => p[0] === period)?.[1]) ?? "Last 30 days";
  // Query-string range for source drill-downs (candidates added in the period).
  const rangeQS = since ? `&from=${istDateKey(since)}&to=${istDateKey(periodEnd)}` : "";
  // Rejection / closed breakdown (current snapshot), clickable — audit #77.
  const rejectionRows = CLOSED_STATUS_KEYS
    .map(s => ({ status: s, n: fmap[s] ?? 0 }))
    .filter(r => r.n > 0)
    .sort((a, b) => b.n - a.n);
  const rejectionTotal = rejectionRows.reduce((sum, r) => sum + r.n, 0);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Recruiter performance, pipeline &amp; conversion</p>
        </div>
        <div className="flex gap-1 flex-wrap items-center">
          {periods.map(([k, label]) => (
            <Link key={k} href={`/hr/reports?period=${k}`}
              className={`text-xs px-3 py-1.5 rounded-lg border ${period === k ? "bg-[#1a2e4a] text-white border-[#1a2e4a]" : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
              {label}
            </Link>
          ))}
          {/* Custom date range (audit #56) — native GET form, no client JS. */}
          <form method="get" action="/hr/reports" className="flex items-center gap-1 ml-1">
            <input type="hidden" name="period" value="custom" />
            <input type="date" name="from" defaultValue={sp.from ?? ""} className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
            <span className="text-gray-400 text-xs">→</span>
            <input type="date" name="to" defaultValue={sp.to ?? ""} className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
            <button type="submit" className={`text-xs px-3 py-1.5 rounded-lg border ${period === "custom" ? "bg-[#1a2e4a] text-white border-[#1a2e4a]" : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}>Go</button>
          </form>
        </div>
      </div>

      {/* Conversion funnel — PERIOD-SCOPED (cohort added in period, tracked via activity timestamps) */}
      <div>
        <div className="flex items-baseline gap-2 mb-2">
          <div className="text-sm font-semibold text-gray-700 dark:text-slate-200">Conversion Funnel</div>
          <span className="text-[11px] font-normal text-gray-400">{periodLabel.toLowerCase()} · cohort added in period, progressed via activity</span>
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          {conv.map((c) => (
            <div key={c.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
              <div className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{c.label}</div>
              <div className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1">{c.n}</div>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{c.of}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Time-to-hire — PERIOD-SCOPED (candidates joined in period; createdAt → join activity) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-baseline gap-2 mb-3">
          <div className="text-sm font-semibold text-gray-700 dark:text-slate-200">Time to Hire</div>
          <span className="text-[11px] font-normal text-gray-400">
            {tthCount > 0
              ? `avg from added → joined · ${tthCount} joined in ${periodLabel.toLowerCase()}`
              : `no candidates joined in ${periodLabel.toLowerCase()}`}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-gray-50 dark:bg-slate-800 p-3">
            <div className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-400">{dayStr(tthAvg)}</div>
            <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Average</div>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-slate-800 p-3">
            <div className="text-2xl font-extrabold text-gray-700 dark:text-slate-200">{dayStr(tthMin)}</div>
            <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Fastest</div>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-slate-800 p-3">
            <div className="text-2xl font-extrabold text-gray-700 dark:text-slate-200">{dayStr(tthMax)}</div>
            <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Slowest</div>
          </div>
        </div>
        {/* One-line caption — explains exactly what "time to hire" measures. */}
        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-3">
          Calendar days from when a candidate was added (created) to their join activity, for candidates joined in {periodLabel.toLowerCase()}. Excludes join activity backdated before the candidate was added (only non-negative durations are counted).
        </p>
      </div>

      {/* Offers / Joining summary + new this period */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">Offers &amp; Joining (current)</div>
          <div className="grid grid-cols-2 gap-3">
            {offerSummary.map(o => (
              <Link key={o.label} href={`/hr/candidates?status=${o.status}`}
                className="rounded-xl bg-gray-50 dark:bg-slate-800 p-3 hover:ring-2 hover:ring-blue-300/60 transition block">
                <div className={`text-2xl font-extrabold ${o.color}`}>{o.n}</div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{o.label} <span className="text-blue-500">→</span></div>
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">Activity in {periodLabel}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 dark:bg-slate-800 p-3">
              <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-400">{totals.added}</div>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Candidates Added</div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-slate-800 p-3">
              <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">{totals.calls}</div>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Calls Logged</div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-slate-800 p-3">
              <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">{offersReleasedPeriod}</div>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Offers Released</div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-slate-800 p-3">
              <div className="text-2xl font-extrabold text-green-700 dark:text-green-400">{joinedThisPeriod}</div>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Joined (this period)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recruiter performance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-gray-700 dark:text-slate-200">
            Recruiter Performance
            {/* Period-vs-snapshot hint — visible on mobile too (was hidden sm:inline).
                On phones it wraps onto its own line; on ≥sm it sits inline after the title. */}
            <span className="text-[11px] font-normal text-gray-400 sm:ml-2 block sm:inline mt-0.5 sm:mt-0">all columns are {periodLabel.toLowerCase()} activity (distinct candidates per stage); Added is credited to the candidate&apos;s current owner</span>
          </div>
          <HRRecruiterCsvButton rows={csvRows} period={period} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-3 py-2.5">Recruiter</th>
                {["Calls", "Added", "Iv Sched", "Iv Done", "Shortlisted", "Offers", "Joined"].map(h => <th key={h} className="px-3 py-2.5 text-center whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 dark:text-slate-500 text-xs">No recruiter activity in this period.</td></tr>}
              {rows.map(r => (
                <tr key={r.name} className={`hover:bg-gray-50/80 dark:hover:bg-slate-800/50 ${r.name === "Unassigned" ? "italic text-gray-400 dark:text-slate-500" : ""}`}>
                  <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-slate-200 whitespace-nowrap">{r.name === "Unassigned" ? <span className="text-gray-400 dark:text-slate-500">Unassigned</span> : r.name}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700 dark:text-slate-300">{r.calls}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700 dark:text-slate-300">{r.added}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700 dark:text-slate-300">{r.sched}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700 dark:text-slate-300">{r.done}</td>
                  <td className="px-3 py-2.5 text-center text-teal-700 dark:text-teal-400 font-medium">{r.short}</td>
                  <td className="px-3 py-2.5 text-center text-amber-700 dark:text-amber-400 font-medium">{r.off}</td>
                  <td className="px-3 py-2.5 text-center text-green-700 dark:text-green-400 font-semibold">{r.join}</td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 dark:bg-slate-800 font-semibold text-gray-700 dark:text-slate-200">
                  <td className="px-3 py-2.5">Total</td>
                  <td className="px-3 py-2.5 text-center">{totals.calls}</td>
                  <td className="px-3 py-2.5 text-center">{totals.added}</td>
                  <td className="px-3 py-2.5 text-center">{totals.sched}</td>
                  <td className="px-3 py-2.5 text-center">{totals.done}</td>
                  <td className="px-3 py-2.5 text-center">{totals.short}</td>
                  <td className="px-3 py-2.5 text-center">{totals.off}</td>
                  <td className="px-3 py-2.5 text-center">{totals.join}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Source performance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">
          Source Performance
          <span className="text-[11px] font-normal text-gray-400 ml-2">candidates added in {periodLabel.toLowerCase()}</span>
        </div>
        {sourceRows.length === 0 ? (
          <div className="px-2 py-6 text-center text-gray-400 dark:text-slate-500 text-xs">No candidates added in this period.</div>
        ) : (
          <div className="space-y-1.5">
            {sourceRows.map(s => (
              <Link key={s.source} href={`/hr/candidates?source=${encodeURIComponent(s.source)}${rangeQS}`} title={`View ${s.source} candidates`}
                className="flex items-center gap-2 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30 -mx-1 px-1 py-0.5">
                <div className="w-36 shrink-0 text-xs text-gray-700 dark:text-slate-300 truncate">{s.source}</div>
                <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(s.n / maxSource) * 100}%` }} />
                </div>
                <div className="w-20 text-right text-xs font-semibold text-gray-700 dark:text-slate-200 whitespace-nowrap">
                  {s.n} <span className="text-gray-400 font-normal">({sourceTotal > 0 ? Math.round((s.n / sourceTotal) * 100) : 0}%)</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pipeline funnel (current snapshot) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-700 dark:text-slate-200">Pipeline by Status (current)</div>
          {funnelTotal > 0 && <span className="text-[11px] text-gray-400 dark:text-slate-500">{funnelTotal} active</span>}
        </div>
        {funnelTotal === 0 ? (
          <div className="px-2 py-8 text-center text-gray-400 dark:text-slate-500 text-xs">No candidates in the pipeline yet.</div>
        ) : (
          <div className="space-y-1">
            {FUNNEL.map(s => {
              const n = fmap[s] ?? 0;
              return (
                <Link key={s} href={`/hr/candidates?status=${s}`} title={`View ${statusLabel(s)} candidates`}
                  className={`flex items-center gap-2.5 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30 -mx-1 px-1 ${n === 0 ? "opacity-40" : ""}`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${FUNNEL_DOT[s] ?? "bg-slate-400"}`} />
                  <div className="w-40 shrink-0 text-xs text-gray-600 dark:text-slate-300 truncate">{statusLabel(s)}</div>
                  <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    {n > 0 && <div className="h-full bg-[#1a2e4a] dark:bg-blue-400 rounded-full" style={{ width: `${(n / maxFunnel) * 100}%` }} />}
                  </div>
                  <div className="w-10 text-right text-xs font-semibold tabular-nums text-gray-800 dark:text-slate-100">{n}</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection / Closed breakdown (current snapshot) — clickable (audit #77) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-700 dark:text-slate-200">Rejections &amp; Closed (current)</div>
          {rejectionTotal > 0 && <span className="text-[11px] text-gray-400 dark:text-slate-500">{rejectionTotal} closed</span>}
        </div>
        {rejectionRows.length === 0 ? (
          <div className="px-2 py-8 text-center text-gray-400 dark:text-slate-500 text-xs">No closed / rejected candidates.</div>
        ) : (
          <div className="space-y-1">
            {rejectionRows.map(r => (
              <Link key={r.status} href={`/hr/candidates?status=${r.status}&closed=1`} title={`View ${statusLabel(r.status)} candidates`}
                className="flex items-center gap-2.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 -mx-1 px-1">
                <span className="w-2 h-2 rounded-full shrink-0 bg-rose-400" />
                <div className="w-40 shrink-0 text-xs text-gray-600 dark:text-slate-300 truncate">{statusLabel(r.status)}</div>
                <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: `${(r.n / (rejectionRows[0]?.n || 1)) * 100}%` }} />
                </div>
                <div className="w-16 text-right text-xs font-semibold tabular-nums text-gray-800 dark:text-slate-100">
                  {r.n} <span className="text-gray-400 font-normal">({rejectionTotal > 0 ? Math.round((r.n / rejectionTotal) * 100) : 0}%)</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Call outcomes + connect rate (audit #75) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-baseline gap-2 mb-3">
          <div className="text-sm font-semibold text-gray-700 dark:text-slate-200">Call Outcomes</div>
          <span className="text-[11px] font-normal text-gray-400">{periodLabel.toLowerCase()} · {callsTotalAll} calls · <span className="font-semibold text-emerald-600 dark:text-emerald-400">{connectRate}% connect rate</span></span>
        </div>
        {callsTotalAll === 0 ? (
          <div className="px-2 py-6 text-center text-gray-400 dark:text-slate-500 text-xs">No calls logged in this period.</div>
        ) : (
          <div className="space-y-1">
            {callOutcomeRows.map(r => (
              <div key={r.type} className={`flex items-center gap-2.5 py-0.5 ${r.type === "CALL_CONNECTED" ? "" : ""}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${r.type === "CALL_CONNECTED" ? "bg-emerald-500" : r.type === "CALL_WRONG_NUMBER" ? "bg-rose-400" : "bg-amber-400"}`} />
                <div className="w-32 shrink-0 text-xs text-gray-600 dark:text-slate-300 truncate">{r.label}</div>
                <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full ${r.type === "CALL_CONNECTED" ? "bg-emerald-500" : "bg-[#1a2e4a] dark:bg-blue-400"}`} style={{ width: `${(r.n / (callOutcomeRows[0]?.n || 1)) * 100}%` }} />
                </div>
                <div className="w-16 text-right text-xs font-semibold tabular-nums text-gray-800 dark:text-slate-100">{r.n} <span className="text-gray-400 font-normal">({Math.round((r.n / callsTotalAll) * 100)}%)</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate aging by stage (audit #76) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 overflow-x-auto">
        <div className="flex items-baseline gap-2 mb-3">
          <div className="text-sm font-semibold text-gray-700 dark:text-slate-200">Candidate Aging</div>
          <span className="text-[11px] font-normal text-gray-400">active candidates · days since added, by current stage</span>
        </div>
        {agingStatusRows.length === 0 ? (
          <div className="px-2 py-6 text-center text-gray-400 dark:text-slate-500 text-xs">No active candidates.</div>
        ) : (
          <table className="w-full text-xs min-w-[520px]">
            <thead>
              <tr className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-2 py-1.5">Stage</th>
                {AGE_BUCKETS.map(([label]) => <th key={label} className="px-2 py-1.5 text-center">{label}</th>)}
                <th className="px-2 py-1.5 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {agingStatusRows.map(r => (
                <tr key={r.status} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-2 py-1.5"><Link href={`/hr/candidates?status=${r.status}`} className="text-[#1a2e4a] dark:text-blue-400 hover:underline">{statusLabel(r.status)}</Link></td>
                  {r.counts.map((n, i) => <td key={i} className={`px-2 py-1.5 text-center tabular-nums ${i >= 3 && n > 0 ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-gray-700 dark:text-slate-300"}`}>{n || "—"}</td>)}
                  <td className="px-2 py-1.5 text-center font-semibold tabular-nums text-gray-800 dark:text-slate-100">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2">Red = candidates sitting 15+ days — likely stalled. Click a stage to open that list.</p>
      </div>
    </div>
  );
}
