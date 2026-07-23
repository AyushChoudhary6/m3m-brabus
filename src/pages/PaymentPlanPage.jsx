import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import Accordion from "../components/ui/Accordion.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Magnetic from "../components/ui/Magnetic.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT } from "../lib/site.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ------------------------------------------------------------------
   IMPORTANT — no payment schedule has been published for M3M Brabus.
   Nothing below states this project's terms. The plan types are
   described as GENERAL INDIAN MARKET CONTEXT only, and every
   project-specific figure is drawn from PROJECT (site.js) or marked
   as not yet published.
------------------------------------------------------------------ */

const STATUS = [
  { tKeyK: "price.labelPrice", v: PROJECT.price, tKeyN: "payment.statusPriceN" },
  { tKeyK: "price.labelPaymentPlan", tKeyV: "payment.valNotPublished", tKeyN: "payment.statusPlanN" },
  { tKeyK: "payment.labelBookingAmount", tKeyV: "payment.valNotPublished", tKeyN: "payment.statusBookingN" },
  { tKeyK: "price.labelPossession", v: PROJECT.possession, tKeyN: "payment.statusPossessionN" },
  { tKeyK: "price.labelRera", v: PROJECT.rera, tKeyN: "payment.statusReraN" },
  { tKeyK: "price.labelConfigurations", v: PROJECT.configs, n: PROJECT.sizes },
];

/* Generic, educational descriptions of the plan structures commonly used
   across Indian luxury residential projects. Not this project's terms. */
const PLAN_TYPES = [
  {
    id: "clp",
    k: "01",
    tKeyT: "payment.plan1T",
    tKeyTag: "payment.plan1Tag",
    tKeyD: "payment.plan1D",
    pts: ["payment.plan1Pt1", "payment.plan1Pt2", "payment.plan1Pt3"],
  },
  {
    id: "plp",
    k: "02",
    tKeyT: "payment.plan2T",
    tKeyTag: "payment.plan2Tag",
    tKeyD: "payment.plan2D",
    pts: ["payment.plan2Pt1", "payment.plan2Pt2", "payment.plan2Pt3"],
  },
  {
    id: "dpp",
    k: "03",
    tKeyT: "payment.plan3T",
    tKeyTag: "payment.plan3Tag",
    tKeyD: "payment.plan3D",
    pts: ["payment.plan3Pt1", "payment.plan3Pt2", "payment.plan3Pt3"],
  },
  {
    id: "sub",
    k: "04",
    tKeyT: "payment.plan4T",
    tKeyTag: "payment.plan4Tag",
    tKeyD: "payment.plan4D",
    pts: ["payment.plan4Pt1", "payment.plan4Pt2", "payment.plan4Pt3"],
  },
];

/* What sits alongside the headline price on any Indian residential purchase. */
const COST_HEADS = [
  { tKeyT: "payment.cost1T", tKeyD: "payment.cost1D" },
  { tKeyT: "payment.cost2T", tKeyD: "payment.cost2D" },
  { tKeyT: "payment.cost3T", tKeyD: "payment.cost3D" },
  { tKeyT: "payment.cost4T", tKeyD: "payment.cost4D" },
  { tKeyT: "payment.cost5T", tKeyD: "payment.cost5D" },
];

const PAY_FAQS = [
  {
    q: "What is the payment plan for M3M Brabus?",
    a: "No payment plan has been published for M3M Brabus at this stage — pricing itself is still marked as coming soon on the official listing. We publish only what the developer has released, so we will not quote a schedule or percentage split until the official plan is out. Register your interest and the private client team will share the plan the moment it is announced.",
    tKeyQ: "payment.faq1Q",
    tKeyA: "payment.faq1A",
  },
  {
    q: "How do construction-linked and possession-linked plans differ?",
    a: "In general industry terms, a construction-linked plan releases payment in stages tied to verified construction milestones, spreading the outflow across the build period. A possession-linked plan takes a smaller amount up front and defers the larger balance to handover, which usually carries different pricing. These are descriptions of how such plans work across the Indian market and not a statement of this project's terms.",
    tKeyQ: "payment.faq2Q",
    tKeyA: "payment.faq2A",
  },
  {
    q: "Can a home loan be arranged for a purchase of this kind?",
    a: "Home loans for under-construction luxury residences are generally available from banks and housing finance companies, and lenders typically disburse in tranches that follow the developer's demand schedule. Eligibility, loan-to-value and interest rate are decided by the lender on your profile — not by the developer or by us. Once the official price and payment plan are released, the client team can point you to lenders empanelled for the project.",
    tKeyQ: "payment.faq3Q",
    tKeyA: "payment.faq3A",
  },
  {
    q: "What costs sit outside the headline price?",
    a: "Across the Indian market a residential purchase usually carries statutory levies such as GST, stamp duty and registration, along with club, parking, infrastructure and advance maintenance charges. Which of these apply, and at what rate, is set out on the official price sheet — please ask for it rather than work from an estimate.",
    tKeyQ: "payment.faq4Q",
    tKeyA: "payment.faq4A",
  },
];

export default function PaymentPlanPage() {
  const root = useRef(null);
  const { openEnquiry } = useEnquiry();
  const { t } = useI18n();
  const payFaqsLocalized = PAY_FAQS.map((f) => ({ q: t(f.tKeyQ), a: t(f.tKeyA) }));

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        q(".pt").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0, y: 28, duration: 0.95, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%" },
          });
        });

        gsap.from(q(".ch"), {
          autoAlpha: 0, y: 22, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".ch-grid")[0], start: "top 86%" },
        });

        gsap.from(q(".req"), {
          autoAlpha: 0, y: 26, duration: 1, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".req-panel")[0], start: "top 85%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Payment Plan | Official Schedule On Request, Sector 58 Gurgaon"
        description="M3M Brabus payment plan — no schedule is published yet. How construction-linked, possession-linked and down-payment structures work, and how to request it."
        path="/payment-plan"
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Payment Plan", path: "/payment-plan" }]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: PAY_FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Breadcrumbs
        trail={[{ name: "Home", path: "/" }, { name: "Payment Plan", path: "/payment-plan" }]}
      />
      <PageHeader
        eyebrow={t("payment.eyebrow")}
        title={t("payment.title")}
        accent={t("payment.accent")}
        lede={t("payment.lede").replace("{name}", PROJECT.name).replace("{price}", PROJECT.price.toLowerCase())}
      />

      {/* published status */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <dl className="border-t border-line">
          {STATUS.map((s) => (
            <div
              key={s.tKeyK}
              className="rise grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,12rem)_minmax(0,14rem)_1fr] sm:items-baseline sm:gap-8"
            >
              <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{t(s.tKeyK)}</dt>
              <dd className="font-display text-lg text-ink">{s.tKeyV ? t(s.tKeyV) : s.v}</dd>
              <dd className="max-w-[52ch] text-sm leading-relaxed text-ink-soft">{s.tKeyN ? t(s.tKeyN) : s.n}</dd>
            </div>
          ))}
        </dl>
        <p className="mono mt-6 text-[0.58rem] leading-relaxed tracking-[0.2em] text-ink-faint">
          {t("payment.footPublishOnly")}
        </p>
      </section>

      {/* general industry context */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">

        <div className="mb-[clamp(2.5rem,6vh,4rem)] max-w-3xl border-l border-brass/40 py-1 pl-6">
          <p className="font-serif text-lg italic leading-relaxed text-brass">
            {t("payment.introQuote")}
          </p>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
            {t("payment.introBody").replace("{name}", PROJECT.name)}
          </p>
        </div>

        <div className="border-t border-line">
          {PLAN_TYPES.map((p) => (
            <article
              key={p.id}
              className="pt group grid gap-6 border-b border-line py-[clamp(2rem,5vh,3rem)] md:grid-cols-[minmax(0,20rem)_1fr] md:gap-14"
            >
              <div>
                <span className="idx">{p.k}</span>
                <h2 className="mt-3 font-display text-2xl font-light leading-tight text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-3xl">
                  {t(p.tKeyT)}
                </h2>
                <p className="mono mt-3 text-[0.58rem] tracking-[0.2em] text-ink-faint">{t(p.tKeyTag)}</p>
              </div>
              <div>
                <p className="max-w-[58ch] leading-relaxed text-ink-soft">{t(p.tKeyD)}</p>
                <ul className="mt-5 border-t border-line-soft">
                  {p.pts.map((x) => (
                    <li
                      key={x}
                      className="flex items-baseline justify-between gap-6 border-b border-line-soft py-2.5 text-sm text-ink-soft"
                    >
                      <span>{t(x)}</span>
                      <span className="mono shrink-0 text-[0.55rem] tracking-[0.2em] text-brass/70">{t("payment.tagGeneral")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* cost heads */}
      <section className="ch-grid container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {COST_HEADS.map((c) => (
            <div key={c.tKeyT} className="ch group border-b border-line py-6">
              <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {t(c.tKeyT)}
              </h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{t(c.tKeyD)}</p>
            </div>
          ))}
        </div>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          {t("payment.footHeads")}
        </p>
      </section>

      {/* request panel */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="req-panel relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-14">
          <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(32%_32%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="req kicker">{t("payment.requestOfficial")}</p>
              <h2 className="req mt-4 max-w-[16ch] font-display text-[clamp(1.9rem,4vw,3rem)] font-light leading-[1.03] tracking-[-0.02em] text-ink">
                {t("payment.beFirst")}{" "}
                <span className="font-serif italic text-brass">{t("payment.thePaymentPlan")}</span>
              </h2>
              <p className="req mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
                {t("payment.requestBody")
                  .replace("{name}", PROJECT.name)
                  .replace("{developer}", PROJECT.developer)
                  .replace("{configs}", PROJECT.configs.toLowerCase())
                  .replace("{sizes}", PROJECT.sizes)
                  .replace("{location}", PROJECT.location)}
              </p>
              <div className="req mt-9 flex flex-wrap items-center gap-5">
                <Magnetic>
                  <button
                    type="button"
                    onClick={() => openEnquiry("Payment Plan")}
                    data-cursor="OPEN"
                    className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4"
                  >
                    <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                    <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                      {t("payment.requestBtn")}
                    </span>
                    <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                  </button>
                </Magnetic>
                <a
                  href={`tel:${PROJECT.phone}`}
                  className="mono text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                >
                  {t("cta.orCall")} {PROJECT.phone}
                </a>
              </div>
            </div>

            <dl className="req self-center border-t border-line">
              {[
                { id: "receive", k: t("payment.labelYouReceive"), v: t("payment.valReceiveDocs") },
                { id: "also", k: t("payment.labelAlsoShared"), v: t("payment.valAlsoShared") },
                { id: "sentby", k: t("payment.labelSentBy"), v: t("payment.valSentBy").replace("{developer}", PROJECT.developer) },
                { id: "email", k: t("payment.labelEmail"), v: PROJECT.email },
              ].map((r) => (
                <div key={r.id} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,9rem)_1fr] sm:items-baseline sm:gap-6">
                  <dt className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">{r.k}</dt>
                  <dd className="text-sm text-ink">{r.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* faqs */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        {/* Same rule as the homepage FAQ: the answers back the FAQPage JSON-LD
            above, so they are collapsed by height and never unmounted. */}
        <Accordion items={payFaqsLocalized} />
      </section>

      <RelatedPages links={["/overview", "/residences", "/contact"]} />

      <CtaBand title={t("price.ctaTitle")} accent={t("payment.ctaAccent")} subject="Payment Plan" />
    </div>
  );
}
