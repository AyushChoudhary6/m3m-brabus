/**
 * Package dist/ + api/ as a Vercel Build Output API v3 directory (.vercel/output).
 *
 * WHY we deploy prebuilt rather than letting Vercel build: the SEO surface of
 * this site is produced by driving headless Chrome over 30 routes. Vercel's
 * build container is not guaranteed to have a browser, and installing one per
 * deploy is slow and fragile. The GitHub runner already has Chrome for the CI
 * checks, so we build and prerender there and ship the finished directory.
 * `vercel deploy --prebuilt` then does no build at all.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THE BUG THIS FILE EXISTS TO NOT HAVE (read before editing)
 *
 * A `--prebuilt` deployment takes ALL of its routing and headers from
 * .vercel/output/config.json. vercel.json is NEVER consulted for such a
 * deployment. An earlier version of this script wrote a config.json with one
 * hand-written /assets cache rule and nothing else, which meant CSP, HSTS,
 * X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
 * and every other cache rule in vercel.json reached production on exactly zero
 * responses — while vercel.json sat in the repo looking like it was in force.
 *
 * So: vercel.json is the single source of truth, and this script TRANSLATES it.
 * `headers`, `redirects`, `cleanUrls` and `trailingSlash` are all read from
 * there and compiled into the v3 `routes` array. Nothing security-relevant is
 * written here by hand — to change a header, change vercel.json.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HOW v3 `routes` EXPRESSES HEADERS, AND WHY THE ORDER BELOW IS THE ORDER
 *
 * v3 has no `headers` key. Headers are route entries carrying `headers` plus
 * `continue: true`, which means "attach these and keep matching" rather than
 * "answer the request". Routes are evaluated in phases separated by `handle`
 * markers. Everything before the first `{ handle: "filesystem" }` runs BEFORE
 * static files are looked up; everything after it runs only when the
 * filesystem had no match.
 *
 * Header routes must therefore be (a) in the pre-filesystem phase, so they
 * apply to static files, function responses and the 404 fallback alike, and
 * (b) `continue: true`, so matching proceeds to the route that actually
 * produces the response. Getting either wrong is worse than having no headers:
 * a header route without `continue` answers the request itself, so every URL
 * it matches returns a header-only response instead of the page.
 *
 * The emitted order is:
 *
 *   1. header routes            continue: true — attach, do not answer
 *   2. redirect routes          cleanUrls / trailingSlash / vercel.json
 *                               redirects; terminal, and they inherit the
 *                               headers attached in step 1
 *   3. prerendered-route rewrites   /price -> /price/index.html; sets `dest`
 *                               and hands off to the filesystem phase
 *   4. { handle: "filesystem" } static files + serverless functions
 *   5. 404 fallback             only reached when nothing above matched
 *
 * Redirects must sit above the rewrites: a `dest` is not re-evaluated against
 * earlier routes, so /price/index.html has to be caught by the cleanUrls
 * redirect on the way in, not after we have rewritten to it internally.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * WHAT IS DELIBERATELY NOT TRANSLATED
 *
 * `rewrites`. vercel.json's SPA fallback (`/((?!.*\.).*)` -> /index.html) is
 * there for `vercel dev` and as documentation of the SPA's shape. In a
 * prerendered deployment it would be actively harmful: it answers unknown
 * URLs with the homepage markup at HTTP 200 — a soft 404, which is exactly
 * what the 404 fallback in step 5 exists to avoid. The script recognises that
 * one known entry and refuses to run if any other rewrite appears, so a future
 * rewrite cannot be silently dropped.
 *
 * Usage: node .github/workflows/scripts/make-vercel-output.mjs [distDir]
 */
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { ROUTE_PATHS } from "../../../scripts/routes.mjs";

const DIST = resolve(process.argv[2] || "dist");
const API = resolve("api");
const OUT = resolve(".vercel/output");
const VERCEL_JSON = resolve("vercel.json");

/**
 * Runtime for the two OAuth relay functions. Overridable so a Node deprecation
 * on Vercel's side is an env change rather than a code change.
 */
const NODE_RUNTIME = process.env.VERCEL_NODE_RUNTIME || "nodejs22.x";

/** The single rewrite we know about and intentionally replace with a real 404. */
const KNOWN_SPA_REWRITE = { source: "/((?!.*\\.).*)", destination: "/index.html" };

const die = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

if (!existsSync(DIST)) die(`${DIST} not found — run \`npm run build:static\` first`);
if (!existsSync(VERCEL_JSON)) die(`${VERCEL_JSON} not found — it is the source of truth for headers`);

const config = JSON.parse(await readFile(VERCEL_JSON, "utf8"));

/* ─────────────────────────── source -> regex ───────────────────────────── */

/**
 * Compile a vercel.json `source` into the anchored regex string v3 wants.
 *
 * vercel.json sources are path-to-regexp. This project only ever uses the
 * literal + bare-capture-group subset (`/assets/(.*)`, `/((?!api/).*)`, …), so
 * that is all this implements — and anything outside the subset is a hard
 * error rather than a guess. Silently mistranslating `/:slug` into a literal
 * would produce a config that deploys cleanly and serves the wrong bytes.
 *
 * Inside `(...)` the text is already a regex (that is what path-to-regexp does
 * with a custom-pattern group) and is copied verbatim, nesting included, so
 * lookaheads like `(?!api/|admin$|admin/)` survive intact. Outside a group,
 * regex metacharacters are escaped so `/(.*).mp4` matches a literal dot.
 */
function sourceToRegex(source) {
  if (typeof source !== "string" || !source.startsWith("/")) {
    die(`vercel.json: source ${JSON.stringify(source)} must be a string starting with "/"`);
  }
  let out = "";
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === "(") {
      let depth = 0;
      let j = i;
      for (; j < source.length; j++) {
        if (source[j] === "\\") { j++; continue; }
        if (source[j] === "(") depth++;
        else if (source[j] === ")" && --depth === 0) break;
      }
      if (depth !== 0 || j >= source.length) die(`vercel.json: unbalanced "(" in source ${source}`);
      out += source.slice(i, j + 1);
      i = j;
      continue;
    }
    if (ch === ")") die(`vercel.json: unbalanced ")" in source ${source}`);
    if (ch === ":" || ch === "*" || ch === "+" || ch === "?") {
      die(
        `vercel.json: source ${source} uses path-to-regexp "${ch}", which this ` +
          `translator does not implement. Rewrite it as a capture group, e.g. "/(.*)".`,
      );
    }
    out += /[.^$|[\]{}\\]/.test(ch) ? `\\${ch}` : ch;
  }
  // A source that cannot compile must fail here, not at the edge.
  try {
    new RegExp(`^${out}$`);
  } catch (err) {
    die(`vercel.json: source ${source} does not compile to a valid regex — ${err.message}`);
  }
  return `^${out}$`;
}

/* ─────────────────────────── header routes ─────────────────────────────── */

const headerRoutes = (config.headers ?? []).map((rule) => {
  if (!Array.isArray(rule.headers) || rule.headers.length === 0) {
    die(`vercel.json: headers rule for ${rule.source} has no headers`);
  }
  const headers = {};
  for (const { key, value } of rule.headers) {
    if (typeof key !== "string" || typeof value !== "string") {
      die(`vercel.json: headers rule for ${rule.source} has a non-string key/value`);
    }
    headers[key] = value;
  }
  return { src: sourceToRegex(rule.source), headers, continue: true };
});

/**
 * Two header rules matching the same URL is a bug, not a feature: for
 * Content-Security-Policy a browser enforces the INTERSECTION of every policy
 * it is sent, so an accidental overlap between the site policy and the /admin
 * policy would apply `script-src 'self' https://…googletagmanager.com` AND
 * `script-src 'self'` at once and be near-impossible to read off the console.
 * The rules in vercel.json are written to be mutually exclusive (hence the
 * `(?!api/|admin$|admin/)` lookaheads); this proves it against every URL shape
 * the deployment actually serves, and proves no page is left with no CSP.
 */
{
  const probes = [
    "/", "/price", "/blogs/rera-checklist-before-booking-in-gurgaon",
    "/assets/index-abc123.js", "/assets/inter-latin-wght-normal-x.woff2",
    "/renders/tower.jpg", "/renders/gen/tower-1600.avif", "/brochure/m3m-brabus.pdf",
    "/hero-brabus.mp4", "/favicon.svg", "/robots.txt", "/sitemap.xml",
    "/admin", "/admin/config.yml", "/admin/sveltia-cms.js",
    "/api/auth", "/api/callback", "/no-such-page",
  ];
  const compiled = headerRoutes.map((r) => ({
    re: new RegExp(r.src),
    keys: Object.keys(r.headers),
    src: r.src,
  }));
  for (const url of probes) {
    const seen = new Map();
    for (const r of compiled) {
      if (!r.re.test(url)) continue;
      for (const key of r.keys) {
        if (seen.has(key)) {
          die(
            `vercel.json: ${url} would receive two "${key}" headers ` +
              `(from ${seen.get(key)} and ${r.src}). Make the sources disjoint.`,
          );
        }
        seen.set(key, r.src);
      }
    }
    // /api/* responses set their own CSP per request (nonce), see api/_shared.js.
    if (!url.startsWith("/api/") && !seen.has("Content-Security-Policy")) {
      die(`vercel.json: ${url} would be served with no Content-Security-Policy`);
    }
  }
}

/* ───────────────────── redirects, cleanUrls, trailingSlash ─────────────── */

const redirectRoutes = [];

// cleanUrls: the canonical URL for a prerendered page is /price, so the file
// path it happens to live at must not also be a working URL. 308 preserves the
// method and tells crawlers the move is permanent.
if (config.cleanUrls) {
  redirectRoutes.push(
    { src: "^/(?:(.+)/)?index(?:\\.html)?/?$", headers: { Location: "/$1" }, status: 308 },
    { src: "^/(.*)\\.html/?$", headers: { Location: "/$1" }, status: 308 },
  );
}

// trailingSlash:false matches the canonicals <Seo> emits. `^/(.*)/$` cannot
// match "/" itself (it needs a character before the closing slash), so the
// homepage is not caught in a redirect loop.
if (config.trailingSlash === false) {
  redirectRoutes.push({ src: "^/(.*)/$", headers: { Location: "/$1" }, status: 308 });
}

for (const r of config.redirects ?? []) {
  redirectRoutes.push({
    src: sourceToRegex(r.source),
    headers: { Location: r.destination },
    status: r.statusCode ?? (r.permanent === false ? 307 : 308),
  });
}

/* ──────────────────────────── rewrites guard ───────────────────────────── */

for (const rw of config.rewrites ?? []) {
  if (rw.source !== KNOWN_SPA_REWRITE.source || rw.destination !== KNOWN_SPA_REWRITE.destination) {
    die(
      `vercel.json: rewrite ${rw.source} -> ${rw.destination} is not translated by this script.\n` +
        `  Prebuilt deployments take routing from .vercel/output/config.json only. Either add the\n` +
        `  rewrite here (after the filesystem handler, before the 404 fallback) or remove it.`,
    );
  }
}

/* ──────────────────────────── the routes array ─────────────────────────── */

const escapeLiteral = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const routes = [
  ...headerRoutes,
  ...redirectRoutes,

  // Every prerendered route -> its index.html, "/" included. Vercel's static
  // handler almost certainly resolves a directory to its index.html on its
  // own, but "almost certainly" is not a property to hang 30 pages on, and
  // the failure mode is a 404 on the homepage. Every URL that must resolve is
  // spelled out, so nothing here depends on behaviour we cannot test locally.
  ...ROUTE_PATHS.filter((p) => p !== "/").map((path) => ({
    src: `^${escapeLiteral(path)}/?$`,
    dest: `${path}/index.html`,
  })),
  { src: "^/$", dest: "/index.html" },

  // /admin is a hand-written page, not a prerendered route, so it is absent
  // from ROUTE_PATHS — without this it would fall past the filesystem pass
  // into the 404 below and the CMS would be unreachable.
  { src: "^/admin/?$", dest: "/admin/index.html" },

  { handle: "filesystem" },

  // Anything else is genuinely not a page. Serve the SPA shell so React
  // Router can render NotFound, but with a 404 status — a soft 404 returning
  // 200 is worse for the site than a missing page.
  { src: "/(.*)", status: 404, dest: "/index.html" },
];

/* ──────────────────────────── write the output ─────────────────────────── */

// Only the output tree is rebuilt. .vercel/project.json comes from
// `vercel pull` and must survive.
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp(DIST, join(OUT, "static"), { recursive: true });

/**
 * The OAuth relay functions.
 *
 * `--prebuilt` uploads .vercel/output and nothing else, so api/*.js is not
 * deployed unless it is packaged here — which is how /api/auth would 404 and
 * the CMS login hang forever. Each entry point becomes its own <name>.func
 * directory carrying the whole api/ folder, so the shared `./_shared.js`
 * import resolves inside the bundle. The local package.json is required: a
 * .func directory is its own module root, and without {"type":"module"} Node
 * would parse these ESM files as CommonJS and the function would 500 on its
 * first request.
 */
let functionCount = 0;
if (existsSync(API)) {
  const files = (await readdir(API)).filter((f) => f.endsWith(".js"));
  const entries = files.filter((f) => !f.startsWith("_"));
  for (const entry of entries) {
    const dir = join(OUT, "functions", "api", `${entry.replace(/\.js$/, "")}.func`);
    await mkdir(dir, { recursive: true });
    for (const f of files) await cp(join(API, f), join(dir, f));
    await writeFile(join(dir, "package.json"), `${JSON.stringify({ type: "module" }, null, 2)}\n`, "utf8");
    await writeFile(
      join(dir, ".vc-config.json"),
      `${JSON.stringify(
        {
          runtime: NODE_RUNTIME,
          handler: entry,
          launcherType: "Nodejs",
          shouldAddHelpers: true,
          supportsResponseStreaming: false,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    functionCount++;
  }
}

await writeFile(
  join(OUT, "config.json"),
  `${JSON.stringify({ version: 3, routes }, null, 2)}\n`,
  "utf8",
);

console.log(
  `✓ .vercel/output ready — static/ from ${DIST}, ` +
    `${headerRoutes.length} header rule(s) + ${redirectRoutes.length} redirect(s) from vercel.json, ` +
    `${ROUTE_PATHS.length} route rewrite(s), ${functionCount} function(s) on ${NODE_RUNTIME}`,
);
