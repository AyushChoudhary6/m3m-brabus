import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, ArrowUpRight } from "lucide-react";
import Media from "../ui/Media.jsx";
import Magnetic from "../ui/Magnetic.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { RESIDENCES } from "../../lib/site.js";
import { px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 03 — THE RESIDENCES
   Two homes per core, presented as an interactive pair. Each plate tilts in
   3D toward the cursor under a travelling gold glare; hovering one lifts it
   and quiets its partner. Word-by-word names, a drawn gold rule, staged
   specs, a magnetic CTA. */
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

          // ---- entrance + scroll parallax (per card) ----
          cards.forEach((card) => {
            const wrap = card.querySelector(".res-img-wrap");
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

            gsap.to(card.querySelector(".res-img-inner"), {
              yPercent: 8, ease: "none",
              scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
            });
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
          Two homes per core. <span className="font-serif italic text-brass">A collection for the few.</span>
        </h2>
      </div>

      <div className="grid gap-x-14 gap-y-[clamp(3rem,7vh,5rem)] md:grid-cols-2">
        {RESIDENCES.map((r, i) => (
          <article key={r.id} className="res-card group [perspective:1400px]" data-cursor="VIEW">
            {/* tilting plate */}
            <div className="res-tilt relative [transform-style:preserve-3d]">
              <div className="res-img-wrap relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line transition-colors duration-500 group-hover:border-brass/50">
                <div className="res-img-inner absolute inset-0 scale-[1.06] transition-transform duration-[1600ms] ease-lux group-hover:scale-[1.11]">
                  <Media src={px(r.image, 1400)} alt={`${r.name} — interior`} priority={i === 0} sizes="(max-width:768px) 100vw, 42vw" />
                </div>
                {/* travelling gold glare */}
                <div className="res-glare pointer-events-none absolute inset-[-35%] opacity-0 mix-blend-soft-light [background:radial-gradient(circle_at_center,rgba(235,214,160,0.55),transparent_42%)]" />
                <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_46%,rgba(8,6,5,0.72))]" />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />

                <span className="mono absolute left-4 top-4 text-[0.58rem] tracking-[0.2em] text-brass-soft">
                  {String(i + 1).padStart(2, "0")} / {String(RESIDENCES.length).padStart(2, "0")}
                </span>

                {/* hover reveal — over image */}
                <div className="absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-between p-5 opacity-0 transition-[transform,opacity] duration-500 ease-lux group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="mono text-[0.6rem] tracking-[0.22em] text-brass-soft">{r.tag}</span>
                  <span className="inline-flex items-center gap-2 font-sans text-[0.66rem] font-medium uppercase tracking-[0.16em] text-bone">
                    View floor plan
                    <ArrowUpRight size={13} className="text-brass" />
                  </span>
                </div>
              </div>
            </div>

            {/* details */}
            <div className="mt-6 flex items-baseline justify-between">
              <h3 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-light tracking-[-0.01em] text-ink">
                {r.name.split(" ").map((w, wi) => (
                  <span key={wi} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
                    <span className="res-word inline-block">{w}</span>
                  </span>
                ))}
              </h3>
              <span className="kicker whitespace-nowrap">{r.tag}</span>
            </div>
            <div className="res-rule mt-4 h-px w-full origin-left bg-gradient-to-r from-brass via-brass/40 to-transparent" />

            <p className="rise mt-4 font-serif text-lg italic text-ink-soft">{r.subtitle}</p>

            <dl className="rise mt-5 grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <dt className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">Carpet Area</dt>
                <dd className="mt-1 font-display text-base text-ink">{r.area}</dd>
              </div>
              <div>
                <dt className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">Orientation</dt>
                <dd className="mt-1 text-sm leading-snug text-ink-soft">{r.facing}</dd>
              </div>
            </dl>

            <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {r.features.map((f) => (
                <li key={f} className="rise flex items-center gap-2.5 text-sm text-ink-soft">
                  <Check size={13} strokeWidth={2} className="shrink-0 text-brass" />
                  {f}
                </li>
              ))}
            </ul>

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
        ))}
      </div>
    </section>
  );
}
