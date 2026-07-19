import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Media from "../ui/Media.jsx";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 04 — THE ARCHITECTURE
   A cinematic reveal before any floor plan. The building emerges from fog as
   a slow camera pushes in; oversized serif words drift through space at
   different depths, and a soft god-ray breathes across the frame. */
export default function ArchitectureReveal() {
  const root = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      gsap.matchMedia().add(
        { reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" },
        (ctx) => {
          if (ctx.conditions.reduce) {
            // Everything visible and static — no motion, no hidden content.
            gsap.set(q(".ar-camera"), { scale: 1, yPercent: 0, filter: "blur(0px)" });
            gsap.set(q(".ar-fog"), { autoAlpha: 0 });
            gsap.set(q(".ar-ray"), { autoAlpha: 0.28 });
            gsap.set(q(".ar-reveal span"), { yPercent: 0 });
            gsap.set(q(".ar-float"), { yPercent: 0, autoAlpha: 1 });
            return;
          }

          // Initial hidden states (layout effect → no flash)
          gsap.set(q(".ar-camera"), { scale: 1.02, filter: "blur(14px)" });
          gsap.set(q(".ar-fog"), { autoAlpha: 1 });
          gsap.set(q(".ar-reveal span"), { yPercent: 118 });
          gsap.set(q(".ar-float"), { autoAlpha: 0 });

          // Mask reveal — serif lines rise as the chapter approaches.
          gsap.to(q(".ar-reveal span"), {
            yPercent: 0,
            ease: "power4.out",
            stagger: 0.08,
            scrollTrigger: { trigger: root.current, start: "top 78%", end: "top 22%", scrub: true },
          });
          gsap.to(q(".ar-float"), {
            autoAlpha: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: root.current, start: "top 70%", end: "top 30%", scrub: true },
          });

          // The camera push + fog clearing + floating typography parallax,
          // scrubbed across the whole (sticky) chapter.
          const cam = gsap.timeline({
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
          });
          cam
            .to(q(".ar-camera"), { scale: 1.26, yPercent: -5, filter: "blur(0px)", ease: "none" }, 0)
            .to(q(".ar-fog"), { autoAlpha: 0, ease: "none", duration: 0.55 }, 0)
            // Depth: each word drifts at its own speed, near words move most.
            .to(q(".ar-float-1"), { yPercent: -34, ease: "none" }, 0)
            .to(q(".ar-float-2"), { yPercent: -68, ease: "none" }, 0)
            .to(q(".ar-float-3"), { yPercent: 22, ease: "none" }, 0)
            .to(q(".ar-copy"), { yPercent: -14, ease: "none" }, 0);

          // God-rays — a barely perceptible angled beam, breathing forever.
          gsap.to(q(".ar-ray"), {
            xPercent: 10,
            yPercent: -6,
            autoAlpha: 0.4,
            duration: 11,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative min-h-[220vh] text-white">
      {/* Sticky viewport — the chapter holds while the camera moves. */}
      <div className="sticky top-3 mx-3 h-[calc(100svh-1.5rem)] overflow-hidden rounded-[1.75rem] md:top-5 md:mx-5 md:h-[calc(100svh-2.5rem)]" data-cursor="VIEW">
        {/* The render — camera push happens on this transform-only layer. */}
        <div className="ar-camera absolute inset-0 will-change-transform">
          <Media
            src={px(IMG.tower, 2000)}
            alt="M3M Brabus tower — three-side-open architecture rising against the sky"
            sizes="100vw"
          />
          {/* Grounding gradients so white type stays legible over the render. */}
          <div className="absolute inset-0 [background:linear-gradient(180deg,rgba(12,10,8,0.62)_0%,rgba(12,10,8,0.10)_42%,rgba(12,10,8,0.82)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/70 via-transparent to-ink-900/40" />
        </div>

        {/* Fog veil — clears as the building emerges into focus. */}
        <div className="ar-fog pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_60%,transparent_0%,rgba(20,17,13,0.55)_55%,rgba(20,17,13,0.92)_100%)] backdrop-blur-sm" />

        {/* God-ray — soft angled beam drifting across the frame. */}
        <div className="ar-ray pointer-events-none absolute -inset-[20%] opacity-25 [background:linear-gradient(115deg,transparent_38%,rgba(230,205,150,0.16)_48%,rgba(243,230,196,0.24)_52%,transparent_62%)] mix-blend-screen" />

        {/* Oversized serif words floating through space at different depths. */}
        <div className="pointer-events-none absolute inset-0 font-display font-light leading-none tracking-[-0.02em] text-white/[0.08]">
          <span className="ar-float ar-float-1 absolute left-[3%] top-[16%] text-[clamp(4rem,17vw,15rem)] italic">
            Light
          </span>
          <span className="ar-float ar-float-3 absolute bottom-[10%] left-[6%] text-[clamp(3.5rem,15vw,13rem)]">
            Space
          </span>
          <span className="ar-float ar-float-2 absolute right-[4%] top-[30%] text-[clamp(3.5rem,15vw,13rem)] italic text-champagne/10">
            Air
          </span>
        </div>

        {/* Headline + supporting line — anchored, corner composition. */}
        <div className="ar-copy relative z-10 flex h-full flex-col justify-end px-[var(--spacing-gutter)] pb-[12vh]">
          <p className="kicker mb-8 text-champagne-soft">Chapter 04 — The Architecture</p>

          <h2 className="max-w-[16ch] font-display text-[clamp(2.6rem,7.5vw,7rem)] font-light leading-[0.98]">
            <span className="ar-reveal block overflow-hidden">
              <span className="block">Three sides open.</span>
            </span>
            <span className="ar-reveal block overflow-hidden">
              <span className="block italic text-brass-soft">One breathing core.</span>
            </span>
          </h2>

          <div className="ar-reveal mt-8 max-w-md overflow-hidden">
            <span className="block text-sm leading-relaxed text-white/70 md:text-base">
              An open-core form with only two homes per core — engineered so every
              residence draws 100% natural light, air and green horizon from three sides.
            </span>
          </div>
        </div>

        {/* Fine grain of atmosphere at the base. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-900 to-transparent" />
      </div>
    </section>
  );
}
