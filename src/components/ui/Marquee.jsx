import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** Seamless infinite marquee. `items` repeats twice for the loop. */
export default function Marquee({ items, speed = 26, className = "" }) {
  const wrap = useRef(null);
  const row = useRef(null);

  useGSAP(
    () => {
      /* Content is duplicated, so travelling exactly half the row's width and
         snapping back is invisible. Static under reduced motion — an endless
         horizontal crawl is the least welcome thing for a vestibular reader. */
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(row.current, { xPercent: -50, duration: speed, ease: "none", repeat: -1 });
      });
    },
    { scope: wrap, dependencies: [speed] },
  );

  return (
    <div ref={wrap} className={`overflow-hidden ${className}`}>
      <div ref={row} className="flex w-max gap-16 whitespace-nowrap">
        {[...items, ...items].map((it, i) => (
          <span
            key={i}
            className="flex items-center gap-16 font-display text-[clamp(2rem,7vw,5rem)] italic tracking-tight text-transparent [-webkit-text-stroke:1px_var(--color-line)]"
          >
            {it}
            <span className="text-[0.4em] not-italic text-brass [-webkit-text-stroke:0]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
