import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** Editorial page masthead — kicker, monumental serif title with a gold
 *  accent, lede, and a drawn gold rule. Used by every inner page. */
export default function PageHeader({ eyebrow, title, accent, lede, compact = false }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);
      gsap.set(q(".ph-line > span"), { yPercent: 112 });
      gsap.set(q(".ph-fade"), { autoAlpha: 0, y: 20 });
      gsap.set(q(".ph-rule"), { scaleX: 0 });

      gsap
        .timeline({ defaults: { ease: "power4.out" }, delay: 0.1 })
        .to(q(".ph-line > span"), { yPercent: 0, duration: 1.2, stagger: 0.12 }, 0)
        .to(q(".ph-fade"), { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.35)
        .to(q(".ph-rule"), { scaleX: 1, duration: 1.1, ease: "power3.inOut" }, 0.5);
    },
    { scope: root },
  );

  return (
    <header ref={root} className="relative overflow-hidden">
      <div className="gold-glow pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-brass/[0.07] blur-[130px]" />
      <div
        className={`container-lux relative pb-[clamp(2.5rem,7vh,4.5rem)] ${
          compact ? "pt-[clamp(1.5rem,4vh,3rem)]" : "pt-[clamp(9rem,20vh,13rem)]"
        }`}
      >
        <p className="ph-fade kicker">{eyebrow}</p>
        <h1 className="mt-6 max-w-[15ch] font-display text-[clamp(2.6rem,7vw,6rem)] font-light leading-[0.98] tracking-[-0.03em] text-ink">
          <span className="ph-line block overflow-hidden"><span className="block">{title}</span></span>
          {accent && (
            <span className="ph-line block overflow-hidden">
              <span className="block font-serif italic text-brass">{accent}</span>
            </span>
          )}
        </h1>
        {lede && (
          <p className="ph-fade mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">{lede}</p>
        )}
        <div className="ph-rule mt-[clamp(2.5rem,6vh,4rem)] h-px w-full origin-left bg-gradient-to-r from-brass/70 via-line to-transparent" />
      </div>
    </header>
  );
}
