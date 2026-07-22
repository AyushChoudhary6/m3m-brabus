import { useEffect, useRef } from "react";
import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps the app in Lenis smooth scrolling and drives GSAP's ScrollTrigger
 * from Lenis' own RAF loop so parallax and pinning stay perfectly in sync.
 */
export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const onScroll = () => ScrollTrigger.update();
    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", onScroll);

    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", onScroll);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 1,
        // Do NOT smooth touch: on phones, syncTouch hijacks the finger drag and
        // runs it through Lenis' lerp loop, which fights the browser's native
        // momentum scrolling and feels laggy/sticky. Leaving it off lets mobile
        // scroll natively (still smooth) while the wheel stays smoothed on desktop.
        // Lenis keeps reading the native scroll position, so ScrollTrigger-driven
        // sections (Lifestyle horizontal scroll) stay in sync.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
