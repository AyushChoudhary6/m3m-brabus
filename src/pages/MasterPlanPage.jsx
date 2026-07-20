import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Check, Phone } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Fact from "../components/ui/Fact.jsx";
import Media from "../components/ui/Media.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { PROJECT, HIGHLIGHTS } from "../lib/site.js";
import { PROJECT_FACTS, PROJECT_FACT, OFFICIAL_SOURCE, hasValue } from "../lib/facts.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* No site plan is reproduced on this page and none is described.
   M3M has not published a master plan, an acreage, a tower count or an
   open-space figure for Brabus, so the page teaches the buyer to read the
   drawing instead of pretending to show it. The one diagram below is a
   generic planning schematic drawn by hand in SVG — it is labelled as such
   in three places so it can never be mistaken for this project's layout. */

/* What each layer of a master plan is actually telling you. Deliberately
   ordered the way a planner reads the sheet: outward boundary first, built
   form second, movement third, landscape last. */
const READ = [
  {
    t: "Site boundary & north point",
    d: "Every legitimate plan opens with the licensed boundary and a north arrow. The boundary tells you the shape of the land you are buying into and where it abuts a road, a green belt or a neighbouring plot. The north point tells you which faces take the morning sun and which take the harsh western afternoon — the single most consequential line on the sheet, and the one marketing versions most often omit.",
  },
  {
    t: "Tower placement & spacing",
    d: "Look at the gap between one tower and the next, measured in metres, not at the artistic rendering of the gap. Building-to-building distance sets daylight, privacy and acoustic separation. Two towers placed face to face at close range will overlook one another regardless of how the balconies are drawn; the same two towers staggered or turned even slightly will not.",
  },
  {
    t: "Podium versus ground-level parking",
    d: "A podium lifts the residential deck above the cars and buys you a landscaped platform at first-floor level. Ground-level or basement parking keeps the deck at grade and usually reads as more generous underfoot. Neither is better in the abstract — but the plan should say clearly which one you are getting, how the ramps enter, and where the visitor bays sit relative to the front door.",
  },
  {
    t: "Club & amenity positioning",
    d: "A clubhouse in the geometric centre serves everyone equally and disturbs no one particularly; a clubhouse tucked hard against one tower serves that tower and inconveniences it in the same breath. Check the pool deck against the tower shadow line, and check where the event hall discharges its guests at midnight.",
  },
  {
    t: "Service, refuse & fire routes",
    d: "The unglamorous lines matter most. Where does the refuse vehicle turn? Where is the service entry, the DG yard, the STP, the transformer bay? A well-planned estate separates service movement from resident movement entirely. Fire tender access must ring the towers at the widths the code requires, and those widths cannot be landscaped away later.",
  },
  {
    t: "Soft landscape versus hard paving",
    d: "Open space and green space are not the same thing. A driveway is open space. Ask which portion of the declared open area is planted ground, which is paved circulation, and which is podium slab counted as landscape. The distinction changes how the estate feels at eye level far more than the headline percentage does.",
  },
  {
    t: "Phasing & what gets built when",
    d: "Where a plan is delivered in phases, the drawing should show the sequence. It determines which residents live beside a construction hoarding, for how long, and when the amenities they paid for actually open. A phase boundary drawn faintly is still a phase boundary.",
  },
];

/* Verification list — deliberately about the DRAWING, not about the
   paperwork generally (that lives on /rera, and repeating it here would
   cannibalise it). */
const VERIFY = [
  "The sheet carries a drawing number, a revision number and a date. A plan with no revision history is a brochure, not a document.",
  "A stated scale and a scale bar, so distances can be measured rather than estimated by eye.",
  "The north point, and the sanctioning authority’s stamp or approval endorsement on the same sheet.",
  "Setbacks from every boundary, and the clear distance between each pair of towers, dimensioned in metres.",
  "The number of towers and the floor count of each, matching what the sales presentation shows you.",
  "Total parking bays, split between resident and visitor, with the ramp positions marked.",
  "The location of the clubhouse, pool, play area and event hall — measured against the tower you are being sold in.",
  "Service yard, DG set, STP, transformer and refuse-collection points, and their distance from the nearest residence.",
  "Fire tender access routes and turning radii around every tower.",
  "Any land within the boundary reserved for a future phase, a community site or a statutory obligation.",
  "The declared open-space area, with soft landscape distinguished from paved circulation and podium deck.",
  "That the layout on the sanctioned plan is the layout attached to your agreement — sheet number quoted in the schedule.",
];

/* HIGHLIGHTS is the source for the open-core language; we quote it rather
   than restate it so the claim on this page never drifts from the homepage. */
const OPEN_CORE = HIGHLIGHTS.find((h) => h.title === "Open-Core Architecture");
const LOW_DENSITY = HIGHLIGHTS.find((h) => h.title === "Ultra-Low Density");

/* Split the facts layer into what the listing publishes and what it does
   not, so the page can be honest about the ratio in plain sight. */
const CONFIRMED = PROJECT_FACTS.filter(hasValue);
const PLAN_UNKNOWNS = ["landArea", "towers", "floors", "openSpace"]
  .map((k) => PROJECT_FACT[k])
  .filter(Boolean);

export default function MasterPlanPage() {
  const root = useRef(null);
  const { openEnquiry } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        gsap.from(q(".read-row"), {
          autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".read")[0], start: "top 86%" },
        });

        gsap.from(q(".fact-cell"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: q(".facts")[0], start: "top 86%" },
        });

        gsap.from(q(".core-rise"), {
          autoAlpha: 0, y: 22, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".core")[0], start: "top 86%" },
        });

        gsap.from(q(".ver-row"), {
          autoAlpha: 0, y: 16, duration: 0.65, ease: "power3.out", stagger: 0.04,
          scrollTrigger: { trigger: q(".verify")[0], start: "top 85%" },
        });

        /* the schematic assembles layer by layer — reinforces that it is a
           drawing being built up, not a photograph of anything */
        gsap.from(q(".dg-stroke"), {
          autoAlpha: 0, duration: 0.9, ease: "power2.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".dg")[0], start: "top 84%" },
        });

        gsap.from(q(".mp-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".mp-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".mp-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".mp-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="bg-canvas">
      <Seo
        title="M3M Brabus Master Plan | Site Layout, Orientation & Spacing, Sector 58 Gurgaon"
        description="M3M Brabus master plan — the site layout is not publicly released. How to read a master plan, what is confirmed at Sector 58, and how to request it."
        path="/master-plan"
        jsonLd={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Master Plan", path: "/master-plan" },
        ])}
      />
      <Breadcrumbs
        trail={[{ name: "Home", path: "/" }, { name: "Master Plan", path: "/master-plan" }]}
      />
      <PageHeader
        compact
        eyebrow="M3M Brabus Master Plan"
        title="The drawing that decides"
        accent="everything after it."
        lede={`${PROJECT.developer} has not released a site layout for ${PROJECT.name}. Rather than publish an invented one, this page teaches you to read the real thing — and gets you the document itself the moment it can be shared.`}
      />

      {/* how to read the sheet */}
      <section className="read container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">Reading a master plan</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="rise max-w-[52ch] leading-relaxed text-ink-soft">
              A master plan is the only drawing that describes the thing you cannot change after
              possession. A kitchen can be refitted and a wall can be moved; the distance between
              your window and the tower opposite is fixed the day the layout is sanctioned. It is
              also the drawing buyers spend the least time with, because it is the least
              photogenic — a floor plan shows a home, a render shows a mood, and a master plan
              shows geometry.
            </p>
            <p className="rise mt-5 max-w-[52ch] leading-relaxed text-ink-soft">
              Learn to read it and the rest of the sales conversation changes. You stop asking how
              many amenities there are and start asking where they sit. You stop accepting
              &ldquo;three sides open&rdquo; as a specification and start checking whether the
              spacing makes it true. Seven layers are worth your attention, in this order.
            </p>
          </div>

          {/* Hand-drawn schematic. Abstract on purpose: no dimensions, no
              tower count, nothing that could be read as this project. */}
          <figure className="dg rise self-start">
            <div className="overflow-x-auto rounded-[1.25rem] border border-line bg-paper">
              <svg
                viewBox="0 0 640 400"
                className="h-auto w-full min-w-[420px]"
                role="img"
                aria-label="Schematic diagram illustrating general master-plan principles: a site boundary with a north point, staggered tower footprints with spacing between them, a central amenity core, and a separated service route. Not the site plan of this project."
              >
                {/* site boundary */}
                <rect
                  className="dg-stroke" x="40" y="40" width="560" height="320" rx="10"
                  fill="none" stroke="#c9a86a" strokeOpacity="0.5" strokeWidth="1.2"
                  strokeDasharray="7 6"
                />
                <text x="52" y="30" fill="#6f6551" fontSize="11" letterSpacing="2.4" fontFamily="ui-monospace, monospace">
                  SITE BOUNDARY
                </text>

                {/* north point */}
                <g className="dg-stroke" stroke="#c9a86a" strokeWidth="1.1" fill="none">
                  <circle cx="560" cy="88" r="20" strokeOpacity="0.45" />
                  <path d="M560 74 L565 96 L560 91 L555 96 Z" fill="#c9a86a" stroke="none" />
                </g>
                <text x="553" y="120" fill="#c9a86a" fontSize="11" fontFamily="ui-monospace, monospace">N</text>

                {/* sun path, east to west across the south face */}
                <path
                  className="dg-stroke"
                  d="M70 300 Q320 190 570 300"
                  fill="none" stroke="#a99d86" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 7"
                />
                <text x="62" y="322" fill="#6f6551" fontSize="10" fontFamily="ui-monospace, monospace">E</text>
                <text x="566" y="322" fill="#6f6551" fontSize="10" fontFamily="ui-monospace, monospace">W</text>

                {/* staggered tower footprints */}
                <g className="dg-stroke" fill="#c9a86a" fillOpacity="0.09" stroke="#c9a86a" strokeOpacity="0.7" strokeWidth="1.2">
                  <rect x="92" y="104" width="94" height="66" rx="4" />
                  <rect x="272" y="82" width="94" height="66" rx="4" />
                  <rect x="452" y="112" width="94" height="66" rx="4" />
                </g>

                {/* spacing dimension between two footprints */}
                <g className="dg-stroke" stroke="#a99d86" strokeOpacity="0.6" strokeWidth="0.9">
                  <line x1="186" y1="137" x2="272" y2="137" />
                  <line x1="186" y1="129" x2="186" y2="145" />
                  <line x1="272" y1="129" x2="272" y2="145" />
                </g>
                <text x="196" y="124" fill="#6f6551" fontSize="10" letterSpacing="1.6" fontFamily="ui-monospace, monospace">
                  SPACING
                </text>

                {/* central amenity core */}
                <circle
                  className="dg-stroke" cx="320" cy="252" r="46"
                  fill="#c9a86a" fillOpacity="0.07" stroke="#c9a86a" strokeOpacity="0.55" strokeWidth="1.1"
                />
                <text x="291" y="256" fill="#c9a86a" fontSize="10" letterSpacing="1.4" fontFamily="ui-monospace, monospace">
                  CORE
                </text>

                {/* resident loop, drawn clear of the service spur */}
                <path
                  className="dg-stroke"
                  d="M139 190 Q200 246 274 252 M366 252 Q440 246 499 196"
                  fill="none" stroke="#a99d86" strokeOpacity="0.5" strokeWidth="1"
                />

                {/* separated service route hugging the boundary */}
                <path
                  className="dg-stroke"
                  d="M40 344 L600 344"
                  fill="none" stroke="#8c2f1d" strokeOpacity="0.75" strokeWidth="1.1" strokeDasharray="5 5"
                />
                <text x="46" y="360" fill="#6f6551" fontSize="10" letterSpacing="1.6" fontFamily="ui-monospace, monospace">
                  SERVICE ROUTE — KEPT SEPARATE
                </text>
              </svg>
            </div>
            <figcaption className="mono mt-4 text-[0.56rem] leading-relaxed tracking-[0.16em] text-ink-faint">
              Illustrative schematic of planning principles only — orientation, spacing, a central
              amenity core and segregated service movement. It is not the site plan of{" "}
              {PROJECT.name}, is not to scale, and implies no tower count, no land area and no
              layout.
            </figcaption>
          </figure>
        </div>

        <dl className="mt-[clamp(2.5rem,7vh,4.5rem)] border-t border-line">
          {READ.map((r, i) => (
            <div
              key={r.t}
              className="read-row grid grid-cols-1 gap-2 border-b border-line py-6 lg:grid-cols-[minmax(0,3rem)_minmax(0,17rem)_1fr] lg:gap-8"
            >
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <dt className="font-display text-xl leading-snug text-ink">{r.t}</dt>
              <dd className="max-w-[64ch] text-sm leading-relaxed text-ink-soft">{r.d}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* the facts layer, stated as-is */}
      <section className="facts container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">What we can confirm</span>
        </div>
        <p className="mb-10 max-w-[58ch] leading-relaxed text-ink-soft">
          Below is the entire published position, taken from the official listing and nothing else.
          Where a figure appears, it is on record. Where it does not, you will find a request button
          instead of a number — the four site-planning figures a master plan would normally settle
          are exactly the four that are not out yet.
        </p>

        <div className="grid gap-x-14 gap-y-9 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {CONFIRMED.map((f) => (
            <Fact key={f.key} fact={f} className="fact-cell" />
          ))}
        </div>

        <p className="mono mt-[clamp(2.5rem,6vh,3.5rem)] text-[0.6rem] tracking-[0.2em] text-brass">
          Not published — available on request
        </p>
        <div className="mt-6 grid gap-x-14 gap-y-9 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_UNKNOWNS.map((f) => (
            <Fact key={f.key} fact={f} className="fact-cell" />
          ))}
        </div>

        <p className="mt-8 max-w-[62ch] text-sm leading-relaxed text-ink-faint">
          We do not estimate these. A land area guessed from a satellite image and a tower count
          inferred from a render are how buyers end up comparing two projects on numbers neither
          developer ever wrote down.{" "}
          <a
            href={OFFICIAL_SOURCE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:text-brass-soft"
          >
            Check the official listing
          </a>{" "}
          and you will find the same silence we are reporting.
        </p>
      </section>

      {/* the gated document */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid items-stretch gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-11">
            <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
            <div className="relative">
              <p className="rise kicker">Master plan request</p>
              <h2 className="rise mt-4 max-w-[18ch] font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                Ask for the layout{" "}
                <span className="font-serif italic text-brass">as it is sanctioned.</span>
              </h2>
              <p className="rise mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
                Register once and the private client team will send the master plan, the tower
                positions, the parking arrangement and the amenity locations as soon as{" "}
                {PROJECT.developer} authorises their release — with the approval status stated
                honestly for each, and no marketing overlay added on top.
              </p>

              <div className="rise mt-9 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => openEnquiry("Master plan")}
                  data-cursor="OPEN"
                  aria-label="Request the M3M Brabus master plan"
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    Request the master plan
                  </span>
                  <ArrowUpRight
                    size={15}
                    className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian"
                  />
                </button>
                <a
                  href={`tel:${PROJECT.phone}`}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  <Phone size={13} className="text-brass" />
                  {PROJECT.phone}
                </a>
              </div>

              <p className="rise mono mt-8 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
                No indicative layouts are circulated · Sanctioned drawings only
              </p>
            </div>
          </div>

          <figure className="mp-img-wrap relative min-h-[18rem] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="mp-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.arrival, 1400)}
                alt={`${PROJECT.name} — the arrival court`}
                sizes="(max-width:1024px) 100vw, 42vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_52%,rgba(8,6,5,0.68))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              Arrival · {PROJECT.location}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* the open-core claim, tested against planning */}
      <section className="core container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">Where the plan meets the promise</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <h2 className="core-rise max-w-[16ch] font-display text-[clamp(1.9rem,4vw,3rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink">
              Three sides open is a{" "}
              <span className="font-serif italic text-brass">planning outcome,</span> not a finish.
            </h2>
            {OPEN_CORE && (
              <blockquote className="core-rise mt-7 border-l border-brass/40 pl-6">
                <p className="max-w-[44ch] font-serif text-lg italic leading-relaxed text-ink-soft">
                  {OPEN_CORE.body}
                </p>
                <footer className="mono mt-3 text-[0.56rem] tracking-[0.2em] text-ink-faint">
                  {OPEN_CORE.title} · as published
                </footer>
              </blockquote>
            )}
          </div>

          <div className="space-y-6">
            <p className="core-rise max-w-[56ch] leading-relaxed text-ink-soft">
              An open-core layout puts the circulation core in the middle and pushes habitable rooms
              to the perimeter, so each residence presents three faces to the outside. That is a
              decision made in the floor plate. Whether it delivers anything is decided one level
              up, on the master plan.
            </p>
            <p className="core-rise max-w-[56ch] leading-relaxed text-ink-soft">
              Three open sides looking at a boundary wall eleven metres away are three open sides in
              name only. The same three faces with generous building-to-building distance, a
              stagger between towers so no two living rooms align, and a long axis turned away from
              the western sun deliver light in the morning, cross-ventilation through the day and
              privacy at night. The specification is identical in both cases. The experience is not.
            </p>
            <p className="core-rise max-w-[56ch] leading-relaxed text-ink-soft">
              So when you receive the layout, test the claim in four moves: measure the clear gap
              between towers; check whether opposite faces are staggered or aligned; find which
              elevation carries the afternoon sun; and trace what each of the three faces actually
              looks on to — landscape, a driveway, a service yard, or the neighbouring tower.
            </p>
            {LOW_DENSITY && (
              <p className="core-rise max-w-[56ch] leading-relaxed text-ink-soft">
                The same test applies to density. {LOW_DENSITY.body} Low density is a ratio of homes
                to land, so it can only be confirmed once both the number of residences and the land
                area are on the table — which is precisely why both sit behind a request above
                rather than a figure we made up.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* sanctioned vs marketing */}
      <section className="verify container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">Sanctioned plan versus marketing plan</span>
        </div>

        <div className="mb-10 grid gap-8 md:grid-cols-2 md:gap-14">
          <div className="rounded-[1.25rem] border border-line bg-paper p-7">
            <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">The marketing plan</p>
            <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-ink-soft">
              Drawn to sell. Trees are mature, cars are absent, the pool is turquoise and the
              service yard has quietly disappeared. It is usually accurate in outline and silent in
              detail — and it carries no drawing number, no scale and no approval stamp, because it
              was never meant to.
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-brass/25 bg-paper p-7">
            <p className="mono text-[0.58rem] tracking-[0.2em] text-brass">The sanctioned plan</p>
            <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-ink-soft">
              Drawn to be approved, and binding once it is. Dimensioned, scaled, stamped, numbered
              and revised. Where the two differ, this is the one that will be built — and the one
              your agreement should reference by sheet number.
            </p>
          </div>
        </div>

        <p className="mb-8 max-w-[58ch] leading-relaxed text-ink-soft">
          Ask for both, place them side by side, and work down this list. It concerns the drawing
          itself; the wider approvals file — licence, title, registration — is a separate exercise
          set out on the RERA page.
        </p>

        <ul className="border-t border-line">
          {VERIFY.map((v) => (
            <li
              key={v}
              className="ver-row flex items-start gap-4 border-b border-line py-4 text-ink-soft"
            >
              <Check size={13} strokeWidth={2} className="mt-1.5 shrink-0 text-brass" aria-hidden="true" />
              <span className="max-w-[72ch] leading-relaxed">{v}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
          If a line on this list cannot be answered from the drawing in front of you, the honest
          conclusion is that the drawing is not final yet — not that the answer is bad. Ask again
          later, in writing, and keep the version you were shown.
        </p>
      </section>

      <RelatedPages links={["/overview", "/floor-plan", "/rera", "/amenities"]} />
      <CtaBand title="Request the" accent="master plan." subject="Master plan" />
    </div>
  );
}
