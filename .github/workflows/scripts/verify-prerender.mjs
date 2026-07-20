/**
 * Prerender validation — the highest-value automated check on this project.
 *
 * The site is a static SPA whose SEO surface is produced by driving headless
 * Chrome over every route (scripts/prerender.mjs). That step is the fragile
 * one: it boots a real browser against a real bundle, so a component that
 * throws on first paint, or a stale HTML shell being reused as the SPA
 * fallback, silently produces valid-looking-but-wrong HTML. Nothing in `vite
 * build` catches it. This does.
 *
 * The failures asserted here are the ones that have actually happened:
 *   · a route rendering as the bare shell (JS threw before the app mounted)
 *   · TWO <link rel="canonical"> on a page, because the prerenderer served an
 *     already-rendered index.html as the SPA fallback and React then appended
 *     its own head tags on top (regressed once, in July 2026)
 *   · a canonical or title inherited from the homepage rather than the route
 *   · an internal link pointing at a path that no longer prerenders
 *
 * Usage: node .github/workflows/scripts/verify-prerender.mjs [distDir]
 * Exits non-zero, with an itemised list, on the first failing category.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROUTE_PATHS } from "../../../scripts/routes.mjs";

const DIST = resolve(process.argv[2] || "dist");

/** A rendered page is tens of kB; the untouched Vite shell is ~2kB. */
const MIN_RENDERED_BYTES = 6000;

/** Assets that may legitimately be linked but are not prerendered routes. */
const FILE_LIKE = /\.[a-z0-9]{2,5}$/i;

const failures = [];
const fail = (msg) => failures.push(msg);

/** dist path for a route: "/" → index.html, "/price" → price/index.html */
const fileFor = (route) =>
  route === "/" ? join(DIST, "index.html") : join(DIST, route, "index.html");

/** Normalise "/price/" and "/price" to the same key; "" stays "/". */
const normalise = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : "/");

const known = new Set(ROUTE_PATHS.map(normalise));

// ── 1. Every route emitted an HTML file, and it is actually rendered ────────
/** @type {Map<string, string>} route → html */
const pages = new Map();

for (const route of ROUTE_PATHS) {
  const file = fileFor(route);
  if (!existsSync(file)) {
    fail(`missing HTML — ${route} (expected ${file.replace(DIST, "dist")})`);
    continue;
  }
  const html = await readFile(file, "utf8");
  if (html.length < MIN_RENDERED_BYTES) {
    fail(`unrendered — ${route} is only ${html.length}b; the app did not mount`);
    continue;
  }
  pages.set(route, html);
}

console.log(
  `prerender: ${pages.size}/${ROUTE_PATHS.length} routes present and rendered`,
);

// ── 2. Exactly one <title> and one canonical per page ──────────────────────
// Counted rather than matched: the failure mode is duplication, not absence.
const titles = new Map();

for (const [route, html] of pages) {
  const head = html.split(/<\/head>/i)[0] ?? html;

  const canonicals = head.match(/<link\b[^>]*\brel=["']?canonical\b[^>]*>/gi) || [];
  if (canonicals.length !== 1) {
    fail(`canonical — ${route} has ${canonicals.length} <link rel="canonical">, expected 1`);
  } else {
    const href = canonicals[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href) {
      fail(`canonical — ${route} canonical tag has no href`);
    } else {
      // Compare paths only; the origin varies between preview and production.
      let path;
      try {
        path = normalise(new URL(href, "https://example.invalid").pathname);
      } catch {
        path = null;
      }
      if (path !== normalise(route)) {
        // The classic symptom of the shell-reuse bug: every page claiming "/".
        fail(`canonical — ${route} points at "${path ?? href}"`);
      }
    }
  }

  const titleTags = head.match(/<title\b[^>]*>[\s\S]*?<\/title>/gi) || [];
  if (titleTags.length !== 1) {
    fail(`title — ${route} has ${titleTags.length} <title> tags, expected 1`);
    continue;
  }
  const title = titleTags[0].replace(/<[^>]+>/g, "").trim();
  if (!title) {
    fail(`title — ${route} has an empty <title>`);
    continue;
  }
  if (titles.has(title)) {
    fail(`title — ${route} duplicates the title of ${titles.get(title)}: "${title}"`);
  } else {
    titles.set(title, route);
  }
}

console.log(`prerender: ${titles.size} unique titles, canonicals checked`);

// ── 3. No broken internal links ────────────────────────────────────────────
// Anything the crawler can follow must resolve, or the prerendered site
// advertises routes that 404.
const broken = new Map(); // target → routes that link to it

for (const [route, html] of pages) {
  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map((m) => m[1]);
  for (const raw of hrefs) {
    const href = raw.trim();
    if (!href || /^(https?:|\/\/|mailto:|tel:|#|javascript:|data:)/i.test(href)) continue;
    if (!href.startsWith("/")) continue; // relative links are not used here
    const path = normalise(href.split(/[?#]/)[0]);
    const ok = FILE_LIKE.test(path)
      ? existsSync(join(DIST, path)) // e.g. /brochure/M3M-Brabus-Brochure.pdf
      : known.has(path);
    if (!ok) {
      if (!broken.has(path)) broken.set(path, new Set());
      broken.get(path).add(route);
    }
  }
}

for (const [target, sources] of broken) {
  fail(`broken link — "${target}" linked from ${[...sources].join(", ")}`);
}

// ── 4. Crawl artefacts the prerender step is responsible for ───────────────
for (const artefact of ["sitemap.xml", "robots.txt"]) {
  if (!existsSync(join(DIST, artefact))) fail(`missing ${artefact}`);
}
if (existsSync(join(DIST, "sitemap.xml"))) {
  const xml = await readFile(join(DIST, "sitemap.xml"), "utf8");
  const locs = (xml.match(/<loc>/g) || []).length;
  if (locs !== ROUTE_PATHS.length) {
    fail(`sitemap.xml lists ${locs} urls, expected ${ROUTE_PATHS.length}`);
  }
}

// ── Report ────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n✗ prerender validation failed — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  · ${f}`);
  process.exit(1);
}

console.log(
  `\n✓ prerender validation passed — ${ROUTE_PATHS.length} routes, ` +
    `1 canonical each, unique titles, no broken internal links`,
);
