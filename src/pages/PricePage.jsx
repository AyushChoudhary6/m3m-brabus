import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Phone, Download } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { track } from "../lib/analytics.js";
import { PROJECT, RESIDENCES, FAQS } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* No figure on this page is invented. M3M has not released pricing for
   Brabus, so the page explains how the price will be built rather than
   guessing at it. */

const DRIVERS = [
  {
    tKeyK: "price.driverConfigK",
    tKeyD: "price.driverConfigD",
  },
  {
    tKeyK: "price.saleableArea",
    tKeyD: "price.driverAreaD",
  },
  {
    tKeyK: "price.driverInventoryK",
    tKeyD: "price.driverInventoryD",
  },
  {
    tKeyK: "price.driverPlanK",
    tKeyD: "price.driverPlanD",
  },
];

/* The cost sheet, split the way it is actually settled: what the developer
   charges, and what the state collects through the transaction. The split is
   the point — it is where "all-inclusive" quotes quietly stop. Order follows
   how a Gurugram sheet is typed up: unit cost, then premiums, then deposits. */
const DEVELOPER_LINES = [
  { tKeyT: "price.lineBasicT", tKeyD: "price.lineBasicD" },
  { tKeyT: "price.lineLocationT", tKeyD: "price.lineLocationD" },
  { tKeyT: "price.lineFloorRiseT", tKeyD: "price.lineFloorRiseD" },
  { tKeyT: "price.lineClubT", tKeyD: "price.lineClubD" },
  { tKeyT: "price.lineIfmsT", tKeyD: "price.lineIfmsD" },
  { tKeyT: "price.lineParkingT", tKeyD: "price.lineParkingD" },
  { tKeyT: "price.linePowerT", tKeyD: "price.linePowerD" },
];

const STATUTORY_LINES = [
  { tKeyT: "price.lineStampT", tKeyD: "price.lineStampD" },
  { tKeyT: "price.lineGstT", tKeyD: "price.lineGstD" },
];

const PRICE_FAQ = FAQS.find((f) => f.q === "What is the price of M3M Brabus?");

const FAQ = [
  ...(PRICE_FAQ ? [PRICE_FAQ] : []),
  {
    q: "Why does this page not quote a per sq.ft rate?",
    a: `Because M3M has not published one. The official listing records the price as "${PROJECT.price}", and so do we. Any rate you find quoted elsewhere for this project is an estimate, not an official figure — we would rather send you the real sheet a little later than an invented one today.`,
    tKeyQ: "price.faq1Q",
    tKeyA: "price.faq1A",
  },
  {
    q: "How do I get the price the moment it is released?",
    a: "Register your interest with the private client team. You will be sent the price sheet, the payment plan and the charge schedule as soon as they are officially issued, along with the RERA and possession position at that date.",
    tKeyQ: "price.faq2Q",
    tKeyA: "price.faq2A",
  },
];

export default function PricePage() {
  const root = useRef(null);
  const { openEnquiry, openBrochure } = useEnquiry();
  const { t } = useI18n();

  /* Every price CTA is a lead, so each one is labelled before it fires. */
  const cta = (label, run) => () => {
    track("cta_click", { location: "price_page", label });
    run();
  };

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
        title={t("price.title")}
        accent={t("price.accent")}
        lede={t("price.lede").replace("{price}", PROJECT.price)}
      />

      {/* the status, stated plainly */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="rise mono text-[0.6rem] tracking-[0.24em] text-ink-faint">{t("price.currentStatus")}</p>
            <p className="rise mt-4 font-display text-[clamp(2.4rem,6vw,4rem)] font-light leading-[1] tracking-[-0.03em] text-ink">
              <span className="font-serif italic text-brass">{PROJECT.price}</span>
            </p>
            <p className="rise mt-6 max-w-[48ch] leading-relaxed text-ink-soft">
              {t("price.statusNoPrice").replace("{name}", PROJECT.name).replace("{developer}", PROJECT.developer)}
            </p>
            <p className="rise mt-4 max-w-[48ch] leading-relaxed text-ink-soft">
              {t("price.statusReraPart1")}
              {" "}<span className="text-ink">{PROJECT.rera.toLowerCase()}</span>{t("price.statusReraPart2")}
              {" "}<span className="text-ink">{PROJECT.possession.toLowerCase()}</span>{t("price.statusReraPart3")}
            </p>
          </div>

          <dl className="rise self-start border-t border-line">
            {[
              { id: "price", k: t("price.labelPrice"), v: PROJECT.price },
              { id: "plan", k: t("price.labelPaymentPlan"), v: t("price.valIssuedWithSheet") },
              { id: "rera", k: t("price.labelRera"), v: PROJECT.rera },
              { id: "possession", k: t("price.labelPossession"), v: PROJECT.possession },
              { id: "configs", k: t("price.labelConfigurations"), v: PROJECT.configs },
              { id: "sizes", k: t("price.labelResidenceSizes"), v: PROJECT.sizes },
              { id: "address", k: t("price.labelAddress"), v: PROJECT.address },
            ].map((f) => (
              <div key={f.id} className="grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-8">
                <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{f.k}</dt>
                <dd className="text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* what will determine the price */}
      <section className="drv-grid container-lux pb-[clamp(4rem,11vh,7rem)]">

        <div className="mb-10 overflow-x-auto">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-6 border-b border-line pb-4">
              <span className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{t("price.pricedSeparately")}</span>
              {RESIDENCES.map((r) => (
                <span key={r.id} className="font-display text-lg text-ink">{r.name}</span>
              ))}
            </div>
            <div className="drv grid grid-cols-[1.2fr_1fr_1fr] items-baseline gap-6 border-b border-line-soft py-4">
              <span className="mono text-[0.62rem] tracking-[0.14em] text-ink-faint">{t("price.saleableArea")}</span>
              {RESIDENCES.map((r) => (
                <span key={r.id} className="text-sm text-ink">{r.area}</span>
              ))}
            </div>
            <div className="drv grid grid-cols-[1.2fr_1fr_1fr] items-baseline gap-6 border-b border-line-soft py-4">
              <span className="mono text-[0.62rem] tracking-[0.14em] text-ink-faint">{t("price.orientation")}</span>
              {RESIDENCES.map((r) => (
                <span key={r.id} className="text-sm text-ink">{r.facing}</span>
              ))}
            </div>
            <div className="drv grid grid-cols-[1.2fr_1fr_1fr] items-baseline gap-6 border-b border-line-soft py-4">
              <span className="mono text-[0.62rem] tracking-[0.14em] text-ink-faint">{t("price.labelPrice")}</span>
              {RESIDENCES.map((r) => (
                <span key={r.id} className="text-sm text-brass">{PROJECT.price}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {DRIVERS.map((d, i) => (
            <div key={d.tKeyK} className="drv group border-b border-line py-6">
              <h2 className="mt-3 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {t(d.tKeyK)}
              </h2>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{t(d.tKeyD).replace("{sizes}", PROJECT.sizes)}</p>
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
              <h2 className="rise mt-4 max-w-[16ch] font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                {t("price.beSentSheet")} <span className="font-serif italic text-brass">{t("price.dayItExists")}</span>
              </h2>
              <p className="rise mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
                {t("price.requestBody").replace("{developer}", PROJECT.developer)}
              </p>

              {/* Three ways to act. Deliberately NOT labelled "download price list":
                  the page's whole argument is that no price list exists yet, and a
                  button promising one would undo it. The gated PDF that does exist
                  is offered for what it actually contains. */}
              <div className="rise mt-9 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={cta("cost_sheet", () => openEnquiry("Cost sheet"))}
                  data-cursor="OPEN"
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    {t("price.requestCostSheet")}
                  </span>
                  <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                </button>
                <button
                  type="button"
                  onClick={cta("brochure", () => openBrochure("Price page"))}
                  data-cursor="DOWNLOAD"
                  className="group inline-flex items-center gap-2.5 rounded-full border border-line px-7 py-4 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors duration-500 hover:border-brass/50 hover:text-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  <Download size={14} className="animate-bounce text-brass group-hover:animate-none" />
                  {t("price.brochureFloorPlans")}
                </button>
                <a
                  href={`tel:${PROJECT.phone}`}
                  onClick={() => track("cta_click", { location: "price_page", label: "call" })}
                  aria-label={t("price.talkConsultantAria").replace("{phone}", PROJECT.phone)}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                >
                  <Phone size={13} className="text-brass" />
                  {t("price.talkConsultant")} · {PROJECT.phone}
                </a>
              </div>

              <p className="rise mono mt-8 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
                {t("price.noEstimatedRates")}
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
        <p className="mb-10 max-w-[62ch] leading-relaxed text-ink-soft">
          {t("price.sheetIntro")}
        </p>

        <p className="mono text-[0.56rem] tracking-[0.2em] text-brass">{t("price.chargedByDeveloper")}</p>
        <dl className="mt-4 border-t border-line">
          {DEVELOPER_LINES.map((l, i) => (
            <div
              key={l.tKeyT}
              className="sheet-row grid grid-cols-1 gap-x-10 gap-y-2 border-b border-line py-5 sm:grid-cols-[minmax(0,15rem)_1fr_auto]"
            >
              <dt className="flex items-baseline gap-3 font-display text-lg font-light leading-snug text-ink">
                {t(l.tKeyT)}
              </dt>
              <dd className="max-w-[58ch] text-sm leading-relaxed text-ink-soft">{t(l.tKeyD)}</dd>
              <dd className="mono self-baseline text-[0.56rem] tracking-[0.18em] text-ink-faint sm:text-right">
                {t("price.onRequest")}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mono mt-12 text-[0.56rem] tracking-[0.2em] text-brass">{t("price.payableToGovt")}</p>
        <dl className="mt-4 border-t border-line">
          {STATUTORY_LINES.map((l, i) => (
            <div
              key={l.tKeyT}
              className="sheet-row grid grid-cols-1 gap-x-10 gap-y-2 border-b border-line py-5 sm:grid-cols-[minmax(0,15rem)_1fr_auto]"
            >
              <dt className="flex items-baseline gap-3 font-display text-lg font-light leading-snug text-ink">
                {t(l.tKeyT)}
              </dt>
              <dd className="max-w-[58ch] text-sm leading-relaxed text-ink-soft">{t(l.tKeyD)}</dd>
              <dd className="mono self-baseline text-[0.56rem] tracking-[0.18em] text-ink-faint sm:text-right">
                {t("price.atPrevailingRate")}
              </dd>
            </div>
          ))}
        </dl>

        {/* the distinction that decides whether two quotes are even comparable —
            the most useful thing a buyer can take away from this page */}
        <div className="rise mt-12 rounded-[1.25rem] border border-line bg-cream p-6 md:p-9">
          <h3 className="max-w-[34ch] font-display text-xl font-light leading-snug text-ink md:text-2xl">
            {t("price.calloutTitle")}
          </h3>
          <p className="mt-4 max-w-[64ch] leading-relaxed text-ink-soft">
            {t("price.calloutBody")}
          </p>
        </div>

        <div className="rise mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link
            to="/payment-plan"
            className="group inline-flex items-center gap-2 border-b border-brass/40 pb-1 font-sans text-[0.7rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass"
          >
            {t("price.whenInstalmentDue")}
            <ArrowUpRight size={13} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <p className="mono mt-8 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
          {t("price.sheetFootnote").replace("{name}", PROJECT.name).replace("{developer}", PROJECT.developer)}
        </p>
      </section>

      {/* pricing FAQ */}
      <section className="faq container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="border-t border-line">
          {FAQ.map((f) => (
            <div key={f.q} className="faq-row grid grid-cols-1 gap-3 border-b border-line py-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
              <h3 className="max-w-[26ch] font-display text-xl leading-snug text-ink md:text-2xl">{f.tKeyQ ? t(f.tKeyQ) : f.q}</h3>
              <p className="max-w-[58ch] leading-relaxed text-ink-soft">{f.tKeyA ? t(f.tKeyA).replace("{price}", PROJECT.price) : f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <RelatedPages links={["/payment-plan", "/residences", "/contact"]} />
      <CtaBand title={t("price.ctaTitle")} accent={t("price.ctaAccent")} subject="Price" />
    </div>
  );
}
