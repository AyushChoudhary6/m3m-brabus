// Per-user HR calendar feed (audit #59). Subscribe from Google/Apple/Outlook to
// your HR interviews + open follow-ups — NO OAuth, auth is the HMAC token shown in
// HR Settings. Calendar clients poll every ~15-60 min, so a 5-min cache is set.
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyIcsToken, renderEvent, wrapCalendar } from "@/lib/ics";
import { CLOSED_STATUS_KEYS } from "@/lib/hrStatus";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://crm.whitecollarrealty.com";

export async function GET(req: NextRequest) {
  const userId = verifyIcsToken(req.nextUrl.searchParams.get("token"));
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, active: true } });
  if (!user || !user.active) return new Response("Unauthorized", { status: 401 });

  const now = new Date();
  const windowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [interviews, followUps] = await Promise.all([
    // Interviews this user owns (as interviewer OR the candidate's primary owner).
    prisma.hRInterview.findMany({
      where: {
        scheduledAt: { gte: windowStart, lt: windowEnd },
        attendanceStatus: { in: ["SCHEDULED", "RESCHEDULED", "ARRIVED", "LATE", "IN_PROGRESS"] },
        candidate: { deletedAt: null, status: { notIn: CLOSED_STATUS_KEYS } },
        OR: [{ interviewerId: user.id }, { candidate: { primaryOwnerId: user.id } }],
      },
      select: { id: true, type: true, scheduledAt: true, candidateId: true, candidate: { select: { name: true, phone: true } } },
    }),
    prisma.hRFollowUp.findMany({
      where: { userId: user.id, completedAt: null, dueAt: { gte: windowStart, lt: windowEnd }, candidate: { deletedAt: null } },
      select: { id: true, type: true, dueAt: true, notes: true, candidateId: true, candidate: { select: { name: true, phone: true } } },
    }),
  ]);

  const stamp = new Date();
  const events: string[] = [];
  const fmt = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  for (const iv of interviews) {
    const start = iv.scheduledAt;
    const end = new Date(start.getTime() + 45 * 60 * 1000);
    const url = `${BASE_URL}/hr/candidates/${iv.candidateId}`;
    events.push(renderEvent(stamp, {
      uid: `wcr-hr-iv-${iv.id}@whitecollarrealty.com`, start, end,
      summary: `${fmt(iv.type)} Interview — ${iv.candidate.name}`,
      description: [iv.candidate.phone ? `Phone: ${iv.candidate.phone}` : "", url].filter(Boolean).join("\n"),
      url,
    }));
  }
  for (const fu of followUps) {
    const start = fu.dueAt;
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const url = `${BASE_URL}/hr/candidates/${fu.candidateId}`;
    events.push(renderEvent(stamp, {
      uid: `wcr-hr-fu-${fu.id}@whitecollarrealty.com`, start, end,
      summary: `${fmt(fu.type)} — ${fu.candidate.name}`,
      description: [fu.notes ?? "", fu.candidate.phone ? `Phone: ${fu.candidate.phone}` : "", url].filter(Boolean).join("\n"),
      url,
    }));
  }

  return new Response(wrapCalendar(`WCR HR — ${user.name}`, events), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=300",
      "Content-Disposition": `inline; filename="wcr-hr-calendar.ics"`,
    },
  });
}
