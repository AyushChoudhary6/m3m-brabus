import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Phone, Mail, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import { submitLead, markLeadCaptured } from "../lib/leads.js";
import { sanitizeField, validateField, validateLead, isClean } from "../lib/validate.js";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT, RESIDENCES } from "../lib/site.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FIELD =
  "w-full border-b border-line bg-transparent py-3.5 text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-brass";

const VISIT = [
  { k: "01", t: "Book a slot", d: "Share your details and the team will confirm a time that suits you — weekdays or weekends." },
  { k: "02", t: "A private walkthrough", d: "You'll be shown the layouts, finishes and the amenity plan by the private client team, without a crowd." },
  { k: "03", t: "The paperwork", d: "Pricing, payment plan, RERA status and allotment terms explained in full before anything is signed." },
];

export default function Contact() {
  const root = useRef(null);
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", phone: "", email: "", config: "", message: "" });
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

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const errs = validateLead(form);
    if (!isClean(errs)) { setErrors(errs); return; }
    setSending(true);
    setError("");
    try {
      await submitLead({ ...form, source: "Contact page" });
      markLeadCaptured();
      setSent(true);
    } catch {
      setError("err.send");
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
      });
    },
    { scope: root },
  );

  const CHANNELS = [
    { icon: Phone, k: "Sales enquiries", v: PROJECT.phone, href: `tel:${PROJECT.phone}` },
    { icon: MessageCircle, k: "WhatsApp", v: "Message the team", href: `https://wa.me/${PROJECT.whatsapp}` },
    { icon: Mail, k: "Email", v: PROJECT.email, href: `mailto:${PROJECT.email}` },
    { icon: MapPin, k: "Site address", v: PROJECT.address, href: "/location" },
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
        eyebrow="Contact M3M Brabus"
        title="A private"
        accent="consultation."
        lede="Speak with the private client team for the brochure, price list, floor plans and a viewing at your convenience."
      />

      {/* channels + form */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* channels */}
          <div className="ct-grid">
            <p className="mono mb-6 text-[0.6rem] tracking-[0.24em] text-ink-faint">Direct lines</p>
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
                  {t("enq.thankYou")} <span className="font-serif italic text-brass">{form.name.split(" ")[0] || "friend"}.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
                  Our private client team will reach you shortly with the brochure,
                  pricing and a viewing invitation.
                </p>
              </div>
            ) : (
              <div className="relative">
                <p className="kicker">Enquiry</p>
                <h2 className="mt-3 font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-light leading-[1.05] text-ink">
                  Tell us what you're <span className="font-serif italic text-brass">looking for.</span>
                </h2>
                <form onSubmit={submit} className="mt-7 space-y-5">
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <input className={fieldCls("name")} placeholder={t("form.name")} autoComplete="name" value={form.name} onChange={set("name")} onBlur={blur("name")} />
                      {errors.name && <p className="mt-1.5 text-[0.72rem] text-oxblood">{t(errors.name)}</p>}
                    </div>
                    <div>
                      <input className={fieldCls("phone")} placeholder={t("form.phone")} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} onBlur={blur("phone")} />
                      {errors.phone && <p className="mt-1.5 text-[0.72rem] text-oxblood">{t(errors.phone)}</p>}
                    </div>
                  </div>
                  <div>
                    <input className={fieldCls("email")} placeholder={t("form.email")} type="email" autoComplete="email" value={form.email} onChange={set("email")} onBlur={blur("email")} />
                    {errors.email && <p className="mt-1.5 text-[0.72rem] text-oxblood">{t(errors.email)}</p>}
                  </div>
                  <select className={`${FIELD} appearance-none`} value={form.config} onChange={set("config")}>
                    <option value="">{t("form.config")}</option>
                    {RESIDENCES.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                  <textarea
                    className={`${FIELD} resize-none`}
                    rows={3}
                    placeholder={t("form.message")}
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
          <span className="kicker">Plan a site visit</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-3">
          {VISIT.map((v) => (
            <article key={v.t} className="vs border-t border-line py-7">
              <span className="idx">{v.k}</span>
              <h3 className="mt-3 font-display text-2xl text-ink">{v.t}</h3>
              <p className="mt-2.5 max-w-[38ch] leading-relaxed text-ink-soft">{v.d}</p>
            </article>
          ))}
        </div>
      </section>
      <RelatedPages links={["/brochure", "/residences", "/price"]} />
    </div>
  );
}
