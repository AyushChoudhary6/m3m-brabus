import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import Magnetic from "../ui/Magnetic.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 04 — THE FLOOR PLAN
   Both configurations, side by side and live — no toggle. Hover any room on
   either plan and it lights in gold while that plan's caption reads its area.
   Each unit outline draws itself on entry and the rooms stagger up. */
const PLANS = {
  "4bhk": {
    label: "4 BHK", tag: "The Signature", total: "≈ 5,000 sq.ft",
    rooms: [
      { n: "Living & Dining", a: "1,300 sq.ft", x: 10, y: 10, w: 370, h: 230 },
      { n: "Kitchen", a: "320 sq.ft", x: 10, y: 250, w: 175, h: 120 },
      { n: "Foyer", a: "220 sq.ft", x: 195, y: 250, w: 185, h: 120 },
      { n: "Balcony", a: "540 sq.ft", x: 10, y: 380, w: 370, h: 150 },
      { n: "Master Suite", a: "820 sq.ft", x: 390, y: 10, w: 400, h: 170 },
      { n: "Bedroom 2", a: "520 sq.ft", x: 390, y: 190, w: 195, h: 150 },
      { n: "Bedroom 3", a: "500 sq.ft", x: 595, y: 190, w: 195, h: 150 },
      { n: "Bedroom 4", a: "480 sq.ft", x: 390, y: 350, w: 195, h: 180 },
      { n: "Wellness Bath", a: "300 sq.ft", x: 595, y: 350, w: 195, h: 180 },
    ],
  },
  "5bhk": {
    label: "5 BHK", tag: "The Grand", total: "≈ 7,000 sq.ft",
    rooms: [
      { n: "Living & Dining", a: "1,450 sq.ft", x: 10, y: 10, w: 370, h: 220 },
      { n: "Family Lounge", a: "620 sq.ft", x: 10, y: 240, w: 175, h: 130 },
      { n: "Kitchen", a: "360 sq.ft", x: 195, y: 240, w: 185, h: 130 },
      { n: "Balcony", a: "560 sq.ft", x: 10, y: 380, w: 370, h: 150 },
      { n: "Master Suite", a: "950 sq.ft", x: 390, y: 10, w: 400, h: 150 },
      { n: "Bedroom 2", a: "620 sq.ft", x: 390, y: 170, w: 195, h: 130 },
      { n: "Bedroom 3", a: "600 sq.ft", x: 595, y: 170, w: 195, h: 130 },
      { n: "Bedroom 4", a: "560 sq.ft", x: 390, y: 310, w: 195, h: 110 },
      { n: "Bedroom 5", a: "540 sq.ft", x: 595, y: 310, w: 195, h: 110 },
      { n: "Study", a: "360 sq.ft", x: 390, y: 430, w: 195, h: 100 },
      { n: "Sky Lounge", a: "380 sq.ft", x: 595, y: 430, w: 195, h: 100 },
    ],
  },
};

export default function FloorPlan() {
  const root = useRef(null);
  const [hover, setHover] = useState(null); // { key, i }
  const { openEnquiry } = useEnquiry();

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);
      q(".plan-frame").forEach((f) => {
        const len = (f.getTotalLength && f.getTotalLength()) || 2680;
        gsap.set(f, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(q(".room"), { autoAlpha: 0, y: 16 });

      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top 74%" } })
        .to(q(".plan-frame"), { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, 0)
        .to(q(".room"), { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.03 }, 0.3);
    },
    { scope: root },
  );

  return (
    <section id="floor-plan" ref={root} className="container-lux py-[clamp(5rem,13vh,9rem)]">
      {/* header */}
      <div className="mb-[clamp(2.5rem,6vh,4.5rem)] grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
        <div className="flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">The Floor Plan</span>
        </div>
        <h2 className="max-w-[20ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
          Two homes, drawn to <span className="font-serif italic text-brass">the last inch.</span>
        </h2>
      </div>

      {/* both plans, side by side */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {Object.entries(PLANS).map(([key, plan]) => {
          const on = hover && hover.key === key ? plan.rooms[hover.i] : null;
          return (
            <div key={key} className="relative rounded-[1.25rem] border border-line bg-cream/40 p-5 md:p-7">
              <div className="gold-glow pointer-events-none absolute -inset-8 [background:radial-gradient(42%_42%_at_50%_42%,rgba(201,168,106,0.09),transparent_70%)]" />

              {/* plan header + live readout */}
              <div className="relative mb-5 flex items-end justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="kicker">{plan.tag}</p>
                  <h3 className="mt-1.5 font-display text-2xl font-light tracking-[-0.01em] text-ink md:text-3xl">{plan.label}</h3>
                </div>
                <div className="text-right">
                  <p className="mono text-[0.55rem] tracking-[0.2em] text-ink-faint">{on ? "Room" : "Carpet"}</p>
                  <p className="mt-1 font-serif text-base italic text-brass md:text-lg">
                    {on ? `${on.n} · ${on.a}` : plan.total}
                  </p>
                </div>
              </div>

              {/* interactive plan */}
              <svg viewBox="0 0 800 540" className="relative w-full" role="img" aria-label={`${plan.label} indicative floor plan`}>
                <rect className="plan-frame" x="1" y="1" width="798" height="538" rx="6" fill="none" stroke="var(--color-brass)" strokeWidth="1.2" strokeOpacity="0.55" />
                {plan.rooms.map((r, i) => {
                  const active = hover && hover.key === key && hover.i === i;
                  return (
                    <g
                      key={r.n}
                      className="room cursor-pointer"
                      onMouseEnter={() => setHover({ key, i })}
                      onMouseLeave={() => setHover(null)}
                    >
                      <rect
                        x={r.x} y={r.y} width={r.w} height={r.h} rx="3"
                        style={{
                          fill: active ? "rgba(201,168,106,0.20)" : "rgba(201,168,106,0.045)",
                          stroke: active ? "#c9a86a" : "rgba(201,168,106,0.28)",
                          strokeWidth: active ? 1.8 : 1,
                          transition: "fill .35s, stroke .35s, stroke-width .35s",
                        }}
                      />
                      <text
                        x={r.x + r.w / 2} y={r.y + r.h / 2 - 3}
                        textAnchor="middle"
                        className={active ? "fill-bone" : "fill-ink-soft"}
                        style={{ fontFamily: "var(--font-display)", fontSize: r.w < 190 ? 15 : 18, transition: "fill .35s" }}
                      >
                        {r.n}
                      </text>
                      <text
                        x={r.x + r.w / 2} y={r.y + r.h / 2 + 17}
                        textAnchor="middle"
                        className={active ? "fill-brass-soft" : "fill-ink-faint"}
                        style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", transition: "fill .35s" }}
                      >
                        {r.a}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <p className="mono mt-4 text-[0.56rem] tracking-[0.2em] text-ink-faint">Indicative layout · not to scale</p>
            </div>
          );
        })}
      </div>

      {/* shared CTA */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
        <p className="max-w-md text-sm leading-relaxed text-ink-soft">
          Detailed dimensioned drawings, unit variants and the master site plan are shared privately on request.
        </p>
        <Magnetic>
          <button
            type="button"
            onClick={() => openEnquiry("Floor plans")}
            data-cursor="REQUEST"
            className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-6 py-3.5"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
            <span className="relative z-10 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
              Request detailed floor plans
            </span>
            <ArrowUpRight size={14} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
          </button>
        </Magnetic>
      </div>
    </section>
  );
}
