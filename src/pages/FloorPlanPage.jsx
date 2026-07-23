import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import FloorPlan from "../components/sections/FloorPlan.jsx";
import Media from "../components/ui/Media.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT, RESIDENCES, FAQS } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Reading guide — the vocabulary a buyer needs before the plan makes sense. */
const HOW_TO_READ = [
  { tKeyT: "floorplan.read1T", tKeyD: "floorplan.read1D" },
  { tKeyT: "floorplan.read2T", tKeyD: "floorplan.read2D" },
  { tKeyT: "floorplan.read3T", tKeyD: "floorplan.read3D" },
  { tKeyT: "floorplan.read4T", tKeyD: "floorplan.read4D" },
];

/* Plain-language explanation of the architecture, not marketing adjectives. */
const OPEN_CORE = [
  { tKeyT: "floorplan.core1T", tKeyD: "floorplan.core1D" },
  { tKeyT: "floorplan.core2T", tKeyD: "floorplan.core2D" },
  { tKeyT: "floorplan.core3T", tKeyD: "floorplan.core3D" },
  { tKeyT: "floorplan.core4T", tKeyD: "floorplan.core4D" },
];

/* 4 vs 5 BHK, described in how the plan behaves rather than in numbers. */
const DIFFERENCE = [
  {
    id: "footprint",
    tKeyK: "floorplan.diff1K",
    a: "≈ 5,000 sq.ft",
    b: "≈ 7,000 sq.ft",
    note: true,
    tKeyNote: "floorplan.diff1Note",
  },
  {
    id: "bedrooms",
    tKeyK: "floorplan.diff2K",
    tKeyA: "floorplan.diff2A",
    tKeyB: "floorplan.diff2B",
    note: true,
    tKeyNote: "floorplan.diff2Note",
  },
  {
    id: "reception",
    tKeyK: "floorplan.diff3K",
    tKeyA: "floorplan.diff3A",
    tKeyB: "floorplan.diff3B",
    note: true,
    tKeyNote: "floorplan.diff3Note",
  },
  {
    id: "study",
    tKeyK: "floorplan.diff4K",
    tKeyA: "floorplan.diff4A",
    tKeyB: "floorplan.diff4B",
    note: true,
    tKeyNote: "floorplan.diff4Note",
  },
  {
    id: "arrival",
    tKeyK: "floorplan.diff5K",
    tKeyA: "floorplan.diff5A",
    tKeyB: "floorplan.diff5B",
    note: true,
    tKeyNote: "floorplan.diff5Note",
  },
  {
    id: "suits",
    tKeyK: "floorplan.diff6K",
    tKeyA: "floorplan.diff6A",
    tKeyB: "floorplan.diff6B",
    note: false,
  },
];

/* Only the questions a floor-plan visitor actually asks. */
const PLAN_FAQ_KEYS = [
  "What configurations and sizes does M3M Brabus offer?",
  "What makes the homes different?",
  "What is the price of M3M Brabus?",
];
const PLAN_FAQS = FAQS.filter((f) => PLAN_FAQ_KEYS.includes(f.q));

export default function FloorPlanPage() {
  const root = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        q(".rise-b").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        gsap.from(q(".fp-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".fp-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".fp-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".fp-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Floor Plan | 4 & 5 BHK Layouts, Sector 58"
        description="M3M Brabus floor plans — interactive 4 BHK (~5,000 sq.ft) and 5 BHK (~7,000 sq.ft) layouts, how to read them, and dimensioned drawings on request."
        path="/floor-plan"
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Floor Plan", path: "/floor-plan" }]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: PLAN_FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Floor Plan", path: "/floor-plan" }]} />
      <PageHeader
        eyebrow={t("floorplan.eyebrow")}
        title={t("floorplan.title")}
        accent={t("floorplan.accent")}
        lede={t("floorplan.lede").replace("{configs}", PROJECT.configs).replace("{sizes}", PROJECT.sizes).replace("{location}", PROJECT.location)}
      />

      {/* how to read the plans */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {HOW_TO_READ.map((h, i) => (
            <div key={h.tKeyT} className="rise group border-b border-line py-6">
              <h2 className="mt-3 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-2xl">
                {t(h.tKeyT)}
              </h2>
              <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-ink-soft">{t(h.tKeyD)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* the interactive plans — the centrepiece */}
      <FloorPlan />

      {/* open-core, explained */}
      <section className="container-lux py-[clamp(4rem,11vh,7rem)]">

        {/* items-stretch so the figure matches the column beside it. With a fixed
            aspect ratio its height came from its width alone, so the taller text
            column left a growing well of empty space under the image. */}
        <div className="grid items-stretch gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <h2 className="rise-b max-w-[18ch] font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
              {t("floorplan.openCoreTitle")} <span className="font-serif italic text-brass">{t("floorplan.plainLanguage")}</span>
            </h2>
            <p className="rise-b mt-6 max-w-[52ch] leading-relaxed text-ink-soft">
              {t("floorplan.openCoreIntro")}
            </p>
            {/* Two columns from sm up. Stacked, these four rows made the section
                taller than the viewport, so the heading was already scrolling off
                before the last point was read — the argument is meant to be taken
                in at once. Paired, the whole block sits in a single view. */}
            <dl className="mt-7 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
              {OPEN_CORE.map((o) => (
                <div key={o.tKeyT} className="rise-b border-b border-line py-4">
                  <dt className="font-display text-lg text-ink">{t(o.tKeyT)}</dt>
                  <dd className="mt-1.5 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{t(o.tKeyD)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Keeps its 4:5 crop while stacked; fills the row once side by side. */}
          <figure className="fp-img-wrap relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line lg:aspect-auto lg:h-full lg:min-h-[30rem]">
            <div className="fp-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.livingRoom, 1400)}
                alt={t("floorplan.altLiving")}
                sizes="(max-width:1024px) 100vw, 44vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              {t("floorplan.capDaylight")}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 4 vs 5 BHK in plain language */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[0.9fr_1fr_1fr] gap-6 border-b border-line pb-4">
              <span className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{t("floorplan.inThePlan")}</span>
              {RESIDENCES.map((r) => (
                <span key={r.id} className="font-display text-lg text-ink">
                  {r.name.replace(" Residence", "")}
                  <span className="mono ml-2 text-[0.58rem] tracking-[0.16em] text-ink-faint">{r.area}</span>
                </span>
              ))}
            </div>
            {DIFFERENCE.map((d) => (
              <div key={d.id} className="rise-b border-b border-line-soft py-5">
                <div className="grid grid-cols-[0.9fr_1fr_1fr] items-baseline gap-6">
                  <span className="mono text-[0.62rem] tracking-[0.14em] text-ink-faint">{t(d.tKeyK)}</span>
                  <span className="text-sm text-ink">{d.tKeyA ? t(d.tKeyA) : d.a}</span>
                  <span className="text-sm text-ink">{d.tKeyB ? t(d.tKeyB) : d.b}</span>
                </div>
                {d.note && (
                  <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-soft">{t(d.tKeyNote)}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          {t("floorplan.footLayouts")}
        </p>
      </section>

      {/* what is drawn, what is issued on request */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid gap-10 border-t border-line pt-8 lg:grid-cols-2 lg:gap-16">
          <p className="rise-b max-w-[52ch] leading-relaxed text-ink-soft">
            {t("floorplan.dimensionedBody")}
          </p>
          <dl className="border-t border-line lg:border-t-0">
            {[
              { id: "configs", k: t("price.labelConfigurations"), v: PROJECT.configs },
              { id: "sizes", k: t("price.labelResidenceSizes"), v: PROJECT.sizes },
              { id: "orientation", k: t("price.orientation"), v: t("floorplan.valOrientation") },
              { id: "dimensioned", k: t("floorplan.labelDimensioned"), v: t("floorplan.valSharedOnRequest") },
              { id: "price", k: t("price.labelPrice"), v: PROJECT.price },
              { id: "possession", k: t("price.labelPossession"), v: PROJECT.possession },
              { id: "rera", k: t("price.labelRera"), v: PROJECT.rera },
            ].map((f) => (
              <div
                key={f.id}
                className="rise-b grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-8"
              >
                <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{f.k}</dt>
                <dd className="text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* plan questions */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        <dl className="border-t border-line">
          {PLAN_FAQS.map((f) => (
            <div key={f.q} className="rise-b border-b border-line py-6">
              <dt className="font-display text-lg text-ink md:text-xl">{f.q}</dt>
              <dd className="mt-2 max-w-[68ch] leading-relaxed text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedPages links={["/residences", "/overview", "/amenities", "/contact"]} />

      <CtaBand title={t("floorplan.ctaTitle")} accent={t("floorplan.ctaAccent")} subject="Floor Plan" />
    </div>
  );
}
