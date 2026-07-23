/**
 * Renders the `body` block array documented at the top of src/lib/blog.js.
 *
 * A Block is exactly one of:
 *   { h2 } | { p } | { ul } | { ol } | { quote } | { note }
 *
 * Deliberately un-animated. Every other section of the site fades in on
 * scroll, but this is the indexable prose — an editorial body that starts at
 * opacity 0 is a body a crawler may capture at opacity 0. Motion here would
 * also fight the reading rhythm, which is the whole point of the measure.
 *
 * Unknown or malformed blocks are skipped rather than thrown on: a single
 * typo in a content file should cost one paragraph, not the whole page.
 */

/** Long-form measure. Wide enough to feel generous, short enough to read. */
const MEASURE = "max-w-[68ch]";

function H2({ children }) {
  return (
    <h2 className={`${MEASURE} mt-[clamp(3rem,7vh,4.5rem)] border-t border-line pt-8 font-display text-[clamp(1.6rem,3.4vw,2.35rem)] font-light leading-[1.12] tracking-[-0.02em] text-ink first:mt-0 first:border-0 first:pt-0`}>
      {children}
    </h2>
  );
}

function P({ children }) {
  return (
    <p className={`${MEASURE} mt-6 text-[1.0625rem] leading-[1.85] text-ink-soft`}>
      {children}
    </p>
  );
}

function UL({ items }) {
  return (
    <ul className={`${MEASURE} mt-7 border-t border-line-soft`}>
      {items.map((it, i) => (
        <li
          key={i}
          className="grid grid-cols-[1.25rem_1fr] items-baseline gap-4 border-b border-line-soft py-3.5"
        >
          {/* a gold hairline instead of a bullet — quieter, and it aligns */}
          <span aria-hidden="true" className="mt-2 block h-px w-3 bg-brass/70" />
          <span className="text-[1rem] leading-[1.8] text-ink-soft">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function OL({ items }) {
  return (
    <ol className={`${MEASURE} mt-7 border-t border-line-soft`}>
      {items.map((it, i) => (
        <li
          key={i}
          className="grid grid-cols-[2rem_1fr] items-baseline gap-4 border-b border-line-soft py-3.5"
        >
          {/* numerals are rendered, not CSS counters, so they match the .idx
              editorial numbering used across the rest of the site */}
          <span aria-hidden="true" className="idx">{String(i + 1).padStart(2, "0")}</span>
          <span className="text-[1rem] leading-[1.8] text-ink-soft">{it}</span>
        </li>
      ))}
    </ol>
  );
}

function Quote({ children }) {
  return (
    <figure className={`${MEASURE} mt-[clamp(2.5rem,6vh,3.5rem)] mb-[clamp(2.5rem,6vh,3.5rem)]`}>
      <blockquote className="border-l border-brass/70 py-1 pl-7 sm:pl-9">
        <p className="font-serif text-[clamp(1.25rem,2.6vw,1.7rem)] italic leading-[1.5] tracking-[-0.01em] text-ink">
          {children}
        </p>
      </blockquote>
    </figure>
  );
}

function Note({ children }) {
  return (
    <aside className={`${MEASURE} mt-8 rounded-[1.15rem] border border-line bg-cream p-6 sm:p-7`}>
      <p className="mt-3 text-[0.95rem] leading-[1.75] text-ink-soft">{children}</p>
    </aside>
  );
}

export default function BlogBody({ blocks = [] }) {
  if (!Array.isArray(blocks) || !blocks.length) return null;

  return (
    <div className="container-lux pb-[clamp(3rem,8vh,5rem)]">
      {blocks.map((b, i) => {
        if (!b || typeof b !== "object") return null;

        if (typeof b.h2 === "string") return <H2 key={i}>{b.h2}</H2>;
        if (typeof b.p === "string") return <P key={i}>{b.p}</P>;
        if (Array.isArray(b.ul) && b.ul.length) return <UL key={i} items={b.ul} />;
        if (Array.isArray(b.ol) && b.ol.length) return <OL key={i} items={b.ol} />;
        if (typeof b.quote === "string") return <Quote key={i}>{b.quote}</Quote>;
        if (typeof b.note === "string") return <Note key={i}>{b.note}</Note>;

        return null; // unrecognised block — skipped, never fatal
      })}
    </div>
  );
}
