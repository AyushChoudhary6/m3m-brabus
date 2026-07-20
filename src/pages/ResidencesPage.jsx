import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { RESIDENCES, PROJECT } from "../lib/site.js";
import { px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Distinct from the homepage: alternating full-width residence rows, a
   side-by-side comparison, and the specification schedule. */
const COMPARE = [
  { k: "Residence size", a: "≈ 5,000 sq.ft", b: "≈ 7,000 sq.ft" },
  { k: "Bedrooms", a: "Four", b: "Five" },
  { k: "Orientation", a: "Open on three sides", b: "Open on three sides" },
  { k: "Character", a: "A sanctuary in the sky", b: "Villa-scale living" },
  { k: "Arrival", a: "Private lift lobby", b: "Private foyer & lift lobby" },
  { k: "Flooring", a: "Italian marble", b: "Italian marble" },
  { k: "Climate", a: "VRV air conditioning", b: "VRV air conditioning" },
  { k: "Automation", a: "Smart-home ready", b: "Smart-home integration" },
];

const SPEC_SCHEDULE = [
  { t: "Flooring", d: "Italian marble to the living and dining areas, with premium finishes carried through the home." },
  { t: "Kitchen", d: "Modular kitchen fitted with branded appliances and hardware." },
  { t: "Climate", d: "VRV air conditioning throughout, zoned for quiet, even comfort." },
  { t: "Automation", d: "Smart-home integration for lighting, climate and security." },
  { t: "Structure", d: "Open-core architecture — each residence opens on three sides for daylight and cross-ventilation." },
  { t: "Arrival", d: "Private lift lobby serving the residence, with dedicated covered parking." },
  { t: "Safety", d: "24/7 manned security with CCTV surveillance across the address." },
  { t: "Sustainability", d: "Rainwater harvesting and energy-efficient building systems." },
];

export default function ResidencesPage() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        q(".res-row").forEach((el) => {
          const wrap = el.querySelector(".rr-img");
          gsap.set(wrap, { clipPath: "inset(100% 0 0 0)" });
          gsap.to(wrap, {
            clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power3.inOut",
            scrollTrigger: { trigger: el, start: "top 82%" },
          });
          gsap.from(el.querySelectorAll(".rr-rise"), {
            autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 80%" },
          });
          gsap.to(el.querySelector(".rr-img-inner"), {
            yPercent: 8, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
        gsap.from(q(".cmp-row"), {
          autoAlpha: 0, y: 18, duration: 0.7, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: q(".cmp")[0], start: "top 85%" },
        });
        gsap.from(q(".spec"), {
          autoAlpha: 0, y: 22, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".spec-grid")[0], start: "top 86%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Floor Plans & Residences | 4 & 5 BHK, 5,000–7,000 sq.ft"
        description="M3M Brabus 4 BHK (~5,000 sq.ft) and 5 BHK (~7,000 sq.ft) branded residences — layouts, Italian marble, VRV climate control and the specification schedule."
        path="/residences"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Residences", path: "/residences" }])}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Residences", path: "/residences" }]} />
      <PageHeader
        compact
        eyebrow="M3M Brabus Residences · 4 & 5 BHK"
        title="Open on three sides."
        accent="A collection for the few."
        lede={`${PROJECT.configs} of ${PROJECT.sizes}, each opening on three sides with a private lift lobby — composed so light, air and silence arrive before you do.`}
      />

      {/* alternating residence rows */}
      <section className="container-lux pb-[clamp(3rem,9vh,6rem)]">
        {RESIDENCES.map((r, i) => (
          <article
            key={r.id}
            className={`res-row grid items-center gap-10 border-b border-line py-[clamp(3rem,8vh,5rem)] lg:grid-cols-2 lg:gap-16 ${i % 2 ? "lg:[&>figure]:order-last" : ""}`}
          >
            <figure className="rr-img relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line">
              <div className="rr-img-inner ed-breath absolute inset-0 scale-[1.06]">
                <Media src={px(r.image, 1600)} alt={`${r.name} — interior`} priority={i === 0} sizes="(max-width:1024px) 100vw, 48vw" />
              </div>
              <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_58%,rgba(8,6,5,0.6))]" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            </figure>

            <div>
              <span className="rr-rise kicker">{r.tag}</span>
              <h2 className="rr-rise mt-3 font-display text-[clamp(2rem,4.4vw,3.4rem)] font-light leading-[1.02] tracking-[-0.02em] text-ink">
                {r.name}
              </h2>
              <p className="rr-rise mt-3 font-serif text-lg italic text-brass">{r.subtitle}</p>

              <dl className="rr-rise mt-7 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-line pt-6">
                <div>
                  <dt className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">Size</dt>
                  <dd className="mt-1 font-display text-lg text-ink">{r.area}</dd>
                </div>
                <div>
                  <dt className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">Orientation</dt>
                  <dd className="mt-1 text-sm leading-snug text-ink-soft">{r.facing}</dd>
                </div>
              </dl>

              <ul className="rr-rise mt-6 grid gap-y-2.5 sm:grid-cols-2 sm:gap-x-8">
                {r.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <Check size={13} strokeWidth={2} className="shrink-0 text-brass" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      {/* comparison */}
      <section className="cmp container-lux py-[clamp(3rem,9vh,6rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">Side by side</span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-6 border-b border-line pb-4">
              <span className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">Specification</span>
              <span className="font-display text-lg text-ink">4 BHK</span>
              <span className="font-display text-lg text-ink">5 BHK</span>
            </div>
            {COMPARE.map((c) => (
              <div key={c.k} className="cmp-row grid grid-cols-[1.2fr_1fr_1fr] items-baseline gap-6 border-b border-line-soft py-4">
                <span className="mono text-[0.62rem] tracking-[0.14em] text-ink-faint">{c.k}</span>
                <span className="text-sm text-ink">{c.a}</span>
                <span className="text-sm text-ink">{c.b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* specification schedule */}
      <section className="spec-grid container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">Specification schedule</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {SPEC_SCHEDULE.map((s) => (
            <div key={s.t} className="spec group border-b border-line py-6">
              <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">{s.t}</h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Specifications are indicative and subject to the final approved plan
        </p>
      </section>

      <RelatedPages links={["/floor-plan", "/price", "/brochure", "/amenities"]} />
      <CtaBand title="Request the" accent="floor plans." subject="Residences" />
    </div>
  );
}
