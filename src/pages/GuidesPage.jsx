import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, BookOpen, FileText, HelpCircle, Phone } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd, SITE_URL } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Fact from "../components/ui/Fact.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { POSTS } from "../lib/blog.js";
import { PROJECT } from "../lib/site.js";
import { PROJECT_FACT, PRICE } from "../lib/facts.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* This page is deliberately NOT a second blog index. /blogs is a library —
   six articles, sorted by date. This is the sequence: the order a buyer moves
   through, and where each article and each project page belongs in it.
   Nothing here carries a figure M3M has not published, and no stage is given
   a duration in weeks, because the timeline of a purchase depends on the
   documents being ready, not on a schedule we could pretend to know. */

/** Site destinations referenced by the stages. Labels live here rather than
 *  being imported, so a stage can name a page in its own terms. */
const PAGE = {
  "/overview": "Project overview",
  "/brabus": "The BRABUS partnership",
  "/location": "Location & connectivity",
  "/residences": "4 & 5 BHK residences",
  "/floor-plan": "Floor plans",
  "/master-plan": "Master plan",
  "/specifications": "Specifications",
  "/rera": "RERA status",
  "/construction-status": "Construction status",
  "/gallery": "Gallery",
  "/price": "Price",
  "/payment-plan": "Payment plan",
  "/possession": "Possession",
  "/contact": "Contact & site visit",
};

/* Articles are addressed by slug and resolved against POSTS at render time.
   If a slug is ever renamed the link disappears rather than 404s. */
const post = (slug) => POSTS.find((p) => p.slug === slug) || null;

const STAGES = [
  {
    id: "research",
    name: "Research",
    goal: "Decide what you are buying before you decide where.",
    body: `A branded residence, an under-construction tower and a resale apartment are three different purchases with three different risks. Settle the category first, then the corridor, then the project — in that order. Write down your own brief before a sales team writes one for you: the ceiling you will not cross, whether you need to move in or can wait out a build, and who in the household the home is actually being bought for.`,
    ask: [
      "What does the brand partnership actually cover — architecture, interiors, fit-out, service, or the name alone?",
      "Is the infrastructure around the address delivered, under construction, or only sanctioned?",
      "Am I comparing quotes on saleable area or carpet area? They are not the same number.",
      "Would I still want this home if the brand were removed from it?",
    ],
    docs: [
      "The developer's own listing for the project — the only source that binds them",
      "The published brochure and specification sheet",
      "The promoter's other registrations on the HARERA public register",
    ],
    pages: ["/overview", "/brabus", "/location"],
    posts: ["branded-residences-explained", "golf-course-extension-road-guide"],
  },
  {
    id: "shortlist",
    name: "Shortlist",
    goal: "Narrow to a configuration, not just to a project.",
    body: `Most buyers arrive at a shortlist of projects and leave the unit decision to the site visit. Reverse it. Choose the configuration on paper — where a room's purpose is clear and a corridor's cost is visible — and the visit becomes a verification rather than a discovery. At ${PROJECT.name} the choice is between two homes, ${PROJECT.configs}, running ${PROJECT.sizes}. The gap between them is a room, a service arrangement and a running cost.`,
    ask: [
      "What job does each room do? A fifth bedroom that becomes storage was an expensive decision.",
      "What is the carpet-to-saleable ratio of this specific unit, in writing?",
      "Which floors, aspects and corner positions attract a premium, and what is the premium called on the sheet?",
      "What is fitted at handover and what is an owner's cost — kitchen appliances, wardrobes, light fittings?",
    ],
    docs: [
      "Dimensioned floor plan for the exact unit, not a typical-floor illustration",
      "Unit-wise area statement showing carpet, built-up and saleable area",
      "Specification annexure naming brands, or the substitution clause that lets them change",
      "Master plan showing where the tower sits and which phase it belongs to",
    ],
    pages: ["/floor-plan", "/residences", "/specifications", "/master-plan"],
    posts: ["4-bhk-vs-5-bhk-which-to-buy"],
  },
  {
    id: "verify",
    name: "Verify",
    goal: "Establish that the thing being sold legally exists.",
    body: `This is the stage buyers most often skip and most often regret. Before any money moves, confirm the project's registration on the HARERA portal yourself — not from a screenshot, from the portal — and read what the promoter has declared there. The registration record carries the promoter's own completion date, the sanctioned plans and any complaints filed. It is the one account of the project the developer did not write for you.`,
    ask: [
      "Is the tower I am buying inside the registered phase, or in a phase yet to be registered?",
      "What completion date has the promoter declared to the authority — and does it match what I was told?",
      "Is the land title clear, and is the licence in the promoter's name?",
      "Are there complaints or orders against this promoter on the portal?",
      "Who is the confirming party on the agreement, and are they the licence holder?",
    ],
    docs: [
      "HARERA registration certificate and the project's page on the public register",
      "Licence and approved building plans from the competent authority",
      "Title report and encumbrance position on the land",
      "Draft agreement for sale, requested before booking rather than after",
    ],
    pages: ["/rera", "/construction-status"],
    posts: ["rera-checklist-before-booking-in-gurgaon"],
  },
  {
    id: "visit",
    name: "Visit",
    goal: "Test the claims the drawings cannot make.",
    body: `Renders are honest about finish and silent about context. A site visit exists to answer what a plan cannot: what the approach road is like at the hour you would actually use it, what the outlook from your floor really faces, where the generators and the service entry sit relative to your bedroom. Go twice if you can, and make one of the visits a weekday evening — the corridor behaves differently at half past seven than it does at eleven in the morning.`,
    ask: [
      "Am I standing in an experience centre or in the building I am buying?",
      "What will be built on the plot my windows currently overlook?",
      "Where are the DG sets, the transformer yard, the service lift and the waste room?",
      "Which phase does the clubhouse fall in, and will it be open when I take possession?",
      "How long does the drive I would make every morning actually take, made at that hour?",
    ],
    docs: [
      "Current construction status report for the tower, dated",
      "Phasing plan showing what is built, what is under way and what is future",
      "Sample unit specification card, to compare against the specification annexure",
    ],
    pages: ["/construction-status", "/gallery", "/contact"],
    posts: ["what-to-check-during-a-site-visit"],
    visit: true,
  },
  {
    id: "book",
    name: "Negotiate & book",
    goal: "Price the whole cost, not the headline.",
    body: `A luxury quotation is a stack of lines, and only the first of them is the apartment. Ask for the complete cost sheet with every charge named — preferential location, parking, club membership, maintenance security, statutory taxes, stamp duty and registration — and compare offers on total outlay rather than on the per sq.ft figure. Then compare payment plans the same way: a construction-linked schedule and a down-payment schedule rarely cost the same amount for the same home.`,
    ask: [
      "What is in the basic sale price and what is billed separately?",
      "Is this quote valid to a date, and what happens to it if I take a week to decide?",
      "What exactly is refundable if I withdraw after booking but before the agreement is executed?",
      "How is GST treated on each line, and at what point is it charged?",
      "If I am buying from abroad, which account must the funds come from, and who deducts tax at source?",
    ],
    docs: [
      "Itemised cost sheet on the developer's letterhead",
      "Payment plan with each milestone and the amount due against it",
      "Booking application form and the receipt for the booking amount",
      "Allotment letter naming the exact unit, floor, tower and area",
    ],
    pages: ["/price", "/payment-plan"],
    posts: ["nri-guide-to-buying-property-in-gurgaon"],
  },
  {
    id: "agreement",
    name: "Agreement",
    goal: "Read the document that will actually govern the purchase.",
    body: `The brochure is marketing; the agreement for sale is the contract. Everything you were told at the sales desk is worth precisely as much as its equivalent clause. Have the draft read by your own advocate, not the developer's, and treat any refusal to share the draft before booking as information in itself. Register the agreement and pay the stamp duty — an unregistered agreement is a weak instrument in a dispute.`,
    ask: [
      "What possession date is written into the agreement, and how is delay compensated — at what rate, from when?",
      "What happens if the final area differs from the allotted area, and is there a cap on the change?",
      "Can specifications be substituted, and does the clause require equivalence or merely the developer's discretion?",
      "What are the cancellation and forfeiture terms, on both sides?",
      "May I assign or resell before possession, and what transfer charge applies?",
      "Which taxes, escalations and statutory increases pass to me?",
    ],
    docs: [
      "Agreement for sale in the form prescribed under the Act",
      "Annexures: payment schedule, specifications, dimensioned floor plan, common areas",
      "Stamp duty payment and registration of the agreement",
      "Loan sanction letter and the lender's tripartite arrangement, if financing",
    ],
    pages: ["/possession", "/specifications", "/rera"],
    posts: ["branded-residences-explained", "rera-checklist-before-booking-in-gurgaon"],
  },
  {
    id: "handover",
    name: "Handover",
    goal: "Take delivery of what was promised, in writing.",
    body: `Possession is a process, not a day. It begins with the occupation certificate, moves through a snagging inspection you should attend with someone who knows what to look for, and ends with conveyance and the handing over of the maintenance relationship. Do not sign the possession letter and the snag list in the same breath: record the defects first, agree the window for rectification, then accept. The statutory defect liability period runs for five years from handover under the Act — knowing that changes how carefully you inspect in year one.`,
    ask: [
      "Has the occupation certificate been granted for this tower, and may I see it?",
      "How long is the rectification window on the snag list, and what is the escalation if it lapses?",
      "Does the final statement reconcile every instalment, adjustment and area variation?",
      "What is the maintenance rate per sq.ft, what does it cover, and how is the interest-free security accounted for?",
      "What warranties transfer to me — fit-out, appliances, waterproofing, systems?",
    ],
    docs: [
      "Occupation certificate",
      "Possession letter and the signed snag list, kept as separate documents",
      "Final statement of account and no-dues confirmation",
      "Conveyance deed, registered",
      "Maintenance agreement and warranty documents",
    ],
    pages: ["/possession", "/construction-status"],
    posts: ["what-to-check-during-a-site-visit"],
  },
];

/* The three answers that gate stages three, five and six of this path for
   this project today. Rendered through <Fact> so an unpublished figure
   becomes a request rather than a guess. */
const GATED = [PRICE, PROJECT_FACT.rera, PROJECT_FACT.possession];

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Buyer Guides", path: "/guides" },
];

export default function GuidesPage() {
  const root = useRef(null);
  const { openEnquiry, openBrochure, openVisit } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 88%" },
        });

        gsap.from(q(".rail-item"), {
          autoAlpha: 0, y: 16, duration: 0.7, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: q(".rail")[0], start: "top 88%" },
        });

        /* Each stage animates against its own trigger — the list is long
           enough that one shared trigger would fire everything off-screen. */
        q(".stage").forEach((el) => {
          gsap.from(el.querySelectorAll(".stage-part"), {
            autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.07,
            scrollTrigger: { trigger: el, start: "top 84%" },
          });
        });

        gsap.from(q(".gate-row"), {
          autoAlpha: 0, y: 18, duration: 0.8, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".gate")[0], start: "top 86%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div className="bg-canvas" ref={root}>
      <Seo
        title="M3M Brabus Buyer Guides | Research to Handover, Step by Step"
        description="A staged buyer's guide to M3M Brabus, Sector 58 Gurgaon — research, verify, visit, book and handover, with the questions to ask at each step."
        path="/guides"
        jsonLd={[
          breadcrumbLd(TRAIL),
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to buy at ${PROJECT.name} — a staged buyer's guide`,
            description:
              "The seven stages of an under-construction luxury purchase in Gurugram, from research through to handover, with the questions and documents that belong to each.",
            url: `${SITE_URL}/guides`,
            inLanguage: "en-IN",
            step: STAGES.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.name,
              text: s.goal,
              url: `${SITE_URL}/guides#${s.id}`,
            })),
          },
        ]}
      />
      <Breadcrumbs trail={TRAIL} />
      <PageHeader
        compact
        eyebrow="M3M Brabus Buyer Guides"
        title="The path, in"
        accent="the order you walk it."
        lede="Seven stages between first curiosity and the keys. Each one sets out what to accomplish, the questions worth asking aloud, the documents to have in hand — and where on this site, or in the articles, the detail lives."
      />

      {/* how this differs from the blog, plus the jump rail */}
      <section className="rail container-lux pb-[clamp(3.5rem,10vh,6rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">How to use this</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="rise max-w-[52ch] leading-relaxed text-ink-soft">
              The articles under <Link to="/blogs" className="text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:text-brass-soft">Blogs</Link>{" "}
              explain subjects. This page sequences them. A purchase of this size fails in a
              predictable way — the diligence that should have happened at stage three gets
              attempted at stage six, when the booking amount is already paid and the leverage has
              gone. Work the stages in order and each one narrows the decision before the next one
              costs you anything.
            </p>
            <p className="rise mt-5 max-w-[52ch] leading-relaxed text-ink-soft">
              No stage here is given a duration. How long a purchase takes depends on when documents
              are issued and how quickly your advocate reads them, not on a schedule anyone could
              publish in advance. What is fixed is the order.
            </p>
          </div>

          <nav aria-label="Jump to a stage" className="rise self-start border-t border-line">
            {STAGES.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                data-cursor="VIEW"
                className="rail-item group flex items-baseline gap-6 border-b border-line py-4 transition-colors duration-500 hover:bg-brass/[0.035] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass-soft">
                  {s.name}
                </span>
                <span className="mono ml-auto hidden max-w-[24ch] text-right text-[0.58rem] leading-relaxed tracking-[0.14em] text-ink-faint sm:block">
                  {s.goal}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* the seven stages */}
      <section className="container-lux pb-[clamp(3rem,8vh,5rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">The seven stages</span>
        </div>

        <div className="border-t border-line">
          {STAGES.map((s, i) => {
            const articles = s.posts.map(post).filter(Boolean);
            return (
              <article
                key={s.id}
                id={s.id}
                className="stage scroll-mt-28 border-b border-line py-[clamp(2.5rem,6vh,4rem)]"
              >
                <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                  <div className="stage-part lg:sticky lg:top-28 lg:self-start">
                    <span className="idx">Stage {String(i + 1).padStart(2, "0")}</span>
                    <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-light leading-[1.03] tracking-[-0.02em] text-ink">
                      {s.name}
                    </h2>
                    <p className="mt-4 max-w-[30ch] font-serif text-lg italic leading-snug text-brass">
                      {s.goal}
                    </p>
                  </div>

                  <div>
                    <p className="stage-part max-w-[62ch] leading-relaxed text-ink-soft">{s.body}</p>

                    <div className="stage-part mt-9 grid gap-8 sm:grid-cols-2">
                      <div>
                        <p className="mono flex items-center gap-2 text-[0.58rem] tracking-[0.2em] text-ink-faint">
                          <HelpCircle size={13} className="text-brass" aria-hidden="true" />
                          Ask, out loud
                        </p>
                        <ul className="mt-4 space-y-3">
                          {s.ask.map((a) => (
                            <li key={a} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                              <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-brass/60" />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="mono flex items-center gap-2 text-[0.58rem] tracking-[0.2em] text-ink-faint">
                          <FileText size={13} className="text-brass" aria-hidden="true" />
                          On the table
                        </p>
                        <ul className="mt-4 space-y-3">
                          {s.docs.map((d) => (
                            <li key={d} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                              <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-brass/60" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="stage-part mt-9 flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-line-soft pt-6">
                      <span className="mono w-full text-[0.58rem] tracking-[0.2em] text-ink-faint sm:w-auto">
                        Go to
                      </span>
                      {s.pages.map((p) => (
                        <Link
                          key={p}
                          to={p}
                          data-cursor="ENTER"
                          className="group inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 font-sans text-[0.68rem] tracking-[0.06em] text-ink-soft transition-colors duration-500 hover:border-brass/50 hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                        >
                          {PAGE[p] || p}
                          <ArrowUpRight size={13} className="text-brass transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      ))}
                      {articles.map((a) => (
                        <Link
                          key={a.slug}
                          to={`/blogs/${a.slug}`}
                          data-cursor="READ"
                          className="group inline-flex items-center gap-1.5 rounded-full border border-brass/25 bg-brass/[0.05] px-4 py-2 font-sans text-[0.68rem] tracking-[0.06em] text-brass-soft transition-colors duration-500 hover:border-brass/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                        >
                          <BookOpen size={13} className="text-brass" aria-hidden="true" />
                          {a.title}
                          <span className="mono text-[0.55rem] tracking-[0.14em] text-ink-faint">
                            {a.readMins} min
                          </span>
                        </Link>
                      ))}
                    </div>

                    {s.visit && (
                      <button
                        type="button"
                        onClick={() => openVisit("Guides — site visit")}
                        data-cursor="BOOK"
                        className="stage-part group mt-7 inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
                      >
                        Book a site visit
                        <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* where this particular project sits on the path today */}
      <section className="gate container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">Where {PROJECT.name} sits on this path today</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="rise max-w-[54ch] leading-relaxed text-ink-soft">
              Stages one, two and four can be worked through now: the configuration, the
              specification, the address and the site are all things you can examine today. Stages
              three, five and six wait on documents {PROJECT.developer} has not yet released — and
              rather than fill those gaps with an estimate, we say so and send you the real papers
              the day they exist.
            </p>
            <p className="rise mt-5 max-w-[54ch] leading-relaxed text-ink-soft">
              That is not a delay to work around. It is the reason to do stages one, two and four
              properly first, so that when the price sheet, the registration record and the draft
              agreement arrive, you already know exactly which unit you are reading them against.
            </p>
          </div>

          <div className="self-start border-t border-line">
            {GATED.map((f) => (
              <div key={f.key} className="gate-row border-b border-line py-6">
                <Fact fact={f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* the checklist, gated */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-12">
          <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <p className="rise kicker">The checklist</p>
              <h2 className="rise mt-4 max-w-[18ch] font-display text-[clamp(1.9rem,3.8vw,2.8rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                Take the seven stages <span className="font-serif italic text-brass">with you.</span>
              </h2>
              <p className="rise mt-5 max-w-[48ch] leading-relaxed text-ink-soft">
                The same sequence as a single document — every question and every paper listed
                stage by stage, with space to record answers on the day. Sent with the brochure,
                the floor plans and the specification sheet, so the checklist and the drawings
                arrive together.
              </p>

              <div className="rise mt-9 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => openBrochure("Guides")}
                  data-cursor="DOWNLOAD"
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    Get the buyer checklist
                  </span>
                  <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                </button>
                <button
                  type="button"
                  onClick={() => openEnquiry("Buyer checklist")}
                  className="group inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                >
                  Ask a question first
                  <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
                <a
                  href={`tel:${PROJECT.phone}`}
                  aria-label={`Call the private client team on ${PROJECT.phone}`}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                >
                  <Phone size={13} className="text-brass" aria-hidden="true" />
                  {PROJECT.phone}
                </a>
              </div>
            </div>

            <ol className="rise self-start border-t border-line">
              {STAGES.map((s, i) => (
                <li
                  key={s.id}
                  className="flex items-baseline gap-5 border-b border-line py-3.5 text-sm text-ink-soft"
                >
                  <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-ink">{s.name}</span>
                  <span className="mono ml-auto text-[0.55rem] tracking-[0.16em] text-ink-faint">
                    {s.ask.length + s.docs.length} items
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <p className="mono relative mt-9 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
            General guidance for a Gurugram purchase · Not legal or tax advice · Verify every
            document with your own advocate
          </p>
        </div>
      </section>

      <RelatedPages links={["/blogs", "/faqs", "/rera"]} />
      <CtaBand title="Walk it with" accent="someone who has." subject="Guides" />
    </div>
  );
}
