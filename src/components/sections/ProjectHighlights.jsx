import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import Fact from "../ui/Fact.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { useI18n } from "../../lib/i18n.jsx";
import { PROJECT_FACTS, PRICE, OFFICIAL_SOURCE, hasValue } from "../../lib/facts.js";

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
const NOTED = FACTS.filter((f) => f.note);
const NOTE_INDEX = new Map(NOTED.map((f, i) => [f.key, i + 1]));

export default function ProjectHighlights() {
  const root = useRef(null);
  const { openEnquiry } = useEnquiry();
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

        gsap.from(q(".ph-foot"), {
          autoAlpha: 0, y: 14, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: q(".ph-grid")[0], start: "bottom 92%" },
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
        <div className="ph-rise mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">{t("shighlights.keyFacts")}</span>
        </div>

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
            const marker = NOTE_INDEX.get(fact.key);
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
                {marker && (
                  <span className="mono absolute right-4 top-5 text-[0.5rem] tracking-[0.1em] text-brass/60" aria-hidden="true">
                    {marker}
                  </span>
                )}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-0 bg-brass transition-all duration-700 ease-lux group-hover/cell:w-full" />
              </li>
            );
          })}
        </ul>

        <div className="ph-foot mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <ol className="list-none space-y-2 p-0">
            {NOTED.map((f, i) => (
              <li key={f.key} className="flex gap-3 text-xs leading-relaxed text-ink-faint">
                <span className="mono shrink-0 text-[0.5rem] tracking-[0.1em] text-brass/60">{i + 1}</span>
                <span>
                  <span className="text-ink-soft">{f.label}</span> — {f.note}
                </span>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:justify-end">
            <button
              type="button"
              onClick={() => openEnquiry("Project highlights")}
              data-cursor="ASK"
              className="group/cta inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              {t("shighlights.askUnpublished")}
              <ArrowUpRight size={14} className="transition-transform duration-500 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
            </button>
            <a
              href={OFFICIAL_SOURCE}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[0.58rem] tracking-[0.18em] text-ink-faint transition-colors hover:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              {t("shighlights.sourceListing")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
