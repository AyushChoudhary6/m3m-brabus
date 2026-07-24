import { useEffect, useRef, useState } from "react";

/**
 * Editorial custom cursor: a small brass dot + an outline ring that tracks the
 * pointer directly (no trailing lag). Ring grows and labels when hovering
 * elements marked `data-cursor` (optionally `data-cursor="View"` to show a
 * caption). Desktop only.
 */
export default function CustomCursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Skip on touch / coarse pointers.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const move = (e) => {
      // Dot and ring share the pointer position — the ring used to lerp toward
      // it in a rAF loop, which read as a trailing tail; it now tracks 1:1.
      const transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (dot.current) dot.current.style.transform = transform;
      if (ring.current) ring.current.style.transform = transform;
    };

    const over = (e) => {
      const t = e.target.closest("[data-cursor], a, button");
      if (t) {
        setActive(true);
        setLabel(t.getAttribute?.("data-cursor") || "");
      }
    };
    const out = (e) => {
      const t = e.target.closest("[data-cursor], a, button");
      if (t) {
        setActive(false);
        setLabel("");
      }
    };
    const enter = () => setHidden(false);
    const leave = () => setHidden(true);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    document.addEventListener("mouseenter", enter);
    document.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.removeEventListener("mouseenter", enter);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div className={`pointer-events-none fixed inset-0 z-[70] hidden lg:block ${hidden ? "opacity-0" : "opacity-100"}`}>
      <div
        ref={dot}
        className="absolute -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-brass transition-opacity"
        style={{ willChange: "transform" }}
      />
      <div
        ref={ring}
        className={`absolute grid place-items-center rounded-full border border-ink/40 transition-[width,height,background-color,border-color] duration-300 ease-out ${
          active ? "h-16 w-16 border-brass bg-brass/10" : "h-8 w-8"
        }`}
        style={{ marginLeft: active ? -32 : -16, marginTop: active ? -32 : -16, willChange: "transform" }}
      >
        {label && (
          <span className="font-sans text-[0.55rem] uppercase tracking-[0.15em] text-brass">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
