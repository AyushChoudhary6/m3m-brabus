// Shared ICS (iCalendar) helpers + per-user HMAC token — reused by the HR calendar
// feed. Auth is a short HMAC token (userId.signature); NO OAuth / no external creds.
import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is not set");
  return s;
}

/** The subscribe token for a user: `userId.hmac(userId)`. Same scheme as the Sales feed. */
export function icsTokenFor(userId: string): string {
  return `${userId}.${createHmac("sha256", secret()).update(userId).digest("hex")}`;
}

export function verifyIcsToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const idx = token.indexOf(".");
  if (idx <= 0 || idx === token.length - 1) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", secret()).update(userId).digest("hex");
  if (sig.length !== expected.length) return null;
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || a.length === 0) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return userId;
}

// RFC 5545 §3.3.11 — escape \, ;, , and newline in TEXT values.
export function escapeText(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

// RFC 5545 §3.1 — fold long lines at 75 octets with CRLF + space.
export function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) { out.push(" " + line.slice(i, i + 74)); i += 74; }
  return out.join("\r\n");
}

export function fmtIcsDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

export interface IcsEvent { uid: string; start: Date; end: Date; summary: string; description: string; url: string; }

export function renderEvent(stamp: Date, ev: IcsEvent): string {
  return [
    "BEGIN:VEVENT",
    `UID:${ev.uid}`,
    `DTSTAMP:${fmtIcsDate(stamp)}`,
    `DTSTART:${fmtIcsDate(ev.start)}`,
    `DTEND:${fmtIcsDate(ev.end)}`,
    `SUMMARY:${escapeText(ev.summary)}`,
    `DESCRIPTION:${escapeText(ev.description)}`,
    `URL:${ev.url}`,
    "END:VEVENT",
  ].map(foldLine).join("\r\n");
}

export function wrapCalendar(name: string, events: string[]): string {
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//WCR//HR CRM//EN", "METHOD:PUBLISH", "CALSCALE:GREGORIAN",
    foldLine(`X-WR-CALNAME:${escapeText(name)}`), "X-WR-TIMEZONE:Asia/Kolkata",
    ...events, "END:VCALENDAR",
  ].join("\r\n") + "\r\n";
}
