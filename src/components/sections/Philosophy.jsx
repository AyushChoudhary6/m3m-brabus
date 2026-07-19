import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 02 — THE PHILOSOPHY
   Vision over facts. Huge editorial type; lines uncover on scroll and a
   marquee word drifts as you move — the page breathes. */
export default function Philosophy() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);

      q(".ph-line").forEach((line) => {
        gsap.fromTo(
          line.querySelector(".ph-line-inner"),
          { yPercent: 120 },
          {
            yPercent: 0,
            ease: "power4.out",
            scrollTrigger: { trigger: line, start: "top 92%", end: "top 55%", scrub: true },
          }
        );
      });

      // Drifting oversized word
      gsap.to(q(".ph-drift"), {
        xPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    { scope: root }
  );

  return (
    <section id="philosophy" ref={root} className="relative overflow-hidden py-[10vh]">
      {/* Oversized ghost word */}
      <div className="ph-drift pointer-events-none absolute -right-[10%] top-[6%] select-none font-display text-[24vw] italic leading-none text-ink/[0.035]">
        Vision
      </div>

      <div className="px-[var(--spacing-gutter)]">
        <p className="kicker mb-[8vh]">Chapter 02 — The Philosophy</p>

        <div className="max-w-[16ch] font-display text-[clamp(2.4rem,7vw,6.5rem)] font-light leading-[1.02] tracking-[-0.02em] text-ink">
          {[
            { t: "We did not", i: false },
            { t: "set out to", i: false },
            { t: "build homes.", i: true },
          ].map((l, i) => (
            <div key={i} className="ph-line overflow-hidden">
              <span className={`ph-line-inner block ${l.i ? "italic text-brass" : ""}`}>{l.t}</span>
            </div>
          ))}
        </div>

        <div className="mt-[10vh] ml-auto max-w-[42ch] text-lg leading-relaxed text-ink-soft md:text-xl">
          <div className="ph-line overflow-hidden">
            <span className="ph-line-inner block">
              We set out to compose a way of living — where architecture, light and
              silence are engineered with the same obsession as a hand-built engine.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
