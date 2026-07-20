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
import { PROJECT } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* We publish only what the official listing publishes. Possession, RERA and
   price are not stated there yet — so this page explains the mechanics of a
   handover instead of inventing a date. */

const STATUS = [
  { k: "Possession", v: PROJECT.possession, n: "No handover date is stated on the official listing" },
  { k: "RERA registration", v: PROJECT.rera, n: "The declared completion date lives in the RERA filing" },
  { k: "Price", v: PROJECT.price, n: "Payment plan follows the pricing announcement" },
  { k: "Configurations", v: PROJECT.configs, n: PROJECT.sizes },
  { k: "Address", v: PROJECT.address, n: "Golf Course Extension Road" },
  { k: "Developer", v: `${PROJECT.developer} · inspired by ${PROJECT.partner}`, n: "Branded residences" },
];

const MEANING = [
  {
    k: "01",
    t: "Possession is the handover, not the booking",
    d: "It is the point at which the developer hands you the keys to a completed residence and you take physical charge of the home — distinct from allotment, from the agreement to sell, and from registry.",
  },
  {
    k: "02",
    t: "The offer of possession starts the clock",
    d: "A written offer of possession follows completion approvals. From that notice, the remaining consideration, statutory dues and maintenance arrangements typically fall due within a stated window.",
  },
  {
    k: "03",
    t: "Snagging comes before you sign",
    d: "A joint inspection of finishes, fittings and services is the buyer's opportunity to list defects. Anything unrecorded at handover is far harder to pursue afterwards.",
  },
  {
    k: "04",
    t: "Handover is when ownership costs begin",
    d: "Maintenance charges, utility connections and the association's terms usually commence from the offer of possession — read them alongside the date, never after it.",
  },
];

const GOVERNS = [
  {
    t: "The RERA-declared date",
    d: "Under the Real Estate (Regulation and Development) Act, a registered project carries a completion date declared to the authority. That filing — not marketing material — is the reference a buyer should rely on.",
  },
  {
    t: "Approvals and sanctions",
    d: "Building-plan sanction, environmental clearance and the occupation certificate each sit on the critical path. A handover cannot precede the occupation certificate.",
  },
  {
    t: "Scale and specification",
    d: "Large-format branded residences of ≈ 5,000 – 7,000 sq.ft with Italian marble, VRV climate control and smart-home integration carry longer fit-out cycles than standard apartments.",
  },
  {
    t: "Construction stage",
    d: "Structure, façade, MEP services and finishing progress at different rates. A current site-status report tells you more about timing than any single quoted quarter.",
  },
];

const ASK = [
  { q: "The RERA-declared completion date", a: "Ask for the registration number and read the declared date in the authority's own record." },
  { q: "The current construction status", a: "Request the latest site-progress report — structure, façade, services and finishing, stage by stage." },
  { q: "The written handover terms", a: "Offer-of-possession procedure, the payment window it triggers, and the delay clause in the agreement." },
  { q: "What is included at handover", a: "The final specification schedule, so what is fitted on day one is unambiguous." },
  { q: "Maintenance and charges", a: "When maintenance begins, how it is billed, and which statutory dues sit outside the headline consideration." },
  { q: "Approval milestones", a: "Which sanctions are in hand and which remain pending, including the occupation certificate." },
];

const PAGE_FAQS = [
  {
    q: "What is the possession date of M3M Brabus?",
    a: `A possession date is not published on the official M3M listing at this stage — it is stated as "${PROJECT.possession}". We do not publish dates we cannot source. Register your interest and we will share the current, official timeline the moment it is released.`,
  },
  {
    q: "Is M3M Brabus RERA registered, and where is the completion date declared?",
    a: `RERA details are shown as "${PROJECT.rera}" on the official listing. For any registered project the completion date is declared in the RERA filing itself — ask for the registration number and verify the date in the authority's record rather than in any brochure.`,
  },
  {
    q: "How will I know when the timeline is announced?",
    a: "Leave your details with the private client team. When the developer publishes possession, RERA and pricing information, it is shared directly — along with the construction status at that time.",
  },
];

export default function PossessionPage() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        q(".mn").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0, y: 26, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        gsap.from(q(".gv"), {
          autoAlpha: 0, y: 22, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".gv-grid")[0], start: "top 86%" },
        });

        gsap.from(q(".ask-row"), {
          autoAlpha: 0, y: 18, duration: 0.7, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: q(".ask")[0], start: "top 85%" },
        });

        gsap.from(q(".fq"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".fq-list")[0], start: "top 86%" },
        });

        gsap.from(q(".ps-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".ps-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".ps-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".ps-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Possession Date & Status | Sector 58 Gurgaon"
        description="M3M Brabus possession date is not published yet. The current status, what governs a handover timeline, and exactly what to ask before you commit."
        path="/possession"
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Possession", path: "/possession" }]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: PAGE_FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Possession", path: "/possession" }]} />
      <PageHeader
        eyebrow="M3M Brabus Possession"
        title="The date is not"
        accent="published yet."
        lede={`The official ${PROJECT.name} listing does not state a possession timeline — it reads "${PROJECT.possession}". Rather than quote a quarter we cannot source, here is what possession means, what governs it, and what to ask for.`}
      />

      {/* current status */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">Current status</span>
        </div>
        <dl className="border-t border-line">
          {STATUS.map((s) => (
            <div
              key={s.k}
              className="rise grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,14rem)_1fr_minmax(0,18rem)] sm:items-baseline sm:gap-8"
            >
              <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{s.k}</dt>
              <dd className="text-ink">{s.v}</dd>
              <dd className="mono text-[0.6rem] leading-relaxed tracking-[0.14em] text-ink-faint sm:text-right">{s.n}</dd>
            </div>
          ))}
        </dl>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Only figures published by the developer are shown — unpublished details are marked as such
        </p>
      </section>

      {/* what possession means */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">What possession means for a buyer</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {MEANING.map((m) => (
            <article key={m.t} className="mn group border-b border-line py-7">
              <span className="idx">{m.k}</span>
              <h2 className="mt-3 font-display text-2xl font-light text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-[1.75rem]">
                {m.t}
              </h2>
              <p className="mt-2 max-w-[46ch] leading-relaxed text-ink-soft">{m.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* wide image */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="ps-img-wrap relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-line">
          <div className="ps-img-inner ed-breath absolute inset-0 scale-[1.06]">
            <Media src={px(IMG.tower, 2000)} alt={`${PROJECT.name} — the tower at ${PROJECT.location}`} sizes="100vw" />
          </div>
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
          <span className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
            Construction status shared on request · {PROJECT.location}
          </span>
        </div>
      </section>

      {/* what governs the timeline */}
      <section className="gv-grid container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">What governs a handover timeline</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {GOVERNS.map((g) => (
            <div key={g.t} className="gv group border-b border-line py-6">
              <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">{g.t}</h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{g.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* what to ask */}
      <section className="ask container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">What to ask for before you commit</span>
        </div>
        <ul className="border-t border-line">
          {ASK.map((a) => (
            <li
              key={a.q}
              className="ask-row group grid grid-cols-1 gap-2 border-b border-line py-5 transition-colors duration-500 hover:bg-brass/[0.035] sm:grid-cols-[minmax(0,22rem)_1fr] sm:items-baseline sm:gap-8"
            >
              <span className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass-soft">{a.q}</span>
              <span className="max-w-[52ch] text-sm leading-relaxed text-ink-soft">{a.a}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* faqs */}
      <section className="fq-list container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">05</span>
          <span className="kicker">Possession — answers</span>
        </div>
        <div className="border-t border-line">
          {PAGE_FAQS.map((f) => (
            <article key={f.q} className="fq grid grid-cols-1 gap-2 border-b border-line py-7 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
              <h3 className="font-display text-xl font-light leading-snug text-ink md:text-2xl">{f.q}</h3>
              <p className="max-w-[58ch] leading-relaxed text-ink-soft">{f.a}</p>
            </article>
          ))}
        </div>
      </section>

      <RelatedPages links={["/overview", "/residences", "/contact"]} />

      <CtaBand title="Ask for the" accent="current status." subject="Possession" />
    </div>
  );
}
