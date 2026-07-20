/**
 * Single source of truth for crawlable routes.
 * Both the prerenderer and the sitemap generator read this, so they can
 * never drift apart. Add new pages here when they're built.
 */
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
];

export const ROUTE_PATHS = ROUTES.map((r) => r.path);
