import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowUpRight,
  Route,
  TrainFront,
  Building2,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
} from "lucide-react";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { track } from "../../lib/analytics.js";
import { LOCATION, PROJECT } from "../../lib/site.js";
import { OFFICIAL_SOURCE } from "../../lib/facts.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Ch. 30 — WHY THE ADDRESS MATTERS  (homepage 08)
   LivingMap (Ch. 06) already plots the place and lists what M3M publishes
   about it. This is the other half: the argument, not the ledger.

   M3M publishes no drive times and no distances for Brabus, and a minute
   figure invented to fill that gap would be worse than useless — a number
   measured on a Sunday morning is not the number anyone drives on a Monday.
   So nothing here is quantified. Each entry says what the landmark is for
   and what having it on this side of the city does to an ordinary week,
   and where the distance genuinely decides the answer we hand the reader
   the check to run on their own map rather than a figure to trust. */

/** Published descriptor for a landmark, or null if the listing omits it.
 *  Everything qualitative on this page comes through here — nothing is
 *  written in that M3M has not itself said about the address. */
const qual = (place) => LOCATION.find((l) => l.place === place)?.time ?? null;

/* The three arguments that carry a purchase at this size. */
const PILLARS = [
  {
    key: "roads",
    icon: Route,
    title: "Roads & connectivity",
    sources: ["Golf Course Extension Road", "Golf Course Road", "NH-8", "Sohna Road"],
    body: [
      "The address sits on Golf Course Extension Road rather than behind it — a smaller distinction on paper than it is at eight in the morning, when the difference is joining the arterial directly instead of queueing along a sector road to reach it.",
      "From that spine the belt offers several ways out: Golf Course Road towards the older city, NH-8 towards Delhi, Sohna Road to the south. A household that can choose its route treats a bad junction as a detour rather than a lost hour, and choice of route is the first thing a resale buyer tests on the drive up.",
    ],
    check:
      "Drive the approach yourself at the hour you actually leave, in both directions. The road is the same all day; the entry to it is not.",
  },
  {
    key: "transit",
    icon: TrainFront,
    title: "Metro & airport",
    sources: ["Metro connectivity", "IGI Airport"],
    body: [
      "Rail matters at this ticket size for a reason buyers rarely say aloud: it is what the household staff, the visiting cousin and anyone whose car is spoken for actually use. A home that works without a second driver is a home that works on a Tuesday.",
      "The airport decides something different — whether an early flight means leaving at four or at five, and whether guests landing from abroad reach you before dinner or after it. Both travel with the property. A buyer who flies every week reads this paragraph and skips most of the others.",
    ],
    check:
      "Find the nearest station operating today, not the one on a future map, and look at the route you would take to it after dark. Rail plans along this corridor are still moving, and the honest answer moves with them.",
  },
  {
    key: "work",
    icon: Building2,
    title: "Business districts",
    sources: ["Cyber City & business hubs"],
    body: [
      "Cyber City and Udyog Vihar hold the older headquarters. The Golf Course Extension corridor has spent the past decade growing offices of its own along its length, which is the part most location pages forget to mention.",
      "A four- or five-bedroom home is usually bought by a household with two careers pointed in two directions, and the case for this stretch is that it does not force one of them to lose. One commute runs towards the established districts; the other may never leave the corridor. It is the same arithmetic that decides who a home here lets to later — the tenant pool for a residence of this scale is defined by the commute, not by the postcode.",
    ],
    check:
      "Plot both commutes, not the shorter one. An address is only ever as good as the second journey out of it.",
  },
];

/* The everyday trio. M3M publishes these three as a single line, so they
   share one descriptor here rather than each borrowing it three times. */
const EVERYDAY_SOURCE = "Schools, hospitals & retail";

const EVERYDAY = [
  {
    key: "schools",
    icon: GraduationCap,
    title: "Schools",
    body: "The school run is the commute you make twice a day for a decade, and it is what really sets the hour the household wakes. Sector 58 sits inside the belt around which the established Gurugram schools drew their catchments — which matters far less as a distance than as a bus route. A home already on a served route makes the morning somebody else's problem.",
    check: "Ask each school for its route and its catchment before you ask for the distance.",
  },
  {
    key: "hospitals",
    icon: HeartPulse,
    title: "Hospitals",
    body: "This is the amenity you hope never to use and cannot compromise on. What counts is not the daytime run to a multi-speciality hospital but the two-in-the-morning one: whether the route stays arterial and lit the whole way, or threads through unlit sector roads. A household with elderly parents under the same roof should weigh this above almost everything else on this page.",
    check: "Drive the emergency route once, at night, before you sign anything.",
  },
  {
    key: "retail",
    icon: ShoppingBag,
    title: "Shopping & dining",
    body: "Two quite different needs usually get collapsed into one line. The first is the ordinary — a chemist, a grocer, somebody who can take up a hem — where the test is whether a forgotten errand costs ten minutes or a whole evening. The second is the occasion: somewhere worth leaving the house for on a weeknight, and somewhere to take guests without planning it as an expedition.",
    check: "Walk the nearest everyday parade on foot. Convenience is felt at that scale, not measured on a map.",
  },
];

export default function LocationAdvantages() {
  const root = useRef(null);
  const { openVisit } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".la-rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 84%" },
        });

        gsap.from(q(".la-pillar"), {
          autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: q(".la-pillars")[0], start: "top 86%" },
        });

        /* Rules draw left-to-right so each entry reads as a line being
           written down rather than a card switching on. */
        gsap.from(q(".la-rule"), {
          scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: q(".la-pillars")[0], start: "top 86%" },
        });

        gsap.from(q(".la-day"), {
          autoAlpha: 0, y: 18, duration: 0.75, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".la-everyday")[0], start: "top 88%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="location-advantages"
      aria-labelledby="location-advantages-heading"
      className="border-t border-line bg-cream py-[clamp(4rem,12vh,7.5rem)]"
    >
      <div className="container-lux">
        <div className="la-rise mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">08</span>
          <span className="kicker">Why here</span>
        </div>

        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[1fr_0.92fr] lg:items-end">
          <h2
            id="location-advantages-heading"
            className="la-rise max-w-[17ch] font-display text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.03] tracking-[-0.025em] text-ink"
          >
            An address argued in <span className="font-serif italic text-brass">weeks, not minutes.</span>
          </h2>
          <p className="la-rise max-w-[48ch] leading-relaxed text-ink-soft">
            {PROJECT.developer} publishes no drive times and no distances for this address, so you
            will find none here — and a minute figure measured on a quiet Sunday is not the number
            anyone drives on a Monday morning anyway. What follows is the part that does not move
            with the traffic: what each of these places is for, and what having it on this side of
            Gurugram does to an ordinary week. Where the distance genuinely decides the answer, we
            say what to check on a map yourself.
          </p>
        </div>

        {/* the three arguments a purchase at this size actually turns on */}
        <ol className="la-pillars mt-[clamp(2.5rem,7vh,4.5rem)] grid list-none grid-cols-1 gap-0 p-0">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <li key={p.key} className="la-pillar group relative py-8">
                <span aria-hidden="true" className="la-rule absolute inset-x-0 top-0 h-px bg-line" />
                <div className="grid gap-x-16 gap-y-5 lg:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <div className="flex items-baseline gap-4">
                      <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                      <span className="shrink-0 self-center text-brass" aria-hidden="true">
                        <Icon size={18} strokeWidth={1.4} />
                      </span>
                    </div>
                    <h3 className="mt-3 max-w-[16ch] font-display text-xl leading-snug text-ink transition-colors duration-500 group-hover:text-brass-soft md:text-2xl">
                      {p.title}
                    </h3>
                    {/* the qualitative skeleton, exactly as the listing states it */}
                    <ul className="mt-5 list-none border-t border-line-soft p-0">
                      {p.sources.map((s) => (
                        <li
                          key={s}
                          className="flex items-baseline justify-between gap-4 border-b border-line-soft py-2.5"
                        >
                          <span className="text-sm text-ink-soft">{s}</span>
                          {qual(s) && (
                            <span className="mono whitespace-nowrap text-[0.58rem] tracking-[0.16em] text-brass">
                              {qual(s)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    {p.body.map((para) => (
                      <p key={para.slice(0, 32)} className="mb-4 max-w-[62ch] leading-relaxed text-ink-soft last:mb-0">
                        {para}
                      </p>
                    ))}
                    <p className="mt-6 max-w-[62ch] border-l border-brass/40 pl-5 text-sm leading-relaxed text-ink-faint">
                      <span className="mono mr-2 text-[0.58rem] tracking-[0.18em] text-brass">Check for yourself</span>
                      {p.check}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* the everyday three — one published line between them, so it is
            stated once here rather than repeated under each heading */}
        <div className="la-everyday mt-[clamp(2.5rem,7vh,4.5rem)] border-t border-line pt-8">
          <div className="la-rise flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h3 className="font-display text-xl text-ink md:text-2xl">
              And the week in between
            </h3>
            {qual(EVERYDAY_SOURCE) && (
              <p className="mono text-[0.58rem] tracking-[0.18em] text-ink-faint">
                {EVERYDAY_SOURCE} · <span className="text-brass">{qual(EVERYDAY_SOURCE)}</span>
              </p>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-x-14 gap-y-0 md:grid-cols-3">
            {EVERYDAY.map((e) => {
              const Icon = e.icon;
              return (
                <article key={e.key} className="la-day group border-t border-line py-6 md:border-t-0 md:pt-0">
                  <span className="text-brass" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.4} />
                  </span>
                  <h4 className="mt-3 font-display text-lg text-ink transition-colors duration-500 group-hover:text-brass-soft">
                    {e.title}
                  </h4>
                  <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{e.body}</p>
                  <p className="mt-4 max-w-[46ch] border-l border-brass/40 pl-4 text-sm leading-relaxed text-ink-faint">
                    {e.check}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        {/* onward: the full address page, or the only test that settles it */}
        <div className="la-rise mt-[clamp(2.5rem,7vh,4rem)] flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-8">
          <Link
            to="/location"
            className="group/loc inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            aria-label={`The address in full — ${PROJECT.location}`}
          >
            The address in full
            <ArrowUpRight size={14} className="transition-transform duration-500 group-hover/loc:-translate-y-0.5 group-hover/loc:translate-x-0.5" />
          </Link>
          {/* a commute is the one claim you can only settle by driving it */}
          <button
            type="button"
            onClick={() => {
              track("location_advantages_visit");
              openVisit("Location advantages");
            }}
            data-cursor="VISIT"
            className="group/visit inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
          >
            Drive the approach with us
            <ArrowUpRight size={14} className="transition-transform duration-500 group-hover/visit:-translate-y-0.5 group-hover/visit:translate-x-0.5" />
          </button>
          <p className="mono text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
            No drive times or distances are published for {PROJECT.name} ·{" "}
            <a
              href={OFFICIAL_SOURCE}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              Facts as published by {PROJECT.developer}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
