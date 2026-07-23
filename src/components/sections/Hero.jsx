import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Download } from "lucide-react";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { useI18n } from "../../lib/i18n.jsx";
import { PRICE } from "../../lib/facts.js";
import { IMG } from "../../lib/images.js";
import { RENDERS } from "../../lib/renders.generated.js";
import { track } from "../../lib/analytics.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HERO_VIDEO = "/hero-brabus.mp4";
const prefersReduced =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The still that carries the first paint.
   It used to ride in as the <video poster> attribute, which can only take a
   single URL — so every phone downloaded the 235 kB full-width JPEG while the
   very same picture arrived again, smaller and in AVIF, through the responsive
   pipeline elsewhere on the page. Serving it as a real <picture> instead lets
   the browser take one file at the width and format it actually wants (~55–78 kB
   AVIF), and lets us mark it fetchpriority="high" so it is unambiguously the
   LCP element. The manifest is generated from what is truly on disk, so a
   missing derivative degrades to the JPEG rather than a 404. */
const POSTER = RENDERS[IMG.heroExterior];
const srcSetOf = (variants) => variants.map(([w, url]) => `${url} ${w}w`).join(", ");

/* Ch. 23 — the four things a visitor arrives wanting to know, on one line.
   Two are published, two are not: M3M quotes neither a price nor a RERA
   number, so those read as "on request" and open the form instead. They are
   driven off the facts layer rather than hard-coded copy, so the day either
   figure is officially released the strip states it without a code change. */
/* CHAPTER 01 — ARRIVAL · Obsidian & Gold
   A cinematic film held in a rounded card. A tall section + a CSS-sticky
   frame let the card grow to full-bleed as you scroll (margins → 0, corners
   → square) with no pin-spacer to misbehave. Gold-swept serif headline. */
export default function Hero() {
  const root = useRef(null);
  const pad = useRef(null);
  const card = useRef(null);
  const videoWrap = useRef(null);
  const film = useRef(null);
  const [filmPlaying, setFilmPlaying] = useState(false);
  const { openEnquiry, openBrochure } = useEnquiry();
  const { t } = useI18n();

  /* The film is a 7 MB file, of which a phone pulled roughly 3 MB on arrival:
     with a src in the markup it is fetched by the preload scanner before a
     single pixel is painted, and that alone pushed mobile LCP past seven
     seconds. So the element ships without a source and we
     attach one only once the page has finished loading and the main thread has
     gone quiet — the poster holds the frame in the meantime and a normal visitor
     still sees the film start of its own accord, a beat later.
     The tradeoff is honest: the film begins perhaps a second after arrival
     rather than fighting the headline for bandwidth. Nobody watches a hero loop
     in the first second; everybody waits for the first paint.

     Two guards worth stating out loud:
     · prefers-reduced-motion never attaches a source at all. Those visitors were
       already looking at a still frame (autoPlay was off), so this costs them
       nothing and saves them the download. It also keeps the prerenderer honest:
       scripts/prerender.mjs drives Chrome with --force-prefers-reduced-motion, so
       the captured DOM has no src on the <video>. Setting the property reflects
       into the attribute, and if that flag were ever dropped the film would be
       baked straight back into every prerendered page.
     · Save-Data likewise stays on the poster. A multi-megabyte decorative loop
       is exactly what that header is asking us not to send. */
  useEffect(() => {
    const el = film.current;
    if (!el || prefersReduced) return undefined;
    if (navigator.connection?.saveData) return undefined;

    /* Product decision: the hero film should play on phones too, so it now
       attaches on mobile as well as desktop. The download still never fights
       first paint — it is scheduled after `load` at idle priority, the poster
       carries LCP, and the genuinely constrained cases are still refused:
       prefers-reduced-motion and Save-Data (above), and 2g connections (below).
       The honest tradeoff: mobile pays some extra data/LCP for the film versus
       poster-only. If that ever needs walking back, a lighter mobile-specific
       encode (or restoring a width gate here) is the lever. */

    // Refuse only on an explicitly slow (2g) connection; everyone else gets the film.
    const slow = /(^|-)2g$/.test(navigator.connection?.effectiveType || "");
    if (slow) return undefined;

    let cancelled = false;

    const attach = () => {
      if (cancelled || el.src) return;
      el.src = HERO_VIDEO;
      // muted + playsInline satisfies every autoplay policy; where it is still
      // refused the promise rejects quietly and the poster simply stays.
      el.play?.().catch(() => {});
    };

    const schedule = () => {
      const idle = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 200));
      idle(attach, { timeout: 2000 });
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
    };
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      gsap.matchMedia().add(
        {
          ok: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width:768px) and (prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          fine: "(pointer:fine)",
        },
        (ctx) => {
          if (ctx.conditions.reduce) return;

          // ---- entrance ----
          gsap.set(videoWrap.current, { autoAlpha: 0, scale: 1.12, filter: "blur(16px)" });
          // Clip only for the duration of the reveal — the stylesheet leaves
          // .ed-line unclipped so a skipped animation can never behead the type.
          gsap.set(q(".ed-line"), { overflow: "hidden" });
          // >100% so the line starts fully below its mask before the reveal.
          gsap.set(q(".ed-line > span"), { yPercent: 115 });
          gsap.set(q(".hero-fade"), { autoAlpha: 0, y: 20 });

          gsap
            .timeline({ defaults: { ease: "power4.out" } })
            .to(videoWrap.current, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 2, ease: "expo.out" }, 0)
            .to(q(".ed-line > span"), {
              yPercent: 0,
              duration: 1.3,
              stagger: 0.14,
              // The mask has done its job once the type has settled. Clearing it
              // means descenders are never clipped, whatever the font's metrics —
              // no per-font padding guess to keep in sync.
              onComplete: () => gsap.set(q(".ed-line"), { overflow: "visible" }),
            }, 0.5)
            .fromTo(q(".gold-sweep"), { backgroundPositionX: "120%" }, { backgroundPositionX: "-20%", duration: 1.3, ease: "power2.inOut" }, 1.3)
            .to(q(".hero-fade"), { autoAlpha: 1, y: 0, duration: 1, stagger: 0.09 }, 1.4);

          // ---- scroll-expand (desktop): rounded card → full-bleed ----
          if (ctx.conditions.desktop) {
            gsap.set(pad.current, { paddingTop: "13vh", paddingBottom: "13vh", paddingLeft: "6vw", paddingRight: "6vw" });
            gsap.set(card.current, { borderRadius: "2rem" });

            gsap
              .timeline({
                scrollTrigger: { trigger: root.current, start: "top top", end: "+=58%", scrub: 0.6 },
                defaults: { ease: "none" },
              })
              .to(pad.current, { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }, 0)
              .to(card.current, { borderRadius: 0 }, 0)
              .to(q(".hero-cue"), { autoAlpha: 0 }, 0);
          }

          // ---- subtle mouse parallax on the film ----
          if (ctx.conditions.fine) {
            const xTo = gsap.quickTo(videoWrap.current, "x", { duration: 1, ease: "power3.out" });
            const yTo = gsap.quickTo(videoWrap.current, "y", { duration: 1, ease: "power3.out" });
            const onMove = (e) => {
              xTo((e.clientX / window.innerWidth - 0.5) * 16);
              yTo((e.clientY / window.innerHeight - 0.5) * 16);
            };
            window.addEventListener("mousemove", onMove);
            return () => window.removeEventListener("mousemove", onMove);
          }
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-svh md:h-[165vh]">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <div ref={pad} className="h-full w-full p-3 md:p-0">
          <div
            ref={card}
            className="hero-card relative h-full w-full overflow-hidden rounded-[1.5rem] bg-ink-900 shadow-[0_60px_140px_-40px_rgba(0,0,0,0.85)] md:rounded-[2rem]"
          >
            {/* cinematic film — a still first, the film once the page is quiet.
                Both are absolutely positioned against a box the sticky frame has
                already sized, so neither can move a pixel of layout: CLS stays 0.
                The still keeps its intrinsic dimensions anyway, for the same
                reason every other image on the site does. */}
            <div ref={videoWrap} className="absolute inset-0 [filter:brightness(0.8)_contrast(1.06)_saturate(0.9)]">
              <picture>
                {POSTER?.avif?.length ? (
                  <source type="image/avif" srcSet={srcSetOf(POSTER.avif)} sizes="100vw" />
                ) : null}
                {POSTER?.webp?.length ? (
                  <source type="image/webp" srcSet={srcSetOf(POSTER.webp)} sizes="100vw" />
                ) : null}
                <img
                  src={IMG.heroExterior}
                  // Decorative in the same way the poster attribute was: the
                  // <video> beside it already carries the accessible name.
                  alt=""
                  aria-hidden="true"
                  width={POSTER?.w}
                  height={POSTER?.h}
                  fetchPriority="high"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </picture>

              {/* The film fades over the still on its first frame rather than the
                  still being torn away, so the handover is invisible even if the
                  two are a frame apart. It also means a visitor who never gets a
                  source — reduced motion, Save-Data, a refused autoplay — is left
                  looking at the still, which is the intended picture anyway. */}
              <video
                ref={film}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-lux ${
                  filmPlaying ? "opacity-100" : "opacity-0"
                }`}
                autoPlay={!prefersReduced}
                muted
                loop
                playsInline
                preload="none"
                onPlaying={() => setFilmPlaying(true)}
                aria-label={t("shero.filmAria")}
              />
            </div>

            {/* grades + glow + grain */}
            {/* Scrim: the film now plays on mobile too and some frames are bright
                (a daylit terrace), which washed out the light headline/subtitle/
                stats. Darken the lower half — where all the text sits — so it stays
                legible on any frame, while keeping a lighter middle for the imagery. */}
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,rgba(8,6,5,0.66)_0%,rgba(8,6,5,0.10)_26%,rgba(8,6,5,0.55)_60%,rgba(8,6,5,0.96)_100%)]" />
            <div className="gold-glow pointer-events-none absolute -inset-1/4 [background:radial-gradient(38%_38%_at_26%_22%,rgba(201,168,106,0.16),transparent_66%)]" />
            <div className="grain pointer-events-none absolute inset-0" />

            {/* content — anchored to the bottom. On mobile/tablet the fixed
                Call/WhatsApp/Visit/Brochure bar (lg:hidden) sits over the bottom
                ~5rem, so the CTA row is lifted above it with bottom padding (plus
                the home-indicator safe area) — otherwise Download Brochure was
                half-hidden behind the bar on first load. */}
            <div className="relative z-10 flex h-full flex-col justify-end px-6 pt-24 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:px-10 lg:p-14">
              {/* bottom block */}
              <div className="max-w-3xl [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]">
                <h1 className="font-display text-[clamp(2.3rem,6vw,6rem)] font-light leading-[0.94] tracking-[-0.03em] text-bone">
                  <span className="ed-line"><span>{t("shero.headlineLead")}</span></span>
                  <span className="ed-line">
                    <span
                      className="gold-sweep font-serif italic"
                      style={{
                        color: "transparent",
                        backgroundImage: "linear-gradient(100deg,#a07c3f 0%,#c9a86a 42%,#f4e6c2 50%,#c9a86a 58%,#a07c3f 100%)",
                        backgroundSize: "250% 100%",
                        backgroundPositionX: "120%",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                      }}
                    >
                      {t("shero.headlineAccent")}
                    </span>
                  </span>
                </h1>

                <div className="hero-fade mt-8 h-px w-full max-w-xs bg-gradient-to-r from-brass/70 via-line to-transparent md:mt-10" />

                <div className="hero-fade mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                  <button
                    type="button"
                    onClick={() => openEnquiry(PRICE.label)}
                    data-cursor="ENTER"
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brass"
                  >
                    <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover:scale-x-100" />
                    <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover:text-obsidian">
                      {t("cta.requestPrice")}
                    </span>
                    <span className="relative z-10 text-brass transition-[transform,color] duration-500 group-hover:translate-x-1 group-hover:text-obsidian">→</span>
                  </button>

                  {/* gated: opens the form, download starts on submit */}
                  <button
                    type="button"
                    onClick={() => openBrochure("Hero")}
                    data-cursor="DOWNLOAD"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-brass px-7 py-4 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-obsidian transition-colors duration-500 hover:bg-brass-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brass"
                  >
                    <Download size={14} className="animate-bounce transition-transform duration-500 group-hover:translate-y-0.5 group-hover:animate-none" />
                    {t("cta.downloadBrochure")}
                  </button>
                </div>
              </div>
            </div>

            {/* scroll cue */}
            <div className="hero-cue pointer-events-none absolute bottom-6 right-6 z-10 hidden items-center gap-2 md:flex lg:bottom-8 lg:right-8">
              <span className="mono text-[0.56rem] tracking-[0.24em] text-ink-faint">{t("shero.scrollToEnter")}</span>
              <span className="h-px w-8 bg-gradient-to-r from-brass to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
