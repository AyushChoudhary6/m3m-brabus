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
