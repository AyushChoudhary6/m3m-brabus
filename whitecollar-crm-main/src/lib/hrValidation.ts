// Isomorphic candidate-input validators — used by BOTH the Add Candidate form
// (client) and the create API route (server), so the rules can't be bypassed by
// hand-crafting a POST. Pure functions only (no node/browser APIs).

type FieldOpts = { required?: boolean; label?: string };

/**
 * Name must be human letters only. Allows spaces and the punctuation that shows
 * up in real names (apostrophe, hyphen, period — "O'Brien", "Anne-Marie", "Jr.").
 * Rejects digits and every other special character, AND placeholder junk like a
 * single letter repeated ("hhhh"). Uses the Unicode letter class so accented /
 * non-Latin names (é, ñ, अ, ع…) are accepted.
 */
export function validateCandidateName(raw: string): string | null {
  const t = (raw ?? "").trim();
  if (!t) return "Candidate name is required.";
  if (t.length < 2) return "Enter the candidate's full name.";
  if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(t)) {
    return "Name should contain letters only — no numbers or special characters.";
  }
  const letters = t.replace(/[^\p{L}]/gu, "");
  if (letters.length < 2) return "Enter a valid name.";
  // Reject a single character repeated ("hhhh", "aaaa") — needs ≥2 distinct letters.
  if (new Set(letters.toLowerCase()).size < 2) return "Enter a valid full name.";
  return null;
}

const PHONE_ERR =
  "Enter a valid Indian (10-digit, starts 6–9) or Dubai (+971 5X XXX XXXX) number.";
const PHONE_FAKE =
  "That looks like a placeholder number — enter a real mobile number.";

export type PhoneResult = { ok: true; value: string } | { ok: false; error: string };

// Reject obviously-fake subscriber numbers: all-same digit, ≤2 distinct digits
// (e.g. 9090909090), or a straight ascending/descending run (1234567890 / 9876543210).
function isFakeDigitRun(num: string): boolean {
  if (new Set(num).size <= 2) return true;
  let asc = true, desc = true;
  for (let i = 1; i < num.length; i++) {
    const diff = Number(num[i]) - Number(num[i - 1]);
    if (diff !== 1) asc = false;
    if (diff !== -1) desc = false;
  }
  return asc || desc;
}

/**
 * Normalise a mobile number to E.164 for India (+91) or the UAE / Dubai (+971),
 * the two markets this team recruits for. Accepts the number with or without a
 * country code, with 0-prefixes, and with spaces / dashes / brackets.
 *   • India  → +91 followed by 10 digits starting 6–9
 *   • Dubai  → +971 followed by 9 digits starting 5 (UAE mobiles)
 * Placeholder patterns (repeated / sequential digits) are rejected.
 */
export function normalizeContactPhone(raw: string): PhoneResult {
  const d = (raw ?? "").replace(/\D/g, "");
  if (!d) return { ok: false, error: "Mobile number is required." };

  let country = "";
  let national = "";
  if (d.startsWith("971")) {
    country = "+971"; national = d.slice(3);
    if (!(national.length === 9 && national.startsWith("5"))) return { ok: false, error: PHONE_ERR };
  } else if (d.startsWith("91") && d.length === 12) {
    country = "+91"; national = d.slice(2);
    if (!/^[6-9]\d{9}$/.test(national)) return { ok: false, error: PHONE_ERR };
  } else if (d.length === 10 && /^[6-9]/.test(d)) {
    country = "+91"; national = d;
  } else if (d.length === 11 && d.startsWith("0") && /^[6-9]/.test(d[1])) {
    country = "+91"; national = d.slice(1);
  } else if (d.length === 9 && d.startsWith("5")) {
    country = "+971"; national = d;
  } else if (d.length === 10 && d.startsWith("05")) {
    country = "+971"; national = d.slice(1);
  } else {
    return { ok: false, error: PHONE_ERR };
  }

  if (isFakeDigitRun(national)) return { ok: false, error: PHONE_FAKE };
  return { ok: true, value: country + national };
}

// Common consumer providers this team's candidates almost always use — a domain
// that's one keystroke away from one of these is treated as a typo.
const COMMON_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "yahoo.co.in", "hotmail.com", "outlook.com",
  "rediffmail.com", "icloud.com", "live.com", "ymail.com", "protonmail.com",
];
// Frequent misspellings that edit-distance alone won't catch (e.g. "gm.com").
const EMAIL_TYPO_FIX: Record<string, string> = {
  "gm.com": "gmail.com", "gmai.com": "gmail.com", "gmial.com": "gmail.com",
  "gmil.com": "gmail.com", "gnail.com": "gmail.com", "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com", "gmail.con": "gmail.com", "gmail.cm": "gmail.com",
  "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "yhoo.com": "yahoo.com",
  "hotmai.com": "hotmail.com", "hotmial.com": "hotmail.com", "hotmil.com": "hotmail.com",
  "outlok.com": "outlook.com", "outook.com": "outlook.com",
  "rediff.com": "rediffmail.com", "redifmail.com": "rediffmail.com",
};

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

/**
 * Email check. `required=false` lets an empty value pass. Enforces a proper
 * structure (valid local part, domain labels, letters-only TLD) AND flags a
 * mistyped consumer-provider domain like "qw@gm.com" or "…@gmial.com".
 */
export function validateCandidateEmail(raw: string, required = false): string | null {
  const t = (raw ?? "").trim();
  if (!t) return required ? "Email is required." : null;
  const m = t.match(/^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24})$/);
  if (!m) return "Enter a valid email address (e.g. name@example.com).";
  if (/\.\./.test(t) || t.startsWith(".") || /\.@/.test(t)) {
    return "Enter a valid email address (e.g. name@example.com).";
  }
  const domain = m[1].toLowerCase();
  // An exact known provider is valid — don't near-miss it against a sibling
  // (gmail.com is 1 edit from ymail.com, but it's obviously fine).
  if (COMMON_EMAIL_DOMAINS.includes(domain)) return null;
  const suggest = EMAIL_TYPO_FIX[domain]
    ?? COMMON_EMAIL_DOMAINS.find(d => levenshtein(domain, d) === 1);
  if (suggest) return `Did you mean …@${suggest}? Please check the email domain.`;
  return null;
}

/**
 * Place name (city / location) — letters + spaces + .'- only, needs ≥2 letters.
 * Rejects all-numeric junk like "0999".
 */
export function validatePlaceName(raw: string, opts: FieldOpts = {}): string | null {
  const { required = false, label = "This field" } = opts;
  const t = (raw ?? "").trim();
  if (!t) return required ? `${label} is required.` : null;
  if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(t)) return `${label} should contain letters only.`;
  if (t.replace(/[^\p{L}]/gu, "").length < 2) return `Enter a valid ${label.toLowerCase()}.`;
  return null;
}

/**
 * Free-text that must be real words, not a number dump — allows alphanumerics
 * (company names like "Century 21", "3M") but requires at least 2 letters, so
 * "0090" / "0000" are rejected.
 */
export function validateHasLetters(raw: string, opts: FieldOpts = {}): string | null {
  const { required = false, label = "This field" } = opts;
  const t = (raw ?? "").trim();
  if (!t) return required ? `${label} is required.` : null;
  if ((t.match(/\p{L}/gu) ?? []).length < 2) {
    return `Enter a valid ${label.toLowerCase()} (not just numbers).`;
  }
  return null;
}

/**
 * Experience — accepts "Fresher" / "None" or anything containing a number
 * ("3 years", "5+"). Rejects pure gibberish like "plpl".
 */
export function validateExperience(raw: string, opts: FieldOpts = {}): string | null {
  const { required = false, label = "Experience" } = opts;
  const t = (raw ?? "").trim();
  if (!t) return required ? `${label} is required.` : null;
  if (/\b(fresher|none|nil|n\/?a)\b/i.test(t)) return null;
  if (!/\d/.test(t)) return `${label} should include years (e.g. "3 years") or "Fresher".`;
  return null;
}

/**
 * Pull a number of years out of a free-text experience value:
 *   "7" → 7 · "3 years" → 3 · "5+" → 5 · "1.5 yrs" → 1.5 · "Fresher" → 0.
 * Returns null when no number can be found (caller decides what that means).
 */
export function parseExperienceYears(raw: string): number | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  if (/\b(fresher|none|nil|n\/?a)\b/i.test(t)) return 0;
  const m = t.match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

/** Resume upload guard. Mirrors the server's accepted formats + 5 MB cap. */
const RESUME_EXT = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp", "heic"];
const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export function validateResumeFile(f: { name: string; size: number }): string | null {
  const ext = f.name.split(".").pop()?.toLowerCase();
  if (!ext || !RESUME_EXT.includes(ext)) {
    return `“${f.name}” — unsupported format. Use PDF, DOC, DOCX, or an image (JPG/PNG).`;
  }
  if (f.size === 0) return `“${f.name}” is empty.`;
  if (f.size > RESUME_MAX_BYTES) return `“${f.name}” is too large (max 5 MB).`;
  return null;
}
