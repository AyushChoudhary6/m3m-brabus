import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { track } from "../../lib/analytics.js";
import { PROJECT } from "../../lib/site.js";
import { PROJECT_FACT, OFFICIAL_SOURCE } from "../../lib/facts.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Ch. 22 — the investment case, argued without a single number.
   Every figure a page like this normally leans on — appreciation, rental
   yield, price trend, "fastest-growing corridor" — is unpublished for this
   project, which means quoting one would be fiction. So the case is built
   only from things that are structurally true and independently checkable:
   what is on the official listing, and what follows logically from it.
   The honest audit at the foot is not a disclaimer bolted on; at this
   ticket size it is the most persuasive part of the section. */

const PILLARS = [
  {
    k: "Scale cannot be added later",
    d: `Residences here run ${PROJECT_FACT.sizes.value}. A plate of that size is fixed at the structural grid on the day the building is sanctioned — no interior work turns two ordinary flats into one properly planned home, because the columns, the cores and the service risers do not move. Homes at this scale are therefore made scarce by construction rather than by marketing.`,
  },
  {
    k: "A marque sets a floor under the finish",
    d: `Branded residences exist because a name carries a standard. ${PROJECT.developer} builds, ${PROJECT.partner} lends the ethos — and a marque that has spent decades on a reputation for luxury, performance and exclusivity has far more to lose from a poor handover than any single project earns. The association is a commitment to a specification, and it is legible long after the sales campaign has closed.`,
  },
  {
    k: "A younger belt, planned as one",
    d: "Golf Course Extension Road was laid out after Gurugram's older spines, and it shows in the grain of the place: wider frontage, newer sanctioned plans, and the city's more recent luxury stock concentrating along it rather than being inserted between existing buildings. An address on a road planned as a whole ages differently from one retrofitted into a road that was not.",
  },
  {
    k: "Low density is the one thing that cannot be retrofitted",
    d: "A lobby can be refitted, a lift replaced, a landscape re-planted, a façade re-clad. Homes cannot be un-built. The number of families sharing a lift core, a driveway and a clubhouse is decided once, at the sanction stage, and then holds for the life of the building. It is the rare quality that a later owner inherits exactly as the first one bought it.",
  },
  {
    k: "The buyer such stock attracts",
    d: "A home of this size self-selects its market: end-users buying to live, not to churn. That pool is narrow, and honesty requires saying that a narrow pool cuts both ways. What supports resale in this segment is not volume of demand but scarcity of alternatives — when very few comparable homes are available at the same moment, a seller is not competing with fifty identical listings on the same road.",
  },
];

/* Each check names the document to ask for, not a reassurance to accept. */
const CHECKS = [
  {
    t: "The RERA position",
    d: "No registration number appears on the official listing yet. Ask for the current status in writing before any payment — never take a verbal assurance on this one.",
    to: "/rera",
    cta: "RERA status",
  },
  {
    t: "The sanctioned plan",
    d: "Density, heights and open space are only real once they are on the approved drawing. Ask to see the sanctioned plan itself, not the brochure's rendering of it.",
    to: "/overview",
    cta: "Project overview",
  },
  {
    t: "The final cost sheet",
    d: "The headline rate is never the outlay. Read every line — PLC, parking, club, IFMS, taxes, registration — before you compare this against anything else.",
    to: "/price",
    cta: "Price position",
  },
  {
    t: "What buyers actually say",
    d: "Test the developer's record with owners rather than with advertising, and weigh what is said about handover quality and after-sales as heavily as what is said about design.",
    to: "/reviews",
    cta: "Reviews",
  },
];

export default function WhyInvest() {
  const root = useRef(null);
  const { openEnquiry, openVisit } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".wi-rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 84%" },
        });

        gsap.from(q(".wi-pillar"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".wi-pillars")[0], start: "top 86%" },
        });

        /* The rules draw themselves left-to-right, so the argument reads as
           a set of entries being written down rather than a grid appearing. */
        gsap.from(q(".wi-rule"), {
          scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".wi-pillars")[0], start: "top 86%" },
        });

        gsap.from(q(".wi-check"), {
          autoAlpha: 0, y: 16, duration: 0.7, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".wi-audit")[0], start: "top 88%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="why-invest-heading"
      className="border-t border-line bg-cream py-[clamp(4rem,12vh,7.5rem)]"
    >
      <div className="container-lux">
        <div className="wi-rise mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">11</span>
          <span className="kicker">Why invest</span>
        </div>

        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[1fr_0.92fr] lg:items-end">
          <h2
            id="why-invest-heading"
            className="wi-rise max-w-[17ch] font-display text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.03] tracking-[-0.025em] text-ink"
          >
            The case, made <span className="font-serif italic text-brass">without a single number.</span>
          </h2>
          <p className="wi-rise max-w-[48ch] leading-relaxed text-ink-soft">
            You will find no appreciation percentage here, no rental yield, no price trend and no
            claim about the fastest-growing anything. None of it is published for this project, and
            a figure invented to fill the gap is worth less than nothing to a buyer at this level.
            What follows is the part of the argument that is structural — true of the building and
            the belt it stands in, and checkable against documents rather than sentiment.
          </p>
        </div>

        {/* the five structural arguments */}
        <ol className="wi-pillars mt-[clamp(2.5rem,7vh,4.5rem)] grid list-none grid-cols-1 gap-x-16 gap-y-0 p-0 md:grid-cols-2">
          {PILLARS.map((p, i) => (
            <li
              key={p.k}
              className={`wi-pillar group relative py-7 ${
                /* the fifth argument runs full width — it carries the caveat
                   and deserves the room to state both sides of it */
                i === PILLARS.length - 1 ? "md:col-span-2" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="wi-rule absolute inset-x-0 top-0 h-px bg-line"
              />
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 max-w-[24ch] font-display text-xl leading-snug text-ink transition-colors duration-500 group-hover:text-brass-soft md:text-2xl">
                {p.k}
              </h3>
              <p className={`mt-3 text-sm leading-relaxed text-ink-soft ${i === PILLARS.length - 1 ? "max-w-[92ch]" : "max-w-[52ch]"}`}>
                {p.d}
              </p>
            </li>
          ))}
        </ol>

        {/* the honest audit — the section's own footnote to itself */}
        <div className="wi-audit mt-[clamp(2.5rem,7vh,4.5rem)] rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-11">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div>
              <p className="wi-rise kicker">Before you act on any of it</p>
              <h3 className="wi-rise mt-4 max-w-[18ch] font-display text-[clamp(1.6rem,3vw,2.3rem)] font-light leading-[1.06] tracking-[-0.02em] text-ink">
                Every case above should be <span className="font-serif italic text-brass">tested, not taken.</span>
              </h3>
              <p className="wi-rise mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
                Reasoning is not diligence. An investment argument only survives contact with three
                documents — the RERA position, the sanctioned plan and the final cost sheet. Ask us
                for all three, in writing, and read them before you decide anything. If any one of
                them is not yet available, that is itself an answer worth having early.
              </p>

              <div className="wi-rise mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <button
                  type="button"
                  onClick={() => {
                    track("why_invest_documents");
                    openEnquiry("Investment case — documents");
                  }}
                  data-cursor="ASK"
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    Request the three documents
                  </span>
                  <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                </button>
                {/* density is the one claim you can only verify standing in it */}
                <button
                  type="button"
                  onClick={() => openVisit("Investment case")}
                  data-cursor="VISIT"
                  className="group/visit inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  See the density in person
                  <ArrowUpRight size={14} className="transition-transform duration-500 group-hover/visit:-translate-y-0.5 group-hover/visit:translate-x-0.5" />
                </button>
              </div>
            </div>

            <ul className="list-none border-t border-line p-0">
              {CHECKS.map((c) => (
                <li key={c.t} className="wi-check border-b border-line py-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <h4 className="font-display text-lg text-ink">{c.t}</h4>
                    <Link
                      to={c.to}
                      className="mono inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.18em] text-brass transition-colors hover:text-brass-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                      aria-label={`${c.cta} — ${c.t}`}
                    >
                      {c.cta}
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                  <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-ink-soft">{c.d}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="mono mt-8 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
            No returns are projected or promised ·{" "}
            <a
              href={OFFICIAL_SOURCE}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              Facts as published by {PROJECT.developer}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
