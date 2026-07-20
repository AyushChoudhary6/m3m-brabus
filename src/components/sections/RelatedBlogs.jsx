import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import Media from "../ui/Media.jsx";
import { POSTS } from "../../lib/blog.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Ch. 22 — homepage section 16, the journal.
   Nothing here is written for this section: every card is a projection of a
   real post in src/lib/blog.js, so the homepage can never advertise an
   article that does not exist. `exclude` lets an inner page — most usefully
   a post page — reuse the same component without listing itself. */

/** en-GB long form, matching /blogs. UTC-pinned so the date never shifts. */
const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export default function RelatedBlogs({
  limit = 3,
  exclude = "",
  eyebrow = "Journal",
  index = "16",
}) {
  const root = useRef(null);

  /* POSTS arrives newest-first from the index, so a slice is already the
     most recent. Computed before the early return — hooks below must run
     on every render regardless of how many posts there are. */
  const posts = POSTS.filter((p) => p.slug !== exclude).slice(0, Math.max(0, limit));

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rb-rise"), {
          autoAlpha: 0, y: 22, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 84%" },
        });

        gsap.from(q(".rb-card"), {
          autoAlpha: 0, y: 26, duration: 0.85, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".rb-grid")[0], start: "top 88%" },
        });
      });
    },
    { scope: root },
  );

  /* An empty journal should read as no section at all, not as an empty
     grid with a heading over it. */
  if (!posts.length) return null;

  return (
    <section
      ref={root}
      aria-labelledby="related-blogs-heading"
      className="border-t border-line py-[clamp(3.5rem,11vh,7rem)]"
    >
      <div className="container-lux">
        <div className="rb-rise mb-[clamp(1.75rem,4vh,2.75rem)] flex items-baseline gap-5">
          {index ? <span className="idx">{index}</span> : null}
          <span className="kicker">{eyebrow}</span>
        </div>

        <div className="mb-[clamp(2.25rem,6vh,3.5rem)] grid gap-x-16 gap-y-5 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <h2
            id="related-blogs-heading"
            className="rb-rise max-w-[17ch] font-display text-[clamp(1.9rem,4.6vw,3.2rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink"
          >
            Read before you{" "}
            <span className="font-serif italic text-brass">enquire.</span>
          </h2>
          <p className="rb-rise max-w-[46ch] leading-relaxed text-ink-soft">
            Branded residences, the Golf Course Extension corridor and the diligence worth doing
            first — explained plainly, with no figure invented to fill a gap.
          </p>
        </div>

        <div className="rb-grid grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article key={p.slug} className="rb-card">
              <Link
                to={`/blogs/${p.slug}`}
                data-cursor="READ"
                className="group flex h-full flex-col rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-line transition-colors duration-500 group-hover:border-brass/40">
                  <div className="absolute inset-0 scale-[1.03] transition-transform duration-[1600ms] ease-lux group-hover:scale-[1.08]">
                    <Media
                      src={p.hero}
                      alt={p.title}
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 32vw"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.72))]" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
                  <span className="mono absolute left-4 top-4 rounded-full border border-brass/30 bg-ink-900/60 px-3 py-1.5 text-[0.54rem] tracking-[0.18em] text-brass-soft backdrop-blur-sm">
                    {p.category}
                  </span>
                </div>

                <h3 className="mt-6 max-w-[26ch] font-display text-[1.35rem] font-light leading-[1.2] tracking-[-0.01em] text-ink transition-colors duration-300 group-hover:text-brass-soft">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-ink-soft">
                  {p.excerpt}
                </p>

                <div className="mono mt-auto flex items-center gap-3 pt-6 text-[0.58rem] tracking-[0.18em] text-ink-faint">
                  <time dateTime={p.date}>{fmtDate(p.date)}</time>
                  <span aria-hidden="true" className="h-px w-4 bg-line" />
                  <span>{p.readMins} min read</span>
                  <ArrowUpRight
                    size={14}
                    className="ml-auto text-brass transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="rb-rise mt-[clamp(2.5rem,7vh,3.5rem)] border-t border-line pt-8">
          <Link
            to="/blogs"
            data-cursor="VIEW"
            aria-label="View all articles on the M3M Brabus blog"
            className="group/link inline-flex items-center gap-2.5 border-b border-brass/40 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
          >
            View all articles
            <ArrowUpRight
              size={14}
              className="transition-transform duration-500 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
