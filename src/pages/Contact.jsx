import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Phone, Mail, MapPin, ArrowRight, ArrowUpRight, CalendarCheck, FileDown } from "lucide-react";
import WhatsAppIcon from "../components/ui/WhatsAppIcon.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { submitLead, markLeadCaptured } from "../lib/leads.js";
import { startTimer } from "../lib/spam.js";
import { sanitizeField, validateField, validateLead, isClean } from "../lib/validate.js";
import { trackSiteVisit, trackLead } from "../lib/analytics.js";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT, RESIDENCES } from "../lib/site.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FIELD =
  "w-full border-b border-line bg-transparent py-3.5 text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-brass";

/* Ch. 78 — the clock behind the "too-fast" signal, and the key submitLead() is
   handed so spam.js reads back this form's clock and not another's. */
const FORM_KEY = "Contact page";

const VISIT = [
  { k: "01", tKey: "contact.visit1Title", dKey: "contact.visit1Body" },
  { k: "02", tKey: "contact.visit2Title", dKey: "contact.visit2Body" },
  { k: "03", tKey: "contact.visit3Title", dKey: "contact.visit3Body" },
];

export default function Contact() {
  const root = useRef(null);
  const { t } = useI18n();
  const { openBrochure, openVisit } = useEnquiry();
  // `company` is the honeypot (spam.js HONEYPOT_NAME); it has to live in state,
  // because only what is in `form` reaches submitLead.
  const [form, setForm] = useState({ name: "", phone: "", email: "", config: "", message: "", company: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => {
    const v = sanitizeField(k, e.target.value);
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: validateField(k, v) }));
  };
  const blur = (k) => () => setErrors((x) => ({ ...x, [k]: validateField(k, form[k]) }));
  const fieldCls = (k) => `${FIELD} ${errors[k] ? "border-oxblood" : ""}`;
  /* First focus or keystroke starts the clock. startTimer() is idempotent. */
  const touch = () => startTimer(FORM_KEY);

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const errs = validateLead(form);
    if (!isClean(errs)) { setErrors(errs); return; }
    setSending(true);
    setError("");
    try {
      // ...form carries `company` (honeypot); formKey pins the timer spam.js reads.
      await submitLead({ ...form, source: "Contact page", formKey: FORM_KEY });
      markLeadCaptured();
      trackLead("Contact page", form.config); // BUG-002: was untracked
      setSent(true);
    } catch (err) {
      // A network/endpoint failure has already queued the lead for retry
      // (leads.js throws LeadError{queued:true}); tell the visitor it is safe
      // rather than inviting a give-up or a double-submit.
      if (err && err.queued) { markLeadCaptured(); setSent(true); }
      else setError("err.send"); // key resolved by t() in the error paragraph
    } finally {
      setSending(false);
    }
  };

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.from(q(".ct"), {
          autoAlpha: 0, y: 26, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".ct-grid")[0], start: "top 88%" },
        });
        gsap.from(q(".vs"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".vs-grid")[0], start: "top 86%" },
        });
        gsap.from(q(".act"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".act-grid")[0], start: "top 90%" },
        });
      });
    },
    { scope: root },
  );

  const CHANNELS = [
    { icon: Phone, k: t("contact.chSales"), v: PROJECT.phone, href: `tel:${PROJECT.phone}` },
    { icon: WhatsAppIcon, k: "WhatsApp", v: t("contact.chWhatsappValue"), href: `https://wa.me/${PROJECT.whatsapp}` },
    { icon: Mail, k: t("contact.chEmail"), v: PROJECT.email, href: `mailto:${PROJECT.email}` },
    { icon: MapPin, k: t("contact.chAddress"), v: PROJECT.address, href: "/location" },
  ];

  /* The three steps below explain a site visit without ever letting anyone book
     one, and the brochure was reachable only from the footer links. Both are
     given here as actions of equal weight: the form is for a considered
     enquiry, these two are for the reader who has already decided and only
     needs to choose how. The brochure fires its own brochure_download event on
     submit inside the modal — firing one here as well would count a click that
     never became a lead. */
  const ACTIONS = [
    {
      k: t("contact.actionVisitTitle"),
      detail: t("contact.actionVisitDetail"),
      why: t("contact.actionVisitWhy"),
      icon: CalendarCheck,
      cursor: "VISIT",
      onSelect: () => { trackSiteVisit("Contact page"); openVisit("Contact page"); },
    },
    {
      k: t("contact.downloadBrochure"),
      detail: t("contact.actionBrochureDetail"),
      why: t("contact.actionBrochureWhy"),
      icon: FileDown,
      cursor: "DOWNLOAD",
      onSelect: () => openBrochure("Contact page"),
    },
  ];

  return (
    <div ref={root}>
      <Seo
        title="Contact M3M Brabus | Price List, Brochure & Site Visit, Sector 58"
        description="Speak to the M3M Brabus private client team for the brochure, price list, floor plans and a site visit at Sector 58, Golf Course Extension Road, Gurugram."
        path="/contact"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />
      <PageHeader
        compact
        eyebrow={t("contact.eyebrow")}
        title={t("contact.headerTitle")}
        accent={t("contact.headerAccent")}
        lede={t("contact.headerLede")}
      />

      {/* channels + form */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* channels */}
          <div className="ct-grid">
            <p className="mono mb-6 text-[0.6rem] tracking-[0.24em] text-ink-faint">{t("contact.directLines")}</p>
            <div className="border-t border-line">
              {CHANNELS.map((c) => (
                <a
                  key={c.k}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="ct group flex items-start gap-5 border-b border-line py-5 transition-colors duration-500 hover:bg-brass/[0.035]"
                >
                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brass/30 text-brass transition-colors duration-300 group-hover:bg-brass group-hover:text-obsidian">
                    <c.icon size={15} />
                  </span>
                  <div>
                    <p className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{c.k}</p>
                    <p className="mt-1.5 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                      {c.v}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* form */}
          <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-10">
            <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
            {sent ? (
              <div className="relative py-8 text-center">
                <p className="kicker">{t("enq.received")}</p>
                <h2 className="mt-4 font-display text-[clamp(2rem,6vw,3rem)] font-light leading-[0.95] text-ink">
                  {t("enq.thankYou")} <span className="font-serif italic text-brass">{form.name.split(" ")[0] || t("contact.friend")}.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
                  {t("contact.sentBody")}
                </p>
              </div>
            ) : (
              <div className="relative">
                <p className="kicker">{t("contact.enquiryKicker")}</p>
                <h2 className="mt-3 font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-light leading-[1.05] text-ink">
                  {t("contact.formTitle")} <span className="font-serif italic text-brass">{t("contact.formTitleAccent")}</span>
                </h2>
                <form onSubmit={submit} onFocus={touch} onInput={touch} className="mt-7 space-y-5">
                  {/* Honeypot — invisible to people and to screen readers, skipped by
                      the tab order and by autofill, but an ordinary input to a bot. */}
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <input className={fieldCls("name")} placeholder={t("form.name")} aria-label={t("form.name")} autoComplete="name" value={form.name} onChange={set("name")} onBlur={blur("name")} />
                      {errors.name && <p className="mt-1.5 text-[0.72rem] text-oxblood">{t(errors.name)}</p>}
                    </div>
                    <div>
                      <input className={fieldCls("phone")} placeholder={t("form.phone")} aria-label={t("form.phone")} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} onBlur={blur("phone")} />
                      {errors.phone && <p className="mt-1.5 text-[0.72rem] text-oxblood">{t(errors.phone)}</p>}
                    </div>
                  </div>
                  <div>
                    <input className={fieldCls("email")} placeholder={t("form.email")} aria-label={t("form.email")} type="email" autoComplete="email" value={form.email} onChange={set("email")} onBlur={blur("email")} />
                    {errors.email && <p className="mt-1.5 text-[0.72rem] text-oxblood">{t(errors.email)}</p>}
                  </div>
                  <select className={`${FIELD} appearance-none`} value={form.config} onChange={set("config")} aria-label={t("form.config")}>
                    <option value="">{t("form.config")}</option>
                    {RESIDENCES.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                  <textarea
                    className={`${FIELD} resize-none`}
                    rows={3}
                    placeholder={t("form.message")} aria-label={t("form.message")}
                    value={form.message}
                    onChange={set("message")}
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    data-cursor="OPEN"
                    className="group/cta relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-brass py-4 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-obsidian disabled:opacity-70"
                  >
                    <span className="absolute inset-0 origin-left scale-x-0 bg-brass-soft transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                    <span className="relative z-10">{sending ? t("cta.sending") : t("cta.sendEnquiry")}</span>
                    {!sending && <ArrowRight size={15} className="relative z-10 transition-transform duration-500 group-hover/cta:translate-x-1" />}
                  </button>
                  {error && <p className="text-center text-[0.74rem] text-oxblood">{t(error)}</p>}
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* plan a visit */}
      <section className="vs-grid container-lux pb-[clamp(5rem,13vh,9rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">{t("contact.planVisitKicker")}</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-3">
          {VISIT.map((v) => (
            <article key={v.k} className="vs border-t border-line py-7">
              <span className="idx">{v.k}</span>
              <h3 className="mt-3 font-display text-2xl text-ink">{t(v.tKey)}</h3>
              <p className="mt-2.5 max-w-[38ch] leading-relaxed text-ink-soft">{t(v.dKey)}</p>
            </article>
          ))}
        </div>

        {/* gap-px over a hairline ground rules the pair for free */}
        <ul className="act-grid mt-[clamp(2.5rem,7vh,4rem)] grid list-none grid-cols-1 gap-px border border-line bg-line p-0 sm:grid-cols-2">
          {ACTIONS.map((a) => (
            <li key={a.k} className="act flex">
              <button
                type="button"
                onClick={a.onSelect}
                data-cursor={a.cursor}
                className="group/act relative flex w-full flex-col overflow-hidden bg-canvas p-7 text-left transition-colors duration-500 hover:bg-brass/[0.035] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass md:p-8"
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="text-brass" aria-hidden="true">
                    <a.icon size={20} strokeWidth={1.4} />
                  </span>
                  <ArrowUpRight
                    size={15}
                    aria-hidden="true"
                    className="text-ink-faint transition-all duration-500 ease-lux group-hover/act:-translate-y-0.5 group-hover/act:translate-x-0.5 group-hover/act:text-brass"
                  />
                </span>
                <span className="mt-5 block font-display text-2xl leading-snug text-ink transition-colors duration-500 group-hover/act:text-brass-soft">
                  {a.k}
                </span>
                <span className="mono mt-2 block text-[0.58rem] tracking-[0.18em] text-ink-faint">
                  {a.detail}
                </span>
                <span className="mt-4 block max-w-[38ch] leading-relaxed text-ink-soft">
                  {a.why}
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-0 bg-brass transition-all duration-700 ease-lux group-hover/act:w-full"
                />
              </button>
            </li>
          ))}
        </ul>

        {/* the promise the rest of the site keeps, restated at the door */}
        <p className="mono mt-8 max-w-[70ch] text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
          {t("contact.disclaimerPre")}{PROJECT.developer}{t("contact.disclaimerPost")}
        </p>
      </section>
      <RelatedPages links={["/brochure", "/residences", "/price"]} />
    </div>
  );
}
