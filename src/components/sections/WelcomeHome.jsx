import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RESIDENCES } from "../../lib/site.js";

const FIELD =
  "w-full border-b border-white/20 bg-transparent py-4 text-white placeholder:text-white/40 outline-none transition-colors focus:border-brass-soft";

/* CHAPTER 10 — WELCOME HOME
   Anticipation, not a form dump. A minimal enquiry that resolves into a
   quiet, luxurious confirmation: "Welcome Home." */
export default function WelcomeHome() {
  const root = useRef(null);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", config: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSent(true); // TODO: wire to CRM / WhatsApp / email
  };

  useGSAP(
    () => {
      if (!sent) return;
      gsap.fromTo(
        gsap.utils.selector(root)(".welcome-word"),
        { yPercent: 120, autoAlpha: 0, filter: "blur(12px)" },
        { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.3, ease: "power4.out", stagger: 0.12 }
      );
    },
    { scope: root, dependencies: [sent] }
  );

  return (
    <section id="enquire" ref={root} className="relative mx-3 min-h-screen overflow-hidden rounded-[2.5rem] bg-ink-900 py-[14vh] text-white md:mx-5">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-brass/10 blur-[140px]" />

      {sent ? (
        <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-[var(--spacing-gutter)] text-center">
          <p className="kicker mb-8 text-champagne-soft">Your enquiry is received</p>
          <h2 className="overflow-hidden font-display text-[clamp(3rem,11vw,9rem)] font-light leading-[0.95]">
            <span className="block overflow-hidden"><span className="welcome-word block">Welcome</span></span>
            <span className="block overflow-hidden"><span className="welcome-word block italic text-brass-soft">Home.</span></span>
          </h2>
          <p className="mt-8 max-w-md text-white/60">
            Our team will reach {form.name.split(" ")[0]} shortly with the brochure,
            price sheet and a private viewing invitation.
          </p>
        </div>
      ) : (
        <div className="relative grid gap-16 px-[var(--spacing-gutter)] lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="kicker mb-8 text-champagne-soft">Chapter 10 — Welcome Home</p>
            <h2 className="font-display text-[clamp(2.6rem,8vw,7rem)] font-light leading-[0.98]">
              Your residence <span className="italic text-brass-soft">awaits.</span>
            </h2>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-white/60">
              A limited collection at {"Sector 58, Gurgaon"}. Register your interest to
              receive the brochure, pricing and a private viewing — before anyone else.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
            <input className={FIELD} placeholder="Full name" value={form.name} onChange={set("name")} required />
            <input className={FIELD} placeholder="Phone number" type="tel" value={form.phone} onChange={set("phone")} required />
            <input className={FIELD} placeholder="Email address" type="email" value={form.email} onChange={set("email")} />
            <select className={`${FIELD} appearance-none`} value={form.config} onChange={set("config")}>
              <option value="" className="bg-ink-900">Configuration of interest</option>
              {RESIDENCES.map((r) => (
                <option key={r.id} value={r.id} className="bg-ink-900">{r.name}</option>
              ))}
            </select>
            <button
              type="submit"
              data-cursor="OPEN"
              className="group mt-4 inline-flex w-full items-center justify-center gap-2 bg-white py-4 font-sans text-sm font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-brass-soft"
            >
              Register Interest
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
