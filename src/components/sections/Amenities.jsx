import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { icon } from "../../lib/icons.js";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import Media from "../ui/Media.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { track } from "../../lib/analytics.js";
import { AMENITY_CATEGORIES, AMENITY_INDEX, AMENITY_COUNT } from "../../lib/amenities.js";
import { px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 29 — THE LIFESTYLE, grouped.
   The flat grid of twelve tiles this section used to be read like a
   specification sheet: everything shown, nothing found. A buyer scans by
   occasion — a swim, a party, somewhere for the children, who is on the
   gate — so the same amenities are now cut into the eight categories in
   lib/amenities.js and opened one at a time.

   Disclosure rather than tabs, for two reasons: every panel stays in the
   markup so a crawler reads the full set, and a single column collapses
   onto a phone without a horizontal rail to swipe. The index at the foot
   is never hidden, so the complete list survives with JavaScript off.

   Only three renders exist for this project, so only three categories
   carry an image. The rest are typographic on purpose — an invented
   amenity photograph would be a worse lie than a blank. */

export default function Amenities() {
  const root = useRef(null);
  const list = useRef(null);
  const [openId, setOpenId] = useState(AMENITY_CATEGORIES[0].id);
  const { openEnquiry, openVisit } = useEnquiry();

  const { contextSafe } = useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".am-rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: root.current, start: "top 84%" },
        });

        gsap.from(q(".am-row"), {
          autoAlpha: 0, y: 18, duration: 0.75, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: q(".am-list")[0], start: "top 86%" },
        });

        gsap.from(q(".am-index-item"), {
          autoAlpha: 0, y: 10, duration: 0.5, ease: "power3.out", stagger: 0.015,
          scrollTrigger: { trigger: q(".am-index")[0], start: "top 92%" },
        });
      });
    },
    { scope: root },
  );

  /* The panel can't be animated open while it is `hidden`, so the content
     is staggered in on the frame after React has revealed it. */
  const toggle = contextSafe((id) => {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (!next) return;

    track("amenity_category_open", { category: id });

    if (typeof window === "undefined") return;
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

    requestAnimationFrame(() => {
      const panel = list.current?.querySelector(`[data-panel="${next}"]`);
      if (!panel) return;
      gsap.from(panel.querySelectorAll(".am-in"), {
        autoAlpha: 0, y: 14, duration: 0.6, ease: "power3.out", stagger: 0.05,
      });
    });
  });

  /* Arrow / Home / End move between headers — the accordion pattern a
     keyboard user expects once focus is inside the list. */
  const onHeaderKey = (e) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const headers = Array.from(list.current?.querySelectorAll("[data-am-header]") || []);
    const i = headers.indexOf(e.currentTarget);
    if (i < 0) return;
    e.preventDefault();
    const to =
      e.key === "Home" ? 0
      : e.key === "End" ? headers.length - 1
      : e.key === "ArrowDown" ? (i + 1) % headers.length
      : (i - 1 + headers.length) % headers.length;
    headers[to].focus();
  };

  return (
    <section ref={root} id="amenities" className="relative py-[clamp(4rem,12vh,8rem)]">
      <div className="container-lux">
        <div className="am-rise mb-[clamp(2.5rem,6vh,4rem)] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="kicker mb-5">The Lifestyle</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.06] tracking-[-0.02em] text-ink">
              A private world of <span className="font-serif italic text-brass">amenities.</span>
            </h2>
          </div>
          <p className="max-w-sm text-ink-soft">
            {AMENITY_COUNT} facilities named across the official listing and project
            material, arranged the way a household actually uses them. Open a category
            to see what sits inside it — and what has not been announced.
          </p>
        </div>

        <div ref={list} className="am-list border-t border-line">
          {AMENITY_CATEGORIES.map((c, i) => {
            const Icon = icon(c.icon);
            const isOpen = openId === c.id;

            return (
              <div key={c.id} className="am-row border-b border-line">
                <h3>
                  <button
                    type="button"
                    data-am-header
                    id={`am-btn-${c.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`am-panel-${c.id}`}
                    onClick={() => toggle(c.id)}
                    onKeyDown={onHeaderKey}
                    data-cursor={isOpen ? "CLOSE" : "OPEN"}
                    className="group flex w-full items-center gap-4 py-6 text-left transition-colors duration-500 hover:bg-brass/[0.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass sm:gap-6"
                  >
                    <span className="idx shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <span
                      className={`shrink-0 transition-colors duration-500 ${isOpen ? "text-brass" : "text-ink-faint group-hover:text-brass-soft"}`}
                      aria-hidden="true"
                    >
                      <Icon size={20} strokeWidth={1.4} />
                    </span>
                    <span
                      className={`min-w-0 font-display text-xl leading-tight transition-colors duration-500 md:text-2xl ${isOpen ? "text-brass-soft" : "text-ink group-hover:text-brass-soft"}`}
                    >
                      {c.label}
                    </span>
                    <span className="mono ml-auto hidden shrink-0 text-[0.58rem] tracking-[0.18em] text-ink-faint sm:block">
                      {c.items.length} {c.items.length === 1 ? "facility" : "facilities"}
                    </span>
                    <ChevronDown
                      size={17}
                      aria-hidden="true"
                      className={`ml-3 shrink-0 text-brass transition-transform duration-500 ease-lux ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </h3>

                {/* hidden, never unmounted — the whole set stays in the markup */}
                <div
                  id={`am-panel-${c.id}`}
                  data-panel={c.id}
                  role="region"
                  aria-labelledby={`am-btn-${c.id}`}
                  hidden={!isOpen}
                  className="pb-[clamp(2rem,5vh,3.5rem)] pt-1"
                >
                  <div
                    className={`grid gap-8 ${c.image ? "lg:grid-cols-[0.85fr_1.15fr] lg:gap-14" : ""}`}
                  >
                    {c.image && (
                      <figure className="am-in relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-line lg:aspect-auto lg:min-h-[16rem]">
                        <div className="ed-breath absolute inset-0 scale-[1.04]">
                          <Media
                            src={px(c.image, 1200)}
                            alt={c.imageAlt || `${c.label} — M3M Brabus, Sector 58 Gurgaon`}
                            sizes="(max-width:1024px) 100vw, 38vw"
                          />
                        </div>
                        <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.66))]" />
                        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
                      </figure>
                    )}

                    <div className="min-w-0">
                      <p className="am-in max-w-[54ch] font-serif text-lg italic leading-snug text-brass">
                        {c.lede}
                      </p>

                      <ul className="mt-6 border-t border-line">
                        {c.items.map((it) => (
                          <li
                            key={it.name}
                            className="am-in group/it flex flex-col gap-1 border-b border-line-soft py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                          >
                            <span className="font-display text-lg leading-snug text-ink transition-colors duration-300 group-hover/it:text-brass-soft">
                              {it.name}
                            </span>
                            <span className="mono shrink-0 text-[0.58rem] leading-relaxed tracking-[0.14em] text-ink-faint sm:max-w-[26ch] sm:text-right">
                              {it.note}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {c.gated && (
                        <div className="am-in mt-6 rounded-[1rem] border border-brass/25 bg-paper p-5 sm:p-6">
                          <p className="mono text-[0.56rem] tracking-[0.2em] text-ink-faint">
                            Not published
                          </p>
                          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-soft">
                            {c.gated.note}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              track("amenity_gate_click", { category: c.id });
                              openEnquiry(c.gated.subject);
                            }}
                            className="group/cta mt-4 inline-flex items-center gap-2 border-b border-brass/40 pb-1 font-sans text-[0.7rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
                          >
                            {c.gated.cta}
                            <ArrowUpRight
                              size={14}
                              aria-hidden="true"
                              className="transition-transform duration-500 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* The full list, always visible — categories can be closed, the
            record of what exists should not be. */}
        <div className="am-index mt-[clamp(2.5rem,6vh,4rem)]">
          <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">
            All {AMENITY_COUNT} named facilities
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {AMENITY_INDEX.map((name) => (
              <li
                key={name}
                className="am-index-item text-sm text-ink-soft after:ml-5 after:text-ink-faint after:content-['·'] last:after:content-['']"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="am-rise mt-[clamp(2rem,5vh,3rem)] flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-8">
          <button
            type="button"
            onClick={() => openVisit("Amenities · Club tour")}
            data-cursor="BOOK"
            className="group/visit relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/visit:scale-x-100" />
            <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/visit:text-obsidian">
              Book a tour of the club
            </span>
            <ArrowUpRight
              size={15}
              aria-hidden="true"
              className="relative z-10 text-brass transition-colors duration-500 group-hover/visit:text-obsidian"
            />
          </button>
          <p className="mono max-w-[42ch] text-[0.56rem] leading-relaxed tracking-[0.16em] text-ink-faint">
            Amenities as published by the developer · Indicative and subject to the
            final approved plan
          </p>
        </div>
      </div>
    </section>
  );
}
