import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import { Reveal } from "../ui/Reveal.jsx";
import { RESIDENCES } from "../../lib/site.js";

const FIELD =
  "w-full border-b border-line bg-transparent py-4 text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-brass";

export default function LeadForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", config: "" });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    // TODO: wire to CRM / email endpoint / WhatsApp API.
    setSent(true);
  };

  return (
    <section id="enquire" className="relative scroll-mt-24 overflow-hidden border-y border-line bg-cream py-24 md:py-32">
      <div className="pointer-events-none absolute -right-40 top-0 h-[34rem] w-[34rem] rounded-full bg-brass/10 blur-[130px]" />
      <div className="container-lux grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <Reveal>
          <p className="kicker mb-5">Private Enquiry</p>
          <h2 className="max-w-[14ch] text-[clamp(2.2rem,5.5vw,3.8rem)] font-light leading-[1.04] text-ink">
            Request the brochure & <span className="italic text-brass">price sheet.</span>
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-ink-soft">
            A limited collection of residences. Register your interest and our
            team will share the detailed floor plans, pricing and payment plan —
            and arrange a private viewing.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative rounded-sm border border-line bg-paper p-8 shadow-[0_30px_80px_-40px_rgba(23,20,15,0.25)] md:p-12">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex min-h-[320px] flex-col items-center justify-center text-center"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-brass/40 text-brass">
                    <Check size={26} />
                  </span>
                  <h3 className="mt-6 font-display text-2xl text-ink">
                    Thank you, {form.name.split(" ")[0]}.
                  </h3>
                  <p className="mt-3 max-w-xs text-ink-soft">
                    Our sales team will reach you shortly with the complete
                    brochure and price details.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
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
                    className="group mt-4 inline-flex w-full items-center justify-center gap-2 bg-ink py-4 font-sans text-sm font-medium uppercase tracking-[0.14em] text-canvas transition-colors hover:bg-brass"
                  >
                    Register Interest
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                  <p className="text-center text-xs text-ink-faint">
                    By submitting you agree to be contacted about M3M Brabus.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
