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

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* The partnership, told on its own terms — distinct from the homepage. */
const ETHOS = [
  { k: "01", t: "Luxury", d: "Bespoke interiors and premium finishes — Italian marble, branded fittings, materials chosen the way a marque chooses its own." },
  { k: "02", t: "Performance", d: "Systems engineered to perform: VRV climate control and smart-home integration, tuned to run quietly and precisely." },
  { k: "03", t: "Exclusivity", d: "An ultra-low-density plan and a limited collection — a villa-like home in a high-rise format, for the few." },
];

const MEANING = [
  { t: "A design language, not a logo", d: "The marque's ethos shapes proportion, material and detail — the residence is designed to its standard, not merely badged with its name." },
  { t: "Finished to a marque's measure", d: "Italian marble, modular kitchens with branded fittings and premium hardware — specified rather than left to the buyer." },
  { t: "Engineered to perform", d: "VRV air conditioning, smart-home integration and energy-efficient systems, so the building behaves as precisely as it looks." },
  { t: "Scarcity by design", d: "Ultra-low density and a limited collection — the value of a branded residence rests on how few there are." },
];

export default function Brabus() {
  const root = useRef(null);

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
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "BRABUS", path: "/brabus" }]} />
      <PageHeader
        compact
        eyebrow="03 · The Partnership"
        title="Not badged."
        accent="Engineered."
        lede={`${PROJECT.developer} presents a branded residence inspired by ${PROJECT.partner} — the German marque whose ethos of luxury, performance and exclusivity shapes every interior.`}
      />

      {/* wide image */}
      <section className="container-lux pb-[clamp(3rem,9vh,6rem)]">
        <div className="br-img-wrap relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-line">
          <div className="br-img-inner ed-breath absolute inset-0 scale-[1.06]">
            <Media src={px(IMG.facade, 2000)} alt="BRABUS-inspired craftsmanship" priority sizes="100vw" />
          </div>
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
          <span className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
            Inspired by {PROJECT.partner}
          </span>
        </div>
      </section>

      {/* the ethos */}
      <section className="container-lux py-[clamp(3rem,9vh,6rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">The ethos</span>
        </div>
        <div className="border-t border-line">
          {ETHOS.map((m) => (
            <div key={m.t} className="mq group grid gap-4 border-b border-line py-8 md:grid-cols-[5rem_1fr_1.3fr] md:gap-10">
              <span className="idx pt-2">{m.k}</span>
              <h3 className="font-display text-2xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-3xl">{m.t}</h3>
              <p className="max-w-[46ch] leading-relaxed text-ink-soft">{m.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* quote */}
      <section className="quote container-lux py-[clamp(3rem,10vh,7rem)]">
        <blockquote className="mx-auto max-w-[22ch] text-center font-display text-[clamp(1.8rem,5vw,3.6rem)] font-light leading-[1.1] tracking-[-0.02em] text-ink">
          {"A residence should be".split(" ").map((w, i) => (
            <span key={i} className="quote-word mr-[0.25em] inline-block">{w}</span>
          ))}
          {"engineered, not decorated.".split(" ").map((w, i) => (
            <span key={`b${i}`} className="quote-word mr-[0.25em] inline-block font-serif italic text-brass">{w}</span>
          ))}
        </blockquote>
      </section>

      {/* what a branded residence means */}
      <section className="mn-grid container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">What a branded residence means</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {MEANING.map((m) => (
            <article key={m.t} className="mn group border-b border-line py-7">
              <h3 className="font-display text-2xl text-ink transition-colors duration-300 group-hover:text-brass-soft">{m.t}</h3>
              <p className="mt-2.5 max-w-[46ch] leading-relaxed text-ink-soft">{m.d}</p>
            </article>
          ))}
        </div>
      </section>

      <RelatedPages links={["/residences", "/amenities", "/gallery"]} />
      <CtaBand title="Own a piece of" accent="the marque." subject="BRABUS" />
    </div>
  );
}
