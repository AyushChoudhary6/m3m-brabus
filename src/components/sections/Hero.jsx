import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Button from "../ui/Button.jsx";
import Magnetic from "../ui/Magnetic.jsx";
import Media from "../ui/Media.jsx";
import { PROJECT } from "../../lib/site.js";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 01 — ARRIVAL
   Full-bleed 100vh. One breathtaking visual. Typography anchored to the
   edges so the whole screen is used, not a centred column. */
export default function Hero() {
  const root = useRef(null);
  const bandScroll = useRef(null);
  const bandFocus = useRef(null);
  const ambient = useRef(null);
  const contentExit = useRef(null);
  const headingPar = useRef(null);
  const indicator = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      gsap.matchMedia().add(
        { reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" },
        (ctx) => {
          if (ctx.conditions.reduce) {
            gsap.set([q(".kicker-mask"), q(".hd-inner"), q(".meta-inner")], { clearProps: "all" });
            gsap.set(bandFocus.current, { autoAlpha: 1, filter: "blur(0px)", scale: 1 });
            return;
          }

          // Initial states (layout effect → no flash)
          gsap.set(q(".kicker-mask"), { clipPath: "inset(0 100% 0 0)" });
          gsap.set(q(".hd-inner"), { yPercent: 115, autoAlpha: 0, filter: "blur(16px)" });
          gsap.set(q(".meta-inner"), { y: 16, autoAlpha: 0, filter: "blur(6px)" });
          gsap.set(bandFocus.current, { autoAlpha: 0, filter: "blur(20px)", scale: 1.08 });
          gsap.set(indicator.current, { autoAlpha: 0 });

          const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
          tl.to(bandFocus.current, { autoAlpha: 1, filter: "blur(0px)", scale: 1, duration: 2, ease: "expo.out" }, 0)
            .to(q(".kicker-mask"), { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power4.inOut" }, 0.5)
            .to(q(".hd-inner"), { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.2, stagger: 0.16 }, 0.7)
            .fromTo(q(".gold-sweep"), { backgroundPositionX: "120%" }, { backgroundPositionX: "-20%", duration: 1.1, ease: "power2.inOut" }, 1.5)
            .to(q(".meta-inner"), { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1, stagger: 0.12 }, 1.7)
            .to(indicator.current, { autoAlpha: 1, duration: 0.9 }, 2.1);

          // Ambient light drift + indicator dot
          gsap.to(ambient.current, { xPercent: 8, yPercent: -6, duration: 16, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.2 });
          gsap.to(q(".ind-dot"), { y: 40, duration: 1.9, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2.2 });

          // Scroll exit — image scales, content lifts & fades
          gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } })
            .to(bandScroll.current, { scale: 1.14, ease: "none" }, 0)
            .to(contentExit.current, { yPercent: -18, autoAlpha: 0, ease: "none" }, 0)
            .to(indicator.current, { autoAlpha: 0, ease: "none" }, 0);

          // Mouse parallax (eased, separate nodes)
          const bg = { x: gsap.quickTo(bandFocus.current, "x", { duration: 0.8, ease: "power3.out" }), y: gsap.quickTo(bandFocus.current, "y", { duration: 0.8, ease: "power3.out" }) };
          const hd = { x: gsap.quickTo(headingPar.current, "x", { duration: 0.8, ease: "power3.out" }), y: gsap.quickTo(headingPar.current, "y", { duration: 0.8, ease: "power3.out" }) };
          const onMove = (e) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            bg.x(nx * 16); bg.y(ny * 16);
            hd.x(nx * 7); hd.y(ny * 7);
          };
          if (window.matchMedia("(pointer:fine)").matches) window.addEventListener("mousemove", onMove);
          return () => window.removeEventListener("mousemove", onMove);
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative mx-3 h-[100svh] min-h-[640px] overflow-hidden rounded-[2.5rem] bg-ink-900 md:mx-5">
      {/* Full-bleed visual */}
      <div className="absolute inset-0">
        <div ref={bandScroll} className="h-full w-full">
          <div ref={bandFocus} className="h-full w-full">
            <Media src={px(IMG.heroExterior, 2000)} alt="M3M Brabus branded residences, Sector 58 Gurgaon" priority sizes="100vw" />
          </div>
        </div>
        <div className="absolute inset-0 [background:linear-gradient(180deg,rgba(10,9,8,0.55)_0%,rgba(10,9,8,0.15)_38%,rgba(10,9,8,0.75)_100%)]" />
        <div ref={ambient} className="pointer-events-none absolute -inset-1/4 [background:radial-gradient(40%_40%_at_30%_35%,rgba(198,166,100,0.16),transparent_70%)]" />
        <div className="hero-grain pointer-events-none absolute inset-0" />
      </div>

      {/* Content — corner-anchored, whole-screen composition */}
      <div ref={contentExit} className="relative z-10 flex h-full flex-col px-[var(--spacing-gutter)]">
        <div className="pt-32 md:pt-36">
          <p className="kicker flex items-center gap-3 overflow-hidden text-champagne-soft">
            <span className="kicker-mask inline-flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-brass-soft" />
              {PROJECT.developer} presents · with {PROJECT.partner}
            </span>
          </p>
        </div>

        <div ref={headingPar} className="mt-auto pb-10 md:pb-14">
          <h1 className="font-display text-[clamp(3rem,11vw,10rem)] font-light leading-[0.9] tracking-[-0.02em] text-white">
            <span className="block overflow-hidden">
              <span className="hd-inner block">Branded</span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="hd-inner gold-sweep block italic"
                style={{
                  color: "transparent",
                  backgroundImage: "linear-gradient(100deg,#c2a15f 0%,#c2a15f 42%,#f3e6c4 50%,#c2a15f 58%,#c2a15f 100%)",
                  backgroundSize: "250% 100%",
                  backgroundPositionX: "120%",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
              >
                residences.
              </span>
            </span>
          </h1>

          {/* Bottom meta row spans full width */}
          <div className="mt-8 flex flex-col gap-8 border-t border-white/15 pt-8 md:flex-row md:items-end md:justify-between">
            <p className="meta-inner max-w-sm text-sm leading-relaxed text-white/70 md:text-base">
              {PROJECT.configs} at {PROJECT.location}, on Golf Course Extension Road.
              Two homes per core — a limited collection for the few.
            </p>
            <div className="meta-inner flex flex-wrap gap-4" data-cursor="ENTER">
              <Magnetic><Button variant="light" href="#enquire">Register Interest</Button></Magnetic>
              <Magnetic>
                <a href="#philosophy" className="group inline-flex items-center gap-3 px-2 py-4 font-sans text-[0.78rem] font-medium uppercase tracking-[0.14em] text-white/80 transition-colors hover:text-white">
                  Begin the journey
                  <span className="inline-block h-px w-8 bg-white/50 transition-all duration-500 group-hover:w-12 group-hover:bg-brass-soft" />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={indicator} className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
        <span className="relative block h-14 w-px bg-white/25">
          <span className="ind-dot absolute -left-[2px] top-0 block h-[5px] w-[5px] rounded-full bg-brass-soft" />
        </span>
      </div>
    </section>
  );
}
