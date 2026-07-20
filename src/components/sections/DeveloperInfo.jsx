import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import Media from "../ui/Media.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { PROJECT } from "../../lib/site.js";
import { OFFICIAL_SOURCE } from "../../lib/facts.js";
import { IMG, px } from "../../lib/images.js";
import { track } from "../../lib/analytics.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 22 — THE DEVELOPER & THE MARQUE
   Homepage section 12. Almost every competing page for this project answers
   "who is building it" with corporate arithmetic — founding year, millions of
   sq.ft delivered, project counts, awards. None of that is published on the
   official listing we work from, so none of it is written here.

   What is left is more useful anyway: state the two names plainly, link
   straight to M3M's own listing so the reader can verify us rather than
   trust us, and hand over the diligence checklist a buyer at this price
   should be running on any promoter. Credibility is the conversion asset. */

/* Deliberately generic — this is how to check a developer, not a claim about
   this one. Every item is a document the buyer can obtain independently. */
const DUE_DILIGENCE = [
  {
    k: "i",
    t: "RERA registration of the promoter",
    d: "Search the promoter's name on the Haryana RERA portal, not the project's marketing name. The registration names the legal entity, the sanctioned scope and the declared completion date — and a project without a live registration cannot lawfully be advertised or sold.",
  },
  {
    k: "ii",
    t: "Delivery record on completed projects",
    d: "Ask for the list of the developer's completed addresses, then verify them yourself: occupation certificates issued, the gap between the RERA-declared date and the date keys were actually handed over, and what residents say once the sales team has moved on.",
  },
  {
    k: "iii",
    t: "A litigation and encumbrance search",
    d: "Have an advocate run the title chain, the encumbrance certificate on the land parcel and a case search against the promoter entity. Consumer-forum and NCLT matters are public record and take an afternoon to pull.",
  },
  {
    k: "iv",
    t: "The entity actually named on the agreement",
    d: "The brand on the hoarding and the company on the builder–buyer agreement are frequently not the same. Read the allotment letter for the signing entity, the land-owning company and any development-management arrangement before you pay anything beyond the booking amount.",
  },
];

export default function DeveloperInfo() {
  const root = useRef(null);
  const imgWrap = useRef(null);
  const { openEnquiry } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".dv-rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: root.current, start: "top 78%" },
        });

        gsap.from(q(".dv-check"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".dv-checklist")[0], start: "top 86%" },
        });

        gsap.from(imgWrap.current, {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: imgWrap.current, start: "top 86%" },
        });
        gsap.to(q(".dv-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: imgWrap.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="developer" ref={root} className="border-t border-line bg-cream">
      <div className="container-lux py-[clamp(5rem,13vh,9rem)]">
        <div className="dv-rise mb-[clamp(2.5rem,6vh,4rem)] flex items-baseline gap-5">
          <span className="idx">12</span>
          <span className="kicker">The Developer &amp; the Marque</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          {/* the two names, stated plainly */}
          <div>
            <h2 className="dv-rise max-w-[17ch] font-display text-[clamp(1.9rem,4.4vw,3.4rem)] font-light leading-[1.06] tracking-[-0.02em] text-ink">
              Built by {PROJECT.developer},{" "}
              <span className="font-serif italic text-brass">shaped by {PROJECT.partner}.</span>
            </h2>

            <p className="dv-rise mt-8 max-w-[52ch] leading-relaxed text-ink-soft">
              {PROJECT.name} is developed by {PROJECT.developer} at {PROJECT.address}. That is the
              developer relationship in full — and it is the whole of what we will assert about the
              company here. Founding dates, delivered square footage, project counts and awards are
              not part of the official listing for this address, so you will not find them dressed
              up as facts on this page.
            </p>

            <div className="dv-rise mt-10 border-t border-line">
              <div className="border-b border-line py-6">
                <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">The developer</p>
                <h3 className="mt-2.5 font-display text-xl text-ink md:text-2xl">
                  {PROJECT.developer}
                </h3>
                <p className="mt-2 max-w-[50ch] text-sm leading-relaxed text-ink-soft">
                  The promoter of this project and the entity behind the listing, the sanctioned
                  plan and everything eventually registered against it. Corporate history, group
                  structure and the record on completed addresses are matters for documents rather
                  than marketing copy — ask and we will send what is on file.
                </p>
                <Link
                  to="/about"
                  className="group/l mt-4 inline-flex items-center gap-2 border-b border-brass/40 pb-1 font-sans text-[0.7rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors duration-500 hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
                >
                  About us &amp; how we work
                  <ArrowUpRight
                    size={13}
                    aria-hidden="true"
                    className="transition-transform duration-500 group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5"
                  />
                </Link>
              </div>

              <div className="border-b border-line py-6">
                <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">The brand partner</p>
                <h3 className="mt-2.5 font-display text-xl text-ink md:text-2xl">
                  {PROJECT.partner}
                </h3>
                <p className="mt-2 max-w-[50ch] text-sm leading-relaxed text-ink-soft">
                  The German marque whose ethos of luxury, performance and exclusivity shapes the
                  bespoke interiors and premium finishes of the residences. It is a design
                  partnership expressed in specification — the materials, the detailing and the way
                  a room is put together — rather than a badge applied at the gate.
                </p>
                <Link
                  to="/brabus"
                  className="group/l mt-4 inline-flex items-center gap-2 border-b border-brass/40 pb-1 font-sans text-[0.7rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors duration-500 hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
                >
                  The {PROJECT.partner} partnership
                  <ArrowUpRight
                    size={13}
                    aria-hidden="true"
                    className="transition-transform duration-500 group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>

            <p className="dv-rise mt-8 max-w-[52ch] text-sm leading-relaxed text-ink-faint">
              Company profile, promoter details and the position on registration are shared as
              documents, not as adjectives —{" "}
              <button
                type="button"
                onClick={() => openEnquiry("Developer information")}
                className="border-b border-brass/40 text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
              >
                request the developer file
              </button>{" "}
              and we will send what exists on the day you ask.
            </p>
          </div>

          {/* the plate, and the primary source */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <figure className="dv-rise">
              <div ref={imgWrap} className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line">
                <div className="dv-img-inner ed-breath absolute inset-0 scale-[1.06]">
                  <Media
                    src={px(IMG.arrival, 1600)}
                    alt={`${PROJECT.name} — the arrival court at ${PROJECT.location}`}
                    sizes="(max-width:1024px) 100vw, 44vw"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_52%,rgba(8,6,5,0.7))]" />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
                <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
                  {PROJECT.developer} · with {PROJECT.partner}
                </figcaption>
              </div>
            </figure>

            <dl className="dv-rise mt-7 border-t border-line">
              {[
                { k: "Developer", v: PROJECT.developer },
                { k: "Brand partner", v: PROJECT.partner },
                { k: "Address", v: PROJECT.address },
                { k: "Configurations", v: PROJECT.configs },
              ].map((f) => (
                <div key={f.k} className="grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,9rem)_1fr] sm:gap-6">
                  <dt className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">{f.k}</dt>
                  <dd className="text-sm text-ink">{f.v}</dd>
                </div>
              ))}
            </dl>

            {/* verify us against the promoter's own page, not against our word */}
            <div className="dv-rise mt-7 rounded-[1.25rem] border border-brass/25 bg-paper p-6">
              <p className="kicker">Check it at source</p>
              <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-ink-soft">
                Everything stated above is drawn from the developer's own listing for this project.
                Read it yourself before you read us.
              </p>
              <a
                href={OFFICIAL_SOURCE}
                target="_blank"
                rel="noopener noreferrer nofollow"
                onClick={() => track("official_source_click", { source: "Developer section" })}
                aria-label={`Open the official ${PROJECT.developer} listing for ${PROJECT.name} in a new tab`}
                className="group/s mt-5 inline-flex items-center gap-2.5 border-b border-brass/40 pb-1 font-sans text-[0.7rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors duration-500 hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
              >
                Official {PROJECT.developer} listing
                <ExternalLink
                  size={13}
                  aria-hidden="true"
                  className="transition-transform duration-500 group-hover/s:-translate-y-0.5 group-hover/s:translate-x-0.5"
                />
              </a>
              <p className="mono mt-5 text-[0.55rem] leading-relaxed tracking-[0.16em] text-ink-faint">
                Opens m3mproperties.com in a new tab
              </p>
            </div>
          </div>
        </div>

        {/* the checklist — useful whoever the developer turns out to be */}
        <div className="dv-checklist mt-[clamp(4rem,11vh,7rem)]">
          <div className="dv-check flex items-baseline gap-5">
            <span className="idx">—</span>
            <span className="kicker">What to verify about any developer</span>
          </div>
          <p className="dv-check mt-6 max-w-[58ch] leading-relaxed text-ink-soft">
            Four checks worth running before a booking amount leaves your account — on this address
            or on any other. None of them require a broker's permission, and each one is a document
            you can obtain independently.
          </p>

          <ul className="mt-10 grid gap-x-14 gap-y-0 border-t border-line md:grid-cols-2">
            {DUE_DILIGENCE.map((c) => (
              <li key={c.k} className="dv-check group flex gap-6 border-b border-line py-6">
                <span className="idx pt-1.5">{c.k}</span>
                <div>
                  <h3 className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-xl">
                    {c.t}
                  </h3>
                  <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-ink-soft">{c.d}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="dv-check mt-8 max-w-[58ch] text-sm leading-relaxed text-ink-faint">
            On the first of those: {PROJECT.rera.toLowerCase()} for {PROJECT.name}, because no
            registration number appears on the official listing at this stage. We would rather tell
            you that than print a number —{" "}
            <Link
              to="/rera"
              className="border-b border-brass/40 text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
            >
              read where RERA stands
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
