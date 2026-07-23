import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, Download, Maximize2, Minimize2, Volume2, VolumeX, X } from "lucide-react";

/**
 * The brochure as a hardcover book.
 *
 * Not a PDF viewer: pdf.js renders each page to a high-resolution canvas and
 * StPageFlip turns those into leaves you drag by the corner. StPageFlip is used
 * rather than a CSS rotateY because it folds the sheet — the paper curls around
 * a moving crease and casts its own shadow — which is the whole difference
 * between "a card spinning" and "a page turning".
 *
 * Everything heavy is dynamically imported inside the open effect, so a visitor
 * who never opens the brochure never downloads pdf.js.
 *
 * WHAT IS HONESTLY SIMULATED, AND WHAT IS NOT
 * The fold, shadowing, corner drag, thickness and lighting are real. The paper
 * is not a cloth simulation — at extreme drag speeds you can still tell. The
 * "thickness" is drawn from the page stacks either side, which is convincing
 * because it tracks the actual position in the book.
 */

const EASE = "power3.out";

/* A soft paper rustle synthesised on the fly — a filtered noise burst. Shipping
   an audio file for this would cost more than it is worth, and this is quieter
   and more controllable. Muted by default: sound a visitor did not ask for is
   never premium. */
function makeRustle() {
  let ctx = null;
  return () => {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      const dur = 0.28;
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        const t = i / data.length;
        // noise shaped by a quick attack and a long, soft tail
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * (t < 0.04 ? t / 0.04 : 1);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 2600;
      bp.Q.value = 0.7;
      const gain = ctx.createGain();
      gain.gain.value = 0.045; // deliberately faint
      src.connect(bp).connect(gain).connect(ctx.destination);
      src.start();
    } catch { /* audio unavailable — silence is an acceptable outcome */ }
  };
}

export default function BrochureBook({ open, onClose, pdfUrl, downloadName = "M3M-Brabus-Brochure.pdf" }) {
  const shell = useRef(null);    // the whole overlay (for the open animation)
  const stage = useRef(null);    // tilt target
  const holder = useRef(null);   // StPageFlip mounts here
  const flip = useRef(null);
  const rustle = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [page, setPage] = useState(0);          // zero-based leaf index
  const [total, setTotal] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fs, setFs] = useState(false);
  const [muted, setMuted] = useState(true);

  const close = useCallback(() => onClose?.(), [onClose]);

  const reduced = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- keyboard, scroll lock ------------------------------------------- */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") { if (document.fullscreenElement) document.exitFullscreen?.(); else close(); }
      else if (e.key === "ArrowRight") flip.current?.flipNext();
      else if (e.key === "ArrowLeft") flip.current?.flipPrev();
      else if (e.key.toLowerCase() === "f") toggleFs();
      else if (e.key.toLowerCase() === "m") setMuted((m) => !m);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    const onFsChange = () => setFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [open, close]);

  const toggleFs = useCallback(() => {
    const el = shell.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.().catch(() => {});
  }, []);

  /* ---- the book slightly follows the cursor, as a held object would ----- */
  useEffect(() => {
    if (!open || status !== "ready" || reduced) return undefined;
    const el = stage.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return undefined;
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.9, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.9, ease: "power3.out" });
    const onMove = (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      rx(-cy * 3.2);
      ry(cx * 4.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [open, status, reduced]);

  /* ---- load, render, bind ---------------------------------------------- */
  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    let instance = null;
    rustle.current = rustle.current || makeRustle();
    setStatus("loading");
    setPage(0);
    setZoom(1);

    (async () => {
      try {
        /* page-flip's package `main` is a UMD bundle exporting as `St`, so the
           named import is not dependable through interop — take the ESM build.
           The worker URL must come from a ?url import: Vite does not resolve a
           bare specifier inside new URL(..., import.meta.url). */
        const [flipMod, pdfjs, workerMod] = await Promise.all([
          import("page-flip/dist/js/page-flip.module.js"),
          import("pdfjs-dist"),
          import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
        ]);
        if (cancelled) return;
        const PageFlip = flipMod.PageFlip || flipMod.default?.PageFlip || flipMod.default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerMod.default;

        const doc = await pdfjs.getDocument({ url: pdfUrl, isEvalSupported: false }).promise;
        if (cancelled) return;
        const n = doc.numPages;
        setTotal(n);

        /* Geometry comes from page 1, so the book takes the document's own
           proportions instead of a guessed rectangle. */
        const first = await doc.getPage(1);
        const base = first.getViewport({ scale: 1 });
        const ratio = base.height / base.width;

        const portrait = window.innerWidth < 900;
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const maxH = Math.min(vh * (portrait ? 0.68 : 0.76), 860);
        const maxW = Math.min(vw * 0.94, 1500);
        let ph = maxH;
        let pw = ph / ratio;
        const spreadW = portrait ? pw : pw * 2;
        if (spreadW > maxW) {
          pw = portrait ? maxW : maxW / 2;
          ph = pw * ratio;
        }

        /* Render crisply: CSS pixels x DPR, capped so a 100-page document does
           not allocate gigabytes of canvas. */
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const renderW = Math.min(Math.round(pw * dpr), 1600);

        const renderPage = async (num) => {
          const p = await doc.getPage(num);
          const v1 = p.getViewport({ scale: 1 });
          const viewport = p.getViewport({ scale: renderW / v1.width });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          await p.render({ canvas, canvasContext: canvas.getContext("2d"), viewport }).promise;
          return canvas.toDataURL("image/jpeg", 0.9);
        };

        /* Build every leaf up front — StPageFlip needs the full set to know how
           thick the book is — but only PAINT the opening spread before we show
           it. The rest stream in behind the reader. */
        if (!holder.current) return;
        holder.current.innerHTML = "";
        const leaves = [];
        for (let i = 0; i < n; i += 1) {
          const leaf = document.createElement("div");
          leaf.className = "bb-leaf";
          // first and last are the boards of the hardcover
          if (i === 0 || i === n - 1) leaf.setAttribute("data-density", "hard");
          leaf.innerHTML =
            '<div class="bb-face"><img alt="" draggable="false" /><span class="bb-grain"></span><span class="bb-gutter"></span></div>';
          holder.current.appendChild(leaf);
          leaves.push(leaf);
        }

        const EAGER = Math.min(n, 4);
        for (let i = 1; i <= EAGER; i += 1) {
          if (cancelled) return;
          const src = await renderPage(i);
          leaves[i - 1].querySelector("img").src = src;
        }
        if (cancelled || !holder.current) return;

        instance = new PageFlip(holder.current, {
          width: Math.round(pw),
          height: Math.round(ph),
          size: "fixed",
          maxShadowOpacity: 0.62,
          showCover: true,
          usePortrait: portrait,
          mobileScrollSupport: false,
          drawShadow: true,
          flippingTime: reduced ? 1 : 820,
          swipeDistance: 24,
          clickEventForward: false,
          useMouseEvents: true,
        });
        instance.loadFromHTML(holder.current.querySelectorAll(".bb-leaf"));
        instance.on("flip", (e) => {
          setPage(e.data);
          if (!mutedRef.current) rustle.current?.();
        });
        flip.current = instance;
        setStatus("ready");

        /* the arrival: the book is set down in front of you */
        if (!reduced && shell.current) {
          gsap.fromTo(shell.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "none" });
          gsap.fromTo(
            stage.current,
            { scale: 0.82, y: 46, rotationX: 16, rotationY: -9, autoAlpha: 0 },
            { scale: 1, y: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, duration: 1.15, ease: "expo.out", delay: 0.06 },
          );
        }

        // the remaining pages, behind the reader
        for (let i = EAGER + 1; i <= n; i += 1) {
          if (cancelled) return;
          // eslint-disable-next-line no-await-in-loop
          const src = await renderPage(i);
          if (cancelled) return;
          const img = leaves[i - 1].querySelector("img");
          if (img) img.src = src;
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Brochure book failed to open:", err);
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      try { instance?.destroy(); } catch { /* already gone */ }
      flip.current = null;
      if (holder.current) holder.current.innerHTML = "";
    };
  }, [open, pdfUrl, reduced]);

  /* the flip handler closes over `muted`, so read it through a ref */
  const mutedRef = useRef(true);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  if (!open) return null;

  const spreads = Math.max(1, total);
  const pct = total ? Math.min(1, (page + 1) / spreads) : 0;
  const label = String(Math.min(page + 1, total || 1)).padStart(2, "0");
  const totalLabel = String(total || 0).padStart(2, "0");

  return (
    <div
      ref={shell}
      role="dialog"
      aria-modal="true"
      aria-label="M3M Brabus brochure"
      className="bb-shell group/bb fixed inset-0 z-[120] flex flex-col"
    >
      {/* ground: dark, blurred, vignetted, faintly grained */}
      <div className="bb-backdrop" aria-hidden="true" />
      <div className="bb-vignette" aria-hidden="true" />

      {/* chrome — quiet until you ask for it */}
      <div className="relative z-10 flex shrink-0 items-center justify-end gap-2 p-4 md:p-6">
        <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute page sound" : "Mute page sound"} className="bb-chip">
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <button type="button" onClick={toggleFs} aria-label={fs ? "Exit fullscreen" : "Enter fullscreen"} className="bb-chip">
          {fs ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
        <a href={pdfUrl} download={downloadName} aria-label="Download the brochure" className="bb-chip">
          <Download size={15} />
        </a>
        <button type="button" onClick={close} aria-label="Close the brochure" className="bb-chip">
          <X size={16} />
        </button>
      </div>

      {/* the book */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 md:px-10">
        {status !== "ready" && status !== "error" && (
          <div className="bb-skeleton" aria-live="polite">
            <div className="bb-skeleton-book"><span /><span /></div>
            <p className="mono mt-6 text-[0.58rem] tracking-[0.24em] text-ink-faint">Opening the brochure…</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <p className="text-sm text-ink-soft">The brochure could not be opened.</p>
            <a href={pdfUrl} download={downloadName} className="mono mt-4 inline-flex items-center gap-2 text-[0.62rem] tracking-[0.18em] text-brass underline underline-offset-4">
              <Download size={13} /> Download it instead
            </a>
          </div>
        )}

        <div
          className="bb-stage"
          style={{ transform: `scale(${zoom})`, visibility: status === "ready" ? "visible" : "hidden" }}
          onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 1.6))}
        >
          <div ref={stage} className="bb-tilt">
            {/* the closed block of paper either side — this is the thickness */}
            <span className="bb-stack bb-stack-l" style={{ "--fill": pct }} aria-hidden="true" />
            <span className="bb-stack bb-stack-r" style={{ "--fill": 1 - pct }} aria-hidden="true" />
            <div ref={holder} className="bb-book" />
            <span className="bb-spine" aria-hidden="true" />
            <span className="bb-shadow" aria-hidden="true" />
          </div>
        </div>

        {/* page controls — only on hover, never in the way */}
        {status === "ready" && (
          <>
            <button type="button" onClick={() => flip.current?.flipPrev()} aria-label="Previous page" className="bb-nav bb-nav-l">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => flip.current?.flipNext()} aria-label="Next page" className="bb-nav bb-nav-r">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* an elegant position, not "Page 2 / 48" */}
      {status === "ready" && (
        <div className="relative z-10 flex shrink-0 items-center justify-center gap-4 pb-7 pt-2">
          <span className="mono text-[0.66rem] tracking-[0.22em] text-brass">{label}</span>
          <span className="bb-rule" aria-hidden="true"><i style={{ transform: `scaleX(${pct})` }} /></span>
          <span className="mono text-[0.66rem] tracking-[0.22em] text-ink-faint">{totalLabel}</span>
        </div>
      )}
    </div>
  );
}
