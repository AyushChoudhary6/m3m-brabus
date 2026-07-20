// ============================================================
// Spam / junk-lead defence (PRD Ch. 78) — honestly scoped.
//
// WHAT THIS CANNOT DO. This site is a static SPA on a CDN. There is no server
// of ours in the request path, so there is NO IP rate limiting, NO server-side
// throttling, NO CAPTCHA verification and NO way to stop a determined script
// that POSTs the Apps Script endpoint directly. Every check below runs in the
// visitor's own browser and can be bypassed by anyone who opens devtools.
// Real enforcement has to live in the Apps Script (or in front of it); the only
// thing this file can do is keep casual bots and fat-finger duplicates out of
// the sheet, and tag the doubtful ones so a human can triage.
//
// POLICY. A false positive here throws away a buyer for a crore-plus residence.
// So only two things HARD BLOCK — the honeypot (no human can trip it) and a
// repeat of the identical enquiry inside a few minutes (a genuine buyer loses
// nothing). Everything else is recorded as a soft signal on the payload and
// sent through, for the desk to judge.
// ============================================================

const KEY_RECENT = "mb-lead-recent"; // recent submissions, for duplicate detection

const ls = {
  json(k, fallback) {
    try { return JSON.parse(window.localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
  },
  set(k, v) {
    try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ }
  },
};

/** Non-cryptographic key so the recent-submission log isn't a plaintext CRM. */
function fingerprint(str = "") {
  let h = 5381;
  const s = String(str).toLowerCase().replace(/\s|-/g, "");
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/* ---------------- honeypot ---------------- */

// Enquiry.jsx already renders <input type="text" name="company" tabIndex={-1}
// className="hidden" />. A person never fills it; most form-filling bots do.
const HONEYPOT_NAME = "company";

/**
 * Pull the honeypot value out of whatever the caller has to hand: a submit
 * event, a <form> element, or a plain object of form values.
 */
export function readHoneypot(src) {
  try {
    if (!src) return "";
    if (typeof src === "string") return src;
    const form = src.currentTarget || src.target || src;
    if (form.elements && form.elements[HONEYPOT_NAME]) {
      return form.elements[HONEYPOT_NAME].value || "";
    }
    return src[HONEYPOT_NAME] || "";
  } catch {
    return "";
  }
}

/** True when the hidden field was filled — the one signal worth blocking on. */
export function honeypotTripped(src) {
  return String(readHoneypot(src)).trim().length > 0;
}

/* ---------------- time to submit ---------------- */

// Timers are held in module memory, not storage: they only need to outlive a
// modal, and a reload legitimately restarts the clock.
const timers = new Map();
let firstInteractionAt = 0;

/** Start (once) the clock for a form. Safe to call on every keystroke. */
export function startTimer(key = "default") {
  if (!timers.has(key)) timers.set(key, Date.now());
}

/** Clear a form's clock — call when the modal closes or after a send. */
export function resetTimer(key = "default") {
  timers.delete(key);
}

/** The clock backing a form: its own if wired up, else the page's first interaction. */
function startedAt(key) {
  return timers.get(key) || firstInteractionAt || 0;
}

/** Milliseconds since the form was first touched. 0 when never started. */
export function elapsedMs(key = "default") {
  const t = startedAt(key);
  return t ? Date.now() - t : 0;
}

/**
 * A form completed in under ~2.5s was not typed by a person — a name, a phone
 * number and an email is more keystrokes than that allows.
 *
 * If no timer was ever started (a form that hasn't wired startTimer up, and no
 * page interaction recorded) we return false. Silence is not evidence.
 */
export function tooFast(key = "default", minMs = 2500) {
  const t = startedAt(key);
  return t > 0 && Date.now() - t < minMs;
}

/**
 * Records the visitor's first real interaction with the page, so even a form
 * that never calls startTimer gets a rough floor. Installed at import.
 */
function watchFirstInteraction() {
  if (typeof window === "undefined") return;
  const mark = () => {
    if (!firstInteractionAt) firstInteractionAt = Date.now();
  };
  ["pointerdown", "keydown", "touchstart"].forEach((e) =>
    window.addEventListener(e, mark, { once: true, passive: true, capture: true })
  );
}

/* ---------------- disposable email ---------------- */

// Best-effort only. The real list runs to tens of thousands of domains and
// changes weekly; shipping it would cost more bytes than the whole app. This is
// the handful that actually shows up in Indian property-portal traffic, and it
// is deliberately a SOFT signal — plenty of legitimate buyers use an alias
// address to keep brokers out of their main inbox.
const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "sharklasers.com",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org",
  "throwawaymail.com", "yopmail.com", "yopmail.fr", "getnada.com", "nada.email",
  "dispostable.com", "trashmail.com", "trashmail.de", "maildrop.cc", "fakeinbox.com",
  "mailnesia.com", "mytemp.email", "moakt.com", "emailondeck.com", "spam4.me",
  "grr.la", "spamgourmet.com", "mailcatch.com", "tempr.email", "discard.email",
  "inboxbear.com", "burnermail.io", "mail-temporaire.fr", "tempmailo.com",
]);

export function emailDomain(email = "") {
  const at = String(email).lastIndexOf("@");
  return at === -1 ? "" : String(email).slice(at + 1).trim().toLowerCase();
}

/** @returns {boolean} best-effort; absence of a hit means nothing. */
export function isDisposableEmail(email = "") {
  const d = emailDomain(email);
  if (!d) return false;
  if (DISPOSABLE.has(d)) return true;
  // ...and the obvious sub-domain dodge (foo.mailinator.com)
  return [...DISPOSABLE].some((bad) => d.endsWith(`.${bad}`));
}

/* ---------------- payload shape ---------------- */

const URL_RE = /(https?:\/\/|www\.|\.(?:ru|xyz|top|click|loan)\b)/i;

/**
 * Cheap pattern checks on what was typed. Each returns a short tag; the tags
 * travel with the lead rather than blocking it.
 * @returns {string[]}
 */
export function botSignals(form = {}) {
  const flags = [];
  const name = String(form.name || "").trim();
  const email = String(form.email || "").trim();
  const phone = String(form.phone || "").replace(/\D/g, "");
  const message = String(form.message || "");

  if (URL_RE.test(name) || URL_RE.test(message)) flags.push("link-in-text");
  if (/(.)\1{4,}/.test(name) || /(.)\1{6,}/.test(phone)) flags.push("repeated-chars");
  if (name && !/\s/.test(name) && name.length > 24) flags.push("no-word-break");
  // "asdfgh", "qwerty" and friends — a long run with no vowel is not a name
  if (/[bcdfghjklmnpqrstvwxz]{6,}/i.test(name)) flags.push("consonant-run");
  if (phone && /^(\d)\1+$/.test(phone)) flags.push("uniform-phone");
  if (name && email && fingerprint(name) === fingerprint(email.split("@")[0])) flags.push("name-equals-email");
  if (isDisposableEmail(email)) flags.push("disposable-email");
  if (message.length > 400 && (message.match(/https?:\/\//g) || []).length > 1) flags.push("link-spam");

  return flags;
}

/* ---------------- duplicates & client-side rate limit ---------------- */

const DUP_WINDOW = 10 * 60e3;  // same person, same details, within 10 minutes
const RATE_WINDOW = 60 * 60e3; // any submission from this browser
const RATE_MAX = 5;            // …five an hour is already generous for one buyer

function recentLog() {
  const list = ls.json(KEY_RECENT, []);
  if (!Array.isArray(list)) return [];
  const cutoff = Date.now() - RATE_WINDOW;
  return list.filter((e) => e && typeof e.t === "number" && e.t > cutoff);
}

/** Stable key for "this is the same enquiry" — phone and email, not the prose. */
export function leadKey(form = {}) {
  return fingerprint(`${String(form.phone || "").replace(/\D/g, "")}|${String(form.email || "").toLowerCase()}`);
}

/** True when this exact phone+email went in moments ago (double-click, back-button resubmit). */
export function isDuplicate(form, withinMs = DUP_WINDOW) {
  const key = leadKey(form);
  const cutoff = Date.now() - withinMs;
  return recentLog().some((e) => e.k === key && e.t > cutoff);
}

/** True when this browser has submitted more than RATE_MAX times in the last hour. */
export function isRateLimited(max = RATE_MAX) {
  return recentLog().length >= max;
}

/** Record a submission so the two checks above have something to see. */
export function rememberSubmission(form = {}) {
  const list = recentLog();
  list.push({ k: leadKey(form), t: Date.now() });
  ls.set(KEY_RECENT, list.slice(-20));
}

/* ---------------- composition ---------------- */

/**
 * Run every check and decide.
 *
 * @param {object} form  the lead values
 * @param {{ formKey?: string, honeypot?: any, minMs?: number }} opts
 *        honeypot — a submit event, a <form>, or the raw hidden-field value
 * @returns {{ ok: boolean, reason: string, signals: string[], score: number, elapsedMs: number }}
 *          ok:false means DO NOT SEND. Otherwise send, with `signals` attached.
 */
export function screenLead(form = {}, opts = {}) {
  const { formKey = "default", honeypot, minMs = 2500 } = opts;
  const signals = botSignals(form);
  const ms = elapsedMs(formKey);

  if (honeypotTripped(honeypot)) {
    return { ok: false, reason: "honeypot", signals: [...signals, "honeypot"], score: 100, elapsedMs: ms };
  }
  if (isDuplicate(form)) {
    return { ok: false, reason: "duplicate", signals: [...signals, "duplicate"], score: 90, elapsedMs: ms };
  }
  if (isRateLimited()) {
    return { ok: false, reason: "rate-limit", signals: [...signals, "rate-limit"], score: 90, elapsedMs: ms };
  }
  if (tooFast(formKey, minMs)) signals.push("too-fast");

  // A soft score for the sheet — anything above ~40 deserves a human glance
  // before someone spends a site visit on it.
  const score = Math.min(90, signals.length * 20 + (signals.includes("too-fast") ? 20 : 0));
  return { ok: true, reason: "", signals, score, elapsedMs: ms };
}

watchFirstInteraction();
