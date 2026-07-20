import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Thin bronze reading-progress hairline pinned to the top of the viewport. */
export default function ScrollProgress() {
  const bar = useRef(null);

  useGSAP(
    () => {
      /* The bar reports position, so it keeps working under reduced motion —
         what goes is the smoothing. A scrub of 0.3s reproduces the old spring
         (stiffness 120 / damping 30 / mass 0.3 was overdamped, ~0.24s to
         catch up); `true` pins it to the scroll position with no lag at all. */
      gsap.matchMedia().add(
        {
          smooth: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          gsap.fromTo(
            bar.current,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: { start: 0, end: "max", scrub: ctx.conditions.smooth ? 0.3 : true },
            },
          );
        },
      );
    },
    { scope: bar },
  );

  return <div ref={bar} className="fixed inset-x-0 top-0 z-[65] h-px origin-left scale-x-0 bg-brass" />;
}
