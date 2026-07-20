import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { submitLead, markLeadCaptured } from "../../lib/leads.js";
import { sanitizeField, validateField, validateLead, isClean } from "../../lib/validate.js";
import { useI18n } from "../../lib/i18n.jsx";
import { RESIDENCES, PROJECT } from "../../lib/site.js";

const EnquiryCtx = createContext(null);
export const useEnquiry = () => useContext(EnquiryCtx) || { openEnquiry: () => {} };

const AUTO_DELAY = 40000; // 40 seconds
const KEY_LEAD = "mb-lead"; // submitted a real enquiry — don't auto-invite on future visits

const ls = {
  get: (store, k) => { try { return window[store].getItem(k); } catch { return null; } },
  set: (store, k, v) => { try { window[store].setItem(k, v); } catch { /* private mode */ } },
};

/* Global enquiry popup + a gentle timed invitation.
   Any button calls openEnquiry("subject"). After 1 minute an inviting version
   appears once; closing it snoozes for the session so it never nags. */
export function EnquiryProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [auto, setAuto] = useState(false);
  const openRef = useRef(false);
  useEffect(() => { openRef.current = open; }, [open]);

  const shownRef = useRef(false);

  const openEnquiry = useCallback((subj = "", isAuto = false) => {
    if (isAuto) {
      if (shownRef.current || ls.get("localStorage", KEY_LEAD)) return; // once per visit; never after a real submit
      shownRef.current = true;
    }
    setSubject(subj);
    setAuto(isAuto);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // timed invitation — fires once, ~40s after load
  useEffect(() => {
    if (ls.get("localStorage", KEY_LEAD)) return;
    const t = setTimeout(() => {
      if (!openRef.current) openEnquiry("", true);
    }, AUTO_DELAY);
    return () => clearTimeout(t);
  }, [openEnquiry]);

  return (
    <EnquiryCtx.Provider value={{ openEnquiry }}>
      {children}
      <EnquiryModal open={open} subject={subject} auto={auto} onClose={close} />
    </EnquiryCtx.Provider>
  );
}

const FIELD =
  "w-full border-b border-line bg-transparent py-3.5 text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-brass";

function EnquiryModal({ open, subject, auto, onClose }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", phone: "", email: "", config: "" });
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

  useEffect(() => {
    if (!open) return;
    setSent(false);
    setSending(false);
    setError("");
    setErrors({});
    setForm((f) => ({ ...f, config: subject && subject.includes("BHK") ? subject : f.config }));
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, subject, onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const errs = validateLead(form);
    if (!isClean(errs)) { setErrors(errs); return; }
    setSending(true);
    setError("");
    try {
      await submitLead({ ...form, source: auto ? "Timed invite" : subject ? `Modal · ${subject}` : "Modal" });
      markLeadCaptured(); // never auto-invite again
      setSent(true);
    } catch {
      setError("err.send");
    } finally {
      setSending(false);
    }
  };

  const kicker = sent ? t("enq.received") : auto ? t("enq.invitation") : subject ? `${t("enq.enquiry")} · ${subject}` : t("enq.private");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          data-lenis-prevent
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-md overflow-hidden rounded-[1.4rem] border border-brass/25 bg-paper p-8 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] md:p-10"
          >
            <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.16),transparent_70%)]" />
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/60 to-transparent" />

            <button
              onClick={onClose}
              aria-label="Close"
              data-cursor="CLOSE"
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-brass hover:text-brass"
            >
              <X size={16} />
            </button>

            {sent ? (
              <div className="relative py-6 text-center">
                <p className="kicker">{kicker}</p>
                <h3 className="mt-4 font-display text-[clamp(2rem,7vw,3rem)] font-light leading-[0.95] text-ink">
                  {t("enq.thankYou")} <span className="font-serif italic text-brass">{form.name.split(" ")[0] || "friend"}.</span>
                </h3>
                <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
{t("enq.thanksBody")}
                </p>
                <button onClick={onClose} className="mt-8 mono text-[0.66rem] tracking-[0.2em] text-brass transition-colors hover:text-brass-soft">
                  {t("nav.close")}
                </button>
              </div>
            ) : (
              <div className="relative">
                <p className="kicker">{kicker}</p>
                <h3 className="mt-3 font-display text-[clamp(1.9rem,6vw,2.6rem)] font-light leading-[1.02] tracking-[-0.01em] text-ink">
                  {auto ? (
                    <>{t("enq.autoTitleA")} <span className="font-serif italic text-brass">{t("enq.autoTitleB")}</span></>
                  ) : (
                    <>{t("enq.titleA")} <span className="font-serif italic text-brass">{t("enq.titleB")}</span></>
                  )}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {auto ? t("enq.autoBody") : `${PROJECT.configs} · ${PROJECT.location}. ${t("enq.body")}`}
                </p>

                <form onSubmit={submit} className="mt-7 space-y-5">
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
                  <div>
                    <input className={fieldCls("name")} placeholder={t("form.name")} autoComplete="name" value={form.name} onChange={set("name")} onBlur={blur("name")} />
                    {errors.name && <p className="mt-1.5 text-[0.7rem] text-oxblood">{t(errors.name)}</p>}
                  </div>
                  <div>
                    <input className={fieldCls("phone")} placeholder={t("form.phone")} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} onBlur={blur("phone")} />
                    {errors.phone && <p className="mt-1.5 text-[0.7rem] text-oxblood">{t(errors.phone)}</p>}
                  </div>
                  <div>
                    <input className={fieldCls("email")} placeholder={t("form.email")} type="email" autoComplete="email" value={form.email} onChange={set("email")} onBlur={blur("email")} />
                    {errors.email && <p className="mt-1.5 text-[0.7rem] text-oxblood">{t(errors.email)}</p>}
                  </div>
                  <select className={`${FIELD} appearance-none`} value={form.config} onChange={set("config")}>
                    <option value="">{t("form.config")}</option>
                    {RESIDENCES.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={sending}
                    data-cursor="OPEN"
                    className="group/cta relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-brass py-4 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-obsidian transition-colors disabled:opacity-70"
                  >
                    <span className="absolute inset-0 origin-left scale-x-0 bg-brass-soft transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                    <span className="relative z-10">
                      {sending ? t("cta.sending") : auto ? t("cta.sendMeDetails") : t("cta.registerInterest")}
                    </span>
                    {!sending && <ArrowRight size={15} className="relative z-10 transition-transform duration-500 group-hover/cta:translate-x-1" />}
                  </button>
                  {error && <p className="text-center text-[0.72rem] text-oxblood">{t(error)}</p>}

                  {auto ? (
                    <button type="button" onClick={onClose} className="mono block w-full text-center text-[0.58rem] tracking-[0.18em] text-ink-faint transition-colors hover:text-ink-soft">
                      {t("cta.maybeLater")}
                    </button>
                  ) : (
                    <p className="mono text-center text-[0.55rem] tracking-[0.18em] text-ink-faint">{t("cta.orCall")} {PROJECT.phone}</p>
                  )}
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
