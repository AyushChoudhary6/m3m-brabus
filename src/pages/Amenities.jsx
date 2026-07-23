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
import { useI18n } from "../lib/i18n.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Distinct from the homepage tour: amenities grouped by how they're used,
   each group with its own plate and index. Copy lives in the i18n layer,
   keyed by group/item slug. */
const GROUPS = [
  {
    k: "01",
    key: "wellness",
    img: IMG.spa,
    items: ["pool", "spa", "gym"],
  },
  {
    k: "02",
    key: "social",
    img: IMG.lobbyWarm,
    items: ["clubhouse", "eventHall", "restaurant"],
  },
  {
    k: "03",
    key: "family",
    img: IMG.pool,
    items: ["gardens", "playArea", "games"],
  },
  {
    k: "04",
    key: "services",
    img: IMG.gym,
    items: ["security", "parking", "rainwater"],
  },
];

export default function Amenities() {
  const root = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        q(".grp").forEach((el) => {
          const wrap = el.querySelector(".grp-img");
          gsap.set(wrap, { clipPath: "inset(100% 0 0 0)" });
          gsap.to(wrap, {
            clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "power3.inOut",
            scrollTrigger: { trigger: el, start: "top 84%" },
          });
          gsap.from(el.querySelectorAll(".grp-rise"), {
            autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.07,
            scrollTrigger: { trigger: el, start: "top 82%" },
          });
          gsap.to(el.querySelector(".grp-img-inner"), {
            yPercent: 8, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Amenities | Clubhouse, Pool, Spa & Gym"
        description="M3M Brabus amenities — grand clubhouse, temperature-controlled pool, spa with sauna and steam, gym, event hall, landscaped gardens and 24/7 security."
        path="/amenities"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Amenities", path: "/amenities" }])}
      />
      <Breadcrumbs trail={[{ name: t("home.crumbHome"), path: "/" }, { name: t("amenitiespage.crumb"), path: "/amenities" }]} />
      <PageHeader
        compact
        eyebrow={t("amenitiespage.eyebrow")}
        title={t("amenitiespage.title")}
        accent={t("amenitiespage.accent")}
        lede={t("amenitiespage.lede")}
      />

      <section className="container-lux pb-[clamp(3rem,9vh,6rem)]">
        {GROUPS.map((g, i) => (
          <article
            key={g.key}
            className={`grp grid items-center gap-10 border-b border-line py-[clamp(3rem,8vh,5rem)] lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 ${i % 2 ? "lg:[&>figure]:order-last" : ""}`}
          >
            <figure className="grp-img relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line">
              <div className="grp-img-inner ed-breath absolute inset-0 scale-[1.06]">
                <Media src={px(g.img, 1400)} alt={`${t(`amenitiespage.group.${g.key}.title`)} — ${t("amenitiespage.imgAlt")}`} priority={i === 0} sizes="(max-width:1024px) 100vw, 46vw" />
              </div>
              <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
              <span className="mono absolute left-5 top-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">{g.k}</span>
            </figure>

            <div>
              <h2 className="grp-rise font-display text-[clamp(1.9rem,4vw,3rem)] font-light leading-[1.02] tracking-[-0.02em] text-ink">
                {t(`amenitiespage.group.${g.key}.title`)}
              </h2>
              <p className="grp-rise mt-3 max-w-[42ch] font-serif text-lg italic text-brass">{t(`amenitiespage.group.${g.key}.lede`)}</p>

              <ul className="mt-7 border-t border-line">
                {g.items.map((it) => (
                  <li key={it} className="grp-rise group flex items-baseline justify-between gap-6 border-b border-line py-4 transition-colors duration-500 hover:bg-brass/[0.035]">
                    <span className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass-soft">{t(`amenitiespage.item.${it}.n`)}</span>
                    <span className="mono shrink-0 text-right text-[0.6rem] tracking-[0.14em] text-ink-faint">{t(`amenitiespage.item.${it}.d`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          {t("amenitiespage.indicativeNote")}
        </p>
      </section>

      <RelatedPages links={["/residences", "/gallery", "/location"]} />
      <CtaBand title={t("amenitiespage.ctaTitle")} accent={t("amenitiespage.ctaAccent")} subject="Amenities" />
    </div>
  );
}
