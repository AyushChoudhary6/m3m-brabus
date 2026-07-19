import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Media from "../ui/Media.jsx";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* INTERLUDE — THE STANDARD
   A cinematic full-bleed pause. One line, held over warm shadow and a
   drifting gold light. The BRABUS thesis, stated once, with weight. */
export default function Statement() {
  const root = useRef(null);
  const img = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(q(".ed-line > span"), { yPercent: 110 });
        gsap.to(q(".ed-line > span"), {
          yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.14,
          scrollTrigger: { trigger: root.current, start: "top 62%" },
        });
        gsap.fromTo(q(".gold-sweep"), { backgroundPositionX: "120%" }, {
          backgroundPositionX: "-20%", duration: 1.4, ease: "power2.inOut",
          scrollTrigger: { trigger: root.current, start: "top 55%" },
        });
        gsap.fromTo(img.current, { yPercent: -12, scale: 1.12 }, {
          yPercent: 12, scale: 1.12, ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative flex min-h-[82vh] items-center overflow-hidden bg-ink-900">
      <div ref={img} className="absolute inset-0 scale-[1.1] [filter:brightness(0.5)_contrast(1.08)_saturate(0.85)]">
        <Media src={px(IMG.tower, 2000)} alt="M3M Brabus tower" sizes="100vw" />
      </div>
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_120%_at_50%_50%,rgba(8,6,5,0.35),rgba(8,6,5,0.9))]" />
      <div className="gold-glow pointer-events-none absolute -inset-1/4 [background:radial-gradient(36%_36%_at_70%_40%,rgba(201,168,106,0.16),transparent_68%)]" />
      <div className="grain pointer-events-none absolute inset-0" />

      <div className="container-lux relative z-10 py-[12vh]">
        <p className="kicker mb-8 text-champagne">The Standard</p>
        <h2 className="max-w-[18ch] font-display text-[clamp(2.4rem,7vw,6.5rem)] font-light leading-[0.98] tracking-[-0.02em] text-bone">
          <span className="ed-line"><span>Some things are built.</span></span>
          <span className="ed-line">
            <span
              className="gold-sweep font-serif italic"
              style={{
                color: "transparent",
                backgroundImage: "linear-gradient(100deg,#a07c3f 0%,#c9a86a 42%,#f4e6c2 50%,#c9a86a 58%,#a07c3f 100%)",
                backgroundSize: "250% 100%",
                backgroundPositionX: "120%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              This was engineered.
            </span>
          </span>
        </h2>
      </div>
    </section>
  );
}
