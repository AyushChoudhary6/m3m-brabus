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

  /* Icon sits ABOVE the text on phones. Beside it, the icon plus its gap took
     ~36px of a ~195px two-up cell, which left too little room for even a
     two-word label like "Request details" — it wrapped every time. Stacked, the
     label gets the full cell width and fits on one line. */
  return (
    <div className={`group flex flex-col gap-2.5 sm:flex-row sm:gap-4 ${className}`}>
      <span className="shrink-0 text-brass sm:mt-0.5" aria-hidden="true">
        <Icon size={20} strokeWidth={1.4} />
      </span>
      <div className="min-w-0">
        <p className="mono text-[0.58rem] leading-relaxed tracking-[0.2em] text-ink-faint">{fact.label}</p>

        {known ? (
          <p className="mt-1.5 text-balance font-display text-[0.95rem] font-light leading-snug text-ink sm:text-lg">
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
            className="mt-1.5 text-balance text-left font-display text-[0.95rem] font-light leading-snug text-brass transition-colors hover:text-brass-soft sm:text-lg"
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
