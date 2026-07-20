import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Phone, MessageCircle, CalendarCheck, FileDown } from "lucide-react";
import Magnetic from "../ui/Magnetic.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { track, trackCall, trackWhatsApp, trackSiteVisit } from "../../lib/analytics.js";
import { PROJECT } from "../../lib/site.js";
import { PRICE } from "../../lib/facts.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Ch. 22 — the last word on the homepage.
   Two closing moments already exist and neither is this one: WelcomeHome
   asks for four fields on the warm ground, CtaBand is the small centred
   sign-off that every inner page carries. This is the deepest block on the
   site — a full-bleed obsidian band, the largest type we set anywhere — and
   its job is different again: not to persuade, but to remove the last
   excuse. A reader who has come this far has already decided to make
   contact; what stops them is choosing how. So the four utility actions of
   Ch. 21 are given equal weight rather than a hierarchy, and each carries
   the one line that makes the choice for you. Only the price request, the
   thing the page cannot answer on its own, is set apart. */

/* tel: is happier without the display spacing in the number */
const TEL = `tel:${PROJECT.phone.replace(/\s+/g, "")}`;

const WA_TEXT = encodeURIComponent(
  `Hi, I'd like details on ${PROJECT.name} (${PROJECT.location}) — price, floor plans and brochure.`,
);
const WA = `https://wa.me/${PROJECT.whatsapp}?text=${WA_TEXT}`;

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass";

export default function FinalCta() {
  const root = useRef(null);
  const { openEnquiry, openBrochure, openVisit } = useEnquiry();

  /* One event per action, one name, so the four can be compared against each
     other in GA. The completion events — brochure_download, generate_lead —
     are fired by the modal on submit; firing them here as well would count a
     click that never became a lead. Call and WhatsApp have no submit step,
     so for those the click is the conversion. */
  const choose = (key, fn) => () => {
    track("final_cta_click", { action: key });
    fn?.();
  };

  const ACTIONS = [
    {
      key: "call",
      icon: Phone,
      label: "Call now",
      detail: PROJECT.phone,
      why: "The fastest answer. Whatever you ask is answered while you are still on the line.",
      href: TEL,
      onSelect: choose("call", () => trackCall("Final CTA")),
      aria: `Call the sales team on ${PROJECT.phone}`,
      cursor: "CALL",
    },
    {
      key: "whatsapp",
      icon: MessageCircle,
      label: "WhatsApp",
      detail: "Message the team",
      why: "Keeps every figure quoted to you in writing, and answers you at your own pace.",
      href: WA,
      external: true,
      onSelect: choose("whatsapp", () => trackWhatsApp("Final CTA")),
      aria: "Message the sales team on WhatsApp",
      cursor: "CHAT",
    },
    {
      key: "visit",
      icon: CalendarCheck,
      label: "Schedule a site visit",
      detail: "Choose your day",
      why: "Scale, aspect and the quiet of a low-density plan are only real when you stand in them.",
      onSelect: choose("visit", () => {
        trackSiteVisit("Final CTA");
        openVisit("Final CTA");
      }),
      cursor: "VISIT",
    },
    {
      key: "brochure",
      icon: FileDown,
      label: "Download the brochure",
      detail: "Instant download",
      why: "Floor plans, specifications and amenities to read slowly, away from the screen.",
      onSelect: choose("brochure", () => openBrochure("Final CTA")),
      cursor: "DOWNLOAD",
    },
  ];

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        /* The headline arrives line by line from beneath its own mask — the
           only place on the page where type this size moves at all. */
        gsap.from(q(".fc-line > span"), {
          yPercent: 116,
          duration: 1.25,
          ease: "power4.out",
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 78%" },
        });

        gsap.from(q(".fc-rise"), {
          autoAlpha: 0,
          y: 22,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 74%" },
        });

        gsap.from(q(".fc-cell"), {
          autoAlpha: 0,
          y: 20,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: { trigger: q(".fc-grid")[0], start: "top 88%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="final-cta"
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden border-y border-brass/20 bg-ink-900"
    >
      {/* the band declares itself before a word is read */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/70 to-transparent"
      />
      <span
        aria-hidden="true"
        className="gold-glow pointer-events-none absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-brass/[0.07] blur-[150px]"
      />
      <span aria-hidden="true" className="grain pointer-events-none absolute inset-0" />

      <div className="container-lux relative py-[clamp(4.5rem,14vh,9rem)]">
        <div className="fc-rise mb-[clamp(2rem,5vh,3rem)] flex items-baseline gap-5">
          <span className="idx">17</span>
          <span className="kicker">The last word</span>
        </div>

        <h2
          id="final-cta-heading"
          className="font-display text-[clamp(3.2rem,14vw,11rem)] font-light leading-[0.86] tracking-[-0.045em] text-ink"
        >
          <span className="fc-line block overflow-hidden pb-[0.06em]">
            <span className="block">Begin</span>
          </span>
          <span className="fc-line block overflow-hidden pb-[0.06em]">
            <span className="block font-serif italic text-brass">here.</span>
          </span>
        </h2>

        <div className="mt-[clamp(2rem,5vh,3rem)] grid gap-x-16 gap-y-8 lg:grid-cols-[1fr_0.95fr] lg:items-end">
          <p className="fc-rise max-w-[46ch] text-lg leading-relaxed text-ink-soft">
            {PROJECT.configs} · {PROJECT.address}. Five ways to reach the private client team,
            and no wrong one among them — take whichever suits the hour. Each reaches the same
            desk, and none of them asks you the same question twice.
          </p>

          {/* the one answer the page cannot give you itself */}
          <div className="fc-rise lg:justify-self-end">
            <Magnetic>
              <button
                type="button"
                onClick={choose("price", () => openEnquiry(PRICE.cta))}
                data-cursor="ENTER"
                className={`group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-brass px-8 py-4 ${FOCUS}`}
              >
                <span className="absolute inset-0 origin-left scale-x-0 bg-brass-soft transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-obsidian">
                  {PRICE.cta}
                </span>
                <ArrowUpRight size={15} className="relative z-10 text-obsidian transition-transform duration-500 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
              </button>
            </Magnetic>
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-ink-faint lg:text-right">
              {PRICE.note}
            </p>
          </div>
        </div>

        {/* four equals — gap-px over a hairline ground rules the ledger for free */}
        <ul className="fc-grid mt-[clamp(2.5rem,7vh,4rem)] grid list-none grid-cols-1 gap-px border border-line bg-line p-0 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map((a, i) => {
            const Icon = a.icon;
            const inner = (
              <>
                <span className="flex items-baseline justify-between gap-4">
                  <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                  <ArrowUpRight
                    size={15}
                    aria-hidden="true"
                    className="text-ink-faint transition-all duration-500 ease-lux group-hover/act:-translate-y-0.5 group-hover/act:translate-x-0.5 group-hover/act:text-brass"
                  />
                </span>
                <span className="mt-7 block text-brass" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.4} />
                </span>
                <span className="mt-4 block font-display text-xl leading-snug text-ink transition-colors duration-500 group-hover/act:text-brass-soft">
                  {a.label}
                </span>
                <span className="mono mt-2 block text-[0.58rem] tracking-[0.18em] text-ink-faint">
                  {a.detail}
                </span>
                <span className="mt-4 block max-w-[34ch] text-sm leading-relaxed text-ink-soft">
                  {a.why}
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-0 bg-brass transition-all duration-700 ease-lux group-hover/act:w-full"
                />
              </>
            );
            /* the whole cell is the target, so the rationale is part of the
               hit area rather than decoration beside a small link */
            const cls = `group/act relative flex w-full flex-col overflow-hidden bg-ink-900 p-7 text-left transition-colors duration-500 hover:bg-canvas md:p-8 ${FOCUS}`;

            return (
              <li key={a.key} className="fc-cell flex">
                {a.href ? (
                  <a
                    href={a.href}
                    aria-label={a.aria}
                    data-cursor={a.cursor}
                    onClick={a.onSelect}
                    {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={cls}
                  >
                    {inner}
                  </a>
                ) : (
                  <button type="button" onClick={a.onSelect} data-cursor={a.cursor} className={cls}>
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {/* the same promise the rest of the site keeps, restated at the door */}
        <p className="fc-rise mono mt-8 max-w-[70ch] text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
          No price, RERA number or possession date has been published for this project ·
          You will be sent each one the day {PROJECT.developer} issues it, and nothing before
        </p>
      </div>
    </section>
  );
}
