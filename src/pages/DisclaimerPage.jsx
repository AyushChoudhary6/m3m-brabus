import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Phone } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import { PROJECT } from "../lib/site.js";
import { OFFICIAL_SOURCE } from "../lib/facts.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ============================================================
   The counterweight to every other page on this site. Its job is to
   set out plainly what this website is not — and, because the site
   publishes no price, no RERA number and no possession date, to
   explain that this is an absence in the official record rather than
   an omission here. Nothing on this page may soften that.
   ============================================================ */

/** Shown on the page; keep in step with any material revision. */
export const LAST_UPDATED = "20 July 2026";
const LAST_UPDATED_ISO = "2026-07-20";

const IMAGERY = [
  {
    k: "Renders are artistic impressions",
    d: "The exterior, arrival and lobby views on this site are computer-generated visualisations. They are not photographs of a completed building and no part of them should be read as a representation of the finished product.",
  },
  {
    k: "Furniture and styling are not included",
    d: "Anything shown as loose furniture, styling, art, planting or accessories is there to convey scale and mood. None of it forms part of what is offered for sale unless it is written into your agreement.",
  },
  {
    k: "Landscape and surroundings are indicative",
    d: "Trees, skylines, neighbouring buildings and views shown in any image are illustrative. Outlooks change as the surrounding land develops, and no view is guaranteed.",
  },
  {
    k: "Diagrams are schematic",
    d: "Any diagram, plan sketch or illustration drawn for this site is schematic and not to scale. It exists to explain a relationship, not to record a dimension.",
  },
];

const AREAS = [
  {
    k: "Sizes are approximate",
    d: `The official listing describes residences of ${PROJECT.sizes}. That is a published approximation of total area, not a measured figure for any particular home.`,
  },
  {
    k: "Carpet area is not published",
    d: "No carpet area is published officially for either configuration, and none is stated on this site. Carpet area — the statutory basis on which a home must be sold — is confirmed in the sanctioned plan and the agreement, and nowhere else.",
  },
  {
    k: "The sanctioned plan prevails",
    d: "Layouts, unit mix, common areas and amenities are subject to the plans sanctioned by the competent authority and to the particulars filed with the Real Estate Regulatory Authority. Where anything on this site differs from those documents, those documents are correct.",
  },
  {
    k: "Specifications may change",
    d: "Materials, brands, finishes and systems described anywhere on this site are indicative. The developer may substitute equivalents, and only the specification schedule annexed to your agreement is binding.",
  },
];

const UNPUBLISHED = [
  {
    k: "Price",
    d: "No price, per sq.ft rate, payment plan or charge schedule is published on this site, because none is published on the official listing.",
  },
  {
    k: "RERA registration number",
    d: "No registration number is published on this site, because none appears on the official listing at the date above.",
  },
  {
    k: "Possession date",
    d: 'No possession quarter or year is published on this site. The official listing states only that possession is "expected in the coming years", and we go no further than that.',
  },
  {
    k: "Land area, towers, floors, open space",
    d: "None of these figures is published officially, so none is stated here — not as an estimate, not as a range, not as a figure attributed to a portal.",
  },
];

const VERIFY = [
  "Confirm the RERA registration status and number on the HARERA portal at haryanarera.gov.in, under the Gurugram authority, before you pay anything.",
  "Ask for the licence, the building-plan approvals and the sanctioned layout for the specific unit, and read them.",
  "Ask for the carpet-area statement in writing, stated separately from built-up and saleable area.",
  "Ask for the full cost sheet — base price, statutory charges, taxes and every other head — and the draft allotment letter and agreement, before any payment.",
  "Take independent legal and financial advice. Nothing on this website is a substitute for it.",
];

export default function DisclaimerPage() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        q(".dc-sec").forEach((sec) => {
          gsap.from(sec.querySelectorAll(".rise"), {
            autoAlpha: 0, y: 18, duration: 0.8, ease: "power3.out", stagger: 0.05,
            scrollTrigger: { trigger: sec, start: "top 88%" },
          });
        });
      });
    },
    { scope: root },
  );

  const linkCls =
    "group inline-flex items-center gap-1.5 rounded-sm border-b border-brass/40 pb-0.5 text-brass transition-colors hover:border-brass hover:text-brass-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brass";

  return (
    <div ref={root}>
      <Seo
        title="Disclaimer | M3M Brabus"
        description="Not the official M3M India website and not an offer. Renders are artistic, areas indicative, and no price, RERA number or possession date is published here."
        path="/disclaimer"
        noindex={false}
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Disclaimer", path: "/disclaimer" }]),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Disclaimer",
            description: "What this website is, what it is not, and what must be independently verified before transacting.",
            dateModified: LAST_UPDATED_ISO,
          },
        ]}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Disclaimer", path: "/disclaimer" }]} />
      <PageHeader
        eyebrow={`Disclaimer · Updated ${LAST_UPDATED}`}
        title="What this website is,"
        accent="and what it is not."
        lede="A marketing and information site about a residential development. Read this page before you rely on anything published elsewhere on it — including the parts of it that deliberately say nothing at all."
      />

      {/* 01 — not an offer */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">Not an offer, and not a contract</span>
        </div>
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            This website is published for information and marketing purposes only. Nothing on it
            constitutes an offer, an invitation to offer, a solicitation, a warranty or a contract of
            any kind, and no part of it forms part of any agreement you may later enter into.
          </p>
          <p className="rise">
            No statement here creates an obligation on {PROJECT.developer}, on {PROJECT.partner}, on
            the operator of this site or on anyone else. A binding relationship arises only from the
            allotment letter and the agreement for sale executed between you and the developer, and
            from the documents annexed to them. Where anything on this site differs from those
            documents, those documents govern without exception.
          </p>
          <p className="rise">
            Content is compiled with care from the official listing, but it is provided as it stands,
            without warranty of accuracy, completeness or currency. Details may be revised at any
            time without notice, and no liability is accepted for any decision taken in reliance on
            this website.
          </p>
        </div>
      </section>

      {/* 02 — not the official site */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">Not the official website</span>
        </div>
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            This is not the official website of {PROJECT.developer}, and it is not operated,
            endorsed or authored by {PROJECT.developer} or {PROJECT.partner}. It is an independent
            marketing site. Enquiries submitted here are serviced by the developer and its
            authorised channel partners.
          </p>
          <p className="rise">
            The official project listing is the source of every fact reproduced on this site, and it
            is the source you should treat as authoritative:
          </p>
          <p className="rise">
            <a href={OFFICIAL_SOURCE} target="_blank" rel="noopener noreferrer" className={linkCls}>
              The official {PROJECT.name} listing on m3mproperties.com
              <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </p>
        </div>
      </section>

      {/* 03 — imagery */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">Imagery and illustrations</span>
        </div>
        <dl className="rise max-w-[70ch] border-t border-line">
          {IMAGERY.map((i) => (
            <div key={i.k} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-8">
              <dt className="font-display text-base leading-snug text-ink">{i.k}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{i.d}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 04 — areas & plans */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">Areas, plans and specifications</span>
        </div>
        <dl className="rise max-w-[70ch] border-t border-line">
          {AREAS.map((a) => (
            <div key={a.k} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-8">
              <dt className="font-display text-base leading-snug text-ink">{a.k}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{a.d}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 05 — the figures this site does not publish */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">05</span>
          <span className="kicker">What this site does not publish, and why</span>
        </div>
        <p className="rise mb-8 max-w-[70ch] leading-relaxed text-ink-soft">
          Certain figures are missing from this website on purpose. They are absent from the
          official record, and a marketing site that fills such gaps with estimates is not being
          helpful — it is being inaccurate. Where a figure does not exist officially, you will find
          a request route here instead of a number.
        </p>
        <dl className="rise max-w-[70ch] border-t border-line">
          {UNPUBLISHED.map((u) => (
            <div key={u.k} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-8">
              <dt className="font-display text-base leading-snug text-ink">{u.k}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{u.d}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[70ch] leading-relaxed text-ink-soft">
          Any figure shared with you on enquiry — a rate, a schedule of charges, an area, a
          registration status or a timeline — is shared as it stands on the day of the conversation
          and is subject to confirmation by the developer in writing. It is indicative until it
          appears in an officially issued document, and it may change without notice.
        </p>
      </section>

      {/* 06 — trademarks */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">06</span>
          <span className="kicker">Trademarks and third-party names</span>
        </div>
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            {PROJECT.partner}, {PROJECT.developer} and every other brand, logo, product name and
            trademark referred to on this website are the property of their respective owners. They
            are used here for identification and descriptive reference only.
          </p>
          <p className="rise">
            Their appearance implies no ownership, no partnership, no sponsorship and no endorsement
            of this website by those owners. Any description of the relationship between the
            developer and the automotive marque reflects the official listing; the terms of that
            relationship are theirs to define, not ours.
          </p>
        </div>
      </section>

      {/* 07 — editorial content */}
      <section className="dc-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">07</span>
          <span className="kicker">Blogs, guides and commentary</span>
        </div>
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            Articles, buyer guides and any assessment published on this site are general information
            written to help a reader ask better questions. They are not legal, tax, financial or
            investment advice, and they are not a recommendation to buy or to refrain from buying.
          </p>
          <p className="rise">
            Property is not a guaranteed investment. No return, appreciation, rental yield or resale
            value is promised anywhere on this site — and if you find such a promise made elsewhere
            about this project, treat it with the scepticism it deserves. Laws, rates and regulations
            change; an article accurate on the day it was written may not be accurate on the day you
            read it. Consult a qualified professional on your own circumstances before acting.
          </p>
          <p className="rise">
            Links to external websites are provided for convenience. Their content is not under our
            control and no responsibility is accepted for it.
          </p>
        </div>
      </section>

      {/* 08 — verify before you transact */}
      <section className="dc-sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">08</span>
          <span className="kicker">Verify before you transact</span>
        </div>
        <p className="rise mb-8 max-w-[70ch] leading-relaxed text-ink-soft">
          Take nothing on this website — or on any other marketing website — as sufficient grounds
          for a purchase. Before you part with money, verify each of the following for yourself:
        </p>
        <ol className="rise max-w-[70ch] border-t border-line">
          {VERIFY.map((v, i) => (
            <li key={v} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-line py-5">
              <span className="idx pt-1">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm leading-relaxed text-ink-soft">{v}</span>
            </li>
          ))}
        </ol>

        <div className="rise mt-10 max-w-[70ch] rounded-[1.25rem] border border-line bg-cream/60 p-7 md:p-9">
          <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">Where to go next</p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            The regulatory position, and how to check it on the HARERA portal yourself, is set out on
            the RERA page. Anything you would like confirmed in writing, ask the team directly.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link to="/rera" className={linkCls}>
              RERA status &amp; verification
              <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link to="/contact" className={linkCls}>
              Contact the team
              <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <a
              href={`tel:${PROJECT.phone}`}
              className="mono inline-flex items-center gap-2.5 rounded-sm text-[0.68rem] tracking-[0.16em] text-ink-soft transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              <Phone size={13} className="text-brass" />
              {PROJECT.phone}
            </a>
          </div>
          <p className="mono mt-7 text-[0.58rem] tracking-[0.18em] text-ink-faint">
            Last updated · {LAST_UPDATED}
          </p>
        </div>
      </section>

      <RelatedPages links={["/rera", "/privacy-policy", "/contact"]} />
    </div>
  );
}
