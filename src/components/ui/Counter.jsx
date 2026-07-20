import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Counts up to `value` when scrolled into view. `duration` is milliseconds. */
export default function Counter({ value, suffix = "", duration = 1600 }) {
  const ref = useRef(null);
  /* Starts at the answer, not at zero: a figure is information, not decoration,
     so a reduced-motion reader — and the prerenderer, which forces it — must
     find the real number in the markup rather than a stranded "0". */
  const [n, setN] = useState(value);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { n: 0 };
        setN(0); // layout effect, so this lands before the first paint

        // power2.out is GSAP's cubic ease-out the hand-rolled rAF loop used.
        const tween = gsap.to(counter, {
          n: value,
          duration: duration / 1000,
          ease: "power2.out",
          paused: true,
          onUpdate: () => setN(Math.round(counter.n)),
        });

        ScrollTrigger.create({
          trigger: ref.current,
          start: "top 80%", // Framer's "-20% 0px" viewport margin
          once: true,
          onEnter: () => tween.play(),
        });

        return () => tween.kill();
      });
    },
    { scope: ref, dependencies: [value, duration] },
  );

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}
