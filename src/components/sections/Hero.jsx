import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Download } from "lucide-react";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { useI18n } from "../../lib/i18n.jsx";
import { PROJECT } from "../../lib/site.js";
import { PRICE, PROJECT_FACT, hasValue } from "../../lib/facts.js";
import { IMG, px } from "../../lib/images.js";
import { track } from "../../lib/analytics.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HERO_VIDEO = "/hero-brabus.mp4";
const prefersReduced =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Ch. 23 — the four things a visitor arrives wanting to know, on one line.
   Two are published, two are not: M3M quotes neither a price nor a RERA
   number, so those read as "on request" and open the form instead. They are
   driven off the facts layer rather than hard-coded copy, so the day either
   figure is officially released the strip states it without a code change. */
const LEDGER = [
  { key: "configs", text: PROJECT.configs },
  { key: "location", text: PROJECT.location },
  { key: PRICE.key, fact: PRICE, idle: "Price on request", aria: "Request the price of M3M Brabus — pricing is not yet published" },
  {
    key: PROJECT_FACT.rera.key,
    fact: PROJECT_FACT.rera,
    idle: "RERA status on request",
    aria: "Ask for the RERA status of M3M Brabus — no registration number is published yet",
  },
];

/* CHAPTER 01 — ARRIVAL · Obsidian & Gold
   A cinematic film held in a rounded card. A tall section + a CSS-sticky
   frame let the card grow to full-bleed as you scroll (margins → 0, corners
   → square) with no pin-spacer to misbehave. Gold-swept serif headline. */
export default function Hero() {
  const root = useRef(null);
  const pad = useRef(null);
  const card = useRef(null);
  const videoWrap = useRef(null);
  const { openEnquiry, openBrochure } = useEnquiry();
  const { t } = useI18n();

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
          gsap.set(q(".ed-line > span"), { yPercent: 112 });
          gsap.set(q(".hero-fade"), { autoAlpha: 0, y: 20 });

          gsap
            .timeline({ defaults: { ease: "power4.out" } })
            .to(videoWrap.current, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 2, ease: "expo.out" }, 0)
            .to(q(".ed-line > span"), { yPercent: 0, duration: 1.3, stagger: 0.14 }, 0.5)
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
            {/* cinematic film */}
            <div ref={videoWrap} className="absolute inset-0 [filter:brightness(0.8)_contrast(1.06)_saturate(0.9)]">
              <video
                className="h-full w-full object-cover"
                src={HERO_VIDEO}
                poster={px(IMG.heroExterior, 2200)}
                autoPlay={!prefersReduced}
                muted
                loop
                playsInline
                preload="auto"
                aria-label="M3M Brabus branded residences — cinematic film"
              />
            </div>

            {/* grades + glow + grain */}
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,rgba(8,6,5,0.62)_0%,rgba(8,6,5,0.04)_30%,rgba(8,6,5,0.30)_58%,rgba(8,6,5,0.92)_100%)]" />
            <div className="gold-glow pointer-events-none absolute -inset-1/4 [background:radial-gradient(38%_38%_at_26%_22%,rgba(201,168,106,0.16),transparent_66%)]" />
            <div className="grain pointer-events-none absolute inset-0" />

            {/* content */}
            <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-10 lg:p-14">
              {/* top ledger */}
              <div className="hero-fade flex items-center justify-between">
                <span className="kicker text-champagne">{PROJECT.developer} · with {PROJECT.partner}</span>
                <span className="mono hidden text-[0.6rem] tracking-[0.24em] text-ink-faint sm:block">Sector 58 · Gurgaon</span>
              </div>

              {/* bottom block */}
              <div className="max-w-3xl">
                <h1 className="font-display text-[clamp(2.3rem,6vw,6rem)] font-light leading-[0.94] tracking-[-0.03em] text-bone">
                  <span className="ed-line"><span>The art of living,</span></span>
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
                      engineered.
                    </span>
                  </span>
                </h1>

                {/* name + value proposition, kept to one breath */}
                <p className="hero-fade mt-4 max-w-[40ch] text-sm leading-relaxed sm:mt-5 sm:text-[0.95rem]">
                  <span className="text-bone">{PROJECT.name}</span>
                  <span className="text-bone/55"> — {PROJECT.tagline}.</span>
                </p>

                <div className="hero-fade mt-6 h-px w-full max-w-xs bg-gradient-to-r from-brass/70 via-line to-transparent md:mt-8" />

                {/* fact ledger — an unknown is a conversation, not a blank */}
                <ul className="hero-fade mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.58rem] sm:gap-x-5 sm:text-[0.62rem] md:mt-6">
                  {LEDGER.map((item) => (
                    <li
                      key={item.key}
                      className="mono flex items-center gap-4 tracking-[0.18em] before:h-3 before:w-px before:shrink-0 before:bg-brass/30 before:content-[''] first:before:hidden sm:gap-5"
                    >
                      {item.fact && !hasValue(item.fact) ? (
                        <button
                          type="button"
                          onClick={() => {
                            track("hero_fact_request", { fact: item.fact.key });
                            openEnquiry(item.fact.label);
                          }}
                          aria-label={item.aria}
                          data-cursor="ASK"
                          className="inline-flex items-center gap-1.5 rounded-sm text-brass underline decoration-brass/35 decoration-dotted underline-offset-4 transition-colors duration-300 hover:text-brass-soft hover:decoration-brass-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brass"
                        >
                          {item.idle}
                          <ArrowUpRight size={11} strokeWidth={1.6} aria-hidden="true" />
                        </button>
                      ) : (
                        <span className="text-bone/75">{item.fact ? item.fact.value : item.text}</span>
                      )}
                    </li>
                  ))}
                </ul>

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
                    <Download size={14} className="transition-transform duration-500 group-hover:translate-y-0.5" />
                    {t("cta.downloadBrochure")}
                  </button>
                </div>
              </div>
            </div>

            {/* scroll cue */}
            <div className="hero-cue pointer-events-none absolute bottom-6 right-6 z-10 hidden items-center gap-2 md:flex lg:bottom-8 lg:right-8">
              <span className="mono text-[0.56rem] tracking-[0.24em] text-ink-faint">Scroll to enter</span>
              <span className="h-px w-8 bg-gradient-to-r from-brass to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
