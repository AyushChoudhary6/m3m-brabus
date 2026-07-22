import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Mail, Phone, ArrowUpRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import { PROJECT } from "../lib/site.js";

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
  {
    field: "Full name",
    where: "Every enquiry form",
    need: "Required",
    why: "So the team knows who they are writing to.",
  },
  {
    field: "Phone number",
    where: "Every enquiry form",
    need: "Required",
    why: "The channel most enquiries are answered on. Indian and UAE numbers are accepted.",
  },
  {
    field: "Email address",
    where: "Every enquiry form",
    need: "Required",
    why: "Used to send the brochure, floor plans and any document you ask for.",
  },
  {
    field: "Configuration of interest",
    where: "Drop-down on every form — 4 BHK or 5 BHK",
    need: "Optional",
    why: "So the right layouts and the right price sheet are sent, rather than everything.",
  },
  {
    field: "Message",
    where: "Contact page form",
    need: "Optional",
    why: "Free text, in your own words. Only what you choose to type is sent.",
  },
  {
    field: "Preferred visit date",
    where: "Site-visit form",
    need: "Optional",
    why: "Transmitted as a single line of the message, to hold a slot.",
  },
];

const AUTOMATIC = [
  {
    k: "Source",
    d: "A label naming the form you used — the side panel, the contact page, the brochure gate, the site-visit form, the welcome section or the timed invitation.",
  },
  {
    k: "Page",
    d: "The path of the page you were on when you submitted — /price, for example. The path only; no browsing history is assembled.",
  },
  {
    k: "Timestamp",
    d: "The date and time of the submission, recorded in ISO format.",
  },
];

const NOT_COLLECTED = [
  "No account, username or password — there is nothing to sign in to.",
  "No card, bank or payment details. This site takes no payments.",
  "No identity documents, no PAN, no Aadhaar, no proof of funds.",
  "No file uploads.",
  "No precise location. Nothing beyond the page path recorded with a submission.",
  "Nothing at all until you press submit — what you type is validated in your browser and, if you close the form, it goes no further.",
];

const GA_EVENTS = [
  { k: "page_view", d: "The path and title of a page you open." },
  { k: "generate_lead", d: "That an enquiry was submitted, with the form label and the configuration chosen — never your name, phone or email." },
  { k: "brochure_download", d: "That the brochure was requested, with the form label." },
  { k: "site_visit_request", d: "That a site visit was requested, with the form label." },
  { k: "whatsapp_click", d: "That a WhatsApp button was pressed." },
  { k: "phone_call_click", d: "That a telephone number was pressed." },
];

const STORED = [
  {
    k: "mb-lead",
    d: "Written once you submit an enquiry. Its only job is to stop the timed invitation from reappearing on later visits. It holds the value 1 — no name, no number, nothing that identifies you.",
  },
  {
    k: "mb-lang",
    d: "Your choice of English or Arabic, so the site opens in the language you last chose.",
  },
];

const THIRD_PARTIES = [
  {
    k: "Google (Apps Script & Sheets)",
    d: "Receives and stores every enquiry on the site owner's behalf.",
  },
  {
    k: "Google Analytics",
    d: "Only if a measurement ID has been configured for this deployment. Loads gtag.js from googletagmanager.com and sets its own cookies.",
  },
  {
    k: "CARTO",
    d: "Supplies the dark map tiles on the location page. Loading a map means your browser requests images from their servers, which discloses your IP address to them.",
  },
  {
    k: "WhatsApp (Meta)",
    d: "Only if you press a WhatsApp button. You leave this site for WhatsApp, and their terms govern the conversation from that point.",
  },
];

const RIGHTS = [
  { k: "Access", d: "Ask what we hold against your name and phone number, and we will tell you." },
  { k: "Correction", d: "If a number or a spelling is wrong, tell us and it will be corrected." },
  { k: "Deletion", d: "Ask for your record to be removed and the row will be deleted from the sheet." },
  { k: "Withdrawal", d: "Ask us to stop contacting you and the contact stops. You need give no reason." },
];

export default function PrivacyPolicyPage() {
  const root = useRef(null);

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
        eyebrow={`Privacy Policy · Updated ${LAST_UPDATED}`}
        title="What we collect,"
        accent="and where it goes."
        lede="A short policy, because this is a short website. It takes enquiries and answers them — there is no account to open, nothing to pay for and no profile built about you. Everything below describes what the site actually does."
      />

      {/* 01 — scope */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">What this policy covers</span>
        </div>
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            This policy applies to this website and to the enquiry forms on it. It is written by the
            team that operates the site — an independent marketing site for {PROJECT.name} at{" "}
            {PROJECT.address}. It is not the official website of {PROJECT.developer}, and it does not
            describe how {PROJECT.developer}, {PROJECT.partner} or any other company handles your
            information once an enquiry reaches them.
          </p>
          <p className="rise">
            Where a practice below sounds narrow, that is deliberate. We would rather describe a
            small, plainly stated process accurately than claim a larger one we do not run.
          </p>
        </div>
      </section>

      {/* 02 — what is collected */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">The information you give us</span>
        </div>
        <p className="rise mb-8 max-w-[70ch] leading-relaxed text-ink-soft">
          Every form on this site — the side panel, the pop-up, the brochure gate, the site-visit
          form and the contact page — collects the same short set of fields. There are no others.
        </p>

        <div className="rise mb-4 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <caption className="sr-only">Fields collected by the enquiry forms on this website</caption>
            <thead>
              <tr className="border-b border-line">
                {["Field", "Where it appears", "Required?", "Why it is asked"].map((h) => (
                  <th key={h} scope="col" className="mono py-4 pr-8 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COLLECTED.map((c) => (
                <tr key={c.field} className="border-b border-line-soft align-top">
                  <th scope="row" className="py-4 pr-8 font-display text-base font-normal text-ink">{c.field}</th>
                  <td className="py-4 pr-8 text-sm leading-relaxed text-ink-soft">{c.where}</td>
                  <td className={`py-4 pr-8 text-sm ${c.need === "Required" ? "text-brass" : "text-ink-faint"}`}>{c.need}</td>
                  <td className="py-4 pr-2 text-sm leading-relaxed text-ink-soft">{c.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="rise mb-8 mono text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
          Fields are checked in your browser as you type · Nothing is transmitted until you submit
        </p>

        <h2 className="rise font-display text-xl text-ink">Recorded automatically with a submission</h2>
        <dl className="rise mt-5 max-w-[70ch] border-t border-line">
          {AUTOMATIC.map((a) => (
            <div key={a.k} className="grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-8">
              <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{a.k}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{a.d}</dd>
            </div>
          ))}
        </dl>

        <h2 className="rise mt-12 font-display text-xl text-ink">What is never collected</h2>
        <ul className="rise mt-5 max-w-[70ch] space-y-3">
          {NOT_COLLECTED.map((n) => (
            <li key={n} className="flex gap-4 text-sm leading-relaxed text-ink-soft">
              <span aria-hidden="true" className="mt-[0.55rem] h-px w-4 shrink-0 bg-brass/60" />
              {n}
            </li>
          ))}
        </ul>
      </section>

      {/* 03 — where it goes */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">Where your enquiry goes</span>
        </div>
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            When you submit a form, your details are sent over an encrypted (HTTPS) connection to a
            Google Apps Script web app. That script appends your details as a row to a Google Sheet
            operated by the site owner. There is no other database, no separate server and no
            marketing platform behind this site.
          </p>
          <p className="rise">
            Google therefore acts as the processor of that information: it stores and serves the
            data on our instruction, in its own infrastructure. Google's handling of it is governed
            by Google's own terms and privacy policy, not by this page.
          </p>
          <p className="rise">
            Access to the sheet is limited to the Google accounts operated by the site owner and the
            people servicing enquiries. We do not make any further claim about how that data is
            encrypted, replicated or backed up beyond what Google provides as standard — that is
            Google's to describe, and we will not describe it for them.
          </p>
          <p className="rise">
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-sm border-b border-brass/40 pb-0.5 text-brass transition-colors hover:border-brass hover:text-brass-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              Read Google's privacy policy
              <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </p>
        </div>
      </section>

      {/* 04 — purpose & basis */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">Why we hold it, and who else sees it</span>
        </div>
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            There is a single purpose: to answer the sales enquiry you made. That means calling or
            writing to you, sending the brochure, floor plans, specifications and — when they are
            officially issued — the price list and payment plan, arranging a site visit, and
            following up on the conversation that starts.
          </p>
          <p className="rise">
            The lawful basis is your own act of submitting the form. You gave the details so that
            someone would respond about a residence; that is what they are used for, and nothing
            else. Your details are not sold, rented or traded, and they are not passed to unrelated
            advertisers.
          </p>
          <p className="rise">
            To service the enquiry, your details are shared with the developer and with the
            authorised channel partner handling the sale, since they hold the inventory, the
            documentation and the site access that an enquiry ultimately needs. Once shared, their
            own privacy practices apply to their copy of it.
          </p>
        </div>
      </section>

      {/* 05 — browser storage */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">05</span>
          <span className="kicker">What is kept in your browser</span>
        </div>
        <p className="rise mb-8 max-w-[70ch] leading-relaxed text-ink-soft">
          This site itself sets no cookies. It writes two small values to your browser's
          localStorage, both of which stay on your device and are never transmitted to us:
        </p>
        <dl className="rise max-w-[70ch] border-t border-line">
          {STORED.map((s) => (
            <div key={s.k} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,9rem)_1fr] sm:gap-8">
              <dt className="mono text-[0.62rem] tracking-[0.16em] text-brass">{s.k}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{s.d}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[70ch] text-sm leading-relaxed text-ink-soft">
          Both can be cleared at any time from your browser's site-data settings, and both fail
          silently in private browsing. Because the site sets no cookies of its own, it shows no
          cookie banner and runs no consent-management tool — there would be nothing for either to
          manage. Where analytics is switched on, the cookies described below are set by Google, not
          by us, and are controlled through your browser.
        </p>
      </section>

      {/* 06 — analytics */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">06</span>
          <span className="kicker">Analytics</span>
        </div>
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            Google Analytics 4 runs on this site <span className="text-ink">only when a measurement
            ID has been configured for the deployment you are viewing</span>. If no ID is set, the
            analytics script is never loaded and every tracking call in the code does nothing at all.
            It is also deliberately switched off for the headless browser that pre-renders these
            pages, so automated builds are not counted as visits.
          </p>
          <p className="rise">
            When it is switched on, Google's gtag.js is loaded from googletagmanager.com and the
            following events are recorded:
          </p>
        </div>
        <dl className="rise mt-7 max-w-[70ch] border-t border-line">
          {GA_EVENTS.map((e) => (
            <div key={e.k} className="grid grid-cols-1 gap-2 border-b border-line py-4 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-8">
              <dt className="mono text-[0.62rem] tracking-[0.14em] text-brass">{e.k}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{e.d}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[70ch] text-sm leading-relaxed text-ink-soft">
          Alongside those events, Google Analytics collects the usual technical information a
          measurement tool collects — approximate location derived from IP address, device, browser,
          language and referring site. The name, phone number and email you type into a form are
          never sent to Google Analytics; only the fact that an enquiry occurred, the form it came
          from and the configuration chosen. Analytics can be blocked through your browser's
          settings, a tracker-blocking extension, or Google's own opt-out add-on.
        </p>
      </section>

      {/* 07 — third parties */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">07</span>
          <span className="kicker">Third parties your browser reaches</span>
        </div>
        <dl className="rise max-w-[70ch] border-t border-line">
          {THIRD_PARTIES.map((p) => (
            <div key={p.k} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8">
              <dt className="font-display text-base text-ink">{p.k}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{p.d}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[70ch] text-sm leading-relaxed text-ink-soft">
          Fonts, imagery and the brochure are served from this site itself, so no additional company
          is involved in loading them.
        </p>
      </section>

      {/* 08 — retention */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">08</span>
          <span className="kicker">How long it is kept</span>
        </div>
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            An enquiry stays in the sheet as a record of the correspondence for as long as it is
            useful to the conversation you started — a purchase of this scale is rarely decided in a
            week, and a buyer who returns a year later should not have to start again.
          </p>
          <p className="rise">
            There is no automatic deletion schedule, and we will not pretend otherwise. If you would
            like your record removed, ask us and the row is deleted. That is the mechanism, and it is
            available to you at any time.
          </p>
        </div>
      </section>

      {/* 09 — your rights */}
      <section className="pv-sec container-lux pb-[clamp(3.5rem,9vh,5.5rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">09</span>
          <span className="kicker">Your rights over your information</span>
        </div>
        <dl className="rise max-w-[70ch] border-t border-line">
          {RIGHTS.map((r) => (
            <div key={r.k} className="grid grid-cols-1 gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-8">
              <dt className="font-display text-base text-ink">{r.k}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">{r.d}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[70ch] leading-relaxed text-ink-soft">
          Write to <span className="text-ink">{PROJECT.email}</span> from the address you enquired
          with, or quote the phone number you used, so the right record can be found. Requests are
          actioned as promptly as we reasonably can. This site is intended for adults enquiring
          about the purchase of a residence; we do not knowingly collect information from children.
        </p>
      </section>

      {/* 10 — changes + contact line (deliberately quiet: no CtaBand here) */}
      <section className="pv-sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          <span className="idx">10</span>
          <span className="kicker">Changes, and how to reach us</span>
        </div>
        <div className="max-w-[70ch] space-y-5 leading-relaxed text-ink-soft">
          <p className="rise">
            If the site changes what it collects or where it sends it, this page changes with it and
            the date below moves. There is no archive of earlier versions; the page you are reading
            is the policy in force.
          </p>
        </div>

        <div className="rise mt-10 max-w-[70ch] rounded-[1.25rem] border border-line bg-cream/60 p-7 md:p-9">
          <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">
            Questions about this policy
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
            Last updated · {LAST_UPDATED}
          </p>
        </div>
      </section>

      <RelatedPages links={["/disclaimer", "/rera", "/contact"]} />
    </div>
  );
}
