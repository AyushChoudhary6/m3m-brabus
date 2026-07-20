import { createElement, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* --ease-lux is cubic-bezier(0.22, 1, 0.36, 1) — a quintic ease-out, which is
   exactly what GSAP calls power4.out. Using the stock ease rather than
   CustomEase keeps the curve identical without shipping another plugin. */
const EASE = "power4.out";

/* Framer expressed the trigger point as a shrunken viewport ("-12% 0px");
   ScrollTrigger says the same thing from the other side — the element's top
   crossing 88% of the viewport height. Both fire once and never reverse. */

/** Fade + rise on scroll into view. Static under reduced motion. */
export function Reveal({ children, delay = 0, y = 34, className = "", as = "div" }) {
  const el = useRef(null);

  useGSAP(
    () => {
      /* Only this branch ever sets opacity: 0. With reduced motion nothing is
         written at all, so the markup stays visible — which is also what the
         prerenderer captures, since Chrome runs it with
         --force-prefers-reduced-motion. Inverting this guard would silently
         empty every prerendered page. */
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        /* The delay lives as a timeline position rather than a tween delay:
           ScrollTrigger parks a tween at time 0, which would swallow it. */
        gsap
          .timeline({ scrollTrigger: { trigger: el.current, start: "top 88%" } })
          .from(el.current, { opacity: 0, y, duration: 0.9, ease: EASE }, delay);
      });
    },
    { scope: el, dependencies: [delay, y] },
  );

  return createElement(as, { ref: el, className }, children);
}

/** Stagger container — children use <RevealItem>. */
export function RevealGroup({ children, className = "", stagger = 0.09 }) {
  const el = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        // Direct children only, so a nested group never steals another's items.
        const items = gsap.utils.toArray(el.current.querySelectorAll(":scope > .reveal-item"));
        if (!items.length) return;

        gsap.from(items, {
          opacity: 0,
          // Each item still owns its own distance, as it did via variants.
          y: (_i, target) => Number(target.dataset.revealY) || 30,
          duration: 0.8,
          ease: EASE,
          stagger,
          scrollTrigger: { trigger: el.current, start: "top 90%" },
        });
      });
    },
    { scope: el, dependencies: [stagger] },
  );

  return (
    <div ref={el} className={className}>
      {children}
    </div>
  );
}

/** A member of a <RevealGroup>. Inert on its own — the group drives the tween. */
export function RevealItem({ children, className = "", y = 30 }) {
  return (
    <div className={className ? `reveal-item ${className}` : "reveal-item"} data-reveal-y={y}>
      {children}
    </div>
  );
}
