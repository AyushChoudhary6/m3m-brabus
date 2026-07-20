// ============================================================
// WhatsApp deep links (Ch. 76) — the single source of truth for every
// wa.me URL on the site.
//
// Why centralise something this small: the prefilled text is the only
// briefing our sales team gets before they reply. When each component
// wrote its own string, a tap from the floor-plan page and a tap from the
// brochure page arrived looking identical, and the first reply was always
// "which one did you want?". One helper keeps the ask specific to the page
// the visitor was on.
//
// FACTS RULE: a message may *ask* for a price list, a plan or a date. It
// must never state one. No price, no RERA number, no possession date ever
// goes into prefilled text — see src/lib/facts.js.
// ============================================================

import { PROJECT } from "./site.js";

/** wa.me wants bare digits — strip whatever formatting site.js carries. */
const NUMBER = String(PROJECT.whatsapp || "").replace(/\D/g, "");

/* Deliberately short. WhatsApp truncates long prefilled text in the compose
   box on some Android builds, and anything longer than a couple of lines
   reads as a bot to the person receiving it. One sentence, one ask. */
const MESSAGES = {
  default: "Hello, I would like the latest details for M3M BRABUS Gurgaon.",
  price: "Hello, please share the latest price list for M3M BRABUS Gurgaon.",
  floorPlan: "Hello, please share the HD floor plans for M3M BRABUS Gurgaon.",
  brochure: "Hello, please send me the M3M BRABUS Gurgaon brochure.",
  location:
    "Hello, I would like to arrange a site visit to M3M BRABUS, Sector 58 Gurgaon.",
};

/**
 * Map a pathname to a message context so callers can simply say
 * `whatsappUrl()` and get something relevant to the page they are on.
 *
 * Only the routes Ch. 76 names get their own message. /payment-plan is
 * folded into `price` because a visitor there is asking the same commercial
 * question; every other route falls back to the default rather than
 * inventing an ask nobody made.
 */
export function whatsappContext(pathname) {
  const path = String(pathname || "").replace(/\/+$/, "") || "/";

  if (path.startsWith("/blogs/")) return "blog";
  if (path === "/price" || path === "/payment-plan") return "price";
  if (path === "/floor-plan") return "floorPlan";
  if (path === "/brochure") return "brochure";
  if (path === "/location") return "location";
  return "default";
}

/* The slug is the only piece of the post we can see from here. Importing
   src/lib/blog.js for the real title would pull every post's body in behind
   it, which is a poor trade for one line of chat text. Acronyms get their
   casing back so the message doesn't read as machine output. */
const ACRONYMS = /\b(bhk|nri|rera|hd|m3m)\b/g;

/** "/blogs/4-bhk-vs-5-bhk-which-to-buy" → "4 BHK vs 5 BHK which to buy" */
function articleFromPath(pathname) {
  const slug = String(pathname || "").split("/blogs/")[1] || "";
  return slug
    .split(/[/?#]/)[0]
    .replace(/-/g, " ")
    .trim()
    .replace(ACRONYMS, (m) => m.toUpperCase());
}

/* ---------------------------------------------------------------
   Attribution
   ---------------------------------------------------------------
   A wa.me link opens WhatsApp. Nothing we put in the query string
   survives that hop — there is no referrer, no cookie, no callback, and
   wa.me accepts no parameter other than `text`. So the ONLY way to carry
   campaign context to the person who answers the chat is to write it into
   the message itself, on a second line, compactly.

   INTEGRATION POINT: src/lib/attribution.js is owned by another agent and
   does not exist yet. When it lands it should expose the first-touch
   campaign object; swap `readCampaign()` below for its getter and delete
   the local reader. Until then we read the current URL and fall back to a
   "mb-attr" localStorage blob, so a visitor who landed on an ad and then
   browsed three pages still carries their source.                       */

const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid"];

function readCampaign() {
  if (typeof window === "undefined") return null;
  try {
    const out = {};
    const qs = new URLSearchParams(window.location.search);
    for (const key of PARAMS) {
      const v = qs.get(key);
      if (v) out[key] = v;
    }
    if (Object.keys(out).length) return out;

    const saved = window.localStorage?.getItem("mb-attr");
    return saved ? JSON.parse(saved) : null;
  } catch {
    // private mode, blocked storage, malformed JSON — attribution is a
    // nice-to-have and must never stop someone opening a chat.
    return null;
  }
}

/** One short line, e.g. "[google/cpc · brabus-launch]" — omitted entirely
 *  when there is nothing to say. */
function attributionLine(campaign) {
  if (!campaign) return "";
  const source = campaign.utm_source || (campaign.gclid ? "google" : campaign.fbclid ? "meta" : "");
  const medium = campaign.utm_medium || (campaign.gclid || campaign.fbclid ? "cpc" : "");
  const name = campaign.utm_campaign || "";

  const origin = [source, medium].filter(Boolean).join("/");
  const bits = [origin, name].filter(Boolean);
  return bits.length ? `[${bits.join(" · ")}]` : "";
}

/**
 * Build the message text for a context. Exported so a caller that needs the
 * raw copy (a test, or a "copy message" control) doesn't have to decode a URL.
 *
 * @param {object}  [opts]
 * @param {string}  [opts.context] — key of MESSAGES, or "blog". Omit to derive
 *                                   from the current pathname.
 * @param {string}  [opts.extra]   — one short clause appended to the ask,
 *                                   e.g. a residence name. Keep it brief.
 * @param {string}  [opts.pathname] — override, mainly for tests.
 */
export function whatsappMessage({ context, extra, pathname } = {}) {
  const path =
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const key = context || whatsappContext(path);

  let body;
  if (key === "blog") {
    const article = articleFromPath(path);
    body = article
      ? `Hello, I have just read your article on ${article} — please share the latest details for M3M BRABUS Gurgaon.`
      : MESSAGES.default;
  } else {
    body = MESSAGES[key] || MESSAGES.default;
  }

  if (extra) body += ` ${String(extra).trim()}`;

  const attribution = attributionLine(readCampaign());
  return attribution ? `${body}\n${attribution}` : body;
}

/**
 * The link itself. `whatsappUrl()` with no arguments is the normal call —
 * it reads the current route and picks the right ask.
 */
export function whatsappUrl(opts = {}) {
  return `https://wa.me/${NUMBER}?text=${encodeURIComponent(whatsappMessage(opts))}`;
}

export default whatsappUrl;
