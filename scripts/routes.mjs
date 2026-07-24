/**
 * Single source of truth for crawlable routes.
 * Both the prerenderer and the sitemap generator read this, so they can
 * never drift apart. Add new pages here when they're built.
 */

/** Blog post slugs — mirrored by src/lib/blog.js. Keep the two in sync. */
export const BLOG_SLUGS = [
  "branded-residences-explained",
  "golf-course-extension-road-guide",
  "4-bhk-vs-5-bhk-which-to-buy",
  "rera-checklist-before-booking-in-gurgaon",
  "nri-guide-to-buying-property-in-gurgaon",
  "what-to-check-during-a-site-visit",
];

export const ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/overview", priority: "0.9", changefreq: "monthly" },
  { path: "/residences", priority: "0.9", changefreq: "monthly" },
  { path: "/brabus", priority: "0.7", changefreq: "monthly" },
  { path: "/amenities", priority: "0.8", changefreq: "monthly" },
  { path: "/location", priority: "0.8", changefreq: "monthly" },
  { path: "/gallery", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.9", changefreq: "monthly" },
  { path: "/price", priority: "0.9", changefreq: "monthly" },
  { path: "/floor-plan", priority: "0.9", changefreq: "monthly" },
  { path: "/payment-plan", priority: "0.9", changefreq: "monthly" },
  { path: "/brochure", priority: "0.9", changefreq: "monthly" },
  { path: "/reviews", priority: "0.9", changefreq: "monthly" },
  { path: "/possession", priority: "0.9", changefreq: "monthly" },
  { path: "/rera", priority: "0.9", changefreq: "monthly" },

  // Volume 2 · Part 1 — IA build-out
  { path: "/master-plan", priority: "0.8", changefreq: "monthly" },
  { path: "/specifications", priority: "0.8", changefreq: "monthly" },
  { path: "/construction-status", priority: "0.8", changefreq: "weekly" },
  { path: "/faqs", priority: "0.7", changefreq: "monthly" },
  { path: "/guides", priority: "0.6", changefreq: "monthly" },
  { path: "/about", priority: "0.6", changefreq: "yearly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/disclaimer", priority: "0.3", changefreq: "yearly" },

  // Blog — hidden for now: not prerendered, not in the sitemap. Restore this
  // block (and the nav/footer entries in site.js) to re-publish it.
  // { path: "/blogs", priority: "0.7", changefreq: "weekly" },
  // ...BLOG_SLUGS.map((slug) => ({ path: `/blogs/${slug}`, priority: "0.6", changefreq: "monthly" })),
];

export const ROUTE_PATHS = ROUTES.map((r) => r.path);
