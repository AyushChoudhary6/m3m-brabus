import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* We publish only what the official listing publishes. Possession, RERA and
   price are not stated there yet — so this page explains the mechanics of a
   handover instead of inventing a date. */

const MEANING = [
  { k: "01", tKey: "possession.meaning1Title", dKey: "possession.meaning1Body" },
  { k: "02", tKey: "possession.meaning2Title", dKey: "possession.meaning2Body" },
  { k: "03", tKey: "possession.meaning3Title", dKey: "possession.meaning3Body" },
  { k: "04", tKey: "possession.meaning4Title", dKey: "possession.meaning4Body" },
];

const GOVERNS = [
  { tKey: "possession.governs1Title", dKey: "possession.governs1Body" },
  { tKey: "possession.governs2Title", dKey: "possession.governs2Body" },
  { tKey: "possession.governs3Title", dKey: "possession.governs3Body" },
  { tKey: "possession.governs4Title", dKey: "possession.governs4Body" },
];

const ASK = [
  { qKey: "possession.ask1Q", aKey: "possession.ask1A" },
  { qKey: "possession.ask2Q", aKey: "possession.ask2A" },
  { qKey: "possession.ask3Q", aKey: "possession.ask3A" },
  { qKey: "possession.ask4Q", aKey: "possession.ask4A" },
  { qKey: "possession.ask5Q", aKey: "possession.ask5A" },
  { qKey: "possession.ask6Q", aKey: "possession.ask6A" },
];

const PAGE_FAQS = [
  {
    q: "What is the possession date of M3M Brabus?",
    a: `A possession date is not published on the official M3M listing at this stage — it is stated as "${PROJECT.possession}". We do not publish dates we cannot source. Register your interest and we will share the current, official timeline the moment it is released.`,
  },
  {
    q: "Is M3M Brabus RERA registered, and where is the completion date declared?",
    a: `RERA details are shown as "${PROJECT.rera}" on the official listing. For any registered project the completion date is declared in the RERA filing itself — ask for the registration number and verify the date in the authority's record rather than in any brochure.`,
  },
  {
    q: "How will I know when the timeline is announced?",
    a: "Leave your details with the private client team. When the developer publishes possession, RERA and pricing information, it is shared directly — along with the construction status at that time.",
  },
];

export default function PossessionPage() {
  const root = useRef(null);
  const { t } = useI18n();

  const STATUS = [
    { k: t("possession.statPossession"), v: PROJECT.possession, n: t("possession.statPossessionNote") },
    { k: t("possession.statRera"), v: PROJECT.rera, n: t("possession.statReraNote") },
    { k: t("possession.statPrice"), v: PROJECT.price, n: t("possession.statPriceNote") },
    { k: t("possession.statConfig"), v: PROJECT.configs, n: PROJECT.sizes },
    { k: t("possession.statAddress"), v: PROJECT.address, n: t("possession.statAddressNote") },
    { k: t("possession.statDeveloper"), v: `${PROJECT.developer} · ${t("possession.inspiredBy")} ${PROJECT.partner}`, n: t("possession.statDeveloperNote") },
  ];

  /* Visible FAQ rows — translated for readers. PAGE_FAQS above stays English and
     feeds the JSON-LD untouched. */
  const FAQ_ROWS = [
    { qKey: "possession.faq1Q", a: <>{t("possession.faq1APre")}&ldquo;{PROJECT.possession}&rdquo;{t("possession.faq1APost")}</> },
    { qKey: "possession.faq2Q", a: <>{t("possession.faq2APre")}&ldquo;{PROJECT.rera}&rdquo;{t("possession.faq2APost")}</> },
    { qKey: "possession.faq3Q", a: t("possession.faq3A") },
  ];

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        q(".mn").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0, y: 26, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        gsap.from(q(".gv"), {
          autoAlpha: 0, y: 22, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".gv-grid")[0], start: "top 86%" },
        });

        gsap.from(q(".ask-row"), {
          autoAlpha: 0, y: 18, duration: 0.7, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: q(".ask")[0], start: "top 85%" },
        });

        gsap.from(q(".fq"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".fq-list")[0], start: "top 86%" },
        });

        gsap.from(q(".ps-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".ps-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".ps-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".ps-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Possession Date & Status | Sector 58 Gurgaon"
        description="M3M Brabus possession date is not published yet. The current status, what governs a handover timeline, and exactly what to ask before you commit."
        path="/possession"
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Possession", path: "/possession" }]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: PAGE_FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Possession", path: "/possession" }]} />
      <PageHeader
        title={t("possession.headerTitle")}
        accent={t("possession.headerAccent")}
        lede={`${t("possession.ledePre")}${PROJECT.name}${t("possession.ledeMid")}"${PROJECT.possession}"${t("possession.ledePost")}`}
      />

      {/* current status */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <dl className="border-t border-line">
          {STATUS.map((s) => (
            <div
              key={s.k}
              className="rise grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,14rem)_1fr_minmax(0,18rem)] sm:items-baseline sm:gap-8"
            >
              <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{s.k}</dt>
              <dd className="text-ink">{s.v}</dd>
              <dd className="mono text-[0.6rem] leading-relaxed tracking-[0.14em] text-ink-faint sm:text-right">{s.n}</dd>
            </div>
          ))}
        </dl>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          {t("possession.statusNote")}
        </p>
      </section>

      {/* what possession means */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {MEANING.map((m) => (
            <article key={m.k} className="mn group border-b border-line py-7">
              <h2 className="font-display text-2xl font-light text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-[1.75rem]">
                {t(m.tKey)}
              </h2>
              <p className="mt-2 max-w-[46ch] leading-relaxed text-ink-soft">{t(m.dKey)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* wide image */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="ps-img-wrap relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-line">
          <div className="ps-img-inner ed-breath absolute inset-0 scale-[1.06]">
            <Media src={px(IMG.tower, 2000)} alt={`${PROJECT.name} — the tower at ${PROJECT.location}`} sizes="100vw" />
          </div>
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
          <span className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
            {t("possession.imgCaption")} · {PROJECT.location}
          </span>
        </div>
      </section>

      {/* what governs the timeline */}
      <section className="gv-grid container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {GOVERNS.map((g) => (
            <div key={g.tKey} className="gv group border-b border-line py-6">
              <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">{t(g.tKey)}</h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{t(g.dKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* what to ask */}
      <section className="ask container-lux pb-[clamp(4rem,11vh,7rem)]">
        <ul className="border-t border-line">
          {ASK.map((a) => (
            <li
              key={a.qKey}
              className="ask-row group grid grid-cols-1 gap-2 border-b border-line py-5 transition-colors duration-500 hover:bg-brass/[0.035] sm:grid-cols-[minmax(0,22rem)_1fr] sm:items-baseline sm:gap-8"
            >
              <span className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass-soft">{t(a.qKey)}</span>
              <span className="max-w-[52ch] text-sm leading-relaxed text-ink-soft">{t(a.aKey)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* faqs */}
      <section className="fq-list container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="border-t border-line">
          {FAQ_ROWS.map((f) => (
            <article key={f.qKey} className="fq grid grid-cols-1 gap-2 border-b border-line py-7 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
              <h3 className="font-display text-xl font-light leading-snug text-ink md:text-2xl">{t(f.qKey)}</h3>
              <p className="max-w-[58ch] leading-relaxed text-ink-soft">{f.a}</p>
            </article>
          ))}
        </div>
      </section>

      <RelatedPages links={["/overview", "/residences", "/contact"]} />

      <CtaBand title={t("possession.ctaTitle")} accent={t("possession.ctaAccent")} subject="Possession" />
    </div>
  );
}
