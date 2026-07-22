/**
 * Static prerender for the Vite SPA — no framework migration required.
 *
 * Serves dist/, drives headless Chrome over each route with --dump-dom, and
 * writes the fully-rendered HTML back to dist/<route>/index.html.
 *
 * Why a real browser instead of SSR: the app leans on GSAP, Lenis, Leaflet and
 * other browser-only APIs. Rendering in Chrome avoids guarding every one of
 * them, and captures exactly what a user sees.
 *
 * Chrome is run with --force-prefers-reduced-motion so the scroll animations
 * skip their "start hidden" states and the captured HTML holds visible content.
 */
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, resolve, dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ROUTE_PATHS } from "./routes.mjs";

const run = promisify(execFile);

const DIST = resolve("dist");
const PORT = Number(process.env.PRERENDER_PORT || 4179);
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** Every route that should exist as a crawlable HTML file. */
const ROUTES = ROUTE_PATHS;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/**
 * Serve dist/, but always fall back to the PRISTINE Vite shell.
 *
 * Subtle and important: this script writes the rendered "/" back to
 * dist/index.html. If the fallback re-read that file from disk, every route
 * rendered afterwards would boot from the already-prerendered homepage — and
 * inherit its <title>, <link rel="canonical"> and JSON-LD. React then appends
 * the correct tags, leaving two canonicals per page and pointing half the site
 * at the homepage. Holding the original shell in memory keeps every route
 * booting from the same clean slate.
 *
 * @param {Buffer} shell the untouched dist/index.html read before any writes
 */
function serveDist(shell) {
  return new Promise((ok) => {
    const server = createServer(async (req, res) => {
      try {
        const url = decodeURIComponent((req.url || "/").split("?")[0]);
        const file = join(DIST, url);
        const isAsset = extname(file) && existsSync(file);
        const body = isAsset ? await readFile(file) : shell; // SPA fallback
        res.writeHead(200, {
          "Content-Type": isAsset
            ? MIME[extname(file)] || "application/octet-stream"
            : MIME[".html"],
          "Cache-Control": "no-store",
        });
        res.end(body);
      } catch {
        res.writeHead(404).end("not found");
      }
    });
    server.listen(PORT, () => ok(server));
  });
}

async function dumpDom(url) {
  const { stdout } = await run(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--force-prefers-reduced-motion",
      "--virtual-time-budget=8000", // let the app mount + settle
      "--run-all-compositor-stages-before-draw",
      "--dump-dom",
      url,
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  return stdout;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error("✗ dist/ not found — run `vite build` first");
    process.exit(1);
  }
  if (!existsSync(CHROME)) {
    console.error(`✗ Chrome not found at: ${CHROME}\n  Set CHROME_PATH=/path/to/chrome`);
    process.exit(1);
  }

  // Snapshot the clean shell BEFORE the loop overwrites dist/index.html.
  const shell = await readFile(join(DIST, "index.html"));
  const server = await serveDist(shell);
  console.log(`prerendering ${ROUTES.length} routes…`);
  let failures = 0;

  for (const route of ROUTES) {
    try {
      let html = await dumpDom(`http://localhost:${PORT}${route}`);
      // When a lazy route/section (e.g. the Leaflet map) mounts during
      // prerender, the browser injects <link rel="modulepreload"> hints whose
      // href Chrome resolves to the ABSOLUTE serving origin. Left as-is they
      // ship http://localhost:PORT/assets/... into the static HTML and 404 on
      // every page in production. Rewrite the dev origin back to root-relative.
      html = html.replaceAll(`http://localhost:${PORT}/`, "/");
      // sanity: the shell alone is ~2kB; a rendered page is far larger
      if (html.length < 6000) {
        console.warn(`  ! ${route.padEnd(12)} looks unrendered (${html.length}b)`);
        failures++;
      }
      const canonicals = (html.match(/<link rel="canonical"/g) || []).length;
      if (canonicals !== 1) {
        console.warn(`  ! ${route.padEnd(12)} has ${canonicals} canonical tags (expected 1)`);
        failures++;
      }
      const out =
        route === "/" ? join(DIST, "index.html") : join(DIST, route, "index.html");
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, html, "utf8");
      console.log(`  ✓ ${route.padEnd(12)} → ${(html.length / 1024).toFixed(0)}kB`);
    } catch (err) {
      failures++;
      console.error(`  ✗ ${route}: ${err.message}`);
    }
  }

  server.close();
  if (failures) {
    console.error(`\n✗ ${failures} route(s) failed to prerender`);
    process.exit(1);
  }
  console.log("\n✓ prerender complete");
}

main();
