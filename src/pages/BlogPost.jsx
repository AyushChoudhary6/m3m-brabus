import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import Seo, { breadcrumbLd, SITE_URL } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import BlogBody from "../components/ui/BlogBody.jsx";
import { getPost, relatedPosts } from "../lib/blog.js";
import { PROJECT } from "../lib/site.js";
import { useI18n } from "../lib/i18n.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/* A slug that no longer resolves is a routing accident, not content. It gets
   a courteous way back and a noindex — never a soft 200 that Google keeps. */
function PostNotFound() {
  const { t } = useI18n();
  return (
    <div>
      <Seo
        noindex
        title="Article not found | M3M Brabus Blog"
        description="This article is no longer available. Browse the M3M Brabus blog for guides on branded residences, Golf Course Extension Road and buying in Gurgaon."
        path="/blogs"
      />
      <Breadcrumbs trail={[{ name: t("home.crumbHome"), path: "/" }, { name: t("blogindex.crumb"), path: "/blogs" }]} />
      <section className="container-lux py-[clamp(4rem,14vh,9rem)]">
        <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(2.4rem,6vw,4.5rem)] font-light leading-[1] tracking-[-0.03em] text-ink">
          {t("blogpost.notFoundTitle1")} <span className="font-serif italic text-brass">{t("blogpost.notFoundTitle2")}</span>
        </h1>
        <p className="mt-6 max-w-[48ch] leading-relaxed text-ink-soft">
          {t("blogpost.notFoundBody")}
        </p>
        <Link
          to="/blogs"
          data-cursor="ENTER"
          className="group mt-10 inline-flex items-center gap-3 rounded-full border border-brass/50 px-7 py-4 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 hover:bg-brass hover:text-obsidian focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
        >
          <ArrowLeft size={15} className="transition-transform duration-500 group-hover:-translate-x-0.5" />
          {t("blogpost.allArticles")}
        </Link>
      </section>
      <CtaBand title={t("blogpost.ctaSpeakTitle")} accent={t("blogpost.clientTeam")} subject="Blog — article not found" />
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPost(slug);

  const root = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      if (!post) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".bp-rise"), {
          autoAlpha: 0, y: 22, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.1,
        });

        gsap.from(q(".bp-hero"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut", delay: 0.25,
        });
        gsap.to(q(".bp-hero-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".bp-hero")[0], start: "top bottom", end: "bottom top", scrub: true },
        });

        gsap.from(q(".bp-rel"), {
          autoAlpha: 0, y: 24, duration: 0.8, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".bp-rel-grid")[0], start: "top 86%" },
        });
      });
    },
    { scope: root, dependencies: [slug] },
  );

  if (!post) return <PostNotFound />;

  const url = `${SITE_URL}/blogs/${post.slug}`;
  const trail = [
    { name: "Home", path: "/" },
    { name: "Blogs", path: "/blogs" },
    { name: post.title, path: `/blogs/${post.slug}` },
  ];
  const related = relatedPosts(post.slug, 3);

  return (
    <div ref={root}>
      <Seo
        /* Keep the brand suffix only when the whole title still fits the ~60
           character SERP limit; past that it is the first thing truncated, so
           it costs the article's own words for no gain. */
        title={post.title.length > 46 ? post.title : `${post.title} | M3M Brabus`}
        description={post.description}
        path={`/blogs/${post.slug}`}
        image={post.hero}
        type="article"
        jsonLd={[
          breadcrumbLd(trail),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            image: [`${SITE_URL}${post.hero}`],
            datePublished: post.date,
            dateModified: post.updated || post.date,
            articleSection: post.category,
            inLanguage: "en-IN",
            author: {
              "@type": "Organization",
              name: PROJECT.name,
              url: SITE_URL,
            },
            publisher: {
              "@type": "Organization",
              name: PROJECT.name,
              url: SITE_URL,
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
          },
        ]}
      />
      <Breadcrumbs trail={trail} />

      {/* article masthead */}
      <header className="relative overflow-hidden">
        <div className="gold-glow pointer-events-none absolute -left-40 top-0 h-[32rem] w-[32rem] rounded-full bg-brass/[0.07] blur-[130px]" />
        <div className="container-lux relative pb-[clamp(2.5rem,6vh,4rem)] pt-[clamp(1.5rem,4vh,3rem)]">
          <h1 className="bp-rise mt-6 max-w-[20ch] font-display text-[clamp(2.1rem,5.4vw,4.2rem)] font-light leading-[1.02] tracking-[-0.03em] text-ink">
            {post.title}
          </h1>
          <div className="bp-rise mono mt-8 flex flex-wrap items-center gap-3 text-[0.6rem] tracking-[0.2em] text-ink-faint">
            <time dateTime={post.date}>{fmtDate(post.date)}</time>
            <span aria-hidden="true" className="h-px w-5 bg-line" />
            <span>{post.readMins} {t("blogpost.minRead")}</span>
            {post.updated && post.updated !== post.date && (
              <>
                <span aria-hidden="true" className="h-px w-5 bg-line" />
                <span>{t("blogpost.updated")} {fmtDate(post.updated)}</span>
              </>
            )}
          </div>
          <div className="bp-rise mt-[clamp(2rem,5vh,3rem)] h-px w-full origin-left bg-gradient-to-r from-brass/70 via-line to-transparent" />
        </div>
      </header>

      {/* hero */}
      <div className="container-lux pb-[clamp(2.5rem,7vh,4.5rem)]">
        <figure className="bp-hero relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-line md:aspect-[21/9]">
          <div className="bp-hero-inner absolute inset-0 scale-[1.06]">
            <Media
              src={post.hero}
              alt={post.title}
              priority
              sizes="(max-width:1024px) 100vw, 78vw"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_58%,rgba(8,6,5,0.6))]" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
        </figure>
      </div>

      <article>
        <BlogBody blocks={post.body} />
      </article>

      {/* the honesty line every editorial page on this site carries */}
      <div className="container-lux pb-[clamp(3rem,8vh,5rem)]">
        <p className="mono max-w-[68ch] border-t border-line pt-6 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
          {t("blogpost.guidancePrefix")} {PROJECT.name} {t("blogpost.guidanceMid")} {PROJECT.developer}
        </p>
      </div>

      {/* related reading */}
      {related.length > 0 && (
        <section className="bp-rel-grid container-lux pb-[clamp(4rem,11vh,7rem)]">
          <div className="mb-8 flex items-baseline gap-5 border-t border-line pt-8">
            <Link
              to="/blogs"
              className="mono ml-auto text-[0.6rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
            >
              {t("blogpost.allArticles")}
            </Link>
          </div>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <article key={r.slug} className="bp-rel">
                <Link
                  to={`/blogs/${r.slug}`}
                  data-cursor="READ"
                  className="group flex h-full flex-col rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-line transition-colors duration-500 group-hover:border-brass/40">
                    <div className="absolute inset-0 scale-[1.03] transition-transform duration-[1600ms] ease-lux group-hover:scale-[1.08]">
                      <Media
                        src={r.hero}
                        alt={r.title}
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 32vw"
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.72))]" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
                    <span className="mono absolute left-4 top-4 rounded-full border border-brass/30 bg-ink-900/60 px-3 py-1.5 text-[0.54rem] tracking-[0.18em] text-brass-soft backdrop-blur-sm">
                      {r.category}
                    </span>
                  </div>
                  <h3 className="mt-5 max-w-[26ch] font-display text-xl font-light leading-[1.22] text-ink transition-colors duration-300 group-hover:text-brass-soft">
                    {r.title}
                  </h3>
                  <div className="mono mt-auto flex items-center gap-3 pt-5 text-[0.56rem] tracking-[0.18em] text-ink-faint">
                    <time dateTime={r.date}>{fmtDate(r.date)}</time>
                    <span aria-hidden="true" className="h-px w-4 bg-line" />
                    <span>{r.readMins} {t("blogpost.minRead")}</span>
                    <ArrowUpRight
                      size={14}
                      className="ml-auto text-brass transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <RelatedPages links={["/overview", "/price", "/contact"]} />
      <CtaBand title={t("blogpost.ctaAskTitle")} accent={t("blogpost.clientTeam")} subject={`Blog — ${post.title}`} />
    </div>
  );
}
