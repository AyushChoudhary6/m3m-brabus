import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Minus, Phone, Plus } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Fact from "../components/ui/Fact.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { PROJECT } from "../lib/site.js";
import { PROJECT_FACTS, PRICE, OFFICIAL_SOURCE, hasValue } from "../lib/facts.js";
import { track } from "../lib/analytics.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ============================================================
   The long-form FAQ.

   Two rules govern every answer below.

   1. Nothing is invented. Where the official listing is silent — price,
      RERA number, tower count, land area, possession date, carpet areas —
      the answer says so in plain words and offers to send the verified
      position instead. An unknown is a reason to talk to someone, not a
      reason to guess.
   2. Nothing is repeated. The homepage carries seven headline questions;
      this page deliberately answers the ones a buyer asks second — the
      awkward ones about measurement, paperwork, delay and remittance.

   The bank lives here rather than in site.js because site.js is the
   short public FAQ feed used by the homepage and by other pages' schema;
   merging the two would have every page claiming the same 28 questions.
   ============================================================ */

const CATEGORIES = [
  { id: "about", label: "About the Project" },
  { id: "configurations", label: "Configurations & Floor Plans" },
  { id: "price", label: "Price & Payment" },
  { id: "location", label: "Location & Connectivity" },
  { id: "amenities", label: "Amenities" },
  { id: "legal", label: "Legal, RERA & Possession" },
  { id: "buying", label: "Buying Process & NRI" },
];

/** `cta` renders a lead capture inside the answer: enquiry | visit | brochure. */
const BANK = [
  // ---------- About the Project ----------
  {
    category: "about",
    q: "What exactly is M3M Brabus?",
    a: `${PROJECT.name} is a branded residential development by ${PROJECT.developer} at ${PROJECT.address}, designed in association with ${PROJECT.partner}, the German luxury automotive marque. It presents ${PROJECT.configs.toLowerCase()} of ${PROJECT.sizes}, planned at low density so that each home opens on three sides — light and cross-ventilation reach every room, which is unusual in a high-rise of this scale.`,
  },
  {
    category: "about",
    q: "What does a “branded residence” actually change for the buyer?",
    a: "It changes who decides the finish. In a conventional apartment the developer hands over a shell to a standard of its own choosing; in a branded residence the partner marque's ethos governs proportion, material and detail, and the interior arrives specified — Italian marble flooring, modular kitchens with branded fittings, VRV climate control and smart-home integration. The practical consequence is that the specification schedule matters more than the brochure. Ask for it in writing and read it line by line.",
    cta: { kind: "brochure", label: "Request the specification schedule", subject: "FAQ · Specification" },
  },
  {
    category: "about",
    q: "How many towers, floors and residences are planned?",
    a: "The official listing does not publish a tower count, a floor count or a total number of units, so no figure appears on this site. Numbers circulating on third-party portals are unverified. We share the built form as it stands on the day you ask, once it is confirmed by the developer.",
    cta: { kind: "enquiry", label: "Ask for the built-form details", subject: "FAQ · Towers & floors" },
  },
  {
    category: "about",
    q: "How large is the site, and how much of it is open space?",
    a: "Land area and open-space percentage are not published on the official listing. Because the two figures together are what actually define density, we would rather leave them blank than quote an estimate that flatters the project. The sanctioned site plan and the approved layout are the documents that settle it, and we can walk you through them.",
    cta: { kind: "enquiry", label: "Ask for the site details", subject: "FAQ · Land area" },
  },

  // ---------- Configurations & Floor Plans ----------
  {
    category: "configurations",
    q: "Which configurations are available?",
    a: "Two: a 4 BHK residence of approximately 5,000 sq.ft and a 5 BHK residence of approximately 7,000 sq.ft. Both are three-side open, both have a private lift lobby, and both are specified to the same standard — the difference is scale and outlook, not finish.",
  },
  {
    category: "configurations",
    q: "Is there a penthouse, a duplex or a villa?",
    a: "The official listing names 4 BHK and 5 BHK residences and nothing else. We therefore do not list a penthouse, a duplex, a simplex or a limited-edition unit, because none has been announced. If a further typology is released, it will appear here on the day it is official and not before.",
  },
  {
    category: "configurations",
    q: "Are the quoted sizes carpet area or saleable area?",
    a: `The published range of ${PROJECT.sizes} is the total area of the residence. Carpet area — the RERA-defined net usable floor area within the walls — is not published on the official listing, and the two numbers are never the same. Any purchase decision should be made on the carpet area declared in the agreement for sale, so ask for that figure specifically and in writing.`,
    cta: { kind: "enquiry", label: "Ask for the carpet areas", subject: "FAQ · Carpet area" },
  },
  {
    category: "configurations",
    q: "Can I see the unit floor plans?",
    a: "Dimensioned unit plans are not part of the public listing. They are released to registered buyers along with the price sheet, so we send them on request rather than publishing a redrawn version that may not match the sanctioned drawing. When you receive them, check three things: the room dimensions, the position of the service areas, and whether the balcony and utility spaces are counted inside the quoted area.",
    cta: { kind: "brochure", label: "Request the floor plans", subject: "FAQ · Floor plans" },
  },

  // ---------- Price & Payment ----------
  {
    category: "price",
    q: "What is the price of M3M Brabus?",
    a: `Pricing has not been publicly released — the official position is "${PROJECT.price}". There is no published basic sale price, no per sq.ft rate and no unit-wise price list at this stage. Register once and the price sheet is sent to you on the day it is issued, with the charge schedule alongside it.`,
    cta: { kind: "enquiry", label: "Request the price sheet", subject: "FAQ · Price" },
  },
  {
    category: "price",
    q: "Other websites quote a figure. Why don't you?",
    a: "Because those figures are inferred from neighbouring projects, not issued by the developer. A rate assembled from comparable launches can be wrong by a wide margin on a branded residence, where the specification premium is the whole point. We publish only what the developer has released; if you have seen a number elsewhere, send it to us and we will tell you plainly whether it is official.",
  },
  {
    category: "price",
    q: "What is the payment plan and the booking amount?",
    a: "Neither has been announced. No milestone schedule, no percentage split and no booking amount has been published for this project. Payment structures in this segment usually take one of a few familiar shapes — construction-linked, possession-linked or down-payment — and the plan you choose changes the total outlay, so it is worth understanding them before the sheet arrives.",
    cta: { kind: "enquiry", label: "Be sent the payment plan first", subject: "FAQ · Payment plan" },
  },
  {
    category: "price",
    q: "Will there be a launch or pre-launch advantage?",
    a: "We make no claim about discounts, inventory remaining or a closing window, because none has been published and pressure of that kind has no place in a purchase of this size. What we can do is tell you the moment the official price list and any launch terms are released, so you see them at the same time as everyone else rather than after.",
  },

  // ---------- Location & Connectivity ----------
  {
    category: "location",
    q: "Where exactly is M3M Brabus?",
    a: `The address is ${PROJECT.address} — directly on Golf Course Extension Road, the residential spine that runs south-east from Golf Course Road and carries much of Gurugram's newer luxury supply. Sector 58 sits at the established end of that stretch, close to the older Golf Course Road corridor rather than at the far edge of the city.`,
  },
  {
    category: "location",
    q: "How many minutes is it to the airport, Cyber City or the metro?",
    a: "Drive times are not published on the official listing, and we do not quote them. A minute figure printed on a brochure describes an empty road at an unstated hour; Gurugram's roads are rarely either. What is documented is the access: a direct link to Golf Course Road, easy reach of Cyber City and the corporate districts, quick access to NH-8 and Sohna Road, easy access to IGI Airport and metro connectivity nearby. The honest way to test any of it is to drive the route at the hour you would actually travel.",
    cta: { kind: "visit", label: "Book a site visit", subject: "FAQ · Site visit" },
  },
  {
    category: "location",
    q: "What is nearby for schools, healthcare and retail?",
    a: "Reputed schools, hospitals and shopping destinations sit close by along and around the Golf Course Extension corridor, which is one of the reasons the stretch has matured as a residential address rather than a commuter suburb. We name specific institutions only when you ask, so that what you are given is a current list rather than a brochure list.",
  },
  {
    category: "location",
    q: "How do I judge the location for myself?",
    a: "Visit twice — once on a weekday morning and once on a weekend evening — and note three things: how the approach road behaves at peak, what is under construction immediately around the site, and how far the nearest daily-needs retail actually is on foot. Those three answers tell you more about living there than any connectivity table.",
    cta: { kind: "visit", label: "Arrange a visit", subject: "FAQ · Location visit" },
  },

  // ---------- Amenities ----------
  {
    category: "amenities",
    q: "What amenities are planned?",
    a: "A grand clubhouse with a fully equipped gym, a temperature-controlled swimming pool, a spa and wellness centre with sauna and steam rooms, a multipurpose event hall, landscaped gardens with jogging tracks, a children's play area, indoor and outdoor games, a restaurant within the address, dedicated parking, and 24/7 security with CCTV surveillance. Rainwater harvesting and energy-efficient systems are built into the estate.",
  },
  {
    category: "amenities",
    q: "How large is the clubhouse, and is membership charged separately?",
    a: "The clubhouse area is not published, and no membership charge has been announced. In this segment a one-time club charge is commonly listed as a separate line on the price sheet rather than being included in the headline rate, so it is worth asking where it sits before you compare one project's rate against another's.",
    cta: { kind: "enquiry", label: "Ask about the clubhouse", subject: "FAQ · Clubhouse" },
  },
  {
    category: "amenities",
    q: "Is the pool usable through the Gurugram winter?",
    a: "The pool is temperature-controlled, which is what makes it a year-round amenity rather than a four-month one — the distinction matters in a city with a genuine winter. The spa and wellness centre, with sauna and steam, is planned alongside it, and the gym sits within the same clubhouse rather than in a separate block.",
  },
  {
    category: "amenities",
    q: "What is provided for parking, security and upkeep?",
    a: "Dedicated covered parking is allotted to residences, and the estate is planned with 24/7 manned security and CCTV surveillance. The number of bays allotted per residence and the maintenance rate per sq.ft are not published; both are confirmed in the allotment paperwork, and both are worth pinning down early because they are recurring costs rather than one-time ones.",
    cta: { kind: "enquiry", label: "Ask about parking & maintenance", subject: "FAQ · Parking" },
  },

  // ---------- Legal, RERA & Possession ----------
  {
    category: "legal",
    q: "Is M3M Brabus RERA registered, and what is the number?",
    a: "No RERA registration number is published on the official listing at this stage, so none is printed here. Haryana projects are regulated by HARERA, and the register is public: once a number exists you can search it yourself on the authority's portal and read the declared completion date, the approvals and the quarterly progress filings in the regulator's own record rather than in a brochure. We will give you the current status the day you ask.",
    cta: { kind: "enquiry", label: "Get the RERA status", subject: "FAQ · RERA" },
  },
  {
    category: "legal",
    q: "When is possession?",
    a: "The official listing states only that possession is expected in the coming years. No quarter, no year and no construction milestone schedule has been announced, and this site does not invent one. The date that will eventually matter legally is the completion date declared in the RERA filing — not a date given verbally, and not a date in marketing material.",
    cta: { kind: "enquiry", label: "Get a possession update", subject: "FAQ · Possession" },
  },
  {
    category: "legal",
    q: "What should I read before paying anything?",
    a: "Five documents, in this order: the RERA registration record; the allotment letter; the agreement for sale, which is where the carpet area and the completion date become binding; the payment schedule with every charge itemised; and the specification schedule that lists what is actually fitted at handover. If a commitment matters to you and it is not in one of those five, treat it as not having been made.",
  },
  {
    category: "legal",
    q: "What happens if the timeline slips?",
    a: "The remedy lives in the delay clause of the agreement for sale, read together with the completion date declared to the regulator — which is precisely why the clause deserves reading before signature rather than after. Ask how compensation is calculated, from which date it runs, and what your options are if the delay is prolonged. Any buyer who is told to rely on goodwill instead of the clause should ask again.",
  },

  // ---------- Buying Process & NRI ----------
  {
    category: "buying",
    q: "How do I book a residence?",
    a: "Register your interest, review the price sheet and floor plans when they are issued, choose the residence and payment structure, and pay the booking amount to receive an allotment letter — after which the agreement for sale is executed and registered. Nothing on this site asks you to commit before the price list, the payment plan and the registration position are in front of you in writing.",
    cta: { kind: "enquiry", label: "Speak to the client team", subject: "FAQ · Booking" },
  },
  {
    category: "buying",
    q: "Can NRIs and OCI cardholders buy here?",
    a: "Non-resident Indians and OCI cardholders may generally purchase residential property in India under the RBI's standing permission, with payment made through normal banking channels or from an NRE, NRO or FCNR account — not in foreign currency notes. Repatriation of sale proceeds later is permitted within the limits the RBI sets, so the account you buy through affects what you can take out. Rules change; confirm the current position with your banker or a tax adviser before you remit.",
  },
  {
    category: "buying",
    q: "Can I complete a purchase from overseas without travelling?",
    a: "Yes, in practice. A registered power of attorney executed in favour of someone you trust in India — attested at the Indian mission in your country of residence and adjudicated on arrival — allows documents to be signed on your behalf. Ahead of that we can arrange a live video walkthrough of the site and a scheduled call with the client team, so the decision is not made on renders alone.",
    cta: { kind: "enquiry", label: "Arrange an NRI consultation", subject: "FAQ · NRI" },
  },
  {
    category: "buying",
    q: "What documents will I need?",
    a: "For a resident buyer: PAN, photo identity and address proof, passport-size photographs and the bank details the payments will be made from. For an NRI or OCI buyer: passport and visa or OCI card, overseas address proof, PAN, and the NRE or NRO account particulars — plus the power of attorney if someone will sign on your behalf. The exact checklist is confirmed at allotment.",
  },
];

/** Stable, readable DOM ids — the anchor is part of the page's public surface. */
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[’“”']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 52);

/* The unpublished figures, gathered in one place. Rendered through <Fact>
   so an unknown becomes an enquiry rather than a blank. */
const GATED = [PRICE, ...PROJECT_FACTS.filter((f) => !hasValue(f))];

export default function FaqsPage() {
  const root = useRef(null);
  const { openEnquiry, openBrochure, openVisit } = useEnquiry();

  const grouped = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        ...c,
        items: BANK.filter((b) => b.category === c.id),
      })).filter((c) => c.items.length),
    [],
  );

  /* Every answer is rendered into the DOM regardless of state — collapsed
     panels are clipped by CSS, not unmounted, so a crawler that does not
     execute JavaScript still reads all 28 answers. The first question of
     each category opens by default. */
  const [open, setOpen] = useState(
    () => new Set(grouped.map((c) => slug(c.items[0].q))),
  );

  const toggle = (id, q) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        track("faq_open", { question: q });
      }
      return next;
    });

  const setAll = (expand) =>
    setOpen(expand ? new Set(BANK.map((b) => slug(b.q))) : new Set());

  const runCta = (cta) => {
    if (!cta) return;
    if (cta.kind === "visit") openVisit(cta.subject);
    else if (cta.kind === "brochure") openBrochure(cta.subject);
    else openEnquiry(cta.subject);
  };

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 88%" },
        });

        gsap.from(q(".jump-link"), {
          autoAlpha: 0, y: 14, duration: 0.6, ease: "power3.out", stagger: 0.04,
          scrollTrigger: { trigger: q(".jump")[0], start: "top 90%" },
        });

        q(".faq-block").forEach((block) => {
          gsap.from(block.querySelectorAll(".faq-row"), {
            autoAlpha: 0, y: 18, duration: 0.7, ease: "power3.out", stagger: 0.05,
            scrollTrigger: { trigger: block, start: "top 86%" },
          });
        });

        gsap.from(q(".gate-item"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".gate-grid")[0], start: "top 86%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="bg-canvas">
      <Seo
        title="M3M Brabus FAQs | Price, Floor Plans, RERA & Possession Answered"
        description="M3M Brabus FAQs — configurations, sizes and carpet area, pricing status, Sector 58 connectivity, amenities, RERA, possession and the buying process."
        path="/faqs"
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "FAQs", path: "/faqs" }]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: BANK.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "FAQs", path: "/faqs" }]} />
      <PageHeader
        eyebrow="M3M Brabus FAQs"
        title="Every question,"
        accent="answered honestly."
        lede={`${BANK.length} questions on ${PROJECT.name} — configurations, carpet area, pricing status, connectivity, amenities, RERA, possession and the buying process. Where the official listing publishes nothing, this page says so rather than guessing.`}
        compact
      />

      {/* how these answers are sourced + category jump links */}
      <section className="container-lux pb-[clamp(3.5rem,10vh,6rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">How we answer</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="rise max-w-[52ch] leading-relaxed text-ink-soft">
              Every factual answer below is drawn from the{" "}
              <a
                href={OFFICIAL_SOURCE}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-brass/40 text-ink transition-colors hover:text-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
              >
                official {PROJECT.developer} listing
              </a>{" "}
              for {PROJECT.name}. Where that listing is silent — on price, on RERA
              registration, on the possession date, on land area, on tower and floor
              counts, on carpet areas — the answer states that it is silent, and offers to
              send you the verified position instead.
            </p>
            <p className="rise mt-4 max-w-[52ch] leading-relaxed text-ink-soft">
              That is a deliberate constraint. Estimated rates and inferred timelines are
              easy to publish and impossible to stand behind, and on a purchase of this
              scale the cost of being confidently wrong falls entirely on the buyer. The{" "}
              {GATED.length} figures a prospective owner would reasonably want are simply not
              in the public domain yet; they are listed further down this page, each one gated
              behind a request rather than filled with a plausible number.
            </p>
            <p className="rise mt-4 max-w-[52ch] leading-relaxed text-ink-soft">
              The seven headline questions on the home page are the short version. These{" "}
              {BANK.length} are the ones buyers ask second — about measurement, paperwork,
              delay and remittance.
            </p>
          </div>

          <div className="jump self-start rounded-[1.25rem] border border-line bg-paper p-7 md:p-8">
            <p className="mono text-[0.6rem] tracking-[0.22em] text-ink-faint">Jump to a section</p>
            <ul className="mt-5 grid gap-0">
              {grouped.map((c, i) => (
                <li key={c.id} className="jump-link border-b border-line-soft last:border-b-0">
                  <a
                    href={`#${c.id}`}
                    className="group flex items-baseline justify-between gap-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-display text-base text-ink transition-colors group-hover:text-brass-soft">
                        {c.label}
                      </span>
                    </span>
                    <span className="mono shrink-0 text-[0.58rem] tracking-[0.18em] text-ink-faint">
                      {c.items.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-line pt-6">
              <button
                type="button"
                onClick={() => setAll(true)}
                className="mono border-b border-brass/40 pb-0.5 text-[0.6rem] tracking-[0.18em] text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={() => setAll(false)}
                className="mono border-b border-line pb-0.5 text-[0.6rem] tracking-[0.18em] text-ink-faint transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
              >
                Collapse all
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* the accordion, grouped by category */}
      <section className="container-lux pb-[clamp(3rem,9vh,5rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">The questions</span>
        </div>

        {grouped.map((cat, ci) => (
          <div
            key={cat.id}
            id={cat.id}
            className="faq-block scroll-mt-28 pb-[clamp(2.5rem,7vh,4rem)]"
          >
            <div className="flex items-baseline gap-5 border-t border-line pt-7">
              <span className="idx">{String(ci + 1).padStart(2, "0")}</span>
              <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] font-light leading-tight tracking-[-0.02em] text-ink">
                {cat.label}
              </h2>
            </div>

            <div className="mt-6">
              {cat.items.map((item) => {
                const id = slug(item.q);
                const isOpen = open.has(id);
                return (
                  <div key={id} className="faq-row border-b border-line">
                    <h3>
                      <button
                        type="button"
                        id={`btn-${id}`}
                        aria-expanded={isOpen}
                        aria-controls={`panel-${id}`}
                        onClick={() => toggle(id, item.q)}
                        data-cursor="OPEN"
                        className="group flex w-full items-start justify-between gap-6 py-6 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
                      >
                        <span className="max-w-[46ch] font-display text-lg font-light leading-snug text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-xl">
                          {item.q}
                        </span>
                        <span
                          aria-hidden="true"
                          className="mt-1 shrink-0 rounded-full border border-brass/35 p-1.5 text-brass transition-colors duration-500 group-hover:border-brass/70"
                        >
                          {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                        </span>
                      </button>
                    </h3>

                    {/* Collapsed panels stay in the DOM — 0fr/1fr clips them
                        visually while leaving the text readable to crawlers.
                        `inert` keeps the hidden CTA out of the tab order. */}
                    <div
                      id={`panel-${id}`}
                      role="region"
                      aria-labelledby={`btn-${id}`}
                      inert={!isOpen || undefined}
                      className={`grid transition-[grid-template-rows] duration-500 ease-lux ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pb-7 pr-8 lg:pl-0">
                          <p className="max-w-[68ch] leading-relaxed text-ink-soft">{item.a}</p>
                          {item.cta && (
                            <button
                              type="button"
                              onClick={() => runCta(item.cta)}
                              data-cursor="ENTER"
                              className="group/c mt-5 inline-flex items-center gap-2 border-b border-brass/40 pb-1 font-sans text-[0.7rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
                            >
                              {item.cta.label}
                              <ArrowUpRight
                                size={13}
                                className="transition-transform duration-500 group-hover/c:-translate-y-0.5 group-hover/c:translate-x-0.5"
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* the figures that do not exist publicly — gathered, not hidden */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">Not published yet</span>
        </div>
        <p className="rise mb-9 max-w-[58ch] leading-relaxed text-ink-soft">
          These are the figures a buyer asks for that {PROJECT.developer} has not released
          publicly for {PROJECT.name}. Rather than estimate them, we have gathered them
          here. Ask for any one and the private client team will tell you exactly where it
          stands on the day you ask — including, where the honest answer is still
          &ldquo;not decided&rdquo;, that it is not decided.
        </p>
        <div className="gate-grid grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {GATED.map((f) => (
            <div key={f.key} className="gate-item border-t border-line pt-6">
              <Fact fact={f} />
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-line pt-8">
          <button
            type="button"
            onClick={() => openEnquiry("FAQ · Unanswered question")}
            data-cursor="OPEN"
            className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
            <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
              Ask a question of your own
            </span>
            <ArrowUpRight
              size={15}
              className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian"
            />
          </button>
          <a
            href={`tel:${PROJECT.phone}`}
            className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
            aria-label={`Call the ${PROJECT.name} client team on ${PROJECT.phone}`}
          >
            <Phone size={13} className="text-brass" />
            {PROJECT.phone}
          </a>
          <p className="mono text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
            No estimated figures are circulated · Official documents only
          </p>
        </div>
      </section>

      <RelatedPages links={["/price", "/floor-plan", "/rera", "/possession", "/payment-plan", "/contact"]} />
      <CtaBand title="Still have a" accent="question?" subject="FAQs" />
    </div>
  );
}
