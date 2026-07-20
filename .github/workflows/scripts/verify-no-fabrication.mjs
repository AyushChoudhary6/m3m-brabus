/**
 * Fabrication guard — CI enforcement of the project's one non-negotiable rule.
 *
 * The official M3M listing publishes only: the location, 4 & 5 BHK
 * configurations, ~5,000–7,000 sq.ft, an amenity list, and the phrase
 * "expected in the coming years". It publishes NO price, NO RERA registration
 * number and NO possession date. src/lib/facts.js keeps those as `null` so the
 * UI renders a request-CTA instead of a number.
 *
 * The weak point is prose. A figure typed into a blog post, an FAQ answer or a
 * meta description bypasses facts.js entirely, and code review is a poor
 * detector of one plausible-looking number in 30 pages. So we grep the BUILT
 * output — after prerendering, so it sees exactly what a crawler sees,
 * including JSON-LD and meta tags, which is where a schema.org `price` would
 * do the most damage.
 *
 * Scope note: this reads rendered text, meta[content] and JSON-LD. It does not
 * read <script>/<style> (bundled code and CSS data-URIs produce noise, e.g.
 * the "%3Cr" of an inline SVG looking like "3Cr").
 *
 * Usage: node .github/workflows/scripts/verify-no-fabrication.mjs [distDir]
 */
import { readFile, readdir } from "node:fs/promises";
import { join, resolve, relative } from "node:path";

const DIST = resolve(process.argv[2] || "dist");

/**
 * Patterns are deliberately shaped to fire on FIGURES, not on the vocabulary.
 * The site talks about price, RERA and possession constantly — always to say
 * that no number is published. "What is the RERA registration number?" must
 * pass; "RERA No. GGM/123/2024/45" must not.
 */
const PATTERNS = [
  {
    id: "price",
    why: "no starting price, per-sq.ft rate or budget figure is published for this project",
    // A currency symbol/word followed by digits, or digits followed by an
    // Indian money unit. "crore-plus" and "a few lakh buyers" carry no figure
    // and are not matched.
    tests: [
      /(?:₹|&#8377;|\bRs\.?|\bINR)\s?\d/i,
      /\b\d[\d,.]*\s?(?:cr\b|crores?\b|lakhs?\b|lacs?\b)/i,
      /\b\d[\d,]*\s?(?:\/|per\s)\s?sq\.?\s?(?:ft|feet|yd)\b/i,
      // A schema.org offer carries a bare integer with no symbol or unit, so
      // the prose patterns above would miss it — and it is the version Google
      // would actually quote back in a result. No JSON-LD here emits these.
      /"(?:price|lowPrice|highPrice|priceRange|priceCurrency|priceSpecification)"\s*:\s*[[{"]?\s*[₹\d]/i,
    ],
  },
  {
    id: "rera",
    why: "the official listing publishes no RERA registration number",
    // Either a Haryana registration-number shape, or the words "RERA … number"
    // followed closely by an identifier-looking token that contains a digit.
    tests: [
      /\b(?:RC\/REP\/|(?:HA|H)?RERA[/-])(?=[A-Z0-9/-]*\d)[A-Z0-9][A-Z0-9/-]{4,}/i,
      /\bGGM\/\d{2,4}\/\d{2,4}\/\d{4}/i,
      /\b(?:HA)?RERA\b[^.?!\n]{0,40}?\b(?:no\.?|number|regn?\.?|registration)\b[^.?!\n]{0,15}?[:\-–]?\s*(?=[A-Za-z0-9/-]*\d)[A-Za-z0-9][A-Za-z0-9/-]{4,}/i,
    ],
  },
  {
    id: "possession",
    why: 'the official listing says only "expected in the coming years" — no date, quarter or year',
    // A quarter-year is never anything but a possession claim here. The second
    // test needs a possession word AND a forward-looking preposition AND a
    // year, so a footer "© 2026" or a blog byline cannot trip it.
    tests: [
      /\bQ[1-4][\s,'’-]*(?:FY\s?)?(?:20)?\d{2}\b/i,
      /\b(?:possession|handover|hand-over|ready[\s-]to[\s-]move|completion|delivery)\b[^.?!\n]{0,60}?\b(?:by|in|from|during|before|expected(?:\s+(?:in|by))?|targeted(?:\s+for)?|slated\s+for|scheduled\s+for|due)\s+(?:(?:Q[1-4]|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?20[2-9]\d\b/i,
    ],
  },
];

/**
 * Escape hatch, intentionally empty. A string may only be added here if M3M
 * actually publishes it — in which case it belongs in src/lib/facts.js first,
 * and the entry here should cite the date the listing was re-read.
 * @type {string[]}
 */
const ALLOW = [];

const ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
  "&apos;": "'", "&nbsp;": " ", "&#8377;": "₹", "&rupee;": "₹",
  "&ndash;": "–", "&mdash;": "—", "&hellip;": "…",
};

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&[a-z]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? e);

/**
 * Everything a search engine or reader can see: JSON-LD, meta content, and
 * rendered text. Joined with newlines so the proximity windows in the
 * possession patterns cannot span two unrelated blocks.
 */
function extractText(html) {
  const parts = [];

  for (const m of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    parts.push(m[1]);
  }
  for (const m of html.matchAll(/<meta\b[^>]*\bcontent=["']([^"']*)["'][^>]*>/gi)) {
    parts.push(m[1]);
  }

  const body = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, "\n");
  parts.push(body);

  return decode(parts.join("\n"))
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith(".html")) yield full;
  }
}

const hits = [];
let scanned = 0;

for await (const file of htmlFiles(DIST)) {
  scanned++;
  const text = extractText(await readFile(file, "utf8"));
  for (const line of text.split("\n")) {
    if (ALLOW.some((a) => line.includes(a))) continue;
    for (const pattern of PATTERNS) {
      const test = pattern.tests.find((re) => re.test(line));
      if (!test) continue;
      const match = line.match(test)[0];
      hits.push({
        file: relative(DIST, file),
        id: pattern.id,
        why: pattern.why,
        match,
        // Enough context for a human to judge it without opening the build.
        context: line.length > 200 ? `${line.slice(0, 200)}…` : line,
      });
    }
  }
}

if (hits.length) {
  console.error(`\n✗ fabrication guard failed — ${hits.length} suspect figure(s):\n`);
  for (const h of hits) {
    console.error(`  [${h.id}] ${h.file}`);
    console.error(`    matched: ${h.match}`);
    console.error(`    context: ${h.context}`);
    console.error(`    rule:    ${h.why}\n`);
  }
  console.error(
    "If M3M has genuinely published one of these, add it to src/lib/facts.js\n" +
      "with the date the official listing was re-read — not to the page copy.\n",
  );
  process.exit(1);
}

console.log(
  `✓ fabrication guard passed — ${scanned} HTML files, no price, RERA number or possession date`,
);
