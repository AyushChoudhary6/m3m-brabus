import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, ArrowUpRight } from "lucide-react";
import Media from "../ui/Media.jsx";
import Magnetic from "../ui/Magnetic.jsx";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 07 — THE LIFESTYLE
   A pinned, scroll-driven cinematic tour. The visitor walks amenity to
   amenity; the world behind transforms while one glass panel stays constant
   and its content morphs. Camera drift, ambient light, a vertical progress
   rail, morphing typography — a private guided tour, not a gallery. */
const SCENES = [
  { amenity: "The Club", lines: ["The BRABUS", "Club"], id: IMG.lobbyWarm, tint: "rgba(120,140,160,0.14)",
    desc: "A members-only sanctuary for work, leisure and extraordinary conversations.",
    features: ["Private Library", "Executive Lounge", "Member Bar", "Business Suites"], cta: "Enter the Club" },
  { amenity: "Spa", lines: ["The Spa &", "Wellness"], id: IMG.spa, tint: "rgba(198,166,100,0.16)",
    desc: "Hammam, sauna and treatment suites — a ritual of stillness to restore the day.",
    features: ["Hammam & Sauna", "Treatment Suites", "Meditation Room", "Vitality Pool"], cta: "Enter the Spa" },
  { amenity: "Pool", lines: ["The Olympic", "Pool"], id: IMG.pool, tint: "rgba(60,110,140,0.20)",
    desc: "A temperature-controlled pool beneath cascading light and stone.",
    features: ["Olympic Length", "Temperature-Controlled", "Poolside Cabanas", "Sun Deck"], cta: "Discover the Pool" },
  { amenity: "Gym", lines: ["Performance", "Gym"], id: IMG.gym, tint: "rgba(18,18,24,0.44)",
    desc: "A precision fitness suite — engineered like a machine, tuned for performance.",
    features: ["Technogym Suite", "Free Weights", "Recovery Zone", "Personal Training"], cta: "Explore Performance" },
  { amenity: "Theatre", lines: ["The Private", "Theatre"], id: IMG.bedroomDecor, tint: "rgba(20,24,40,0.36)",
    desc: "An acoustically-tuned screening room curated for the after-hours.",
    features: ["Screening Room", "Amphitheatre", "Games Lounge", "Golf Simulator"], cta: "Enter the Theatre" },
  { amenity: "Sky Lounge", lines: ["The Sky", "Lounge"], id: IMG.duplexLiving, tint: "rgba(180,90,50,0.16)",
    desc: "Elevated decks and champagne at dusk, suspended above the skyline.",
    features: ["Rooftop Deck", "Champagne Bar", "Fire Lounge", "Private Cellar"], cta: "Ascend the Lounge" },
  { amenity: "Dining", lines: ["Fine", "Dining"], id: IMG.livingRoom, tint: "rgba(150,110,70,0.16)",
    desc: "Signature restaurants and a chef's table for curated evenings.",
    features: ["Signature Restaurant", "Chef's Table", "Private Dining", "Al Fresco Terrace"], cta: "Reserve a Table" },
];

const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Lifestyle() {
  const root = useRef(null);
  const pin = useRef(null);
  const stRef = useRef(null);
  const idxRef = useRef(0);
  const [active, setActive] = useState(0);
  const scene = SCENES[active];

  // ---- Pin + progress + ambient + parallax (once) ----
  useGSAP(
    () => {
      if (reduce) return;
      const q = gsap.utils.selector(root);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Pin the tour; scroll drives the active scene + the progress line.
        gsap.set(q(".tour-line-fill"), { scaleY: 0 });
        stRef.current = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: `+=${SCENES.length * 85}%`,
          pin: pin.current,
          anticipatePin: 1,
          onUpdate: (self) => {
            gsap.set(q(".tour-line-fill"), { scaleY: self.progress });
            const i = Math.min(SCENES.length - 1, Math.floor(self.progress * SCENES.length));
            if (i !== idxRef.current) {
              idxRef.current = i;
              setActive(i);
            }
          },
        });

        // Panel enters once
        gsap.set(q(".tour-panel"), { y: 80, autoAlpha: 0, filter: "blur(15px)", scale: 0.96 });
        gsap.to(q(".tour-panel"), {
          y: 0, autoAlpha: 1, filter: "blur(0px)", scale: 1, duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: root.current, start: "top 65%", once: true },
        });

        // Ambient warm light drift
        gsap.to(q(".tour-ambient"), { xPercent: 12, yPercent: -8, duration: 20, ease: "sine.inOut", yoyo: true, repeat: -1 });

        // Mouse parallax — image 6px, panel 8px
        if (window.matchMedia("(pointer:fine)").matches) {
          const mk = (el, amt) => {
            const xTo = gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" });
            const yTo = gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" });
            return (nx, ny) => { xTo(nx * amt); yTo(ny * amt); };
          };
          const img = mk(q(".tour-parallax")[0], 6);
          const panel = mk(q(".tour-panel-parallax")[0], 8);
          const onMove = (e) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            img(nx, ny); panel(nx, ny);
          };
          window.addEventListener("mousemove", onMove);
          return () => window.removeEventListener("mousemove", onMove);
        }
      });
    },
    { scope: root }
  );

  // ---- Panel content morph on scene change (also the initial reveal) ----
  useGSAP(
    () => {
      if (reduce) return;
      const q = gsap.utils.selector(root);
      gsap.set(q(".tour-hd-inner"), { yPercent: 118, autoAlpha: 0 });
      gsap.set(q(".tour-rise"), { y: 14, autoAlpha: 0 });
      gsap.set(q(".tour-feat"), { y: 12, autoAlpha: 0 });
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .to(q(".tour-hd-inner"), { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.1 }, 0)
        .to(q(".tour-rise"), { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1 }, 0.15)
        .to(q(".tour-feat"), { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.07 }, 0.28);
    },
    { scope: root, dependencies: [active] }
  );

  const goTo = (i) => {
    const st = stRef.current;
    if (!st) return;
    st.scroll(st.start + (st.end - st.start) * ((i + 0.5) / SCENES.length));
  };

  // ---- Reduced-motion fallback: a calm stacked list ----
  if (reduce) {
    return (
      <section className="bg-ink-900 py-[10vh] text-white">
        <div className="px-[var(--spacing-gutter)]">
          <p className="kicker mb-10 text-champagne-soft">Chapter 07 — The Lifestyle</p>
          <div className="space-y-8">
            {SCENES.map((s) => (
              <article key={s.amenity} className="grid gap-6 md:grid-cols-2 md:items-center">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem]">
                  <Media src={px(s.id, 1200)} alt={s.lines.join(" ")} sizes="50vw" />
                </div>
                <div>
                  <h3 className="font-display text-3xl">{s.lines.join(" ")}</h3>
                  <p className="mt-3 max-w-md text-white/70">{s.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={root} className="relative">
      <div ref={pin} className="relative h-[100svh] overflow-hidden bg-ink-900" data-cursor="ENTER">
        {/* ---- Cinematic scene stack ---- */}
        <div className="tour-parallax absolute inset-0">
          {SCENES.map((s, i) => (
            <div
              key={s.amenity}
              className="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ opacity: i === active ? 1 : 0 }}
            >
              <div className="tour-ken absolute inset-0">
                <Media src={px(s.id, 2000)} alt={s.lines.join(" ")} priority={i === 0} sizes="100vw" />
              </div>
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(10,9,8,0.35) 0%, transparent 30%, rgba(10,9,8,0.65) 100%), linear-gradient(90deg, transparent 40%, ${s.tint} 100%)` }} />
            </div>
          ))}
        </div>

        {/* ---- Treatment ---- */}
        <div className="tour-ambient pointer-events-none absolute -inset-1/4 [background:radial-gradient(36%_36%_at_28%_30%,rgba(226,207,158,0.22),transparent_70%)]" />
        <div className="hero-grain pointer-events-none absolute inset-0" />

        {/* ---- Top progress readout ---- */}
        <div className="pointer-events-none absolute left-6 top-28 z-20 md:left-10">
          <p className="kicker text-white/70">Chapter 07 — The Lifestyle</p>
          <p className="mt-2 font-display text-sm italic text-champagne-soft">
            {String(active + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")} · {scene.amenity}
          </p>
        </div>

        {/* ---- Vertical progress rail (desktop) ---- */}
        <div className="absolute left-10 top-1/2 z-20 hidden -translate-y-1/2 lg:block">
          <p className="kicker mb-5 text-white/60">Lifestyle Tour</p>
          <div className="relative pl-6">
            <div className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px bg-white/20" />
            <div className="tour-line-fill absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px origin-top bg-brass" />
            <ul className="flex flex-col gap-3.5">
              {SCENES.map((s, i) => (
                <li key={s.amenity}>
                  <button
                    onClick={() => goTo(i)}
                    className="group flex items-center gap-3 text-left"
                    data-cursor="EXPLORE"
                  >
                    <span className={`font-sans text-[0.62rem] tracking-[0.15em] transition-colors ${active === i ? "text-champagne-soft" : "text-white/35"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`font-display text-sm transition-all duration-500 ${active === i ? "translate-x-1 italic text-white" : "text-white/45 group-hover:text-white/80"}`}>
                      {s.amenity}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---- Floating glass panel (constant; content morphs) ---- */}
        <div className="tour-panel absolute inset-x-5 bottom-6 z-20 md:inset-x-auto md:bottom-[9vh] md:right-[5vw] md:w-[400px]">
          <div className="ls-float">
            <div className="tour-panel-parallax">
              <div className="group relative overflow-hidden rounded-[28px] border border-white/30 bg-[rgba(255,248,240,0.55)] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.16)] backdrop-blur-[28px] transition-[transform,box-shadow,border-color] duration-500 ease-lux hover:scale-[1.015] hover:border-white/45 hover:shadow-[0_54px_150px_rgba(0,0,0,0.24)] md:p-10">
                <div className="pointer-events-none absolute inset-0 rounded-[28px] [background:linear-gradient(180deg,rgba(255,255,255,0.35),transparent_38%,rgba(20,15,8,0.05))]" />
                <div className="ls-reflect pointer-events-none absolute -inset-y-8 left-0 w-1/3 [background:linear-gradient(105deg,transparent,rgba(255,252,245,0.6),transparent)]" />

                <div className="relative">
                  <p className="font-sans text-[0.64rem] font-medium uppercase tracking-[0.32em] text-brass/70">The Lifestyle</p>

                  <h3 className="mt-4 font-display text-[clamp(2.4rem,3vw,3.1rem)] font-medium leading-[1.02] text-ink">
                    {scene.lines.map((l, i) => (
                      <span key={i} className="block overflow-hidden">
                        <span className="tour-hd-inner block">{l}</span>
                      </span>
                    ))}
                  </h3>

                  <p className="tour-rise mt-4 max-w-[36ch] text-[0.92rem] font-light leading-relaxed text-ink-soft">{scene.desc}</p>

                  <div className="tour-rise mt-6 h-px w-20 bg-gradient-to-r from-brass to-transparent" />

                  <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3">
                    {scene.features.map((f) => (
                      <li key={f} className="tour-feat flex items-center gap-2.5 text-[0.82rem] text-ink-soft">
                        <Check size={12} strokeWidth={2.5} className="shrink-0 text-brass" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="tour-rise mt-8">
                    <Magnetic>
                      <a
                        href="#enquire"
                        data-cursor="REQUEST"
                        className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-ink px-6 py-3.5 transition-shadow duration-500 hover:shadow-[0_24px_50px_-20px_rgba(20,15,8,0.6)]"
                      >
                        <span className="absolute inset-0 origin-left scale-x-0 rounded-full bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                        <span className="relative z-10 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-canvas">{scene.cta}</span>
                        <span className="relative z-10 grid h-5 w-5 place-items-center transition-transform duration-500 group-hover/cta:translate-x-1">
                          <ArrowUpRight size={14} className="text-canvas" />
                        </span>
                      </a>
                    </Magnetic>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
