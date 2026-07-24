import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, Phone, X } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import usePresence from "../lib/usePresence.js";
import { PROJECT } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* THE GALLERY
   Three official renders exist for this project and no more. This page used
   to hang ten plates, seven of which were the lobby render captioned as rooms
   it does not show — "The Master Suite", "Performance Gym", "The Pool". A
   stock photograph reads as decoration; an official-looking M3M render
   captioned "Performance Gym" asserts that this is the gym. It is not.

   So the wall is three plates, hung at size, each under a caption that
   describes what is actually in the frame. What is missing is not padded out
   with lookalikes — it is named, section 02, next to the way to get it. A
   gallery of three genuine images is not a thin gallery; it is an accurate
   one, and for a pre-launch tower it is the normal state of affairs.

   Precedent: components/sections/Amenities.jsx (typographic where no render
   exists) and pages/MasterPlanPage.jsx (absent document behind an honest CTA). */

/* Copy is held to what the file itself contains — see the per-file notes in
   lib/images.js — plus figures already on the published record. No plate
   implies a tower count, a floor count or a land area: none is published, and
   /master-plan says so in the same words. */
const PLATES = [
  {
    no: "I",
    id: IMG.tower,
    nameKey: "gallery.plate1Name",
    subjectKey: "gallery.plate1Subject",
    ledeKey: "gallery.plate1Lede",
    bodyKey: "gallery.plate1Body",
    altKey: "gallery.plate1Alt",
  },
  {
    no: "II",
    id: IMG.arrival,
    nameKey: "gallery.plate2Name",
    subjectKey: "gallery.plate2Subject",
    ledeKey: "gallery.plate2Lede",
    bodyKey: "gallery.plate2Body",
    altKey: "gallery.plate2Alt",
  },
  {
    no: "III",
    id: IMG.lobby,
    nameKey: "gallery.plate3Name",
    subjectKey: "gallery.plate3Subject",
    ledeKey: "gallery.plate3Lede",
    bodyKey: "gallery.plate3Body",
    altKey: "gallery.plate3Alt",
  },
];

/* The other half of an honest gallery: what is not on the wall, why, and the
   page that already handles each subject properly without imagery. */
const ABSENT = [
  {
    id: "interiors",
    tKey: "gallery.absentInteriorsT",
    sKey: "gallery.absentInteriorsS",
    dKey: "gallery.absentInteriorsD",
    to: "/floor-plan",
    labelKey: "gallery.labelFloorPlans",
  },
  {
    id: "club",
    tKey: "gallery.absentClubT",
    sKey: "gallery.absentClubS",
    dKey: "gallery.absentClubD",
    to: "/amenities",
    labelKey: "gallery.labelAmenities",
  },
  {
    id: "master",
    tKey: "gallery.absentMasterT",
    sKey: "gallery.absentMasterS",
    dKey: "gallery.absentMasterD",
    to: "/master-plan",
    labelKey: "gallery.labelMasterPlan",
  },
  {
    id: "site",
    tKey: "gallery.absentSiteT",
    sKey: "gallery.absentSiteS",
    dKey: "gallery.absentSiteD",
    to: "/construction-status",
    labelKey: "gallery.labelConstruction",
  },
];

export default function Gallery() {
  const root = useRef(null);
  const [openAt, setOpenAt] = useState(null);
  const { openEnquiry } = useEnquiry();
  const { t } = useI18n();

  /* The panel settles as the backdrop lifts; usePresence holds the node in the
     document until the tween reports back, and skips the whole thing under
     reduced motion so the prerenderer never waits on an exit that cannot play. */
  const exitLightbox = useCallback(
    (node, done) =>
      gsap
        .timeline({ onComplete: done })
        .to(node.querySelector('[role="dialog"]'), { opacity: 0, y: 14, scale: 0.985, duration: 0.3, ease: "power2.in" }, 0)
        .to(node, { opacity: 0, duration: 0.3, ease: "power2.in" }, 0.05),
    [],
  );

  const { mounted: lightboxMounted, ref: lightboxRef } = usePresence(openAt != null, exitLightbox);

  /* Which plate to keep drawing while the lightbox animates away, after
     `openAt` has already been cleared. */
  const lastAt = useRef(0);
  if (openAt != null) lastAt.current = openAt;

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      /* Everything below starts visible in the markup. The hidden start values
         are set only inside matchMedia, so the prerendered DOM — captured with
         --force-prefers-reduced-motion — keeps all three plates and their copy. */
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        q(".plate").forEach((el) => {
          const frame = el.querySelector(".pl-frame");
          gsap.set(frame, { clipPath: "inset(100% 0 0 0)" });
          gsap.set(el.querySelectorAll(".rise"), { autoAlpha: 0, y: 20 });

          gsap.to(frame, {
            clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power3.inOut",
            scrollTrigger: { trigger: el, start: "top 84%" },
          });
          gsap.to(el.querySelectorAll(".rise"), {
            autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 80%" },
          });
          gsap.to(el.querySelector(".pl-inner"), {
            yPercent: 9, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });

        gsap.from(q(".ab-row"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".absent")[0], start: "top 86%" },
        });
        gsap.from(q(".req-rise"), {
          autoAlpha: 0, y: 22, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".request")[0], start: "top 88%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="bg-canvas">
      <Seo
        title="M3M Brabus Gallery | Tower, Arrival & Lobby Renders"
        description="The three official M3M Brabus renders in full — the towers at dusk, the BRABUS porte-cochère arrival and the marble lobby. Interiors and amenity imagery."
        path="/gallery"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Gallery", path: "/gallery" }])}
      />
      <Breadcrumbs trail={[{ name: t("breadcrumb.home"), path: "/" }, { name: t("breadcrumb.gallery"), path: "/gallery" }]} />
      <PageHeader
        compact
        title={t("gallery.title")}
        accent={t("gallery.accent")}
        lede={`${t("gallery.ledeA")} ${PROJECT.name} ${t("gallery.ledeB")}`}
      />

      {/* ── 01 · the three plates ─────────────────────────────────── */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">

        <div className="flex flex-col gap-[clamp(4rem,11vh,8rem)]">
          {PLATES.map((p, i) => (
            <figure key={p.no} className="plate">
              {/* The whole plate is the control — a discreet corner affordance
                  looks tidier but is a smaller target and a worse tab stop. */}
              <button
                type="button"
                onClick={() => setOpenAt(i)}
                data-cursor="VIEW"
                aria-label={`${t("gallery.enlarge")} ${t(p.nameKey)}`}
                className="pl-frame group relative block aspect-[16/11] w-full overflow-hidden rounded-[1.5rem] border border-line transition-colors duration-500 hover:border-brass/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass md:aspect-[16/9]"
              >
                <span className="pl-inner ed-breath absolute inset-0 block scale-[1.05]">
                  <Media
                    src={px(p.id, 2200)}
                    alt={t(p.altKey)}
                    sizes="(max-width:1280px) 100vw, 1200px"
                  />
                </span>
                <span className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,rgba(8,6,5,0.28)_0%,transparent_34%,transparent_58%,rgba(8,6,5,0.6))]" />
                <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
                <span className="mono absolute left-6 top-5 text-[0.58rem] tracking-[0.22em] text-brass-soft">
                  {t("gallery.plate")} {p.no}
                </span>
                <span className="absolute bottom-5 right-6 inline-flex items-center gap-2 rounded-full border border-bone/25 bg-obsidian/35 px-4 py-2 font-sans text-[0.62rem] font-medium uppercase tracking-[0.16em] text-bone backdrop-blur-sm transition-colors duration-500 group-hover:border-brass/60 group-hover:text-brass-soft">
                  <Expand size={12} aria-hidden="true" />
                  {t("gallery.enlarge")}
                </span>
              </button>

              <figcaption className="mt-[clamp(1.75rem,4vh,2.75rem)] grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
                <div>
                  <h2 className="rise mt-4 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                    {t(p.nameKey)}
                  </h2>
                  <p className="rise mono mt-4 text-[0.58rem] tracking-[0.2em] text-ink-faint">
                    {t(p.subjectKey)}
                  </p>
                </div>
                <div>
                  <p className="rise max-w-[44ch] font-serif text-lg italic leading-snug text-brass">
                    {t(p.ledeKey)}
                  </p>
                  <p className="rise mt-5 max-w-[64ch] leading-relaxed text-ink-soft">{t(p.bodyKey)}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── 02 · what is not on the wall ──────────────────────────── */}
      <section className="absent container-lux pb-[clamp(4rem,11vh,7rem)]">

        <p className="ab-row mb-10 max-w-[62ch] leading-relaxed text-ink-soft">
          {t("gallery.absentIntroA")} {PROJECT.developer} {t("gallery.absentIntroB")}
        </p>

        <dl className="border-t border-line">
          {ABSENT.map((a) => (
            <div
              key={a.id}
              className="ab-row grid grid-cols-1 gap-2 border-b border-line py-6 lg:grid-cols-[minmax(0,3rem)_minmax(0,16rem)_1fr_auto] lg:items-baseline lg:gap-8"
            >
              <span className="mono text-[0.56rem] tracking-[0.2em] text-brass">—</span>
              <dt className="font-display text-xl leading-snug text-ink">{t(a.tKey)}</dt>
              <dd className="max-w-[58ch] text-sm leading-relaxed text-ink-soft">
                <span className="mono mb-2 block text-[0.54rem] tracking-[0.2em] text-ink-faint">
                  {t(a.sKey)}
                </span>
                {t(a.dKey)}
              </dd>
              <Link
                to={a.to}
                data-cursor="ENTER"
                className="group/l mono inline-flex shrink-0 items-center gap-1.5 text-[0.58rem] tracking-[0.18em] text-brass transition-colors hover:text-brass-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
              >
                {t(a.labelKey)}
                <ArrowUpRight
                  size={13}
                  aria-hidden="true"
                  className="transition-transform duration-500 group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5"
                />
              </Link>
            </div>
          ))}
        </dl>
      </section>

      {/* ── the request panel ─────────────────────────────────────── */}
      <section className="request container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-12">
          <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_82%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <h2 className="req-rise mt-4 max-w-[17ch] font-display text-[clamp(1.9rem,3.8vw,2.9rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                {t("gallery.restSharedA")}{" "}
                <span className="font-serif italic text-brass">{t("gallery.restSharedB")}</span>
              </h2>
              <p className="req-rise mt-6 max-w-[50ch] leading-relaxed text-ink-soft">
                {t("gallery.requestBody")}
              </p>

              <div className="req-rise mt-9 flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={() => openEnquiry("Gallery")}
                  data-cursor="OPEN"
                  aria-label={`${t("gallery.requestAria")} ${PROJECT.name}`}
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    {t("gallery.requestCta")}
                  </span>
                  <ArrowUpRight
                    size={15}
                    aria-hidden="true"
                    className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian"
                  />
                </button>
                <a
                  href={`tel:${PROJECT.phone}`}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  <Phone size={13} aria-hidden="true" className="text-brass" />
                  {PROJECT.phone}
                </a>
              </div>
            </div>

            {/* A ledger, not a picture — the honest inventory of the collection,
                which is also the argument for registering. */}
            <div className="req-rise self-center">
              <p className="mono text-[0.56rem] tracking-[0.2em] text-ink-faint">
                {t("gallery.collectionStated")}
              </p>
              <dl className="mt-5 border-t border-line">
                {[
                  ["renders", t("gallery.ledgerRenders"), "03"],
                  ["shown", t("gallery.ledgerShown"), "03"],
                  ["interior", t("gallery.ledgerInterior"), t("gallery.ledgerLobbyVal")],
                  ["amenity", t("gallery.ledgerAmenity"), t("gallery.ledgerNone")],
                ].map(([id, k, v]) => (
                  <div
                    key={id}
                    className="flex items-baseline justify-between gap-6 border-b border-line-soft py-3.5"
                  >
                    <dt className="text-sm text-ink-soft">{k}</dt>
                    <dd className="mono shrink-0 text-[0.62rem] tracking-[0.18em] text-brass">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {lightboxMounted && (
        <PlateLightbox
          rootRef={lightboxRef}
          index={openAt ?? lastAt.current}
          onIndex={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}

      <RelatedPages links={["/overview", "/residences", "/amenities", "/floor-plan"]} />
      <CtaBand title={t("gallery.ctaTitle")} accent={t("gallery.ctaAccent")} subject="Gallery" />
    </div>
  );
}

/* ── enlarged plate ──────────────────────────────────────────────────
   Dark backdrop · aria-modal · focus trapped · Escape and arrow keys ·
   body scroll restored and every listener detached on unmount. Mounted only
   once a plate is opened, so the prerender captures no dialog at all.

   `rootRef` comes from the page's usePresence: the parent owns the mount, so
   it owns the node the leaving tween runs on. */
function PlateLightbox({ rootRef, index, onIndex, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const titleId = useId();
  const { t } = useI18n();
  const plate = PLATES[index];

  /* The listener effect must run exactly once per open, or it would yank focus
     back to the close button on every plate change — so the moving parts go
     through a ref rather than the dependency array. */
  const live = useRef({ onClose, onIndex, index });
  live.current = { onClose, onIndex, index };

  /* Arrival. Nothing is set to a hidden start value outside matchMedia, so
     under reduced motion the dialog is simply there — it never depends on a
     tween having run. */
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

  useEffect(() => {
    const node = dialogRef.current;
    const restoreTo = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const SEL = 'button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])';
    const go = (dir) => live.current.onIndex((live.current.index + dir + PLATES.length) % PLATES.length);

    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); live.current.onClose(); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); return; }
      if (e.key !== "Tab" || !node) return;
      const f = Array.from(node.querySelectorAll(SEL)).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      if (restoreTo instanceof HTMLElement) restoreTo.focus();
    };
  }, []);

  const step = (dir) => onIndex((index + dir + PLATES.length) % PLATES.length);

  return (
    <div
      ref={rootRef}
      data-lenis-prevent
      onClick={onClose}
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-obsidian/90 p-4 backdrop-blur-md sm:p-8"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-6xl"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="mono text-[0.56rem] tracking-[0.22em] text-brass-soft">
              {t("gallery.plate")} {plate.no} {t("gallery.of")} III
            </p>
            <h3 id={titleId} className="mt-2 font-display text-[clamp(1.5rem,3.6vw,2.4rem)] font-light text-bone">
              {t(plate.nameKey)}
            </h3>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("gallery.close")}
            data-cursor="CLOSE"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-bone/25 text-bone transition-colors hover:border-brass hover:text-brass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Media fills its box (h-full w-full object-cover), which is right for
            a plate on the page and wrong inside a lightbox. The override goes
            through a descendant selector rather than more classes on Media:
            matched on specificity the later rule in the stylesheet wins, not
            the later class in the attribute, so `object-contain` alongside
            `object-cover` would be a coin toss. */}
        <div className="mt-5 flex items-center justify-center overflow-hidden rounded-[1.25rem] border border-bone/10 bg-obsidian [&_img]:h-auto [&_img]:max-h-[62vh] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain">
          <Media src={px(plate.id, 2200)} alt={t(plate.altKey)} priority sizes="(max-width:1280px) 100vw, 1200px" />
        </div>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="max-w-[46ch] font-serif text-base italic leading-snug text-brass">
              {t(plate.ledeKey)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={t("gallery.prevPlate")}
              className="grid h-10 w-10 place-items-center rounded-full border border-bone/25 text-bone transition-colors hover:border-brass hover:text-brass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={t("gallery.nextPlate")}
              className="grid h-10 w-10 place-items-center rounded-full border border-bone/25 text-bone transition-colors hover:border-brass hover:text-brass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="mono mt-5 text-center text-[0.54rem] tracking-[0.2em] text-bone/35">
          {t("gallery.arrowsHint")}
        </p>
      </div>
    </div>
  );
}
