/**
 * Static prerender for the Vite SPA — no framework migration required.
 *
 * Serves dist/, drives headless Chrome over each route, and writes the
 * fully-rendered HTML back to dist/<route>/index.html.
 *
 * Runs in two environments from one code path:
 *   • Local / CI  — uses the system Chrome (CHROME_PATH, or a known location).
 *   • Vercel build — no system Chrome, so it falls back to @sparticuz/chromium,
 *                    a headless Chromium built to run in Amazon-Linux build/
 *                    lambda containers.
 *
 * Why a real browser instead of SSR: the app leans on GSAP, Lenis, Leaflet and
 * other browser-only APIs. Rendering in Chrome captures exactly what a user
 * sees without guarding every one of them.
 *
 * GRACEFUL DEGRADATION. If no browser can launch, the script does NOT fail the
 * build — it leaves the plain `vite build` output (a working client-rendered
 * SPA) in place and exits 0. The site stays live; only the prerendered,
 * crawlable HTML is missing until a browser is available. The SPA-fallback
 * rewrite in vercel.json means every route still resolves.
 */
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, resolve, dirname } from "node:path";
import { ROUTE_PATHS } from "./routes.mjs";

const DIST = resolve("dist");
const PORT = Number(process.env.PRERENDER_PORT || 4179);
const ON_VERCEL = Boolean(process.env.VERCEL);

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
  ".avif": "image/avif",
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
 * inherit its <title>, <link rel="canonical"> and JSON-LD, leaving two
 * canonicals per page. Holding the original shell in memory keeps every route
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

/** System Chrome locations, in priority order. Empty when none exist. */
const SYSTEM_CHROME = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter((p) => p && existsSync(p));

/**
 * Launch a headless browser. Prefers a system Chrome; on a container with none
 * (Vercel), extracts and uses @sparticuz/chromium. Returns null if neither is
 * available, so the caller can degrade rather than crash.
 */
async function launchBrowser() {
  const puppeteer = (await import("puppeteer-core")).default;
  try {
    if (SYSTEM_CHROME.length) {
      return await puppeteer.launch({
        executablePath: SYSTEM_CHROME[0],
        headless: "new",
        args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
      });
    }
    const chromium = (await import("@sparticuz/chromium")).default;
    return await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      headless: chromium.headless ?? true,
      args: [...chromium.args, "--hide-scrollbars"],
      defaultViewport: { width: 1280, height: 900 },
    });
  } catch (err) {
    console.warn(`⚠ could not launch a browser: ${err.message}`);
    return null;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Render one route to its final HTML string. */
async function renderRoute(browser, route) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    // Reduced motion so scroll animations skip their "start hidden" states and
    // the captured DOM holds visible content (matches --force-prefers-reduced-motion).
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    // networkidle2 can hang on the map's tile stream; cap it and proceed.
    await page
      .goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle2", timeout: 20000 })
      .catch(() => {});
    await sleep(1500); // let the lazy map/section settle
    let html = await page.content();
    // A lazy chunk's injected <link rel="modulepreload"> resolves to the
    // absolute serving origin; rewrite it back to root-relative or it 404s.
    html = html.replaceAll(`http://localhost:${PORT}/`, "/");
    return html;
  } finally {
    await page.close();
  }
}

async function main() {
  if (!existsSync(DIST)) {
    console.error("✗ dist/ not found — run `vite build` first");
    process.exit(1);
  }

  const shell = await readFile(join(DIST, "index.html"));
  const browser = await launchBrowser();

  if (!browser) {
    console.warn(
      "\n⚠ No headless Chrome available — shipping the un-prerendered SPA.\n" +
        "  Routes still resolve via the SPA fallback; per-page crawlable HTML\n" +
        "  is skipped until a browser is available. The build is NOT failed.\n",
    );
    // Not a build failure: the vite output in dist/ is a working site.
    process.exit(0);
  }

  const server = await serveDist(shell);
  console.log(`prerendering ${ROUTES.length} routes…`);
  let failures = 0;

  for (const route of ROUTES) {
    try {
      const html = await renderRoute(browser, route);
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

  await browser.close();
  server.close();

  if (failures) {
    // On Vercel, a partial prerender still beats no deploy — warn, don't fail.
    // Locally / in CI, a failure is a regression worth stopping for.
    console.error(`\n${ON_VERCEL ? "⚠" : "✗"} ${failures} route(s) had issues`);
    if (!ON_VERCEL) process.exit(1);
  }
  console.log("\n✓ prerender complete");
}

main();
