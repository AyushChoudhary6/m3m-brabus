import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Phone, Download } from "lucide-react";
import Magnetic from "../ui/Magnetic.jsx";
import Fact from "../ui/Fact.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { track } from "../../lib/analytics.js";
import { PRICE } from "../../lib/facts.js";
import { PROJECT } from "../../lib/site.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 05 — THE PRICE
   M3M has published no figure for Brabus, so this section is deliberately
   built to be persuasive without one. Rather than dress a blank in adjectives,
   it teaches the reader how a cost sheet in this segment is actually assembled
   — which is the thing a serious buyer is really trying to find out when they
   search for "price". Every amount column reads on request, because that is
   the truth, and the truth here is the conversion. */

/* Developer-side lines. Order follows how a Gurugram cost sheet is normally
   typed up: unit cost first, then the premiums, then the one-time deposits. */
const DEVELOPER_LINES = [
  {
    t: "Basic sale price",
    d: "A per sq.ft rate applied to the super (saleable) area — not the carpet area you walk on. It is the single largest line, and the one every other charge is judged against.",
  },
  {
    t: "Preferential location charge",
    d: "A premium on the placements people compete for: corner homes, a particular aspect, an unobstructed outlook. Usually quoted per sq.ft, so it scales with the size of the residence.",
  },
  {
    t: "Floor rise",
    d: "A per sq.ft increment charged above a defined base floor. Two things matter — the rate, and the floor it starts counting from. A sheet that omits the second is incomplete.",
  },
  {
    t: "Club membership",
    d: "A one-time charge for the clubhouse, pool, spa and gym. It is separate from the unit cost and separate again from the annual club subscription that follows possession.",
  },
  {
    t: "IFMS / maintenance deposit",
    d: "An interest-free maintenance security held against the common estate, taken once at possession. Distinct from the recurring per sq.ft monthly maintenance, which is quoted separately.",
  },
  {
    t: "Car parking",
    d: "Covered parking is allotted per residence and billed as its own line. Additional bays, where released, are charged again at the rate in the sheet.",
  },
  {
    t: "Power backup",
    d: "A one-time charge per KVA of standby load provisioned to the home, with running charges billed later on consumption. Larger residences carry a larger sanctioned load.",
  },
];

/* Statutory lines. Not developer income — worth saying plainly, because this
   is where "all-inclusive" quotes most often quietly stop. */
const STATUTORY_LINES = [
  {
    t: "Stamp duty & registration",
    d: "Payable to the State of Haryana at conveyance, at the rate in force on that date. It is a government levy collected through the transaction, not a charge the developer sets.",
  },
  {
    t: "GST on under-construction",
    d: "Applicable while the residence is under construction, at the rate prevailing on the date of each instalment. A completed home with an occupation certificate is treated differently.",
  },
];

export default function PriceSnapshot() {
  const root = useRef(null);
  const { openEnquiry, openBrochure } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".ps-rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: root.current, start: "top 78%" },
        });

        gsap.from(q(".ps-line"), {
          autoAlpha: 0, y: 16, duration: 0.6, ease: "power3.out", stagger: 0.04,
          scrollTrigger: { trigger: q(".ps-ledger")[0], start: "top 86%" },
        });
      });
    },
    { scope: root },
  );

  const cta = (label, run) => () => {
    track("cta_click", { location: "price_snapshot", label });
    run();
  };

  return (
    <section
      id="price"
      ref={root}
      className="relative overflow-hidden border-t border-line bg-cream py-[clamp(5rem,13vh,9rem)]"
    >
      <div className="gold-glow pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-brass/[0.07] blur-[140px]" />

      <div className="container-lux relative">
        {/* header */}
        <div className="mb-[clamp(2.5rem,6vh,4.5rem)] grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
          <div className="ps-rise flex items-baseline gap-5">
            <span className="idx">05</span>
            <span className="kicker">The Price</span>
          </div>
          <h2 className="ps-rise max-w-[22ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
            The number goes to registered buyers{" "}
            <span className="font-serif italic text-brass">before anyone else.</span>
          </h2>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          {/* left — the honest status, and the three ways to act on it */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="ps-rise rounded-[1.25rem] border border-brass/25 bg-paper p-7 md:p-9">
              <Fact fact={PRICE} />

              <p className="mt-7 max-w-[42ch] text-sm leading-relaxed text-ink-soft">
                {PROJECT.developer} has not published a rate, a range or a launch price for
                {" "}{PROJECT.name}. We will not print one either. What exists today is a private
                price list, released first to buyers who have registered — and any figure quoted to
                you on enquiry remains subject to confirmation by the developer.
              </p>

              <div className="mt-8 flex flex-col gap-4">
                {/* gentle strength: a full-width button that drifts far reads as broken */}
                <Magnetic strength={0.12} className="w-full">
                  <button
                    type="button"
                    onClick={cta("price_list", () => openBrochure("Price list"))}
                    data-cursor="DOWNLOAD"
                    className="group/cta relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                  >
                    <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                    <Download size={14} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                    <span className="relative z-10 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                      Download price list
                    </span>
                  </button>
                </Magnetic>

                <button
                  type="button"
                  onClick={cta("cost_sheet", () => openEnquiry("Cost sheet"))}
                  data-cursor="REQUEST"
                  className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-line px-7 py-4 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors duration-500 hover:border-brass/50 hover:text-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  Request cost sheet
                  <ArrowUpRight size={14} className="text-brass transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>

                <a
                  href={`tel:${PROJECT.phone}`}
                  onClick={() => track("cta_click", { location: "price_snapshot", label: "call" })}
                  aria-label={`Talk to a consultant on ${PROJECT.phone}`}
                  className="mono inline-flex items-center justify-center gap-2.5 py-1 text-[0.66rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  <Phone size={13} className="text-brass" />
                  Talk to a consultant · {PROJECT.phone}
                </a>
              </div>
            </div>

            <p className="ps-rise mono mt-6 text-[0.56rem] leading-relaxed tracking-[0.16em] text-ink-faint">
              No estimated rates are circulated · Official documents only
            </p>
          </div>

          {/* right — what a cost sheet in this segment actually contains */}
          <div className="ps-ledger">
            <p className="ps-rise mono text-[0.58rem] tracking-[0.22em] text-ink-faint">
              What you are actually asking for
            </p>
            <p className="ps-rise mt-4 max-w-[56ch] leading-relaxed text-ink-soft">
              A price at this level is never one number. The document that answers the question is a
              cost sheet, and it is itemised — which is why two quotes on the same residence can
              differ without either being wrong. These are the lines it carries.
            </p>

            <p className="ps-rise mono mt-10 text-[0.56rem] tracking-[0.2em] text-brass">
              Charged by the developer
            </p>
            <dl className="mt-4 border-t border-line">
              {DEVELOPER_LINES.map((l, i) => (
                <div
                  key={l.t}
                  className="ps-line grid grid-cols-1 gap-x-8 gap-y-2 border-b border-line py-5 sm:grid-cols-[minmax(0,14rem)_1fr_auto]"
                >
                  <dt className="flex items-baseline gap-3 font-display text-lg font-light leading-snug text-ink">
                    <span className="idx shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    {l.t}
                  </dt>
                  <dd className="max-w-[56ch] text-sm leading-relaxed text-ink-soft">{l.d}</dd>
                  <dd className="mono self-baseline text-[0.56rem] tracking-[0.18em] text-ink-faint sm:text-right">
                    On request
                  </dd>
                </div>
              ))}
            </dl>

            <p className="ps-rise mono mt-10 text-[0.56rem] tracking-[0.2em] text-brass">
              Payable to the government
            </p>
            <dl className="mt-4 border-t border-line">
              {STATUTORY_LINES.map((l, i) => (
                <div
                  key={l.t}
                  className="ps-line grid grid-cols-1 gap-x-8 gap-y-2 border-b border-line py-5 sm:grid-cols-[minmax(0,14rem)_1fr_auto]"
                >
                  <dt className="flex items-baseline gap-3 font-display text-lg font-light leading-snug text-ink">
                    <span className="idx shrink-0">{String(DEVELOPER_LINES.length + i + 1).padStart(2, "0")}</span>
                    {l.t}
                  </dt>
                  <dd className="max-w-[56ch] text-sm leading-relaxed text-ink-soft">{l.d}</dd>
                  <dd className="mono self-baseline text-[0.56rem] tracking-[0.18em] text-ink-faint sm:text-right">
                    At prevailing rate
                  </dd>
                </div>
              ))}
            </dl>

            {/* the distinction that decides whether two quotes are comparable */}
            <div className="ps-rise mt-10 rounded-[1.25rem] border border-line bg-canvas/60 p-6 md:p-8">
              <h3 className="font-display text-xl font-light text-ink">
                &ldquo;All-inclusive&rdquo; and &ldquo;plus government charges&rdquo; are not the same quote
              </h3>
              <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
                An all-inclusive figure normally folds the developer&rsquo;s own lines — basic price,
                location charge, floor rise, club, parking, power backup, maintenance deposit — into
                a single number. It rarely includes stamp duty, registration or GST, because those
                are statutory and move with the rate in force on the day you pay. A quote described
                as &ldquo;plus government charges&rdquo; is stating the same thing openly. Before you
                compare two numbers, establish which of the two you are holding.
              </p>
              <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
                Ask, too, on which area the rate is applied. A per sq.ft figure on super area and one
                on carpet area describe very different homes.
              </p>
            </div>

            <div className="ps-rise mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link
                to="/price"
                className="group inline-flex items-center gap-2 border-b border-brass/40 pb-1 font-sans text-[0.7rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                Where pricing stands
                <ArrowUpRight size={13} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/payment-plan"
                className="group inline-flex items-center gap-2 border-b border-brass/40 pb-1 font-sans text-[0.7rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                Payment plan
                <ArrowUpRight size={13} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <p className="ps-rise mono mt-8 text-[0.56rem] leading-relaxed tracking-[0.16em] text-ink-faint">
              Line items are indicative of a standard schedule in this segment · No price is
              officially published for {PROJECT.name}, and any figure shared on enquiry is subject to
              confirmation by {PROJECT.developer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
