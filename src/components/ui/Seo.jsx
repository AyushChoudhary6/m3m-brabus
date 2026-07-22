/**
 * Per-page SEO. Uses React 19's native document-metadata support — rendering
 * <title>/<meta>/<link> anywhere hoists them into <head>, so no helmet needed.
 *
 * The prerender step (scripts/prerender.mjs) captures the rendered DOM, so
 * every route ships a real HTML file with its own title, description,
 * canonical, Open Graph tags and JSON-LD — readable by Google *and* by AI
 * crawlers that don't execute JavaScript.
 */
// BUG-006: prefer the build-time domain so canonicals/OG match the live host.
// scripts/prerender.mjs is passed VITE_SITE_URL; set it in the Vercel env.
// The literal is the fallback — update it if the live domain is not this.
export const SITE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SITE_URL) ||
  "https://m3m-brabus.com";

/**
 * Serialise data for a <script type="application/ld+json"> block.
 * JSON.stringify does NOT escape `<`, `>`, `&` or the JSON-unsafe line
 * separators, so a value containing `</script>` (e.g. from CMS-authored blog
 * frontmatter) could break out of the block. Escaping to \uXXXX keeps the
 * JSON valid and inert. (BUG-010)
 */
export function ldJson(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/[\u2028\u2029]/g, (c) => "\\u" + c.charCodeAt(0).toString(16));
}

export default function Seo({
  title,
  description,
  path = "/",
  image = "/renders/tower.jpg",
  type = "website",
  jsonLd,
  noindex = false,
}) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const img = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="M3M Brabus" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }}
        />
      )}
    </>
  );
}

/** Breadcrumb JSON-LD helper — satisfies Business Rule 4 on every inner page. */
export function breadcrumbLd(trail = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path === "/" ? "" : t.path}`,
    })),
  };
}
