import { useId, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Plus } from "lucide-react";

gsap.registerPlugin(useGSAP);

/* Editorial accordion — one panel at a time.
 *
 * THE ANSWER TEXT IS NEVER CONDITIONALLY RENDERED. Every route on this site is
 * prerendered to real HTML by headless Chrome and the FAQ copy is a large part
 * of what crawlers (and the FAQPage JSON-LD alongside it) are there to read. A
 * closed panel is therefore closed with height and overflow only: the words
 * stay in the document at all times. Swap this for `{isOpen && …}` and the
 * answers vanish from dist/**\/index.html without a single test failing.
 *
 * For the same reason the collapse is geometric — height, not opacity or
 * visibility — so there is nothing about the resting state a crawler could
 * read as concealed text.
 */
export default function Accordion({ items, initialOpen = 0, className = "" }) {
  const [open, setOpen] = useState(initialOpen);
  const root = useRef(null);
  const panels = useRef([]);
  const settled = useRef(false);
  const uid = useId();

  useGSAP(
    () => {
      /* The first pass has nothing to do: React has already rendered the
         resting state below, and animating it would only fight the markup. */
      if (!settled.current) {
        settled.current = true;
        return;
      }

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      panels.current.forEach((el, i) => {
        if (!el) return;
        const isOpen = i === open;

        if (reduce) {
          gsap.set(el, { height: isOpen ? "auto" : 0 });
          return;
        }

        gsap.to(el, {
          height: isOpen ? "auto" : 0,
          duration: 0.5,
          ease: "power3.inOut",
          overwrite: "auto",
          /* Land on the keyword, not the measured pixels, so the panel keeps
             reflowing when the viewport changes under it. */
          onComplete: isOpen ? () => gsap.set(el, { height: "auto" }) : undefined,
        });
      });
    },
    { dependencies: [open], scope: root },
  );

  return (
    <div ref={root} className={`divide-y divide-line border-y border-line ${className}`}>
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
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
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

            <div
              id={`${uid}-a${i}`}
              role="region"
              aria-labelledby={`${uid}-q${i}`}
              ref={(el) => {
                panels.current[i] = el;
              }}
              className="overflow-hidden"
              /* Computed from a prop, so it is identical on every render and
                 React never reaches in to undo what GSAP is animating. */
              style={i === initialOpen ? undefined : { height: 0 }}
            >
              <p className="max-w-2xl pb-7 leading-relaxed text-ink-soft">{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
