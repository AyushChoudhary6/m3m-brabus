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
import { IMG, px } from "../lib/images.js";
import { PROJECT } from "../lib/site.js";
import { useI18n } from "../lib/i18n.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* The partnership, told on its own terms — distinct from the homepage. */
const ETHOS = [
  { k: "01", key: "luxury" },
  { k: "02", key: "performance" },
  { k: "03", key: "exclusivity" },
];

const MEANING = [
  { key: "designLanguage" },
  { key: "measure" },
  { key: "perform" },
  { key: "scarcity" },
];

export default function Brabus() {
  const root = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.from(q(".br-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".br-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".br-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".br-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
        q(".mq").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0, y: 28, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%" },
          });
        });
        gsap.from(q(".mn"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".mn-grid")[0], start: "top 86%" },
        });
        gsap.from(q(".quote-word"), {
          autoAlpha: 0, y: 20, duration: 0.9, ease: "power4.out", stagger: 0.04,
          scrollTrigger: { trigger: q(".quote")[0], start: "top 78%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M x BRABUS | The Branded Residence Partnership, Gurgaon"
        description="How BRABUS — the German luxury automotive marque — shapes M3M Brabus: bespoke interiors, premium finishes and an ethos of luxury, performance and exclusivity."
        path="/brabus"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "BRABUS", path: "/brabus" }])}
      />
      <Breadcrumbs trail={[{ name: t("home.crumbHome"), path: "/" }, { name: "BRABUS", path: "/brabus" }]} />
      <PageHeader
        compact
        eyebrow={t("brabus.eyebrow")}
        title={t("brabus.title")}
        accent={t("brabus.accent")}
        lede={`${PROJECT.developer} ${t("brabus.ledePart1")} ${PROJECT.partner} ${t("brabus.ledePart2")}`}
      />

      {/* wide image */}
      <section className="container-lux pb-[clamp(3rem,9vh,6rem)]">
        <div className="br-img-wrap relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-line">
          <div className="br-img-inner ed-breath absolute inset-0 scale-[1.06]">
            <Media src={px(IMG.facade, 2000)} alt={t("brabus.imgAlt")} priority sizes="100vw" />
          </div>
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
          <span className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
            {t("brabus.inspiredBy")} {PROJECT.partner}
          </span>
        </div>
      </section>

      {/* the ethos */}
      <section className="container-lux py-[clamp(3rem,9vh,6rem)]">
        <div className="border-t border-line">
          {ETHOS.map((m) => (
            <div key={m.key} className="mq group grid gap-4 border-b border-line py-8 md:grid-cols-[1fr_1.3fr] md:gap-10">
              <h2 className="font-display text-2xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-3xl">{t(`brabus.ethos.${m.key}.t`)}</h2>
              <p className="max-w-[46ch] leading-relaxed text-ink-soft">{t(`brabus.ethos.${m.key}.d`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* quote */}
      <section className="quote container-lux py-[clamp(3rem,10vh,7rem)]">
        <blockquote className="mx-auto max-w-[22ch] text-center font-display text-[clamp(1.8rem,5vw,3.6rem)] font-light leading-[1.1] tracking-[-0.02em] text-ink">
          {t("brabus.quoteA").split(" ").map((w, i) => (
            <span key={i} className="quote-word mr-[0.25em] inline-block">{w}</span>
          ))}
          {t("brabus.quoteB").split(" ").map((w, i) => (
            <span key={`b${i}`} className="quote-word mr-[0.25em] inline-block font-serif italic text-brass">{w}</span>
          ))}
        </blockquote>
      </section>

      {/* what a branded residence means */}
      <section className="mn-grid container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {MEANING.map((m) => (
            <article key={m.key} className="mn group border-b border-line py-7">
              <h2 className="font-display text-2xl text-ink transition-colors duration-300 group-hover:text-brass-soft">{t(`brabus.meaning.${m.key}.t`)}</h2>
              <p className="mt-2.5 max-w-[46ch] leading-relaxed text-ink-soft">{t(`brabus.meaning.${m.key}.d`)}</p>
            </article>
          ))}
        </div>
      </section>

      <RelatedPages links={["/residences", "/amenities", "/gallery"]} />
      <CtaBand title={t("brabus.ctaTitle")} accent={t("brabus.ctaAccent")} subject="BRABUS" />
    </div>
  );
}
