import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Media from "../ui/Media.jsx";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 03 — ENGINEERING
   The BRABUS partnership as a documentary: blueprint lines draw themselves,
   metal fades up, the manifesto reveals line by line. Dark, technical, heavy. */
export default function Engineering() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);

      // Blueprint stroke draw
      q(".blueprint path, .blueprint line, .blueprint circle").forEach((p) => {
        const len = p.getTotalLength ? p.getTotalLength() : 400;
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(p, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 70%", end: "center center", scrub: true },
        });
      });

      // Metal image parallax
      gsap.fromTo(
        q(".eng-metal"),
        { yPercent: -8, scale: 1.1 },
        { yPercent: 8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } }
      );

      // Manifesto lines
      q(".eng-line").forEach((line) => {
        gsap.fromTo(
          line.querySelector("span"),
          { yPercent: 120 },
          { yPercent: 0, ease: "power4.out", scrollTrigger: { trigger: line, start: "top 88%", end: "top 60%", scrub: true } }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative mx-3 min-h-[78vh] overflow-hidden rounded-[2.5rem] bg-ink-900 py-[10vh] text-white md:mx-5">
      {/* Metal visual */}
      <div className="absolute inset-0 opacity-60">
        <div className="eng-metal h-full w-full">
          <Media src={px(IMG.facade, 1800)} alt="BRABUS engineering craftsmanship" sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent" />
      </div>

      {/* Blueprint overlay */}
      <svg className="blueprint pointer-events-none absolute right-[4%] top-1/2 hidden h-[70%] -translate-y-1/2 opacity-30 lg:block" viewBox="0 0 400 500" fill="none" stroke="#c2a15f" strokeWidth="1">
        <circle cx="200" cy="250" r="150" />
        <circle cx="200" cy="250" r="90" />
        <line x1="0" y1="250" x2="400" y2="250" />
        <line x1="200" y1="0" x2="200" y2="500" />
        <path d="M60 120 L340 120 L340 380 L60 380 Z" />
        <path d="M120 60 L120 440 M280 60 L280 440" />
      </svg>

      <div className="relative z-10 px-[var(--spacing-gutter)]">
        <p className="kicker mb-[8vh] text-champagne-soft">Chapter 03 — Engineering</p>

        <div className="max-w-[20ch] font-display text-[clamp(2.2rem,6vw,5.5rem)] font-light leading-[1.04] tracking-[-0.02em]">
          {["Hand-built", "precision,", "translated"].map((t, i) => (
            <div key={i} className="eng-line overflow-hidden">
              <span className="block">{t}</span>
            </div>
          ))}
          <div className="eng-line overflow-hidden">
            <span className="block italic text-brass-soft">into architecture.</span>
          </div>
        </div>

        <div className="mt-[10vh] grid gap-8 md:grid-cols-3">
          {[
            { k: "01", t: "Obsessive detail", d: "Every junction, material and line considered like a bespoke commission." },
            { k: "02", t: "Performance living", d: "Systems, air and light tuned to perform — quietly, precisely, always." },
            { k: "03", t: "Bespoke by nature", d: "No two residences alike. Individually crafted for those who refuse the ordinary." },
          ].map((c) => (
            <div key={c.k} className="border-t border-white/15 pt-6">
              <span className="font-display text-sm italic text-brass-soft">{c.k}</span>
              <h3 className="mt-3 font-display text-xl text-white">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
