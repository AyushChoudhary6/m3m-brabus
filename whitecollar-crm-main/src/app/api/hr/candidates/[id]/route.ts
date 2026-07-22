import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { HRCandidateStatus } from "@prisma/client";
import { loadOwnedCandidate, hrCan, hrRoleOf, hrNotFound } from "@/lib/hrAccess";
import { isAllowedStatusTransition, statusTransitionError } from "@/lib/hrStatus";
import { closeFollowUpsIfTerminal } from "@/lib/hrFollowups";
import { normalizeContactPhone, validateCandidateEmail } from "@/lib/hrValidation";
import { fingerprintFor } from "@/lib/assignment";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // RBAC: 404 if the caller can't see this candidate.
  const access = await loadOwnedCandidate(id);
  if (access.error) return access.error;

  const c = await prisma.hRCandidate.findUnique({
    where: { id },
    include: {
      primaryOwner:   { select: { id: true, name: true, avatarColor: true } },
      secondaryOwner: { select: { id: true, name: true, avatarColor: true } },
      activities:     { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } },
      remarkEntries:  { orderBy: { remarkAt: "desc" }, include: { author: { select: { name: true, avatarColor: true } } } },
      interviews:     { orderBy: { scheduledAt: "asc" }, include: { interviewer: { select: { name: true } } } },
      followUps:      { orderBy: { dueAt: "asc" }, include: { user: { select: { name: true } } } },
      resumes:        { orderBy: { createdAt: "desc" }, select: { id: true, candidateId: true, filename: true, mimeType: true, isActive: true, createdAt: true } }, // omit base64 `url` (#138)
    },
  });
  if (!c) return hrNotFound();
  return NextResponse.json({ candidate: c });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // RBAC: must be allowed to act on this candidate.
  const access = await loadOwnedCandidate(id);
  if (access.error) return access.error;
  const { me } = access;
  const body = await req.json();

  // Fetch the full editable surface so we can DIFF old vs new and log an
  // HRActivity per meaningful field change (timeline + Recent Activity must be
  // complete — previously only a status change was recorded).
  const existing = await prisma.hRCandidate.findUnique({
    where: { id },
    select: {
      updatedAt: true, // optimistic-concurrency precondition (audit #45)
      status: true, name: true, phone: true, whatsappPhone: true,
      email: true, location: true, currentCompany: true, currentProfile: true,
      experience: true, realEstateExperience: true,
      currentSalary: true, expectedSalary: true, noticePeriod: true, source: true,
      remarks: true, nextActionDate: true,
      primaryOwnerId: true, secondaryOwnerId: true,
      // Recruiting scorecard
      salesExperience: true, callingExperience: true, altEmail: true, sopMet: true, contactedBy: true,
      inviteMailSent: true, candidateAcknowledged: true, arrivedOnTime: true,
      scorePersonality: true, scoreConfidence: true, scoreCommunication: true, scoreBehaviour: true,
      scoreGrasping: true, scoreListening: true, scoreNegotiation: true, scoreCultureFit: true,
      highestProductSold: true, dealValue: true, avgIncentive: true, incentiveConsistent: true,
      callsPerDay: true, connectedCallsPerDay: true, lastSaleDate: true,
      hrDecision: true, hrDetailedRemarks: true, finalStatus: true,
    },
  });
  if (!existing) return hrNotFound();

  // Optimistic concurrency (audit #45): if the client sent the updatedAt it last saw,
  // reject when the row has changed since — otherwise a slow editor silently clobbers a
  // concurrent edit (last-write-wins). Precondition is OPT-IN: callers that don't send
  // baseUpdatedAt (bulk flows, resume-autofill) keep prior behaviour.
  if (typeof body.baseUpdatedAt === "string" && body.baseUpdatedAt) {
    if (new Date(existing.updatedAt).toISOString() !== new Date(body.baseUpdatedAt).toISOString()) {
      return NextResponse.json(
        { error: "This candidate was changed elsewhere since you opened it. Refresh to load the latest, then re-apply your edit.", code: "STALE_WRITE" },
        { status: 409 },
      );
    }
  }

  // Ownership reassignment is gated on the `assign` permission — a Junior HR
  // editing their own candidate cannot move it to (or away from) themselves.
  const canAssign = hrCan(me, "assign");

  // Validate any owner target up-front: a candidate may only be assigned to an
  // ACTIVE HR user (never orphaned onto a Sales/inactive account). Invalid → skip that field.
  const isActiveHrUser = async (uid: unknown): Promise<boolean> => {
    if (!uid || typeof uid !== "string") return false;
    const u = await prisma.user.findFirst({
      where: { id: uid, active: true, OR: [{ hrOnly: true }, { hrTeam: true }, { role: "ADMIN" }] },
      select: { id: true },
    });
    return !!u;
  };
  const okPrimary = ("primaryOwnerId" in body && body.primaryOwnerId) ? await isActiveHrUser(body.primaryOwnerId) : true;
  const okSecondary = ("secondaryOwnerId" in body && body.secondaryOwnerId) ? await isActiveHrUser(body.secondaryOwnerId) : true;

  const data: Record<string, unknown> = {};
  const allowed = ["name","phone","whatsappPhone","email","location","currentCompany",
    "currentProfile","experience","realEstateExperience","currentSalary","expectedSalary",
    "noticePeriod","source","status","remarks","nextActionDate","primaryOwnerId","secondaryOwnerId",
    "rejectionReason","salaryCurrency", // audit #111 / #137
    "offeredSalary","offerDate","proposedJoiningDate", // offer management — audit #64
    // Recruiting scorecard (HR Data workbook) — all free-text, editable inline.
    "salesExperience","callingExperience","altEmail","sopMet","contactedBy","inviteMailSent","candidateAcknowledged","arrivedOnTime",
    "scorePersonality","scoreConfidence","scoreCommunication","scoreBehaviour","scoreGrasping","scoreListening","scoreNegotiation","scoreCultureFit",
    "highestProductSold","dealValue","avgIncentive","incentiveConsistent","callsPerDay","connectedCallsPerDay","lastSaleDate",
    "hrDecision","hrDetailedRemarks","finalStatus"];
  for (const key of allowed) {
    if (!(key in body)) continue;
    if ((key === "primaryOwnerId" || key === "secondaryOwnerId") && !canAssign) continue; // silently ignore reassignment by non-assigners
    // Skip an owner field whose target isn't an active HR user (clearing to null still allowed).
    if (key === "primaryOwnerId" && body.primaryOwnerId && !okPrimary) continue;
    if (key === "secondaryOwnerId" && body.secondaryOwnerId && !okSecondary) continue;
    if (key === "currentSalary" || key === "expectedSalary" || key === "offeredSalary") {
      data[key] = body[key] ? parseFloat(body[key]) : null;
    } else if (key === "nextActionDate" || key === "offerDate" || key === "proposedJoiningDate") {
      data[key] = body[key] ? new Date(body[key]) : null;
    } else {
      data[key] = body[key] || null;
    }
  }

  // Validate + normalize any edited contact field (edit previously bypassed ALL
  // contact validation), then resync the @unique dedup fingerprint so a later
  // duplicate check stays correct (audit #29).
  if ("phone" in data && data.phone) {
    const r = normalizeContactPhone(String(data.phone));
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    data.phone = r.value;
  }
  if ("whatsappPhone" in data && data.whatsappPhone) {
    const r = normalizeContactPhone(String(data.whatsappPhone));
    if (!r.ok) return NextResponse.json({ error: "WhatsApp number: " + r.error }, { status: 400 });
    data.whatsappPhone = r.value;
  }
  if ("email" in data && data.email) {
    const err = validateCandidateEmail(String(data.email), false);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
  }
  if ("phone" in data || "email" in data) {
    data.fingerprint = fingerprintFor((data.phone as string) ?? existing.phone, (data.email as string) ?? existing.email);
  }

  // Lifecycle guard (#86): block teleporting a closed candidate straight to a late stage.
  if (body.status && body.status !== existing.status && !isAllowedStatusTransition(existing.status, body.status)) {
    return NextResponse.json({ error: statusTransitionError(existing.status, body.status) }, { status: 400 });
  }

  if (data.status === "OFFER_RELEASED" && hrRoleOf(me) === "JUNIOR_HR") {
    return NextResponse.json({ error: "Junior HR can't release offers — ask a Senior HR." }, { status: 403 });
  }

  // Stamp the actual joining date when the candidate first transitions to JOINED,
  // so the Joining report / "Joining Today" have a real date to key off (#15/#58).
  if (body.status === "JOINED" && existing.status !== "JOINED") {
    data.actualJoiningDate = new Date();
  }

  // On a fingerprint collision (the new contact matches another candidate), let the
  // edit through but drop this row's unique fingerprint rather than 500 (#29).
  let updated;
  try {
    updated = await prisma.hRCandidate.update({ where: { id }, data });
  } catch (e) {
    if ((e as { code?: string })?.code === "P2002" && "fingerprint" in data) {
      data.fingerprint = null;
      updated = await prisma.hRCandidate.update({ where: { id }, data });
    } else throw e;
  }

  // Log status change (kept as a distinct STATUS_CHANGED activity with the
  // old/new badge, exactly as before).
  if (body.status && body.status !== existing.status) {
    await prisma.hRActivity.create({
      data: {
        candidateId: id, userId: me.id,
        type: "STATUS_CHANGED",
        notes: body.statusNote || null,
        oldStatus: existing.status as HRCandidateStatus,
        newStatus: body.status as HRCandidateStatus,
      },
    });
    // Emit the TYPED milestone activity the funnel reports key off (they count by
    // activity type, not STATUS_CHANGED) so Offer/Joining funnels populate (#15).
    const MILESTONE: Partial<Record<string, "OFFER_RELEASED" | "OFFER_DECLINED" | "CANDIDATE_JOINED">> = {
      OFFER_RELEASED: "OFFER_RELEASED",
      OFFER_DECLINED: "OFFER_DECLINED",
      JOINED: "CANDIDATE_JOINED",
    };
    const milestone = MILESTONE[body.status];
    if (milestone) {
      await prisma.hRActivity.create({
        data: {
          candidateId: id, userId: me.id, type: milestone,
          notes: body.statusNote || null,
          newStatus: body.status as HRCandidateStatus,
        },
      });
    }
    // If the candidate just went terminal, close any open follow-ups so they
    // stop haunting the Call-Now queue / Overdue KPIs (audit H1).
    await closeFollowUpsIfTerminal(id, body.status);
  }

  // DIFF every other editable field that actually changed and write one
  // NOTE_ADDED activity per change so the timeline + Recent Activity are
  // complete (owner/salary/fit/feedback/joiningDate/remarks/nextAction/… were
  // previously silent). Status is excluded — handled above.
  const fmtMoney = (v: number | null | undefined) =>
    v == null ? "—" : `${(v / 100000).toLocaleString("en-IN", { maximumFractionDigits: 2 })}L`;
  const fmtDate = (v: Date | null | undefined) =>
    v == null ? "—" : new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  const fmtText = (v: unknown) => (v == null || v === "" ? "—" : String(v));
  const sameDate = (a: Date | null | undefined, b: unknown) =>
    (a == null && b == null) || (a != null && b instanceof Date && new Date(a).getTime() === b.getTime());

  // Resolve owner names once (only if an owner field is in the changeset).
  const ownerName = async (uid: unknown): Promise<string> => {
    if (!uid || typeof uid !== "string") return "—";
    const u = await prisma.user.findUnique({ where: { id: uid }, select: { name: true } });
    return u?.name || "Unknown";
  };

  // [field key, human label, kind]
  const fieldDefs: Array<[string, string, "text" | "money" | "date" | "owner"]> = [
    ["name", "Name", "text"], ["phone", "Phone", "text"],
    ["whatsappPhone", "WhatsApp", "text"], ["email", "Email", "text"], ["altEmail", "Alt Email", "text"],
    ["location", "Location", "text"], ["currentCompany", "Current Company", "text"],
    ["currentProfile", "Designation", "text"],
    ["experience", "Experience", "text"], ["realEstateExperience", "Real Estate Experience", "text"],
    ["salesExperience", "Sales Experience", "text"], ["callingExperience", "Calling Experience", "text"],
    ["currentSalary", "Current Salary", "money"], ["expectedSalary", "Expected Salary", "money"],
    ["noticePeriod", "Notice Period", "text"], ["source", "Source", "text"],
    ["remarks", "Remarks", "text"], ["nextActionDate", "Follow-up Date", "date"],
    ["sopMet", "SOP Met", "text"], ["contactedBy", "Contacted By", "text"],
    ["inviteMailSent", "F2F Invite Sent", "text"], ["candidateAcknowledged", "Acknowledged", "text"], ["arrivedOnTime", "Arrived On Time", "text"],
    ["scorePersonality", "Personality", "text"], ["scoreConfidence", "Confidence", "text"],
    ["scoreCommunication", "Communication", "text"], ["scoreBehaviour", "Behaviour", "text"],
    ["scoreGrasping", "Grasping Power", "text"], ["scoreListening", "Listening", "text"],
    ["scoreNegotiation", "Negotiation", "text"], ["scoreCultureFit", "Culture Fit", "text"],
    ["highestProductSold", "Highest Product Sold", "text"], ["dealValue", "Deal Value", "text"],
    ["avgIncentive", "Avg Incentive", "text"], ["incentiveConsistent", "Incentive Consistent", "text"],
    ["callsPerDay", "Calls / Day", "text"], ["connectedCallsPerDay", "Connected Calls / Day", "text"], ["lastSaleDate", "Last Sale Date", "text"],
    ["hrDecision", "HR Decision", "text"], ["hrDetailedRemarks", "HR Detailed Remarks", "text"], ["finalStatus", "Final Status", "text"],
    ["primaryOwnerId", "Owner", "owner"], ["secondaryOwnerId", "Secondary Owner", "owner"],
  ];

  const ex = existing as Record<string, unknown>;
  const changeNotes: string[] = [];
  for (const [key, label, kind] of fieldDefs) {
    if (!(key in data)) continue; // field wasn't part of the (permission-filtered) update
    const before = ex[key];
    const after = data[key];
    if (kind === "date") {
      if (sameDate(before as Date | null, after)) continue;
      changeNotes.push(`Updated ${label}: ${fmtDate(before as Date | null)} → ${fmtDate(after as Date | null)}`);
    } else if (kind === "money") {
      if ((before ?? null) === (after ?? null)) continue;
      changeNotes.push(`Updated ${label}: ${fmtMoney(before as number | null)} → ${fmtMoney(after as number | null)}`);
    } else if (kind === "owner") {
      if ((before ?? null) === (after ?? null)) continue;
      changeNotes.push(`${label} changed: ${await ownerName(before)} → ${await ownerName(after)}`);
    } else {
      if ((before ?? null) === (after ?? null)) continue;
      changeNotes.push(`Updated ${label}: ${fmtText(before)} → ${fmtText(after)}`);
    }
  }

  if (changeNotes.length > 0) {
    await prisma.hRActivity.createMany({
      data: changeNotes.map(notes => ({
        candidateId: id, userId: me.id, type: "NOTE_ADDED" as const, notes,
      })),
    });
  }

  return NextResponse.json({ candidate: updated });
}
