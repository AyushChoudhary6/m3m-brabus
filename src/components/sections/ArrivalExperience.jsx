import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Media from "../ui/Media.jsx";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* The journey inward. Three published renders exist and they happen to fall in
   order — the towers on approach, the porte-cochère, the lobby — so the walk is
   photographed exactly as far as M3M has photographed it and then stops. The
   sequence used to run to six scenes by repeating the lobby under "The Lift",
   "Private Corridor" and "Residence Door", which asserted three interiors that
   have never been released. The fourth scene is now typographic and says so;
   the descent moving out of image and into type as the building turns private
   is the more truthful edit, and the better one. */
const STAGES = [
  {
    n: "The Approach",
    note: "The towers stand over the landscaped grounds.",
    id: IMG.tower,
    alt: "The M3M Brabus towers above the landscaped grounds at Sector 58, Gurugram",
  },
  {
    n: "The Arrival Court",
    note: "Beneath the porte-cochère, the car is taken.",
    id: IMG.arrival,
    alt: "The porte-cochère arrival court at M3M Brabus, Sector 58, Gurugram",
  },
  {
    n: "The Lobby",
    note: "Into the double-height marble hall.",
    id: IMG.lobby,
    alt: "The double-height marble lobby and lounge at M3M Brabus",
  },
  {
    n: "Beyond the Lobby",
    note: "The private lift, the corridor that is yours alone, the door. M3M has published no render of this part of the walk — so none is shown.",
    id: null,
  },
];

/* CHAPTER 05 — THE ARRIVAL EXPERIENCE
   A pinned sequence the user scrolls *through*. Each scroll step walks the
   visitor one scene deeper — approach, forecourt, lobby, and the private
   ascent beyond it — with cinematic depth: incoming layers push in from
   scale 1.15, blur clearing as they settle. Dark and immersive. */
export default function ArrivalExperience() {
  const root = useRef(null);
  const pin = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const stages = q(".arr-stage");
      const caps = q(".arr-cap");
      const total = stages.length;

      gsap.matchMedia().add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
          mobile: "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
        },
        (ctx) => {
          // Reduced motion — first scene + static list, no pin, all readable.
          if (ctx.conditions.reduce) {
            gsap.set(stages, { autoAlpha: 0, scale: 1, filter: "blur(0px)" });
            gsap.set(stages[0], { autoAlpha: 1 });
            gsap.set(caps, { autoAlpha: 0 });
            gsap.set(q(".arr-progress"), { scaleX: 1 });
            gsap.set(q(".arr-static"), { autoAlpha: 1 });
            return;
          }

          // Initial states (layout effect → no flash)
          gsap.set(q(".arr-static"), { autoAlpha: 0 });
          gsap.set(stages, { autoAlpha: 0, scale: 1.15, filter: "blur(14px)" });
          gsap.set(stages[0], { autoAlpha: 1, scale: 1, filter: "blur(0px)" });
          gsap.set(caps, { autoAlpha: 0, yPercent: 30 });
          gsap.set(caps[0], { autoAlpha: 1, yPercent: 0 });
          gsap.set(q(".arr-progress"), { scaleX: 0, transformOrigin: "left center" });

          const end = ctx.conditions.desktop ? "+=560%" : "+=380%";

          const tl = gsap.timeline({
            scrollTrigger: { trigger: root.current, start: "top top", end, scrub: true, pin: pin.current, anticipatePin: 1 },
          });

          // Progress rail fills across the whole descent
          tl.to(q(".arr-progress"), { scaleX: 1, ease: "none", duration: 1 }, 0);

          // Layout of the walk: even segments with a lead + tail hold
          const lead = 0.06;
          const span = 1 - lead * 2;
          const seg = span / (total - 1);
          const dur = seg * 0.62; // crossfade portion; remainder = inward creep

          // Opening scene keeps drifting inward before the first hand-off
          tl.to(stages[0], { scale: 1.06, ease: "none", duration: lead + seg * 0.4 }, 0);

          for (let i = 1; i < total; i++) {
            const at = lead + seg * (i - 1);
            tl
              // outgoing scene recedes softly
              .to(stages[i - 1], { autoAlpha: 0, scale: 1.1, filter: "blur(8px)", ease: "power2.inOut", duration: dur }, at)
              // incoming scene pushes in from depth, blur clearing
              .fromTo(
                stages[i],
                { autoAlpha: 0, scale: 1.15, filter: "blur(14px)" },
                { autoAlpha: 1, scale: 1, filter: "blur(0px)", ease: "power2.out", duration: dur },
                at
              )
              // then keeps creeping inward through its hold
              .to(stages[i], { scale: 1.06, ease: "none", duration: seg - dur }, at + dur)
              // caption hand-off
              .to(caps[i - 1], { autoAlpha: 0, yPercent: -30, ease: "power2.in", duration: dur * 0.6 }, at)
              .fromTo(
                caps[i],
                { autoAlpha: 0, yPercent: 30 },
                { autoAlpha: 1, yPercent: 0, ease: "power2.out", duration: dur * 0.6 },
                at + dur * 0.4
              );
          }
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative bg-ink-900 text-white">
      <div ref={pin} className="relative h-[100svh] overflow-hidden" data-cursor="ENTER">
        {/* Stacked scene layers — cross-fade + push-in */}
        <div className="absolute inset-2.5 overflow-hidden rounded-[1.75rem] md:inset-4">
          {STAGES.map((s, i) => (
            <div key={s.n} className="arr-stage absolute inset-0 bg-obsidian">
              {s.id ? (
                <>
                  <Media src={px(s.id, 1800)} alt={s.alt} priority={i === 0} sizes="100vw" />
                  {/* scrim for caption legibility over a photograph — the
                      drawn scene below is dark already and needs none */}
                  <div className="absolute inset-0 [background:linear-gradient(180deg,rgba(10,9,8,0.55)_0%,rgba(10,9,8,0.2)_42%,rgba(10,9,8,0.9)_100%)]" />
                </>
              ) : (
                /* An unphotographed scene, drawn rather than borrowed: a lit
                   field and a hairline, depicting nothing and labelled as
                   depicting nothing. */
                <div className="absolute inset-0">
                  <div className="absolute inset-0 [background:radial-gradient(115%_85%_at_50%_38%,rgba(201,168,106,0.14),transparent_62%)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 sm:gap-6">
                      <span className="h-12 w-px bg-gradient-to-b from-transparent to-brass/60 sm:h-20" />
                      <span className="mono text-[0.56rem] tracking-[0.26em] text-white/40">
                        No render published
                      </span>
                      <span className="h-12 w-px bg-gradient-to-t from-transparent to-brass/60 sm:h-20" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chapter label */}
        <div className="pointer-events-none absolute left-[var(--spacing-gutter)] top-28 z-20">
          <p className="kicker text-champagne-soft">Chapter 05 — The Arrival Experience</p>
        </div>

        {/* Fixed caption — big serif stage name + counter, cross-fading per stage */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-[var(--spacing-gutter)] pb-[13vh]">
          <div className="relative">
            {STAGES.map((s, i) => (
              <div key={s.n} className="arr-cap absolute bottom-0 left-0">
                <span className="font-display text-sm italic text-brass-soft">{`0${i + 1} / 0${STAGES.length}`}</span>
                <h3 className="mt-3 max-w-[16ch] font-display text-[clamp(2.6rem,7vw,6rem)] font-light leading-[0.95] text-white">
                  {s.n}
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70 md:text-base">{s.note}</p>
              </div>
            ))}

            {/* Reduced-motion / no-JS itinerary — the six scenes, at a glance */}
            <ol className="arr-static max-w-md space-y-2">
              {STAGES.map((s, i) => (
                <li key={s.n} className="flex items-baseline gap-4 text-white/75">
                  <span className="font-display text-xs italic text-brass-soft">{`0${i + 1}`}</span>
                  <span className="font-display text-lg font-light text-white">{s.n}</span>
                  <span className="text-sm text-white/50">{s.note}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Progress indicator — thin rail scaling in from the left */}
        <div className="absolute inset-x-0 bottom-0 z-20 h-px bg-white/15">
          <div className="arr-progress h-px w-full origin-left bg-brass" />
        </div>
      </div>
    </section>
  );
}
