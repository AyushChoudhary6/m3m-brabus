import Counter from "../ui/Counter.jsx";
import { RevealGroup, RevealItem } from "../ui/Reveal.jsx";
import { STATS } from "../../lib/site.js";

export default function Stats() {
  return (
    <section className="border-y border-line bg-cream">
      <RevealGroup className="container-lux grid grid-cols-2 gap-y-10 py-16 md:grid-cols-4">
        {STATS.map((s) => (
          <RevealItem
            key={s.label}
            className="border-l border-line pl-6 first:border-l-0 first:pl-0 md:border-l md:pl-8"
          >
            <div className="font-display text-[clamp(2.6rem,5vw,3.8rem)] font-light leading-none text-ink">
              <Counter value={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-3 text-xs uppercase tracking-[0.18em] text-ink-faint">
              {s.label}
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
