import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { LOCATION, PROJECT } from "../../lib/site.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 08 — THE ADDRESS
   A living map: roads draw themselves, the plot pulses, the grid drifts. */
export default function LivingMap() {
  const root = useRef(null);
  const map = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);

      q(".road").forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(p, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top 65%", end: "center center", scrub: true } });
      });

      gsap.from(q(".marker"), {
        scale: 0, autoAlpha: 0, transformOrigin: "center", stagger: 0.12, ease: "back.out(2)",
        scrollTrigger: { trigger: root.current, start: "top 55%" },
      });

      // Slight map rotation while scrolling
      gsap.fromTo(map.current, { rotate: -2 }, { rotate: 2, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });

      q(".loc-row").forEach((row) => {
        gsap.fromTo(row.querySelector("span"), { yPercent: 120 }, { yPercent: 0, ease: "power4.out", scrollTrigger: { trigger: row, start: "top 92%", end: "top 70%", scrub: true } });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative mx-3 overflow-hidden rounded-[2.5rem] bg-ink-900 py-[14vh] text-white md:mx-5">
      <div className="grid gap-14 px-[var(--spacing-gutter)] lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          <p className="kicker mb-8 text-champagne-soft">Chapter 08 — The Address</p>
          <h2 className="max-w-[14ch] font-display text-[clamp(2.4rem,6vw,5rem)] font-light leading-[1.02]">
            The centre of <span className="italic text-brass-soft">new Gurugram.</span>
          </h2>

          <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {LOCATION.map((l) => (
              <div key={l.place} className="loc-row overflow-hidden">
                <span className="flex items-center justify-between py-4 text-white/80">
                  <span>{l.place}</span>
                  <span className="font-display text-brass-soft">{l.time}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Living map */}
        <div ref={map} className="relative aspect-square w-full overflow-hidden rounded-[1.75rem] border border-white/10">
          <svg viewBox="0 0 500 500" className="h-full w-full" fill="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0 L0 0 0 40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="500" height="500" fill="url(#grid)" />
            {/* roads */}
            <path className="road" d="M20 260 C 160 240, 340 300, 490 250" stroke="#c2a15f" strokeWidth="2.5" />
            <path className="road" d="M250 10 C 230 160, 280 340, 250 490" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
            <path className="road" d="M60 60 C 180 180, 320 220, 460 420" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
            {/* markers */}
            <g className="marker">
              <circle cx="250" cy="250" r="9" fill="#e10600" />
              <circle cx="250" cy="250" r="18" stroke="#e10600" strokeWidth="1.5" opacity="0.5" />
            </g>
            <g className="marker"><circle cx="110" cy="250" r="4" fill="#c2a15f" /></g>
            <g className="marker"><circle cx="250" cy="120" r="4" fill="#c2a15f" /></g>
            <g className="marker"><circle cx="380" cy="290" r="4" fill="#c2a15f" /></g>
            <g className="marker"><circle cx="330" cy="380" r="4" fill="#c2a15f" /></g>
          </svg>
          <span className="absolute bottom-3 left-3 text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
            {PROJECT.location} · GCE Road
          </span>
        </div>
      </div>
    </section>
  );
}
