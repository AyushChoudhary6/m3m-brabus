import { ArrowUpRight } from "lucide-react";
import { icon } from "../../lib/icons.js";
import { useEnquiry } from "./Enquiry.jsx";

/* A single project fact (Ch. 25).
   If the official listing publishes the figure we state it plainly.
   If it doesn't, we say so and offer to send it — an unknown becomes a
   lead instead of a fabricated number or an awkward blank. */
export default function Fact({ fact, className = "" }) {
  const { openEnquiry } = useEnquiry();
  const Icon = icon(fact.icon);
  const known = Boolean(fact.value);

  return (
    <div className={`group flex gap-4 ${className}`}>
      <span className="mt-0.5 shrink-0 text-brass" aria-hidden="true">
        <Icon size={20} strokeWidth={1.4} />
      </span>
      <div className="min-w-0">
        <p className="mono text-[0.58rem] leading-relaxed tracking-[0.2em] text-ink-faint">{fact.label}</p>

        {known ? (
          <p className="mt-1.5 text-balance font-display text-base font-light leading-snug text-ink sm:text-lg">
            {fact.value}
          </p>
        ) : (
          /* The arrow flows INLINE after the last word rather than sitting as a
             flex sibling — as a flex item it was centred against the whole
             wrapped block, leaving it stranded mid-height beside two or three
             lines of text. text-balance evens the line lengths so labels like
             "Get possession update" break sensibly in a narrow cell. */
          <button
            type="button"
            onClick={() => openEnquiry(fact.label)}
            className="mt-1.5 text-balance text-left font-display text-base font-light leading-snug text-brass transition-colors hover:text-brass-soft sm:text-lg"
          >
            {fact.cta || "On request"}
            <ArrowUpRight
              size={15}
              className="ml-1 inline-block align-[-0.12em] transition-transform duration-500 group-hover:translate-x-0.5"
            />
          </button>
        )}

        {fact.note && (
          <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{fact.note}</p>
        )}
      </div>
    </div>
  );
}
