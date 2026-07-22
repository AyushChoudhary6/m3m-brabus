import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Phone, RotateCw } from "lucide-react";
import WhatsAppIcon from "../components/ui/WhatsAppIcon.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo from "../components/ui/Seo.jsx";
import { Reveal } from "../components/ui/Reveal.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT } from "../lib/site.js";
import { track, trackCall, trackWhatsApp } from "../lib/analytics.js";

/**
 * Ch. 87 — the 404.
 *
 * A 404 that shouts is worse than one that quietly helps: no sirens, no
 * oversized "OOPS", the same masthead and rules as every other page. The job
 * is to name the mistake in one line and then get the visitor to the page they
 * were actually looking for.
 *
 * SEO note: <Seo> always emits a canonical, so this page is given its own
 * synthetic /404 path rather than a real URL. Pointing a 404's canonical at,
 * say, "/" would invite Google to fold every mistyped address into the home
 * page. With noindex + a self-referential canonical on a non-existent path,
 * the response is ignored rather than consolidated.
 *
 * A static SPA on Vercel serves index.html with HTTP 200 for unknown paths;
 * there is no server here to return a real 404 status. Search engines treat
 * this as a "soft 404" and drop it from the index on the strength of the
 * noindex tag — which is the best a client-rendered site can do. If a true
 * 404 status is ever required, it must be configured at the host.
 */

export default function NotFound() {
  const { pathname } = useLocation();
  const { openEnquiry } = useEnquiry();
  const { t } = useI18n();

  /* The pages worth landing on when the intended one doesn't exist. */
  const DESTINATIONS = [
    { to: "/", name: t("notfound.destHomeName"), d: t("notfound.destHomeDesc") },
    { to: "/overview", name: t("notfound.destOverviewName"), d: `${t("notfound.destOverviewDescPre")}${PROJECT.name}${t("notfound.destOverviewDescPost")}` },
    { to: "/price", name: t("notfound.destPriceName"), d: t("notfound.destPriceDesc") },
    { to: "/floor-plan", name: t("notfound.destFloorName"), d: `${t("notfound.destFloorDescPre")}${PROJECT.configs.toLowerCase()}.` },
    { to: "/location", name: t("notfound.destLocationName"), d: `${PROJECT.location}${t("notfound.destLocationDescSuffix")}` },
    { to: "/contact", name: t("notfound.destContactName"), d: t("notfound.destContactDesc") },
  ];

  /* Most mistyped URLs are an intent, not an address. Name the intents. */
  const INTENTS = [
    { to: "/price", label: t("notfound.intentPrice") },
    { to: "/brochure", label: t("notfound.intentBrochure") },
    { to: "/floor-plan", label: t("notfound.intentFloor") },
    { to: "/payment-plan", label: t("notfound.intentPayment") },
    { to: "/amenities", label: t("notfound.intentAmenities") },
    { to: "/rera", label: t("notfound.intentRera") },
    { to: "/possession", label: t("notfound.intentPossession") },
    { to: "/faqs", label: t("notfound.intentQuestion") },
  ];

  const WA_TEXT = encodeURIComponent(
    `${t("notfound.waTextPre")}${PROJECT.name}${t("notfound.waTextPost")}`,
  );

  // Broken links are worth knowing about; GA4 is a no-op when unconfigured.
  useEffect(() => {
    track("page_not_found", { page_path: pathname, referrer: document.referrer || "" });
  }, [pathname]);

  return (
    <div>
      <Seo
        title="Page Not Found (404) | M3M Brabus"
        description="The page you asked for isn't here. Find the M3M Brabus overview, price, floor plans, location and contact details instead."
        path="/404"
        noindex
      />

      <PageHeader
        eyebrow={t("notfound.eyebrow")}
        title={t("notfound.headerTitle")}
        accent={t("notfound.headerAccent")}
        lede={t("notfound.headerLede")}
      />

      {/* what happened, stated plainly */}
      <section className="container-lux pb-[clamp(3rem,9vh,5rem)]">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="mono text-[0.6rem] tracking-[0.24em] text-ink-faint">{t("notfound.addressRequested")}</p>
            <p className="mono mt-3 max-w-full overflow-x-auto whitespace-nowrap pb-1 text-[0.78rem] tracking-[0.08em] text-brass">
              {pathname}
            </p>
            <p className="mt-6 max-w-[48ch] leading-relaxed text-ink-soft">
              {t("notfound.staleLink")}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-6">
              {/* A retry is genuinely useful here: a mid-deploy visit can 404 a
                  route that exists a moment later. */}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mono inline-flex items-center gap-2 border-b border-brass/40 pb-1 text-[0.66rem] tracking-[0.18em] text-brass transition-colors hover:border-brass hover:text-brass-soft"
              >
                <RotateCw size={13} />
                {t("notfound.tryAgain")}
              </button>
              <Link
                to="/"
                className="mono inline-flex items-center gap-2 text-[0.66rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
              >
                {t("notfound.backHome")}
                <ArrowUpRight size={13} className="text-brass" />
              </Link>
            </div>
          </div>

          <Reveal className="self-start">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-10">
              <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
              <div className="relative">
                <p className="kicker">{t("notfound.askKicker")}</p>
                <p className="mt-4 max-w-[38ch] leading-relaxed text-ink-soft">
                  {t("notfound.askBody")}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => openEnquiry("404")}
                    data-cursor="OPEN"
                    className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4"
                  >
                    <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                    <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                      {t("notfound.askTeam")}
                    </span>
                    <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-6">
                  <a
                    href={`tel:${PROJECT.phone}`}
                    onClick={() => trackCall("404")}
                    className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                  >
                    <Phone size={13} className="text-brass" />
                    {PROJECT.phone}
                  </a>
                  <a
                    href={`https://wa.me/${PROJECT.whatsapp}?text=${WA_TEXT}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsApp("404")}
                    className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                  >
                    <WhatsAppIcon size={13} className="text-brass" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* the primary destinations */}
      <section className="container-lux pb-[clamp(3.5rem,10vh,6rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">{t("notfound.destinationsKicker")}</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {DESTINATIONS.map((p, i) => (
            <Link
              key={p.to}
              to={p.to}
              className="group block border-b border-line py-6"
              data-cursor="VIEW"
            >
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-3 flex items-center gap-2 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {p.name}
                <ArrowUpRight
                  size={15}
                  className="text-brass opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </h2>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{p.d}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* search by intent */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">{t("notfound.intentsKicker")}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {INTENTS.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="mono rounded-full border border-line px-5 py-3 text-[0.62rem] tracking-[0.16em] text-ink-soft transition-colors hover:border-brass/50 hover:text-brass"
            >
              {s.label}
            </Link>
          ))}
        </div>
        <p className="mono mt-8 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
          {PROJECT.configs} · {PROJECT.location}
        </p>
      </section>
    </div>
  );
}
