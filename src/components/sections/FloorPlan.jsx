import { useCallback, useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowUpRight, ChevronLeft, ChevronRight, Expand, Maximize2,
  Minus, Plus, RotateCcw, Shrink, X,
} from "lucide-react";
import Magnetic from "../ui/Magnetic.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";
import usePresence from "../../lib/usePresence.js";
import { CONFIGURATIONS } from "../../lib/facts.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 04 / 28 — THE FLOOR PLAN
   Both configurations, side by side and live — no toggle. Hover any room on
   either plan and it lights in gold while that plan's caption reads it out.
   Each unit outline draws itself on entry and the rooms stagger up. Ch. 28
   adds the enlarged view: the same drawing, opened into a focus-trapped
   lightbox with pinch/wheel zoom, pan and swipe between the two homes.

   No square footage is printed against a single room anywhere on this page.
   M3M publishes a total area per configuration and nothing finer — no carpet
   area, no room dimensions, no compass orientation. So the plan is labelled
   by ZONE (what a room is for), which the drawing itself establishes, and
   every unpublished figure is rendered as an "on request" CTA. */

/* Zones read as a legend and set each room's gold weight. Purely descriptive
   of the layout — no measurement is implied by any of them. */
const ZONES = {
  arrival: { label: "Arrival", fill: 0.05 },
  reception: { label: "Reception", fill: 0.115 },
  private: { label: "Private", fill: 0.07 },
  wellness: { label: "Wellness", fill: 0.09 },
  service: { label: "Service", fill: 0.04 },
  outdoor: { label: "Outdoor", fill: 0.02 },
};

const PLANS = [
  {
    id: "4bhk",
    label: "4 BHK",
    tag: "The Signature",
    composition: "Four bedrooms · living & dining · kitchen · foyer · balcony",
    rooms: [
      { n: "Living & Dining", z: "reception", x: 10, y: 10, w: 370, h: 230 },
      { n: "Kitchen", z: "service", x: 10, y: 250, w: 175, h: 120 },
      { n: "Foyer", z: "arrival", x: 195, y: 250, w: 185, h: 120 },
      { n: "Balcony", z: "outdoor", x: 10, y: 380, w: 370, h: 150 },
      { n: "Master Suite", z: "private", x: 390, y: 10, w: 400, h: 170 },
      { n: "Bedroom 2", z: "private", x: 390, y: 190, w: 195, h: 150 },
      { n: "Bedroom 3", z: "private", x: 595, y: 190, w: 195, h: 150 },
      { n: "Bedroom 4", z: "private", x: 390, y: 350, w: 195, h: 180 },
      { n: "Wellness Bath", z: "wellness", x: 595, y: 350, w: 195, h: 180 },
    ],
  },
  {
    id: "5bhk",
    label: "5 BHK",
    tag: "The Grand",
    composition: "Five bedrooms · living & dining · family lounge · study · sky lounge",
    rooms: [
      { n: "Living & Dining", z: "reception", x: 10, y: 10, w: 370, h: 220 },
      { n: "Family Lounge", z: "reception", x: 10, y: 240, w: 175, h: 130 },
      { n: "Kitchen", z: "service", x: 195, y: 240, w: 185, h: 130 },
      { n: "Balcony", z: "outdoor", x: 10, y: 380, w: 370, h: 150 },
      { n: "Master Suite", z: "private", x: 390, y: 10, w: 400, h: 150 },
      { n: "Bedroom 2", z: "private", x: 390, y: 170, w: 195, h: 130 },
      { n: "Bedroom 3", z: "private", x: 595, y: 170, w: 195, h: 130 },
      { n: "Bedroom 4", z: "private", x: 390, y: 310, w: 195, h: 110 },
      { n: "Bedroom 5", z: "private", x: 595, y: 310, w: 195, h: 110 },
      { n: "Study", z: "private", x: 390, y: 430, w: 195, h: 100 },
      { n: "Sky Lounge", z: "outdoor", x: 595, y: 430, w: 195, h: 100 },
    ],
  },
];

/* Super area comes from the facts layer, never from this file. */
const CONFIG_BY_ID = Object.fromEntries(CONFIGURATIONS.map((c) => [c.id, c]));

const ZONE_KEYS = ["arrival", "reception", "private", "wellness", "service", "outdoor"];
const brass = (a) => `rgba(201,168,106,${a})`;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const MIN_Z = 1;
const MAX_Z = 4;

/* ── the drawing itself ─────────────────────────────────────────────
   One component, two homes: the card renders it with `animated` so GSAP can
   draw it in, the lightbox renders the identical geometry without the
   animation classes so the entry timeline never touches it. */
function PlanSvg({ plan, active, onRoom, animated = false, className = "" }) {
  return (
    <svg
      viewBox="0 0 800 540"
      className={className}
      role="img"
      aria-label={`${plan.label} indicative room layout, ${plan.composition}`}
    >
      <rect
        className={animated ? "plan-frame" : undefined}
        x="1" y="1" width="798" height="538" rx="6"
        fill="none" stroke="var(--color-brass)" strokeWidth="1.2" strokeOpacity="0.55"
      />
      {plan.rooms.map((r, i) => {
        const on = active === i;
        const zone = ZONES[r.z];
        return (
          <g
            key={r.n}
            className={animated ? "room" : undefined}
            onMouseEnter={onRoom ? () => onRoom(i) : undefined}
            onMouseLeave={onRoom ? () => onRoom(null) : undefined}
            style={{ cursor: onRoom ? "pointer" : "default" }}
          >
            <rect
              x={r.x} y={r.y} width={r.w} height={r.h} rx="3"
              style={{
                fill: on ? brass(0.22) : brass(zone.fill),
                stroke: on ? "#c9a86a" : brass(0.28),
                strokeWidth: on ? 1.8 : 1,
                transition: "fill .35s, stroke .35s, stroke-width .35s",
              }}
            />
            <text
              x={r.x + r.w / 2} y={r.y + r.h / 2 - 3}
              textAnchor="middle"
              className={on ? "fill-bone" : "fill-ink-soft"}
              style={{ fontFamily: "var(--font-display)", fontSize: r.w < 190 ? 15 : 18, transition: "fill .35s" }}
            >
              {r.n}
            </text>
            <text
              x={r.x + r.w / 2} y={r.y + r.h / 2 + 17}
              textAnchor="middle"
              className={on ? "fill-brass-soft" : "fill-ink-faint"}
              style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", transition: "fill .35s" }}
            >
              {zone.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── the "we don't publish that" line ───────────────────────────────
   Carpet area and orientation are not on the official listing. Rather than
   print a guess or leave a blank, each becomes a one-tap request. */
function OnRequest({ label, subject, note }) {
  const { openEnquiry } = useEnquiry();
  return (
    <div className="min-w-0">
      <p className="mono text-[0.55rem] tracking-[0.2em] text-ink-faint">{label}</p>
      <button
        type="button"
        onClick={() => openEnquiry(subject)}
        data-cursor="REQUEST"
        aria-label={`${label} — request from the private client team`}
        className="group/or mt-1 inline-flex items-center gap-1.5 rounded-sm font-serif text-sm italic text-brass transition-colors hover:text-brass-soft focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-canvas md:text-base"
      >
        On request
        <ArrowUpRight size={13} className="transition-transform duration-500 group-hover/or:translate-x-0.5" />
      </button>
      {note && <p className="mt-1 text-[0.7rem] leading-relaxed text-ink-faint">{note}</p>}
    </div>
  );
}

/* ── enlarged view ──────────────────────────────────────────────────
   Dark backdrop · aria-modal · focus trapped · Escape closes · body scroll
   restored and every listener detached on unmount. `data-lenis-prevent`
   keeps Lenis off the scrollable panel, as the enquiry modal does.

   `rootRef` comes from the section's usePresence: the parent owns the mount,
   so it owns the node the leaving tween runs on. */
function PlanLightbox({ rootRef, index, onIndex, onClose }) {
  const { openEnquiry } = useEnquiry();
  const dialogRef = useRef(null);
  const stageRef = useRef(null);
  const closeRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef({});
  const titleId = useId();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(null);
  const [isFs, setIsFs] = useState(false);
  const [reduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const plan = PLANS[index];
  const cfg = CONFIG_BY_ID[plan.id];
  const room = hover != null ? plan.rooms[hover] : null;

  /* Pan is bounded by how far the scaled drawing can travel inside the stage,
     so the plan can never be flung out of view and lost. */
  const clampPan = useCallback((x, y, z) => {
    const el = stageRef.current;
    const mx = el ? Math.max(0, (el.clientWidth * (z - 1)) / 2) : 0;
    const my = el ? Math.max(0, (el.clientHeight * (z - 1)) / 2) : 0;
    return { x: clamp(x, -mx, mx), y: clamp(y, -my, my) };
  }, []);

  const setZoomTo = useCallback((z) => {
    const next = clamp(z, MIN_Z, MAX_Z);
    setZoom(next);
    setPan((p) => (next <= 1 ? { x: 0, y: 0 } : clampPan(p.x, p.y, next)));
  }, [clampPan]);

  const reset = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const go = useCallback((dir) => {
    reset();
    setHover(null);
    onIndex((index + dir + PLANS.length) % PLANS.length);
  }, [index, onIndex, reset]);

  /* The keyboard/scroll-lock effect must run exactly once per open — if it
     re-ran on every render it would yank focus back to the close button each
     time a room is hovered. So the moving parts go through refs. */
  const live = useRef({ go, onClose, zoom });
  live.current = { go, onClose, zoom };

  /* Arrival: the backdrop washes in, the panel rises under it. Nothing is set
     to a hidden start value under reduced motion, so the dialog is simply
     there — no dependency on a tween ever running. */
  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
        gsap.fromTo(
          dialogRef.current,
          { opacity: 0, y: 22, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" },
        );
      });
    },
    { scope: rootRef },
  );

  /* Escape, arrow keys and the tab cycle, all on one capturing listener. */
  useEffect(() => {
    const node = dialogRef.current;
    const restoreTo = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const SEL = 'button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); live.current.onClose(); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); live.current.go(1); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); live.current.go(-1); return; }
      if (e.key !== "Tab" || !node) return;
      const f = Array.from(node.querySelectorAll(SEL)).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const onFs = () => setIsFs(Boolean(document.fullscreenElement));

    document.addEventListener("keydown", onKey, true);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("fullscreenchange", onFs);
      document.body.style.overflow = prevOverflow;
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      if (restoreTo instanceof HTMLElement) restoreTo.focus();
    };
  }, []);

  /* React registers wheel passively at the root, so preventDefault there is
     ignored — bind it natively to stop the page scrolling under the zoom. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      setZoomTo(live.current.zoom * Math.exp(-e.deltaY * 0.0016));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setZoomTo]);

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const onPointerDown = (e) => {
    stageRef.current?.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointers.current.values());
    if (pts.length === 2) {
      gesture.current = { pinch: dist(pts[0], pts[1]), startZoom: zoom };
    } else if (pts.length === 1) {
      gesture.current = { start: { x: e.clientX, y: e.clientY }, startPan: pan, dx: 0, dy: 0 };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointers.current.values());
    const g = gesture.current;

    if (pts.length >= 2 && g.pinch) {
      setZoomTo(g.startZoom * (dist(pts[0], pts[1]) / g.pinch));
      return;
    }
    if (pts.length !== 1 || !g.start) return;
    g.dx = e.clientX - g.start.x;
    g.dy = e.clientY - g.start.y;
    /* Zoomed in, one finger pans. At rest, one finger swipes between homes. */
    if (zoom > 1) setPan(clampPan(g.startPan.x + g.dx, g.startPan.y + g.dy, zoom));
  };

  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    stageRef.current?.releasePointerCapture?.(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size === 0) {
      if (zoom === 1 && g.start && Math.abs(g.dx) > 56 && Math.abs(g.dy) < 64) go(g.dx < 0 ? 1 : -1);
      gesture.current = {};
    } else {
      /* A finger lifted mid-pinch — re-anchor so the plan doesn't jump. */
      const [p] = Array.from(pointers.current.values());
      gesture.current = { start: { x: p.x, y: p.y }, startPan: pan, dx: 0, dy: 0 };
    }
  };

  const toggleFs = () => {
    const el = dialogRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  };
  const canFs = typeof document !== "undefined" && Boolean(document.documentElement.requestFullscreen);

  const requestHd = () => { onClose(); openEnquiry("HD floor plan"); };

  const ctl =
    "grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-brass hover:text-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass disabled:opacity-35 disabled:hover:border-line disabled:hover:text-ink-soft";

  return (
    <div
      ref={rootRef}
      onClick={onClose}
      data-lenis-prevent
      className="fixed inset-0 z-[110] flex items-stretch justify-center overflow-y-auto bg-black/90 p-3 backdrop-blur-md sm:p-6"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="relative m-auto flex max-h-full w-full max-w-6xl flex-col overflow-y-auto rounded-[1.25rem] border border-brass/25 bg-paper shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]"
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/60 to-transparent" />

        {/* masthead — which home, and the switch between them */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-5 py-4 md:px-8 md:py-5">
          <div className="min-w-0">
            <p className="kicker">{plan.tag}</p>
            <h2 id={titleId} className="mt-1 font-display text-2xl font-light tracking-[-0.01em] text-ink md:text-3xl">
              {plan.label} <span className="font-serif italic text-brass">floor plan</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div aria-label="Choose a configuration" className="flex items-center gap-1 rounded-full border border-line p-1">
              {PLANS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={i === index}
                  aria-label={`Show the ${p.label} floor plan`}
                  onClick={() => { if (i !== index) { reset(); setHover(null); onIndex(i); } }}
                  className={`mono rounded-full px-3.5 py-1.5 text-[0.6rem] tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass ${
                    i === index ? "bg-brass text-obsidian" : "text-ink-soft hover:text-brass"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close the enlarged floor plan" data-cursor="CLOSE" className={ctl}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* the enlarged drawing */}
        <div className="relative flex-1 border-b border-line bg-canvas/60">
          <div className="gold-glow pointer-events-none absolute inset-0 [background:radial-gradient(40%_46%_at_50%_46%,rgba(201,168,106,0.08),transparent_72%)]" />

          <div
            ref={stageRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ touchAction: "none", cursor: zoom > 1 ? "grab" : "default" }}
            className="relative h-[min(58vh,34rem)] select-none overflow-hidden px-4 py-4 md:px-8"
          >
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transformOrigin: "center center",
                transition: reduce || pointers.current.size ? "none" : "transform .25s var(--ease-lux)",
                willChange: "transform",
              }}
            >
              <PlanSvg
                plan={plan}
                active={hover}
                onRoom={setHover}
                className="max-h-full w-full"
              />
            </div>
          </div>

          {/* controls — zoom, full screen, and the two homes on either side */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 pb-4 md:px-8">
            <button type="button" onClick={() => go(-1)} aria-label="Previous configuration" className={`pointer-events-auto bg-paper/80 backdrop-blur ${ctl}`}>
              <ChevronLeft size={16} />
            </button>

            <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-line bg-paper/85 px-2 py-1.5 backdrop-blur">
              <button type="button" onClick={() => setZoomTo(zoom - 0.5)} disabled={zoom <= MIN_Z} aria-label="Zoom out" className={ctl}>
                <Minus size={15} />
              </button>
              <span aria-live="polite" className="mono w-12 text-center text-[0.58rem] tracking-[0.14em] text-ink-soft">
                {Math.round(zoom * 100)}%
              </span>
              <button type="button" onClick={() => setZoomTo(zoom + 0.5)} disabled={zoom >= MAX_Z} aria-label="Zoom in" className={ctl}>
                <Plus size={15} />
              </button>
              <button type="button" onClick={reset} disabled={zoom === 1 && pan.x === 0 && pan.y === 0} aria-label="Reset the zoom" className={ctl}>
                <RotateCcw size={14} />
              </button>
              {canFs && (
                <button type="button" onClick={toggleFs} aria-label={isFs ? "Exit full screen" : "View full screen"} className={ctl}>
                  {isFs ? <Shrink size={15} /> : <Expand size={15} />}
                </button>
              )}
            </div>

            <button type="button" onClick={() => go(1)} aria-label="Next configuration" className={`pointer-events-auto bg-paper/80 backdrop-blur ${ctl}`}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* what is known, and what is only known on request */}
        <div className="grid gap-6 px-5 py-6 md:grid-cols-[1.1fr_auto] md:items-end md:px-8 md:py-7">
          <div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
              <div className="min-w-0">
                <p className="mono text-[0.55rem] tracking-[0.2em] text-ink-faint">Super area</p>
                <p className="mt-1 font-serif text-sm italic text-brass md:text-base">{cfg.size}</p>
                <p className="mt-1 text-[0.7rem] leading-relaxed text-ink-faint">Total area, as published.</p>
              </div>
              <OnRequest label="Carpet area" subject={`Carpet area · ${plan.label}`} note="Not published by the developer." />
              <OnRequest label="Orientation" subject={`Orientation · ${plan.label}`} note="Aspect and orientation are confirmed against the sanctioned plan." />
              <div className="min-w-0">
                <p className="mono text-[0.55rem] tracking-[0.2em] text-ink-faint">{room ? "Room" : "Room layout"}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink">
                  {room ? `${room.n} · ${ZONES[room.z].label}` : plan.composition}
                </p>
              </div>
            </div>
            <p className="mono mt-6 text-[0.55rem] leading-relaxed tracking-[0.18em] text-ink-faint">
              Indicative layout · not to scale · dimensioned drawings on request
            </p>
          </div>

          <button
            type="button"
            onClick={requestHd}
            data-cursor="REQUEST"
            className="group/cta relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-brass/50 px-6 py-3.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
            <span className="relative z-10 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
              Request HD floor plan
            </span>
            <ArrowUpRight size={14} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
          </button>
        </div>

        <p className="mono border-t border-line px-5 py-3 text-center text-[0.54rem] tracking-[0.18em] text-ink-faint md:px-8">
          Pinch or scroll to zoom · drag to pan · swipe or ← → to change home · Esc to close
        </p>
      </div>
    </div>
  );
}

export default function FloorPlan() {
  const root = useRef(null);
  const [hover, setHover] = useState(null); // { id, i }
  const [openAt, setOpenAt] = useState(null); // index of the enlarged plan
  const { openEnquiry } = useEnquiry();

  /* Leaving: the panel settles back down as the backdrop lifts. The lightbox
     stays mounted for the duration, which is also what keeps its scroll lock,
     focus restore and listener teardown running in the right order — they all
     hang off its unmount, and its unmount now comes last. */
  const exitLightbox = useCallback(
    (node, done) =>
      gsap
        .timeline({ onComplete: done })
        .to(node.querySelector('[role="dialog"]'), {
          opacity: 0,
          y: 14,
          scale: 0.985,
          duration: 0.3,
          ease: "power2.in",
        }, 0)
        .to(node, { opacity: 0, duration: 0.3, ease: "power2.in" }, 0.05),
    [],
  );

  const { mounted: lightboxMounted, ref: lightboxRef } = usePresence(openAt != null, exitLightbox);

  /* Which plan to keep drawing while the lightbox animates away, after
     `openAt` has already been cleared. */
  const lastAt = useRef(0);
  if (openAt != null) lastAt.current = openAt;

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        q(".plan-frame").forEach((f) => {
          const len = (f.getTotalLength && f.getTotalLength()) || 2680;
          gsap.set(f, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.set(q(".room"), { autoAlpha: 0, y: 16 });

        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top 74%" } })
          .to(q(".plan-frame"), { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, 0)
          .to(q(".room"), { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.03 }, 0.3);
      });
    },
    { scope: root },
  );

  return (
    <section id="floor-plan" ref={root} className="container-lux py-[clamp(5rem,13vh,9rem)]">
      {/* header */}
      <div className="mb-[clamp(2.5rem,6vh,4.5rem)] grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
        <div className="flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">The Floor Plan</span>
        </div>
        <h2 className="max-w-[20ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
          Two homes, drawn to <span className="font-serif italic text-brass">the last inch.</span>
        </h2>
      </div>

      {/* both plans, side by side */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {PLANS.map((plan, idx) => {
          const cfg = CONFIG_BY_ID[plan.id];
          const active = hover && hover.id === plan.id ? hover.i : null;
          const room = active != null ? plan.rooms[active] : null;
          const enlarge = () => setOpenAt(idx);
          return (
            <div key={plan.id} className="relative rounded-[1.25rem] border border-line bg-cream/40 p-5 md:p-7">
              <div className="gold-glow pointer-events-none absolute -inset-8 [background:radial-gradient(42%_42%_at_50%_42%,rgba(201,168,106,0.09),transparent_70%)]" />

              {/* plan header + live readout */}
              <div className="relative mb-5 flex items-end justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="kicker">{plan.tag}</p>
                  <h3 className="mt-1.5 font-display text-2xl font-light tracking-[-0.01em] text-ink md:text-3xl">{plan.label}</h3>
                </div>
                <div className="text-right">
                  <p className="mono text-[0.55rem] tracking-[0.2em] text-ink-faint">{room ? "Room" : "Super area"}</p>
                  <p className="mt-1 font-serif text-base italic text-brass md:text-lg">
                    {room ? `${room.n} · ${ZONES[room.z].label}` : cfg.size}
                  </p>
                </div>
              </div>

              {/* interactive plan — the whole drawing is the enlarge control */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`Enlarge the ${plan.label} floor plan`}
                data-cursor="ENLARGE"
                onClick={enlarge}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); enlarge(); }
                }}
                className="group/plan relative block w-full cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
              >
                <PlanSvg plan={plan} active={active} onRoom={(i) => setHover(i == null ? null : { id: plan.id, i })} animated className="relative w-full" />
                <span className="mono pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/80 px-3 py-1.5 text-[0.55rem] tracking-[0.18em] text-ink-soft opacity-0 backdrop-blur transition-opacity duration-500 group-hover/plan:opacity-100 group-focus-visible/plan:opacity-100">
                  <Maximize2 size={12} className="text-brass" />
                  Enlarge
                </span>
              </div>

              {/* zone legend — what the gold weights mean */}
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {ZONE_KEYS.map((k) => (
                  <li key={k} className="mono flex items-center gap-1.5 text-[0.52rem] tracking-[0.16em] text-ink-faint">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-[2px] border border-brass/30"
                      style={{ background: brass(ZONES[k].fill + 0.03) }}
                    />
                    {ZONES[k].label}
                  </li>
                ))}
              </ul>

              {/* the published figure, and the two that are not */}
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-3">
                <div className="min-w-0">
                  <p className="mono text-[0.55rem] tracking-[0.2em] text-ink-faint">Super area</p>
                  <p className="mt-1 font-serif text-sm italic text-brass md:text-base">{cfg.size}</p>
                  <p className="mt-1 text-[0.7rem] leading-relaxed text-ink-faint">Total area, as published.</p>
                </div>
                <OnRequest label="Carpet area" subject={`Carpet area · ${plan.label}`} note="Not published by the developer." />
                <OnRequest label="Orientation" subject={`Orientation · ${plan.label}`} note="Aspect and orientation are confirmed against the sanctioned plan." />
              </div>

              <p className="mt-5 text-sm leading-relaxed text-ink-soft">{plan.composition}</p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <button
                  type="button"
                  onClick={enlarge}
                  aria-label={`Open the enlarged ${plan.label} floor plan`}
                  className="mono inline-flex items-center gap-2 text-[0.6rem] tracking-[0.18em] text-brass transition-colors hover:text-brass-soft focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
                >
                  <Maximize2 size={13} />
                  Enlarged view
                </button>
                <p className="mono text-[0.54rem] tracking-[0.18em] text-ink-faint">Indicative layout · not to scale</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* shared CTA */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
        <p className="max-w-md text-sm leading-relaxed text-ink-soft">
          Dimensioned drawings, carpet areas, unit orientation and the master site plan are shared
          privately, in high resolution, on request.
        </p>
        <Magnetic>
          <button
            type="button"
            onClick={() => openEnquiry("HD floor plan")}
            data-cursor="REQUEST"
            className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-6 py-3.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
            <span className="relative z-10 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
              Request HD floor plan
            </span>
            <ArrowUpRight size={14} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
          </button>
        </Magnetic>
      </div>

      {lightboxMounted && (
        <PlanLightbox
          rootRef={lightboxRef}
          index={openAt ?? lastAt.current}
          onIndex={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </section>
  );
}
