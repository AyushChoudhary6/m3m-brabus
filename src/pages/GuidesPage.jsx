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
import { useI18n } from "../lib/i18n.jsx";

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
  "/overview": "guides.pageOverview",
  "/brabus": "guides.pageBrabus",
  "/location": "guides.pageLocation",
  "/residences": "guides.pageResidences",
  "/floor-plan": "guides.pageFloorPlan",
  "/master-plan": "guides.pageMasterPlan",
  "/specifications": "guides.pageSpecifications",
  "/rera": "guides.pageRera",
  "/construction-status": "guides.pageConstruction",
  "/gallery": "guides.pageGallery",
  "/price": "guides.pagePrice",
  "/payment-plan": "guides.pagePaymentPlan",
  "/possession": "guides.pagePossession",
  "/contact": "guides.pageContact",
};

/* Articles are addressed by slug and resolved against POSTS at render time.
   If a slug is ever renamed the link disappears rather than 404s. */
const post = (slug) => POSTS.find((p) => p.slug === slug) || null;

const STAGES = [
  {
    id: "research",
    name: "Research",
    goal: "Decide what you are buying before you decide where.",
    nameKey: "guides.researchName",
    goalKey: "guides.researchGoal",
    bodyKey: "guides.researchBody",
    ask: [
      "guides.researchAsk1",
      "guides.researchAsk2",
      "guides.researchAsk3",
      "guides.researchAsk4",
    ],
    docs: [
      "guides.researchDoc1",
      "guides.researchDoc2",
      "guides.researchDoc3",
    ],
    pages: ["/overview", "/brabus", "/location"],
    posts: ["branded-residences-explained", "golf-course-extension-road-guide"],
  },
  {
    id: "shortlist",
    name: "Shortlist",
    goal: "Narrow to a configuration, not just to a project.",
    nameKey: "guides.shortlistName",
    goalKey: "guides.shortlistGoal",
    bodyKey: "guides.shortlistBody",
    ask: [
      "guides.shortlistAsk1",
      "guides.shortlistAsk2",
      "guides.shortlistAsk3",
      "guides.shortlistAsk4",
    ],
    docs: [
      "guides.shortlistDoc1",
      "guides.shortlistDoc2",
      "guides.shortlistDoc3",
      "guides.shortlistDoc4",
    ],
    pages: ["/floor-plan", "/residences", "/specifications", "/master-plan"],
    posts: ["4-bhk-vs-5-bhk-which-to-buy"],
  },
  {
    id: "verify",
    name: "Verify",
    goal: "Establish that the thing being sold legally exists.",
    nameKey: "guides.verifyName",
    goalKey: "guides.verifyGoal",
    bodyKey: "guides.verifyBody",
    ask: [
      "guides.verifyAsk1",
      "guides.verifyAsk2",
      "guides.verifyAsk3",
      "guides.verifyAsk4",
      "guides.verifyAsk5",
    ],
    docs: [
      "guides.verifyDoc1",
      "guides.verifyDoc2",
      "guides.verifyDoc3",
      "guides.verifyDoc4",
    ],
    pages: ["/rera", "/construction-status"],
    posts: ["rera-checklist-before-booking-in-gurgaon"],
  },
  {
    id: "visit",
    name: "Visit",
    goal: "Test the claims the drawings cannot make.",
    nameKey: "guides.visitName",
    goalKey: "guides.visitGoal",
    bodyKey: "guides.visitBody",
    ask: [
      "guides.visitAsk1",
      "guides.visitAsk2",
      "guides.visitAsk3",
      "guides.visitAsk4",
      "guides.visitAsk5",
    ],
    docs: [
      "guides.visitDoc1",
      "guides.visitDoc2",
      "guides.visitDoc3",
    ],
    pages: ["/construction-status", "/gallery", "/contact"],
    posts: ["what-to-check-during-a-site-visit"],
    visit: true,
  },
  {
    id: "book",
    name: "Negotiate & book",
    goal: "Price the whole cost, not the headline.",
    nameKey: "guides.bookName",
    goalKey: "guides.bookGoal",
    bodyKey: "guides.bookBody",
    ask: [
      "guides.bookAsk1",
      "guides.bookAsk2",
      "guides.bookAsk3",
      "guides.bookAsk4",
      "guides.bookAsk5",
    ],
    docs: [
      "guides.bookDoc1",
      "guides.bookDoc2",
      "guides.bookDoc3",
      "guides.bookDoc4",
    ],
    pages: ["/price", "/payment-plan"],
    posts: ["nri-guide-to-buying-property-in-gurgaon"],
  },
  {
    id: "agreement",
    name: "Agreement",
    goal: "Read the document that will actually govern the purchase.",
    nameKey: "guides.agreementName",
    goalKey: "guides.agreementGoal",
    bodyKey: "guides.agreementBody",
    ask: [
      "guides.agreementAsk1",
      "guides.agreementAsk2",
      "guides.agreementAsk3",
      "guides.agreementAsk4",
      "guides.agreementAsk5",
      "guides.agreementAsk6",
    ],
    docs: [
      "guides.agreementDoc1",
      "guides.agreementDoc2",
      "guides.agreementDoc3",
      "guides.agreementDoc4",
    ],
    pages: ["/possession", "/specifications", "/rera"],
    posts: ["branded-residences-explained", "rera-checklist-before-booking-in-gurgaon"],
  },
  {
    id: "handover",
    name: "Handover",
    goal: "Take delivery of what was promised, in writing.",
    nameKey: "guides.handoverName",
    goalKey: "guides.handoverGoal",
    bodyKey: "guides.handoverBody",
    ask: [
      "guides.handoverAsk1",
      "guides.handoverAsk2",
      "guides.handoverAsk3",
      "guides.handoverAsk4",
      "guides.handoverAsk5",
    ],
    docs: [
      "guides.handoverDoc1",
      "guides.handoverDoc2",
      "guides.handoverDoc3",
      "guides.handoverDoc4",
      "guides.handoverDoc5",
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
  const { t } = useI18n();

  const stageBody = (key) =>
    t(key)
      .replace("{name}", PROJECT.name)
      .replace("{configs}", PROJECT.configs)
      .replace("{sizes}", PROJECT.sizes);

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
        eyebrow={t("guides.eyebrow")}
        title={t("guides.headerTitle")}
        accent={t("guides.headerAccent")}
        lede={t("guides.lede")}
      />

      {/* how this differs from the blog, plus the jump rail */}
      <section className="rail container-lux pb-[clamp(3.5rem,10vh,6rem)]">

        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="rise max-w-[52ch] leading-relaxed text-ink-soft">
              {t("guides.intro1a")}<Link to="/blogs" className="text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:text-brass-soft">{t("guides.linkBlogs")}</Link>{t("guides.intro1b")}
            </p>
            <p className="rise mt-5 max-w-[52ch] leading-relaxed text-ink-soft">
              {t("guides.intro2")}
            </p>
          </div>

          <nav aria-label={t("guides.jumpAria")} className="rise self-start border-t border-line">
            {STAGES.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                data-cursor="VIEW"
                className="rail-item group flex items-baseline gap-6 border-b border-line py-4 transition-colors duration-500 hover:bg-brass/[0.035] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                <span className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass-soft">
                  {t(s.nameKey)}
                </span>
                <span className="mono ml-auto hidden max-w-[24ch] text-right text-[0.58rem] leading-relaxed tracking-[0.14em] text-ink-faint sm:block">
                  {t(s.goalKey)}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* the seven stages */}
      <section className="container-lux pb-[clamp(3rem,8vh,5rem)]">

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
                    <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-light leading-[1.03] tracking-[-0.02em] text-ink">
                      {t(s.nameKey)}
                    </h2>
                    <p className="mt-4 max-w-[30ch] font-serif text-lg italic leading-snug text-brass">
                      {t(s.goalKey)}
                    </p>
                  </div>

                  <div>
                    <p className="stage-part max-w-[62ch] leading-relaxed text-ink-soft">{stageBody(s.bodyKey)}</p>

                    <div className="stage-part mt-9 grid gap-8 sm:grid-cols-2">
                      <div>
                        <p className="mono flex items-center gap-2 text-[0.58rem] tracking-[0.2em] text-ink-faint">
                          <HelpCircle size={13} className="text-brass" aria-hidden="true" />
                          {t("guides.askOutLoud")}
                        </p>
                        <ul className="mt-4 space-y-3">
                          {s.ask.map((a) => (
                            <li key={a} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                              <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-brass/60" />
                              <span>{t(a)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="mono flex items-center gap-2 text-[0.58rem] tracking-[0.2em] text-ink-faint">
                          <FileText size={13} className="text-brass" aria-hidden="true" />
                          {t("guides.onTable")}
                        </p>
                        <ul className="mt-4 space-y-3">
                          {s.docs.map((d) => (
                            <li key={d} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                              <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-brass/60" />
                              <span>{t(d)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="stage-part mt-9 flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-line-soft pt-6">
                      <span className="mono w-full text-[0.58rem] tracking-[0.2em] text-ink-faint sm:w-auto">
                        {t("guides.goTo")}
                      </span>
                      {s.pages.map((p) => (
                        <Link
                          key={p}
                          to={p}
                          data-cursor="ENTER"
                          className="group inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 font-sans text-[0.68rem] tracking-[0.06em] text-ink-soft transition-colors duration-500 hover:border-brass/50 hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                        >
                          {PAGE[p] ? t(PAGE[p]) : p}
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
                            {a.readMins} {t("guides.min")}
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
                        {t("guides.bookVisitCta")}
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

        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="rise max-w-[54ch] leading-relaxed text-ink-soft">
              {t("guides.gateBody1a")}{PROJECT.developer}{t("guides.gateBody1b")}
            </p>
            <p className="rise mt-5 max-w-[54ch] leading-relaxed text-ink-soft">
              {t("guides.gateBody2")}
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
              <p className="rise kicker">{t("guides.checklistKicker")}</p>
              <h2 className="rise mt-4 max-w-[18ch] font-display text-[clamp(1.9rem,3.8vw,2.8rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                {t("guides.checklistTitleA")} <span className="font-serif italic text-brass">{t("guides.checklistTitleB")}</span>
              </h2>
              <p className="rise mt-5 max-w-[48ch] leading-relaxed text-ink-soft">
                {t("guides.checklistBody")}
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
                    {t("guides.getChecklistCta")}
                  </span>
                  <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                </button>
                <button
                  type="button"
                  onClick={() => openEnquiry("Buyer checklist")}
                  className="group inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                >
                  {t("guides.askFirstCta")}
                  <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
                <a
                  href={`tel:${PROJECT.phone}`}
                  aria-label={t("guides.callAria").replace("{phone}", PROJECT.phone)}
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
                  <span className="text-ink">{t(s.nameKey)}</span>
                  <span className="mono ml-auto text-[0.55rem] tracking-[0.16em] text-ink-faint">
                    {s.ask.length + s.docs.length} {t("guides.items")}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <p className="mono relative mt-9 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
            {t("guides.checklistDisclaimer")}
          </p>
        </div>
      </section>

      <RelatedPages links={["/blogs", "/faqs", "/rera"]} />
      <CtaBand title={t("guides.ctaTitle")} accent={t("guides.ctaAccent")} subject="Guides" />
    </div>
  );
}
