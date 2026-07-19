import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";
import clsx from "clsx";

gsap.registerPlugin(useGSAP);

/**
 * Word-by-word masked reveal using SplitType + GSAP.
 * Animates on mount (great for hero) — set trigger to scrub on scroll if needed.
 */
export default function SplitHeading({ text, className, as: Tag = "h1", delay = 0.15 }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const split = new SplitType(ref.current, { types: "lines,words", lineClass: "split-line" });
      gsap.set(".split-line", { overflow: "hidden" });
      gsap.from(split.words, {
        yPercent: 120,
        opacity: 0,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.06,
        delay,
      });
      return () => split.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={clsx("[&_.split-line]:overflow-hidden [&_.word]:inline-block", className)}>
      {text}
    </Tag>
  );
}
