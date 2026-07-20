import { useEffect, useRef, useState } from "react";

/* <AnimatePresence>, in about forty lines of plain React.
 *
 * GSAP cannot animate an element out declaratively, because React has already
 * torn the node out of the DOM by the time the tween would start. The cure is
 * to stop conflating "should this be open" with "is this still mounted": when
 * `active` drops we keep rendering, hand the live node to an exit tween, and
 * unmount only once that tween reports back.
 *
 * Reduced motion is decided here rather than in each caller, so the answer is
 * the same everywhere — and so the prerenderer, which runs Chrome with
 * --force-prefers-reduced-motion, never sits waiting on an exit that will not
 * play.
 *
 * @param {boolean}  active  whether the element should be on screen
 * @param {(node: Element, done: () => void) => any} exit
 *        runs the leave animation and calls `done`; may return a GSAP
 *        animation, which is killed if the element is re-opened mid-flight
 * @returns {{ mounted: boolean, ref: import("react").RefObject<any> }}
 *
 * Note for callers: a re-open during the exit reuses the *same* node, so the
 * enter animation must set its own start values (gsap.set) rather than assume
 * the element is untouched.
 */
export default function usePresence(active, exit) {
  const [exiting, setExiting] = useState(false);
  const ref = useRef(null);

  // Always reach the latest closure without re-triggering the exit effect.
  const exitRef = useRef(exit);
  exitRef.current = exit;

  /* Derived during render, deliberately not in an effect: by the time an
     effect ran, the render that dropped `active` would already have unmounted
     the node we need to animate. */
  const wasActive = useRef(active);
  if (wasActive.current !== active) {
    wasActive.current = active;
    setExiting(!active);
  }

  useEffect(() => {
    if (!exiting) return undefined;

    const node = ref.current;
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      setExiting(false);
    };

    const skip =
      !node ||
      typeof exitRef.current !== "function" ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (skip) {
      done();
      return undefined;
    }

    const anim = exitRef.current(node, done);
    return () => {
      settled = true; // re-opened, or the owner unmounted, mid-flight
      anim?.kill?.();
    };
  }, [exiting]);

  return { mounted: active || exiting, ref };
}
