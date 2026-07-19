import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Media from "../ui/Media.jsx";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SCENES = [
  { time: "Morning", name: "The Spa & Wellness", note: "Hammam, sauna and treatment suites to begin the day.", id: IMG.spa, tint: "rgba(198,166,100,0.18)" },
  { time: "Afternoon", name: "The BRABUS Club", note: "A multi-level clubhouse for work, play and gathering.", id: IMG.lobbyWarm, tint: "rgba(120,140,160,0.16)" },
  { time: "Evening", name: "Sky Lounge & Dining", note: "Elevated decks and private dining beneath the skyline.", id: IMG.duplexLiving, tint: "rgba(180,90,50,0.20)" },
  { time: "Night", name: "Private Cinema", note: "Screening rooms and quiet corners for the after-hours.", id: IMG.bedroomDecor, tint: "rgba(20,24,40,0.4)" },
];

/* CHAPTER 07 — THE LIFESTYLE
   A day in the residence, told as a pinned horizontal film: morning to night. */
export default function Lifestyle() {
  const root = useRef(null);
  const pin = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Reduced motion — no pin. Make the horizontal film swipeable so every
      // scene stays reachable (the 400vw track would otherwise be clipped).
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(pin.current, { overflowX: "auto", overflowY: "hidden" });
      });

      // Motion OK — pinned horizontal scrub. The reveal is identical on every
      // device (xPercent -75 of a 400vw track = a full 300vw / 3-screen travel,
      // so all four scenes clear the viewport). Touch gets a slightly shorter
      // pin so it doesn't feel like an endless scroll on a tall phone.
      mm.add(
        {
          desktop: "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
          mobile: "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
        },
        (ctx) => {
          const { mobile } = ctx.conditions;
          gsap.to(track.current, {
            xPercent: -75,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: mobile ? "+=300%" : "+=320%",
              scrub: true,
              pin: pin.current,
              anticipatePin: 1,
            },
          });
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative">
      <div ref={pin} className="relative h-[100svh] overflow-hidden">
        <div ref={track} className="flex h-full w-[400vw]">
          {SCENES.map((s, i) => (
            <article key={s.time} className="relative flex h-full w-screen flex-col justify-end overflow-hidden">
              <div className="absolute inset-2.5 overflow-hidden rounded-[1.75rem] md:inset-4">
                <Media src={px(s.id, 1600)} alt={s.name} sizes="100vw" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 30%, rgba(10,9,8,0.85) 100%), ${s.tint ? `linear-gradient(0deg, ${s.tint}, ${s.tint})` : "none"}` }} />
              </div>
              <div className="relative z-10 px-[var(--spacing-gutter)] pb-[12vh]">
                <span className="kicker text-champagne-soft">{`0${i + 1} · ${s.time}`}</span>
                <h3 className="mt-4 max-w-[14ch] font-display text-[clamp(2.4rem,6vw,5.5rem)] font-light leading-[1] text-white">
                  {s.name}
                </h3>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70 md:text-base">{s.note}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Chapter label + progress */}
        <div className="pointer-events-none absolute left-[var(--spacing-gutter)] top-28 z-20">
          <p className="kicker text-white/70">Chapter 07 — The Lifestyle</p>
        </div>
      </div>
    </section>
  );
}
