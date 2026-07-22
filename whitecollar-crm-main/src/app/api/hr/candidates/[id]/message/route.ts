// ─────────────────────────────────────────────────────────────────────────────
// POST /api/hr/candidates/[id]/message
// Send a WhatsApp or email to a candidate from the CRM (with graceful fallback).
//
// Body: { channel: "whatsapp" | "email", body: string, subject?: string }
// Returns: { ok, mode: "real"|"stub", fallbackLink?, error? }
//   • mode "real"  → actually delivered via Meta / Resend
//   • mode "stub"  → not configured; client should open `fallbackLink`
//                    (wa.me / mailto) to send manually. Either way it's logged.
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadOwnedCandidate } from "@/lib/hrAccess";
import { sendCandidateWhatsApp, sendCandidateEmail } from "@/lib/hrMessaging";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await loadOwnedCandidate(id);
  if (access.error) return access.error;
  const { me } = access;

  // Per-user send throttle — this route dispatches WhatsApp/email to candidates
  // (external, costs money). ~40 sends / 5 min per user (audit #100).
  const rl = isRateLimited(`hr:message:${me.id}`, 40, 5 * 60 * 1000);
  if (rl.limited) return NextResponse.json({ error: `Too many messages — retry in ${rl.retryAfterSec}s.` }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const channel = body.channel as "whatsapp" | "email";
  const text = typeof body.body === "string" ? body.body.trim() : "";

  if (channel !== "whatsapp" && channel !== "email") {
    return NextResponse.json({ error: "channel must be 'whatsapp' or 'email'" }, { status: 400 });
  }
  if (!text) return NextResponse.json({ error: "Message body is required" }, { status: 400 });

  const candidate = await prisma.hRCandidate.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, name: true, phone: true, whatsappPhone: true, email: true },
  });
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result =
    channel === "whatsapp"
      ? await sendCandidateWhatsApp(candidate, text, me.id)
      : await sendCandidateEmail(candidate, (body.subject as string)?.trim() || "White Collar Realty", text, me.id);

  const status = result.ok ? 200 : 502;
  return NextResponse.json(result, { status });
}
