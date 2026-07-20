import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import ProjectHighlights from "../components/sections/ProjectHighlights.jsx";
import Media from "../components/ui/Media.jsx";
import { HIGHLIGHTS, PROJECT } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Overview() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".br-rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".brief")[0], start: "top 82%" },
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
        description="M3M Brabus overview, Sector 58 Gurgaon — 4 & 5 BHK branded residences of approx. 5,000–7,000 sq.ft on Golf Course Extension Road by M3M India."
        path="/overview"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Overview", path: "/overview" }])}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Overview", path: "/overview" }]} />
      <PageHeader
        compact
        eyebrow="M3M Brabus Overview"
        title="A limited collection,"
        accent="engineered with BRABUS."
        lede={`${PROJECT.configs} of ${PROJECT.sizes} at ${PROJECT.location}, on Golf Course Extension Road. What follows is the case for the project — and the record of what ${PROJECT.developer} has published about it, and what it has not.`}
      />

      {/* The count-up stats band that stood here restated the sector, the largest
          size and the three-side plan, all of which the header, 02 and the key-facts
          grid now carry once and properly. Its one unshared claim — security and
          concierge without office hours — moved into the brief below. */}

      {/* wide image */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="ov-img-wrap relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-line">
          <div className="ov-img-inner ed-breath absolute inset-0 scale-[1.06]">
            <Media src={px(IMG.heroExterior, 2000)} alt="M3M Brabus — the tower" priority sizes="100vw" />
          </div>
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
          <span className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
            The Tower
          </span>
        </div>
      </section>

      {/* the argument — what the project is, and who it is written for.
          Deliberately silent on configuration, size and location: the header
          states those once and the key-facts grid holds them on the record.
          The three-side plan and the density belong to 02, which explains
          them rather than merely asserting them again. */}
      <section className="brief container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="br-rise mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">The project, in brief</span>
        </div>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <h2 className="br-rise max-w-[14ch] font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-light leading-[1.06] tracking-[-0.02em] text-ink">
            A branded residence, <span className="font-serif italic text-brass">in the truest sense.</span>
          </h2>
          <div>
            <p className="br-rise max-w-[54ch] leading-relaxed text-ink-soft">
              {PROJECT.name} is developed by {PROJECT.developer} and shaped by the ethos of
              {" "}{PROJECT.partner} — the German marque that built its name rebuilding finished motor
              cars to a specification the factory never offered. The influence is meant to be felt in
              the specification rather than read off a badge: bespoke, obsessive, made once.
            </p>
            <p className="br-rise mt-5 max-w-[54ch] leading-relaxed text-ink-soft">
              It is written for a narrow readership — families who already own well and are buying a
              last address rather than a next one, and principals who want the home to read the way
              the car in the porch does. Consider it if you value provenance over frontage: an
              {" "}{PROJECT.developer} address, a global marque's discipline carried into the
              interiors, a floor plate large enough to live at villa scale without leaving the
              skyline, and security and concierge that keep no office hours.
            </p>
          </div>
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

      {/* Key facts. The flat definition list this replaces printed "Coming soon"
          and "on request" as dead ends; the grid renders the same unpublished
          figures through Fact, where each one becomes an enquiry instead. */}
      <ProjectHighlights />

      <RelatedPages links={["/residences", "/price", "/amenities", "/location"]} />
      <CtaBand title="See it" accent="in person." subject="Overview" />
    </div>
  );
}
