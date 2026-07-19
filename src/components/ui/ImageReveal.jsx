import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Clip-path curtain reveal + gentle inner parallax on scroll.
 * The overlay wipes away and the inner content scrubs upward — the
 * signature "expensive" image reveal used by luxury property sites.
 */
export default function ImageReveal({ children, className = "", parallax = 12, rounded = "rounded-sm" }) {
  const wrap = useRef(null);
  const inner = useRef(null);

  useGSAP(
    () => {
      // Curtain wipe on enter.
      gsap.fromTo(
        wrap.current,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.3,
          ease: "power4.out",
          scrollTrigger: { trigger: wrap.current, start: "top 85%" },
        }
      );
      // Inner parallax as the block travels through the viewport.
      gsap.fromTo(
        inner.current,
        { yPercent: -parallax },
        {
          yPercent: parallax,
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: wrap }
  );

  return (
    <div ref={wrap} className={`relative overflow-hidden ${rounded} ${className}`}>
      <div ref={inner} className="absolute inset-0 scale-110" style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
