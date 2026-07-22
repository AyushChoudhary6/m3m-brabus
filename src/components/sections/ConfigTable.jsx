import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import Magnetic from "../ui/Magnetic.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { CONFIGURATIONS } from "../../lib/facts.js";
import { PROJECT } from "../../lib/site.js";
import { track } from "../../lib/analytics.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CONFIGURATION — the side-by-side table on /residences.
   Everything here comes from CONFIGURATIONS in the facts layer: M3M publishes
   4 BHK and 5 BHK and nothing else, so there are two rows and no Penthouse.

   Deliberately NOT a feature comparison. The residence write-ups immediately
   above this table already list marble, VRV, lift lobby and the rest at length;
   repeating them in a column would be the same point made twice. What the
   editorial rows cannot carry is the decision data — carpet area and what is
   still available — so the table restricts itself to that.

   Carpet area and inventory position are both absent from the official
   listing. Rather than print a blank cell — or worse, a plausible-looking
   number — each becomes a request button, so the two figures a serious buyer
   always asks for are also the page's best conversion points.

   One semantic <table> serves both breakpoints: below md it is restyled into
   stacked cards with CSS (`max-md:` + `content-[attr(data-label)]`) rather than
   duplicated as a second markup tree, which would make screen readers read the
   whole collection twice. */

const HEADS = ["Configuration", "Size", "Carpet area", "Availability"];

/* Shared cell rhythm: generous vertical padding, hairline rule, and on mobile
   the label the hidden <thead> would otherwise have supplied. */
const CELL =
  "align-top border-b border-line py-6 pr-8 last:pr-0 md:py-7 " +
  "max-md:block max-md:border-0 max-md:px-0 max-md:py-2.5 " +
  "max-md:before:mb-1.5 max-md:before:block max-md:before:font-mono " +
  "max-md:before:text-[0.55rem] max-md:before:uppercase max-md:before:tracking-[0.2em] " +
  "max-md:before:text-ink-faint max-md:before:content-[attr(data-label)]";

export default function ConfigTable({ index = "02", kicker = "Side by side" }) {
  const root = useRef(null);
  const { openEnquiry } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".cfg-rise"), {
          autoAlpha: 0, y: 22, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: root.current, start: "top 84%" },
        });

        gsap.from(q(".cfg-row"), {
          autoAlpha: 0, y: 26, duration: 0.9, ease: "power3.out", stagger: 0.12,
          scrollTrigger: { trigger: q(".cfg-table")[0], start: "top 86%" },
        });

        gsap.from(q(".cfg-rule"), {
          scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".cfg-table")[0], start: "top 88%" },
        });
      });
    },
    { scope: root },
  );

  const request = (subject) => {
    track("config_table_request", { subject });
    openEnquiry(subject);
  };

  return (
    <section id="configuration" ref={root} className="container-lux py-[clamp(3rem,9vh,6rem)]">
      <div className="mb-[clamp(2rem,5vh,3.5rem)] grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
        <div className="cfg-rise flex items-baseline gap-5">
          <span className="idx">{index}</span>
          <span className="kicker">{kicker}</span>
        </div>
        <h2 className="cfg-rise max-w-[24ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
          Two residences. <span className="font-serif italic text-brass">Nothing in between.</span>
        </h2>
      </div>

      <div className="cfg-rule mb-8 h-px w-full bg-gradient-to-r from-brass/70 via-line to-transparent" />

      {/* horizontal scroll is the desktop fallback; on mobile the rows are cards */}
      <div className="cfg-table overflow-x-auto">
        <table className="w-full border-collapse text-left max-md:block md:min-w-[42rem]">
          <caption className="mono mb-7 text-left text-[0.58rem] leading-relaxed tracking-[0.18em] text-ink-faint max-md:block">
            {PROJECT.name} — configurations and sizes as published by {PROJECT.developer}. Sizes are
            total area. Carpet areas and the current availability position are not published, and
            are shared on request.
          </caption>

          <thead className="max-md:sr-only">
            <tr>
              {HEADS.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="mono border-b border-brass/30 pb-4 pr-8 text-[0.58rem] font-medium tracking-[0.2em] text-ink-faint last:pr-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="max-md:block">
            {CONFIGURATIONS.map((c, i) => (
              <tr
                key={c.id}
                className="cfg-row group transition-colors duration-500 md:hover:bg-paper/40 max-md:mb-5 max-md:block max-md:rounded-[1.25rem] max-md:border max-md:border-line max-md:bg-paper/40 max-md:p-6 max-md:last:mb-0"
              >
                <th
                  scope="row"
                  data-label="Configuration"
                  className={`${CELL} font-normal`}
                >
                  <span className="idx block">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-2 block font-display text-[clamp(1.5rem,2.6vw,2rem)] font-light leading-none tracking-[-0.01em] text-ink transition-colors duration-500 md:group-hover:text-brass-soft">
                    {c.config}
                  </span>
                </th>

                <td data-label="Size" className={CELL}>
                  <span className="whitespace-nowrap font-display text-lg font-light text-ink">
                    {c.size}
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-ink-faint">
                    Total area
                  </span>
                </td>

                {/* not published — an unknown is offered, never invented */}
                <td data-label="Carpet area" className={CELL}>
                  {c.carpet ? (
                    <span className="font-display text-lg font-light text-ink">{c.carpet}</span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => request(`Carpet area — ${c.config}`)}
                        aria-label={`On request — the carpet area for the ${c.config} residence`}
                        data-cursor="REQUEST"
                        className="inline-flex items-center gap-1.5 font-display text-lg font-light text-brass transition-colors duration-500 hover:text-brass-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                      >
                        On request
                        <ArrowUpRight size={15} className="transition-transform duration-500 group-hover:translate-x-0.5" />
                      </button>
                      <span className="mt-1.5 block text-xs leading-relaxed text-ink-faint">
                        Not published
                      </span>
                    </>
                  )}
                </td>

                <td data-label="Availability" className={CELL}>
                  {/* No inventory position is published, so we ask rather than
                      assert one — an unknown becomes an enquiry. */}
                  {c.status ? (
                    <span className="mono inline-flex items-center gap-2 rounded-full border border-brass/30 px-3.5 py-1.5 text-[0.56rem] tracking-[0.18em] text-brass">
                      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brass" />
                      {c.status}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => request(`Availability · ${c.config}`)}
                      className="mono inline-flex items-center gap-2 rounded-full border border-brass/30 px-3.5 py-1.5 text-[0.56rem] tracking-[0.18em] text-brass transition-colors hover:border-brass hover:bg-brass/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                    >
                      Ask availability
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
        <p className="cfg-rise max-w-[52ch] text-sm leading-relaxed text-ink-soft">
          These are the only configurations {PROJECT.developer} has released for {PROJECT.name}.
          Availability moves with each release — ask for the current position before you plan a
          visit.
        </p>

        <div className="cfg-rise shrink-0">
          <Magnetic>
            <button
              type="button"
              onClick={() => request("Availability")}
              data-cursor="ENQUIRE"
              className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
              <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                Get latest availability
              </span>
              <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
