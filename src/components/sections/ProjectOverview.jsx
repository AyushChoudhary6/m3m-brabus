import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Plus } from "lucide-react";
import Media from "../ui/Media.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { PROJECT, HIGHLIGHTS } from "../../lib/site.js";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 24 — THE PROJECT, IN BRIEF
   Homepage section 03. The four questions a first-time visitor actually asks —
   what is it, why is it different, who is it for, why look — answered above the
   fold of the section. Everything beyond that (philosophy, the marque, the
   architecture) is folded away behind a real button.

   The folded copy is never conditionally rendered. It stays in the DOM at
   height 0 so crawlers and readers-of-source see the full argument; only the
   box collapses. Which also means nothing inside it may be focusable — hidden
   tab stops are worse than a long page — so the panel carries prose only. */

const DETAIL = [
  {
    k: "i",
    t: "The design philosophy",
    d: `The published intent is an open core: every residence opening on three
        sides so that light and air reach each room, rather than only the rooms that face
        outward. ${HIGHLIGHTS[3].body}`,
  },
  {
    k: "ii",
    t: "The BRABUS collaboration",
    d: `BRABUS built its name rebuilding finished motor cars to a specification the factory
        never offered — bespoke, obsessive, made once. M3M describes these residences as
        inspired by that marque, and the influence is meant to be felt in the specification
        rather than read off a badge: ${HIGHLIGHTS[2].body.toLowerCase()}`,
  },
  {
    k: "iii",
    t: "The architecture",
    d: `${HIGHLIGHTS[0].body} Each home is entered through a private lift lobby and foyer, so
        arrival stays yours alone. ${HIGHLIGHTS[1].body}`,
  },
];

export default function ProjectOverview() {
  const root = useRef(null);
  const panel = useRef(null);
  const imgWrap = useRef(null);
  const [open, setOpen] = useState(false);
  const { openEnquiry } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".po-rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: root.current, start: "top 78%" },
        });

        gsap.from(imgWrap.current, {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: imgWrap.current, start: "top 86%" },
        });
        gsap.to(q(".po-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: imgWrap.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  /* Height is animated on the element itself, never through a React style prop —
     a re-render must not fight the tween for the same inline value. */
  const toggle = () => {
    const el = panel.current;
    const next = !open;
    setOpen(next);
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.killTweensOf(el);
    gsap.to(el, {
      height: next ? "auto" : 0,
      duration: reduced ? 0 : 0.7,
      ease: "power3.inOut",
      onComplete: () => {
        if (next) gsap.set(el, { height: "auto" }); // survive later reflows
        ScrollTrigger.refresh(); // the page just got taller or shorter
      },
    });
    if (next && !reduced) {
      gsap.from(el.querySelectorAll(".po-detail-item"), {
        autoAlpha: 0, y: 16, duration: 0.6, delay: 0.15, ease: "power3.out", stagger: 0.08,
      });
    }
  };

  return (
    <section id="project" ref={root} className="container-lux py-[clamp(5rem,13vh,9rem)]">
      <div className="po-rise mb-[clamp(2.5rem,6vh,4rem)] flex items-baseline gap-5">
        <span className="idx">03</span>
        <span className="kicker">The Project</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        {/* the argument */}
        <div>
          <h2 className="po-rise max-w-[16ch] font-display text-[clamp(1.9rem,4.4vw,3.4rem)] font-light leading-[1.06] tracking-[-0.02em] text-ink">
            A branded residence, <span className="font-serif italic text-brass">in the truest sense.</span>
          </h2>

          <p className="po-rise mt-8 max-w-[52ch] leading-relaxed text-ink-soft">
            {PROJECT.name} is an ultra-luxury branded address at {PROJECT.address}, developed by
            {" "}{PROJECT.developer} and shaped by the ethos of {PROJECT.partner}, the German
            marque. The collection is composed of {PROJECT.configs} of {PROJECT.sizes}.
          </p>

          <p className="po-rise mt-5 max-w-[52ch] leading-relaxed text-ink-soft">
            What separates it is structural rather than decorative. Every residence is planned open
            on three sides, so daylight and cross-ventilation reach each room and a high-rise home
            keeps the ease of a villa. Density is held deliberately low — a limited collection
            across a generous address, where privacy and quiet are the default condition rather
            than a paid upgrade.
          </p>

          <p className="po-rise mt-5 max-w-[52ch] leading-relaxed text-ink-soft">
            It is written for a narrow readership: families who already own well and are buying a
            last address rather than a next one, and principals who want the home to read the way
            the car in the porch does. Consider it if you value provenance over frontage — an
            {" "}{PROJECT.developer} address on Golf Course Extension Road, a global marque's
            discipline carried into the interiors, and a floor plate large enough to live at villa
            scale without leaving the skyline.
          </p>

          {/* the toggle — a real button, not a styled div */}
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="po-detail"
            data-cursor={open ? "CLOSE" : "MORE"}
            className="po-rise group mt-9 inline-flex items-center gap-3 border-b border-brass/40 pb-1.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
          >
            {open ? "Read less" : "Read more"}
            <Plus
              size={14}
              aria-hidden="true"
              className={`transition-transform duration-500 ease-lux ${open ? "rotate-45" : "group-hover:rotate-90"}`}
            />
          </button>

          {/* kept in the DOM at height 0 — indexed, but folded away */}
          <div id="po-detail" ref={panel} aria-hidden={!open} className="h-0 overflow-hidden">
            <ul className="mt-9 border-t border-line">
              {DETAIL.map((c) => (
                <li key={c.k} className="po-detail-item group flex gap-6 border-b border-line py-6">
                  <span className="idx pt-1.5">{c.k}</span>
                  <div>
                    <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-2xl">
                      {c.t}
                    </h3>
                    <p className="mt-2 max-w-[50ch] text-sm leading-relaxed text-ink-soft">{c.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* the quiet way on to the full page */}
          <p className="po-rise mt-9 max-w-[52ch] text-sm leading-relaxed text-ink-faint">
            Tower count, floor plate and land area are not published by {PROJECT.developer} at this
            stage, so they are not stated here —{" "}
            <button
              type="button"
              onClick={() => openEnquiry("Project overview")}
              className="border-b border-brass/40 text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
            >
              ask for the project fact sheet
            </button>{" "}
            and we will send what exists. Or read the{" "}
            <Link
              to="/overview"
              className="group/l inline-flex items-baseline gap-1 border-b border-line text-ink transition-colors hover:border-brass hover:text-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
            >
              full project overview
              <ArrowUpRight
                size={12}
                aria-hidden="true"
                className="transition-transform duration-500 group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5"
              />
            </Link>
            .
          </p>
        </div>

        {/* the plate */}
        <figure className="po-rise lg:sticky lg:top-28 lg:self-start">
          <div ref={imgWrap} className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="po-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.tower, 1600)}
                alt={`${PROJECT.name} — architectural render, ${PROJECT.location}`}
                sizes="(max-width:1024px) 100vw, 44vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_52%,rgba(8,6,5,0.7))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              {PROJECT.tagline}
            </figcaption>
          </div>

          {/* only the three figures M3M actually publishes */}
          <dl className="mt-7 border-t border-line">
            {[
              { k: "Address", v: PROJECT.address },
              { k: "Configurations", v: PROJECT.configs },
              { k: "Residence sizes", v: PROJECT.sizes },
            ].map((f) => (
              <div key={f.k} className="grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,9rem)_1fr] sm:gap-6">
                <dt className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">{f.k}</dt>
                <dd className="text-sm text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </figure>
      </div>
    </section>
  );
}
