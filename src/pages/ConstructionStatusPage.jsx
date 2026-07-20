import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Camera, ImageOff, Phone } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { PROJECT } from "../lib/site.js";
import { track } from "../lib/analytics.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* We hold no verified construction photography and no progress data for this
   project. A percentage complete, a floors-cast figure or a milestone date
   would be a fabricated record, not a marketing flourish — so this page
   carries none. What it carries instead is the method: how a buyer obtains
   and reads the real progress position for themselves.

   /possession answers "when do I get the keys". This page answers "what has
   actually been built, and how would I know". Keep the two distinct. */

/** Single point of truth for the review date — update this line only. */
export const LAST_REVIEWED = "20 July 2026";

const POSITION = [
  {
    k: "Verified progress data",
    v: "None held",
    n: "No stage, percentage or floors-cast figure is published by the developer",
  },
  {
    k: "Site photography",
    v: "None held",
    n: "We publish no image we cannot date and attribute",
  },
  {
    k: "Possession",
    v: PROJECT.possession,
    n: "See the possession page for what governs the handover",
  },
  {
    k: "RERA registration",
    v: PROJECT.rera,
    n: "Quarterly progress filings follow registration",
  },
  {
    k: "Location",
    v: PROJECT.address,
    n: "HARERA Gurugram bench",
  },
  {
    k: "Page last reviewed",
    v: LAST_REVIEWED,
    n: "Re-checked against the official listing on this date",
  },
];

/* The genuinely useful part: the buyer's own verification route. */
const VERIFY = [
  {
    n: "01",
    t: "Start with the quarterly progress filing",
    d: "Section 11 of the RERA Act obliges a registered promoter to keep the Authority's record current — quarterly — with the status of the project, the approvals in hand and the inventory booked. It is the only progress statement a promoter makes under legal consequence rather than under marketing licence. Read it before you read a brochure.",
  },
  {
    n: "02",
    t: "Know what the filing actually contains",
    d: "Typically: the stage reached on each building or block, the status of internal and external development works, the approvals obtained and those still pending, the count of units booked against units registered, and the declared completion date as it stands that quarter. Its value is comparative — a single filing is a snapshot, three consecutive filings are a trend.",
  },
  {
    n: "03",
    t: "Read the filings against each other, not in isolation",
    d: "Line up two or three quarters and ask three questions. Did the stage advance, or was the same description re-filed? Did the declared completion date move? Did booked inventory rise while construction stood still? Any of the three is worth raising before you commit money.",
  },
  {
    n: "04",
    t: "Ask for the site visit in writing, and set the terms",
    d: "Request a visit to the project site itself, not only to a sales lounge or an off-site experience centre. Ask in advance whether the tower your residence sits in can be approached, whether a mock-up or sample residence exists, and who from the project team will accompany you. A visit that can only be offered as a marketing suite is itself information.",
  },
  {
    n: "05",
    t: "Photograph deliberately, and date every frame",
    d: "Take a wide shot from one fixed vantage point you can return to, so successive visits are comparable. Then the topmost cast slab and where the formwork currently sits; the façade line versus the structure line; the approval and licence board at the gate; the batching plant, cranes and the visible labour presence; and the specific block your unit is in, not the show tower. Keep the device timestamp on.",
  },
  {
    n: "06",
    t: "Read what you saw against the sanctioned plan",
    d: "Progress only means something relative to the plan on record. Match the block, the tower and the storey count you were shown against the sanctioned building plan and layout filed with the Authority. Anything standing that does not appear on the sanctioned drawings, and anything sold to you that has not yet been sanctioned, should be treated as unresolved until it is explained in writing.",
  },
];

/* Stage primer. Deliberately no durations and no dates — those would be
   invented. What each stage means for money and risk is general and true. */
const STAGES = [
  {
    s: "Excavation & shoring",
    w: "The basement box is dug and the sides retained. Little rises above ground; the work is in soil, water table and retention.",
    m: "Usually the earliest construction-linked instalment. Ground conditions found here are the commonest cause of a programme slipping before a single column is cast.",
  },
  {
    s: "Foundation & raft",
    w: "Piling or a raft is laid, the load path for the whole tower established, and basement slabs and retaining walls cast.",
    m: "Money committed against work that will never again be visible or inspectable. This is the stage where third-party verification matters most and is asked for least.",
  },
  {
    s: "Structure — the slab cycle",
    w: "Columns, shear walls and floor slabs rise in a repeating cycle, one storey at a time, until the tower tops out.",
    m: "The most legible stage: you can count floors from the road. It is also where the heaviest instalments usually fall, because visible height is what a construction-linked plan bills against.",
  },
  {
    s: "Blockwork & plaster",
    w: "Internal walls are built into the frame, then plastered. The building acquires rooms rather than floors.",
    m: "The first stage at which a floor plan becomes physically checkable — walk it and confirm the room dimensions against the plan you were sold.",
  },
  {
    s: "Façade & glazing",
    w: "Cladding, stone, glazing and the external envelope go on. The tower starts to look like the render.",
    m: "The most misleading stage from outside. A sealed façade reads as near-complete to a visitor while the entire services and finishing programme is still ahead of it.",
  },
  {
    s: "MEP rough-in",
    w: "Electrical, plumbing, drainage, fire-fighting, HVAC and low-voltage systems are run through the structure before finishes close them in.",
    m: "Slow, invisible and unforgiving. In a large-format branded residence with climate control and smart-home integration, this is a substantial share of the programme and almost none of the photograph.",
  },
  {
    s: "Finishes & fit-out",
    w: "Flooring, stone, joinery, sanitaryware, fittings, paint and the specified interior package are installed.",
    m: "Where specification disputes surface. Imported stone and bespoke joinery run on procurement lead times, not site labour — a delay here is often a supply-chain matter, not a construction one.",
  },
  {
    s: "External development",
    w: "Roads, landscaping, the clubhouse and pool, services connections, sewerage, power and the estate infrastructure.",
    m: "Routinely the last thing finished and the first thing forgotten in a payment plan. A residence handed over into a site still under external development is a liveability problem, not a construction one.",
  },
  {
    s: "Occupation certificate",
    w: "The competent authority certifies the building fit for occupation. No lawful handover precedes it.",
    m: "The line between a finished-looking building and a legally habitable one. Ask to see the OC — or the application status — rather than accepting completion as self-evident.",
  },
];

const OPTICS = [
  {
    t: "Height reads as progress",
    d: "A topped-out structure is a real milestone and a partial one. Frame and slab are the fastest legible part of a tall building; what follows is longer, quieter and far harder to photograph.",
  },
  {
    t: "A sealed façade hides the programme",
    d: "Cladding and glazing transform a site visually in weeks. Behind it, services rough-in and finishing continue for a long stretch with no external change at all.",
  },
  {
    t: "The show residence is not the tower",
    d: "A sample home can be complete to specification while the block it represents is at blockwork. Always ask which stage your specific tower has reached.",
  },
  {
    t: "Silence between filings is data",
    d: "A quarter in which the filed description does not change, while sales continue, is worth a written question. It may be entirely explicable — ask, and keep the answer.",
  },
];

const FAQ_ITEMS = [
  {
    q: "What is the current construction status of M3M Brabus?",
    a: `We do not hold verified construction progress data for ${PROJECT.name}, and the official M3M listing does not publish a stage, a percentage complete or a floors-cast figure. Rather than estimate one, we will obtain the current position from the project team in writing and send it to you, alongside guidance on verifying it yourself through the HARERA record.`,
  },
  {
    q: "Why are there no construction photographs on this page?",
    a: "Because we hold none we can date and attribute. An undated site photograph, or a render presented as site progress, misleads a buyer about the one thing this page exists to answer. If you want current imagery, ask us for it or take your own on a site visit — and keep the timestamp.",
  },
  {
    q: "How is this different from the possession date?",
    a: "Construction status is what has been built so far. Possession is the date the completed residence is handed over to you. The two are related but not the same — a project can be at an advanced stage and still carry approvals on the critical path. The possession page covers the handover side.",
  },
];

export default function ConstructionStatusPage() {
  const root = useRef(null);
  const { openEnquiry, openVisit } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        q(".sec").forEach((el) => {
          gsap.from(el.querySelectorAll(".sec-rise"), {
            autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.06,
            scrollTrigger: { trigger: el, start: "top 84%" },
          });
        });

        gsap.from(q(".stg-row"), {
          autoAlpha: 0, y: 18, duration: 0.7, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: q(".stg")[0], start: "top 85%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="bg-canvas">
      <Seo
        title="M3M Brabus Construction Status | Progress Update, Sector 58 Gurgaon"
        description="M3M Brabus construction status — no progress figure is published, so none is invented. What is confirmed, how to read HARERA filings, and the latest update."
        path="/construction-status"
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Construction Status", path: "/construction-status" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Construction Status", path: "/construction-status" },
        ]}
      />
      <PageHeader
        eyebrow="M3M Brabus Construction Status"
        title="No progress figure"
        accent="is published."
        lede={`We hold no verified progress data and no dated site photography for ${PROJECT.name} — so this page invents neither. It gives you the current position as it genuinely stands, and the method for checking build progress yourself.`}
        compact
      />

      {/* the position, stated without decoration */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">The position today</span>
        </div>

        <div className="mb-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="rise max-w-[54ch] leading-relaxed text-ink-soft">
              A construction-status page is usually the easiest page on a property site to fabricate.
              A percentage, a floors-cast number, a photograph with no date — none can be checked
              casually, and all of them convert. We publish none of them, because a progress claim we
              cannot source is not an estimate, it is a record we would be inventing.
            </p>
            <p className="rise mt-4 max-w-[54ch] leading-relaxed text-ink-soft">
              What is confirmed is what {PROJECT.developer} publishes: the address, the configurations
              and the sizes. What is not confirmed is everything a progress update would consist of —
              stage reached, works completed, approvals in hand. On{" "}
              <span className="text-ink">{LAST_REVIEWED}</span> the official listing carried no
              construction update of any kind.
            </p>
            <p className="rise mt-4 max-w-[54ch] leading-relaxed text-ink-soft">
              That is not a dead end. Progress is verifiable through the regulator and through your own
              eyes on site, and the rest of this page is how. For the handover date rather than the
              build, see{" "}
              <Link
                to="/possession"
                className="text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:text-brass-soft"
              >
                possession
              </Link>
              ; for the registration position, see{" "}
              <Link
                to="/rera"
                className="text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:text-brass-soft"
              >
                RERA
              </Link>
              .
            </p>
          </div>

          <dl className="rise self-start border-t border-line">
            {POSITION.map((p) => (
              <div
                key={p.k}
                className="grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-8"
              >
                <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{p.k}</dt>
                <dd>
                  <span className="block text-ink">{p.v}</span>
                  <span className="mono mt-1 block text-[0.58rem] leading-relaxed tracking-[0.14em] text-ink-faint">
                    {p.n}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Where a site photograph would sit. We would rather show the absence
            than dress a render up as progress. */}
        <div className="rise flex flex-col gap-5 rounded-[1.5rem] border border-dashed border-line bg-cream p-8 sm:flex-row sm:items-center sm:justify-between md:p-10">
          <div className="flex items-start gap-4">
            <ImageOff size={20} strokeWidth={1.4} className="mt-1 shrink-0 text-brass" aria-hidden="true" />
            <div>
              <p className="font-display text-xl text-ink">No site photography is shown here</p>
              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-soft">
                The renders elsewhere on this site are architectural visualisations issued by the
                developer, not records of work in progress. We will not place one under a
                construction heading. Current imagery, where it exists, is sent on request with the
                date it was taken.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              track("construction_update_request", { location: "status_panel" });
              openEnquiry("Construction status");
            }}
            aria-label="Request the current construction update for M3M Brabus"
            className="group/cta relative inline-flex shrink-0 items-center gap-3 self-start overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
            <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
              Get the current update
            </span>
            <ArrowUpRight
              size={15}
              className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian"
            />
          </button>
        </div>
      </section>

      {/* verify it yourself */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">How to verify construction status yourself</span>
        </div>
        <p className="sec-rise mb-8 max-w-[62ch] leading-relaxed text-ink-soft">
          You do not have to take a progress claim on trust from anyone, us included. There are two
          independent routes — the regulator's own record, and your own visit — and they check each
          other. Run both.
        </p>
        <ol className="border-t border-line">
          {VERIFY.map((v) => (
            <li
              key={v.n}
              className="sec-rise group grid grid-cols-1 gap-2 border-b border-line py-6 transition-colors duration-500 hover:bg-brass/[0.035] sm:grid-cols-[minmax(0,3rem)_1fr] sm:gap-8"
            >
              <span className="idx">{v.n}</span>
              <div>
                <h2 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                  {v.t}
                </h2>
                <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-ink-soft">{v.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="sec-rise mono mt-6 text-[0.58rem] leading-relaxed tracking-[0.2em] text-ink-faint">
          General guidance on the statutory framework · Not legal advice · Verify the record and take
          independent counsel
        </p>
      </section>

      {/* book the visit */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-11">
          <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="sec-rise kicker">See it yourself</p>
              <h2 className="sec-rise mt-4 max-w-[18ch] font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                The most reliable status report{" "}
                <span className="font-serif italic text-brass">is the one you take.</span>
              </h2>
              <p className="sec-rise mt-5 max-w-[48ch] leading-relaxed text-ink-soft">
                We will arrange a visit to {PROJECT.location}, confirm in advance what can and cannot
                be approached on the day, and put the current position from the project team to you in
                writing before you travel. If a written progress statement cannot be produced, you
                will be told that too.
              </p>

              <div className="sec-rise mt-9 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => {
                    track("site_visit_request", { location: "construction_status" });
                    openVisit("Construction status");
                  }}
                  aria-label="Book a site visit to see construction progress"
                  data-cursor="VISIT"
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    Book a site visit
                  </span>
                  <ArrowUpRight
                    size={15}
                    className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    track("construction_update_request", { location: "visit_panel" });
                    openEnquiry("Construction status");
                  }}
                  aria-label="Request the written construction status update"
                  className="group inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  Request it in writing
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </button>
                <a
                  href={`tel:${PROJECT.phone}`}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  <Phone size={13} className="text-brass" aria-hidden="true" />
                  {PROJECT.phone}
                </a>
              </div>
            </div>

            <div className="sec-rise self-start">
              <p className="mono mb-4 flex items-center gap-2 text-[0.6rem] tracking-[0.2em] text-ink-faint">
                <Camera size={13} className="text-brass" aria-hidden="true" />
                Take on the day
              </p>
              <ul className="border-t border-line/70">
                {[
                  "One wide frame from a vantage you can return to",
                  "The topmost cast slab, and where the formwork sits",
                  "Façade line against structure line",
                  "The licence and approval board at the gate",
                  "Batching plant, cranes, visible labour",
                  "Your block — not the show tower",
                ].map((c) => (
                  <li
                    key={c}
                    className="border-b border-line/70 py-3 text-sm leading-relaxed text-ink-soft"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* stage primer */}
      <section className="stg container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">Reading a build, stage by stage</span>
        </div>
        <p className="mb-8 max-w-[62ch] leading-relaxed text-ink-soft">
          Every high-rise runs the same sequence. Knowing it lets you place whatever you are told — or
          shown — on a scale, and lets you ask what a stage costs you and what it exposes you to. No
          durations or dates appear below, because none are published for this project.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <caption className="sr-only">
              Construction stages of a high-rise residential tower, what happens at each stage, and
              what each stage means for a buyer&rsquo;s money and risk
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="mono w-[3rem] py-4 pr-6 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  #
                </th>
                <th scope="col" className="mono w-[14rem] py-4 pr-8 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  Stage
                </th>
                <th scope="col" className="mono py-4 pr-8 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  What is happening
                </th>
                <th scope="col" className="mono py-4 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  Money &amp; risk
                </th>
              </tr>
            </thead>
            <tbody>
              {STAGES.map((s, i) => (
                <tr
                  key={s.s}
                  className="stg-row group border-b border-line-soft align-top transition-colors duration-500 hover:bg-brass/[0.035]"
                >
                  <td className="idx py-5 pr-6">{String(i + 1).padStart(2, "0")}</td>
                  <th scope="row" className="py-5 pr-8 font-display text-lg font-light text-ink transition-colors duration-300 group-hover:text-brass-soft">
                    {s.s}
                  </th>
                  <td className="max-w-[26rem] py-5 pr-8 text-sm leading-relaxed text-ink-soft">{s.w}</td>
                  <td className="max-w-[26rem] py-5 text-sm leading-relaxed text-ink-soft">{s.m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mono mt-6 text-[0.58rem] leading-relaxed tracking-[0.2em] text-ink-faint">
          A general sequence for a high-rise residential tower · Not a statement of progress at this
          project
        </p>
      </section>

      {/* optics */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">Where the eye is misled</span>
        </div>
        <p className="sec-rise mb-8 max-w-[62ch] leading-relaxed text-ink-soft">
          Two stages of a tower are highly photogenic and two are almost invisible — and they are not
          proportionate to the work. This is the single most useful thing to hold in mind on a site
          visit.
        </p>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {OPTICS.map((o) => (
            <div key={o.t} className="sec-rise group border-b border-line py-6">
              <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {o.t}
              </h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{o.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* faqs */}
      <section className="sec container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">05</span>
          <span className="kicker">Construction questions</span>
        </div>
        <dl className="border-t border-line">
          {FAQ_ITEMS.map((f) => (
            <div key={f.q} className="sec-rise border-b border-line py-7">
              <dt className="max-w-[34ch] font-display text-xl font-light leading-snug text-ink md:text-2xl">
                {f.q}
              </dt>
              <dd className="mt-3 max-w-[68ch] leading-relaxed text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mono mt-8 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Page last reviewed {LAST_REVIEWED} · Reviewed against the official {PROJECT.developer}{" "}
          listing
        </p>
      </section>

      <RelatedPages links={["/possession", "/rera", "/specifications", "/contact"]} />

      <CtaBand title="Ask for the" accent="current update." subject="Construction status" />
    </div>
  );
}
