// ============================================================
// Lead attribution (PRD Ch. 75 — "where did this buyer come from?").
//
// A branded-residence enquiry is not an impulse. Someone clicks a Google ad on
// Tuesday, reads the floor plans, leaves, and enquires on Sunday from a direct
// visit. If we only recorded the campaign visible at the moment of submission,
// every one of those leads would land in the sheet as "direct" and the media
// spend would look worthless. So we persist FIRST touch and also carry LAST
// touch, and send both — first-touch answers "what bought this lead", last
// touch answers "what closed it".
//
// Everything here is best-effort and lives entirely in the browser. There is no
// server, so this is not identity resolution: it is per-device, per-browser, and
// dies with the visitor's storage.
// ============================================================

const KEY_FIRST = "mb-attr-first";
const KEY_LAST = "mb-attr-last";
const KEY_SEEN = "mb-attr-seen"; // last activity stamp, used to count visits

/**
 * Windows.
 *
 * FIRST_TTL — 90 days. Google Ads' click-attribution window tops out at 90 days
 * and that is also, anecdotally, the outer edge of a luxury-residence
 * consideration cycle. Beyond it the original campaign is no longer plausibly
 * the cause of the enquiry, and keeping it would flatter the wrong channel.
 *
 * LAST_TTL — 30 days, matching GA4's default acquisition lookback so the sheet
 * and the analytics property tell the same story.
 *
 * SESSION_GAP — 30 minutes of inactivity starts a new visit, the near-universal
 * web-analytics convention.
 */
const DAY = 86400e3;
const FIRST_TTL = 90 * DAY;
const LAST_TTL = 30 * DAY;
const SESSION_GAP = 30 * 60e3;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const CLICK_KEYS = ["gclid", "fbclid", "msclkid", "ttclid", "li_fat_id"];

/* ---------- storage, defensively ---------- */
// Safari private mode throws on setItem, some embedded webviews throw on read.
// Attribution is nice-to-have; it must never take a lead form down with it.
const ls = {
  get(k) {
    try { return window.localStorage.getItem(k); } catch { return null; }
  },
  set(k, v) {
    try { window.localStorage.setItem(k, v); } catch { /* private mode */ }
  },
  json(k) {
    const raw = ls.get(k);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
};

/**
 * The prerenderer drives a real headless Chrome over all 30 routes. Left alone
 * it would happily record 30 "direct" first touches into its own profile — and
 * worse, any throw here corrupts the prerendered HTML. We simply never write.
 */
function isSynthetic() {
  if (typeof navigator === "undefined") return true;
  return Boolean(navigator.webdriver) || /HeadlessChrome|Prerender/i.test(navigator.userAgent || "");
}

/* ---------- environment ---------- */

function deviceType() {
  try {
    const ua = navigator.userAgent || "";
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
    if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua)) return "mobile";
    // a coarse pointer on a narrow screen is a phone lying about its UA
    if (window.matchMedia?.("(pointer: coarse)").matches && window.innerWidth < 820) return "mobile";
    return "desktop";
  } catch {
    return "";
  }
}

/** Screen, viewport, language, timezone — the context a sales desk actually uses. */
export function environment() {
  if (typeof window === "undefined") return {};
  try {
    return {
      device: deviceType(),
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      dpr: String(window.devicePixelRatio || 1),
      language: navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      capturedAt: new Date().toISOString(),
    };
  } catch {
    return { capturedAt: new Date().toISOString() };
  }
}

/* ---------- touches ---------- */

/** Read the campaign parameters off a URL (defaults to the current one). */
export function readParams(href) {
  const out = {};
  try {
    const url = new URL(href || window.location.href);
    const q = url.searchParams;
    UTM_KEYS.forEach((k) => { const v = q.get(k); if (v) out[k] = v.slice(0, 120); });
    CLICK_KEYS.forEach((k) => { const v = q.get(k); if (v) out[k] = v.slice(0, 200); });
    // affiliate / broker links use ?ref= or ?source= rather than utm_*
    const ref = q.get("ref") || q.get("source") || q.get("partner");
    if (ref) out.ref = ref.slice(0, 120);
  } catch { /* malformed URL — no params, no problem */ }
  return out;
}

/** True when the referrer is a real external site (SPA navigation leaves it set to us). */
function externalReferrer() {
  try {
    const r = document.referrer;
    if (!r) return "";
    if (new URL(r).host === window.location.host) return "";
    return r.slice(0, 300);
  } catch {
    return "";
  }
}

/**
 * Snapshot of *this* arrival. Called once at module load, which in an SPA is the
 * only moment the landing URL is still the landing URL — after the first
 * <Link> click the utm_* query string is gone from window.location for good.
 */
function currentTouch() {
  const params = readParams();
  const referrer = externalReferrer();
  return {
    ...params,
    referrer,
    landing: (() => {
      try { return window.location.pathname + window.location.search; } catch { return ""; }
    })(),
    channel: classify(params, referrer),
    at: new Date().toISOString(),
    t: Date.now(),
  };
}

/** Coarse channel label, so the sheet is readable without a pivot table. */
function classify(params, referrer) {
  if (params.gclid || (params.utm_source === "google" && params.utm_medium === "cpc")) return "paid-search";
  if (params.fbclid || /facebook|instagram/i.test(params.utm_source || "")) return "paid-social";
  if (params.utm_medium) return params.utm_medium;
  if (params.ref) return "partner";
  if (!referrer) return "direct";
  if (/google\.|bing\.|duckduckgo|yahoo\./i.test(referrer)) return "organic-search";
  if (/facebook|instagram|linkedin|twitter|x\.com|t\.co|youtube/i.test(referrer)) return "social";
  return "referral";
}

/** Does this touch carry any information worth overwriting last-touch with? */
function isMeaningful(touch) {
  return Boolean(
    UTM_KEYS.some((k) => touch[k]) ||
    CLICK_KEYS.some((k) => touch[k]) ||
    touch.ref ||
    touch.referrer
  );
}

function fresh(stored, ttl) {
  return stored && typeof stored.t === "number" && Date.now() - stored.t < ttl ? stored : null;
}

/**
 * Record the arrival. Idempotent-ish: first touch is written once and then left
 * alone until it expires; last touch is only overwritten by a touch that
 * actually says something, so a returning direct visit does not erase the ad
 * that brought them back yesterday.
 */
export function captureTouch() {
  if (typeof window === "undefined") return null;
  const touch = currentTouch();
  if (isSynthetic()) return touch; // observe, never persist

  const first = fresh(ls.json(KEY_FIRST), FIRST_TTL);
  if (!first) ls.set(KEY_FIRST, JSON.stringify(touch));

  if (isMeaningful(touch) || !fresh(ls.json(KEY_LAST), LAST_TTL)) {
    ls.set(KEY_LAST, JSON.stringify(touch));
  }

  // visit counter — a third visit is a much warmer lead than a first
  const seen = ls.json(KEY_SEEN) || { n: 0, t: 0 };
  if (Date.now() - (seen.t || 0) > SESSION_GAP) seen.n = (seen.n || 0) + 1;
  seen.t = Date.now();
  ls.set(KEY_SEEN, JSON.stringify(seen));

  return touch;
}

/** Flatten a touch into prefixed payload keys (the sheet is flat). */
function flatten(touch, prefix) {
  const out = {};
  if (!touch) return out;
  [...UTM_KEYS, ...CLICK_KEYS, "ref", "referrer", "landing", "channel", "at"].forEach((k) => {
    if (touch[k]) out[`${prefix}_${k.replace(/^utm_/, "")}`] = touch[k];
  });
  return out;
}

/**
 * The attribution block to merge into a lead payload.
 * Flat, string-valued, and safe to send as extra keys — the Apps Script ignores
 * anything it doesn't have a column for, so this costs nothing today and is
 * there the moment the owner adds columns.
 */
export function getAttribution() {
  if (typeof window === "undefined") return {};
  const live = currentTouch();
  const first = fresh(ls.json(KEY_FIRST), FIRST_TTL) || live;
  const last = fresh(ls.json(KEY_LAST), LAST_TTL) || live;
  const seen = ls.json(KEY_SEEN) || {};

  return {
    ...flatten(first, "first"),
    ...flatten(last, "last"),
    // convenience mirrors: the columns a sales desk asks for by name
    utm_source: last.utm_source || first.utm_source || "",
    utm_medium: last.utm_medium || first.utm_medium || "",
    utm_campaign: last.utm_campaign || first.utm_campaign || "",
    gclid: first.gclid || last.gclid || "",
    fbclid: first.fbclid || last.fbclid || "",
    channel: last.channel || "",
    visits: String(seen.n || 1),
    ...environment(),
  };
}

/** Escape hatch for testing and for a "forget me" control, should one be added. */
export function clearAttribution() {
  [KEY_FIRST, KEY_LAST, KEY_SEEN].forEach((k) => {
    try { window.localStorage.removeItem(k); } catch { /* ignore */ }
  });
}

// Fire at import. leads.js pulls this module in, and every form imports leads.js,
// so the touch is recorded on the landing page before any routing happens.
try { captureTouch(); } catch { /* attribution must never break first paint */ }
