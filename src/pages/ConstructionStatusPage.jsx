import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Camera, ImageOff, Phone } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { PROJECT } from "../lib/site.js";
import { track } from "../lib/analytics.js";
import { useI18n } from "../lib/i18n.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* We hold no verified construction photography and no progress data for this
   project. A percentage complete, a floors-cast figure or a milestone date
   would be a fabricated record, not a marketing flourish — so this page
   carries none. What it carries instead is the method: how a buyer obtains
   and reads the real progress position for themselves.

   /possession answers "when do I get the keys". This page answers "what has
   actually been built, and how would I know". Keep the two distinct. */

/** Single point of truth for the review date — update this line only. */
export const LAST_REVIEWED = "20 July 2026";

const POSITION = [
  {
    kKey: "construction.posProgressLabel",
    vKey: "construction.posNoneHeld",
    nKey: "construction.posProgressNote",
  },
  {
    kKey: "construction.posPhotoLabel",
    vKey: "construction.posNoneHeld",
    nKey: "construction.posPhotoNote",
  },
  {
    kKey: "construction.posPossessionLabel",
    v: PROJECT.possession,
    nKey: "construction.posPossessionNote",
  },
  {
    kKey: "construction.posReraLabel",
    v: PROJECT.rera,
    nKey: "construction.posReraNote",
  },
  {
    kKey: "construction.posLocationLabel",
    v: PROJECT.address,
    nKey: "construction.posLocationNote",
  },
  {
    kKey: "construction.posReviewedLabel",
    v: LAST_REVIEWED,
    nKey: "construction.posReviewedNote",
  },
];

/* The genuinely useful part: the buyer's own verification route. */
const VERIFY = [
  { n: "01", tKey: "construction.verify1Title", dKey: "construction.verify1Body" },
  { n: "02", tKey: "construction.verify2Title", dKey: "construction.verify2Body" },
  { n: "03", tKey: "construction.verify3Title", dKey: "construction.verify3Body" },
  { n: "04", tKey: "construction.verify4Title", dKey: "construction.verify4Body" },
  { n: "05", tKey: "construction.verify5Title", dKey: "construction.verify5Body" },
  { n: "06", tKey: "construction.verify6Title", dKey: "construction.verify6Body" },
];

/* Stage primer. Deliberately no durations and no dates — those would be
   invented. What each stage means for money and risk is general and true. */
const STAGES = [
  { s: "Excavation & shoring", sKey: "construction.stage1Name", wKey: "construction.stage1What", mKey: "construction.stage1Money" },
  { s: "Foundation & raft", sKey: "construction.stage2Name", wKey: "construction.stage2What", mKey: "construction.stage2Money" },
  { s: "Structure — the slab cycle", sKey: "construction.stage3Name", wKey: "construction.stage3What", mKey: "construction.stage3Money" },
  { s: "Blockwork & plaster", sKey: "construction.stage4Name", wKey: "construction.stage4What", mKey: "construction.stage4Money" },
  { s: "Façade & glazing", sKey: "construction.stage5Name", wKey: "construction.stage5What", mKey: "construction.stage5Money" },
  { s: "MEP rough-in", sKey: "construction.stage6Name", wKey: "construction.stage6What", mKey: "construction.stage6Money" },
  { s: "Finishes & fit-out", sKey: "construction.stage7Name", wKey: "construction.stage7What", mKey: "construction.stage7Money" },
  { s: "External development", sKey: "construction.stage8Name", wKey: "construction.stage8What", mKey: "construction.stage8Money" },
  { s: "Occupation certificate", sKey: "construction.stage9Name", wKey: "construction.stage9What", mKey: "construction.stage9Money" },
];

const OPTICS = [
  { tKey: "construction.optics1Title", dKey: "construction.optics1Body" },
  { tKey: "construction.optics2Title", dKey: "construction.optics2Body" },
  { tKey: "construction.optics3Title", dKey: "construction.optics3Body" },
  { tKey: "construction.optics4Title", dKey: "construction.optics4Body" },
];

const FAQ_ITEMS = [
  {
    q: "What is the current construction status of M3M Brabus?",
    a: `We do not hold verified construction progress data for ${PROJECT.name}, and the official M3M listing does not publish a stage, a percentage complete or a floors-cast figure. Rather than estimate one, we will obtain the current position from the project team in writing and send it to you, alongside guidance on verifying it yourself through the HARERA record.`,
    qKey: "construction.faq1Q",
    aKey: "construction.faq1A",
  },
  {
    q: "Why are there no construction photographs on this page?",
    a: "Because we hold none we can date and attribute. An undated site photograph, or a render presented as site progress, misleads a buyer about the one thing this page exists to answer. If you want current imagery, ask us for it or take your own on a site visit — and keep the timestamp.",
    qKey: "construction.faq2Q",
    aKey: "construction.faq2A",
  },
  {
    q: "How is this different from the possession date?",
    a: "Construction status is what has been built so far. Possession is the date the completed residence is handed over to you. The two are related but not the same — a project can be at an advanced stage and still carry approvals on the critical path. The possession page covers the handover side.",
    qKey: "construction.faq3Q",
    aKey: "construction.faq3A",
  },
];

export default function ConstructionStatusPage() {
  const root = useRef(null);
  const { openEnquiry, openVisit } = useEnquiry();
  const { t } = useI18n();

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

        gsap.from(q(".stg-row"), {
          autoAlpha: 0, y: 18, duration: 0.7, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: q(".stg")[0], start: "top 85%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="bg-canvas">
      <Seo
        title="M3M Brabus Construction Status | Progress Update"
        description="M3M Brabus construction status — no progress figure is published, so none is invented. What is confirmed, how to read HARERA filings, and the latest update."
        path="/construction-status"
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Construction Status", path: "/construction-status" },
          ]),
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
      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Construction Status", path: "/construction-status" },
        ]}
      />
      <PageHeader
        eyebrow={t("construction.eyebrow")}
        title={t("construction.headerTitle")}
        accent={t("construction.headerAccent")}
        lede={t("construction.lede").replace("{name}", PROJECT.name)}
        compact
      />

      {/* the position, stated without decoration */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">

        <div className="mb-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="rise max-w-[54ch] leading-relaxed text-ink-soft">
              {t("construction.para1")}
            </p>
            <p className="rise mt-4 max-w-[54ch] leading-relaxed text-ink-soft">
              {t("construction.para2a")}{PROJECT.developer}{t("construction.para2b")}
              <span className="text-ink">{LAST_REVIEWED}</span>{t("construction.para2c")}
            </p>
            <p className="rise mt-4 max-w-[54ch] leading-relaxed text-ink-soft">
              {t("construction.para3a")}
              <Link
                to="/possession"
                className="text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:text-brass-soft"
              >
                {t("construction.linkPossession")}
              </Link>
              {t("construction.para3b")}
              <Link
                to="/rera"
                className="text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:text-brass-soft"
              >
                {t("construction.linkRera")}
              </Link>
              .
            </p>
          </div>

          <dl className="rise self-start border-t border-line">
            {POSITION.map((p) => (
              <div
                key={p.kKey}
                className="grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-8"
              >
                <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{t(p.kKey)}</dt>
                <dd>
                  <span className="block text-ink">{p.vKey ? t(p.vKey) : p.v}</span>
                  <span className="mono mt-1 block text-[0.58rem] leading-relaxed tracking-[0.14em] text-ink-faint">
                    {t(p.nKey)}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Where a site photograph would sit. We would rather show the absence
            than dress a render up as progress. */}
        <div className="rise flex flex-col gap-5 rounded-[1.5rem] border border-dashed border-line bg-cream p-8 sm:flex-row sm:items-center sm:justify-between md:p-10">
          <div className="flex items-start gap-4">
            <ImageOff size={20} strokeWidth={1.4} className="mt-1 shrink-0 text-brass" aria-hidden="true" />
            <div>
              <p className="font-display text-xl text-ink">{t("construction.noPhotoTitle")}</p>
              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-soft">
                {t("construction.noPhotoBody")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              track("construction_update_request", { location: "status_panel" });
              openEnquiry("Construction status");
            }}
            aria-label={t("construction.getUpdateAria")}
            className="group/cta relative inline-flex shrink-0 items-center gap-3 self-start overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
            <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
              {t("construction.getUpdateCta")}
            </span>
            <ArrowUpRight
              size={15}
              className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian"
            />
          </button>
        </div>
      </section>

      {/* verify it yourself */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <p className="sec-rise mb-8 max-w-[62ch] leading-relaxed text-ink-soft">
          {t("construction.verifyIntro")}
        </p>
        <ol className="border-t border-line">
          {VERIFY.map((v) => (
            <li
              key={v.n}
              className="sec-rise group grid grid-cols-1 gap-2 border-b border-line py-6 transition-colors duration-500 hover:bg-brass/[0.035] sm:grid-cols-[minmax(0,3rem)_1fr] sm:gap-8"
            >
              <div>
                <h2 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                  {t(v.tKey)}
                </h2>
                <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-ink-soft">{t(v.dKey)}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="sec-rise mono mt-6 text-[0.58rem] leading-relaxed tracking-[0.2em] text-ink-faint">
          {t("construction.verifyDisclaimer")}
        </p>
      </section>

      {/* book the visit */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-11">
          <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="sec-rise kicker">{t("construction.visitKicker")}</p>
              <h2 className="sec-rise mt-4 max-w-[18ch] font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                {t("construction.visitTitleA")}{" "}
                <span className="font-serif italic text-brass">{t("construction.visitTitleB")}</span>
              </h2>
              <p className="sec-rise mt-5 max-w-[48ch] leading-relaxed text-ink-soft">
                {t("construction.visitBodyA")}{PROJECT.location}{t("construction.visitBodyB")}
              </p>

              <div className="sec-rise mt-9 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => {
                    track("site_visit_request", { location: "construction_status" });
                    openVisit("Construction status");
                  }}
                  aria-label={t("construction.bookVisitAria")}
                  data-cursor="VISIT"
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    {t("construction.bookVisitCta")}
                  </span>
                  <ArrowUpRight
                    size={15}
                    className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    track("construction_update_request", { location: "visit_panel" });
                    openEnquiry("Construction status");
                  }}
                  aria-label={t("construction.requestWritingAria")}
                  className="group inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  {t("construction.requestWritingCta")}
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </button>
                <a
                  href={`tel:${PROJECT.phone}`}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
                >
                  <Phone size={13} className="text-brass" aria-hidden="true" />
                  {PROJECT.phone}
                </a>
              </div>
            </div>

            <div className="sec-rise self-start">
              <p className="mono mb-4 flex items-center gap-2 text-[0.6rem] tracking-[0.2em] text-ink-faint">
                <Camera size={13} className="text-brass" aria-hidden="true" />
                {t("construction.takeOnDay")}
              </p>
              <ul className="border-t border-line/70">
                {[
                  "construction.photo1",
                  "construction.photo2",
                  "construction.photo3",
                  "construction.photo4",
                  "construction.photo5",
                  "construction.photo6",
                ].map((c) => (
                  <li
                    key={c}
                    className="border-b border-line/70 py-3 text-sm leading-relaxed text-ink-soft"
                  >
                    {t(c)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* stage primer */}
      <section className="stg container-lux pb-[clamp(4rem,11vh,7rem)]">
        <p className="mb-8 max-w-[62ch] leading-relaxed text-ink-soft">
          {t("construction.stagesIntro")}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <caption className="sr-only">
              {t("construction.tableCaption")}
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="mono w-[3rem] py-4 pr-6 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  #
                </th>
                <th scope="col" className="mono w-[14rem] py-4 pr-8 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  {t("construction.thStage")}
                </th>
                <th scope="col" className="mono py-4 pr-8 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  {t("construction.thWhat")}
                </th>
                <th scope="col" className="mono py-4 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  {t("construction.thMoney")}
                </th>
              </tr>
            </thead>
            <tbody>
              {STAGES.map((s, i) => (
                <tr
                  key={s.sKey}
                  className="stg-row group border-b border-line-soft align-top transition-colors duration-500 hover:bg-brass/[0.035]"
                >
                  <td className="idx py-5 pr-6">{String(i + 1).padStart(2, "0")}</td>
                  <th scope="row" className="py-5 pr-8 font-display text-lg font-light text-ink transition-colors duration-300 group-hover:text-brass-soft">
                    {t(s.sKey)}
                  </th>
                  <td className="max-w-[26rem] py-5 pr-8 text-sm leading-relaxed text-ink-soft">{t(s.wKey)}</td>
                  <td className="max-w-[26rem] py-5 text-sm leading-relaxed text-ink-soft">{t(s.mKey)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mono mt-6 text-[0.58rem] leading-relaxed tracking-[0.2em] text-ink-faint">
          {t("construction.stagesDisclaimer")}
        </p>
      </section>

      {/* optics */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <p className="sec-rise mb-8 max-w-[62ch] leading-relaxed text-ink-soft">
          {t("construction.opticsIntro")}
        </p>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {OPTICS.map((o) => (
            <div key={o.tKey} className="sec-rise group border-b border-line py-6">
              <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {t(o.tKey)}
              </h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{t(o.dKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* faqs */}
      <section className="sec container-lux pb-[clamp(4rem,12vh,8rem)]">
        <dl className="border-t border-line">
          {FAQ_ITEMS.map((f) => (
            <div key={f.qKey} className="sec-rise border-b border-line py-7">
              <dt className="max-w-[34ch] font-display text-xl font-light leading-snug text-ink md:text-2xl">
                {t(f.qKey)}
              </dt>
              <dd className="mt-3 max-w-[68ch] leading-relaxed text-ink-soft">{t(f.aKey).replace("{name}", PROJECT.name)}</dd>
            </div>
          ))}
        </dl>
        <p className="mono mt-8 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          {t("construction.faqFooterA")}{LAST_REVIEWED}{t("construction.faqFooterB")}{PROJECT.developer}{t("construction.faqFooterC")}
        </p>
      </section>

      <RelatedPages links={["/possession", "/rera", "/specifications", "/contact"]} />

      <CtaBand title={t("construction.ctaTitle")} accent={t("construction.ctaAccent")} subject="Construction status" />
    </div>
  );
}
