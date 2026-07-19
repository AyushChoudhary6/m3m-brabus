import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Media from "../ui/Media.jsx";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 04 — THE LIFESTYLE  (horizontal scroll)
   The tour travels sideways: a tall section + a sticky viewport translate a
   track of framed amenity plates as you scroll — the whole world drifts past
   like a tracking shot. Native swipe on touch. */
const AMENITIES = [
  { n: "The Club", id: IMG.lobbyWarm, d: "A members-only sanctuary for work, leisure and conversation." },
  { n: "Spa & Wellness", id: IMG.spa, d: "Hammam, sauna and treatment suites — a ritual of stillness." },
  { n: "The Olympic Pool", id: IMG.pool, d: "A temperature-controlled pool beneath cascading light." },
  { n: "Performance Gym", id: IMG.gym, d: "A precision fitness suite — engineered like a machine." },
  { n: "The Theatre", id: IMG.bedroomDecor, d: "An acoustically-tuned screening room for the after-hours." },
  { n: "The Sky Lounge", id: IMG.duplexLiving, d: "Elevated decks and champagne above the skyline." },
  { n: "Private Dining", id: IMG.livingRoom, d: "Signature restaurants and a chef's table for the evening." },
];

export default function Lifestyle() {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add(
        { desktop: "(min-width:768px) and (prefers-reduced-motion: no-preference)" },
        () => {
          const el = track.current;
          const distance = () => Math.max(0, el.scrollWidth - window.innerWidth + window.innerWidth * 0.06);

          // horizontal scrub driven by the tall section (sticky viewport, no pin)
          gsap.to(el, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          });

          // progress rail
          gsap.to(q(".life-bar"), {
            scaleX: 1, ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="lifestyle" className="relative md:h-[260vh]">
      <div className="flex flex-col md:sticky md:top-0 md:h-svh md:overflow-hidden">
        {/* header */}
        <div className="container-lux pt-[clamp(4rem,11vh,7rem)] md:pt-[14vh]">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
            <div className="flex items-baseline gap-5">
              <span className="idx">05</span>
              <span className="kicker">The Lifestyle</span>
            </div>
            <h2 className="max-w-[20ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
              A private world <span className="font-serif italic text-brass">within the walls.</span>
            </h2>
          </div>
          <div className="mt-8 hidden h-px w-full max-w-40 origin-left bg-line md:block">
            <div className="life-bar h-px w-full origin-left scale-x-0 bg-brass" />
          </div>
        </div>

        {/* track */}
        <div className="mt-8 flex-1 md:mt-10 md:flex md:items-center">
          <div
            ref={track}
            className="flex gap-5 overflow-x-auto px-[var(--spacing-gutter)] pb-6 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-8 md:overflow-visible md:pb-0 md:pr-[6vw] [&::-webkit-scrollbar]:hidden"
          >
            {AMENITIES.map((a, i) => (
              <article
                key={a.n}
                className="amen group w-[78vw] flex-none sm:w-[58vw] md:w-[30vw] lg:w-[26vw]"
                data-cursor="VIEW"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] border border-line transition-colors duration-500 group-hover:border-brass/40">
                  <div className="absolute inset-0 scale-[1.04] transition-transform duration-[1600ms] ease-lux group-hover:scale-[1.1]">
                    <Media src={px(a.id, 1200)} alt={a.n} sizes="(max-width:768px) 78vw, 28vw" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_48%,rgba(8,6,5,0.72))]" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
                  <span className="mono absolute left-4 top-4 text-[0.56rem] tracking-[0.2em] text-brass-soft">
                    {String(i + 1).padStart(2, "0")} / {String(AMENITIES.length).padStart(2, "0")}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-xl text-bone md:text-2xl">{a.n}</h3>
                    <p className="mt-1.5 max-w-[30ch] text-[0.82rem] leading-relaxed text-ink/70">{a.d}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
