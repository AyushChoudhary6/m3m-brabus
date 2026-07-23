import { useCallback, useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ChevronLeft, ChevronRight, Expand, Lock, Maximize2,
  Minus, Plus, RotateCcw, Shrink, X,
} from "lucide-react";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { useI18n } from "../../lib/i18n.jsx";
import usePresence from "../../lib/usePresence.js";
import { CONFIGURATIONS } from "../../lib/facts.js";
import { hasLeadCaptured, LEAD_EVENT } from "../../lib/leads.js";

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
  arrival: { label: "Arrival", tKey: "sfloorplan.zoneArrival", fill: 0.05 },
  reception: { label: "Reception", tKey: "sfloorplan.zoneReception", fill: 0.115 },
  private: { label: "Private", tKey: "sfloorplan.zonePrivate", fill: 0.07 },
  wellness: { label: "Wellness", tKey: "sfloorplan.zoneWellness", fill: 0.09 },
  service: { label: "Service", tKey: "sfloorplan.zoneService", fill: 0.04 },
  outdoor: { label: "Outdoor", tKey: "sfloorplan.zoneOutdoor", fill: 0.02 },
};

const PLANS = [
  {
    id: "4bhk",
    label: "4 BHK",
    tag: "The Signature",
    tagKey: "sfloorplan.tagSignature",
    // Gated drawing — blurred until the visitor gives their details.
    image: "/renders/floor-plan-4bhk.jpg",
    composition: "Four bedrooms · living & dining · kitchen · foyer · balcony",
    compKey: "sfloorplan.comp4bhk",
    rooms: [
      { n: "Living & Dining", tKey: "sfloorplan.roomLivingDining", z: "reception", x: 10, y: 10, w: 370, h: 230 },
      { n: "Kitchen", tKey: "sfloorplan.roomKitchen", z: "service", x: 10, y: 250, w: 175, h: 120 },
      { n: "Foyer", tKey: "sfloorplan.roomFoyer", z: "arrival", x: 195, y: 250, w: 185, h: 120 },
      { n: "Balcony", tKey: "sfloorplan.roomBalcony", z: "outdoor", x: 10, y: 380, w: 370, h: 150 },
      { n: "Master Suite", tKey: "sfloorplan.roomMasterSuite", z: "private", x: 390, y: 10, w: 400, h: 170 },
      { n: "Bedroom 2", tKey: "sfloorplan.roomBed2", z: "private", x: 390, y: 190, w: 195, h: 150 },
      { n: "Bedroom 3", tKey: "sfloorplan.roomBed3", z: "private", x: 595, y: 190, w: 195, h: 150 },
      { n: "Bedroom 4", tKey: "sfloorplan.roomBed4", z: "private", x: 390, y: 350, w: 195, h: 180 },
      { n: "Wellness Bath", tKey: "sfloorplan.roomWellnessBath", z: "wellness", x: 595, y: 350, w: 195, h: 180 },
    ],
  },
  {
    id: "5bhk",
    label: "5 BHK",
    tag: "The Grand",
    tagKey: "sfloorplan.tagGrand",
    image: "/renders/floor-plan-5bhk.jpg",
    composition: "Five bedrooms · living & dining · family lounge · study · sky lounge",
    compKey: "sfloorplan.comp5bhk",
    rooms: [
      { n: "Living & Dining", tKey: "sfloorplan.roomLivingDining", z: "reception", x: 10, y: 10, w: 370, h: 220 },
      { n: "Family Lounge", tKey: "sfloorplan.roomFamilyLounge", z: "reception", x: 10, y: 240, w: 175, h: 130 },
      { n: "Kitchen", tKey: "sfloorplan.roomKitchen", z: "service", x: 195, y: 240, w: 185, h: 130 },
      { n: "Balcony", tKey: "sfloorplan.roomBalcony", z: "outdoor", x: 10, y: 380, w: 370, h: 150 },
      { n: "Master Suite", tKey: "sfloorplan.roomMasterSuite", z: "private", x: 390, y: 10, w: 400, h: 150 },
      { n: "Bedroom 2", tKey: "sfloorplan.roomBed2", z: "private", x: 390, y: 170, w: 195, h: 130 },
      { n: "Bedroom 3", tKey: "sfloorplan.roomBed3", z: "private", x: 595, y: 170, w: 195, h: 130 },
      { n: "Bedroom 4", tKey: "sfloorplan.roomBed4", z: "private", x: 390, y: 310, w: 195, h: 110 },
      { n: "Bedroom 5", tKey: "sfloorplan.roomBed5", z: "private", x: 595, y: 310, w: 195, h: 110 },
      { n: "Study", tKey: "sfloorplan.roomStudy", z: "private", x: 390, y: 430, w: 195, h: 100 },
      { n: "Sky Lounge", tKey: "sfloorplan.roomSkyLounge", z: "outdoor", x: 595, y: 430, w: 195, h: 100 },
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
  const { t } = useI18n();
  return (
    <svg
      viewBox="0 0 800 540"
      className={className}
      role="img"
      aria-label={`${plan.label} ${t("sfloorplan.roomLayoutAria")}، ${t(plan.compKey)}`}
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
              {t(r.tKey)}
            </text>
            <text
              x={r.x + r.w / 2} y={r.y + r.h / 2 + 17}
              textAnchor="middle"
              className={on ? "fill-brass-soft" : "fill-ink-faint"}
              style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", transition: "fill .35s" }}
            >
              {t(zone.tKey)}
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
/**
 * Unlocked once the visitor has submitted an enquiry. Read after mount, never
 * during render, so the prerendered HTML is always the LOCKED state — otherwise
 * the static snapshot and the hydrated view would disagree.
 */
function useLeadUnlocked() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const sync = () => setUnlocked(hasLeadCaptured());
    sync();
    window.addEventListener(LEAD_EVENT, sync); // same tab, the moment the form succeeds
    window.addEventListener("storage", sync); // another tab captured the lead
    return () => {
      window.removeEventListener(LEAD_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return unlocked;
}

/**
 * The drawing. Locked, it renders blurred under a lock plate and the whole
 * plate opens the enquiry form; once details are given it un-blurs and becomes
 * the enlarge control. The blur is applied to the image itself (not an overlay)
 * so the un-gated drawing is never sitting in the DOM at full clarity.
 */
function GatedPlan({ plan, unlocked, onEnlarge }) {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);

  // onEnlarge is already gated by the parent, so this is just "activate".
  const act = () => onEnlarge();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={
        unlocked
          ? `${t("sfloorplan.enlargeThe")} ${plan.label}`
          : `${t("sfloorplan.unlockAria")} ${plan.label}`
      }
      data-cursor={unlocked ? "ENLARGE" : "UNLOCK"}
      onClick={act}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); }
      }}
      className="group/plan relative block w-full cursor-pointer overflow-hidden rounded-lg border border-line focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
    >
      {failed ? (
        // Drawing not supplied yet — hold the frame rather than show a broken image.
        <div className="aspect-[4/3] w-full bg-ink-900/50" />
      ) : (
        <img
          src={plan.image}
          alt={unlocked ? `${plan.label} — ${t("sfloorplan.kicker")}` : ""}
          aria-hidden={unlocked ? undefined : "true"}
          onError={() => setFailed(true)}
          draggable="false"
          loading="lazy"
          className={`block w-full select-none transition-[filter,transform] duration-700 ease-lux ${
            unlocked ? "" : "scale-105 blur-[14px]"
          }`}
        />
      )}

      {unlocked ? (
        <span className="mono pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/80 px-3 py-1.5 text-[0.55rem] tracking-[0.18em] text-ink-soft opacity-0 backdrop-blur transition-opacity duration-500 group-hover/plan:opacity-100 group-focus-visible/plan:opacity-100">
          <Maximize2 size={12} className="text-brass" />
          {t("sfloorplan.enlarge")}
        </span>
      ) : (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-obsidian/45 p-6 text-center">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-brass/40 bg-obsidian/70 text-brass">
              <Lock size={18} />
            </span>
            <p className="mt-4 font-display text-lg font-light text-bone">{t("sfloorplan.lockedTitle")}</p>
            <p className="mono mt-2 text-[0.58rem] tracking-[0.18em] text-brass">{t("sfloorplan.lockedCta")}</p>
          </div>
        </div>
      )}
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
  const { t } = useI18n();
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
              {plan.label} <span className="font-serif italic text-brass">{t("sfloorplan.floorPlan")}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div aria-label={t("sfloorplan.chooseConfig")} className="flex items-center gap-1 rounded-full border border-line p-1">
              {PLANS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={i === index}
                  aria-label={`${t("sfloorplan.showThePlan")} ${p.label}`}
                  onClick={() => { if (i !== index) { reset(); setHover(null); onIndex(i); } }}
                  className={`mono rounded-full px-3.5 py-1.5 text-[0.6rem] tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass ${
                    i === index ? "bg-brass text-obsidian" : "text-ink-soft hover:text-brass"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label={t("sfloorplan.closeEnlarged")} data-cursor="CLOSE" className={ctl}>
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
              {/* The lightbox is only reachable once unlocked, so the drawing
                  shows at full clarity here. */}
              <img
                src={plan.image}
                alt={`${plan.label} — ${t("sfloorplan.kicker")}`}
                draggable="false"
                className="max-h-full w-full select-none object-contain"
              />
            </div>
          </div>

          {/* controls — zoom, full screen, and the two homes on either side */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 pb-4 md:px-8">
            <button type="button" onClick={() => go(-1)} aria-label={t("sfloorplan.prevConfig")} className={`pointer-events-auto bg-paper/80 backdrop-blur ${ctl}`}>
              <ChevronLeft size={16} />
            </button>

            <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-line bg-paper/85 px-2 py-1.5 backdrop-blur">
              <button type="button" onClick={() => setZoomTo(zoom - 0.5)} disabled={zoom <= MIN_Z} aria-label={t("sfloorplan.zoomOut")} className={ctl}>
                <Minus size={15} />
              </button>
              <span aria-live="polite" className="mono w-12 text-center text-[0.58rem] tracking-[0.14em] text-ink-soft">
                {Math.round(zoom * 100)}%
              </span>
              <button type="button" onClick={() => setZoomTo(zoom + 0.5)} disabled={zoom >= MAX_Z} aria-label={t("sfloorplan.zoomIn")} className={ctl}>
                <Plus size={15} />
              </button>
              <button type="button" onClick={reset} disabled={zoom === 1 && pan.x === 0 && pan.y === 0} aria-label={t("sfloorplan.resetZoom")} className={ctl}>
                <RotateCcw size={14} />
              </button>
              {canFs && (
                <button type="button" onClick={toggleFs} aria-label={isFs ? t("sfloorplan.exitFullscreen") : t("sfloorplan.viewFullscreen")} className={ctl}>
                  {isFs ? <Shrink size={15} /> : <Expand size={15} />}
                </button>
              )}
            </div>

            <button type="button" onClick={() => go(1)} aria-label={t("sfloorplan.nextConfig")} className={`pointer-events-auto bg-paper/80 backdrop-blur ${ctl}`}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* the layout, and the standing caveat */}
        <div className="px-5 py-6 md:px-8 md:py-7">
          <div className="min-w-0">
            <p className="mono text-[0.55rem] tracking-[0.2em] text-ink-faint">{room ? t("sfloorplan.room") : t("sfloorplan.roomLayout")}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              {room ? `${t(room.tKey)} · ${t(ZONES[room.z].tKey)}` : t(plan.compKey)}
            </p>
          </div>
          <p className="mono mt-6 text-[0.55rem] leading-relaxed tracking-[0.18em] text-ink-faint">
            {t("sfloorplan.indicativeFull")}
          </p>
        </div>

        <p className="mono border-t border-line px-5 py-3 text-center text-[0.54rem] tracking-[0.18em] text-ink-faint md:px-8">
          {t("sfloorplan.lightboxHint")}
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
  const { t } = useI18n();
  const unlocked = useLeadUnlocked(); // drawings stay blurred until details are given

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
    <section id="floor-plan" ref={root} className="container-lux py-[clamp(5rem,13vh,9rem)] max-md:pb-10">
      {/* header */}
      <div className="mb-[clamp(2.5rem,6vh,4.5rem)] grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
        <h2 className="max-w-[20ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
          {t("sfloorplan.headingLead")} <span className="font-serif italic text-brass">{t("sfloorplan.headingAccent")}</span>
        </h2>
      </div>

      {/* both plans, side by side */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {PLANS.map((plan, idx) => {
          const cfg = CONFIG_BY_ID[plan.id];
          const active = hover && hover.id === plan.id ? hover.i : null;
          const room = active != null ? plan.rooms[active] : null;
          /* The single gate. Every route to the enlarged drawing goes through
             here — the card, the "Enlarged view" button, anything added later —
             so none of them can hand a locked visitor the clear plan. */
          const enlarge = () =>
            unlocked ? setOpenAt(idx) : openEnquiry(`Floor plan · ${plan.label}`);
          return (
            <div key={plan.id} className="relative rounded-[1.25rem] border border-line bg-cream/40 p-5 md:p-7">
              <div className="gold-glow pointer-events-none absolute -inset-8 [background:radial-gradient(42%_42%_at_50%_42%,rgba(201,168,106,0.09),transparent_70%)]" />

              {/* plan header + live readout */}
              <div className="relative mb-5 flex items-end justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="kicker">{t(plan.tagKey)}</p>
                  <h3 className="mt-1.5 font-display text-2xl font-light tracking-[-0.01em] text-ink md:text-3xl">{plan.label}</h3>
                </div>
                <div className="text-right">
                  <p className="mono text-[0.55rem] tracking-[0.2em] text-ink-faint">{room ? t("sfloorplan.room") : t("sfloorplan.superArea")}</p>
                  <p className="mt-1 font-serif text-base italic text-brass md:text-lg">
                    {room ? `${t(room.tKey)} · ${t(ZONES[room.z].tKey)}` : cfg.size}
                  </p>
                </div>
              </div>

              {/* the drawing — blurred until the visitor gives their details */}
              <GatedPlan plan={plan} unlocked={unlocked} onEnlarge={enlarge} />

              <p className="mt-5 text-sm leading-relaxed text-ink-soft">{t(plan.compKey)}</p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <button
                  type="button"
                  onClick={enlarge}
                  aria-label={`${t("sfloorplan.enlargedView")} — ${t("sfloorplan.openThe")} ${plan.label}`}
                  className="mono inline-flex items-center gap-2 text-[0.6rem] tracking-[0.18em] text-brass transition-colors hover:text-brass-soft focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
                >
                  <Maximize2 size={13} />
                  {t("sfloorplan.enlargedView")}
                </button>
                <p className="mono text-[0.54rem] tracking-[0.18em] text-ink-faint">{t("sfloorplan.indicativeShort")}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* shared note */}
      <div className="mt-10 border-t border-line pt-8">
        <p className="max-w-md text-sm leading-relaxed text-ink-soft">
          {t("sfloorplan.sharedPrivately")}
        </p>
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
