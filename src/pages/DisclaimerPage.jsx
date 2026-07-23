import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Phone } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import { PROJECT } from "../lib/site.js";
import { OFFICIAL_SOURCE } from "../lib/facts.js";
import { useI18n } from "../lib/i18n.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ============================================================
   The counterweight to every other page on this site. Its job is to
   set out plainly what this website is not — and, because the site
   publishes no price, no RERA number and no possession date, to
   explain that this is an absence in the official record rather than
   an omission here. Nothing on this page may soften that.
   ============================================================ */

/** Shown on the page; keep in step with any material revision. */
export const LAST_UPDATED = "20 July 2026";
const LAST_UPDATED_ISO = "2026-07-20";

const IMAGERY = [
  { kKey: "disclaimer.imagery.renders", dKey: "disclaimer.imagery.rendersD" },
  { kKey: "disclaimer.imagery.furniture", dKey: "disclaimer.imagery.furnitureD" },
  { kKey: "disclaimer.imagery.landscape", dKey: "disclaimer.imagery.landscapeD" },
  { kKey: "disclaimer.imagery.diagrams", dKey: "disclaimer.imagery.diagramsD" },
];

const AREAS = [
  { kKey: "disclaimer.areas.sizes", dKey: "disclaimer.areas.sizesD" },
  { kKey: "disclaimer.areas.carpet", dKey: "disclaimer.areas.carpetD" },
  { kKey: "disclaimer.areas.sanctioned", dKey: "disclaimer.areas.sanctionedD" },
  { kKey: "disclaimer.areas.specs", dKey: "disclaimer.areas.specsD" },
];

const UNPUBLISHED = [
  { kKey: "disclaimer.unpub.price", dKey: "disclaimer.unpub.priceD" },
  { kKey: "disclaimer.unpub.rera", dKey: "disclaimer.unpub.reraD" },
  { kKey: "disclaimer.unpub.possession", dKey: "disclaimer.unpub.possessionD" },
  { kKey: "disclaimer.unpub.land", dKey: "disclaimer.unpub.landD" },
];

const VERIFY = [
  "disclaimer.verify.rera",
  "disclaimer.verify.licence",
  "disclaimer.verify.carpet",
  "disclaimer.verify.cost",
  "disclaimer.verify.advice",
];

export default function DisclaimerPage() {
  const root = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        q(".dc-sec").forEach((sec) => {
          gsap.from(sec.querySelectorAll(".rise"), {
            autoAlpha: 0, y: 18, duration: 0.8, ease: "power3.out", stagger: 0.05,
            scrollTrigger: { trigger: sec, start: "top 88%" },
          });
        });
      });
    },
    { scope: root },
  );

  const linkCls =
    "group inline-flex items-center gap-1.5 rounded-sm border-b border-brass/40 pb-0.5 text-brass transition-colors hover:border-brass hover:text-brass-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brass";

  return (
    <div ref={root}>
      <Seo
        title="Disclaimer | M3M Brabus"
        description="Not the official M3M India website and not an offer. Renders are artistic, areas indicative, and no price, RERA number or possession date is published here."
        path="/disclaimer"
        noindex={false}
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Disclaimer", path: "/disclaimer" }]),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Disclaimer",
            description: "What this website is, what it is not, and what must be independently verified before transacting.",
            dateModified: LAST_UPDATED_ISO,
          },
        ]}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Disclaimer", path: "/disclaimer" }]} />
      <PageHeader
        title={t("disclaimer.title")}
        accent={t("disclaimer.accent")}
        lede={t("disclaimer.lede")}
      />

      {/* 01 — not an offer */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            {t("disclaimer.offerP1")}
          </p>
          <p className="rise">
            {t("disclaimer.offerP2a")}{PROJECT.developer}{t("disclaimer.offerP2b")}{PROJECT.partner}{t("disclaimer.offerP2c")}
          </p>
          <p className="rise">
            {t("disclaimer.offerP3")}
          </p>
        </div>
      </section>

      {/* 02 — not the official site */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            {t("disclaimer.officialP1a")}{PROJECT.developer}{t("disclaimer.officialP1b")}{PROJECT.developer}{t("disclaimer.officialP1c")}{PROJECT.partner}{t("disclaimer.officialP1d")}
          </p>
          <p className="rise">
            {t("disclaimer.officialP2")}
          </p>
          <p className="rise">
            <a href={OFFICIAL_SOURCE} target="_blank" rel="noopener noreferrer" className={linkCls}>
              {t("disclaimer.officialLinkA")}{PROJECT.name}{t("disclaimer.officialLinkB")}
              <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </p>
        </div>
      </section>

      {/* 03 — imagery */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <dl className="rise max-w-[70ch] border-t border-line">
          {IMAGERY.map((i) => (
            <div key={i.kKey} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-8">
              <dt className="font-display text-base leading-snug text-ink">{t(i.kKey)}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{t(i.dKey)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 04 — areas & plans */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <dl className="rise max-w-[70ch] border-t border-line">
          {AREAS.map((a) => (
            <div key={a.kKey} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-8">
              <dt className="font-display text-base leading-snug text-ink">{t(a.kKey)}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{t(a.dKey)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 05 — the figures this site does not publish */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <p className="rise mb-8 max-w-[70ch] leading-relaxed text-ink-soft">
          {t("disclaimer.unpubIntro")}
        </p>
        <dl className="rise max-w-[70ch] border-t border-line">
          {UNPUBLISHED.map((u) => (
            <div key={u.kKey} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-8">
              <dt className="font-display text-base leading-snug text-ink">{t(u.kKey)}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{t(u.dKey)}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[70ch] leading-relaxed text-ink-soft">
          {t("disclaimer.unpubTrailing")}
        </p>
      </section>

      {/* 06 — trademarks */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            {PROJECT.partner}{t("disclaimer.trademarksP1a")}{PROJECT.developer}{t("disclaimer.trademarksP1b")}
          </p>
          <p className="rise">
            {t("disclaimer.trademarksP2")}
          </p>
        </div>
      </section>

      {/* 07 — editorial content */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            {t("disclaimer.editorialP1")}
          </p>
          <p className="rise">
            {t("disclaimer.editorialP2")}
          </p>
          <p className="rise">
            {t("disclaimer.editorialP3")}
          </p>
        </div>
      </section>

      {/* 08 — verify before you transact */}
      <section className="dc-sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <p className="rise mb-8 max-w-[70ch] leading-relaxed text-ink-soft">
          {t("disclaimer.verifyIntro")}
        </p>
        <ol className="rise max-w-[70ch] border-t border-line">
          {VERIFY.map((v, i) => (
            <li key={v} className="gap-4 border-b border-line py-5">
              <span className="text-sm leading-relaxed text-ink-soft">{t(v)}</span>
            </li>
          ))}
        </ol>

        <div className="rise mt-10 max-w-[70ch] rounded-[1.25rem] border border-line bg-cream/60 p-7 md:p-9">
          <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">{t("disclaimer.whereNext")}</p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            {t("disclaimer.whereNextBody")}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link to="/rera" className={linkCls}>
              {t("disclaimer.reraLink")}
              <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link to="/contact" className={linkCls}>
              {t("disclaimer.contactLink")}
              <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <a
              href={`tel:${PROJECT.phone}`}
              className="mono inline-flex items-center gap-2.5 rounded-sm text-[0.68rem] tracking-[0.16em] text-ink-soft transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              <Phone size={13} className="text-brass" />
              {PROJECT.phone}
            </a>
          </div>
          <p className="mono mt-7 text-[0.58rem] tracking-[0.18em] text-ink-faint">
            {t("disclaimer.lastUpdated")} {LAST_UPDATED}
          </p>
        </div>
      </section>

      <RelatedPages links={["/rera", "/privacy-policy", "/contact"]} />
    </div>
  );
}
