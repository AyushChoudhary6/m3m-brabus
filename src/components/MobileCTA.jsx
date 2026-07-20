import { Phone, MessageCircle, CalendarCheck, Download } from "lucide-react";
import { useEnquiry } from "./ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT } from "../lib/site.js";
import { trackCall, trackWhatsApp, trackSiteVisit, trackBrochure } from "../lib/analytics.js";

/**
 * Sticky bottom action bar — mobile only (PRD Ch.21 — utility navigation:
 * call · WhatsApp · site visit · brochure).
 *
 * Four actions on a 360px screen means labels sit *under* the icon rather than
 * beside it: a two-line cell stays legible where a horizontal one would either
 * truncate or shrink the tap target. Each cell is kept at 52px + safe-area so
 * the whole bar never exceeds the 6rem (bottom-24) offset WhatsAppFloat lifts
 * itself to on scroll — the two never occupy the same pixels.
 */

const WA_MESSAGE = encodeURIComponent(
  `Hi, I'm interested in ${PROJECT.name} (${PROJECT.location}) — please share the brochure, pricing and floor plans.`,
);

export default function MobileCTA() {
  const { openVisit, openBrochure } = useEnquiry();
  const { t, lang } = useI18n();

  /* Prefer the shared dictionary, but two of these four labels have no key in
     translations.js yet — fall back locally rather than render a raw key. */
  const label = (key, fallback) => {
    const v = t(key);
    return v === key ? fallback[lang] ?? fallback.en : v;
  };

  const cell =
    "flex min-h-[3.25rem] flex-col items-center justify-center gap-1 px-1 py-2 " +
    "font-sans text-[0.58rem] font-medium uppercase leading-none tracking-[0.1em] " +
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brass";

  return (
    <nav
      aria-label={t("nav.salesEnquiries")}
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-canvas/95 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
    >
      <a
        href={`tel:${PROJECT.phone}`}
        onClick={() => trackCall("mobile_bar")}
        aria-label={t("cta.callNow")}
        className={`${cell} text-ink`}
      >
        <Phone size={17} className="text-brass" aria-hidden="true" />
        <span>{t("m.call")}</span>
      </a>

      <a
        href={`https://wa.me/${PROJECT.whatsapp}?text=${WA_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsApp("mobile_bar")}
        aria-label={label("m.whatsappAria", { en: "Chat on WhatsApp", ar: "الدردشة عبر واتساب" })}
        className={`${cell} border-s border-line text-ink`}
      >
        <MessageCircle size={17} className="text-[#25D366]" aria-hidden="true" />
        <span>{t("m.whatsapp")}</span>
      </a>

      <button
        type="button"
        onClick={() => { trackSiteVisit("mobile_bar"); openVisit("Mobile bar"); }}
        aria-label={t("cta.scheduleVisit")}
        className={`${cell} border-s border-line text-ink`}
      >
        <CalendarCheck size={17} className="text-brass" aria-hidden="true" />
        <span>{label("m.visit", { en: "Visit", ar: "زيارة" })}</span>
      </button>

      <button
        type="button"
        onClick={() => { trackBrochure("mobile_bar"); openBrochure("Mobile bar"); }}
        aria-label={t("cta.downloadBrochure")}
        className={`${cell} bg-brass text-obsidian`}
      >
        <Download size={17} aria-hidden="true" />
        <span>{t("nav.brochure")}</span>
      </button>
    </nav>
  );
}
