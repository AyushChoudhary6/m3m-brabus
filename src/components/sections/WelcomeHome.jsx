import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RESIDENCES } from "../../lib/site.js";

const FIELD =
  "w-full border-b border-line bg-transparent py-4 text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-brass";

/* CHAPTER 07 — WELCOME HOME
   A quiet, editorial enquiry that resolves into a serif confirmation.
   Light ivory, hairline fields, restrained. */
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
            <p className="kicker mb-8">Your enquiry is received</p>
            <h2 className="font-display text-[clamp(3rem,11vw,9rem)] font-light leading-[0.92] text-ink">
              <span className="block overflow-hidden"><span className="welcome-word block">Welcome</span></span>
              <span className="block overflow-hidden"><span className="welcome-word block font-serif italic text-brass">Home.</span></span>
            </h2>
            <p className="mt-8 max-w-md text-ink-soft">
              Our team will reach {form.name.split(" ")[0]} shortly with the brochure,
              price sheet and a private viewing invitation.
            </p>
          </div>
        ) : (
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
            <div>
              <div className="flex items-baseline gap-5">
                <span className="idx">08</span>
                <span className="kicker">Welcome Home</span>
              </div>
              <h2 className="mt-7 max-w-[14ch] font-display text-[clamp(2.6rem,8vw,6.5rem)] font-light leading-[0.98] tracking-[-0.02em] text-ink">
                Your residence <span className="font-serif italic text-brass">awaits.</span>
              </h2>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft">
                A limited collection at Sector 58, Gurgaon. Register your interest to
                receive the brochure, pricing and a private viewing — before anyone else.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
              <input className={FIELD} placeholder="Full name" value={form.name} onChange={set("name")} required />
              <input className={FIELD} placeholder="Phone number" type="tel" value={form.phone} onChange={set("phone")} required />
              <input className={FIELD} placeholder="Email address" type="email" value={form.email} onChange={set("email")} />
              <select className={`${FIELD} appearance-none`} value={form.config} onChange={set("config")}>
                <option value="">Configuration of interest</option>
                {RESIDENCES.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <button
                type="submit"
                data-cursor="OPEN"
                className="group mt-4 inline-flex w-full items-center justify-center gap-2 bg-ink py-4 font-sans text-sm font-medium uppercase tracking-[0.14em] text-canvas transition-colors hover:bg-brass"
              >
                Register Interest
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
