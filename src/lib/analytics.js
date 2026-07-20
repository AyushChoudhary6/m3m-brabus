// ============================================================
// GA4 + conversion tracking (PRD Ch.5 — Success Metrics).
// Set VITE_GA_ID in .env to switch it on; without it every call is a no-op,
// so nothing breaks in dev or during prerender.
// ============================================================

const GA_ID = import.meta.env?.VITE_GA_ID || "";
let booted = false;

/** Inject gtag.js once, on the client only. */
export function initAnalytics() {
  if (booted || !GA_ID || typeof window === "undefined") return;
  // don't pollute the prerender snapshot
  if (navigator.webdriver || /HeadlessChrome/.test(navigator.userAgent)) return;
  booted = true;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });
}

/** Fire a GA4 event (safely no-ops when analytics is off). */
export function track(event, params = {}) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", event, params);
    }
    if (import.meta.env?.DEV) console.debug("[track]", event, params);
  } catch { /* never let tracking break the UI */ }
}

/** SPA page_view — call on every route change. */
export function trackPageView(path, title) {
  if (typeof window === "undefined") return;
  track("page_view", { page_path: path, page_title: title || document.title });
}

/* ---- The conversions the PRD asks us to measure ---- */
export const trackLead = (source, config) => track("generate_lead", { source, config, currency: "INR" });
export const trackBrochure = (source) => track("brochure_download", { source });
export const trackWhatsApp = (source) => track("whatsapp_click", { source });
export const trackCall = (source) => track("phone_call_click", { source });
export const trackSiteVisit = (source) => track("site_visit_request", { source });

/* ============================================================
   A conversion with a URL of its own (/thank-you).

   The modal's thank-you state is fine for the buyer and useless for
   attribution: Google Ads and Meta want a page to point a conversion at, a
   retargeting audience wants a URL to match on, and a state change cannot
   tell a refresh from a second lead. A route can do all three — provided it
   counts each lead exactly once, which is the whole job of the two functions
   below.

   sessionStorage rather than localStorage, deliberately: the guard MUST
   survive a refresh (it does) and MUST NOT survive the tab, or the same buyer
   enquiring again next week would be silently discarded as a duplicate.
   ============================================================ */

const PENDING_KEY = "mb-conv-pending";   // a lead was just captured, awaiting its thank-you page
const FIRED_PREFIX = "mb-conv-fired:";   // this lead's conversion has already been counted
const PENDING_TTL = 30 * 60e3;           // a handover older than half an hour is not a handover

/** Headless Chrome walks every route at build time; it must count nothing. */
function isSynthetic() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return true;
  return Boolean(navigator.webdriver) || /HeadlessChrome|Prerender/i.test(navigator.userAgent || "");
}

const ss = {
  get(k) { try { return window.sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { window.sessionStorage.setItem(k, v); } catch { /* private mode */ } },
  del(k) { try { window.sessionStorage.removeItem(k); } catch { /* private mode */ } },
};

function convRef() {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID().slice(0, 8);
  } catch { /* older webviews */ }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** ?lead= / ?ref= — the only piece of state that survives a full page load. */
function refFromUrl() {
  try {
    const qs = new URLSearchParams(window.location.search);
    return qs.get("lead") || qs.get("ref") || "";
  } catch {
    return "";
  }
}

function readPending() {
  try {
    const raw = ss.get(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || !p.ref || Date.now() - (p.at || 0) > PENDING_TTL) { ss.del(PENDING_KEY); return null; }
    return p;
  } catch {
    return null;
  }
}

/**
 * Hand a freshly captured lead over to /thank-you.
 *
 * Nothing calls this today — the modal keeps its in-place thank-you state on
 * purpose. It exists so that routing to /thank-you later is a one-line change
 * at the call site rather than a rewrite of the page.
 *
 * @param {object}  [detail]
 * @param {string}  [detail.ref]     reuse an existing reference (e.g. a leadId)
 * @param {string}  [detail.source]  the same `source` string passed to trackLead
 * @param {string}  [detail.config]  "4 BHK" / "5 BHK", for the GA4 parameter
 * @param {string}  [detail.name]    first name, for the greeting — never sent to GA
 * @param {boolean} [detail.counted] true if trackLead has ALREADY fired for this
 *                                   lead, so the page confirms rather than counts
 * @returns {string} the reference — put it in the URL as ?lead=… so the guard
 *                   still holds if the visitor lands on the page cold
 */
export function rememberConversion(detail = {}) {
  if (typeof window === "undefined") return "";
  const ref = detail.ref || convRef();
  ss.set(PENDING_KEY, JSON.stringify({
    ref,
    source: detail.source || "",
    config: detail.config || "",
    name: detail.name || "",
    counted: Boolean(detail.counted),
    at: Date.now(),
  }));
  return ref;
}

/**
 * Claim the conversion on /thank-you. Safe to call on every mount.
 *
 * @param {object} [opts]
 * @param {string} [opts.ref]    override the reference (tests)
 * @param {string} [opts.source] fallback source when nothing was handed over
 * @returns {{status:string, ref:string, name:string, config:string}}
 *   "fired"     — counted, first time for this lead
 *   "confirmed" — a real lead, but trackLead already fired for it upstream
 *   "repeat"    — a refresh or a back-button return; nothing counted again
 *   "direct"    — no submission preceded this view (bookmark, shared link);
 *                 emphatically NOT a conversion, so none is reported
 */
export function claimConversion(opts = {}) {
  const blank = { status: "direct", ref: "", name: "", config: "" };
  if (typeof window === "undefined" || isSynthetic()) return blank;

  const pending = readPending();
  const ref = opts.ref || refFromUrl() || pending?.ref || "";
  if (!ref) {
    // Someone arrived without converting. Worth knowing about — a lot of
    // direct hits usually means the URL has leaked into an ad or an email.
    track("thank_you_direct_view", { page_path: "/thank-you" });
    return blank;
  }

  const detail = pending && pending.ref === ref ? pending : { source: opts.source || "", config: "", name: "", counted: false };
  const out = { status: "repeat", ref, name: detail.name || "", config: detail.config || "" };

  if (ss.get(FIRED_PREFIX + ref)) {
    track("thank_you_repeat_view", { lead_ref: ref });
    return out;
  }

  ss.set(FIRED_PREFIX + ref, "1");
  ss.del(PENDING_KEY); // claimed; a second tab must not count it again

  if (detail.counted) {
    out.status = "confirmed";
    track("thank_you_view", { source: detail.source || "", lead_ref: ref });
  } else {
    out.status = "fired";
    trackLead(detail.source || opts.source || "Thank you page", detail.config || "");
    track("thank_you_view", { source: detail.source || "", lead_ref: ref });
  }
  return out;
}
