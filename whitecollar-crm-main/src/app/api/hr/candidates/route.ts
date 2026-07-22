import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { HRCandidateStatus, HRFollowUpType } from "@prisma/client";
import { fingerprintFor } from "@/lib/assignment";
import { hrDuplicateWhere } from "@/lib/hrDuplicates";
import { CLOSED_STATUS_KEYS } from "@/lib/hrStatus";
import { hrApiAuth, hrActiveScopeWhere, hrRoleOf } from "@/lib/hrAccess";
import { validateCandidateName, normalizeContactPhone, validateCandidateEmail } from "@/lib/hrValidation";

export async function GET(req: NextRequest) {
  const auth = await hrApiAuth();
  if (auth.error) return auth.error;
  const { me } = auth;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const search = url.searchParams.get("q") ?? undefined;
  const showClosed = url.searchParams.get("closed") === "1";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const PAGE = 50;

  const filters: NonNullable<Parameters<typeof prisma.hRCandidate.findMany>[0]>["where"] = {};

  if (status) {
    filters.status = status as HRCandidateStatus;
  } else if (!showClosed) {
    filters.status = { notIn: CLOSED_STATUS_KEYS };
  }

  if (search) {
    filters.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
      { currentCompany: { contains: search, mode: "insensitive" } },
      { currentProfile: { contains: search, mode: "insensitive" } },
    ];
  }

  // Scope by HR role: Junior HR only sees their own candidates; Admin/Senior HR see all.
  // Combined with the request filters via AND so the search OR isn't clobbered.
  // hrActiveScopeWhere also excludes soft-deleted (recycle-bin) candidates.
  const where = { AND: [hrActiveScopeWhere(me), filters] };

  const [candidates, total] = await Promise.all([
    prisma.hRCandidate.findMany({
      where, orderBy: { nextActionDate: { sort: "asc", nulls: "last" } },
      skip: (page - 1) * PAGE, take: PAGE,
      include: {
        primaryOwner: { select: { name: true, avatarColor: true } },
        followUps: { where: { completedAt: null }, orderBy: { dueAt: "asc" }, take: 1 },
        interviews: { where: { attendanceStatus: "SCHEDULED" }, orderBy: { scheduledAt: "asc" }, take: 1 },
        _count: { select: { activities: true } },
      },
    }),
    prisma.hRCandidate.count({ where }),
  ]);

  return NextResponse.json({ candidates, total, page, pages: Math.ceil(total / PAGE) });
}

export async function POST(req: NextRequest) {
  const auth = await hrApiAuth();
  if (auth.error) return auth.error;
  const { me } = auth;
  const body = await req.json();

  // Nothing is required. Validate FORMAT only for fields that are actually filled.
  // Name — letters only when provided (mirrors the client).
  const rawName = String(body.name ?? "").trim();
  if (rawName) {
    const nameErr = validateCandidateName(rawName);
    if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });
  }

  // Mobile — optional; normalise to a valid India (+91) / Dubai (+971) number when given.
  let normalizedPhone: string | null = null;
  if (String(body.phone ?? "").trim()) {
    const phoneRes = normalizeContactPhone(String(body.phone));
    if (!phoneRes.ok) return NextResponse.json({ error: phoneRes.error }, { status: 400 });
    normalizedPhone = phoneRes.value;
  }

  // WhatsApp / email are optional but validated when present.
  let normalizedWhatsapp: string | null = null;
  if (body.whatsappPhone && String(body.whatsappPhone).trim()) {
    const waRes = normalizeContactPhone(String(body.whatsappPhone));
    if (!waRes.ok) return NextResponse.json({ error: "WhatsApp number: " + waRes.error }, { status: 400 });
    normalizedWhatsapp = waRes.value;
  }
  const emailErr = validateCandidateEmail(String(body.email ?? ""), false);
  if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });

  // Require at least a name or a phone — otherwise the form silently minted an
  // "Unnamed candidate" with no way to contact them (audit #125).
  if (!rawName && !normalizedPhone) {
    return NextResponse.json({ error: "Enter at least a name or a phone number." }, { status: 400 });
  }

  const status = (body.status as HRCandidateStatus) || "NEW";

  if (status === "OFFER_RELEASED" && me.role === "AGENT") {
    return NextResponse.json({ error: "Interns can't release offers — ask a manager." }, { status: 403 });
  }
  // Follow-up is OPTIONAL at creation. A candidate with no next action surfaces under
  // "No Next Action" on the dashboard / Missed center until HR schedules the first follow-up.
  const nextActionDate = body.nextActionDate ? new Date(body.nextActionDate) : null;

  // Duplicate check — mobile, WhatsApp, or email (last-10-digit aware).
  // SCOPED to what the caller may see (audit #10/#47/#136): a Junior HR only gets
  // the other candidate's name/id when it's already in their scope, so this can't
  // leak an out-of-scope candidate's identity or enable phone/email enumeration.
  // Global uniqueness is still enforced below by the @unique fingerprint (P2002).
  const dupWhere = hrDuplicateWhere(normalizedPhone, normalizedWhatsapp, body.email);
  if (dupWhere) {
    const existing = await prisma.hRCandidate.findFirst({ where: { AND: [hrActiveScopeWhere(me), dupWhere] }, select: { id: true, name: true } });
    if (existing) {
      return NextResponse.json({ duplicate: true, existingId: existing.id, existingName: existing.name }, { status: 409 });
    }
  }

  const fp = fingerprintFor(normalizedPhone, body.email);

  // Junior HR own what they create — they can never assign an arbitrary owner.
  const isJunior = hrRoleOf(me) === "JUNIOR_HR";
  const primaryOwnerId = isJunior ? me.id : (body.primaryOwnerId || me.id);
  const secondaryOwnerId = isJunior ? null : (body.secondaryOwnerId || null);

  const doCreate = (fpVal: string | null) => prisma.hRCandidate.create({
    data: {
      // name column is non-null — fall back to the phone or a placeholder when blank.
      name: rawName || (normalizedPhone ? `Candidate ${normalizedPhone}` : "Unnamed candidate"),
      phone: normalizedPhone,
      whatsappPhone: normalizedWhatsapp,
      email: body.email || null,
      location: body.location || null,
      currentCompany: body.currentCompany || null,
      currentProfile: body.currentProfile || null,
      experience: body.experience || null,
      realEstateExperience: body.realEstateExperience || null,
      currentSalary: body.currentSalary ? parseFloat(body.currentSalary) : null,
      expectedSalary: body.expectedSalary ? parseFloat(body.expectedSalary) : null,
      noticePeriod: body.noticePeriod || null,
      source: body.source || null,
      status,
      remarks: body.remarks || null,
      nextActionDate,
      primaryOwnerId,
      secondaryOwnerId,
      fingerprint: fpVal,
      // ── Recruiting scorecard (HR Data workbook) — all optional free-text ──
      altEmail: body.altEmail || null,
      salesExperience: body.salesExperience || null,
      callingExperience: body.callingExperience || null,
      contactedBy: body.contactedBy || null,
      sopMet: body.sopMet || null,
      inviteMailSent: body.inviteMailSent || null,
      candidateAcknowledged: body.candidateAcknowledged || null,
      arrivedOnTime: body.arrivedOnTime || null,
      scorePersonality: body.scorePersonality || null,
      scoreConfidence: body.scoreConfidence || null,
      scoreCommunication: body.scoreCommunication || null,
      scoreBehaviour: body.scoreBehaviour || null,
      scoreGrasping: body.scoreGrasping || null,
      scoreListening: body.scoreListening || null,
      scoreNegotiation: body.scoreNegotiation || null,
      scoreCultureFit: body.scoreCultureFit || null,
      highestProductSold: body.highestProductSold || null,
      dealValue: body.dealValue || null,
      avgIncentive: body.avgIncentive || null,
      incentiveConsistent: body.incentiveConsistent || null,
      callsPerDay: body.callsPerDay || null,
      connectedCallsPerDay: body.connectedCallsPerDay || null,
      lastSaleDate: body.lastSaleDate || null,
      hrDecision: body.hrDecision || null,
      hrDetailedRemarks: body.hrDetailedRemarks || null,
      finalStatus: body.finalStatus || null,
    },
  });

  // Create with the fingerprint; on a @unique collision, distinguish a real ACTIVE
  // duplicate (block — no identity leak) from a lingering soft-deleted holder
  // (create with a null fingerprint, matching the import path). Audit #28.
  let candidate: Awaited<ReturnType<typeof doCreate>>;
  try {
    candidate = await doCreate(fp);
  } catch (e) {
    if ((e as { code?: string })?.code === "P2002" && fp) {
      const activeHolder = await prisma.hRCandidate.findFirst({ where: { fingerprint: fp, deletedAt: null }, select: { id: true } });
      if (activeHolder) return NextResponse.json({ duplicate: true, message: "A candidate with this phone or email already exists." }, { status: 409 });
      candidate = await doCreate(null);
    } else {
      throw e;
    }
  }

  // Creation timeline entry — Candidate Created (by / date / time on the activity).
  await prisma.hRActivity.create({
    data: {
      candidateId: candidate.id,
      userId: me.id,
      type: "NOTE_ADDED",
      notes: "Candidate created.",
      newStatus: candidate.status,
    },
  });

  // Seed the Remarks thread with the initial remark entered on the form, so the
  // Remarks card isn't empty when the candidate was created with a note.
  if (body.remarks && String(body.remarks).trim()) {
    await prisma.hRRemark.create({
      data: {
        candidateId: candidate.id,
        authorId: me.id,
        authorName: me.name,
        text: String(body.remarks).trim(),
        source: "MANUAL",
      },
    });
  }

  // Every active candidate gets an initial follow-up so nothing slips.
  if (nextActionDate) {
    const fuType = (body.followUpType as HRFollowUpType) || "CALL_BACK";
    // "Custom" follow-up carries a free-text label — capture it in the notes and
    // the timeline entry (the enum stays CUSTOM, but HR sees the real name).
    const customLabel = fuType === "CUSTOM" && body.followUpCustom ? String(body.followUpCustom).trim() : "";
    const fuLabel = customLabel || fuType.replace(/_/g, " ");
    await prisma.hRFollowUp.create({
      data: {
        candidateId: candidate.id,
        userId: me.id,
        type: fuType,
        dueAt: nextActionDate,
        notes: [customLabel, body.nextAction].filter(Boolean).join(" — ") || null,
      },
    });
    await prisma.hRActivity.create({
      data: {
        candidateId: candidate.id,
        userId: me.id,
        type: "FOLLOWUP_CREATED",
        notes: `Follow-up set: ${fuLabel} on ${nextActionDate.toLocaleDateString("en-IN")}`,
      },
    });
  } else if (!(CLOSED_STATUS_KEYS as readonly string[]).includes(candidate.status)) {
    // First-response SLA (audit #87/#90): a fresh candidate with no explicit
    // follow-up gets an auto same-day "first contact" task so applicants can't
    // sit untouched and untracked.
    const dueAt = new Date();
    await prisma.hRFollowUp.create({
      data: { candidateId: candidate.id, userId: me.id, type: "CALL_BACK", dueAt, autoCreated: true, notes: "First contact — reach out today" },
    });
    await prisma.hRCandidate.update({ where: { id: candidate.id }, data: { nextActionDate: dueAt } });
  }

  return NextResponse.json({ candidate }, { status: 201 });
}
