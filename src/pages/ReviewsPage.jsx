import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { PROJECT, RESIDENCES } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* An honest editorial assessment. No testimonials, no star ratings, no
   reviewer names — none exist, so none are published. Every line below is
   traceable to the official M3M listing or is plainly marked unpublished. */

const ASSESSED = [
  {
    k: "The proposition",
    v: "A branded residence developed by M3M India and inspired by BRABUS, the German luxury automotive marque. The brand shapes the design language, bespoke interiors and finish standard rather than the construction itself — worth understanding precisely for what it is.",
  },
  {
    k: "Architecture",
    v: "Open-core planning, with each residence open on three sides. In a Gurugram high-rise market where cross-ventilation is often sacrificed to floor-plate efficiency, three-side-open homes are a genuine and uncommon structural advantage — not a marketing line.",
  },
  {
    k: "Density",
    v: "An ultra-low-density plan: a limited collection across a generous address. Lower density is the single attribute that most reliably preserves privacy, lift-waiting times and common-area quality a decade after handover.",
  },
  {
    k: "Residence sizes",
    v: `${PROJECT.configs} of ${PROJECT.sizes}. These are villa-scale floor areas in a vertical format, which places the project in the top tier of Gurugram apartment sizing rather than the mainstream luxury bracket.`,
  },
  {
    k: "Address",
    v: "Sector 58, on Golf Course Extension Road — an established luxury corridor with direct links to Golf Course Road, Cyber City, NH-8 and Sohna Road, and metro connectivity nearby. Exact drive times are not published by the developer, so we do not quote any.",
  },
  {
    k: "Specification",
    v: "Italian marble flooring, modular kitchens with branded fittings, VRV air conditioning and smart-home integration. A credible, current specification for the segment; the detail that matters is the final approved schedule, which is issued on request.",
  },
];

const STRENGTHS = [
  {
    t: "Light and air are designed in, not optional",
    d: "Three open sides per residence means daylight and cross-ventilation reach each room. This is a decision made at the structural stage and cannot be retrofitted — it is the strongest verifiable differentiator in the plan.",
  },
  {
    t: "Scale that is genuinely rare",
    d: "Approximately 5,000 to 7,000 sq.ft per home. Buyers moving from a farmhouse or an independent floor tend to find this the deciding factor, because most vertical inventory in Gurugram does not reach it.",
  },
  {
    t: "A coherent brand thesis",
    d: "BRABUS is a marque built on bespoke engineering and restraint rather than ornament. Applied to interiors, that ethos reads as materials and precision, which ages considerably better than decorative luxury.",
  },
  {
    t: "Amenity depth within the address",
    d: "A grand clubhouse, temperature-controlled pool, spa with sauna and steam, gym, event hall, landscaped gardens, restaurant and 24/7 CCTV security — a self-contained programme rather than a token podium deck.",
  },
];

const UNPUBLISHED = [
  { k: "Price", v: PROJECT.price, note: "No price sheet, per-sq.ft rate or unit-wise pricing has been publicly released." },
  { k: "RERA", v: PROJECT.rera, note: "No RERA registration number is published on the official listing at this stage." },
  { k: "Possession", v: PROJECT.possession, note: "No handover date or construction milestone schedule has been announced." },
  { k: "Tower & unit count", v: "Not published", note: "The number of towers, floors and total units is not stated officially — treat any figure you see elsewhere as unverified." },
  { k: "Land area", v: "Not published", note: "Total site area has not been released, so density cannot be expressed numerically yet." },
];

const VERIFY = [
  {
    t: "RERA registration",
    d: "Ask for the registration number and check it yourself on the Haryana RERA portal. Confirm the registered project name, promoter entity, sanctioned plan and the declared completion date — not the marketing timeline.",
  },
  {
    t: "The price sheet in writing",
    d: "Request the rate per sq.ft, the basis of area (carpet, built-up or saleable), and every charge outside the base price: PLC, club membership, EDC and IDC, IFMS, power backup and parking. A headline number without these is not a price.",
  },
  {
    t: "Payment plan and exit terms",
    d: "Get the construction-linked or down-payment schedule, the interest or rebate treatment, and the cancellation and transfer clauses. Read the allotment letter and builder-buyer agreement before any booking amount moves.",
  },
  {
    t: "Possession timeline",
    d: "Ask for the RERA-declared completion date and the delay-compensation clause in the agreement. Verbal handover estimates carry no weight; the registered date does.",
  },
  {
    t: "The approved specification schedule",
    d: "Marketing collateral is indicative. Ask for the annexed specification list in the agreement, brand by brand, and confirm what is standard versus an upgrade.",
  },
  {
    t: "The brand agreement",
    d: "For any branded residence, ask in writing what the brand association covers — design, interiors, fit-out, ongoing services — and for how long. It is a fair question and a serious developer will answer it.",
  },
];

const SUITS = [
  "Buyers who want villa-scale floor area without leaving a serviced, secure vertical address.",
  "End-users who value daylight, cross-ventilation and low density over headline amenity counts.",
  "Buyers already anchored to the Golf Course Extension Road corridor for work or schooling.",
  "Those comfortable registering interest at a pre-price stage in exchange for early selection of floor and orientation.",
];

const RECONSIDER = [
  "Buyers who need a confirmed possession date today — it has not been announced.",
  "Investors underwriting a specific yield or exit, which is not possible before pricing is released.",
  "Anyone who requires a published RERA number before a first site visit or conversation.",
  "Buyers seeking compact or entry-level configurations; the collection begins at 4 BHK.",
];

export default function ReviewsPage() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        q(".blk").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0, y: 26, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        gsap.from(q(".rv-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".rv-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".rv-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".rv-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Review | An Honest Assessment, Sector 58 Gurgaon"
        description="An editorial review of M3M Brabus, Sector 58 Gurgaon — the BRABUS branded-residence proposition, three-side-open architecture, ultra-low density and 5,000–7,000 sq.ft sizes, plus what to verify before you buy. Price, RERA and possession are not yet published."
        path="/reviews"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Reviews", path: "/reviews" }])}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Reviews", path: "/reviews" }]} />
      <PageHeader
        eyebrow="M3M Brabus Review"
        title="What M3M Brabus"
        accent="actually offers."
        lede="An editorial assessment written on verifiable attributes only — architecture, density, scale, address and specification. We publish no star ratings and no customer testimonials, because none have been verified. Where a figure is unpublished, we say so."
      />

      {/* editorial disclosure */}
      <section className="container-lux pb-[clamp(2.5rem,7vh,4rem)]">
        <div className="rise border-y border-line py-6">
          <p className="mono text-[0.58rem] tracking-[0.2em] text-brass-soft">Editorial note</p>
          <p className="mt-3 max-w-[70ch] leading-relaxed text-ink-soft">
            This page is an assessment by our editorial team, not a collection of customer reviews.
            We do not host ratings, quotes or testimonials for {PROJECT.name}, and we do not publish
            aggregate scores. Every claim below is drawn from the official {PROJECT.developer} listing
            or is explicitly flagged as unpublished.
          </p>
        </div>
      </section>

      {/* the assessment */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">The assessment</span>
        </div>
        <dl className="border-t border-line">
          {ASSESSED.map((a) => (
            <div
              key={a.k}
              className="blk grid grid-cols-1 gap-2 border-b border-line py-6 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8"
            >
              <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{a.k}</dt>
              <dd className="max-w-[64ch] leading-relaxed text-ink-soft">{a.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* image */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="rv-img-wrap relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-line">
          <div className="rv-img-inner ed-breath absolute inset-0 scale-[1.06]">
            <Media src={px(IMG.heroExterior, 2000)} alt={`${PROJECT.name} — the tower at ${PROJECT.location}`} sizes="100vw" />
          </div>
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
          <span className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
            Official render · {PROJECT.address}
          </span>
        </div>
      </section>

      {/* what stands up */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">What stands up to scrutiny</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {STRENGTHS.map((s, i) => (
            <article key={s.t} className="blk group border-b border-line py-6">
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-3 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-2xl">
                {s.t}
              </h2>
              <p className="mt-2.5 max-w-[48ch] text-sm leading-relaxed text-ink-soft">{s.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* not yet published */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">Not yet published</span>
        </div>
        <p className="blk mb-8 max-w-[62ch] leading-relaxed text-ink-soft">
          The honest part of any early-stage review is what cannot be assessed. {PROJECT.developer} has
          not released the following, and we will not estimate them on its behalf. If you find these
          figures quoted elsewhere, ask for the source before you rely on them.
        </p>
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[1fr_1fr_1.6fr] gap-6 border-b border-line pb-4">
              <span className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">Item</span>
              <span className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">Official status</span>
              <span className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">What that means</span>
            </div>
            {UNPUBLISHED.map((u) => (
              <div key={u.k} className="blk grid grid-cols-[1fr_1fr_1.6fr] items-baseline gap-6 border-b border-line-soft py-5">
                <span className="font-display text-lg text-ink">{u.k}</span>
                <span className="font-serif text-sm italic text-brass">{u.v}</span>
                <span className="text-sm leading-relaxed text-ink-soft">{u.note}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Enquire and we will send each of these the moment it is officially released
        </p>
      </section>

      {/* what to verify */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">What to verify before you buy</span>
        </div>
        <ol className="border-t border-line">
          {VERIFY.map((v, i) => (
            <li
              key={v.t}
              className="blk grid grid-cols-1 gap-2 border-b border-line py-6 sm:grid-cols-[minmax(0,3rem)_1fr] sm:gap-8"
            >
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="font-display text-xl text-ink md:text-2xl">{v.t}</h2>
                <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-ink-soft">{v.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* suits / reconsider */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">05</span>
          <span className="kicker">Who it suits</span>
        </div>
        <div className="grid gap-x-14 gap-y-10 md:grid-cols-2">
          <div className="blk border-t border-line pt-6">
            <h2 className="font-display text-2xl font-light text-ink md:text-3xl">
              A strong <span className="font-serif italic text-brass">fit for</span>
            </h2>
            <ul className="mt-5">
              {SUITS.map((s) => (
                <li key={s} className="border-b border-line-soft py-4 text-sm leading-relaxed text-ink-soft">{s}</li>
              ))}
            </ul>
          </div>
          <div className="blk border-t border-line pt-6">
            <h2 className="font-display text-2xl font-light text-ink md:text-3xl">
              Worth <span className="font-serif italic text-brass">pausing on</span>
            </h2>
            <ul className="mt-5">
              {RECONSIDER.map((s) => (
                <li key={s} className="border-b border-line-soft py-4 text-sm leading-relaxed text-ink-soft">{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="blk mt-[clamp(3rem,8vh,5rem)] border-t border-line pt-8">
          <p className="mono text-[0.58rem] tracking-[0.2em] text-brass-soft">In short</p>
          <p className="mt-4 max-w-[70ch] font-display text-[clamp(1.3rem,2.4vw,1.9rem)] font-light leading-[1.35] text-ink">
            The architecture and the scale are verifiable today —{" "}
            {RESIDENCES.map((r) => r.name.replace(" Residence", "")).join(" and ")} homes of {PROJECT.sizes},
            open on three sides, at low density on Golf Course Extension Road.{" "}
            <span className="font-serif italic text-brass">
              The commercial terms are not yet public, so judge those only when the paperwork arrives.
            </span>
          </p>
        </div>
      </section>

      <RelatedPages links={["/overview", "/residences", "/brabus", "/contact"]} />
      <CtaBand title="Ask the" accent="hard questions." subject="Reviews" />
    </div>
  );
}
