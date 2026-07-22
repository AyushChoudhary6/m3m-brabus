// ============================================================
// Lead capture → Google Sheet (Apps Script web app).
// Every form on the site posts through submitLead().
//
// Ch. 74 — the failure path. The previous version simply threw when the fetch
// failed, which meant a buyer on a lift-shaft 4G connection filled in the form,
// saw "something went wrong", and their details evaporated. Now a failed send is
// written to a localStorage queue and retried on the next page load, whenever
// the browser comes back online, and on a capped exponential backoff.
//
// BE CLEAR ABOUT WHAT THIS IS. This is best-effort client-side durability. It
// survives a flaky network, a five-second outage at Google, and a tab that stays
// open. It does NOT survive the visitor closing the tab and never coming back,
// private-browsing mode, or a cleared browser store. There is no server of ours
// to hand the lead to, so a device that never returns takes the lead with it.
// The only real fix is a server-side inbox, which this static site does not have.
// ============================================================

import { getAttribution } from "./attribution.js";
import { screenLead, rememberSubmission, resetTimer } from "./spam.js";

// The Apps Script the site has always used. Kept as the fallback so the live
// site never breaks: if the backend URL is not configured, leads go straight
// here exactly as before.
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby15y1STKpEpp6FoRC21qLwDi7NLinkjZ1yqEXQJFKHjvXHNwKNYvAMSsLD4BKZsf9NAg/exec";

// When VITE_API_URL is set, every lead goes to OUR backend (POST /api/leads),
// which validates it, persists it to Neon (primary) and forwards it to the same
// Apps Script (backup) — see server/. One request from the browser; the backend
// does the rest. When unset, we post to Apps Script directly, as before.
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) || "";
const ENDPOINT = API_BASE ? `${API_BASE.replace(/\/+$/, "")}/api/leads` : APPS_SCRIPT_URL;

const KEY_QUEUE = "mb-lead-queue";
const KEY_LOCK = "mb-lead-flush"; // crude cross-tab mutex so two tabs don't double-post

const MAX_QUEUE = 20;            // a browser that has 20 stuck leads has a bigger problem
const MAX_AGE = 7 * 86400e3;     // a week-old enquiry is cold; stop carrying it around
const MAX_ATTEMPTS = 12;
const LOCK_TTL = 25e3;
const BACKOFF = [15e3, 45e3, 2 * 60e3, 5 * 60e3, 15 * 60e3, 30 * 60e3]; // capped at 30 min

/* ---------------- storage helpers ---------------- */

const store = {
  read() {
    try {
      const list = JSON.parse(window.localStorage.getItem(KEY_QUEUE));
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },
  write(list) {
    try {
      window.localStorage.setItem(KEY_QUEUE, JSON.stringify(list));
    } catch {
      /* private mode / quota — the lead is lost, and there is nowhere else to put it */
    }
  },
};

/** Headless Chrome walks all 30 routes at build time; it must not queue or post anything. */
function isSynthetic() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return true;
  return Boolean(navigator.webdriver) || /HeadlessChrome|Prerender/i.test(navigator.userAgent || "");
}

function uid() {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch { /* older webviews */ }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ---------------- payload ---------------- */

/**
 * The sheet's columns are Fullname / Phone / Email / Configuration / Timestamp.
 * We don't control the Apps Script, so each value is sent under every likely key
 * spelling — extra keys are simply ignored by the script, which is also why the
 * attribution and spam blocks can ride along for free until the owner adds
 * columns for them.
 */
function buildPayload(data = {}, leadId) {
  const name = data.name || "";
  const phone = data.phone || "";
  const email = data.email || "";
  const config = data.config || "";
  const now = new Date().toISOString();

  const screen = data.__screen || { signals: [], score: 0, elapsedMs: 0 };

  return {
    leadId, // stable across retries — the owner's dedupe key (see flushQueue notes)
    name,
    fullname: name,
    fullName: name,
    Fullname: name,
    phone,
    Phone: phone,
    email,
    Email: email,
    config,
    configuration: config,
    Configuration: config,
    message: data.message || "",
    source: data.source || "",
    page: typeof window !== "undefined" ? window.location.pathname : "",
    submittedAt: now,
    timestamp: now,
    Timestamp: now,

    // Ch. 75 — where this buyer came from (first touch and last touch, plus device)
    ...getAttribution(),

    // Ch. 78 — soft quality signals, for triage rather than blocking
    spamSignals: screen.signals.join(","),
    spamScore: String(screen.score),
    fillMs: String(screen.elapsedMs || 0),
  };
}

/* ---------------- the wire ---------------- */

/**
 * One attempt at the endpoint.
 *
 * The Apps Script reads JSON via `JSON.parse(e.postData.contents)`, so the body
 * must be a JSON string. We deliberately send it with `Content-Type:
 * text/plain` — that is a CORS-safelisted type, so the browser makes a "simple"
 * request and skips the preflight `OPTIONS` that Apps Script cannot answer.
 * (`application/json` would trigger a preflight and fail.)
 *
 * Apps Script answers with a 302 to script.googleusercontent.com; both hops send
 * `Access-Control-Allow-Origin: *`, so we can read the real response.
 *
 * @returns {Promise<{ok:true,out:object} | {ok:false,retry:boolean,error:string}>}
 *          retry:true  — transient (network, HTTP error, unreadable answer)
 *          retry:false — the script read the payload and refused it; sending the
 *                        identical bytes again will be refused identically.
 */
async function postOnce(payload) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
  } catch (e) {
    return { ok: false, retry: true, error: e?.message || "Network error" };
  }

  if (!res.ok) {
    // A 4xx (other than 429) means the request itself was rejected — a validation
    // failure or hard refusal. Replaying identical bytes will be refused again,
    // so don't queue it. 429 (rate limit) and 5xx are transient → retry.
    const retry = res.status === 429 || res.status >= 500;
    return { ok: false, retry, error: `HTTP ${res.status}` };
  }

  const out = await res.json().catch(() => null);

  // Unreadable body on a 200. The script almost certainly ran, but we cannot
  // prove it. We choose to retry: a duplicate row costs the owner five seconds,
  // a lost crore-plus enquiry costs rather more. `leadId` is there so duplicates
  // can be collapsed in the sheet.
  if (!out) return { ok: false, retry: true, error: "Unreadable response" };

  if (out.success !== true) return { ok: false, retry: false, error: out.error || "Submission failed" };
  return { ok: true, out };
}

/* ---------------- the queue ---------------- */

/** Drop expired and over-quota entries; keeps the queue from growing unbounded. */
function prune(list) {
  const cutoff = Date.now() - MAX_AGE;
  return list
    .filter((e) => e && e.id && e.t > cutoff && e.attempts < MAX_ATTEMPTS)
    .slice(-MAX_QUEUE);
}

/**
 * Add a lead to the queue.
 * Deduplicated on leadId AND on the payload's identity fields, so a user who
 * hits "send" three times through a dead connection produces one row, not three.
 */
function enqueue(payload) {
  const list = prune(store.read());
  const same = (e) =>
    e.payload?.leadId === payload.leadId ||
    (e.payload?.phone === payload.phone &&
      e.payload?.email === payload.email &&
      e.payload?.source === payload.source);

  const existing = list.find(same);
  if (existing) {
    existing.payload = payload; // keep the freshest copy of the details
    store.write(list);
    return existing;
  }

  const entry = { id: payload.leadId, payload, t: Date.now(), attempts: 0, nextAt: Date.now() + BACKOFF[0] };
  list.push(entry);
  store.write(prune(list));
  return entry;
}

function removeEntry(id) {
  store.write(store.read().filter((e) => e && e.id !== id));
}

/** How many leads are still waiting to go out. Handy for a UI badge. */
export function queuedLeadCount() {
  if (typeof window === "undefined") return 0;
  return prune(store.read()).length;
}

/* -- cross-tab lock. localStorage gives us no atomic CAS, so this is a
      best-effort guard against two open tabs flushing the same entry at the
      same moment, not a correctness guarantee. Genuine idempotency needs the
      Apps Script to reject a leadId it has already written. -- */
function takeLock() {
  try {
    const held = Number(window.localStorage.getItem(KEY_LOCK) || 0);
    if (Date.now() - held < LOCK_TTL) return false;
    window.localStorage.setItem(KEY_LOCK, String(Date.now()));
    return true;
  } catch {
    return true; // no storage, no other tab to race with
  }
}
function releaseLock() {
  try { window.localStorage.removeItem(KEY_LOCK); } catch { /* ignore */ }
}

let flushing = false;
let timer = null;

/** Wake up again when the soonest entry is due (self-cancels on an empty queue). */
function schedule() {
  if (typeof window === "undefined" || timer) return;
  const list = prune(store.read());
  if (!list.length) return;
  const due = Math.min(...list.map((e) => e.nextAt || 0));
  const wait = Math.max(5e3, Math.min(due - Date.now(), 5 * 60e3));
  timer = setTimeout(() => {
    timer = null;
    flushQueue();
  }, wait);
}

/**
 * Try to drain the queue. Safe to call at any time and from anywhere; it is
 * re-entrant-guarded, honours each entry's backoff, and never throws.
 * @returns {Promise<number>} number of leads successfully delivered
 */
export async function flushQueue() {
  if (flushing || isSynthetic() || typeof window === "undefined") return 0;
  if (navigator.onLine === false) { schedule(); return 0; }

  let list = prune(store.read());
  store.write(list);
  const due = list.filter((e) => (e.nextAt || 0) <= Date.now());
  if (!due.length) { schedule(); return 0; }
  if (!takeLock()) { schedule(); return 0; }

  flushing = true;
  let sent = 0;
  try {
    for (const entry of due) {
      const result = await postOnce(entry.payload);
      if (result.ok) {
        removeEntry(entry.id);
        sent += 1;
        continue;
      }
      if (!result.retry) {
        removeEntry(entry.id); // the script refuses this payload; retrying is noise
        continue;
      }
      // still broken — back off further, but re-read the queue in case another
      // tab changed it while this request was in flight
      const fresh = store.read();
      const target = fresh.find((e) => e && e.id === entry.id);
      if (target) {
        target.attempts = (target.attempts || 0) + 1;
        target.nextAt = Date.now() + BACKOFF[Math.min(target.attempts, BACKOFF.length - 1)];
        store.write(prune(fresh));
      }
      break; // the endpoint is down; don't hammer it with the rest of the queue
    }
  } finally {
    flushing = false;
    releaseLock();
    schedule();
  }
  return sent;
}

/* ---------------- public API ---------------- */

/**
 * Error thrown by submitLead. Existing callers only ever `catch {}` and show a
 * generic message, so nothing breaks — but a caller that wants to say "saved,
 * we'll send it the moment you're back online" can read `err.queued`.
 *
 *   err.queued — true when the lead is safely in the retry queue
 *   err.code   — "spam" | "rate-limit" | "network" | "rejected" | "storage"
 */
export class LeadError extends Error {
  constructor(message, { queued = false, code = "rejected" } = {}) {
    super(message);
    this.name = "LeadError";
    this.queued = queued;
    this.code = code;
  }
}

/**
 * Send a lead to the sheet.
 *
 * @param {{name?:string, phone?:string, email?:string, config?:string,
 *          message?:string, source?:string,
 *          company?:string, honeypot?:any, formKey?:string}} data
 *        `honeypot` may be a submit event, the <form> element, or the raw hidden
 *        `company` value — see spam.js/readHoneypot. Omitting it simply skips
 *        the honeypot test.
 * @returns {Promise<object>} the script's parsed response
 * @throws  {LeadError} on failure — check `.queued` to tell "will retry" from
 *          "hard rejected". Rejecting on failure is deliberate: the UI still
 *          shows its error, but the lead is already queued before we reject.
 */
export async function submitLead(data = {}) {
  const formKey = data.formKey || data.source || "default";

  // Ch. 78 gate. Only a tripped honeypot or an abusive submission rate blocks;
  // a same-details repeat inside ten minutes resolves as a no-op success,
  // because the buyer is already in the sheet and does not deserve an error.
  const screen = screenLead(data, { formKey, honeypot: data.honeypot ?? data.company ?? data });
  if (!screen.ok) {
    if (screen.reason === "duplicate") return { success: true, duplicate: true };
    throw new LeadError("Submission rejected", {
      queued: false,
      code: screen.reason === "rate-limit" ? "rate-limit" : "spam",
    });
  }

  const leadId = uid();
  const payload = buildPayload({ ...data, __screen: screen }, leadId);

  if (isSynthetic()) return { success: true, skipped: "prerender" };

  const result = await postOnce(payload);
  if (result.ok) {
    rememberSubmission(data);
    resetTimer(formKey);
    flushQueue(); // a working connection is a good moment to clear any backlog
    return result.out;
  }

  if (!result.retry) {
    // The script read it and said no. Queuing would just replay the refusal.
    throw new LeadError(result.error, { queued: false, code: "rejected" });
  }

  // Queue FIRST, then reject — the UI's error message must never be the only
  // record of the lead.
  const entry = enqueue(payload);
  rememberSubmission(data); // stops a frustrated buyer creating five queue rows
  schedule();
  throw new LeadError(result.error, {
    queued: Boolean(entry) && queuedLeadCount() > 0,
    code: "network",
  });
}

/**
 * Non-throwing variant for new call sites that want the full picture without a
 * try/catch. Existing callers are untouched.
 * @returns {Promise<{ok:boolean, queued:boolean, code:string, out?:object}>}
 */
export async function submitLeadResult(data = {}) {
  try {
    const out = await submitLead(data);
    return { ok: true, queued: false, code: "sent", out };
  } catch (e) {
    return { ok: false, queued: Boolean(e?.queued), code: e?.code || "rejected" };
  }
}

/** Marks the visitor as an existing lead so the timed invite stops nagging. */
export function markLeadCaptured() {
  try {
    localStorage.setItem("mb-lead", "1");
  } catch {
    /* private mode — ignore */
  }
}

/* ---------------- retry triggers ---------------- */

if (typeof window !== "undefined" && !isSynthetic()) {
  // on reconnect, and when the tab is looked at again (mobile Safari suspends timers)
  window.addEventListener("online", () => flushQueue());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") flushQueue();
  });
  // on load — deferred so a retry never competes with first paint
  const kick = () => setTimeout(() => flushQueue(), 2500);
  if (document.readyState === "complete") kick();
  else window.addEventListener("load", kick, { once: true });
}
