import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Check } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Magnetic from "../components/ui/Magnetic.jsx";
import Media from "../components/ui/Media.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT, RESIDENCES } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function BrochurePage() {
  const root = useRef(null);
  const { openBrochure } = useEnquiry();
  const { t } = useI18n();

  /* What the brochure carries. Each row states plainly where a figure is
     unpublished — nothing here quotes a number the official listing doesn't. */
  const CONTENTS = [
    {
      id: "floor",
      t: t("brochure.contentsFloorT"),
      d: `${t("brochure.contentsFloorD1")} ${PROJECT.configs.toLowerCase()} — ${RESIDENCES[0].area} / ${RESIDENCES[1].area} — ${t("brochure.contentsFloorD2")}`,
      n: t("brochure.contentsFloorN"),
    },
    {
      id: "spec",
      t: t("brochure.contentsSpecT"),
      d: t("brochure.contentsSpecD"),
      n: t("brochure.contentsSpecN"),
    },
    {
      id: "amenity",
      t: t("brochure.contentsAmenityT"),
      d: t("brochure.contentsAmenityD"),
      n: t("brochure.contentsAmenityN"),
    },
    {
      id: "location",
      t: t("brochure.contentsLocationT"),
      d: `${PROJECT.address} — ${t("brochure.contentsLocationD")}`,
      n: t("brochure.contentsLocationN"),
    },
    {
      id: "price",
      t: t("brochure.contentsPriceT"),
      d: `${t("brochure.contentsPriceD1")} ${PROJECT.price.toLowerCase()} — ${t("brochure.contentsPriceD2")}`,
      n: PROJECT.price,
    },
    {
      id: "status",
      t: t("brochure.contentsStatusT"),
      d: `${t("brochure.contentsStatusD1")} ${PROJECT.possession.toLowerCase()}. ${PROJECT.rera}. ${t("brochure.contentsStatusD2")}`,
      n: t("brochure.contentsStatusN"),
    },
  ];

  const ASSURANCES = [
    t("brochure.assurance1"),
    t("brochure.assurance2"),
    t("brochure.assurance3"),
  ];

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        gsap.set(q(".br-img"), { clipPath: "inset(100% 0 0 0)" });
        gsap.to(q(".br-img"), {
          clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".br-img")[0], start: "top 84%" },
        });
        gsap.to(q(".br-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".br-img")[0], start: "top bottom", end: "bottom top", scrub: true },
        });

        gsap.from(q(".dl-rise"), {
          autoAlpha: 0, y: 26, duration: 1, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".dl")[0], start: "top 84%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Brochure | Download Floor Plans, Specifications & Price List"
        description="Download the M3M Brabus brochure — 4 & 5 BHK residences of approx. 5,000–7,000 sq.ft at Sector 58, Gurugram. Floor plans, specifications and amenities."
        path="/brochure"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Brochure", path: "/brochure" }])}
      />
      <Breadcrumbs trail={[{ name: t("breadcrumb.home"), path: "/" }, { name: t("breadcrumb.brochure"), path: "/brochure" }]} />
      <PageHeader
        eyebrow={t("brochure.eyebrow")}
        title={t("brochure.title")}
        accent={t("brochure.accent")}
        lede={`${t("brochure.ledeA")} ${PROJECT.name} — ${PROJECT.configs.toLowerCase()} · ${PROJECT.sizes} · ${PROJECT.location}. ${t("brochure.ledeB")}`}
      />

      {/* what's inside */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="border-t border-line">
          {CONTENTS.map((c, i) => (
            <article
              key={c.id}
              className="rise group grid grid-cols-1 gap-2 border-b border-line py-6 transition-colors duration-500 hover:bg-brass/[0.035] sm:grid-cols-[3rem_minmax(0,16rem)_1fr] sm:items-baseline sm:gap-8"
            >
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-2xl">
                {c.t}
              </h2>
              <div>
                <p className="max-w-[54ch] text-sm leading-relaxed text-ink-soft">{c.d}</p>
                <p className="mono mt-2 text-[0.58rem] tracking-[0.2em] text-ink-faint">{c.n}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          {t("brochure.contentsNote")}
        </p>
      </section>

      {/* the download */}
      <section className="dl container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid items-center gap-10 border-t border-line pt-[clamp(3rem,8vh,5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <span className="dl-rise kicker">{t("brochure.downloadKicker")}</span>
            <h2 className="dl-rise mt-4 max-w-[14ch] font-display text-[clamp(2.1rem,5vw,3.6rem)] font-light leading-[1.02] tracking-[-0.02em] text-ink">
              {t("brochure.requestTitleA")}{" "}
              <span className="font-serif italic text-brass">{t("brochure.requestTitleB")}</span>
            </h2>
            <p className="dl-rise mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
              {t("brochure.downloadBody")}
            </p>

            <div className="dl-rise mt-9">
              <Magnetic>
                <button
                  type="button"
                  onClick={() => openBrochure("Brochure page")}
                  data-cursor="DOWNLOAD"
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    {t("brochure.downloadCta")}
                  </span>
                  <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                </button>
              </Magnetic>
            </div>

            <ul className="dl-rise mt-9 border-t border-line">
              {ASSURANCES.map((a) => (
                <li key={a} className="flex items-center gap-3 border-b border-line-soft py-3.5 text-sm text-ink-soft">
                  <Check size={13} strokeWidth={2} className="shrink-0 text-brass" />
                  {a}
                </li>
              ))}
            </ul>

            <p className="dl-rise mono mt-6 text-[0.62rem] leading-relaxed tracking-[0.14em] text-ink-faint">
              {t("brochure.orCall")} {PROJECT.phone} · {PROJECT.email}
            </p>
          </div>

          <figure className="br-img relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="br-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.lobby, 1400)}
                alt={`${PROJECT.name} — ${t("brochure.coverAlt")}`}
                sizes="(max-width:1024px) 100vw, 44vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_52%,rgba(8,6,5,0.7))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              {PROJECT.name} · {PROJECT.location}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* no obligation note */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="border-t border-line pt-8">
          <span className="rise kicker">{t("brochure.noObligationKicker")}</span>
          <p className="rise mt-5 max-w-[62ch] font-serif text-[clamp(1.15rem,2.2vw,1.5rem)] italic leading-relaxed text-ink">
            {t("brochure.noObligationP1")}
          </p>
          <p className="rise mt-5 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
            {t("brochure.noObligationP2A")} {PROJECT.developer} {t("brochure.noObligationP2B")}
          </p>
        </div>
      </section>

      <RelatedPages links={["/residences", "/amenities", "/location", "/contact"]} />
      <CtaBand title={t("brochure.ctaTitle")} accent={t("brochure.ctaAccent")} subject="Brochure" />
    </div>
  );
}
