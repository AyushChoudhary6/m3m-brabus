// Splits a stacked HR "Remarks / Notes" cell (one Excel cell holding several
// remarks from different HR people, e.g. "18 Jun 2026 - Rohit: spoke, wants 8L\n
// 15 Jun 2026 - Nitisha: not picked") into individual HRRemark rows.
//
// Rather than write a second remark splitter, this reuses the battle-tested Sales
// parser (parseRemarksTimeline) which already handles the exact same MIS stacked
// format: date extraction (IST), sticky agent attribution ("Name: …"), 2-digit
// years, and undated-line attachment. We only keep the fields HR needs — the text,
// when it happened, and who said it — and drop the Sales-specific call-outcome
// classification, which is irrelevant to a recruitment remark thread.

import { parseRemarksTimeline } from "@/lib/remarkParser";

export interface ParsedHrRemark {
  /** Clean remark text (no leading "Name: " / date prefix). */
  text: string;
  /** When the remark was made (parsed date, or the candidate's createdAt fallback). */
  remarkAt: Date;
  /** Author name parsed from the text (e.g. "Nitisha"), or null if none was named. */
  authorName: string | null;
}

// Words that read like a "Name:" prefix but are roles/labels, not people — never
// peeled as the author (the whole remark stays intact instead).
const NON_AUTHOR = new Set([
  "client", "candidate", "note", "remark", "remarks", "status", "update",
  "hr", "call", "whatsapp", "email", "follow", "followup", "interview", "reason",
]);

// When the parser couldn't attribute an entry but the text still leads with a
// "Name: rest" prefix (common once a leading date is stripped, e.g. the stacked
// cell "18 Jun 2026 - Rohit: spoke…"), peel that name off as the author. Colon
// form only — a strong attribution signal — and only for a plausible 1–2 word
// capitalized person name, so remark content is never mis-parsed as an author.
function peelLeadingAuthor(text: string): { authorName: string | null; text: string } {
  const m = text.match(/^([A-Z][A-Za-z]{1,20}(?:\s+[A-Z][A-Za-z]{1,20})?)\s*:\s*([\s\S]+)$/);
  if (!m) return { authorName: null, text };
  const name = m[1].trim();
  const rest = m[2].trim();
  if (!rest) return { authorName: null, text };
  if (name.split(/\s+/).some(w => NON_AUTHOR.has(w.toLowerCase()))) return { authorName: null, text };
  return { authorName: name, text: rest };
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// The Sales parser stores a DATE-ONLY remark at a noon-IST sentinel (12:00 pm),
// but HR sheets write the real clock time INSIDE the body — "On 10 Jul 2026 at
// 3:42pm, busy" / "called at 12:00pm, poor comm". parseRemarksTimeline only
// promotes a *parenthesised* time, so that clock time was left stranded in the
// text ("at 3:42 busy") and the remark showed 12:00 pm. This peels a leading
// "at H:MM[am/pm]" (optionally prefixed by "called") off the body and applies it
// to the remark's timestamp on the SAME IST calendar day.
export function promoteLeadingTime(text: string, base: Date): { text: string; remarkAt: Date | null } {
  const m = text.match(/^\s*(?:call(?:ed)?\s+)?at\s+(\d{1,2})[:.](\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)?\s*[,.;:\-]*\s*/i);
  if (!m) return { text, remarkAt: null };
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return { text, remarkAt: null }; // not a real clock time
  const ap = (m[3] || "").toLowerCase().replace(/[^ap]/g, "").charAt(0);
  if (ap === "p") { if (h < 12) h += 12; }
  else if (ap === "a") { if (h === 12) h = 0; }
  else if (h >= 1 && h <= 8) { h += 12; } // no am/pm → infer PM for 1–8 (IST calling hours ~9am–8pm; 9–12 kept as-is)
  // Rebuild the timestamp on `base`'s IST calendar day at the extracted h:min.
  const ist = new Date(base.getTime() + IST_OFFSET_MS);
  const remarkAt = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), h, min) - IST_OFFSET_MS);
  const stripped = text.slice(m[0].length).trim();
  return { text: stripped || text, remarkAt };
}

/**
 * Parse a stacked remarks cell into ordered remark entries (oldest first — the
 * Remarks card re-sorts by remarkAt desc for display).
 *
 * @param cell       The raw HRCandidate remarks cell.
 * @param hrNames    Known HR user names, so "Rohit: …" attributes to the roster.
 * @param createdAt  Candidate creation date — fallback date for undated remarks.
 */
export function parseHrRemarksCell(
  cell: string | null | undefined,
  hrNames: string[],
  createdAt: Date,
): ParsedHrRemark[] {
  const raw = (cell ?? "").trim();
  if (!raw) return [];

  const entries = parseRemarksTimeline(raw, hrNames, createdAt)
    .map((e) => {
      // Prefer the parser's own attribution; otherwise try to peel a "Name:" the
      // parser left in the body (happens when the line led with a date).
      let authorName = e.agentName;
      let text = e.text.trim();
      if (!authorName) {
        const peeled = peelLeadingAuthor(text);
        authorName = peeled.authorName;
        text = peeled.text;
      }
      // Promote a body-leading "at H:MM[am/pm]" onto the timestamp (HR sheets put
      // the real clock time in the text, not in parens) and strip it from display.
      let remarkAt = e.date ?? createdAt;
      const timed = promoteLeadingTime(text, remarkAt);
      if (timed.remarkAt) { remarkAt = timed.remarkAt; text = timed.text; }
      return { text, remarkAt, authorName };
    })
    .filter((e) => e.text.length > 0);

  // Fallback: if the parser produced nothing (e.g. a very short one-liner it
  // discarded), never lose the remark — keep the whole cell as a single entry.
  if (entries.length === 0) {
    return [{ text: raw, remarkAt: createdAt, authorName: null }];
  }
  return entries;
}
