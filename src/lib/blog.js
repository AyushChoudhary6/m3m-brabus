// ============================================================
// Blog index.
//
// Ch. 71–73: posts moved from hand-written JS modules to markdown files
// with YAML frontmatter under src/content/blog/*.md, so a non-developer
// can edit them in /admin. The exported API is unchanged — POSTS,
// CATEGORIES, getPost, relatedPosts — and every post object still carries
// the exact fields BlogIndex.jsx and BlogPost.jsx read.
//
// Vite inlines the markdown at build time (`query: "?raw", eager: true`),
// so there is no fetch, no runtime file access and nothing for the
// prerenderer to wait on. Parsing happens once, in src/lib/cms.js.
//
// Eager, not lazy, and that is a considered choice: BlogPost.jsx reads
// `getPost(slug).body` synchronously during render, so the bodies must be
// present the moment the module evaluates. This matches the previous
// behaviour exactly — the six posts were already statically imported — so
// it is not a regression in bundle size, just a different file format.
//
// FRONTMATTER (see public/admin/config.yml — the two must agree):
//   title       string   <h1> and <title>; lead with the search phrase
//   description string   meta description, 140–160 chars
//   date        string   ISO "YYYY-MM-DD", used for Article JSON-LD
//   updated     string   ISO, optional
//   category    string   one of CATEGORIES below
//   readMins    number   honest estimate
//   hero        string   path under /renders
//   excerpt     string   one-sentence card summary
//   draft       boolean  true ⇒ omitted from production builds
//
// The slug is the filename and nothing else. Renaming a file changes a
// live URL that is already in the sitemap and in scripts/routes.mjs.
//
// CONTENT RULE: posts must not invent statistics, prices, appreciation
// figures, possession dates or RERA numbers. Advice and explanation only.
// ============================================================

import { loadEntries, isPublished } from "./cms.js";

const FILES = import.meta.glob("../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const CATEGORIES = [
  "Branded Residences",
  "Location Guide",
  "Buyer Guide",
  "Legal & RERA",
  "NRI",
];

/** Newest first. */
export const POSTS = loadEntries(FILES, {
  required: ["title", "description", "date", "category", "hero", "excerpt"],
})
  .filter(isPublished)
  .map((p) => ({ ...p, readMins: Number(p.readMins) || 6 }))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const getPost = (slug) => POSTS.find((p) => p.slug === slug) || null;

/** Up to `n` other posts, preferring the same category. */
export function relatedPosts(slug, n = 3) {
  const post = getPost(slug);
  if (!post) return POSTS.slice(0, n);
  const others = POSTS.filter((p) => p.slug !== slug);
  const sameCat = others.filter((p) => p.category === post.category);
  return [...sameCat, ...others.filter((p) => p.category !== post.category)].slice(0, n);
}
