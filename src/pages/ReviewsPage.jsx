import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { track } from "../lib/analytics.js";
import { PROJECT, RESIDENCES } from "../lib/site.js";
import { OFFICIAL_SOURCE } from "../lib/facts.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* An honest editorial assessment. No testimonials, no star ratings, no
   reviewer names — none exist, so none are published. Every line below is
   traceable to the official M3M listing or is plainly marked unpublished. */

export default function ReviewsPage() {
  const root = useRef(null);
  const { openEnquiry } = useEnquiry();
  const { t } = useI18n();

  const ASSESSED = [
    { id: "proposition", k: t("reviews.assessPropositionK"), v: t("reviews.assessPropositionV") },
    { id: "architecture", k: t("reviews.assessArchK"), v: t("reviews.assessArchV") },
    { id: "density", k: t("reviews.assessDensityK"), v: t("reviews.assessDensityV") },
    {
      id: "sizes",
      k: t("reviews.assessSizesK"),
      v: `${PROJECT.configs} — ${PROJECT.sizes}. ${t("reviews.assessSizesV")}`,
    },
    { id: "address", k: t("reviews.assessAddressK"), v: t("reviews.assessAddressV") },
    { id: "specification", k: t("reviews.assessSpecK"), v: t("reviews.assessSpecV") },
  ];

  const STRENGTHS = [
    { id: "light", t: t("reviews.strLightT"), d: t("reviews.strLightD") },
    {
      id: "scale",
      t: t("reviews.strScaleT"),
      d: `${t("reviews.strScaleD1")} ${PROJECT.sizes} ${t("reviews.strScaleD2")}`,
    },
    { id: "marque", t: t("reviews.strMarqueT"), d: `${PROJECT.partner} ${t("reviews.strMarqueD")}` },
    { id: "amenity", t: t("reviews.strAmenityT"), d: t("reviews.strAmenityD") },
  ];

  const UNPUBLISHED = [
    { id: "price", k: t("reviews.unpubPriceK"), v: PROJECT.price, note: t("reviews.unpubPriceNote") },
    { id: "rera", k: t("reviews.unpubReraK"), v: PROJECT.rera, note: t("reviews.unpubReraNote") },
    { id: "possession", k: t("reviews.unpubPossessionK"), v: PROJECT.possession, note: t("reviews.unpubPossessionNote") },
    { id: "towers", k: t("reviews.unpubTowerK"), v: t("reviews.notPublished"), note: t("reviews.unpubTowerNote") },
    { id: "land", k: t("reviews.unpubLandK"), v: t("reviews.notPublished"), note: t("reviews.unpubLandNote") },
  ];

  const VERIFY = [
    { id: "rera", t: t("reviews.verifyReraT"), d: t("reviews.verifyReraD") },
    { id: "plan", t: t("reviews.verifyPlanT"), d: t("reviews.verifyPlanD") },
    { id: "price", t: t("reviews.verifyPriceT"), d: t("reviews.verifyPriceD") },
    { id: "payment", t: t("reviews.verifyPaymentT"), d: t("reviews.verifyPaymentD") },
    { id: "possession", t: t("reviews.verifyPossessionT"), d: t("reviews.verifyPossessionD") },
    { id: "spec", t: t("reviews.verifySpecT"), d: t("reviews.verifySpecD") },
    { id: "brand", t: t("reviews.verifyBrandT"), d: t("reviews.verifyBrandD") },
  ];

  const SUITS = [
    t("reviews.suits1"),
    t("reviews.suits2"),
    t("reviews.suits3"),
    t("reviews.suits4"),
  ];

  const RECONSIDER = [
    t("reviews.reconsider1"),
    t("reviews.reconsider2"),
    t("reviews.reconsider3"),
    t("reviews.reconsider4"),
  ];

  const residencesJoined = RESIDENCES.map((r) => r.name.replace(" Residence", "")).join(
    ` ${t("reviews.and")} `,
  );

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        q(".blk").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0, y: 26, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        gsap.from(q(".rv-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".rv-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".rv-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".rv-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Review | An Honest Assessment, Sector 58 Gurgaon"
        description="An editorial review of M3M Brabus, Sector 58 Gurgaon — the BRABUS proposition, the architecture and the sizes, plus what to verify before you buy."
        path="/reviews"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Reviews", path: "/reviews" }])}
      />
      <Breadcrumbs trail={[{ name: t("breadcrumb.home"), path: "/" }, { name: t("breadcrumb.reviews"), path: "/reviews" }]} />
      <PageHeader
        eyebrow={t("reviews.eyebrow")}
        title={t("reviews.title")}
        accent={t("reviews.accent")}
        lede={t("reviews.lede")}
      />

      {/* editorial disclosure */}
      <section className="container-lux pb-[clamp(2.5rem,7vh,4rem)]">
        <div className="rise border-y border-line py-6">
          <p className="mono text-[0.58rem] tracking-[0.2em] text-brass-soft">{t("reviews.editorialNote")}</p>
          <p className="mt-3 max-w-[70ch] leading-relaxed text-ink-soft">
            {t("reviews.disclosureA")} {PROJECT.name}{t("reviews.disclosureB")} {PROJECT.developer} {t("reviews.disclosureC")}
          </p>
          {/* the page's whole credibility rests on traceability, so the source is linked, not cited */}
          <a
            href={OFFICIAL_SOURCE}
            target="_blank"
            rel="noopener noreferrer"
            className="mono mt-4 inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.18em] text-brass transition-colors hover:text-brass-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
          >
            {t("reviews.factsAsPublished")} {PROJECT.developer}
            <ArrowUpRight size={12} />
          </a>
        </div>
      </section>

      {/* the assessment */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">{t("reviews.assessmentKicker")}</span>
        </div>
        <dl className="border-t border-line">
          {ASSESSED.map((a) => (
            <div
              key={a.id}
              className="blk grid grid-cols-1 gap-2 border-b border-line py-6 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8"
            >
              <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{a.k}</dt>
              <dd className="max-w-[64ch] leading-relaxed text-ink-soft">{a.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* image */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="rv-img-wrap relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-line">
          <div className="rv-img-inner ed-breath absolute inset-0 scale-[1.06]">
            <Media src={px(IMG.heroExterior, 2000)} alt={`${PROJECT.name} — ${t("reviews.towerAlt")} ${PROJECT.location}`} sizes="100vw" />
          </div>
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
          <span className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
            {t("reviews.officialRender")} · {PROJECT.address}
          </span>
        </div>
      </section>

      {/* what stands up */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">{t("reviews.strengthsKicker")}</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {STRENGTHS.map((s, i) => (
            <article key={s.id} className="blk group border-b border-line py-6">
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-3 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-2xl">
                {s.t}
              </h2>
              <p className="mt-2.5 max-w-[48ch] text-sm leading-relaxed text-ink-soft">{s.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* not yet published */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">{t("reviews.unpubKicker")}</span>
        </div>
        <p className="blk mb-8 max-w-[62ch] leading-relaxed text-ink-soft">
          {t("reviews.unpubIntroA")} {PROJECT.developer} {t("reviews.unpubIntroB")}
        </p>
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[1fr_1fr_1.6fr] gap-6 border-b border-line pb-4">
              <span className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{t("reviews.colItem")}</span>
              <span className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{t("reviews.colStatus")}</span>
              <span className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{t("reviews.colMeaning")}</span>
            </div>
            {UNPUBLISHED.map((u) => (
              <div key={u.id} className="blk grid grid-cols-[1fr_1fr_1.6fr] items-baseline gap-6 border-b border-line-soft py-5">
                <span className="font-display text-lg text-ink">{u.k}</span>
                <span className="font-serif text-sm italic text-brass">{u.v}</span>
                <span className="text-sm leading-relaxed text-ink-soft">{u.note}</span>
              </div>
            ))}
          </div>
        </div>
        {/* a gap is only useful to a reader if there is a way to close it —
            the passive note that stood here asked nothing of anyone */}
        <div className="blk mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <button
            type="button"
            onClick={() => {
              track("reviews_documents");
              openEnquiry("Reviews — unpublished figures");
            }}
            data-cursor="ASK"
            className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
            <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
              {t("reviews.figureCta")}
            </span>
            <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
          </button>
          <span className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">
            {t("reviews.docsOnly")}
          </span>
        </div>
      </section>

      {/* what to verify */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">{t("reviews.verifyKicker")}</span>
        </div>
        <p className="blk mb-8 max-w-[62ch] leading-relaxed text-ink-soft">
          {t("reviews.verifyIntro")}
        </p>
        <ol className="border-t border-line">
          {VERIFY.map((v, i) => (
            <li
              key={v.id}
              className="blk grid grid-cols-1 gap-2 border-b border-line py-6 sm:grid-cols-[minmax(0,3rem)_1fr] sm:gap-8"
            >
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="font-display text-xl text-ink md:text-2xl">{v.t}</h2>
                <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-ink-soft">{v.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* suits / reconsider */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">05</span>
          <span className="kicker">{t("reviews.suitsKicker")}</span>
        </div>

        {/* the resale question is the one buyers ask last and worry about first;
            with no pricing published it can only be answered structurally, and
            answering it honestly means stating the downside in the same breath */}
        <p className="blk mb-[clamp(2rem,5vh,3rem)] max-w-[70ch] leading-relaxed text-ink-soft">
          {t("reviews.resaleP")}
        </p>

        <div className="grid gap-x-14 gap-y-10 md:grid-cols-2">
          <div className="blk border-t border-line pt-6">
            <h2 className="font-display text-2xl font-light text-ink md:text-3xl">
              {t("reviews.strongFitA")} <span className="font-serif italic text-brass">{t("reviews.strongFitB")}</span>
            </h2>
            <ul className="mt-5">
              {SUITS.map((s) => (
                <li key={s} className="border-b border-line-soft py-4 text-sm leading-relaxed text-ink-soft">{s}</li>
              ))}
            </ul>
          </div>
          <div className="blk border-t border-line pt-6">
            <h2 className="font-display text-2xl font-light text-ink md:text-3xl">
              {t("reviews.pausingA")} <span className="font-serif italic text-brass">{t("reviews.pausingB")}</span>
            </h2>
            <ul className="mt-5">
              {RECONSIDER.map((s) => (
                <li key={s} className="border-b border-line-soft py-4 text-sm leading-relaxed text-ink-soft">{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="blk mt-[clamp(3rem,8vh,5rem)] border-t border-line pt-8">
          <p className="mono text-[0.58rem] tracking-[0.2em] text-brass-soft">{t("reviews.inShortLabel")}</p>
          <p className="mt-4 max-w-[70ch] font-display text-[clamp(1.3rem,2.4vw,1.9rem)] font-light leading-[1.35] text-ink">
            {t("reviews.inShortA")}{" "}
            {residencesJoined} {t("reviews.inShortHomesOf")} {PROJECT.sizes}{t("reviews.inShortTail")}{" "}
            <span className="font-serif italic text-brass">
              {t("reviews.inShortSpan")}
            </span>
          </p>
        </div>
      </section>

      <RelatedPages links={["/overview", "/residences", "/brabus", "/contact"]} />
      <CtaBand title={t("reviews.ctaTitle")} accent={t("reviews.ctaAccent")} subject="Reviews" />
    </div>
  );
}
