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
import { STATS, HIGHLIGHTS, PROJECT } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FACTS = [
  { k: "Developer", v: PROJECT.developer },
  { k: "Inspired by", v: PROJECT.partner },
  { k: "Configurations", v: PROJECT.configs },
  { k: "Residence sizes", v: PROJECT.sizes },
  { k: "Address", v: PROJECT.address },
  { k: "Price", v: PROJECT.price },
  { k: "Possession", v: PROJECT.possession },
  { k: "RERA", v: PROJECT.rera },
];

export default function Overview() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".stats")[0], start: "top 85%" },
        });

        // count-up on the stat figures
        q(".stat-n").forEach((el) => {
          const to = Number(el.dataset.to) || 0;
          const obj = { v: 0 };
          gsap.to(obj, {
            v: to, duration: 1.6, ease: "power3.out",
            onUpdate: () => { el.textContent = Math.round(obj.v); },
            scrollTrigger: { trigger: el, start: "top 90%" },
          });
        });

        q(".hl").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0, y: 30, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%" },
          });
        });

        gsap.from(q(".ov-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".ov-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".ov-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".ov-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Overview | 4 & 5 BHK Branded Residences, Sector 58 Gurgaon"
        description="Everything about M3M Brabus, Sector 58 Gurgaon — 4 & 5 BHK branded residences of approx. 5,000–7,000 sq.ft on Golf Course Extension Road, developed by M3M India and inspired by BRABUS."
        path="/overview"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Overview", path: "/overview" }])}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Overview", path: "/overview" }]} />
      <PageHeader
        compact
        eyebrow="M3M Brabus Overview"
        title="A limited collection,"
        accent="engineered with BRABUS."
        lede={`${PROJECT.configs} of ${PROJECT.sizes} at ${PROJECT.location}, on Golf Course Extension Road — an ultra-low-density address where every home opens on three sides.`}
      />

      {/* stats */}
      <section className="stats container-lux pb-[clamp(3rem,9vh,6rem)]">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-line pt-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rise">
              <p className="font-display text-[clamp(2.6rem,6vw,4.2rem)] font-light leading-none tracking-[-0.03em] text-ink">
                <span className="stat-n" data-to={s.value}>0</span>
                <span className="text-brass">{s.suffix}</span>
              </p>
              <p className="mono mt-3 text-[0.6rem] tracking-[0.2em] text-ink-faint">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* wide image */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="ov-img-wrap relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-line">
          <div className="ov-img-inner ed-breath absolute inset-0 scale-[1.06]">
            <Media src={px(IMG.heroExterior, 2000)} alt="M3M Brabus — the tower" priority sizes="100vw" />
          </div>
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
          <span className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
            The Tower · {PROJECT.location}
          </span>
        </div>
      </section>

      {/* highlights */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">What sets it apart</span>
        </div>
        <div className="grid gap-x-14 gap-y-10 md:grid-cols-2">
          {HIGHLIGHTS.map((h, i) => (
            <article key={h.title} className="hl group border-t border-line pt-6">
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-2xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-3xl">
                {h.title}
              </h3>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-ink-soft">{h.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* key facts */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">Key facts</span>
        </div>
        <dl className="border-t border-line">
          {FACTS.map((f) => (
            <div key={f.k} className="hl grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8">
              <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{f.k}</dt>
              <dd className="text-ink">{f.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedPages links={["/residences", "/price", "/amenities", "/location"]} />
      <CtaBand title="See it" accent="in person." subject="Overview" />
    </div>
  );
}
