import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Phone } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { PROJECT, RESIDENCES, FAQS } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* No figure on this page is invented. M3M has not released pricing for
   Brabus, so the page explains how the price will be built rather than
   guessing at it. */

const DRIVERS = [
  {
    k: "Configuration",
    d: "A 4 BHK and a 5 BHK are priced as separate products, not as one rate applied to two sizes.",
  },
  {
    k: "Saleable area",
    d: `Residences run ${PROJECT.sizes}. The spread between the smallest and the largest home is the single largest factor in the final number.`,
  },
  {
    k: "Floor rise",
    d: "Higher floors are conventionally charged above lower ones. The rise, and the floor it starts from, are set in the published price sheet.",
  },
  {
    k: "Orientation & view",
    d: "Every residence is open on three sides, but aspect still differs — corner placement and the outlook a home commands are priced through a preferential location charge.",
  },
  {
    k: "Inventory released",
    d: "This is an ultra-low-density collection. What is available in a given release, and when you enter it, both bear on the number quoted to you.",
  },
  {
    k: "Payment plan chosen",
    d: "Construction-linked and down-payment structures do not cost the same. The plan you select changes the total outlay.",
  },
];

const SHEET = [
  {
    t: "Basic sale price",
    d: "The cost of the residence itself, quoted per sq.ft on the saleable area and multiplied out to the unit total.",
  },
  {
    t: "Preferential location charge (PLC)",
    d: "A premium levied on the more sought-after placements — corner homes, particular aspects, particular floors.",
  },
  {
    t: "Car parking",
    d: "Dedicated covered parking is allotted per residence and charged as a separate line.",
  },
  {
    t: "Club membership",
    d: "A one-time charge for access to the grand clubhouse, pool, spa and gym, listed apart from the unit cost.",
  },
  {
    t: "Maintenance & IFMS",
    d: "An interest-free maintenance security, plus the recurring per sq.ft upkeep of the common estate.",
  },
  {
    t: "Statutory taxes",
    d: "GST and any applicable government levies, calculated at the rates prevailing on the date of each payment.",
  },
  {
    t: "Stamp duty & registration",
    d: "Payable to the State of Haryana at conveyance, at the rate in force at that time — not a developer charge.",
  },
  {
    t: "Payment schedule",
    d: "The milestone-by-milestone breakdown of when each instalment falls due across the build.",
  },
];

const PRICE_FAQ = FAQS.find((f) => f.q === "What is the price of M3M Brabus?");

const FAQ = [
  ...(PRICE_FAQ ? [PRICE_FAQ] : []),
  {
    q: "Why does this page not quote a per sq.ft rate?",
    a: `Because M3M has not published one. The official listing records the price as "${PROJECT.price}", and so do we. Any rate you find quoted elsewhere for this project is an estimate, not an official figure — we would rather send you the real sheet a little later than an invented one today.`,
  },
  {
    q: "How do I get the price the moment it is released?",
    a: "Register your interest with the private client team. You will be sent the price sheet, the payment plan and the charge schedule as soon as they are officially issued, along with the RERA and possession position at that date.",
  },
];

export default function PricePage() {
  const root = useRef(null);
  const { openEnquiry } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        gsap.from(q(".drv"), {
          autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".drv-grid")[0], start: "top 86%" },
        });

        gsap.from(q(".sheet-row"), {
          autoAlpha: 0, y: 18, duration: 0.7, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: q(".sheet")[0], start: "top 85%" },
        });

        gsap.from(q(".faq-row"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".faq")[0], start: "top 86%" },
        });

        gsap.from(q(".pr-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".pr-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".pr-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".pr-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Price | Price List Status, Sector 58 Gurgaon"
        description="M3M Brabus price is not yet publicly released. What will set the price of the 4 & 5 BHK residences, what the official price sheet covers, and how to receive it."
        path="/price"
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Price", path: "/price" }]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Price", path: "/price" }]} />
      <PageHeader
        eyebrow="M3M Brabus Price"
        title="The price is"
        accent="not out yet."
        lede={`M3M has not released pricing for Brabus — the official listing reads "${PROJECT.price}", and so does this page. Here is what will set the number, what the sheet will carry, and how to be among the first to see it.`}
      />

      {/* the status, stated plainly */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">Where pricing stands</span>
        </div>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="rise mono text-[0.6rem] tracking-[0.24em] text-ink-faint">Current status</p>
            <p className="rise mt-4 font-display text-[clamp(2.4rem,6vw,4rem)] font-light leading-[1] tracking-[-0.03em] text-ink">
              <span className="font-serif italic text-brass">{PROJECT.price}</span>
            </p>
            <p className="rise mt-6 max-w-[48ch] leading-relaxed text-ink-soft">
              No basic sale price, no per sq.ft rate and no payment plan have been published for
              {" "}{PROJECT.name} at this stage. Nor has a launch price been set out for either
              configuration. We publish only what {PROJECT.developer} has issued — where a figure
              does not exist officially, you will not find one invented here.
            </p>
            <p className="rise mt-4 max-w-[48ch] leading-relaxed text-ink-soft">
              The same applies to the two questions that usually follow. RERA is recorded as
              {" "}<span className="text-ink">{PROJECT.rera.toLowerCase()}</span>, and possession as
              {" "}<span className="text-ink">{PROJECT.possession.toLowerCase()}</span>. Ask us and we
              will tell you exactly where each stands on the day you ask.
            </p>
          </div>

          <dl className="rise self-start border-t border-line">
            {[
              { k: "Price", v: PROJECT.price },
              { k: "Payment plan", v: "Issued with the price sheet" },
              { k: "RERA", v: PROJECT.rera },
              { k: "Possession", v: PROJECT.possession },
              { k: "Configurations", v: PROJECT.configs },
              { k: "Residence sizes", v: PROJECT.sizes },
              { k: "Address", v: PROJECT.address },
            ].map((f) => (
              <div key={f.k} className="grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-8">
                <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{f.k}</dt>
                <dd className="text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* what will determine the price */}
      <section className="drv-grid container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">What will determine your number</span>
        </div>

        <div className="mb-10 overflow-x-auto">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-6 border-b border-line pb-4">
              <span className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">Priced separately</span>
              {RESIDENCES.map((r) => (
                <span key={r.id} className="font-display text-lg text-ink">{r.name}</span>
              ))}
            </div>
            <div className="drv grid grid-cols-[1.2fr_1fr_1fr] items-baseline gap-6 border-b border-line-soft py-4">
              <span className="mono text-[0.62rem] tracking-[0.14em] text-ink-faint">Saleable area</span>
              {RESIDENCES.map((r) => (
                <span key={r.id} className="text-sm text-ink">{r.area}</span>
              ))}
            </div>
            <div className="drv grid grid-cols-[1.2fr_1fr_1fr] items-baseline gap-6 border-b border-line-soft py-4">
              <span className="mono text-[0.62rem] tracking-[0.14em] text-ink-faint">Orientation</span>
              {RESIDENCES.map((r) => (
                <span key={r.id} className="text-sm text-ink">{r.facing}</span>
              ))}
            </div>
            <div className="drv grid grid-cols-[1.2fr_1fr_1fr] items-baseline gap-6 border-b border-line-soft py-4">
              <span className="mono text-[0.62rem] tracking-[0.14em] text-ink-faint">Price</span>
              {RESIDENCES.map((r) => (
                <span key={r.id} className="text-sm text-brass">{PROJECT.price}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {DRIVERS.map((d, i) => (
            <div key={d.k} className="drv group border-b border-line py-6">
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {d.k}
              </h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{d.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* request the price sheet */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid items-stretch gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-11">
            <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
            <div className="relative">
              <p className="rise kicker">Price request</p>
              <h2 className="rise mt-4 max-w-[16ch] font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                Be sent the sheet <span className="font-serif italic text-brass">the day it exists.</span>
              </h2>
              <p className="rise mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
                Register once and the private client team will send you the official price list,
                payment plan, charge schedule and floor plans the moment {PROJECT.developer} releases
                them — with the RERA and possession position stated as it stands on that date.
              </p>

              <div className="rise mt-9 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => openEnquiry("Price")}
                  data-cursor="OPEN"
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    Request the price sheet
                  </span>
                  <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                </button>
                <a
                  href={`tel:${PROJECT.phone}`}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                >
                  <Phone size={13} className="text-brass" />
                  {PROJECT.phone}
                </a>
              </div>

              <p className="rise mono mt-8 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
                No estimated rates are circulated · Official documents only
              </p>
            </div>
          </div>

          <figure className="pr-img-wrap relative min-h-[18rem] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="pr-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media src={px(IMG.lobby, 1400)} alt={`${PROJECT.name} — arrival lobby`} sizes="(max-width:1024px) 100vw, 42vw" />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_52%,rgba(8,6,5,0.68))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              {PROJECT.configs} · {PROJECT.location}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* what the price sheet will cover */}
      <section className="sheet container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">What the price sheet will carry</span>
        </div>
        <p className="mb-8 max-w-[58ch] leading-relaxed text-ink-soft">
          A luxury price list is never a single number. When the official sheet is issued it will be
          itemised roughly as below — each line explained to you before anything is signed. The
          amounts against them are not published today, so none are shown here.
        </p>
        <dl className="border-t border-line">
          {SHEET.map((s) => (
            <div key={s.t} className="sheet-row grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-10">
              <dt className="font-display text-lg text-ink">{s.t}</dt>
              <dd className="max-w-[60ch] text-sm leading-relaxed text-ink-soft">{s.d}</dd>
            </div>
          ))}
        </dl>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Line items are indicative of a standard schedule · Applicable charges and rates are
          confirmed only in the official price list
        </p>
      </section>

      {/* pricing FAQ */}
      <section className="faq container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">Pricing questions</span>
        </div>
        <div className="border-t border-line">
          {FAQ.map((f) => (
            <div key={f.q} className="faq-row grid grid-cols-1 gap-3 border-b border-line py-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
              <h3 className="max-w-[26ch] font-display text-xl leading-snug text-ink md:text-2xl">{f.q}</h3>
              <p className="max-w-[58ch] leading-relaxed text-ink-soft">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <RelatedPages links={["/residences", "/overview", "/contact"]} />
      <CtaBand title="Ask for the" accent="price list." subject="Price" />
    </div>
  );
}
