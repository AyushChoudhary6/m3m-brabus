import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Check, Phone } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Fact from "../components/ui/Fact.jsx";
import Media from "../components/ui/Media.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT, HIGHLIGHTS } from "../lib/site.js";
import { PROJECT_FACTS, PROJECT_FACT, OFFICIAL_SOURCE, hasValue } from "../lib/facts.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* No site plan is reproduced on this page and none is described.
   M3M has not published a master plan, an acreage, a tower count or an
   open-space figure for Brabus, so the page teaches the buyer to read the
   drawing instead of pretending to show it. The one diagram below is a
   generic planning schematic drawn by hand in SVG — it is labelled as such
   in three places so it can never be mistaken for this project's layout. */

/* What each layer of a master plan is actually telling you. Deliberately
   ordered the way a planner reads the sheet: outward boundary first, built
   form second, movement third, landscape last. */
const READ = [
  { tKey: "masterplan.read1t", dKey: "masterplan.read1d" },
  { tKey: "masterplan.read2t", dKey: "masterplan.read2d" },
  { tKey: "masterplan.read3t", dKey: "masterplan.read3d" },
  { tKey: "masterplan.read4t", dKey: "masterplan.read4d" },
  { tKey: "masterplan.read5t", dKey: "masterplan.read5d" },
  { tKey: "masterplan.read6t", dKey: "masterplan.read6d" },
  { tKey: "masterplan.read7t", dKey: "masterplan.read7d" },
];

/* Verification list — deliberately about the DRAWING, not about the
   paperwork generally (that lives on /rera, and repeating it here would
   cannibalise it). */
const VERIFY = [
  "masterplan.verify1",
  "masterplan.verify2",
  "masterplan.verify3",
  "masterplan.verify4",
  "masterplan.verify5",
  "masterplan.verify6",
  "masterplan.verify7",
  "masterplan.verify8",
  "masterplan.verify9",
  "masterplan.verify10",
  "masterplan.verify11",
  "masterplan.verify12",
];

/* HIGHLIGHTS is the source for the open-core language; we quote it rather
   than restate it so the claim on this page never drifts from the homepage. */
const OPEN_CORE = HIGHLIGHTS.find((h) => h.title === "Open-Core Architecture");
const LOW_DENSITY = HIGHLIGHTS.find((h) => h.title === "Ultra-Low Density");

/* Split the facts layer into what the listing publishes and what it does
   not, so the page can be honest about the ratio in plain sight. */
const CONFIRMED = PROJECT_FACTS.filter(hasValue);
const PLAN_UNKNOWNS = ["landArea", "towers", "floors", "openSpace"]
  .map((k) => PROJECT_FACT[k])
  .filter(Boolean);

export default function MasterPlanPage() {
  const root = useRef(null);
  const { openEnquiry } = useEnquiry();
  const { t } = useI18n();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        gsap.from(q(".read-row"), {
          autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".read")[0], start: "top 86%" },
        });

        gsap.from(q(".fact-cell"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: q(".facts")[0], start: "top 86%" },
        });

        gsap.from(q(".core-rise"), {
          autoAlpha: 0, y: 22, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".core")[0], start: "top 86%" },
        });

        gsap.from(q(".ver-row"), {
          autoAlpha: 0, y: 16, duration: 0.65, ease: "power3.out", stagger: 0.04,
          scrollTrigger: { trigger: q(".verify")[0], start: "top 85%" },
        });

        /* the schematic assembles layer by layer — reinforces that it is a
           drawing being built up, not a photograph of anything */
        gsap.from(q(".dg-stroke"), {
          autoAlpha: 0, duration: 0.9, ease: "power2.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".dg")[0], start: "top 84%" },
        });

        gsap.from(q(".mp-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".mp-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".mp-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".mp-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="bg-canvas">
      <Seo
        title="M3M Brabus Master Plan | Site Layout, Orientation & Spacing, Sector 58 Gurgaon"
        description="M3M Brabus master plan — the site layout is not publicly released. How to read a master plan, what is confirmed at Sector 58, and how to request it."
        path="/master-plan"
        jsonLd={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Master Plan", path: "/master-plan" },
        ])}
      />
      <Breadcrumbs
        trail={[{ name: "Home", path: "/" }, { name: "Master Plan", path: "/master-plan" }]}
      />
      <PageHeader
        compact
        eyebrow={t("masterplan.eyebrow")}
        title={t("masterplan.title")}
        accent={t("masterplan.accent")}
        lede={t("masterplan.lede")}
      />

      {/* how to read the sheet */}
      <section className="read container-lux pb-[clamp(4rem,11vh,7rem)]">

        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="rise max-w-[52ch] leading-relaxed text-ink-soft">
              {t("masterplan.readP1")}
            </p>
            <p className="rise mt-5 max-w-[52ch] leading-relaxed text-ink-soft">
              {t("masterplan.readP2")}
            </p>
          </div>

          {/* Hand-drawn schematic. Abstract on purpose: no dimensions, no
              tower count, nothing that could be read as this project. */}
          <figure className="dg rise self-start">
            <div className="overflow-x-auto rounded-[1.25rem] border border-line bg-paper">
              <svg
                viewBox="0 0 640 400"
                className="h-auto w-full min-w-[420px]"
                role="img"
                aria-label={t("masterplan.svgAria")}
              >
                {/* site boundary */}
                <rect
                  className="dg-stroke" x="40" y="40" width="560" height="320" rx="10"
                  fill="none" stroke="#c9a86a" strokeOpacity="0.5" strokeWidth="1.2"
                  strokeDasharray="7 6"
                />
                <text x="52" y="30" fill="#6f6551" fontSize="11" letterSpacing="2.4" fontFamily="ui-monospace, monospace">
                  {t("masterplan.svgBoundary")}
                </text>

                {/* north point */}
                <g className="dg-stroke" stroke="#c9a86a" strokeWidth="1.1" fill="none">
                  <circle cx="560" cy="88" r="20" strokeOpacity="0.45" />
                  <path d="M560 74 L565 96 L560 91 L555 96 Z" fill="#c9a86a" stroke="none" />
                </g>
                <text x="553" y="120" fill="#c9a86a" fontSize="11" fontFamily="ui-monospace, monospace">{t("masterplan.svgNorth")}</text>

                {/* sun path, east to west across the south face */}
                <path
                  className="dg-stroke"
                  d="M70 300 Q320 190 570 300"
                  fill="none" stroke="#a99d86" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 7"
                />
                <text x="62" y="322" fill="#6f6551" fontSize="10" fontFamily="ui-monospace, monospace">{t("masterplan.svgEast")}</text>
                <text x="566" y="322" fill="#6f6551" fontSize="10" fontFamily="ui-monospace, monospace">{t("masterplan.svgWest")}</text>

                {/* staggered tower footprints */}
                <g className="dg-stroke" fill="#c9a86a" fillOpacity="0.09" stroke="#c9a86a" strokeOpacity="0.7" strokeWidth="1.2">
                  <rect x="92" y="104" width="94" height="66" rx="4" />
                  <rect x="272" y="82" width="94" height="66" rx="4" />
                  <rect x="452" y="112" width="94" height="66" rx="4" />
                </g>

                {/* Three open faces marked on the centre footprint. Section 03
                    argues that "three sides open" is settled by the layout, not
                    the specification — this is the only place the drawing can
                    show what that argument is actually about. */}
                <g className="dg-stroke" stroke="#e6d2a0" strokeOpacity="0.8" strokeWidth="1.1" fill="none">
                  <path d="M319 82 L319 60 M314 68 L319 58 L324 68" />
                  <path d="M272 102 L250 102 M256 97 L248 102 L256 107" />
                  <path d="M366 102 L388 102 M382 97 L390 102 L382 107" />
                </g>
                <text x="334" y="62" fill="#e6d2a0" fontSize="10" letterSpacing="1.6" fontFamily="ui-monospace, monospace">
                  {t("masterplan.svgThreeFaces")}
                </text>

                {/* spacing dimension between two footprints */}
                <g className="dg-stroke" stroke="#a99d86" strokeOpacity="0.6" strokeWidth="0.9">
                  <line x1="186" y1="137" x2="272" y2="137" />
                  <line x1="186" y1="129" x2="186" y2="145" />
                  <line x1="272" y1="129" x2="272" y2="145" />
                </g>
                <text x="196" y="124" fill="#6f6551" fontSize="10" letterSpacing="1.6" fontFamily="ui-monospace, monospace">
                  {t("masterplan.svgSpacing")}
                </text>

                {/* central amenity core */}
                <circle
                  className="dg-stroke" cx="320" cy="252" r="46"
                  fill="#c9a86a" fillOpacity="0.07" stroke="#c9a86a" strokeOpacity="0.55" strokeWidth="1.1"
                />
                <text x="291" y="256" fill="#c9a86a" fontSize="10" letterSpacing="1.4" fontFamily="ui-monospace, monospace">
                  {t("masterplan.svgCore")}
                </text>

                {/* resident loop, drawn clear of the service spur */}
                <path
                  className="dg-stroke"
                  d="M139 190 Q200 246 274 252 M366 252 Q440 246 499 196"
                  fill="none" stroke="#a99d86" strokeOpacity="0.5" strokeWidth="1"
                />

                {/* separated service route hugging the boundary */}
                <path
                  className="dg-stroke"
                  d="M40 344 L600 344"
                  fill="none" stroke="#8c2f1d" strokeOpacity="0.75" strokeWidth="1.1" strokeDasharray="5 5"
                />
                <text x="46" y="360" fill="#6f6551" fontSize="10" letterSpacing="1.6" fontFamily="ui-monospace, monospace">
                  {t("masterplan.svgService")}
                </text>
              </svg>
            </div>
            <figcaption className="mono mt-4 text-[0.56rem] leading-relaxed tracking-[0.16em] text-ink-faint">
              {t("masterplan.svgCaption")}
            </figcaption>
          </figure>
        </div>

        <dl className="mt-[clamp(2.5rem,7vh,4.5rem)] border-t border-line">
          {READ.map((r, i) => (
            <div
              key={r.tKey}
              className="read-row grid grid-cols-1 gap-2 border-b border-line py-6 lg:grid-cols-[minmax(0,3rem)_minmax(0,17rem)_1fr] lg:gap-8"
            >
              <dt className="font-display text-xl leading-snug text-ink">{t(r.tKey)}</dt>
              <dd className="max-w-[64ch] text-sm leading-relaxed text-ink-soft">{t(r.dKey)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* the facts layer, stated as-is */}
      <section className="facts container-lux pb-[clamp(4rem,11vh,7rem)]">
        <p className="mb-10 max-w-[58ch] leading-relaxed text-ink-soft">
          {t("masterplan.factsIntro")}
        </p>

        <div className="grid gap-x-14 gap-y-9 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {CONFIRMED.map((f) => (
            <Fact key={f.key} fact={f} className="fact-cell" />
          ))}
        </div>

        <p className="mono mt-[clamp(2.5rem,6vh,3.5rem)] text-[0.6rem] tracking-[0.2em] text-brass">
          {t("masterplan.notPublished")}
        </p>
        <div className="mt-6 grid gap-x-14 gap-y-9 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_UNKNOWNS.map((f) => (
            <Fact key={f.key} fact={f} className="fact-cell" />
          ))}
        </div>

        <p className="mt-8 max-w-[62ch] text-sm leading-relaxed text-ink-faint">
          {t("masterplan.factsNoteA")}{" "}
          <a
            href={OFFICIAL_SOURCE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:text-brass-soft"
          >
            {t("masterplan.checkListing")}
          </a>{" "}
          {t("masterplan.factsNoteB")}
        </p>
      </section>

      {/* the gated document */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid items-stretch gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-11">
            <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
            <div className="relative">
              <p className="rise kicker">{t("masterplan.requestKicker")}</p>
              <h2 className="rise mt-4 max-w-[18ch] font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                {t("masterplan.requestTitle")}{" "}
                <span className="font-serif italic text-brass">{t("masterplan.requestAccent")}</span>
              </h2>
              <p className="rise mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
                {t("masterplan.requestBody")}
              </p>

              <div className="rise mt-9 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => openEnquiry("Master plan")}
                  data-cursor="OPEN"
                  aria-label={t("masterplan.requestAria")}
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    {t("masterplan.requestBtn")}
                  </span>
                  <ArrowUpRight
                    size={15}
                    className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian"
                  />
                </button>
                <a
                  href={`tel:${PROJECT.phone}`}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  <Phone size={13} className="text-brass" />
                  {PROJECT.phone}
                </a>
              </div>

              <p className="rise mono mt-8 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
                {t("masterplan.requestNote")}
              </p>
            </div>
          </div>

          <figure className="mp-img-wrap relative min-h-[18rem] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="mp-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.arrival, 1400)}
                alt={t("masterplan.arrivalAlt")}
                sizes="(max-width:1024px) 100vw, 42vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_52%,rgba(8,6,5,0.68))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              {t("masterplan.arrivalCaption")}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* the open-core claim, tested against planning */}
      <section className="core container-lux pb-[clamp(4rem,11vh,7rem)]">

        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <h2 className="core-rise max-w-[16ch] font-display text-[clamp(1.9rem,4vw,3rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink">
              {t("masterplan.coreTitle")}{" "}
              <span className="font-serif italic text-brass">{t("masterplan.coreAccent")}</span> {t("masterplan.coreTitleEnd")}
            </h2>
            {OPEN_CORE && (
              <blockquote className="core-rise mt-7 border-l border-brass/40 pl-6">
                <p className="max-w-[44ch] font-serif text-lg italic leading-relaxed text-ink-soft">
                  {OPEN_CORE.body}
                </p>
                <footer className="mono mt-3 text-[0.56rem] tracking-[0.2em] text-ink-faint">
                  {OPEN_CORE.title} · {t("masterplan.asPublished")}
                </footer>
              </blockquote>
            )}
          </div>

          <div className="space-y-6">
            <p className="core-rise max-w-[56ch] leading-relaxed text-ink-soft">
              {t("masterplan.coreP1")}
            </p>
            <p className="core-rise max-w-[56ch] leading-relaxed text-ink-soft">
              {t("masterplan.coreP2")}
            </p>
            <p className="core-rise max-w-[56ch] leading-relaxed text-ink-soft">
              {t("masterplan.coreP3")}
            </p>
            {LOW_DENSITY && (
              <p className="core-rise max-w-[56ch] leading-relaxed text-ink-soft">
                {t("masterplan.coreP4A")}{LOW_DENSITY.body}{t("masterplan.coreP4B")}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* sanctioned vs marketing */}
      <section className="verify container-lux pb-[clamp(4rem,12vh,8rem)]">

        <div className="mb-10 grid gap-8 md:grid-cols-2 md:gap-14">
          <div className="rounded-[1.25rem] border border-line bg-paper p-7">
            <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">{t("masterplan.marketingLabel")}</p>
            <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-ink-soft">
              {t("masterplan.marketingBody")}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-brass/25 bg-paper p-7">
            <p className="mono text-[0.58rem] tracking-[0.2em] text-brass">{t("masterplan.sanctionedLabel")}</p>
            <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-ink-soft">
              {t("masterplan.sanctionedBody")}
            </p>
          </div>
        </div>

        <p className="mb-8 max-w-[58ch] leading-relaxed text-ink-soft">
          {t("masterplan.verifyIntro")}
        </p>

        <ul className="border-t border-line">
          {VERIFY.map((v) => (
            <li
              key={v}
              className="ver-row flex items-start gap-4 border-b border-line py-4 text-ink-soft"
            >
              <Check size={13} strokeWidth={2} className="mt-1.5 shrink-0 text-brass" aria-hidden="true" />
              <span className="max-w-[72ch] leading-relaxed">{t(v)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
          {t("masterplan.verifyOutro")}
        </p>
      </section>

      <RelatedPages links={["/overview", "/floor-plan", "/rera", "/amenities"]} />
      <CtaBand title={t("masterplan.ctaTitle")} accent={t("masterplan.ctaAccent")} subject="Master plan" />
    </div>
  );
}
