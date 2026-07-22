import { requireHrPage, hrActiveScopeWhere } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import { CLOSED_STATUS_KEYS } from "@/lib/hrStatus";
import { getHrUsers } from "@/lib/hrUsers";
import { greetingFor, tzForTeam, istDayRange } from "@/lib/datetime";
import type { HRActivityType } from "@prisma/client";
import { AlertTriangle, X, Target } from "lucide-react";

import HRRemindersCard, { type HRReminderEvent, type HREventType } from "@/components/HRRemindersCard";

import { HrDashboardChrome } from "@/components/hr-dashboard/HrDashboardChrome";
import { ActionCenterKpis, type HrKpiTile } from "@/components/hr-dashboard/ActionCenterKpis";
// CallNow / NoNextAction / PendingConfirmations / NoShowRecovery are now folded
// into the single HrWorklist below — only their item TYPES are still used to
// shape the worklist rows, so we import types-only (no duplicate queue cards).
import { type CallNowItem } from "@/components/hr-dashboard/CallNowQueue";
import { type NoNextActionItem } from "@/components/hr-dashboard/NoNextActionQueue";
import { TodaysInterviews, type TodaysInterviewItem } from "@/components/hr-dashboard/TodaysInterviews";
import { ExpectedJoinings, type ExpectedJoiningItem } from "@/components/hr-dashboard/ExpectedJoinings";
import { RecruitmentFunnel, type FunnelStage } from "@/components/hr-dashboard/RecruitmentFunnel";
import { DailyProductivity } from "@/components/hr-dashboard/DailyProductivity";
import { Leaderboard, type LeaderboardRow } from "@/components/hr-dashboard/Leaderboard";
import { RecentActivityFeed, type RecentActivityRow } from "@/components/hr-dashboard/RecentActivityFeed";
import { HrWorklist, type WorklistItem } from "@/components/hr-dashboard/HrWorklist";

export const dynamic = "force-dynamic";

// Daily per-recruiter call target (spec item 15). Calls completed today vs this.
const CALL_TARGET = 40;

const CALL_TYPES: HRActivityType[] = [
  "CALL_CONNECTED", "CALL_NOT_ANSWERED", "CALL_BUSY",
  "CALL_SWITCHED_OFF", "CALL_WRONG_NUMBER", "CALL_LATER",
];

// Human-readable label for an activity type, used in the Recent Activity feed.
const ACTIVITY_LABEL: Record<string, string> = {
  CALL_CONNECTED: "Call connected", CALL_NOT_ANSWERED: "Call not answered", CALL_BUSY: "Call busy",
  CALL_SWITCHED_OFF: "Phone switched off", CALL_WRONG_NUMBER: "Wrong number", CALL_LATER: "Call later",
  WHATSAPP_SENT: "WhatsApp sent", WHATSAPP_RECEIVED: "WhatsApp received", EMAIL_LOGGED: "Email logged",
  INTERVIEW_SCHEDULED: "Interview scheduled", INTERVIEW_ATTENDED: "Interview attended",
  INTERVIEW_NO_SHOW: "Interview no-show", INTERVIEW_RESCHEDULED: "Interview rescheduled",
  OFFER_RELEASED: "Offer released", OFFER_DECLINED: "Offer declined", CANDIDATE_JOINED: "Candidate joined",
  FOLLOWUP_CREATED: "Follow-up set", FOLLOWUP_COMPLETED: "Follow-up done", STATUS_CHANGED: "Status changed",
  NOTE_ADDED: "Note added", RESUME_UPLOADED: "Resume uploaded", VOICE_NOTE: "Voice note",
  VOICE_GUIDANCE: "Voice guidance", ESCALATION_RAISED: "Escalation raised",
  ESCALATION_REPLIED: "Escalation reply", ESCALATION_RESOLVED: "Escalation resolved",
};

// HRFollowUp.type → the reminder card's event type + label (legacy HRRemindersCard).
const FU_EVENT: Record<string, { type: HREventType; label: string }> = {
  CALL_BACK: { type: "FOLLOWUP", label: "Call" },
  INTERVIEW_CONFIRMATION: { type: "CONFIRM", label: "Confirm Interview" },
  REMINDER: { type: "FOLLOWUP", label: "Reminder" },
  WHATSAPP_FOLLOWUP: { type: "FOLLOWUP", label: "WhatsApp" },
  EMAIL_FOLLOWUP: { type: "FOLLOWUP", label: "Email" },
  SALARY_DISCUSSION: { type: "FOLLOWUP", label: "Salary Discussion" },
  OFFER_DISCUSSION: { type: "OFFER", label: "Offer Discussion" },
  JOINING_FOLLOWUP: { type: "OFFER", label: "Joining Follow-up" },
  NO_SHOW_RECOVERY: { type: "FOLLOWUP", label: "No-Show Recovery" },
  CUSTOM: { type: "FOLLOWUP", label: "Follow-up" },
};

// Interview-type enum label (mirrors TodaysInterviews / readable form elsewhere).
function fmtType(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function firstNameOf(name: string | null | undefined): string | null {
  const n = (name ?? "").trim();
  return n ? n.split(/\s+/)[0] : null;
}

// Whole-day difference between two instants, IST calendar-day based, floored.
function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}

// Friendly names for the perms the auth engine bounces Junior HR away from
// (requireHrPagePermission redirects e.g. /hr?denied=reports). Anything not
// listed falls back to a generic "that page" message so the banner never
// shows a raw permission key.
const DENIED_LABELS: Record<string, string> = {
  reports: "Reports",
  importData: "Import",
  settings: "Settings",
  exportData: "Export",
  manageUsers: "User Management",
  systemSettings: "Settings",
};

export default async function HRDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const { me, perms } = await requireHrPage();
  const sp = await searchParams;

  // Permission-denied banner: the auth engine redirects a Junior HR who hits a
  // forbidden page back here as /hr?denied=<perm>. Surface a friendly, dismissible
  // amber notice instead of a silent bounce.
  const deniedPerm = sp.denied;
  const deniedLabel = deniedPerm ? DENIED_LABELS[deniedPerm] ?? null : null;

  const now = new Date();
  const { start: todayStart, end: todayEnd } = istDayRange(); // today (IST) [start, end)
  const todayIso = todayStart.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 3600_000);

  // Scope EVERY candidate read: Junior HR → own only; Admin/Senior → all.
  const scope = hrActiveScopeWhere(me);
  // For { candidate: <scope> } relation filters on HRFollowUp / HRInterview / HRActivity.
  const scopedCandidate = hrActiveScopeWhere(me);

  const isLeader = perms.reports; // Leaderboard only when the viewer has reports perm.
  const showOwner = perms.viewAllCandidates; // Admin / Senior HR see the owning recruiter.

  // Per-promise fallback defaults: one failed query must NOT blank the whole
  // dashboard. Each `.catch` logs and resolves to an empty/zero shape of the
  // SAME type as the query, so downstream code keeps rendering the rest.
  type FollowUpRow = Awaited<ReturnType<typeof loadFollowUps>>[number];
  type InterviewRow = Awaited<ReturnType<typeof loadInterviews>>[number];
  type ExpectedRow = Awaited<ReturnType<typeof loadExpected>>[number];
  type NoNextRow = Awaited<ReturnType<typeof loadNoNext>>[number];
  type RecentRow = Awaited<ReturnType<typeof loadRecent>>[number];
  type StatusGroupRow = { status: string; _count: number };
  type UserGroupRow = { userId: string | null; _count: number };

  function loadFollowUps() {
    // Open follow-ups (scoped) — drives Call-Now queue, Calls-Due/Overdue KPIs + reminders.
    // Exclude follow-ups on closed candidates so terminal records never haunt the
    // queue, even if a historical row wasn't closed at transition time (audit H1).
    return prisma.hRFollowUp.findMany({
      where: { completedAt: null, candidate: { AND: [scopedCandidate, { status: { notIn: CLOSED_STATUS_KEYS } }] } },
      orderBy: { dueAt: "asc" },
      take: 300,
      include: {
        candidate: {
          select: {
            id: true, name: true, phone: true, whatsappPhone: true,
            status: true,
            primaryOwner: { select: { name: true } },
          },
        },
      },
    });
  }
  function loadInterviews() {
    // Interviews in the recent window (scoped) — Today / Pending-confirm / No-show buckets.
    return prisma.hRInterview.findMany({
      // Exclude interviews whose candidate is already closed/rejected — a closed candidate
      // must never appear in the Today / Pending-confirm / No-show buckets.
      where: { candidate: { AND: [scopedCandidate, { status: { notIn: CLOSED_STATUS_KEYS } }] }, scheduledAt: { gte: weekAgo } },
      orderBy: { scheduledAt: "asc" },
      take: 300,
      include: {
        candidate: { select: { id: true, name: true, phone: true, whatsappPhone: true, status: true } },
      },
    });
  }
  function loadExpected() {
    // Expected Joinings (scoped) — status-based only (no joiningDate column).
    return prisma.hRCandidate.findMany({
      where: { AND: [scope, { status: "EXPECTED_JOINING" }] },
      orderBy: { nextActionDate: { sort: "asc", nulls: "last" } },
      take: 20,
      select: {
        id: true, name: true, status: true,
        phone: true, whatsappPhone: true, primaryOwner: { select: { name: true } },
      },
    });
  }
  function loadNoNext() {
    // No-Next-Action queue rows (scoped) — active candidates with NO OPEN
    // follow-up. Keying off "no open follow-up" (not `nextActionDate: null`)
    // makes this trustworthy: a candidate with a stale past nextActionDate but
    // no actual pending task still surfaces here (audit H2).
    return prisma.hRCandidate.findMany({
      where: { AND: [scope, { status: { notIn: CLOSED_STATUS_KEYS }, followUps: { none: { completedAt: null } } }] },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, name: true, phone: true, whatsappPhone: true,
        status: true, createdAt: true,
        primaryOwner: { select: { name: true } },
      },
    });
  }
  function loadRecent() {
    // Recent Activity feed (scoped).
    return prisma.hRActivity.findMany({
      where: { candidate: scopedCandidate },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        candidate: { select: { id: true, name: true, phone: true, whatsappPhone: true, email: true } },
        user: { select: { name: true } },
      },
    });
  }
  const onErr = (label: string) => (e: unknown) => {
    console.error(`[hr-dashboard] query failed: ${label}`, e);
  };

  const [
    followUps,
    interviews,
    newCount,
    expectedRows,
    noNextRows,
    noNextActionCount,
    expectedFullCount,
    noShowFullCount,
    callsToday,
    recentRows,
    funnelGroup,
    funnelTotal,
    // ── Leaderboard groupings (reports perm only) ──
    hrUsers,
    lbCalls,
    lbFollowups,
    lbIvSched,
    lbIvDone,
    lbOffers,
    lbJoined,
  ] = await Promise.all([
    loadFollowUps().catch((e) => { onErr("followUps")(e); return [] as FollowUpRow[]; }),
    loadInterviews().catch((e) => { onErr("interviews")(e); return [] as InterviewRow[]; }),
    // New Candidates KPI.
    prisma.hRCandidate.count({ where: { AND: [scope, { status: "NEW" }] } })
      .catch((e) => { onErr("newCount")(e); return 0; }),
    loadExpected().catch((e) => { onErr("expectedRows")(e); return [] as ExpectedRow[]; }),
    loadNoNext().catch((e) => { onErr("noNextRows")(e); return [] as NoNextRow[]; }),
    // No-Next-Action total (scoped) — mirrors loadNoNext()'s WHERE exactly.
    prisma.hRCandidate.count({
      where: { AND: [scope, { status: { notIn: CLOSED_STATUS_KEYS }, followUps: { none: { completedAt: null } } }] },
    }).catch((e) => { onErr("noNextActionCount")(e); return 0; }),
    // FULL Expected-Joinings count (scoped) — drives the KPI tile so it is NOT capped
    // at the 20-row list rendered in the widget. Mirrors loadExpected()'s WHERE exactly.
    prisma.hRCandidate.count({
      where: { AND: [scope, { status: "EXPECTED_JOINING" }] },
    }).catch((e) => { onErr("expectedFullCount")(e); return 0; }),
    // FULL distinct No-Show count (scoped, recent window) — drives the KPI tile so it
    // is NOT capped at the 10-row recovery list below. Driven by an OPEN
    // NO_SHOW_RECOVERY follow-up (not a fixed 7-day scheduledAt window), so an
    // unresolved no-show never silently drops off after a week — it stays until
    // the recovery task is actually completed (audit #109). Distinct candidates.
    prisma.hRFollowUp.findMany({
      where: { completedAt: null, type: "NO_SHOW_RECOVERY", candidate: scopedCandidate },
      select: { candidateId: true }, distinct: ["candidateId"],
    }).then((r) => r.length).catch((e) => { onErr("noShowFullCount")(e); return 0; }),
    // Daily Productivity — CALL_* activities *I personally logged* today (IST). The tile
    // is framed "your target", so it must count the viewer's own calls (userId: me.id),
    // NOT every call on candidates they can see (which, for Admin/Senior, is the whole
    // team's activity and wildly overstates a personal target) — audit #39.
    prisma.hRActivity.count({
      where: { type: { in: CALL_TYPES }, userId: me.id, createdAt: { gte: todayStart, lt: todayEnd }, candidate: { deletedAt: null } },
    }).catch((e) => { onErr("callsToday")(e); return 0; }),
    loadRecent().catch((e) => { onErr("recentRows")(e); return [] as RecentRow[]; }),
    // Recruitment funnel — current candidate snapshot by status (scoped).
    prisma.hRCandidate.groupBy({ by: ["status"], where: scope, _count: true })
      .catch((e) => { onErr("funnelGroup")(e); return [] as StatusGroupRow[]; }),
    prisma.hRCandidate.count({ where: scope })
      .catch((e) => { onErr("funnelTotal")(e); return 0; }),
    // ── Leaderboard (reports perm only). Activity over the week window, by recruiter. ──
    isLeader
      ? getHrUsers().catch((e) => { onErr("hrUsers")(e); return [] as { id: string; name: string }[]; })
      : Promise.resolve([] as { id: string; name: string }[]),
    isLeader
      ? prisma.hRActivity.groupBy({ by: ["userId"], where: { type: { in: CALL_TYPES }, userId: { not: null }, createdAt: { gte: weekAgo }, candidate: { deletedAt: null } }, _count: true })
          .catch((e) => { onErr("lbCalls")(e); return [] as UserGroupRow[]; })
      : Promise.resolve([] as UserGroupRow[]),
    isLeader
      ? prisma.hRActivity.groupBy({ by: ["userId"], where: { type: "FOLLOWUP_COMPLETED", userId: { not: null }, createdAt: { gte: weekAgo }, candidate: { deletedAt: null } }, _count: true })
          .catch((e) => { onErr("lbFollowups")(e); return [] as UserGroupRow[]; })
      : Promise.resolve([] as UserGroupRow[]),
    isLeader
      ? prisma.hRActivity.groupBy({ by: ["userId"], where: { type: "INTERVIEW_SCHEDULED", userId: { not: null }, createdAt: { gte: weekAgo }, candidate: { deletedAt: null } }, _count: true })
          .catch((e) => { onErr("lbIvSched")(e); return [] as UserGroupRow[]; })
      : Promise.resolve([] as UserGroupRow[]),
    isLeader
      ? prisma.hRActivity.groupBy({ by: ["userId"], where: { type: "INTERVIEW_ATTENDED", userId: { not: null }, createdAt: { gte: weekAgo }, candidate: { deletedAt: null } }, _count: true })
          .catch((e) => { onErr("lbIvDone")(e); return [] as UserGroupRow[]; })
      : Promise.resolve([] as UserGroupRow[]),
    isLeader
      ? prisma.hRActivity.groupBy({ by: ["userId"], where: { type: "OFFER_RELEASED", userId: { not: null }, createdAt: { gte: weekAgo }, candidate: { deletedAt: null } }, _count: true })
          .catch((e) => { onErr("lbOffers")(e); return [] as UserGroupRow[]; })
      : Promise.resolve([] as UserGroupRow[]),
    isLeader
      ? prisma.hRActivity.groupBy({ by: ["userId"], where: { type: "CANDIDATE_JOINED", userId: { not: null }, createdAt: { gte: weekAgo }, candidate: { deletedAt: null } }, _count: true })
          .catch((e) => { onErr("lbJoined")(e); return [] as UserGroupRow[]; })
      : Promise.resolve([] as UserGroupRow[]),
  ]);

  // ── Follow-up buckets (day-granular: overdue = due before start-of-today-IST) ──
  const overdueFU = followUps.filter((f) => new Date(f.dueAt) < todayStart);
  const todayFU = followUps.filter((f) => {
    const d = new Date(f.dueAt);
    return d >= todayStart && d < todayEnd;
  });
  // Upcoming follow-ups — due AFTER today, within the next 7 days. These feed a
  // "due soon" tier in the worklist so it's a complete follow-up-date-driven queue.
  const weekAhead = new Date(todayStart.getTime() + 7 * 24 * 3600_000);
  const upcomingFU = followUps.filter((f) => {
    const d = new Date(f.dueAt);
    return d >= todayEnd && d < weekAhead;
  });
  // DISTINCT-candidate counts for the Calls-Due / Overdue KPIs. These run as
  // dedicated DISTINCT queries (NOT derived from the 300-row Call-Now list), so
  // they never undercount / read 0 at volume (audit #6). The Call-Now list stays
  // capped — only the KPI NUMBERS need to span the whole result set.
  const fuKpiWhere = { completedAt: null, candidate: { AND: [scopedCandidate, { status: { notIn: CLOSED_STATUS_KEYS } }] } };
  const [overdueDistinct, todayDistinct] = await Promise.all([
    prisma.hRFollowUp.findMany({ where: { ...fuKpiWhere, dueAt: { lt: todayStart } }, select: { candidateId: true }, distinct: ["candidateId"] }),
    prisma.hRFollowUp.findMany({ where: { ...fuKpiWhere, dueAt: { gte: todayStart, lt: todayEnd } }, select: { candidateId: true }, distinct: ["candidateId"] }),
  ]);
  const overdueCandidateCount = overdueDistinct.length;
  const todayCandidateCount = todayDistinct.length;

  // Extra KPI counts (audit #98/#58/#90/#7/#35): joining today, unassigned, and
  // ACCURATE interview counts (not derived from the capped 300-row window; pending
  // confirmations now counts DISTINCT candidates AND includes NOT_CONFIRMED/NOT_REACHABLE).
  const [joiningTodayCount, unassignedCount, ivTodayCount, confirmPendingCount, ivPipelineGroup] = await Promise.all([
    prisma.hRCandidate.count({ where: { AND: [scopedCandidate, { expectedJoiningDate: { gte: todayStart, lt: todayEnd } }] } }),
    prisma.hRCandidate.count({ where: { AND: [scopedCandidate, { primaryOwnerId: null, status: { notIn: CLOSED_STATUS_KEYS } }] } }),
    prisma.hRInterview.count({ where: { candidate: { AND: [scopedCandidate, { status: { notIn: CLOSED_STATUS_KEYS } }] }, scheduledAt: { gte: todayStart, lt: todayEnd }, attendanceStatus: { in: ["SCHEDULED", "RESCHEDULED"] } } }),
    prisma.hRInterview.findMany({ where: { candidate: { AND: [scopedCandidate, { status: { notIn: CLOSED_STATUS_KEYS } }] }, scheduledAt: { gte: now }, confirmationStatus: { in: ["PENDING", "NOT_CONFIRMED", "NOT_REACHABLE"] }, attendanceStatus: { in: ["SCHEDULED", "RESCHEDULED"] } }, select: { candidateId: true }, distinct: ["candidateId"] }).then(r => r.length),
    // Interview pipeline: distribution by attendance status over the last 30 days +
    // upcoming, for the dashboard panel (audit #99).
    prisma.hRInterview.groupBy({ by: ["attendanceStatus"], where: { candidate: scopedCandidate, scheduledAt: { gte: new Date(todayStart.getTime() - 30 * 24 * 3600_000) } }, _count: true }).catch(() => [] as { attendanceStatus: string; _count: number }[]),
  ]);
  const ivPipeline: Record<string, number> = {};
  for (const g of ivPipelineGroup) ivPipeline[g.attendanceStatus] = g._count;
  const IV_STAGE: [string, string, string][] = [
    ["SCHEDULED", "Scheduled", "bg-blue-500"], ["RESCHEDULED", "Rescheduled", "bg-indigo-500"],
    ["ATTENDED", "Attended", "bg-emerald-500"], ["NO_SHOW", "No-Show", "bg-rose-500"], ["CANCELLED", "Cancelled", "bg-gray-400"],
  ];
  const ivPipelineRows = IV_STAGE.map(([key, label, color]) => ({ key, label, color, n: ivPipeline[key] ?? 0 }));
  const ivPipelineTotal = ivPipelineRows.reduce((s, r) => s + r.n, 0);

  // Call-Now queue — one row per candidate (overdue + due-today, soonest first).
  const callNowSeen = new Set<string>();
  const callNowItems: CallNowItem[] = [...overdueFU, ...todayFU]
    .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt))
    .filter((f) => {
      if (callNowSeen.has(f.candidateId)) return false;
      callNowSeen.add(f.candidateId);
      return true;
    })
    .slice(0, 25)
    .map((f) => ({
      followUpId: f.id,
      candidateId: f.candidateId,
      name: f.candidate.name,
      position: null,
      status: f.candidate.status,
      nextAction: null,
      ownerFirstName: firstNameOf(f.candidate.primaryOwner?.name),
      phone: f.candidate.phone,
      whatsappPhone: f.candidate.whatsappPhone,
      dueIso: new Date(f.dueAt).toISOString(),
      overdue: new Date(f.dueAt) < todayStart,
    }));

  // ── Interview buckets ──
  const ivToday = interviews.filter((iv) => {
    const d = new Date(iv.scheduledAt);
    return (
      d >= todayStart && d < todayEnd &&
      (iv.attendanceStatus === "SCHEDULED" || iv.attendanceStatus === "RESCHEDULED")
    );
  });
  const confirmPending = interviews.filter(
    (iv) =>
      new Date(iv.scheduledAt) >= now &&
      iv.confirmationStatus === "PENDING" &&
      (iv.attendanceStatus === "SCHEDULED" || iv.attendanceStatus === "RESCHEDULED"),
  );
  const noShowSeen = new Set<string>();
  const noShowInterviews = interviews
    .filter((iv) => iv.attendanceStatus === "NO_SHOW")
    .reverse()
    .filter((iv) => {
      if (noShowSeen.has(iv.candidateId)) return false;
      noShowSeen.add(iv.candidateId);
      return true;
    })
    .slice(0, 10);

  // ── Component item shapes ──
  const todaysInterviewItems: TodaysInterviewItem[] = ivToday.map((iv) => ({
    interviewId: iv.id,
    candidateId: iv.candidateId,
    name: iv.candidate.name,
    position: null,
    type: iv.type,
    timeIso: new Date(iv.scheduledAt).toISOString(),
    confirmationStatus: iv.confirmationStatus,
    attendanceStatus: iv.attendanceStatus,
    phone: iv.candidate.phone,
    whatsappPhone: iv.candidate.whatsappPhone,
  }));

  // (pending-confirm & no-show item shapes removed — those rows now live in the
  //  unified HrWorklist below, built from the raw confirmPending / noShowInterviews.)

  const expectedItems: ExpectedJoiningItem[] = expectedRows.map((c) => ({
    candidateId: c.id,
    name: c.name,
    position: null,
    status: c.status,
    joiningIso: null,
    daysUntil: null,
    ownerFirstName: firstNameOf(c.primaryOwner?.name),
    phone: c.phone,
    whatsappPhone: c.whatsappPhone,
  }));

  const noNextItems: NoNextActionItem[] = noNextRows.map((c) => ({
    candidateId: c.id,
    name: c.name,
    position: null,
    status: c.status,
    ownerFirstName: firstNameOf(c.primaryOwner?.name),
    daysSinceCreated: Math.max(0, daysBetween(new Date(c.createdAt), now)),
    phone: c.phone,
    whatsappPhone: c.whatsappPhone,
  }));

  const recentItems: RecentActivityRow[] = recentRows.map((a) => ({
    id: a.id,
    label: ACTIVITY_LABEL[a.type] ?? fmtType(a.type),
    candidateId: a.candidateId,
    candidateName: a.candidate.name,
    userFirstName: firstNameOf(a.user?.name),
    whenIso: new Date(a.createdAt).toISOString(),
    // Optional contact extras the feed renders quick actions from when present.
    phone: a.candidate.phone,
    whatsappPhone: a.candidate.whatsappPhone,
    email: a.candidate.email,
  }));

  // ── Recruitment funnel (canonical order; counts from the scoped status snapshot) ──
  const statusCount: Record<string, number> = {};
  for (const r of funnelGroup) statusCount[r.status] = r._count;
  const sum = (...keys: string[]) => keys.reduce((n, k) => n + (statusCount[k] ?? 0), 0);
  const funnelDefs: { key: string; label: string; count: number }[] = [
    { key: "NEW", label: "New", count: sum("NEW") },
    { key: "NOT_CALLED", label: "Not Called", count: sum("NOT_CALLED") },
    { key: "INTERESTED", label: "Interested", count: sum("INTERESTED") },
    { key: "PIPELINE", label: "Pipeline", count: sum("PIPELINE") },
    { key: "VIRTUAL_INTERVIEW_SCHEDULED", label: "Interview Scheduled", count: sum("VIRTUAL_INTERVIEW_SCHEDULED", "F2F_INTERVIEW_SCHEDULED") },
    { key: "INTERVIEW_HELD", label: "Interview Held", count: sum("INTERVIEW_HELD") },
    { key: "SHORTLISTED", label: "Shortlisted", count: sum("SHORTLISTED") },
    { key: "OFFER_RELEASED", label: "Offer Released", count: sum("OFFER_RELEASED") },
    { key: "EXPECTED_JOINING", label: "Expected Joining", count: sum("EXPECTED_JOINING") }, // audit #34
    { key: "JOINED", label: "Joined", count: sum("JOINED") },
  ];
  const funnelStages: FunnelStage[] = funnelDefs.map((s) => ({
    key: s.key,
    label: s.label,
    count: s.count,
    pct: funnelTotal > 0 ? Math.round((s.count / funnelTotal) * 100) : 0,
  }));

  // ── Reminder events (legacy HRRemindersCard, shrunk in the sidebar) ──
  const reminderEvents: HRReminderEvent[] = [
    ...followUps.map((f) => ({
      id: f.id,
      candidateId: f.candidateId,
      candidateName: f.candidate.name,
      type: FU_EVENT[f.type]?.type ?? "FOLLOWUP",
      label: FU_EVENT[f.type]?.label ?? "Follow-up",
      timeIso: new Date(f.dueAt).toISOString(),
      ownerName: f.candidate.primaryOwner?.name ?? null,
    })),
    ...interviews
      .filter((iv) => iv.attendanceStatus === "SCHEDULED" || iv.attendanceStatus === "RESCHEDULED")
      .map((iv) => ({
        id: iv.id,
        candidateId: iv.candidateId,
        candidateName: iv.candidate.name,
        type: "INTERVIEW" as HREventType,
        label: `${fmtType(iv.type)} Interview`,
        timeIso: new Date(iv.scheduledAt).toISOString(),
        ownerName: null,
      })),
  ];

  // ── Leaderboard rows (reports perm only) ──
  const byUser = (rows: { userId: string | null; _count: number }[]) => {
    const m: Record<string, number> = {};
    for (const r of rows) if (r.userId) m[r.userId] = r._count;
    return m;
  };
  const cCalls = byUser(lbCalls), cFollow = byUser(lbFollowups), cSched = byUser(lbIvSched);
  const cDone = byUser(lbIvDone), cOffers = byUser(lbOffers), cJoined = byUser(lbJoined);
  const leaderboardRows: LeaderboardRow[] = hrUsers
    .map((u) => ({
      userId: u.id,
      name: u.name,
      calls: cCalls[u.id] ?? 0,
      followUpsCompleted: cFollow[u.id] ?? 0,
      interviewsScheduled: cSched[u.id] ?? 0,
      interviewsConducted: cDone[u.id] ?? 0,
      offersReleased: cOffers[u.id] ?? 0,
      joined: cJoined[u.id] ?? 0,
    }))
    .filter((r) => r.calls || r.followUpsCompleted || r.interviewsScheduled || r.interviewsConducted || r.offersReleased || r.joined)
    .slice(0, 12);

  // ── 8 deduped KPI tiles (Action Center) — ordered MOST-URGENT first. The
  //    action tiles jump to the worklist above (where the recruiter acts); the
  //    schedule/outcome tiles jump to their own sections below. ──
  const kpiTiles: HrKpiTile[] = [
    { kind: "overdue", label: "Overdue Follow-Ups", count: overdueCandidateCount, href: "#worklist" },
    { kind: "callsDue", label: "Calls Due Today", count: todayCandidateCount, href: "#worklist" },
    { kind: "pendingConfirm", label: "Pending Confirmations", count: confirmPendingCount, href: "#worklist" },
    { kind: "noShow", label: "No-Shows", count: noShowFullCount, href: "#worklist" },
    { kind: "unassigned", label: "Unassigned", count: unassignedCount, href: "/hr/candidates?ownerId=unassigned" },
    { kind: "interviewsToday", label: "Interviews Today", count: ivTodayCount, href: "#interviews-today" },
    { kind: "noNextAction", label: "No Next Action", count: noNextActionCount, href: "#worklist" },
    { kind: "pendingOffers", label: "Pending Offers", count: sum("OFFER_RELEASED"), href: "/hr/candidates?status=OFFER_RELEASED" },
    { kind: "joiningToday", label: "Joining Today", count: joiningTodayCount, href: "/hr/candidates?status=EXPECTED_JOINING" },
    { kind: "expectedJoin", label: "Expected Joinings", count: expectedFullCount, href: "#expected-joinings" },
    { kind: "new", label: "New Candidates", count: newCount, href: "/hr/candidates?status=NEW" },
  ];

  // (Rule-based AI-suggestions strip removed — the worklist below already ranks
  //  overdue / confirm / no-show / no-next-step, so the nudges were redundant.)

  // ── Unified "Do this next" worklist (spec item 1) ──────────────────────────
  // One ranked, per-candidate-deduped stream in priority order:
  //   overdue calls → interviews to confirm → no-show recovery → due-today calls
  //   → active candidates with no next step. Each candidate appears once, at its
  //   highest-priority reason, so the recruiter works straight down the list.
  const overdueCall = callNowItems.filter((i) => i.overdue);
  const todayCall = callNowItems.filter((i) => !i.overdue);
  const worklistSeen = new Set<string>();
  const worklistItems: WorklistItem[] = [];
  const addWork = (it: WorklistItem) => {
    if (worklistSeen.has(it.candidateId)) return;
    worklistSeen.add(it.candidateId);
    worklistItems.push(it);
  };
  for (const i of overdueCall) addWork({
    key: `fu-${i.followUpId}`, kind: "overdue", candidateId: i.candidateId, name: i.name,
    position: i.position, status: i.status, reason: "Overdue follow-up", lastNote: i.nextAction,
    phone: i.phone, whatsappPhone: i.whatsappPhone, ownerFirstName: i.ownerFirstName, dueIso: i.dueIso, urgent: true,
  });
  for (const iv of confirmPending) addWork({
    key: `iv-${iv.id}`, kind: "confirm", candidateId: iv.candidateId, interviewId: iv.id, name: iv.candidate.name,
    position: null, status: iv.candidate.status, reason: `Confirm ${fmtType(iv.type)} interview`,
    lastNote: null, phone: iv.candidate.phone, whatsappPhone: iv.candidate.whatsappPhone, ownerFirstName: null,
    dueIso: new Date(iv.scheduledAt).toISOString(), urgent: false,
  });
  for (const iv of noShowInterviews) addWork({
    key: `ns-${iv.id}`, kind: "noshow", candidateId: iv.candidateId, interviewId: iv.id, name: iv.candidate.name,
    position: null, status: iv.candidate.status, reason: "No-show — recover",
    lastNote: iv.noShowReason ?? null, phone: iv.candidate.phone, whatsappPhone: iv.candidate.whatsappPhone,
    ownerFirstName: null, dueIso: new Date(iv.scheduledAt).toISOString(), urgent: true,
  });
  for (const i of todayCall) addWork({
    key: `fu-${i.followUpId}`, kind: "today", candidateId: i.candidateId, name: i.name, position: i.position,
    status: i.status, reason: "Due today", lastNote: i.nextAction, phone: i.phone, whatsappPhone: i.whatsappPhone,
    ownerFirstName: i.ownerFirstName, dueIso: i.dueIso, urgent: false,
  });
  // "Due soon" — upcoming follow-ups within the next 7 days, soonest first.
  const upcomingSeen = new Set<string>();
  for (const f of [...upcomingFU].sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt))) {
    if (upcomingSeen.has(f.candidateId)) continue;
    upcomingSeen.add(f.candidateId);
    const days = Math.round((new Date(f.dueAt).getTime() - todayStart.getTime()) / 86400_000);
    addWork({
      key: `soon-${f.id}`, kind: "soon", candidateId: f.candidateId, name: f.candidate.name, position: null,
      status: f.candidate.status, reason: days <= 1 ? "Due tomorrow" : `Due in ${days} days`, lastNote: null,
      phone: f.candidate.phone, whatsappPhone: f.candidate.whatsappPhone,
      ownerFirstName: firstNameOf(f.candidate.primaryOwner?.name), dueIso: new Date(f.dueAt).toISOString(), urgent: false,
    });
  }
  for (const c of noNextItems) addWork({
    key: `nn-${c.candidateId}`, kind: "nonext", candidateId: c.candidateId, name: c.name, position: c.position,
    status: c.status, reason: c.daysSinceCreated >= 3 ? `No next step · ${c.daysSinceCreated}d waiting` : "No next step set",
    lastNote: null, phone: c.phone, whatsappPhone: c.whatsappPhone, ownerFirstName: c.ownerFirstName, dueIso: null,
    urgent: c.daysSinceCreated >= 3,
  });

  const greeting = greetingFor(now, tzForTeam(me.team));
  const firstName = firstNameOf(me.name) ?? me.name;

  // ── LEFT column (action content) ──
  const left = (
    <>
      {deniedPerm && (
        // Dismissible (CSS-only) amber permission-denied banner. The peer checkbox
        // toggles the wrapper's visibility so it works in this SERVER component
        // without any client JS — closing it needs no re-render.
        <div className="has-[:checked]:hidden">
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-500/60 px-4 py-3 text-amber-800 dark:text-amber-200"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-300" />
            <p className="text-sm font-medium leading-snug flex-1 min-w-0">
              {deniedLabel
                ? `You don't have access to ${deniedLabel}.`
                : "You don't have access to that page."}
            </p>
            <label
              className="shrink-0 cursor-pointer rounded-md p-1 -m-1 text-amber-600 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40 transition"
              aria-label="Dismiss"
              title="Dismiss"
            >
              <input type="checkbox" className="sr-only" />
              <X className="w-4 h-4" />
            </label>
          </div>
        </div>
      )}
      {/* ── Dashboard in descending importance ──────────────────────────────
          1. Do this next — the single ranked action list (call/message/confirm
             inline). This is the hero: what needs the recruiter RIGHT NOW.
          2. Numbers at a glance — compact KPI tiles, most-urgent first.
          3. Today's interview schedule (time-ordered).
          4. Who's joining soon.
          5. Pipeline overview (least urgent — lives at the bottom).
          The old Call-Now / No-Next / Pending-Confirm / No-Show cards are folded
          INTO the worklist, so nothing here is duplicated. */}
      <div id="worklist" className="scroll-mt-20">
        <HrWorklist items={worklistItems} showOwner={showOwner} />
      </div>

      <ActionCenterKpis tiles={kpiTiles} />

      {/* TodaysInterviews owns <section id="interviews-today">; push its scroll
          offset down so the #interviews-today KPI anchor clears the header. */}
      <div className="[&_#interviews-today]:scroll-mt-20">
        <TodaysInterviews items={todaysInterviewItems} />
      </div>

      <div id="expected-joinings" className="scroll-mt-20">
        <ExpectedJoinings items={expectedItems} showOwner={showOwner} />
      </div>

      <RecruitmentFunnel stages={funnelStages} total={funnelTotal} />

      {/* Interview Pipeline — attendance-status distribution (last 30d + upcoming). Audit #99. */}
      <div className="card p-4">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <div className="text-sm font-semibold text-gray-700 dark:text-slate-200 inline-flex items-center gap-1.5"><Target size={14} />Interview Pipeline</div>
          <span className="text-[11px] text-gray-400 dark:text-slate-500">{ivPipelineTotal} interviews · last 30 days + upcoming</span>
        </div>
        {ivPipelineTotal === 0 ? (
          <div className="px-2 py-6 text-center text-gray-400 dark:text-slate-500 text-xs">No interviews in this window.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {ivPipelineRows.map(r => (
              <div key={r.key} className="rounded-xl bg-gray-50 dark:bg-slate-800/60 p-3 text-center">
                <div className="text-xl font-extrabold text-gray-800 dark:text-white tabular-nums">{r.n}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400"><span className={`w-2 h-2 rounded-full ${r.color}`} />{r.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // ── RIGHT column (sticky sidebar) ──
  const right = (
    <>
      <DailyProductivity callsCompleted={callsToday} callsTarget={CALL_TARGET} />

      {/* Existing reminders/calendar card — SHRUNK into a collapsible <details> so
          it never dominates the redesigned sidebar (spec: keep it small). */}
      <details className="group rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <summary className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer select-none list-none">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            Reminders &amp; Calendar
          </span>
          <span className="inline-flex items-center gap-2">
            {reminderEvents.length > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                {reminderEvents.length}
              </span>
            )}
            <span className="text-[11px] text-gray-400 dark:text-slate-500 group-open:hidden">Show</span>
            <span className="text-[11px] text-gray-400 dark:text-slate-500 hidden group-open:inline">Hide</span>
          </span>
        </summary>
        <div className="px-2 pb-2">
          <HRRemindersCard events={reminderEvents} todayIso={todayIso} showOwner={showOwner} />
        </div>
      </details>

      {isLeader && (
        <Leaderboard rows={leaderboardRows} periodLabel="Last 7 days" />
      )}

      <RecentActivityFeed rows={recentItems} />
    </>
  );

  return (
    <HrDashboardChrome firstName={firstName} greeting={greeting} left={left} right={right} />
  );
}
