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
import { PROJECT, RESIDENCES, FAQS } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Reading guide — the vocabulary a buyer needs before the plan makes sense. */
const HOW_TO_READ = [
  {
    t: "Start at the entrance",
    d: "Every plan is drawn from the point of arrival. Find the foyer first, then read outward — public rooms on one side, private rooms on the other.",
  },
  {
    t: "Follow the public-to-private line",
    d: "Living, dining and kitchen sit together so guests never cross the bedroom wing. The further you move from the foyer, the more private the room.",
  },
  {
    t: "Read the outer edge",
    d: "The long outer wall is where the light comes from. Balconies and the widest glazing are drawn along it — that edge decides how the home feels at 8 a.m. and at 6 p.m.",
  },
  {
    t: "Treat areas as indicative",
    d: "Room areas shown on the interactive plan are indicative and rounded for reading. Dimensioned drawings with carpet, built-up and balcony areas are issued separately.",
  },
];

/* Plain-language explanation of the architecture, not marketing adjectives. */
const OPEN_CORE = [
  {
    t: "Three sides meet outside air",
    d: "In a conventional high-rise, homes share walls on two or three sides and daylight arrives from one direction only. Here the plan is arranged around a central core, so each residence has three exposed faces.",
  },
  {
    t: "Light reaches deeper into the plan",
    d: "With openings on three faces, daylight arrives from more than one direction through the day — rooms in the middle of the plan are lit rather than borrowed-lit from a corridor.",
  },
  {
    t: "Air can cross the home",
    d: "Cross-ventilation needs an inlet and an outlet on different faces. Three open sides make that possible in most rooms, so the home can be aired without relying on mechanical systems.",
  },
  {
    t: "Fewer shared walls",
    d: "Ultra-low density and an open core mean fewer neighbouring walls per home — which is as much an acoustic decision as an architectural one.",
  },
];

/* 4 vs 5 BHK, described in how the plan behaves rather than in numbers. */
const DIFFERENCE = [
  {
    k: "Overall footprint",
    a: "≈ 5,000 sq.ft",
    b: "≈ 7,000 sq.ft",
    note: "Roughly two thousand square feet separates the two — most of it goes into the private wing and the extra reception rooms.",
  },
  {
    k: "Bedrooms",
    a: "Four",
    b: "Five",
    note: "The fifth bedroom in the larger plan is drawn as a full suite, not a converted study.",
  },
  {
    k: "Reception rooms",
    a: "Living and dining, read as one volume",
    b: "Living and dining plus a separate family lounge",
    note: "The 5 BHK separates the room you entertain in from the room the household actually lives in.",
  },
  {
    k: "Working / quiet room",
    a: "Not drawn as a separate room",
    b: "Dedicated study",
    note: "If a permanent home office matters, the larger plan gives it a door of its own.",
  },
  {
    k: "Arrival",
    a: "Private lift lobby",
    b: "Private foyer and lift lobby",
    note: "Both arrive privately; the larger plan adds a foyer between the lift and the living room.",
  },
  {
    k: "Suits",
    a: "A family that wants scale without surplus rooms",
    b: "A multi-generational household, or one that entertains often",
    note: "",
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
        title="M3M Brabus Floor Plan | Interactive 4 & 5 BHK Layouts, Sector 58 Gurgaon"
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
        eyebrow="M3M Brabus Floor Plans"
        title="The plan, before"
        accent="the persuasion."
        lede={`${PROJECT.configs} of ${PROJECT.sizes} at ${PROJECT.location}. Move through both layouts room by room below — then read what the drawing is actually telling you.`}
      />

      {/* how to read the plans */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">How to read these plans</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {HOW_TO_READ.map((h, i) => (
            <div key={h.t} className="rise group border-b border-line py-6">
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-3 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-2xl">
                {h.t}
              </h2>
              <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-ink-soft">{h.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* the interactive plans — the centrepiece */}
      <FloorPlan />

      {/* open-core, explained */}
      <section className="container-lux py-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">What "three sides open" actually means</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <h2 className="rise-b max-w-[18ch] font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
              An open core, in <span className="font-serif italic text-brass">plain language.</span>
            </h2>
            <p className="rise-b mt-6 max-w-[52ch] leading-relaxed text-ink-soft">
              Open-core architecture is a planning decision, not a finish. The services and circulation are
              pulled into the centre of the floor plate so the living spaces can sit on the perimeter — which is
              why every residence here opens on three sides rather than one.
            </p>
            <dl className="mt-8 border-t border-line">
              {OPEN_CORE.map((o) => (
                <div key={o.t} className="rise-b border-b border-line py-5">
                  <dt className="font-display text-lg text-ink">{o.t}</dt>
                  <dd className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-soft">{o.d}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="fp-img-wrap relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="fp-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.livingRoom, 1400)}
                alt="Daylight across a living space — indicative interior"
                sizes="(max-width:1024px) 100vw, 44vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              Daylight on three faces · indicative interior
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 4 vs 5 BHK in plain language */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">4 BHK or 5 BHK — the honest difference</span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[0.9fr_1fr_1fr] gap-6 border-b border-line pb-4">
              <span className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">In the plan</span>
              {RESIDENCES.map((r) => (
                <span key={r.id} className="font-display text-lg text-ink">
                  {r.name.replace(" Residence", "")}
                  <span className="mono ml-2 text-[0.58rem] tracking-[0.16em] text-ink-faint">{r.area}</span>
                </span>
              ))}
            </div>
            {DIFFERENCE.map((d) => (
              <div key={d.k} className="rise-b border-b border-line-soft py-5">
                <div className="grid grid-cols-[0.9fr_1fr_1fr] items-baseline gap-6">
                  <span className="mono text-[0.62rem] tracking-[0.14em] text-ink-faint">{d.k}</span>
                  <span className="text-sm text-ink">{d.a}</span>
                  <span className="text-sm text-ink">{d.b}</span>
                </div>
                {d.note && (
                  <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-soft">{d.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Layouts are indicative and subject to the final approved plan
        </p>
      </section>

      {/* what is drawn, what is issued on request */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">Dimensioned drawings, on request</span>
        </div>
        <div className="grid gap-10 border-t border-line pt-8 lg:grid-cols-2 lg:gap-16">
          <p className="rise-b max-w-[52ch] leading-relaxed text-ink-soft">
            The plans above are drawn to communicate arrangement — how the rooms relate, where the light enters,
            how the private wing separates from the public one. They are indicative and not to scale. The
            measured set — dimensioned room sizes, carpet and built-up areas, unit variants by floor and the
            master site plan — is issued privately to registered enquiries.
          </p>
          <dl className="border-t border-line lg:border-t-0">
            {[
              { k: "Configurations", v: PROJECT.configs },
              { k: "Residence sizes", v: PROJECT.sizes },
              { k: "Orientation", v: "Open on three sides · open-core plan" },
              { k: "Dimensioned drawings", v: "Shared on request" },
              { k: "Price", v: PROJECT.price },
              { k: "Possession", v: PROJECT.possession },
              { k: "RERA", v: PROJECT.rera },
            ].map((f) => (
              <div
                key={f.k}
                className="rise-b grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-8"
              >
                <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{f.k}</dt>
                <dd className="text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Figures the developer has not published are marked as such — never estimated
        </p>
      </section>

      {/* plan questions */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">05</span>
          <span className="kicker">Plan questions</span>
        </div>
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

      <CtaBand title="Request the dimensioned" accent="drawings." subject="Floor Plan" />
    </div>
  );
}
