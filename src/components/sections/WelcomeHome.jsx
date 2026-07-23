import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { submitLead, markLeadCaptured } from "../../lib/leads.js";
import { startTimer } from "../../lib/spam.js";
import { sanitizeField, validateField, validateLead, isClean } from "../../lib/validate.js";
import { useI18n } from "../../lib/i18n.jsx";
import { trackLead } from "../../lib/analytics.js";
import { ChevronDown } from "lucide-react";
import { RESIDENCES } from "../../lib/site.js";

/* Fields sit on a faint raised plate with a hairline edge rather than a bare
   underline: on a dark ground an underline alone reads as unstyled, and the
   plate gives the form a shape at phone widths. Focus lifts the plate and warms
   the edge to brass with a soft ring — no browser default outline. */
const FIELD =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3.5 text-ink placeholder:text-ink-faint outline-none " +
  "transition-[border-color,background-color,box-shadow] duration-300 " +
  "focus:border-brass/70 focus:bg-white/[0.055] focus:shadow-[0_0_0_3px_rgba(201,168,106,0.10)]";

/* Ch. 78 — the clock behind the "too-fast" signal, and the key submitLead() is
   handed so spam.js reads back this form's clock and not another's. */
const FORM_KEY = "Welcome Home section";

/* CHAPTER 07 — WELCOME HOME
   A quiet, editorial enquiry that resolves into a serif confirmation.
   Light ivory, hairline fields, restrained. */
export default function WelcomeHome() {
  const root = useRef(null);
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  // `company` is the honeypot (spam.js HONEYPOT_NAME); it has to live in state,
  // because only what is in `form` reaches submitLead.
  const [form, setForm] = useState({ name: "", phone: "", email: "", config: "", company: "" });
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
      await submitLead({ ...form, source: "Welcome Home section", formKey: FORM_KEY });
      markLeadCaptured();
      trackLead("Welcome Home section", form.config); // BUG-002: was untracked
      setSent(true);
    } catch (err) {
      // A network/endpoint failure has already queued the lead for retry
      // (leads.js throws LeadError{queued:true}); tell the visitor it is safe
      // rather than inviting a give-up or a double-submit.
      if (err && err.queued) { markLeadCaptured(); setSent(true); }
      else setError("err.send");
    } finally {
      setSending(false);
    }
  };

  useGSAP(
    () => {
      if (!sent) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        gsap.utils.selector(root)(".welcome-word"),
        { yPercent: 118, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 1.2, ease: "power4.out", stagger: 0.12 }
      );
    },
    { scope: root, dependencies: [sent] }
  );

  return (
    <section id="enquire" ref={root} className="border-t border-line bg-cream">
      <div className="container-lux py-[clamp(5rem,14vh,10rem)]">
        {sent ? (
          <div className="flex min-h-[46vh] flex-col items-center justify-center text-center">
            <p className="kicker mb-8">{t("swelcome.enquiryReceived")}</p>
            <h2 className="font-display text-[clamp(3rem,11vw,9rem)] font-light leading-[0.92] text-ink">
              <span className="block overflow-hidden"><span className="welcome-word block">{t("swelcome.welcome")}</span></span>
              <span className="block overflow-hidden"><span className="welcome-word block font-serif italic text-brass">{t("swelcome.home")}</span></span>
            </h2>
            <p className="mt-8 max-w-md text-ink-soft">
              {t("swelcome.teamReachPre")} {form.name.split(" ")[0]} {t("swelcome.teamReachPost")}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
            <div>
              <h2 className="mt-7 max-w-[14ch] font-display text-[clamp(2.6rem,8vw,6.5rem)] font-light leading-[0.98] tracking-[-0.02em] text-ink">
                {t("swelcome.residenceLead")} <span className="font-serif italic text-brass">{t("swelcome.awaits")}</span>
              </h2>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft">
                {t("swelcome.intro")}
              </p>
            </div>

            <form onSubmit={submit} onFocus={touch} onInput={touch} className="space-y-3.5">
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
              <div>
                <input className={fieldCls("name")} placeholder={t("form.name")} aria-label={t("form.name")} autoComplete="name" value={form.name} onChange={set("name")} onBlur={blur("name")} />
                {errors.name && <p className="mt-1.5 text-[0.72rem] text-oxblood">{t(errors.name)}</p>}
              </div>
              <div>
                <input className={fieldCls("phone")} placeholder={t("form.phone")} aria-label={t("form.phone")} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} onBlur={blur("phone")} />
                {errors.phone && <p className="mt-1.5 text-[0.72rem] text-oxblood">{t(errors.phone)}</p>}
              </div>
              <div>
                <input className={fieldCls("email")} placeholder={t("form.email")} aria-label={t("form.email")} type="email" autoComplete="email" value={form.email} onChange={set("email")} onBlur={blur("email")} />
                {errors.email && <p className="mt-1.5 text-[0.72rem] text-oxblood">{t(errors.email)}</p>}
              </div>
              {/* appearance-none strips the native arrow, so the control needs
                  one drawn back or it reads as a label, not a dropdown. */}
              <div className="relative">
                <select
                  className={`${FIELD} appearance-none pr-11 ${form.config ? "text-ink" : "text-ink-faint"}`}
                  value={form.config}
                  onChange={set("config")}
                  aria-label={t("form.config")}
                >
                  <option value="">{t("form.config")}</option>
                  {RESIDENCES.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brass"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                data-cursor="OPEN"
                className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brass py-4 font-sans text-sm font-medium uppercase tracking-[0.16em] text-obsidian shadow-[0_18px_40px_-18px_rgba(201,168,106,0.65)] transition-[background-color,box-shadow,transform] duration-500 ease-lux hover:bg-brass-soft hover:shadow-[0_22px_50px_-18px_rgba(201,168,106,0.8)] active:translate-y-px disabled:opacity-70 disabled:shadow-none"
              >
                {sending ? t("cta.sending") : t("cta.registerInterest")}
              </button>
              {error && <p className="text-center text-[0.74rem] text-oxblood">{t(error)}</p>}
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
