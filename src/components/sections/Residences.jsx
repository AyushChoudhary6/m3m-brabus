import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import Magnetic from "../ui/Magnetic.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { RESIDENCES } from "../../lib/site.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 03 — THE RESIDENCES
   Both configurations, presented as an interactive pair. Each plate tilts in
   3D toward the cursor under a travelling gold glare; hovering one lifts it
   and quiets its partner. Word-by-word names, a drawn gold rule, staged
   specs, a magnetic CTA.

   The plates carry no photograph, by decision. No interior render of either
   home exists — the only published frames are the towers, the arrival court
   and the lobby — and a 4:5 picture of a shared marble lobby sitting directly
   above the words "5 BHK Residence" reads as that residence whatever the alt
   text says. All three renders are already shown once each, accurately
   captioned, in the Exhibition band further down this same page, so borrowing
   one here would have been both untrue and the fourth appearance of the lobby
   on the homepage. What a buyer is comparing at this point is size, aspect and
   schedule; set as an engraved plaque, that is the more useful plate. The
   frames themselves, with captions naming what is in them, live on
   /residences. */

/* Presentation only: "≈ 5,000 sq.ft" wants its unit set small beside the
   figure. Fails open — an area written any other way prints whole. */
function splitArea(area) {
  const m = /^(.*?)\s*(sq\.?\s*ft\.?)$/i.exec(String(area || ""));
  return m ? { figure: m[1], unit: m[2] } : { figure: area, unit: "" };
}
export default function Residences() {
  const root = useRef(null);
  const { openEnquiry } = useEnquiry();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      gsap.matchMedia().add(
        {
          ok: "(prefers-reduced-motion: no-preference)",
          fine: "(min-width:1024px) and (pointer:fine) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          if (!ctx.conditions.ok) return;
          const cards = q(".res-card");

          // ---- entrance (per card) ----
          cards.forEach((card) => {
            const wrap = card.querySelector(".res-plate");
            gsap.set(wrap, { clipPath: "inset(100% 0 0 0)" });
            gsap.set(card.querySelectorAll(".res-word"), { yPercent: 112 });
            gsap.set(card.querySelector(".res-rule"), { scaleX: 0 });
            gsap.set(card.querySelectorAll(".rise"), { autoAlpha: 0, y: 22 });

            gsap
              .timeline({ scrollTrigger: { trigger: card, start: "top 80%" } })
              .to(wrap, { clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "power3.inOut" }, 0)
              .to(card.querySelectorAll(".res-word"), { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.08 }, 0.35)
              .to(card.querySelector(".res-rule"), { scaleX: 1, duration: 1.1, ease: "power3.inOut" }, 0.55)
              .to(card.querySelectorAll(".rise"), { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.07 }, 0.6);
          });

          // ---- 3D tilt + gold glare + focus/quiet (desktop, fine pointer) ----
          if (!ctx.conditions.fine) return;
          const cleanups = [];
          cards.forEach((card) => {
            const tilt = card.querySelector(".res-tilt");
            const glare = card.querySelector(".res-glare");
            const rX = gsap.quickTo(tilt, "rotationX", { duration: 0.6, ease: "power3" });
            const rY = gsap.quickTo(tilt, "rotationY", { duration: 0.6, ease: "power3" });
            const gX = gsap.quickTo(glare, "xPercent", { duration: 0.6, ease: "power3" });
            const gY = gsap.quickTo(glare, "yPercent", { duration: 0.6, ease: "power3" });

            const onMove = (e) => {
              const r = card.getBoundingClientRect();
              const nx = (e.clientX - r.left) / r.width - 0.5;
              const ny = (e.clientY - r.top) / r.height - 0.5;
              rY(nx * 9);
              rX(-ny * 9);
              gX(nx * 55);
              gY(ny * 55);
            };
            const onEnter = () => {
              gsap.to(glare, { autoAlpha: 1, duration: 0.4 });
              cards.forEach((c) => c !== card && gsap.to(c, { autoAlpha: 0.42, duration: 0.5, ease: "power2.out" }));
            };
            const onLeave = () => {
              rX(0); rY(0);
              gsap.to(glare, { autoAlpha: 0, duration: 0.5 });
              cards.forEach((c) => gsap.to(c, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }));
            };
            card.addEventListener("mousemove", onMove);
            card.addEventListener("mouseenter", onEnter);
            card.addEventListener("mouseleave", onLeave);
            cleanups.push(() => {
              card.removeEventListener("mousemove", onMove);
              card.removeEventListener("mouseenter", onEnter);
              card.removeEventListener("mouseleave", onLeave);
            });
          });
          return () => cleanups.forEach((fn) => fn());
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="residences" ref={root} className="container-lux py-[clamp(5rem,13vh,9rem)]">
      <div className="mb-[clamp(2.5rem,6vh,4.5rem)] grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
        <div className="flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">The Residences</span>
        </div>
        <h2 className="max-w-[22ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
          Open on three sides. <span className="font-serif italic text-brass">A collection for the few.</span>
        </h2>
      </div>

      <div className="grid gap-x-14 gap-y-[clamp(3rem,7vh,5rem)] md:grid-cols-2">
        {RESIDENCES.map((r, i) => {
          const area = splitArea(r.area);
          return (
            <article key={r.id} className="res-card group [perspective:1400px]" data-cursor="VIEW">
              {/* tilting plate — typographic, no photograph */}
              <div className="res-tilt relative [transform-style:preserve-3d]">
                {/* Mobile: size to content (no fixed aspect) so the feature list
                    never clips and there's no empty image void; the plate keeps
                    its gallery-plate 4:5 aspect on desktop. */}
                <div className="res-plate relative flex flex-col justify-start gap-12 overflow-hidden rounded-[1.5rem] border border-line bg-paper p-6 transition-colors duration-500 group-hover:border-brass/50 sm:p-8 md:aspect-[4/5] md:justify-between md:gap-0">
                  {/* decorative only — a lit corner and a travelling gold glare,
                      depicting nothing and captioned as nothing */}
                  <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_10%_0%,rgba(201,168,106,0.14),transparent_60%)]" />
                  <div className="res-glare pointer-events-none absolute inset-[-35%] opacity-0 mix-blend-soft-light [background:radial-gradient(circle_at_center,rgba(235,214,160,0.5),transparent_42%)]" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />

                  <div className="relative flex items-baseline justify-between gap-4">
                    <span className="mono text-[0.58rem] tracking-[0.2em] text-brass-soft">
                      {String(i + 1).padStart(2, "0")} / {String(RESIDENCES.length).padStart(2, "0")}
                    </span>
                    <span className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">{r.tag}</span>
                  </div>

                  <div className="relative">
                    {/* the figure that actually separates the two homes */}
                    {/* Total area, as published. Carpet area is NOT published — ConfigTable
                        on /residences gates it behind an enquiry, and this headline must agree. */}
                    <p className="rise mono text-[0.56rem] tracking-[0.2em] text-ink-faint">Total area</p>
                    <p className="rise mt-2 font-display font-light leading-[0.88] tracking-[-0.03em] text-ink">
                      <span className="text-[clamp(2.8rem,6.4vw,4.4rem)]">{area.figure}</span>
                      {area.unit && (
                        <span className="ml-2 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
                          {area.unit}
                        </span>
                      )}
                    </p>

                    <div className="rise mt-6 h-px w-full bg-gradient-to-r from-brass/50 via-line to-transparent" />

                    <ul className="mt-5 space-y-2.5">
                      {r.features.map((f) => (
                        <li key={f} className="rise flex items-center gap-2.5 text-sm text-ink-soft">
                          <Check size={13} strokeWidth={2} className="shrink-0 text-brass" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* details */}
              <div className="mt-6">
                <h3 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-light tracking-[-0.01em] text-ink">
                  {r.name.split(" ").map((w, wi) => (
                    <span key={wi} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
                      <span className="res-word inline-block">{w}</span>
                    </span>
                  ))}
                </h3>
              </div>
              <div className="res-rule mt-4 h-px w-full origin-left bg-gradient-to-r from-brass via-brass/40 to-transparent" />

              <p className="rise mt-4 font-serif text-lg italic text-ink-soft">{r.subtitle}</p>

              <dl className="rise mt-5">
                <dt className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">Orientation</dt>
                <dd className="mt-1 text-sm leading-snug text-ink-soft">{r.facing}</dd>
              </dl>

              <div className="rise mt-7">
                <Magnetic>
                  <button
                    type="button"
                    onClick={() => openEnquiry(r.name)}
                    data-cursor="REQUEST"
                    className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-6 py-3.5"
                  >
                    <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                    <span className="relative z-10 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                      Request floor plan
                    </span>
                    <span className="relative z-10 text-brass transition-[transform,color] duration-500 group-hover/cta:translate-x-1 group-hover/cta:text-obsidian">→</span>
                  </button>
                </Magnetic>
              </div>
            </article>
          );
        })}
      </div>

      {/* Said plainly, so the absent picture reads as a decision rather than a
          gap: what M3M has released is shown, once each, in the Exhibition. */}
      <p className="mono mt-[clamp(2rem,5vh,3rem)] text-[0.58rem] leading-relaxed tracking-[0.2em] text-ink-faint">
        No interior render of either residence has been published · The official
        renders of the towers, the arrival court and the lobby are shown in full below
      </p>
    </section>
  );
}
