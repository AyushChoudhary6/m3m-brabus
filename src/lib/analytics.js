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
