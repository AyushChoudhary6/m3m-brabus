import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, ArrowUpRight } from "lucide-react";
import Media from "../ui/Media.jsx";
import Magnetic from "../ui/Magnetic.jsx";
import { RESIDENCES } from "../../lib/site.js";
import { px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 06 — THE RESIDENCES
   A private presentation, not a property card. The residence fills the screen
   and becomes the hero; a floating glass panel quietly delivers the details.
   Pinned "walk-closer" scroll, staged cinematic entrance, ambient light,
   multi-layer mouse parallax, slow hover breathing. */
export default function Residences() {
  const root = useRef(null);
  const pin = useRef(null);
  const firstRun = useRef(true);
  const [active, setActive] = useState(0);
  const res = RESIDENCES[active];

  // "5 BHK Residence" → head "5 BHK", tail "Residence"
  const words = res.name.split(" ");
  const tail = words.pop();
  const head = words.join(" ");

  // ---- Entrance + pin + ambient + parallax (runs once) ----
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      return gsap.matchMedia().add(
        {
          desktop: "(min-width:1024px) and (prefers-reduced-motion:no-preference)",
          mobile: "(max-width:1023px) and (prefers-reduced-motion:no-preference)",
          reduce: "(prefers-reduced-motion:reduce)",
        },
        (ctx) => {
          if (ctx.conditions.reduce) return;

          // Ambient warm light drift + gentle sunlight sweep
          gsap.to(q(".res-ambient"), { xPercent: 12, yPercent: -8, duration: 20, ease: "sine.inOut", yoyo: true, repeat: -1 });
          gsap
            .timeline({ repeat: -1, repeatDelay: 9 })
            .fromTo(q(".res-sun"), { xPercent: -130, autoAlpha: 0 }, { autoAlpha: 0.5, duration: 2, ease: "sine.in" })
            .to(q(".res-sun"), { xPercent: 240, duration: 4.5, ease: "sine.inOut" }, 0)
            .to(q(".res-sun"), { autoAlpha: 0, duration: 2, ease: "sine.out" }, "-=2");

          // Staged entrance (plays once as the section approaches)
          gsap.set(q(".res-img-enter"), { scale: 1.15, filter: "blur(15px)", autoAlpha: 0 });
          gsap.set(q(".res-chapter-mask"), { clipPath: "inset(0 100% 0 0)" });
          gsap.set(q(".res-card"), { y: 44, autoAlpha: 0, filter: "blur(12px)" });
          gsap.set(q(".res-hd-inner"), { yPercent: 118, autoAlpha: 0 });
          gsap.set(q(".res-stagger"), { y: 16, autoAlpha: 0 });

          gsap
            .timeline({ scrollTrigger: { trigger: root.current, start: "top 60%", once: true }, defaults: { ease: "power4.out" } })
            .to(q(".res-img-enter"), { scale: 1, filter: "blur(0px)", autoAlpha: 1, duration: 1.8, ease: "expo.out" }, 0)
            .to(q(".res-chapter-mask"), { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power4.inOut" }, 0.5)
            .to(q(".res-card"), { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.1 }, 0.9)
            .to(q(".res-hd-inner"), { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: 0.14 }, 1.15)
            .to(q(".res-stagger"), { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08 }, 1.4);

          // Desktop only — pin + scrubbed "walk closer"
          if (ctx.conditions.desktop) {
            gsap
              .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=130%", scrub: true, pin: pin.current, anticipatePin: 1 } })
              .to(q(".res-img-zoom"), { scale: 1.08, ease: "none" }, 0)
              .to(q(".res-hd"), { scale: 0.94, transformOrigin: "left top", ease: "none" }, 0)
              .to(q(".res-card"), { yPercent: -5, ease: "none" }, 0)
              .to(q(".res-veil"), { autoAlpha: 1, ease: "none" }, 0.72); // dissolve toward the ivory gap
          }

          // Multi-layer mouse parallax (eased; each on its own node — no clashes)
          if (window.matchMedia("(pointer:fine)").matches) {
            const mk = (el, amt) => {
              const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" });
              const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" });
              return (nx, ny) => { xTo(nx * amt); yTo(ny * amt); };
            };
            const img = mk(q(".res-parallax-img")[0], 6);
            const card = mk(q(".res-card-parallax")[0], 10);
            const hd = mk(q(".res-hd")[0], 4);
            const onMove = (e) => {
              const nx = e.clientX / window.innerWidth - 0.5;
              const ny = e.clientY / window.innerHeight - 0.5;
              img(nx, ny); card(nx, ny); hd(nx, ny);
            };
            window.addEventListener("mousemove", onMove);
            return () => window.removeEventListener("mousemove", onMove);
          }
        }
      );
    },
    { scope: root }
  );

  // ---- Config change crossfade (skips first render) ----
  useGSAP(
    () => {
      if (firstRun.current) {
        firstRun.current = false;
        return;
      }
      const q = gsap.utils.selector(root);
      gsap.fromTo(q(".res-detail"), { autoAlpha: 0, y: 12, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" });
    },
    { scope: root, dependencies: [active] }
  );

  return (
    <section ref={root} className="relative">
      <div ref={pin} className="group relative h-[100svh] overflow-hidden" data-cursor="ENTER">
        {/* ---- Full-screen residence (nested depth layers) ---- */}
        <div className="res-img-zoom absolute inset-0">
          <div className="res-parallax-img absolute inset-0">
            <div className="res-img-enter absolute inset-0">
              <div className="res-img-hover absolute inset-0 transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
                {RESIDENCES.map((r, i) => (
                  <div
                    key={r.id}
                    className="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ opacity: i === active ? 1 : 0 }}
                  >
                    <Media src={px(r.image, 2000)} alt={`${r.name} — interior`} priority={i === 0} sizes="100vw" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Image treatment ---- */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_95%_at_50%_42%,transparent_45%,rgba(20,15,8,0.42)_100%)]" />
        <div className="res-ambient pointer-events-none absolute -inset-1/4 [background:radial-gradient(38%_38%_at_30%_28%,rgba(226,207,158,0.28),transparent_70%)]" />
        <div className="res-sun pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 opacity-0 [background:linear-gradient(105deg,transparent,rgba(255,247,230,0.5),transparent)] [mix-blend-mode:soft-light]" />
        <div className="hero-grain pointer-events-none absolute inset-0" />
        {/* dissolve-to-ivory veil (revealed on scroll-out) */}
        <div className="res-veil pointer-events-none absolute inset-0 bg-canvas opacity-0" />

        {/* ---- Floating chapter label (top-left) ---- */}
        <div className="pointer-events-none absolute left-6 top-28 overflow-hidden md:left-10 md:top-32">
          <p className="res-chapter-mask kicker text-champagne-soft">Chapter VI — The Residences</p>
        </div>

        {/* ---- Floating glass panel (bottom-right) ---- */}
        <div className="res-card absolute inset-x-4 bottom-6 md:inset-x-auto md:bottom-10 md:right-10 md:w-[420px]">
          <div className="res-card-parallax">
            <div className="rounded-[24px] border border-white/40 bg-white/60 p-8 shadow-[0_40px_120px_rgba(20,15,8,0.18)] backdrop-blur-[25px] transition-[transform,box-shadow,background-color] duration-500 ease-lux hover:-translate-y-2 hover:bg-white/65 hover:shadow-[0_50px_140px_rgba(20,15,8,0.26)] md:p-10">
              {/* config toggle */}
              <div className="res-stagger mb-6 inline-flex rounded-full border border-ink/15 p-0.5">
                {RESIDENCES.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => setActive(i)}
                    className={`rounded-full px-4 py-1.5 font-sans text-[0.68rem] font-medium uppercase tracking-[0.12em] transition-colors duration-500 ${active === i ? "bg-ink text-canvas" : "text-ink-soft hover:text-ink"}`}
                  >
                    {r.id.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="res-detail">
                <p className="res-stagger kicker text-brass">{res.tag} Collection</p>

                <h3 className="res-hd mt-4 font-display font-light leading-[0.92] tracking-[-0.02em] text-ink">
                  <span className="block overflow-hidden">
                    <span className="res-hd-inner block text-[clamp(2.6rem,4vw,4.5rem)]">{head}</span>
                  </span>
                  <span className="block overflow-hidden">
                    <span className="res-hd-inner block text-[clamp(2.6rem,4vw,4.5rem)]">{tail}</span>
                  </span>
                </h3>
                <p className="res-stagger mt-3 font-display text-lg italic text-ink-soft">{res.subtitle}</p>

                <div className="res-stagger my-7 h-px w-full bg-ink/12" />

                {/* specifications */}
                <dl className="res-stagger grid grid-cols-2 gap-5" data-cursor="EXPLORE">
                  <div>
                    <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">Carpet Area</dt>
                    <dd className="mt-1.5 font-display text-lg text-ink">{res.area}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">Orientation</dt>
                    <dd className="mt-1.5 text-sm leading-snug text-ink-soft">{res.facing}</dd>
                  </div>
                </dl>

                {/* features */}
                <ul className="mt-7 grid grid-cols-2 gap-x-5 gap-y-3.5">
                  {res.features.map((f) => (
                    <li key={f} className="res-stagger flex items-center gap-2.5 text-sm text-ink-soft">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-brass/40 text-brass">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="res-stagger mt-9">
                  <Magnetic>
                    <a
                      href="#enquire"
                      data-cursor="REQUEST"
                      className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-ink px-6 py-4 transition-shadow duration-500 hover:shadow-[0_24px_50px_-20px_rgba(20,15,8,0.6)]"
                    >
                      <span className="absolute inset-0 origin-left scale-x-0 rounded-full bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                      <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.14em] text-canvas">Request Floor Plan</span>
                      <span className="relative z-10 grid h-6 w-6 place-items-center rounded-full bg-canvas/15 transition-transform duration-500 group-hover/cta:translate-x-1">
                        <ArrowUpRight size={13} className="text-canvas" />
                      </span>
                    </a>
                  </Magnetic>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
