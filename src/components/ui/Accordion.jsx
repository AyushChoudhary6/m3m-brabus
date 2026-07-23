import { useId, useState } from "react";
import { Plus } from "lucide-react";

/* Editorial accordion — one panel at a time.
 *
 * THE ANSWER TEXT IS NEVER CONDITIONALLY RENDERED. Every route on this site is
 * prerendered to real HTML by headless Chrome and the FAQ copy is a large part
 * of what crawlers (and the FAQPage JSON-LD alongside it) are there to read. A
 * closed panel is therefore closed geometrically — the words stay in the
 * document at all times. Swap this for `{isOpen && …}` and the answers vanish
 * from dist/**\/index.html without a single test failing.
 *
 * The open/close is a pure CSS grid-template-rows transition (0fr → 1fr), not a
 * JS height animation. The previous version had GSAP and React both writing
 * inline `height` on the same element, with a ref that suppressed the first
 * effect — between the two, a click could leave a panel stuck. Nothing here
 * touches inline styles imperatively, so the rendered state always follows
 * from `open` and the panels cannot desync from it.
 */
export default function Accordion({ items, initialOpen = 0, className = "" }) {
  const [open, setOpen] = useState(initialOpen);
  const uid = useId();

  return (
    <div className={`divide-y divide-line border-y border-line ${className}`}>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <button
              type="button"
              id={`${uid}-q${i}`}
              aria-expanded={isOpen}
              aria-controls={`${uid}-a${i}`}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
            >
              <span
                className={`font-display text-lg transition-colors md:text-xl ${isOpen ? "text-ink" : "text-ink-soft"}`}
              >
                {f.q}
              </span>
              <span
                aria-hidden="true"
                className={`shrink-0 transition-[transform,color] duration-300 ease-lux ${
                  isOpen ? "rotate-45 text-brass" : "text-ink-faint"
                }`}
              >
                <Plus size={20} />
              </span>
            </button>

            {/* grid + minmax(0,Xfr) is what makes an auto-height panel animate:
                the row resolves to the content's height at 1fr and to nothing at
                0fr, with the inner element clipping the overflow in between. */}
            <div
              id={`${uid}-a${i}`}
              role="region"
              aria-labelledby={`${uid}-q${i}`}
              className="grid transition-[grid-template-rows] duration-500 ease-lux"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-7 leading-relaxed text-ink-soft">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
