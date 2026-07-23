import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Fact from "../ui/Fact.jsx";
import { useI18n } from "../../lib/i18n.jsx";
import { PROJECT_FACTS, PRICE, hasValue } from "../../lib/facts.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Ch. 25 — the scannable proof block that closes the overview page.
   Half of what a buyer asks for has not been published by M3M. Rather
   than pad the grid with estimates, the unpublished entries are given the
   warmer ground and the gold type: an unknown is presented as the reason
   to make contact, not as a hole in the page.

   Price lives outside PROJECT_FACTS in facts.js because it drives the
   price page separately — but it is the figure asked for first, so it is
   appended here rather than left as the one question the grid ducks. */
const FACTS = [...PROJECT_FACTS, PRICE];
const KNOWN_COUNT = FACTS.filter(hasValue).length;

/* Qualifiers are honest but wordy, and wordy kills a scan grid. They are
   lifted out to numbered footnotes directly beneath, so the grid stays
   readable at five columns without a single caveat being dropped. */

export default function ProjectHighlights() {
  const root = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".ph-rise"), {
          autoAlpha: 0, y: 22, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 84%" },
        });

        gsap.from(q(".ph-cell"), {
          autoAlpha: 0, y: 18, duration: 0.75, ease: "power3.out", stagger: 0.045,
          scrollTrigger: { trigger: q(".ph-grid")[0], start: "top 88%" },
        });

      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="project-highlights-heading"
      className="border-t border-line py-[clamp(3.5rem,10vh,6.5rem)]"
    >
      <div className="container-lux">

        <div className="mb-[clamp(2rem,5vh,3rem)] grid gap-x-16 gap-y-5 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <h2
            id="project-highlights-heading"
            className="ph-rise max-w-[18ch] font-display text-[clamp(1.9rem,4.4vw,3.1rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink"
          >
            {t("shighlights.headingLead")} <span className="font-serif italic text-brass">{t("shighlights.headingAccent")}</span>
          </h2>
          <p className="ph-rise max-w-[46ch] leading-relaxed text-ink-soft">
            {KNOWN_COUNT} {t("shighlights.ofThe")} {FACTS.length} {t("shighlights.paraTail")}
          </p>
        </div>

        {/* gap-px over a hairline ground draws the grid rules for free */}
        <ul className="ph-grid grid list-none grid-cols-2 gap-px border border-line bg-line p-0 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {FACTS.map(({ note, ...fact }) => {
            const known = hasValue(fact);
            return (
              <li
                key={fact.key}
                className={`ph-cell group/cell relative overflow-hidden p-6 md:p-7 ${
                  known ? "bg-canvas" : "bg-cream"
                } [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-brass`}
              >
                {/* the unpublished entries get the warm wash — an invitation, not a gap */}
                {!known && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brass/[0.07] blur-[38px]"
                  />
                )}
                <div className="relative">
                  <Fact fact={fact} />
                </div>
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-0 bg-brass transition-all duration-700 ease-lux group-hover/cell:w-full" />
              </li>
            );
          })}
        </ul>

      </div>
    </section>
  );
}
