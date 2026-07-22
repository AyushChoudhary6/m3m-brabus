import { NextResponse, type NextRequest } from "next/server";
import { requireHrPermission, hrActiveScopeWhere } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import { HRCandidateStatus, Prisma } from "@prisma/client";
import { fingerprintFor } from "@/lib/assignment";
import { categorizeStatus } from "@/lib/hrStatus";
import { parseHrRemarksCell } from "@/lib/hrRemarks";

// Status handling now lives in lib/hrStatus.categorizeStatus(): the EXACT Excel
// text is preserved on HRCandidate.originalStatus and shown to the user, while
// `status` stores the mapped CRM category. Nothing falls through to "unmapped".

function num(v?: string): number | null { if (!v) return null; const n = parseFloat(String(v).replace(/[^\d.]/g, "")); return isNaN(n) ? null : n; }

// ── Date parsing: ISO, dd/mm/yyyy, "9 Jun 2026", JS Date string, Excel serial ─
function atNoonIST(d: Date): Date { const x = new Date(d); x.setUTCHours(6, 30, 0, 0); return x; }
function parseHrDate(v?: string): Date | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  // Excel serial number (days since 1899-12-30)
  if (/^\d{4,6}(\.\d+)?$/.test(s)) {
    const serial = parseFloat(s);
    if (serial > 20000 && serial < 80000) {
      const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
      if (!isNaN(d.getTime())) return atNoonIST(d);
    }
  }
  // dd/mm/yyyy or dd-mm-yyyy (Indian order)
  const dmy = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (dmy) {
    const day = parseInt(dmy[1]), mon = parseInt(dmy[2]) - 1;
    let year = parseInt(dmy[3]); if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && mon >= 0 && mon <= 11) return new Date(Date.UTC(year, mon, day, 6, 30));
  }
  // generic (ISO, "9 Jun 2026", "Thu Jun 09 2026 ...")
  const t = Date.parse(s);
  if (!isNaN(t)) return new Date(t);
  return null;
}

type Row = Record<string, string>;
function toData(r: Row) {
  return {
    name: (r.name ?? "").trim(),
    phone: r.phone?.trim() || null, whatsappPhone: r.whatsappPhone?.trim() || null,
    email: r.email?.trim().toLowerCase() || null, location: r.location?.trim() || null,
    currentCompany: r.currentCompany?.trim() || null, currentProfile: r.currentProfile?.trim() || null,
    experience: r.experience?.trim() || null,
    realEstateExperience: r.realEstateExperience?.trim() || null,
    currentSalary: num(r.currentSalary), expectedSalary: num(r.expectedSalary),
    noticePeriod: r.noticePeriod?.trim() || null, source: r.source?.trim() || "Import",
    // Preserve the verbatim recruiter-entered status before categorizeStatus() maps
    // it to a canonical bucket, so the exact original label is never lost (#23).
    originalStatus: r.status?.trim() || null,
    remarks: r.remarks?.trim() || null,
    // ── Recruiting scorecard (HR Data workbook) — all free-text ──
    salesExperience: r.salesExperience?.trim() || null,
    callingExperience: r.callingExperience?.trim() || null,
    altEmail: r.altEmail?.trim() || null,
    sopMet: r.sopMet?.trim() || null,
    contactedBy: r.contactedBy?.trim() || null,
    inviteMailSent: r.inviteMailSent?.trim() || null,
    candidateAcknowledged: r.candidateAcknowledged?.trim() || null,
    arrivedOnTime: r.arrivedOnTime?.trim() || null,
    scorePersonality: r.scorePersonality?.trim() || null,
    scoreConfidence: r.scoreConfidence?.trim() || null,
    scoreCommunication: r.scoreCommunication?.trim() || null,
    scoreBehaviour: r.scoreBehaviour?.trim() || null,
    scoreGrasping: r.scoreGrasping?.trim() || null,
    scoreListening: r.scoreListening?.trim() || null,
    scoreNegotiation: r.scoreNegotiation?.trim() || null,
    scoreCultureFit: r.scoreCultureFit?.trim() || null,
    highestProductSold: r.highestProductSold?.trim() || null,
    dealValue: r.dealValue?.trim() || null,
    avgIncentive: r.avgIncentive?.trim() || null,
    incentiveConsistent: r.incentiveConsistent?.trim() || null,
    callsPerDay: r.callsPerDay?.trim() || null,
    connectedCallsPerDay: r.connectedCallsPerDay?.trim() || null,
    lastSaleDate: r.lastSaleDate?.trim() || null,
    hrDecision: r.hrDecision?.trim() || null,
    hrDetailedRemarks: r.hrDetailedRemarks?.trim() || null,
    finalStatus: r.finalStatus?.trim() || null,
  };
}

async function attachResume(candidateId: string, url: string, userId: string) {
  await prisma.hRResume.updateMany({ where: { candidateId, isActive: true }, data: { isActive: false } });
  await prisma.hRResume.create({
    data: { candidateId, url, filename: (url.split("/").pop() || "resume").slice(0, 120), mimeType: "application/octet-stream", isActive: true, uploadedById: userId },
  });
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

const SCHEDULED_STATUSES: HRCandidateStatus[] = ["F2F_INTERVIEW_SCHEDULED", "VIRTUAL_INTERVIEW_SCHEDULED"];

// Build the workflow records (follow-ups / interviews / timeline) an imported
// row implies. This is the core of the fix: a candidate row is turned into an
// operational recruitment workflow, not just a contact.
function buildWorkflow(r: Row, status: HRCandidateStatus, ownerId: string) {
  const followUpDate = parseHrDate(r.followUpDate);
  const interviewDate = parseHrDate(r.interviewDate);
  const joiningDate = parseHrDate(r.joiningDate);
  const rawStatus = (r.status ?? "").trim();
  const remarks = r.remarks?.trim() || "";

  const isNoShow = status === "NO_SHOW";
  const isScheduled = SCHEDULED_STATUSES.includes(status);

  const followUps: Prisma.HRFollowUpCreateManyCandidateInput[] = [];
  const interviews: Prisma.HRInterviewCreateManyCandidateInput[] = [];
  const activities: Prisma.HRActivityCreateManyCandidateInput[] = [];

  const now = new Date();

  // Interview event from an explicit interview date or a scheduled status.
  if (interviewDate || (isScheduled && followUpDate)) {
    const when = interviewDate ?? followUpDate!;
    interviews.push({
      type: status === "VIRTUAL_INTERVIEW_SCHEDULED" ? "VIRTUAL" : "FACE_TO_FACE",
      scheduledAt: when, confirmationStatus: "PENDING", attendanceStatus: "SCHEDULED",
      notes: "Scheduled from Excel import",
    });
    activities.push({ type: "INTERVIEW_SCHEDULED", userId: ownerId, notes: `Interview scheduled for ${fmtDate(when)} (imported)` });
  }

  // No-show → recovery interview + recovery follow-up + timeline.
  if (isNoShow) {
    interviews.push({
      type: "FACE_TO_FACE", scheduledAt: interviewDate ?? followUpDate ?? now,
      confirmationStatus: "PENDING", attendanceStatus: "NO_SHOW", notes: "Did not attend (imported)",
      noShowReason: remarks || null,
    });
    followUps.push({ type: "NO_SHOW_RECOVERY", dueAt: now, autoCreated: true, userId: ownerId, notes: "No-show recovery — re-engage candidate" });
    activities.push({ type: "INTERVIEW_NO_SHOW", userId: ownerId, notes: "Candidate did not attend the interview (imported)" });
  } else if (followUpDate) {
    // Regular follow-up from the Excel follow-up date.
    followUps.push({ type: "CALL_BACK", dueAt: followUpDate, autoCreated: true, userId: ownerId, notes: r.nextAction?.trim() || "Follow up (imported)" });
  }

  // Always leave a timeline entry preserving the original recruitment story.
  const summary = [
    "Imported from Excel.",
    rawStatus ? `Original status: ${rawStatus}.` : null,
    followUpDate ? `Follow-up: ${fmtDate(followUpDate)}.` : null,
    interviewDate ? `Interview: ${fmtDate(interviewDate)}.` : null,
    joiningDate ? `Joining: ${fmtDate(joiningDate)}.` : null,
    // Remarks are NOT folded in here — they are split into individual HRRemark
    // rows (see parseHrRemarksCell) so each stacked remark keeps its own date +
    // author and renders separately in the Remarks card + Conversation timeline.
  ].filter(Boolean).join(" ");
  activities.push({ type: "NOTE_ADDED", userId: ownerId, notes: summary });

  // Next action + date drive the dashboard "who to call now" / "no next action".
  const nextActionDate = isNoShow ? now : (followUpDate ?? interviewDate ?? null);
  const nextAction = isNoShow ? "No-show recovery — re-engage"
    : (interviewDate || isScheduled) ? "Confirm / conduct interview"
    : followUpDate ? (r.nextAction?.trim() || "Follow up with candidate")
    : (r.nextAction?.trim() || null);

  return { followUps, interviews, activities, nextActionDate, nextAction, joiningDate, hasFollowUpDate: !!followUpDate, hasInterviewDate: !!interviewDate };
}

// Batched candidate import. The client sends rows in chunks (~100) and shows
// progress, so no single request risks the serverless timeout.
export async function POST(req: NextRequest) {
  const access = await requireHrPermission("importData");
  if (access.error) return access.error;
  const { me } = access;

  // Dry-run preview: parse + dedup + categorize WITHOUT writing anything to the
  // DB. Triggered by ?dryRun=1. Returns a distinct response shape (see below) so
  // existing direct-commit callers are completely unaffected.
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";

  const body = await req.json();
  const rows: Row[] = Array.isArray(body.rows) ? body.rows : [];
  const strategy: "skip" | "update" | "create" = ["skip", "update", "create"].includes(body.strategy) ? body.strategy : "skip";
  // Owner must be an active HR user — never orphan imported candidates onto a
  // Sales/inactive account. Invalid/blank → default to the importer.
  let ownerId: string = me.id;
  if (body.primaryOwnerId && typeof body.primaryOwnerId === "string") {
    const validOwner = await prisma.user.findFirst({
      where: { id: body.primaryOwnerId, active: true, OR: [{ hrOnly: true }, { hrTeam: true }, { role: "ADMIN" }] },
      select: { id: true },
    });
    if (validOwner) ownerId = body.primaryOwnerId;
  }
  const importBatchId: string | null = typeof body.importBatchId === "string" && body.importBatchId ? body.importBatchId : null;

  // Known HR user names — passed to the remark parser so "Rohit: spoke…" style
  // remarks attribute to the roster. Non-roster names in the text (e.g. a former
  // recruiter) are preserved verbatim by the parser, so nothing is lost.
  const hrNames = dryRun
    ? []
    : (await prisma.user.findMany({
        where: { active: true, OR: [{ hrOnly: true }, { hrTeam: true }, { role: "ADMIN" }] },
        select: { name: true },
      })).map((u) => u.name).filter(Boolean);

  // Split a row's stacked remarks cell into individual HRRemark rows (source=IMPORT).
  const buildRemarks = (r: Row, rowCreatedAt: Date): Prisma.HRRemarkCreateManyCandidateInput[] =>
    parseHrRemarksCell(r.remarks, hrNames, rowCreatedAt).map((p) => ({
      text: p.text, remarkAt: p.remarkAt, authorName: p.authorName, source: "IMPORT",
    }));

  const summary = {
    imported: 0, updated: 0, skipped: 0, failed: 0,
    followUpsCreated: 0, interviewsCreated: 0, noShowRecoveriesCreated: 0, timelineEntriesCreated: 0,
    missingStatus: 0, missingFollowUpDate: 0, missingInterviewDate: 0,
    errorRows: [] as { row: string; reason: string }[],
  };

  // Per-row classification accumulated during the loop. In dryRun this is the
  // payload; in a real commit it is simply ignored (zero cost).
  type PreviewRow = {
    rowIndex: number;
    action: "new" | "update" | "skip" | "error";
    candidateName: string;
    reason: string;
    status: string;
    workflowCount: { followUps: number; interviews: number; activities: number };
  };
  const previewRows: PreviewRow[] = [];
  const preview = {
    total: rows.length, new: 0, update: 0, skip: 0, error: 0,
    totalFollowUps: 0, totalInterviews: 0,
  };

  if (rows.length === 0) {
    return dryRun
      ? NextResponse.json({ dryRun: true, summary: preview, rows: previewRows })
      : NextResponse.json(summary);
  }

  // One indexed lookup for the whole batch + existing-workflow counts so a
  // re-import (reprocessing) doesn't duplicate auto-created records.
  const fps = Array.from(new Set(rows.map(r => fingerprintFor(r.phone, r.email)).filter(Boolean) as string[]));
  const existing = fps.length
    ? await prisma.hRCandidate.findMany({
        // Exclude soft-deleted rows (and scope) so a re-import never matches a
        // recycle-binned candidate. Importers are Admin/Senior (view-all), so
        // scope is a no-op for them; deletedAt:null is the meaningful filter.
        where: { AND: [hrActiveScopeWhere(me), { fingerprint: { in: fps } }] },
        select: { id: true, fingerprint: true, _count: { select: { followUps: true, interviews: true, activities: true, remarkEntries: true } } },
      })
    : [];
  const existingByFp = new Map(existing.map(e => [e.fingerprint!, e]));
  // Fingerprints already TAKEN by ANY row — including soft-deleted (recycle-bin)
  // candidates, whose unique fingerprint lingers on the row. The active dedup above
  // (deletedAt:null) intentionally ignores those, so without this a re-import of a
  // recycle-binned person would try to create a fresh row with a colliding
  // fingerprint → P2002. We instead create it with a NULL fingerprint.
  const takenFpRows = fps.length
    ? await prisma.hRCandidate.findMany({ where: { fingerprint: { in: fps } }, select: { fingerprint: true } })
    : [];
  const takenFps = new Set(takenFpRows.map(r => r.fingerprint!));
  const seenFp = new Set<string>();

  // Collected candidate-create jobs — the intra-file dedup (seenFp) + fingerprint
  // decision happens sequentially in the loop below, but the WRITES are then run in
  // bounded-concurrency batches instead of a sequential await per row (write N+1).
  // Audit #141. Each Prisma nested create is atomic (candidate + its followUps /
  // interviews / activities / remarks in one transaction).
  type CreateJob = { data: NonNullable<Parameters<typeof prisma.hRCandidate.create>[0]>["data"]; resumeUrl: string | null; wf: ReturnType<typeof buildWorkflow>; name: string };
  const createJobs: CreateJob[] = [];

  // Record a classification for the preview payload (no-op cost in real commits).
  const classify = (rowIndex: number, action: PreviewRow["action"], candidateName: string, reason: string, status: string, wf?: { followUps: { length: number }; interviews: { length: number }; activities: { length: number } }) => {
    const workflowCount = { followUps: wf?.followUps.length ?? 0, interviews: wf?.interviews.length ?? 0, activities: wf?.activities.length ?? 0 };
    previewRows.push({ rowIndex, action, candidateName, reason, status, workflowCount });
    preview[action]++;
    if (action !== "skip" && action !== "error") {
      preview.totalFollowUps += workflowCount.followUps;
      preview.totalInterviews += workflowCount.interviews;
    }
  };

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const r = rows[rowIndex];
    const phoneVal = (r.phone ?? "").trim();
    const name = (r.name ?? "").trim() || (phoneVal ? `Candidate - ${phoneVal}` : "");
    if (!name) {
      summary.failed++;
      summary.errorRows.push({ row: r.email?.trim() || "(blank row)", reason: "Missing both name and phone" });
      classify(rowIndex, "error", r.email?.trim() || "(blank row)", "Missing both name and phone", "");
      continue;
    }

    const rawStatus = (r.status ?? "").trim();
    const status = categorizeStatus(rawStatus);
    if (!rawStatus) summary.missingStatus++;

    const wf = buildWorkflow(r, status, ownerId);
    if (!wf.hasFollowUpDate) summary.missingFollowUpDate++;
    if (!wf.hasInterviewDate) summary.missingInterviewDate++;

    const fp = fingerprintFor(r.phone, r.email);
    const existsRow = fp ? existingByFp.get(fp) : undefined;

    try {
      if (existsRow) {
        if (strategy === "skip") {
          summary.skipped++;
          classify(rowIndex, "skip", name, "Duplicate of an existing candidate — skipped", status, wf);
          continue;
        }
        if (strategy === "update") {
          if (dryRun) {
            summary.updated++;
            classify(rowIndex, "update", name, "Matches an existing candidate — will update", status, wf);
            continue;
          }
          const d = toData(r);
          const upd: Record<string, unknown> = { status, nextActionDate: wf.nextActionDate };
          if (wf.joiningDate) upd.expectedJoiningDate = wf.joiningDate; // #58/#65
          const addedOn = parseHrDate(r.addedDate);
          if (addedOn) upd.createdAt = addedOn; // backfill/correct the Excel date on re-import
          for (const [k, v] of Object.entries(d)) if (v !== null && v !== "" && k !== "name") upd[k] = v;
          await prisma.hRCandidate.update({ where: { id: existsRow.id }, data: upd });

          // Only create workflow records the candidate is missing — keeps a
          // reprocess re-import idempotent (won't pile up duplicate rows).
          if (existsRow._count.followUps === 0 && wf.followUps.length) {
            await prisma.hRFollowUp.createMany({ data: wf.followUps.map(f => ({ ...f, candidateId: existsRow.id })) as Prisma.HRFollowUpCreateManyInput[] });
            summary.followUpsCreated += wf.followUps.length;
            summary.noShowRecoveriesCreated += wf.followUps.filter(f => f.type === "NO_SHOW_RECOVERY").length;
          }
          if (existsRow._count.interviews === 0 && wf.interviews.length) {
            await prisma.hRInterview.createMany({ data: wf.interviews.map(i => ({ ...i, candidateId: existsRow.id })) as Prisma.HRInterviewCreateManyInput[] });
            summary.interviewsCreated += wf.interviews.length;
          }
          if (existsRow._count.activities === 0 && wf.activities.length) {
            await prisma.hRActivity.createMany({ data: wf.activities.map(a => ({ ...a, candidateId: existsRow.id })) as Prisma.HRActivityCreateManyInput[] });
            summary.timelineEntriesCreated += wf.activities.length;
          }
          // Backfill the split remark thread only when the candidate has none yet —
          // keeps a reprocess re-import from piling up duplicate remarks.
          if (existsRow._count.remarkEntries === 0) {
            const rmk = buildRemarks(r, addedOn ?? new Date());
            if (rmk.length) await prisma.hRRemark.createMany({ data: rmk.map(m => ({ ...m, candidateId: existsRow.id })) as Prisma.HRRemarkCreateManyInput[] });
          }
          if (r.resumeUrl?.trim()) await attachResume(existsRow.id, r.resumeUrl.trim(), me.id);
          summary.updated++;
          continue;
        }
        // strategy === "create" → fall through, force a duplicate (no fingerprint).
      }

      const forcedDup = !!existsRow || (fp ? seenFp.has(fp) : false);
      if (fp && !forcedDup) seenFp.add(fp);

      if (dryRun) {
        // seenFp was already updated above, so duplicates WITHIN the same preview
        // batch classify identically to a real commit.
        summary.imported++;
        const reason = existsRow
          ? "Existing candidate — will be created as a duplicate (Create anyway)"
          : forcedDup
            ? "Duplicate within this file — will be created as a separate record"
            : "New candidate — will be created";
        classify(rowIndex, "new", name, reason, status, wf);
        continue;
      }

      // Null the fingerprint when it's an intra-file dup (forcedDup) OR when a
      // soft-deleted row already holds it (takenFps) — either way, setting it would
      // violate the unique constraint.
      const fpToStore = (forcedDup || (fp && takenFps.has(fp))) ? null : fp;
      const rowCreatedAt = parseHrDate(r.addedDate) ?? new Date();
      const remarkData = buildRemarks(r, rowCreatedAt);
      // Queue the create (fingerprint already resolved) — the actual writes run in
      // bounded-concurrency batches AFTER the loop (audit #141).
      createJobs.push({
        name,
        resumeUrl: r.resumeUrl?.trim() || null,
        wf,
        data: {
          ...toData(r), name, status, primaryOwnerId: ownerId, fingerprint: fpToStore,
          importBatchId,
          // Use the Excel "Date" column as the created date when present (else now()).
          createdAt: parseHrDate(r.addedDate) ?? undefined,
          expectedJoiningDate: wf.joiningDate ?? undefined, // parsed "Joining" column (#58/#65)
          nextActionDate: wf.nextActionDate,
          followUps: wf.followUps.length ? { createMany: { data: wf.followUps } } : undefined,
          interviews: wf.interviews.length ? { createMany: { data: wf.interviews } } : undefined,
          activities: wf.activities.length ? { createMany: { data: wf.activities } } : undefined,
          remarkEntries: remarkData.length ? { createMany: { data: remarkData } } : undefined,
        },
      });
    } catch (e) {
      summary.failed++;
      summary.errorRows.push({ row: name, reason: String(e).slice(0, 150) });
      classify(rowIndex, "error", name, String(e).slice(0, 150), status);
    }
  }

  if (dryRun) return NextResponse.json({ dryRun: true, summary: preview, rows: previewRows });

  // ── Batched candidate creates (audit #141) — bounded concurrency, not a
  // sequential await per row. Dedup/fingerprint was resolved above, so parallel
  // writes can't race on the intra-file dedup set. Each create is atomic.
  const CHUNK = 25;
  for (let i = 0; i < createJobs.length; i += CHUNK) {
    await Promise.all(createJobs.slice(i, i + CHUNK).map(async (job) => {
      try {
        const cand = await prisma.hRCandidate.create({ data: job.data });
        if (job.resumeUrl) await attachResume(cand.id, job.resumeUrl, me.id);
        summary.imported++;
        summary.followUpsCreated += job.wf.followUps.length;
        summary.interviewsCreated += job.wf.interviews.length;
        summary.noShowRecoveriesCreated += job.wf.followUps.filter((f) => f.type === "NO_SHOW_RECOVERY").length;
        summary.timelineEntriesCreated += job.wf.activities.length;
      } catch (e) {
        summary.failed++;
        summary.errorRows.push({ row: job.name, reason: String(e).slice(0, 150) });
      }
    }));
  }

  return NextResponse.json(summary);
}
