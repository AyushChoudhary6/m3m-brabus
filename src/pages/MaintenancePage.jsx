import { Phone, MessageCircle, RotateCw } from "lucide-react";
import Seo from "../components/ui/Seo.jsx";
import { PROJECT } from "../lib/site.js";
import { trackCall, trackWhatsApp } from "../lib/analytics.js";

/**
 * Ch. 87 — planned-downtime screen.
 *
 * NOT WIRED BY DEFAULT. Nothing renders this until the owner asks for it.
 *
 * HOW TO ACTIVATE (in src/App.jsx, which this file deliberately does not touch):
 *
 *   import MaintenancePage from "./pages/MaintenancePage.jsx";
 *   …
 *   // inside App(), above <Routes>:
 *   if (import.meta.env.VITE_MAINTENANCE === "1") return <MaintenancePage />;
 *
 * …then redeploy with VITE_MAINTENANCE=1 set in the Vercel project's
 * environment variables. The flag is read at BUILD time, not at run time, so
 * switching it on or off requires a redeploy — that is a property of a static
 * site, not an oversight. A route-level alternative is a single
 * `<Route path="/maintenance" element={<MaintenancePage />} />` that the owner
 * points visitors at manually.
 *
 * HONEST LIMITS. There is no server here, so:
 *  · this page cannot return HTTP 503 or a Retry-After header — Vercel serves
 *    it as 200. Crawlers are told to stay away by the noindex tag alone, which
 *    is why activating it for more than a short window risks de-indexing.
 *  · it cannot detect an outage by itself. It is a switch the owner throws,
 *    not a health check.
 *  · the lead form is unaffected by this page (it posts to Google Apps Script,
 *    not to this site) — but if the form is what is broken, the phone and
 *    WhatsApp routes below are the fallback, and they always work.
 */

const WA_TEXT = encodeURIComponent(
  `Hello — the ${PROJECT.name} website is under maintenance. Could you send me the details?`,
);

export default function MaintenancePage() {
  return (
    <section className="relative flex min-h-[86vh] items-center overflow-hidden">
      <Seo
        title="Back Shortly | M3M Brabus"
        description="The M3M Brabus site is briefly unavailable for scheduled maintenance. Call or WhatsApp the private client team in the meantime."
        path="/maintenance"
        noindex
      />

      <div className="gold-glow pointer-events-none absolute -left-40 top-1/4 h-[34rem] w-[34rem] rounded-full bg-brass/[0.07] blur-[130px]" />

      <div className="container-lux relative py-[clamp(4rem,12vh,8rem)]">
        <p className="kicker">{PROJECT.name}</p>

        <h1 className="mt-6 max-w-[14ch] font-display text-[clamp(2.6rem,7vw,5.5rem)] font-light leading-[0.98] tracking-[-0.03em] text-ink">
          Back very <span className="font-serif italic text-brass">shortly.</span>
        </h1>

        <p className="mt-7 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
          The site is closed for a short spell of scheduled maintenance. Nothing is wrong and
          nothing has been lost — we are simply updating it. Please try again in a few minutes.
        </p>

        <p className="mt-4 max-w-[52ch] leading-relaxed text-ink-soft">
          If you would rather not wait, the private client team is reachable throughout. They can
          send the brochure, the plans and the current position on price, RERA and possession
          directly.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            data-cursor="RELOAD"
            className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
            <RotateCw size={14} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
            <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
              Try again
            </span>
          </button>

          <a
            href={`https://wa.me/${PROJECT.whatsapp}?text=${WA_TEXT}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsApp("Maintenance")}
            className="mono inline-flex items-center gap-2 rounded-full border border-line px-6 py-4 text-[0.66rem] tracking-[0.18em] text-ink-soft transition-colors hover:border-brass/50 hover:text-brass"
          >
            <MessageCircle size={14} className="text-brass" />
            WhatsApp the team
          </a>
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <a
            href={`tel:${PROJECT.phone}`}
            onClick={() => trackCall("Maintenance")}
            className="mono inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-ink transition-colors hover:text-brass"
          >
            <Phone size={14} className="text-brass" />
            {PROJECT.phone}
          </a>
          <p className="mono mt-5 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
            {PROJECT.configs} · {PROJECT.location}
          </p>
        </div>
      </div>
    </section>
  );
}
