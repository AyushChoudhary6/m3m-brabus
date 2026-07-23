import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";

/**
 * The brochure, read as a book.
 *
 * Opens after the enquiry form is submitted: the PDF is rendered page by page
 * with pdf.js and handed to StPageFlip, which gives a real page-turn you can
 * drag with the cursor rather than a scrolling PDF frame.
 *
 * Both libraries are imported DYNAMICALLY, inside the effect that runs when the
 * viewer opens. pdf.js alone is a few hundred kB — loading it up front would tax
 * every visitor for a file most never open. Nothing here is in the initial
 * bundle; the cost is paid once, by someone who has asked to read the book.
 *
 * pdf.js is configured with isEvalSupported:false because the site's CSP has no
 * 'unsafe-eval'; its worker is bundled by Vite so it stays same-origin under
 * worker-src 'self'.
 */
export default function BrochureBook({ open, onClose, pdfUrl, downloadName = "M3M-Brabus-Brochure.pdf" }) {
  const holder = useRef(null);   // element StPageFlip mounts into
  const flip = useRef(null);     // the PageFlip instance, so we can destroy it
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const close = useCallback(() => onClose?.(), [onClose]);

  /* Escape closes, and the page behind must not scroll while the book is open. */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") flip.current?.flipNext();
      if (e.key === "ArrowLeft") flip.current?.flipPrev();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    let instance = null;
    setStatus("loading");
    setPage(1);

    (async () => {
      try {
        /* page-flip's package `main` is a UMD bundle that exports under `St`,
           so the named import is not dependable through interop — take the ESM
           build directly. The worker URL must come from a ?url import: Vite does
           not resolve a bare package specifier inside new URL(..., import.meta.url),
           which silently yields a 404 and takes pdf.js down with it. */
        const [flipMod, pdfjs, workerMod] = await Promise.all([
          import("page-flip/dist/js/page-flip.module.js"),
          import("pdfjs-dist"),
          import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
        ]);
        if (cancelled) return;

        const PageFlip = flipMod.PageFlip || flipMod.default?.PageFlip || flipMod.default;
        // Bundled worker — same origin, so worker-src 'self' is satisfied.
        pdfjs.GlobalWorkerOptions.workerSrc = workerMod.default;

        const doc = await pdfjs.getDocument({
          url: pdfUrl,
          isEvalSupported: false, // CSP has no 'unsafe-eval'
        }).promise;
        if (cancelled) return;

        setTotal(doc.numPages);

        /* Render at a fixed width and let the aspect ratio of page 1 set the
           book's proportions, so the spread matches the document rather than a
           guessed rectangle. */
        const RENDER_W = 1000;
        const images = [];
        let ratio = 1.414; // A4 fallback

        for (let n = 1; n <= doc.numPages; n += 1) {
          const pdfPage = await doc.getPage(n);
          if (cancelled) return;
          const base = pdfPage.getViewport({ scale: 1 });
          const scale = RENDER_W / base.width;
          const viewport = pdfPage.getViewport({ scale });
          if (n === 1) ratio = viewport.height / viewport.width;

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          await pdfPage.render({
            canvas,
            canvasContext: canvas.getContext("2d"),
            viewport,
          }).promise;
          if (cancelled) return;
          images.push(canvas.toDataURL("image/jpeg", 0.86));
        }
        if (cancelled || !holder.current) return;

        /* Size the spread to the viewport: the book must never exceed the
           window, or the corner you drag ends up off-screen. */
        const maxH = Math.min(window.innerHeight * 0.82, 900);
        const maxW = Math.min(window.innerWidth * 0.92, 1400);
        let pageH = maxH;
        let pageW = pageH / ratio;
        const single = window.innerWidth < 768; // one page at a time on phones
        if ((single ? pageW : pageW * 2) > maxW) {
          pageW = single ? maxW : maxW / 2;
          pageH = pageW * ratio;
        }

        holder.current.innerHTML = "";
        images.forEach((src) => {
          const leaf = document.createElement("div");
          leaf.className = "bb-page";
          const img = document.createElement("img");
          img.src = src;
          img.alt = "";
          img.draggable = false;
          leaf.appendChild(img);
          holder.current.appendChild(leaf);
        });

        instance = new PageFlip(holder.current, {
          width: Math.round(pageW),
          height: Math.round(pageH),
          size: "stretch",
          minWidth: 260,
          maxWidth: 1400,
          minHeight: 340,
          maxHeight: 1800,
          maxShadowOpacity: 0.5,
          showCover: true,          // first page reads as a cover
          usePortrait: single,
          mobileScrollSupport: false,
          drawShadow: true,
          flippingTime: 700,
        });
        instance.loadFromHTML(holder.current.querySelectorAll(".bb-page"));
        instance.on("flip", (e) => setPage(e.data + 1));

        flip.current = instance;
        setStatus("ready");
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
  }, [open, pdfUrl]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Brochure"
      className="fixed inset-0 z-[120] flex flex-col bg-obsidian/95 backdrop-blur-sm"
    >
      {/* chrome */}
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-4">
        <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">
          {status === "ready" && total ? `${Math.min(page, total)} / ${total}` : " "}
        </p>
        <div className="flex items-center gap-2">
          <a
            href={pdfUrl}
            download={downloadName}
            className="mono inline-flex items-center gap-2 rounded-full border border-brass/40 px-4 py-2 text-[0.58rem] tracking-[0.18em] text-brass transition-colors hover:border-brass hover:text-brass-soft"
          >
            <Download size={13} />
            Download
          </a>
          <button
            type="button"
            onClick={close}
            aria-label="Close the brochure"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-brass hover:text-brass"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* the book */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 md:px-8">
        {status === "loading" && (
          <p className="mono animate-pulse text-[0.6rem] tracking-[0.2em] text-ink-faint">
            Opening the brochure…
          </p>
        )}

        {status === "error" && (
          <div className="text-center">
            <p className="text-sm text-ink-soft">The book viewer could not open.</p>
            <a
              href={pdfUrl}
              download={downloadName}
              className="mono mt-4 inline-flex items-center gap-2 text-[0.62rem] tracking-[0.18em] text-brass underline underline-offset-4"
            >
              <Download size={13} />
              Download the brochure instead
            </a>
          </div>
        )}

        <div
          ref={holder}
          className={status === "ready" ? "bb-book" : "bb-book invisible absolute"}
        />
      </div>

      {/* page controls — the drag is the point, but a click target is expected */}
      {status === "ready" && (
        <div className="flex shrink-0 items-center justify-center gap-6 pb-6">
          <button
            type="button"
            onClick={() => flip.current?.flipPrev()}
            aria-label="Previous page"
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-brass hover:text-brass"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => flip.current?.flipNext()}
            aria-label="Next page"
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-brass hover:text-brass"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
