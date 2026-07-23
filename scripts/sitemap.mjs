/** Generates dist/sitemap.xml from the shared route list. */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ROUTES } from "./routes.mjs";

const SITE = (process.env.SITE_URL || process.env.VITE_SITE_URL || "https://m3m-brabus.vercel.app").replace(/\/$/, "");
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
const robots = `# ${SITE}
User-agent: *
Allow: /

# The brochure is delivered after the enquiry form; keep the file itself out of
# the index so it is not handed straight to searchers.
Disallow: /brochure/*.pdf

# AI crawlers — explicitly welcomed (see PRD Ch.1: AI Search discoverability)
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
await writeFile(resolve("dist/robots.txt"), robots, "utf8");
console.log(`✓ robots.txt — sitemap host ${SITE}`);
