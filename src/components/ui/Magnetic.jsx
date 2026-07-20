import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Magnetic hover: child drifts toward the cursor while hovered,
 * springs back on leave. Wrap buttons or icons.
 */
export default function Magnetic({ children, strength = 0.4, className = "" }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const el = ref.current;

        /* quickTo is the house idiom for cursor-driven motion (see Hero's film
           parallax). power3.out over 0.45s lands where the old spring did —
           stiffness 250 / damping 18 / mass 0.4 settled in roughly a quarter
           second with barely any overshoot. */
        const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * strength);
          yTo((e.clientY - (r.top + r.height / 2)) * strength);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };

        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => {
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
        };
      });
    },
    { scope: ref, dependencies: [strength] },
  );

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}
