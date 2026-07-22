import { requireHrPage, canTouchCandidate } from "@/lib/hrAccess";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import HRCandidateDetail from "@/components/HRCandidateDetail";
import { getHrUsers } from "@/lib/hrUsers";

export const dynamic = "force-dynamic";

export default async function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { me, perms } = await requireHrPage();
  const { id } = await params;

  const [candidate, agents] = await Promise.all([
    prisma.hRCandidate.findUnique({
      where: { id },
      include: {
        primaryOwner:   { select: { id: true, name: true, avatarColor: true } },
        secondaryOwner: { select: { id: true, name: true, avatarColor: true } },
        // Cap activities to the 60 newest (desc) for perf — the timeline still
        // renders ascending-within-day client-side, so the newest day shows in full.
        activities:     { orderBy: { createdAt: "desc" }, take: 60, include: { user: { select: { name: true } } } },
        // Full conversation-thread remarks, newest-first — powers the Remarks card
        // (and is folded into the unified Conversation timeline).
        remarkEntries:  { orderBy: { remarkAt: "desc" }, take: 100, include: { author: { select: { name: true, avatarColor: true } } } },
        interviews:     { orderBy: { scheduledAt: "asc" }, take: 50, include: { interviewer: { select: { name: true } } } },
        followUps:      { orderBy: { dueAt: "asc" }, take: 50, include: { user: { select: { name: true } } } },
        // Resume History: keep ALL versions (never lose previous), active first
        // then newest. uploadedBy name powers the "uploaded by" line in the tab.
        // NOTE: `url` (base64 data URL) is DELIBERATELY omitted — downloads stream
        // from the resume endpoint, so embedding megabytes of bytes per version in
        // the page payload was pure waste (audit #138).
        resumes:        { orderBy: [{ isActive: "desc" }, { createdAt: "desc" }], select: { id: true, candidateId: true, filename: true, mimeType: true, isActive: true, createdAt: true, uploadedBy: { select: { name: true } } } },
        applications:   { orderBy: { submittedAt: "desc" }, take: 50 },  // website/form application history (capped — audit #142)
        // Voice + escalations feed the unified conversation timeline. Audio bytes
        // (audioData) are NEVER selected here — they stream from the play endpoint.
        // The Voice & Escalations card self-fetches its own full state separately.
        voiceMessages:  {
          orderBy: { createdAt: "desc" },
          select: { id: true, kind: true, createdById: true, title: true, textNote: true, transcript: true, durationSec: true, escalationId: true, createdAt: true },
        },
        escalations:    {
          orderBy: { createdAt: "desc" },
          select: { id: true, reason: true, status: true, raisedById: true, resolvedAt: true, createdAt: true },
        },
      },
    }),
    getHrUsers(),
  ]);

  if (!candidate) notFound();
  if (candidate.deletedAt) notFound(); // soft-deleted (recycle-bin) → 404
  if (!canTouchCandidate(me, candidate)) notFound();

  return (
    <HRCandidateDetail
      candidate={candidate as never}
      agents={agents}
      me={{ id: me.id, name: me.name, role: me.role }}
      voicePerms={{
        canGuide: perms.sendVoiceGuidance,
        canEscalate: perms.raiseEscalation,
        canReview: perms.reviewEscalations,
      }}
    />
  );
}
