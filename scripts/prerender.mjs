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

function serveDist() {
  return new Promise((ok) => {
    const server = createServer(async (req, res) => {
      try {
        const url = decodeURIComponent((req.url || "/").split("?")[0]);
        let file = join(DIST, url);
        if (!extname(file) || !existsSync(file)) file = join(DIST, "index.html"); // SPA fallback
        const body = await readFile(file);
        res.writeHead(200, {
          "Content-Type": MIME[extname(file)] || "application/octet-stream",
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

  const server = await serveDist();
  console.log(`prerendering ${ROUTES.length} routes…`);
  let failures = 0;

  for (const route of ROUTES) {
    try {
      const html = await dumpDom(`http://localhost:${PORT}${route}`);
      // sanity: the shell alone is ~2kB; a rendered page is far larger
      if (html.length < 6000) {
        console.warn(`  ! ${route.padEnd(12)} looks unrendered (${html.length}b)`);
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
