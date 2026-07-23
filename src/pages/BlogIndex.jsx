import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd, SITE_URL } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { POSTS, CATEGORIES } from "../lib/blog.js";
import { PROJECT } from "../lib/site.js";
import { useI18n } from "../lib/i18n.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Blogs", path: "/blogs" },
];

/** en-GB long form — the register the rest of the copy is written in. */
const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/* Only categories that actually carry a post are offered. An empty filter is
   a dead end, and a dead end on a marketing site is a lost enquiry. */
const LIVE_CATEGORIES = CATEGORIES.filter((c) => POSTS.some((p) => p.category === c));

export default function BlogIndex() {
  const root = useRef(null);
  const [filter, setFilter] = useState("All");
  const { t } = useI18n();

  const shown = filter === "All" ? POSTS : POSTS.filter((p) => p.category === filter);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.fromTo(
          q(".bp-card"),
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 },
        );
      });
    },
    { scope: root, dependencies: [filter] },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Blog | Buyer Guides for Sector 58, Gurgaon"
        description="Guides on branded residences, Golf Course Extension Road, RERA diligence and buying in Gurgaon — written for buyers considering M3M Brabus, Sector 58."
        path="/blogs"
        jsonLd={[
          breadcrumbLd(TRAIL),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": `${SITE_URL}/blogs`,
            name: `${PROJECT.name} — Insights & Buyer Guides`,
            description:
              "Guides and explainers on branded residences, Golf Course Extension Road, RERA diligence and buying property in Gurgaon.",
            url: `${SITE_URL}/blogs`,
            inLanguage: "en-IN",
            publisher: { "@type": "Organization", name: PROJECT.name, url: SITE_URL },
            blogPost: POSTS.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              description: p.description,
              url: `${SITE_URL}/blogs/${p.slug}`,
              datePublished: p.date,
              dateModified: p.updated || p.date,
              image: `${SITE_URL}${p.hero}`,
              articleSection: p.category,
              author: { "@type": "Organization", name: PROJECT.name },
            })),
          },
        ]}
      />
      <Breadcrumbs trail={TRAIL} />
      <PageHeader
        compact
        title={t("blogindex.title")}
        accent={t("blogindex.accent")}
        lede={t("blogindex.lede")}
      />

      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        {/* category filter */}
        <div className="mb-[clamp(2rem,5vh,3rem)] flex flex-wrap items-center gap-2 border-b border-line pb-6">
          <h2 className="sr-only">{t("blogindex.filterHeading")}</h2>
          {["All", ...LIVE_CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              data-cursor="VIEW"
              className={`rounded-full px-5 py-2 font-sans text-[0.68rem] font-medium uppercase tracking-[0.14em] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                filter === c
                  ? "bg-brass text-obsidian"
                  : "border border-line text-ink-soft hover:text-ink"
              }`}
            >
              {c === "All" ? t("blogindex.filterAll") : c}
            </button>
          ))}
          <span className="mono ml-auto text-[0.6rem] tracking-[0.2em] text-ink-faint">
            {String(shown.length).padStart(2, "0")} {shown.length === 1 ? t("blogindex.article") : t("blogindex.articles")}
          </span>
        </div>

        {/* card grid */}
        {shown.length ? (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <article key={p.slug} className="bp-card">
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
                    <span>{p.readMins} {t("blogpost.minRead")}</span>
                    <ArrowUpRight
                      size={14}
                      className="ml-auto text-brass transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="max-w-[48ch] leading-relaxed text-ink-soft">
            {t("blogindex.emptyPre")} <em className="font-serif italic text-brass">{t("blogindex.filterAll")}</em> {t("blogindex.emptyPost")}
          </p>
        )}
      </section>

      <CtaBand title={t("blogindex.ctaTitle")} accent={t("blogindex.ctaAccent")} subject="Blog" />
    </div>
  );
}
