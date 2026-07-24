/** Generates dist/sitemap.xml from the shared route list. */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ROUTES } from "./routes.mjs";

// VITE_SITE_URL first: it is the variable the client build (Seo.jsx canonicals)
// actually reads, and Vite only exposes VITE_-prefixed vars to the client. Preferring
// it here means setting that one value drives both the canonicals and this sitemap,
// so the two hosts cannot desync. SITE_URL stays as a node-only override.
const SITE = (process.env.VITE_SITE_URL || process.env.SITE_URL || "https://m3m-brabus.vercel.app").replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);

const urls = ROUTES.map(
  (r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

await writeFile(resolve("dist/sitemap.xml"), xml, "utf8");
console.log(`✓ sitemap.xml — ${ROUTES.length} urls`);

/* robots.txt is generated here rather than kept in public/ so its Sitemap line
   can never drift from the host the sitemap was actually written with — it had
   been left pointing at a domain that does not resolve. */

// The brochure is delivered after the enquiry form; keep the file itself out of
// every crawler's index so it is not handed straight to searchers. A named
// user-agent group does NOT inherit rules from `*`, so the Disallow has to be
// repeated in each group below or the AI bots we welcome would still crawl it.
const DISALLOW = "Disallow: /brochure/*.pdf";

// AI crawlers — explicitly welcomed (see PRD Ch.1: AI Search discoverability).
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
];

const aiGroups = AI_AGENTS.map((ua) => `User-agent: ${ua}\nAllow: /\n${DISALLOW}`).join("\n\n");

const robots = `# ${SITE}
User-agent: *
Allow: /
${DISALLOW}

${aiGroups}

Sitemap: ${SITE}/sitemap.xml
`;
await writeFile(resolve("dist/robots.txt"), robots, "utf8");
console.log(`✓ robots.txt — sitemap host ${SITE}`);
