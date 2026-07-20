import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Plus, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Magnetic from "../components/ui/Magnetic.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
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
  { k: "Price", v: PROJECT.price, n: "The official price sheet has not been released publicly." },
  { k: "Payment plan", v: "Not yet published", n: "No payment schedule, milestone breakdown or percentage split has been announced." },
  { k: "Booking amount", v: "Not yet published", n: "Shared by the developer's team at the time of allotment." },
  { k: "Possession", v: PROJECT.possession, n: "No possession date is stated on the official listing." },
  { k: "RERA", v: PROJECT.rera, n: "Registration details are confirmed on enquiry." },
  { k: "Configurations", v: PROJECT.configs, n: PROJECT.sizes },
];

/* Generic, educational descriptions of the plan structures commonly used
   across Indian luxury residential projects. Not this project's terms. */
const PLAN_TYPES = [
  {
    k: "01",
    t: "Construction-Linked Plan",
    tag: "Most common",
    d: "Payment is released in stages tied to verified construction milestones — excavation, structure, finishing and handover. The buyer pays as the building rises, which spreads the outflow across the build period and keeps each instalment linked to visible progress on site.",
    pts: ["Instalments follow build milestones", "Outflow spread over the construction period", "Each demand backed by site progress"],
  },
  {
    k: "02",
    t: "Possession-Linked Plan",
    tag: "Deferred weighting",
    d: "A smaller share is paid up front and the larger balance falls due at or close to possession. Buyers who are still paying rent, or who prefer to hold capital deployed elsewhere until handover, tend to favour this structure.",
    pts: ["Lower initial commitment", "Bulk of the consideration at handover", "Often carries a different headline rate"],
  },
  {
    k: "03",
    t: "Down-Payment Plan",
    tag: "Front-loaded",
    d: "A large proportion of the consideration is paid soon after booking. Because the developer receives funds early, this structure is usually the one that carries the most favourable pricing, at the cost of committing capital well ahead of handover.",
    pts: ["Highest up-front commitment", "Typically the keenest pricing", "Capital committed before handover"],
  },
  {
    k: "04",
    t: "Subvention & Flexi Structures",
    tag: "Availability varies",
    d: "Some developers offer hybrid or interest-subvention arrangements in partnership with lenders. Availability depends on the project, the lender and prevailing regulation, so these should always be confirmed in writing rather than assumed.",
    pts: ["Lender-dependent and project-dependent", "Terms change with regulation", "Confirm in writing before booking"],
  },
];

/* What sits alongside the headline price on any Indian residential purchase. */
const COST_HEADS = [
  { t: "Basic sale consideration", d: "The headline price for the residence itself, usually quoted per square foot of saleable area." },
  { t: "Preferential location charges", d: "Applied by some developers for floor rise, orientation or a particular view. Whether they apply here is confirmed on the official price sheet." },
  { t: "Club, parking & infrastructure", d: "One-time charges toward the clubhouse, dedicated parking and site infrastructure, quoted separately by most developers." },
  { t: "Statutory levies", d: "GST, stamp duty and registration are set by government and change from time to time — they are never part of a developer's quoted rate." },
  { t: "Maintenance & sinking fund", d: "Advance maintenance and a corpus for the common areas, typically collected before handover." },
];

const PAY_FAQS = [
  {
    q: "What is the payment plan for M3M Brabus?",
    a: "No payment plan has been published for M3M Brabus at this stage — pricing itself is still marked as coming soon on the official listing. We publish only what the developer has released, so we will not quote a schedule or percentage split until the official plan is out. Register your interest and the private client team will share the plan the moment it is announced.",
  },
  {
    q: "How do construction-linked and possession-linked plans differ?",
    a: "In general industry terms, a construction-linked plan releases payment in stages tied to verified construction milestones, spreading the outflow across the build period. A possession-linked plan takes a smaller amount up front and defers the larger balance to handover, which usually carries different pricing. These are descriptions of how such plans work across the Indian market and not a statement of this project's terms.",
  },
  {
    q: "Can a home loan be arranged for a purchase of this kind?",
    a: "Home loans for under-construction luxury residences are generally available from banks and housing finance companies, and lenders typically disburse in tranches that follow the developer's demand schedule. Eligibility, loan-to-value and interest rate are decided by the lender on your profile — not by the developer or by us. Once the official price and payment plan are released, the client team can point you to lenders empanelled for the project.",
  },
  {
    q: "What costs sit outside the headline price?",
    a: "Across the Indian market a residential purchase usually carries statutory levies such as GST, stamp duty and registration, along with club, parking, infrastructure and advance maintenance charges. Which of these apply, and at what rate, is set out on the official price sheet — please ask for it rather than work from an estimate.",
  },
];

export default function PaymentPlanPage() {
  const root = useRef(null);
  const { openEnquiry } = useEnquiry();
  const [open, setOpen] = useState(0);

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
        description="M3M Brabus payment plan status — no schedule has been published yet. Understand how construction-linked, possession-linked and down-payment structures work, and request the official plan for Sector 58, Gurugram."
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
        eyebrow="06 · Payment Plan"
        title="The plan is not"
        accent="published yet."
        lede={`${PROJECT.name} has not released a payment schedule, and pricing is still marked ${PROJECT.price.toLowerCase()}. Rather than guess, here is how such plans are usually structured — and how to receive the official one the day it is issued.`}
      />

      {/* published status */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">What is published today</span>
        </div>
        <dl className="border-t border-line">
          {STATUS.map((s) => (
            <div
              key={s.k}
              className="rise grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,12rem)_minmax(0,14rem)_1fr] sm:items-baseline sm:gap-8"
            >
              <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{s.k}</dt>
              <dd className="font-display text-lg text-ink">{s.v}</dd>
              <dd className="max-w-[52ch] text-sm leading-relaxed text-ink-soft">{s.n}</dd>
            </div>
          ))}
        </dl>
        <p className="mono mt-6 text-[0.58rem] leading-relaxed tracking-[0.2em] text-ink-faint">
          We publish only what the developer has released — no schedule, percentage or date is quoted until it is official
        </p>
      </section>

      {/* general industry context */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">General industry context</span>
        </div>

        <div className="mb-[clamp(2.5rem,6vh,4rem)] max-w-3xl border-l border-brass/40 py-1 pl-6">
          <p className="font-serif text-lg italic leading-relaxed text-brass">
            The four structures below describe how payment plans are commonly written across the
            Indian luxury residential market.
          </p>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
            They are offered as background for a first-time reader. None of them is a statement of
            the terms for {PROJECT.name}, and no structure below has been confirmed for this project.
            The only terms that count are the ones on the developer's official plan.
          </p>
        </div>

        <div className="border-t border-line">
          {PLAN_TYPES.map((p) => (
            <article
              key={p.t}
              className="pt group grid gap-6 border-b border-line py-[clamp(2rem,5vh,3rem)] md:grid-cols-[minmax(0,20rem)_1fr] md:gap-14"
            >
              <div>
                <span className="idx">{p.k}</span>
                <h2 className="mt-3 font-display text-2xl font-light leading-tight text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-3xl">
                  {p.t}
                </h2>
                <p className="mono mt-3 text-[0.58rem] tracking-[0.2em] text-ink-faint">{p.tag}</p>
              </div>
              <div>
                <p className="max-w-[58ch] leading-relaxed text-ink-soft">{p.d}</p>
                <ul className="mt-5 border-t border-line-soft">
                  {p.pts.map((x) => (
                    <li
                      key={x}
                      className="flex items-baseline justify-between gap-6 border-b border-line-soft py-2.5 text-sm text-ink-soft"
                    >
                      <span>{x}</span>
                      <span className="mono shrink-0 text-[0.55rem] tracking-[0.2em] text-brass/70">General</span>
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
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">What a price sheet usually itemises</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {COST_HEADS.map((c) => (
            <div key={c.t} className="ch group border-b border-line py-6">
              <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {c.t}
              </h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{c.d}</p>
            </div>
          ))}
        </div>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Heads listed are general to Indian residential purchases · applicability and rates are confirmed on the official sheet
        </p>
      </section>

      {/* request panel */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="req-panel relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-14">
          <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(32%_32%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="req kicker">Request the official plan</p>
              <h2 className="req mt-4 max-w-[16ch] font-display text-[clamp(1.9rem,4vw,3rem)] font-light leading-[1.03] tracking-[-0.02em] text-ink">
                Be first to receive{" "}
                <span className="font-serif italic text-brass">the payment plan.</span>
              </h2>
              <p className="req mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
                The price sheet and payment schedule for {PROJECT.name} will be issued by
                {" "}{PROJECT.developer}. Leave your details and the private client team will send the
                official documents, unedited, as soon as they are released — along with the
                {" "}{PROJECT.configs.toLowerCase()} of {PROJECT.sizes} at {PROJECT.location}.
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
                      Request the payment plan
                    </span>
                    <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                  </button>
                </Magnetic>
                <a
                  href={`tel:${PROJECT.phone}`}
                  className="mono text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                >
                  Or call {PROJECT.phone}
                </a>
              </div>
            </div>

            <dl className="req self-center border-t border-line">
              {[
                { k: "You will receive", v: "Official price sheet & payment plan" },
                { k: "Also shared", v: "Floor plans, brochure & RERA status" },
                { k: "Sent by", v: `${PROJECT.developer} · private client team` },
                { k: "Email", v: PROJECT.email },
              ].map((r) => (
                <div key={r.k} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,9rem)_1fr] sm:items-baseline sm:gap-6">
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
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">Payment & home loan questions</span>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {PAY_FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className={`font-display text-lg transition-colors md:text-xl ${isOpen ? "text-ink" : "text-ink-soft"}`}>
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={isOpen ? "text-brass" : "text-ink-faint"}
                  >
                    <Plus size={20} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 leading-relaxed text-ink-soft">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      <RelatedPages links={["/overview", "/residences", "/contact"]} />

      <CtaBand title="Ask for the" accent="official plan." subject="Payment Plan" />
    </div>
  );
}
