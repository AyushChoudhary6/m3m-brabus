import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { RESIDENCES, PROJECT } from "../../lib/site.js";

/* Right-docked enquiry panel. Open on landing so a visitor can fill it right
   away; auto-slides off to the right on scroll (leaving a gold "ENQUIRE" edge
   tab); clicking the tab slides it back. Desktop only — mobile has the bottom
   bar + modal. */
const FIELD =
  "w-full border-b border-line bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-brass";

export default function SideEnquiry() {
  const [open, setOpen] = useState(true);
  const [cardW, setCardW] = useState(340);
  const [form, setForm] = useState({ name: "", phone: "", email: "", config: "" });
  const [sent, setSent] = useState(false);
  const cardRef = useRef(null);
  const manual = useRef(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useLayoutEffect(() => {
    const measure = () => cardRef.current && setCardW(cardRef.current.offsetWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // open near the top, tuck away on scroll (unless the user toggled it manually)
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 24) { manual.current = false; setOpen(true); return; }
      if (!manual.current) setOpen(window.scrollY < 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = () => { manual.current = true; setOpen((o) => !o); };
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    try { localStorage.setItem("mb-lead", "1"); } catch { /* private mode */ }
    setSent(true); // TODO: wire to CRM / WhatsApp / email
  };

  return (
    <div className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <div
        className="flex items-stretch transition-transform duration-[700ms] ease-lux"
        style={{ transform: `translateX(${open ? 0 : cardW}px)` }}
      >
        {/* edge tab (left of the card) */}
        <button
          type="button"
          onClick={toggle}
          aria-label={open ? "Hide enquiry form" : "Open enquiry form"}
          className="group flex w-11 flex-col items-center justify-center gap-3 rounded-l-[1.25rem] border border-r-0 border-brass/40 bg-brass py-6 text-obsidian shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] transition-colors hover:bg-brass-soft"
        >
          {open ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <span className="mono text-[0.62rem] font-medium tracking-[0.24em] [writing-mode:vertical-rl]">Enquire</span>
          {open ? <ChevronRight size={16} className="opacity-0" /> : <ChevronLeft size={16} className="opacity-0" />}
        </button>

        {/* card */}
        <div
          ref={cardRef}
          className="relative w-[340px] overflow-hidden rounded-l-[1.5rem] border border-r-0 border-brass/25 bg-paper/95 p-7 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl"
        >
          <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />

          {sent ? (
            <div className="relative py-4 text-center">
              <p className="kicker">Received</p>
              <h3 className="mt-3 font-display text-3xl font-light leading-none text-ink">
                Thank you, <span className="font-serif italic text-brass">{form.name.split(" ")[0] || "friend"}.</span>
              </h3>
              <p className="mx-auto mt-4 max-w-[24ch] text-sm leading-relaxed text-ink-soft">
                Our team will reach you shortly with the brochure and pricing.
              </p>
            </div>
          ) : (
            <div className="relative">
              <p className="kicker">Private enquiry</p>
              <h3 className="mt-2 font-display text-[1.7rem] font-light leading-[1.05] tracking-[-0.01em] text-ink">
                Register your <span className="font-serif italic text-brass">interest.</span>
              </h3>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-soft">
                {PROJECT.configs} · {PROJECT.location}
              </p>

              <form onSubmit={submit} className="mt-5 space-y-3.5">
                <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
                <input className={FIELD} placeholder="Full name" value={form.name} onChange={set("name")} required />
                <input className={FIELD} placeholder="Phone number" type="tel" value={form.phone} onChange={set("phone")} required />
                <input className={FIELD} placeholder="Email address" type="email" value={form.email} onChange={set("email")} />
                <select className={`${FIELD} appearance-none`} value={form.config} onChange={set("config")}>
                  <option value="">Configuration of interest</option>
                  {RESIDENCES.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  data-cursor="OPEN"
                  className="group/cta relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-brass py-3 font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-obsidian"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass-soft transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10">Register interest</span>
                  <ArrowRight size={14} className="relative z-10 transition-transform duration-500 group-hover/cta:translate-x-1" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
