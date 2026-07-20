import * as Icons from "lucide-react";
import { useEnquiry } from "./Enquiry.jsx";

/* A single project fact (Ch. 25).
   If the official listing publishes the figure we state it plainly.
   If it doesn't, we say so and offer to send it — an unknown becomes a
   lead instead of a fabricated number or an awkward blank. */
export default function Fact({ fact, className = "" }) {
  const { openEnquiry } = useEnquiry();
  const Icon = Icons[fact.icon] || Icons.Diamond;
  const known = Boolean(fact.value);

  return (
    <div className={`group flex gap-4 ${className}`}>
      <span className="mt-0.5 shrink-0 text-brass" aria-hidden="true">
        <Icon size={20} strokeWidth={1.4} />
      </span>
      <div className="min-w-0">
        <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">{fact.label}</p>

        {known ? (
          <p className="mt-1.5 font-display text-lg font-light leading-snug text-ink">
            {fact.value}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => openEnquiry(fact.label)}
            className="mt-1.5 inline-flex items-center gap-1.5 font-display text-lg font-light leading-snug text-brass transition-colors hover:text-brass-soft"
          >
            {fact.cta || "On request"}
            <Icons.ArrowUpRight size={15} className="transition-transform duration-500 group-hover:translate-x-0.5" />
          </button>
        )}

        {fact.note && (
          <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{fact.note}</p>
        )}
      </div>
    </div>
  );
}
