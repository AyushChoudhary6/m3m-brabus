// ============================================================
// Blog index. Each post lives in its own file under src/content/blog/
// and default-exports a Post object. Imports are static so Vite can
// tree-shake and the prerenderer can render every post at build time.
//
// A Post:
//   slug        string  — must match the filename and scripts/routes.mjs
//   title       string  — <h1> and <title>; lead with the search phrase
//   description string  — meta description, 140–160 chars
//   date        string  — ISO "YYYY-MM-DD", used for Article JSON-LD
//   updated     string  — ISO, optional
//   category    string  — one of CATEGORIES below
//   readMins    number  — honest estimate
//   hero        string  — path under /renders or /public
//   excerpt     string  — one-sentence card summary
//   body        Block[] — see BlogBody.jsx for the renderer
//
// A Block is exactly one of:
//   { h2: string } | { p: string } | { ul: string[] } | { ol: string[] }
//   | { quote: string } | { note: string }   (note = highlighted caveat)
//
// CONTENT RULE: posts must not invent statistics, prices, appreciation
// figures, possession dates or RERA numbers. Advice and explanation only.
// ============================================================

import branded from "../content/blog/branded-residences-explained.js";
import gcer from "../content/blog/golf-course-extension-road-guide.js";
import fourVsFive from "../content/blog/4-bhk-vs-5-bhk-which-to-buy.js";
import reraChecklist from "../content/blog/rera-checklist-before-booking-in-gurgaon.js";
import nriGuide from "../content/blog/nri-guide-to-buying-property-in-gurgaon.js";
import siteVisit from "../content/blog/what-to-check-during-a-site-visit.js";

export const CATEGORIES = [
  "Branded Residences",
  "Location Guide",
  "Buyer Guide",
  "Legal & RERA",
  "NRI",
];

/** Newest first. */
export const POSTS = [
  branded,
  gcer,
  fourVsFive,
  reraChecklist,
  nriGuide,
  siteVisit,
].sort((a, b) => (a.date < b.date ? 1 : -1));

export const getPost = (slug) => POSTS.find((p) => p.slug === slug) || null;

/** Up to `n` other posts, preferring the same category. */
export function relatedPosts(slug, n = 3) {
  const post = getPost(slug);
  if (!post) return POSTS.slice(0, n);
  const others = POSTS.filter((p) => p.slug !== slug);
  const sameCat = others.filter((p) => p.category === post.category);
  return [...sameCat, ...others.filter((p) => p.category !== post.category)].slice(0, n);
}
