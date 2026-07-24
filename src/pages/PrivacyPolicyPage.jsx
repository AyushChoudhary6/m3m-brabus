import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Mail, Phone } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import { PROJECT } from "../lib/site.js";
import { useI18n } from "../lib/i18n.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ============================================================
   This page documents what the code actually does — nothing more.
   Every claim below is traceable to a file:
     src/lib/leads.js          → the fields, the endpoint, the mb-lead flag
     src/components/ui/Enquiry.jsx, SideEnquiry.jsx,
     src/components/sections/WelcomeHome.jsx, src/pages/Contact.jsx
                               → the forms and their fields
     src/lib/analytics.js      → GA4, and the condition it runs under
     src/lib/validate.js       → browser-side validation, no storage
     src/lib/i18n.jsx          → the mb-lang preference
     src/components/sections/LivingMap.jsx → third-party map tiles
   If the code changes, this page must change with it. Do not add a
   practice here (cookie banner, consent tooling, certification) that
   the site does not actually perform.
   ============================================================ */

/** Shown on the page and used as the JSON-LD dateModified. */
export const LAST_UPDATED = "20 July 2026";
const LAST_UPDATED_ISO = "2026-07-20";

const COLLECTED = [
  { tKey: "privacy.collect.name", whereKey: "privacy.collect.everyForm", need: "Required", whyKey: "privacy.collect.nameWhy" },
  { tKey: "privacy.collect.phone", whereKey: "privacy.collect.everyForm", need: "Required", whyKey: "privacy.collect.phoneWhy" },
  { tKey: "privacy.collect.email", whereKey: "privacy.collect.everyForm", need: "Required", whyKey: "privacy.collect.emailWhy" },
  { tKey: "privacy.collect.config", whereKey: "privacy.collect.configWhere", need: "Optional", whyKey: "privacy.collect.configWhy" },
  { tKey: "privacy.collect.message", whereKey: "privacy.collect.messageWhere", need: "Optional", whyKey: "privacy.collect.messageWhy" },
  { tKey: "privacy.collect.visit", whereKey: "privacy.collect.visitWhere", need: "Optional", whyKey: "privacy.collect.visitWhy" },
];

const AUTOMATIC = [
  { kKey: "privacy.auto.source", dKey: "privacy.auto.sourceD" },
  { kKey: "privacy.auto.page", dKey: "privacy.auto.pageD" },
  { kKey: "privacy.auto.timestamp", dKey: "privacy.auto.timestampD" },
];

const NOT_COLLECTED = [
  "privacy.not.account",
  "privacy.not.payment",
  "privacy.not.identity",
  "privacy.not.uploads",
  "privacy.not.location",
  "privacy.not.nothing",
];

const GA_EVENTS = [
  { k: "page_view", dKey: "privacy.ga.pageView" },
  { k: "generate_lead", dKey: "privacy.ga.generateLead" },
  { k: "brochure_download", dKey: "privacy.ga.brochureDownload" },
  { k: "site_visit_request", dKey: "privacy.ga.siteVisitRequest" },
  { k: "whatsapp_click", dKey: "privacy.ga.whatsappClick" },
  { k: "phone_call_click", dKey: "privacy.ga.phoneCallClick" },
];

const STORED = [
  { k: "mb-lead", dKey: "privacy.stored.mbLead" },
  { k: "mb-lang", dKey: "privacy.stored.mbLang" },
];

const THIRD_PARTIES = [
  { k: "Google (Apps Script & Sheets)", dKey: "privacy.third.googleSheets" },
  { k: "Google Analytics", dKey: "privacy.third.googleAnalytics" },
  { k: "CARTO", dKey: "privacy.third.carto" },
  { k: "WhatsApp (Meta)", dKey: "privacy.third.whatsapp" },
];

const RIGHTS = [
  { kKey: "privacy.rights.access", dKey: "privacy.rights.accessD" },
  { kKey: "privacy.rights.correction", dKey: "privacy.rights.correctionD" },
  { kKey: "privacy.rights.deletion", dKey: "privacy.rights.deletionD" },
  { kKey: "privacy.rights.withdrawal", dKey: "privacy.rights.withdrawalD" },
];

export default function PrivacyPolicyPage() {
  const root = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        q(".pv-sec").forEach((sec) => {
          gsap.from(sec.querySelectorAll(".rise"), {
            autoAlpha: 0, y: 18, duration: 0.8, ease: "power3.out", stagger: 0.05,
            scrollTrigger: { trigger: sec, start: "top 88%" },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="Privacy Policy | M3M Brabus"
        description="How this site handles enquiry details — the fields collected, where they are stored, what stays in your browser, and how to correct or delete your record."
        path="/privacy-policy"
        noindex={false}
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy-policy" }]),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Privacy Policy",
            description: "What this website collects, where it is stored and how to have it deleted.",
            dateModified: LAST_UPDATED_ISO,
          },
        ]}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy-policy" }]} />
      <PageHeader
        title={t("privacy.title")}
        accent={t("privacy.accent")}
        lede={t("privacy.lede")}
      />

      {/* 01 — scope */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            {t("privacy.scopeP1a")}{PROJECT.name}{t("privacy.scopeP1b")}{PROJECT.address}
            {t("privacy.scopeP1c")}{PROJECT.developer}{t("privacy.scopeP1d")}{PROJECT.developer}
            {t("privacy.scopeP1e")}{PROJECT.partner}{t("privacy.scopeP1f")}
          </p>
          <p className="rise">
            {t("privacy.scopeP2")}
          </p>
        </div>
      </section>

      {/* 02 — what is collected */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <p className="rise mb-8 max-w-[70ch] leading-relaxed text-ink-soft">
          {t("privacy.collectIntro")}
        </p>

        <div className="rise mb-4 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <caption className="sr-only">{t("privacy.tableCaption")}</caption>
            <thead>
              <tr className="border-b border-line">
                {["privacy.th.field", "privacy.th.where", "privacy.th.required", "privacy.th.why"].map((h) => (
                  <th key={h} scope="col" className="mono py-4 pr-8 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                    {t(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COLLECTED.map((c) => (
                <tr key={c.tKey} className="border-b border-line-soft align-top">
                  <th scope="row" className="py-4 pr-8 font-display text-base font-normal text-ink">{t(c.tKey)}</th>
                  <td className="py-4 pr-8 text-sm leading-relaxed text-ink-soft">{t(c.whereKey)}</td>
                  <td className={`py-4 pr-8 text-sm ${c.need === "Required" ? "text-brass" : "text-ink-faint"}`}>{t(c.need === "Required" ? "privacy.required" : "privacy.optional")}</td>
                  <td className="py-4 pr-2 text-sm leading-relaxed text-ink-soft">{t(c.whyKey)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="rise mb-8 mono text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
          {t("privacy.checkedNote")}
        </p>

        <h2 className="rise font-display text-xl text-ink">{t("privacy.autoHeading")}</h2>
        <dl className="rise mt-5 max-w-[70ch] border-t border-line">
          {AUTOMATIC.map((a) => (
            <div key={a.kKey} className="grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-8">
              <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{t(a.kKey)}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{t(a.dKey)}</dd>
            </div>
          ))}
        </dl>

        <h2 className="rise mt-12 font-display text-xl text-ink">{t("privacy.neverHeading")}</h2>
        <ul className="rise mt-5 max-w-[70ch] space-y-3">
          {NOT_COLLECTED.map((n) => (
            <li key={n} className="flex gap-4 text-sm leading-relaxed text-ink-soft">
              <span aria-hidden="true" className="mt-[0.55rem] h-px w-4 shrink-0 bg-brass/60" />
              {t(n)}
            </li>
          ))}
        </ul>
      </section>

      {/* 03 — where it goes */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            {t("privacy.goesP1")}
          </p>
          <p className="rise">
            {t("privacy.goesP2")}
          </p>
          <p className="rise">
            {t("privacy.goesP3")}
          </p>
        </div>
      </section>

      {/* 04 — purpose & basis */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            {t("privacy.purposeP1")}
          </p>
          <p className="rise">
            {t("privacy.purposeP2")}
          </p>
          <p className="rise">
            {t("privacy.purposeP3")}
          </p>
        </div>
      </section>

      {/* 05 — browser storage */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <p className="rise mb-8 max-w-[70ch] leading-relaxed text-ink-soft">
          {t("privacy.browserIntro")}
        </p>
        <dl className="rise max-w-[70ch] border-t border-line">
          {STORED.map((s) => (
            <div key={s.k} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,9rem)_1fr] sm:gap-8">
              <dt className="mono text-[0.62rem] tracking-[0.16em] text-brass">{s.k}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{t(s.dKey)}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[70ch] text-sm leading-relaxed text-ink-soft">
          {t("privacy.browserTrailing")}
        </p>
      </section>

      {/* 06 — analytics */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            {t("privacy.analyticsP1a")}<span className="text-ink">{t("privacy.analyticsP1span")}</span>{t("privacy.analyticsP1b")}
          </p>
          <p className="rise">
            {t("privacy.analyticsP2")}
          </p>
        </div>
        <dl className="rise mt-7 max-w-[70ch] border-t border-line">
          {GA_EVENTS.map((e) => (
            <div key={e.k} className="grid grid-cols-1 gap-2 border-b border-line py-4 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-8">
              <dt className="mono text-[0.62rem] tracking-[0.14em] text-brass">{e.k}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{t(e.dKey)}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[70ch] text-sm leading-relaxed text-ink-soft">
          {t("privacy.analyticsTrailing")}
        </p>
      </section>

      {/* 07 — third parties */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <dl className="rise max-w-[70ch] border-t border-line">
          {THIRD_PARTIES.map((p) => (
            <div key={p.k} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8">
              <dt className="font-display text-base text-ink">{p.k}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{t(p.dKey)}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[70ch] text-sm leading-relaxed text-ink-soft">
          {t("privacy.thirdTrailing")}
        </p>
      </section>

      {/* 08 — retention */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            {t("privacy.retentionP1")}
          </p>
          <p className="rise">
            {t("privacy.retentionP2")}
          </p>
        </div>
      </section>

      {/* 09 — your rights */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <dl className="rise max-w-[70ch] border-t border-line">
          {RIGHTS.map((r) => (
            <div key={r.kKey} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-8">
              <dt className="font-display text-base text-ink">{t(r.kKey)}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{t(r.dKey)}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[70ch] leading-relaxed text-ink-soft">
          {t("privacy.rightsTrailingA")}<span className="text-ink">{PROJECT.email}</span>{t("privacy.rightsTrailingB")}
        </p>
      </section>

      {/* 10 — changes + contact line (deliberately quiet: no CtaBand here) */}
      <section className="pv-sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            {t("privacy.changesP1")}
          </p>
        </div>

        <div className="rise mt-10 max-w-[70ch] rounded-[1.25rem] border border-line bg-cream/60 p-7 md:p-9">
          <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">
            {t("privacy.questionsLabel")}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href={`mailto:${PROJECT.email}`}
              className="mono inline-flex items-center gap-2.5 rounded-sm text-[0.68rem] tracking-[0.16em] text-ink transition-colors hover:text-brass focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              <Mail size={14} className="text-brass" />
              {PROJECT.email}
            </a>
            <a
              href={`tel:${PROJECT.phone}`}
              className="mono inline-flex items-center gap-2.5 rounded-sm text-[0.68rem] tracking-[0.16em] text-ink-soft transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              <Phone size={13} className="text-brass" />
              {PROJECT.phone}
            </a>
          </div>
          <p className="mono mt-7 text-[0.58rem] tracking-[0.18em] text-ink-faint">
            {t("privacy.lastUpdated")} {LAST_UPDATED}
          </p>
        </div>
      </section>

      <RelatedPages links={["/disclaimer", "/rera", "/contact"]} />
    </div>
  );
}
