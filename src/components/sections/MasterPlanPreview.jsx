import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { PROJECT, HIGHLIGHTS } from "../../lib/site.js";
import { PROJECT_FACT } from "../../lib/facts.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Ch. 22 — homepage section 09, the master-plan tease.
   M3M has published no site layout, no acreage, no tower count and no
   open-space figure, so there is nothing to show and nothing to state.
   What the listing DOES give us is the planning intent — open-core and
   ultra-low-density — so the section sells the intent, admits the gap in
   the same breath, and turns the gap into the request. The drawing below
   is hand-built SVG illustrating planning principles in the abstract; it
   is disclaimed in the caption and in the SVG's own accessible label so
   it can never be mistaken for this project's sanctioned plan. */

/* Quoted from HIGHLIGHTS rather than restated, so the homepage promise and
   the /master-plan page can never drift apart. */
const OPEN_CORE = HIGHLIGHTS.find((h) => h.title === "Open-Core Architecture");
const LOW_DENSITY = HIGHLIGHTS.find((h) => h.title === "Ultra-Low Density");

/* The four figures a master plan would ordinarily settle — every one of
   them unpublished, which is precisely the argument for the CTA. */
const UNPUBLISHED = ["landArea", "towers", "floors", "openSpace"]
  .map((k) => PROJECT_FACT[k])
  .filter(Boolean);

const PRINCIPLES = [
  OPEN_CORE && {
    key: "open-core",
    title: OPEN_CORE.title,
    body: OPEN_CORE.body,
    meta: "As published",
  },
  LOW_DENSITY && {
    key: "low-density",
    title: LOW_DENSITY.title,
    body: LOW_DENSITY.body,
    meta: "As published",
  },
  {
    key: "geometry",
    title: "The Geometry Itself",
    body: `Land area, tower count, floor count and open space decide whether the two principles above are delivered or merely intended. ${PROJECT.developer} has not released any of the four, so none appears here — ask and each is sent as it stands.`,
    meta: "Not yet published",
  },
].filter(Boolean);

export default function MasterPlanPreview() {
  const root = useRef(null);
  const { openEnquiry } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".mpp-rise"), {
          autoAlpha: 0, y: 22, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 84%" },
        });

        gsap.from(q(".mpp-row"), {
          autoAlpha: 0, y: 18, duration: 0.8, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".mpp-list")[0], start: "top 88%" },
        });

        /* the schematic assembles layer by layer — it should read as a
           drawing being built up, never as a photograph of a place */
        gsap.from(q(".mpp-stroke"), {
          autoAlpha: 0, duration: 0.85, ease: "power2.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".mpp-figure")[0], start: "top 86%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="master-plan-preview-heading"
      className="relative overflow-hidden border-t border-line bg-cream py-[clamp(3.5rem,11vh,7rem)]"
    >
      <div className="gold-glow pointer-events-none absolute -right-40 top-10 h-[30rem] w-[30rem] rounded-full bg-brass/[0.06] blur-[130px]" />

      <div className="container-lux relative">
        <div className="mpp-rise mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">09</span>
          <span className="kicker">Master plan</span>
        </div>

        <div className="mb-[clamp(2.25rem,6vh,3.5rem)] grid gap-x-16 gap-y-5 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <h2
            id="master-plan-preview-heading"
            className="mpp-rise max-w-[17ch] font-display text-[clamp(1.9rem,4.6vw,3.2rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink"
          >
            Planned around the space{" "}
            <span className="font-serif italic text-brass">between the towers.</span>
          </h2>
          <p className="mpp-rise max-w-[46ch] leading-relaxed text-ink-soft">
            Three sides open is decided on the site plan, not in the specification. Here is the
            planning intent {PROJECT.developer} has published for {PROJECT.name} — and, just as
            plainly, the geometry it has not.
          </p>
        </div>

        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[1fr_1fr] lg:items-start">
          {/* the principles, quoted not paraphrased */}
          <dl className="mpp-list border-t border-line">
            {PRINCIPLES.map((p, i) => (
              <div key={p.key} className="mpp-row border-b border-line py-6">
                <div className="flex items-baseline gap-4">
                  <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                  <dt className="font-display text-xl leading-snug text-ink">{p.title}</dt>
                </div>
                <dd className="mt-3 max-w-[52ch] pl-[2.4rem] text-sm leading-relaxed text-ink-soft">
                  {p.body}
                  <span className="mono mt-3 block text-[0.54rem] tracking-[0.2em] text-ink-faint">
                    {p.meta}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          {/* Abstract on purpose: no dimensions, no counts, nothing scaled —
              only the relationships a plan is read for. */}
          <figure className="mpp-figure lg:sticky lg:top-24">
            <div className="overflow-x-auto rounded-[1.25rem] border border-line bg-paper">
              <svg
                viewBox="0 0 560 380"
                className="h-auto w-full min-w-[400px]"
                role="img"
                aria-label="Schematic illustration of general site-planning principles: a dashed site boundary with a north point, three staggered building footprints with a marked gap between two of them, one footprint shown open on three faces, and a central amenity core. It is an illustration of principles only and is not the site plan of this project."
              >
                {/* site boundary */}
                <rect
                  className="mpp-stroke" x="34" y="42" width="492" height="300" rx="10"
                  fill="none" stroke="#c9a86a" strokeOpacity="0.45" strokeWidth="1.2"
                  strokeDasharray="7 6"
                />
                <text
                  className="mpp-stroke" x="36" y="30" fill="#6f6551" fontSize="10"
                  letterSpacing="2.2" fontFamily="ui-monospace, monospace"
                >
                  BOUNDARY — INDICATIVE ONLY
                </text>

                {/* north point */}
                <g className="mpp-stroke">
                  <circle cx="486" cy="88" r="18" fill="none" stroke="#c9a86a" strokeOpacity="0.4" strokeWidth="1.1" />
                  <path d="M486 75 L490 96 L486 91.5 L482 96 Z" fill="#c9a86a" />
                  <text x="481" y="118" fill="#c9a86a" fontSize="10" fontFamily="ui-monospace, monospace">N</text>
                </g>

                {/* staggered footprints — the stagger is the point */}
                <g
                  className="mpp-stroke"
                  fill="#c9a86a" fillOpacity="0.08" stroke="#c9a86a" strokeOpacity="0.65" strokeWidth="1.2"
                >
                  <rect x="72" y="112" width="84" height="58" rx="4" />
                  <rect x="238" y="88" width="84" height="58" rx="4" />
                  <rect x="404" y="118" width="84" height="58" rx="4" />
                </g>

                {/* clear gap between two footprints — what daylight and privacy rest on */}
                <g className="mpp-stroke" stroke="#a99d86" strokeOpacity="0.6" strokeWidth="0.9">
                  <line x1="156" y1="141" x2="238" y2="141" />
                  <line x1="156" y1="133" x2="156" y2="149" />
                  <line x1="238" y1="133" x2="238" y2="149" />
                </g>
                <text
                  className="mpp-stroke" x="160" y="128" fill="#6f6551" fontSize="9.5"
                  letterSpacing="1.6" fontFamily="ui-monospace, monospace"
                >
                  CLEAR GAP
                </text>

                {/* three open faces on the centre footprint */}
                <g className="mpp-stroke" stroke="#e6d2a0" strokeOpacity="0.8" strokeWidth="1.1" fill="none">
                  <path d="M280 84 L280 62 M275 68 L280 60 L285 68" />
                  <path d="M234 117 L212 117 M218 112 L210 117 L218 122" />
                  <path d="M326 117 L348 117 M342 112 L350 117 L342 122" />
                </g>
                <text
                  className="mpp-stroke" x="240" y="52" fill="#e6d2a0" fontSize="9.5"
                  letterSpacing="1.6" fontFamily="ui-monospace, monospace"
                >
                  THREE OPEN FACES
                </text>

                {/* central amenity core, equidistant by design */}
                <circle
                  className="mpp-stroke" cx="280" cy="248" r="42"
                  fill="#c9a86a" fillOpacity="0.07" stroke="#c9a86a" strokeOpacity="0.5" strokeWidth="1.1"
                />
                <text
                  className="mpp-stroke" x="253" y="252" fill="#c9a86a" fontSize="9.5"
                  letterSpacing="1.4" fontFamily="ui-monospace, monospace"
                >
                  CORE
                </text>

                {/* landscape loop connecting the footprints to the core */}
                <path
                  className="mpp-stroke"
                  d="M114 172 Q150 240 238 248 M322 248 Q404 240 446 178"
                  fill="none" stroke="#a99d86" strokeOpacity="0.45" strokeWidth="1"
                />

                {/* low density read as generous unbuilt ground, not as a number */}
                <path
                  className="mpp-stroke"
                  d="M34 312 L526 312"
                  fill="none" stroke="#a99d86" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="4 7"
                />
                <text
                  className="mpp-stroke" x="36" y="330" fill="#6f6551" fontSize="9.5"
                  letterSpacing="1.6" fontFamily="ui-monospace, monospace"
                >
                  UNBUILT GROUND — RATIO NOT PUBLISHED
                </text>
              </svg>
            </div>
            <figcaption className="mono mt-4 text-[0.54rem] leading-relaxed tracking-[0.16em] text-ink-faint">
              Schematic illustration of planning principles — orientation, stagger, spacing and a
              central core. It is not the sanctioned site plan of {PROJECT.name}, is not to scale,
              and implies no tower count, no land area and no layout.
            </figcaption>
          </figure>
        </div>

        {/* the gap, named — then the request */}
        <div className="mpp-rise mt-[clamp(2.5rem,7vh,4rem)] border-t border-line pt-8">
          <p className="mono text-[0.58rem] tracking-[0.2em] text-brass">
            Not published — available on request
          </p>
          <ul className="mt-4 flex list-none flex-wrap gap-x-3 gap-y-2 p-0">
            {UNPUBLISHED.map((f) => (
              <li
                key={f.key}
                className="mono rounded-full border border-line px-4 py-2 text-[0.56rem] tracking-[0.18em] text-ink-soft"
              >
                {f.label}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <button
              type="button"
              onClick={() => openEnquiry("Master plan")}
              data-cursor="ASK"
              aria-label={`Request the ${PROJECT.name} master plan`}
              className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
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

            <Link
              to="/master-plan"
              className="group/link inline-flex items-center gap-2.5 border-b border-brass/40 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              How to read the plan
              <ArrowUpRight
                size={14}
                className="transition-transform duration-500 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
