// ─────────────────────────────────────────────────────────────────────────────
// HR candidate messaging — outbound WhatsApp + email for RECRUITMENT.
//
// The sales side has `whatsappOutbound.ts` (bound to Lead + WhatsAppMessage) and
// `email.ts` (Resend). This module is the HR equivalent: it messages an
// HRCandidate, logs the send onto the candidate timeline (HRActivity), and
// degrades gracefully so recruiters get value TODAY even before Meta/Resend
// credentials are set:
//
//   • WhatsApp — real send via Meta Cloud API when WA_BUSINESS_TOKEN +
//     WA_BUSINESS_PHONE_NUMBER_ID are set; otherwise returns a wa.me deep-link
//     the client opens (the current UX), and still logs WHATSAPP_SENT.
//   • Email — real send via Resend when RESEND_API_KEY + RESEND_FROM are set;
//     otherwise returns a mailto: link and logs EMAIL_LOGGED as "drafted".
//
// A manual recruiter send is NEVER gated on the global automation toggle — that
// switch only governs *automated* messaging. Pressing "Send" always sends.
// ─────────────────────────────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplate, emailEnabled } from "@/lib/email";
import { whatsappEnabled } from "@/lib/whatsappOutbound";
import { waNumber } from "@/lib/waOpen";

const META_BASE = "https://graph.facebook.com/v21.0";

export type MsgMode = "real" | "stub";

export interface HrMsgResult {
  ok: boolean;
  mode: MsgMode;
  /** wa.me / mailto: fallback link the client should open when mode === "stub". */
  fallbackLink?: string;
  providerMsgId?: string;
  error?: string;
}

export interface HrCandidateContact {
  id: string;
  name: string;
  phone?: string | null;
  whatsappPhone?: string | null;
  email?: string | null;
}

/** Best WhatsApp-dialable number for a candidate (whatsappPhone wins, then phone). */
export function candidateWaNumber(c: HrCandidateContact): string {
  return waNumber(c.whatsappPhone) || waNumber(c.phone);
}

/**
 * Send (or draft) a WhatsApp text to a candidate and log it on the timeline.
 * `userId` is the acting recruiter (for the activity attribution).
 */
export async function sendCandidateWhatsApp(
  c: HrCandidateContact,
  text: string,
  userId?: string | null,
): Promise<HrMsgResult> {
  const to = candidateWaNumber(c);
  if (!to) {
    return { ok: false, mode: "stub", error: "Candidate has no WhatsApp/phone number" };
  }

  let result: HrMsgResult;

  if (whatsappEnabled()) {
    // ── REAL Meta Cloud API send (free-form text; valid inside the 24h window) ──
    try {
      const phoneNumberId = process.env.WA_BUSINESS_PHONE_NUMBER_ID!;
      const token = process.env.WA_BUSINESS_TOKEN!;
      const r = await fetch(`${META_BASE}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        result = { ok: false, mode: "real", error: `Meta ${r.status}: ${JSON.stringify(j).slice(0, 180)}` };
      } else {
        result = { ok: true, mode: "real", providerMsgId: j?.messages?.[0]?.id ?? undefined };
      }
    } catch (e) {
      result = { ok: false, mode: "real", error: String(e).slice(0, 180) };
    }
  } else {
    // ── STUB: hand the client a wa.me deep-link (pre-filled) to open manually ──
    result = {
      ok: true,
      mode: "stub",
      fallbackLink: `https://wa.me/${to}?text=${encodeURIComponent(text)}`,
    };
  }

  // Log the outbound onto the candidate timeline regardless of mode, so the
  // "message history" is complete. Note captures the body + delivery mode.
  await logMessageActivity(c.id, userId, "WHATSAPP_SENT", text, result);
  return result;
}

/**
 * Send (or draft) an email to a candidate and log it on the timeline.
 */
export async function sendCandidateEmail(
  c: HrCandidateContact,
  subject: string,
  body: string,
  userId?: string | null,
): Promise<HrMsgResult> {
  if (!c.email) {
    return { ok: false, mode: "stub", error: "Candidate has no email address" };
  }

  let result: HrMsgResult;

  if (emailEnabled()) {
    const html = emailTemplate({ title: subject, body });
    const sent = await sendEmail({ to: c.email, subject, html, text: body });
    result = sent.ok
      ? { ok: true, mode: "real", providerMsgId: sent.id }
      : { ok: false, mode: "real", error: sent.error };
  } else {
    // ── STUB: mailto: link so the recruiter can send from their own client ──
    result = {
      ok: true,
      mode: "stub",
      fallbackLink: `mailto:${c.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    };
  }

  await logMessageActivity(c.id, userId, "EMAIL_LOGGED", `${subject}\n\n${body}`, result);
  return result;
}

/** Timeline note for a message send, tagged with delivery mode. */
async function logMessageActivity(
  candidateId: string,
  userId: string | null | undefined,
  type: "WHATSAPP_SENT" | "EMAIL_LOGGED",
  content: string,
  result: HrMsgResult,
): Promise<void> {
  const tag =
    result.mode === "real"
      ? (result.ok ? "sent" : "failed")
      : "drafted (opened in your app)";
  const excerpt = content.length > 500 ? content.slice(0, 500) + "…" : content;
  await prisma.hRActivity
    .create({
      data: {
        candidateId,
        userId: userId ?? null,
        type,
        notes: `[${tag}] ${excerpt}`,
      },
    })
    .catch((e) => console.error("[hrMessaging] failed to log activity", e));
}
