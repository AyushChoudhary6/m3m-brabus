import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { PROJECT } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Regulatory status. Nothing here is inferred — where the official listing
   does not publish a figure, the row says so. */
const STATUS = [
  { k: "RERA registration", v: PROJECT.rera },
  { k: "Regulator", v: "HARERA — Haryana Real Estate Regulatory Authority, Gurugram bench" },
  { k: "Portal", v: "haryanarera.gov.in" },
  { k: "Project", v: `${PROJECT.name} · ${PROJECT.configs}` },
  { k: "Developer", v: PROJECT.developer },
  { k: "Address", v: PROJECT.address },
  { k: "Possession", v: PROJECT.possession },
  { k: "Price", v: PROJECT.price },
];

const PROTECTIONS = [
  {
    t: "Carpet area is defined",
    d: "Under RERA, a home must be sold on carpet area — a single statutory definition — so the area you pay for is the area you can measure inside the walls.",
  },
  {
    t: "Funds are ring-fenced",
    d: "A registered project must hold a prescribed share of buyer collections in a separate account, to be drawn only against construction of that project.",
  },
  {
    t: "Committed timelines",
    d: "The declared completion date sits on the public record. Where a promoter misses it, the Act provides for interest or withdrawal at the allottee's option.",
  },
  {
    t: "Advertising is accountable",
    d: "Plans, layouts, approvals and sanctioned specifications filed with the Authority are the ones that bind — marketing material cannot quietly depart from them.",
  },
  {
    t: "A defect-liability window",
    d: "Structural and workmanship defects notified within the statutory period after handover are the promoter's to rectify.",
  },
  {
    t: "A forum for disputes",
    d: "Complaints go to the Authority and, on appeal, to the Appellate Tribunal — a specialist route rather than a general civil suit.",
  },
];

const VERIFY = [
  {
    n: "01",
    t: "Open the HARERA Gurugram portal",
    d: "Go to haryanarera.gov.in and choose the Gurugram authority. Sector 58 falls under the Gurugram bench, not Panchkula.",
  },
  {
    n: "02",
    t: "Search the registered-projects register",
    d: "Use the public project search. You can look by promoter name, by project name or by district and sector — search on the developer as well as the project, since the filed name can differ from the marketing name.",
  },
  {
    n: "03",
    t: "Read the project record end to end",
    d: "A registered project's page carries the registration number, its validity, the promoter details, the sanctioned plans and the declared completion date. Note the number exactly as written.",
  },
  {
    n: "04",
    t: "Check the quarterly progress filings",
    d: "Registered promoters file periodic updates on construction and on booking status. Reading two or three consecutive filings tells you more than any brochure.",
  },
  {
    n: "05",
    t: "Cross-check what you were shown",
    d: "Match the tower, block and unit in your proposal against the sanctioned layout on record. Anything that does not appear on the portal should be treated as not yet approved.",
  },
];

const DOCUMENTS = [
  "RERA registration certificate and the registration number, with its validity period",
  "Licence and building-plan approvals for the land parcel",
  "Approved layout and sanctioned floor plan for the specific unit",
  "Title report or land ownership documents for the project land",
  "Carpet-area statement for the residence, stated separately from built-up area",
  "The full cost sheet — base price, statutory charges, taxes and any other head",
  "Draft allotment letter and draft builder-buyer agreement, before any payment",
  "Payment plan with the construction-linked milestones written out",
  "Declared completion or possession date as filed with the Authority",
  "Specification schedule for the residence and the common areas",
  "Details of the escrow or designated project account for payments",
  "Receipts issued in the name of the registered project entity",
];

const FAQ_ITEMS = [
  {
    q: "What is the RERA number of M3M Brabus?",
    a: "The official M3M listing does not publish a RERA registration number for M3M Brabus at this stage — it is marked as on request. We do not publish a number we cannot source. Please enquire and we will share the registration status in writing as it stands, and you can confirm it independently on the HARERA portal.",
  },
  {
    q: "How do I verify M3M Brabus on the HARERA portal myself?",
    a: "Visit haryanarera.gov.in, select the Gurugram authority, and use the public search of registered projects. Search by the promoter name as well as the project name, since a project can be filed under a name that differs from its marketing name. Any registered project displays its registration number, validity, sanctioned plans and declared completion date.",
  },
  {
    q: "Should I pay a booking amount before a registration number is confirmed?",
    a: "Take no step on our word alone. Ask for the registration certificate, the licence and approvals, the draft agreement and the full cost sheet in writing, verify the record on the HARERA portal yourself, and take independent legal advice before committing any money.",
  },
];

export default function ReraPage() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        q(".sec").forEach((el) => {
          gsap.from(el.querySelectorAll(".sec-rise"), {
            autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.06,
            scrollTrigger: { trigger: el, start: "top 84%" },
          });
        });

        const wrap = q(".rera-img")[0];
        if (wrap) {
          gsap.set(wrap, { clipPath: "inset(100% 0 0 0)" });
          gsap.to(wrap, {
            clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power3.inOut",
            scrollTrigger: { trigger: wrap, start: "top 84%" },
          });
          gsap.to(q(".rera-img-inner"), {
            yPercent: 8, ease: "none",
            scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true },
          });
        }
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus RERA | Registration Status & How to Verify on HARERA"
        description="M3M Brabus RERA status — the official listing does not publish a registration number; it is shared on request. Here is what HARERA is, how to verify a Gurugram project on haryanarera.gov.in, and the documents to ask for."
        path="/rera"
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "RERA", path: "/rera" }]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "RERA", path: "/rera" }]} />
      <PageHeader
        eyebrow="08 · RERA"
        title="The record,"
        accent="stated plainly."
        lede={`${PROJECT.rera}. The official M3M listing does not publish a registration number for ${PROJECT.name} at this stage — so neither do we. Here is what that means, and how to verify the project yourself on the HARERA register.`}
      />

      {/* status */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">Registration status</span>
        </div>
        <dl className="border-t border-line">
          {STATUS.map((s) => (
            <div
              key={s.k}
              className="rise grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8"
            >
              <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{s.k}</dt>
              <dd className="text-ink">{s.v}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[60ch] text-sm leading-relaxed text-ink-soft">
          We publish only what the official listing carries. Where a figure has not been released — the
          registration number, the price, the possession date — this page says so rather than fill the
          gap. Ask us, and we will put the current position to you in writing.
        </p>
      </section>

      {/* what HARERA is */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">What HARERA is</span>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <h2 className="sec-rise max-w-[18ch] font-display text-[clamp(1.9rem,4vw,3rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
              A regulator, and{" "}
              <span className="font-serif italic text-brass">a public register.</span>
            </h2>
            <p className="sec-rise mt-6 max-w-[54ch] leading-relaxed text-ink-soft">
              The Real Estate (Regulation and Development) Act, 2016 — RERA — required every state to
              constitute an authority for the sector. Haryana's is HARERA, and it operates through two
              benches: Gurugram and Panchkula. A project in Sector 58, Gurugram falls to the Gurugram
              bench.
            </p>
            <p className="sec-rise mt-4 max-w-[54ch] leading-relaxed text-ink-soft">
              The Act's mechanism is disclosure. A promoter covered by it registers the project before
              advertising or selling, and files the licence, approvals, sanctioned plans, land title,
              declared completion date and periodic progress updates onto a register the public can
              read. The registration number is simply the key to that record — which is why it matters
              far more than the number itself does.
            </p>
            <p className="sec-rise mt-4 max-w-[54ch] leading-relaxed text-ink-soft">
              This page is general guidance on the framework, not legal advice. Verify the record
              yourself and take independent counsel before you commit.
            </p>
          </div>

          <figure className="rera-img relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="rera-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.arrival, 1400)}
                alt={`${PROJECT.name} — arrival court, ${PROJECT.location}`}
                sizes="(max-width:1024px) 100vw, 46vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <span className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              {PROJECT.address}
            </span>
          </figure>
        </div>
      </section>

      {/* protections */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">Why it matters to a buyer</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {PROTECTIONS.map((p) => (
            <div key={p.t} className="sec-rise group border-b border-line py-6">
              <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {p.t}
              </h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{p.d}</p>
            </div>
          ))}
        </div>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Indicative summary of the statutory framework — refer to the Act and HARERA rules for the operative text
        </p>
      </section>

      {/* how to verify */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">Verifying a project on HARERA</span>
        </div>
        <ol className="border-t border-line">
          {VERIFY.map((v) => (
            <li
              key={v.n}
              className="sec-rise group grid grid-cols-1 gap-2 border-b border-line py-6 transition-colors duration-500 hover:bg-brass/[0.035] sm:grid-cols-[minmax(0,3rem)_1fr] sm:gap-8"
            >
              <span className="idx">{v.n}</span>
              <div>
                <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                  {v.t}
                </h3>
                <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ink-soft">{v.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="sec-rise mt-6 max-w-[60ch] text-sm leading-relaxed text-ink-soft">
          We deliberately do not link to a project page or reproduce a registration number here — there is
          none published to reproduce. Search the register yourself; a result you found is worth more than
          a number we typed.
        </p>
      </section>

      {/* documents checklist */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">05</span>
          <span className="kicker">Documents to ask for</span>
        </div>
        <ul className="border-t border-line">
          {DOCUMENTS.map((d) => (
            <li
              key={d}
              className="sec-rise flex items-start gap-4 border-b border-line py-4 text-ink-soft"
            >
              <Check size={13} strokeWidth={2} className="mt-1.5 shrink-0 text-brass" />
              <span className="max-w-[70ch] leading-relaxed">{d}</span>
            </li>
          ))}
        </ul>
        <p className="sec-rise mt-6 max-w-[60ch] text-sm leading-relaxed text-ink-soft">
          Ask for every one of these in writing, and read the draft agreement before any payment. If a
          document cannot be produced, that is itself an answer worth having early.
        </p>
      </section>

      {/* faqs */}
      <section className="sec container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">06</span>
          <span className="kicker">RERA questions</span>
        </div>
        <dl className="border-t border-line">
          {FAQ_ITEMS.map((f) => (
            <div key={f.q} className="sec-rise border-b border-line py-6">
              <dt className="font-display text-xl text-ink md:text-2xl">{f.q}</dt>
              <dd className="mt-3 max-w-[68ch] leading-relaxed text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedPages links={["/overview", "/possession", "/reviews", "/contact"]} />

      <CtaBand title="Ask for the" accent="paperwork." subject="RERA" />
    </div>
  );
}
