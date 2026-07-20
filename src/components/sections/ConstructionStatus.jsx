import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, HardHat } from "lucide-react";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { track } from "../../lib/analytics.js";
import { PROJECT } from "../../lib/site.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 22 — CONSTRUCTION STATUS (homepage strip)
   The full argument — how to read a HARERA quarterly filing, what each build
   stage exposes you to — lives at /construction-status. This band exists only
   so a homepage reader is not left to assume silence means progress. It states
   the position, dates the statement, and hands over.

   No percentage, no stage, no milestone date and no site photograph appears
   here, because none is published for this project and an invented one would
   be a fabricated record rather than a marketing flourish. */

/** Dated in one place so the claim on the homepage can never drift from the
 *  day it was actually checked. Update this line when the listing is re-read. */
export const LAST_REVIEWED = "20 July 2026";

/* Three lines only — the band earns its quietness by saying little. */
const STATUS = [
  { k: "Progress data", v: "None published" },
  { k: "Dated site photography", v: "None held" },
  { k: "Last reviewed", v: LAST_REVIEWED },
];

export default function ConstructionStatus() {
  const root = useRef(null);
  const { openEnquiry, openVisit } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.from(q(".cs-rise"), {
          autoAlpha: 0, y: 18, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: root.current, start: "top 88%" },
        });
      });
    },
    { scope: root },
  );

  const act = (label, run) => () => {
    track("cta_click", { location: "construction_strip", label });
    run();
  };

  return (
    <section
      ref={root}
      aria-labelledby="construction-status-heading"
      className="border-t border-line bg-canvas py-[clamp(3rem,8vh,5rem)]"
    >
      <div className="container-lux grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
        {/* the position, stated once */}
        <div>
          <div className="cs-rise flex items-baseline gap-5">
            <span className="idx">13</span>
            <span className="kicker">Construction Status</span>
          </div>

          <h2
            id="construction-status-heading"
            className="cs-rise mt-5 max-w-[24ch] font-display text-[clamp(1.6rem,3.2vw,2.4rem)] font-light leading-[1.08] tracking-[-0.02em] text-ink"
          >
            We report only what we can date{" "}
            <span className="font-serif italic text-brass">and attribute.</span>
          </h2>

          <p className="cs-rise mt-5 flex max-w-[56ch] items-start gap-3 text-sm leading-relaxed text-ink-soft">
            <HardHat size={17} strokeWidth={1.4} className="mt-0.5 shrink-0 text-brass" aria-hidden="true" />
            <span>
              {PROJECT.developer} publishes no stage, percentage or milestone date for{" "}
              {PROJECT.name}, so none appears here. Verified updates are sent directly to
              registered buyers, in writing, with the date they were obtained.
            </span>
          </p>
        </div>

        {/* status ledger, then the two ways to act on it */}
        <div>
          <dl className="cs-rise border-t border-line">
            {STATUS.map((s) => (
              <div
                key={s.k}
                className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-line py-3.5"
              >
                <dt className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">{s.k}</dt>
                <dd className="text-sm text-ink">{s.v}</dd>
              </div>
            ))}
          </dl>

          <div className="cs-rise mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
            <button
              type="button"
              onClick={act("construction_update", () => openEnquiry("Construction update"))}
              aria-label={`Request the current construction update for ${PROJECT.name}`}
              data-cursor="REQUEST"
              className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-6 py-3.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
              <span className="relative z-10 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                Get the current update
              </span>
              <ArrowUpRight
                size={14}
                className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian"
              />
            </button>

            <button
              type="button"
              onClick={act("site_visit", () => openVisit("Construction status"))}
              aria-label="Book a site visit to see construction progress for yourself"
              data-cursor="VISIT"
              className="group inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.7rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              Book a site visit
              <ArrowUpRight
                size={13}
                className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </button>

            <Link
              to="/construction-status"
              className="mono text-[0.62rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              How to verify progress yourself
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
