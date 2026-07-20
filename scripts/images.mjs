#!/usr/bin/env node
// ============================================================
// Responsive image generation for /public/renders.
//
// WHY a shell-out script rather than a Vite plugin: the repo carries no
// sharp / imagemin (they drag a 30 MB native binary into the lockfile for
// three source photographs), and the production build runs on Vercel where
// no encoder binaries exist. So the derivatives are generated ONCE on a
// developer machine, committed alongside the sources, and shipped as plain
// static files. `vite build` never needs to know this script exists.
//
// Consequence you must respect: after adding or replacing anything in
// /public/renders, run `node scripts/images.mjs` and commit the output.
//
//   AVIF  — avifenc if installed, else ffmpeg + libsvtav1/libaom
//   WebP  — cwebp
//
// A missing encoder is reported and skipped, never fatal: a half-generated
// set still works because Media.jsx only advertises variants that the
// manifest says exist.
// ============================================================

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "public", "renders");
const OUT_DIR = path.join(SRC_DIR, "gen");
const MANIFEST = path.join(ROOT, "src", "lib", "renders.generated.js");

// Ladder of intents. Widths above a source's native size are dropped rather
// than upscaled — inventing pixels costs bytes and buys nothing.
const WIDTHS = [640, 1024, 1600, 2200];

const WEBP_Q = 78;   // visually transparent on architectural renders
const AVIF_CRF = 38; // SVT-AV1 scale is 0–63; 38 lands ~2x under WebP
const AVIF_Q = 34;   // avifenc scale is 0–63 (lower = better)

// ---------- tool discovery ----------

const has = (bin) => {
  try {
    execFileSync("/bin/sh", ["-c", `command -v ${bin}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const CWEBP = has("cwebp");
const AVIFENC = has("avifenc");
const FFMPEG = !AVIFENC && has("ffmpeg");

// ffmpeg only helps if it was built with an AV1 encoder.
let FFMPEG_AV1 = null;
if (FFMPEG) {
  try {
    const out = execFileSync("ffmpeg", ["-hide_banner", "-encoders"], { encoding: "utf8" });
    FFMPEG_AV1 = /\blibsvtav1\b/.test(out) ? "libsvtav1" : /\blibaom-av1\b/.test(out) ? "libaom-av1" : null;
  } catch {
    FFMPEG_AV1 = null;
  }
}

const CAN_AVIF = AVIFENC || Boolean(FFMPEG_AV1);

// ---------- dependency-free JPEG dimension probe ----------

/** Read width/height straight out of the JPEG SOFn marker. */
function jpegSize(file) {
  const buf = fs.readFileSync(file);
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    // SOF0..SOF15, excluding DHT (c4), JPGA (c8) and DAC (cc).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

// ---------- encoding ----------

const bytes = (f) => (fs.existsSync(f) ? fs.statSync(f).size : 0);
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;

/** Idempotence: an output newer than its source is already correct. */
const fresh = (out, src) =>
  fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs && bytes(out) > 0;

function encodeWebp(src, out, width) {
  execFileSync("cwebp", ["-quiet", "-q", String(WEBP_Q), "-resize", String(width), "0", src, "-o", out]);
}

function encodeAvif(src, out, width) {
  if (AVIFENC) {
    // avifenc cannot scale, so hand it the WebP-sized intermediate we just
    // made if there is one; otherwise encode at native size.
    execFileSync("avifenc", ["-q", String(AVIF_Q), "-s", "6", "--", src, out], { stdio: "ignore" });
    return;
  }
  execFileSync(
    "ffmpeg",
    [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", src,
      "-vf", `scale=${width}:-2`,
      "-c:v", FFMPEG_AV1,
      ...(FFMPEG_AV1 === "libsvtav1" ? ["-crf", String(AVIF_CRF), "-preset", "5"] : ["-crf", String(AVIF_CRF), "-cpu-used", "5"]),
      "-pix_fmt", "yuv420p",
      "-f", "avif",
      out,
    ],
    { stdio: "ignore" },
  );
}

// ---------- run ----------

if (!fs.existsSync(SRC_DIR)) {
  console.error(`No source directory at ${SRC_DIR} — nothing to do.`);
  process.exit(0);
}

if (!CWEBP) console.warn("! cwebp not found — skipping WebP.        Install:  brew install webp");
if (!CAN_AVIF)
  console.warn("! no AVIF encoder found — skipping AVIF.  Install:  brew install libavif   (or ffmpeg with libsvtav1)");
if (!CWEBP && !CAN_AVIF) {
  console.warn("Nothing to encode. Leaving the existing files and manifest untouched.");
  process.exit(0);
}

const sources = fs
  .readdirSync(SRC_DIR)
  .filter((f) => /\.jpe?g$/i.test(f))
  .sort();

fs.mkdirSync(OUT_DIR, { recursive: true });

const manifest = {};
const rows = [];
let madeCount = 0;
let skipCount = 0;

for (const file of sources) {
  const src = path.join(SRC_DIR, file);
  const stem = file.replace(/\.jpe?g$/i, "");
  const dim = jpegSize(src);
  if (!dim) {
    console.warn(`! ${file}: could not read dimensions, skipped.`);
    continue;
  }

  // Never upscale. Always include the native width so large viewports get
  // a modern-format file rather than falling back to the JPEG.
  const widths = [...new Set([...WIDTHS.filter((w) => w < dim.w), dim.w])].sort((a, b) => a - b);

  const entry = { w: dim.w, h: dim.h, avif: [], webp: [] };
  const srcBytes = bytes(src);
  let avifTotal = 0;
  let webpTotal = 0;

  for (const w of widths) {
    if (CWEBP) {
      const out = path.join(OUT_DIR, `${stem}-${w}.webp`);
      if (fresh(out, src)) skipCount++;
      else {
        try {
          encodeWebp(src, out, w);
          madeCount++;
        } catch (e) {
          console.warn(`! webp ${stem}-${w}: ${e.message.split("\n")[0]}`);
        }
      }
      if (bytes(out) > 0) {
        entry.webp.push([w, `/renders/gen/${stem}-${w}.webp`]);
        webpTotal += bytes(out);
      }
    }

    if (CAN_AVIF) {
      const out = path.join(OUT_DIR, `${stem}-${w}.avif`);
      if (fresh(out, src)) skipCount++;
      else {
        try {
          // avifenc has no scaler: feed it the matching WebP when we made one.
          const input = AVIFENC && w !== dim.w ? path.join(OUT_DIR, `${stem}-${w}.webp`) : src;
          encodeAvif(fs.existsSync(input) ? input : src, out, w);
          madeCount++;
        } catch (e) {
          console.warn(`! avif ${stem}-${w}: ${e.message.split("\n")[0]}`);
        }
      }
      if (bytes(out) > 0) {
        entry.avif.push([w, `/renders/gen/${stem}-${w}.avif`]);
        avifTotal += bytes(out);
      }
    }
  }

  manifest[`/renders/${file}`] = entry;

  // Compare like for like: the widest derivative against the JPEG it replaces.
  const widestWebp = entry.webp.length ? bytes(path.join(ROOT, "public", entry.webp.at(-1)[1])) : 0;
  const widestAvif = entry.avif.length ? bytes(path.join(ROOT, "public", entry.avif.at(-1)[1])) : 0;
  rows.push({
    file,
    dims: `${dim.w}x${dim.h}`,
    widths: widths.join("/"),
    jpg: srcBytes,
    webp: widestWebp,
    avif: widestAvif,
    webpAll: webpTotal,
    avifAll: avifTotal,
  });
}

// ---------- manifest ----------

const banner = `// GENERATED by scripts/images.mjs — do not edit by hand.
// Maps every /renders source to its intrinsic size and the responsive
// AVIF/WebP derivatives that actually exist on disk. Media.jsx reads this
// so it can only ever advertise a file that is really there.
`;
fs.writeFileSync(MANIFEST, `${banner}export const RENDERS = ${JSON.stringify(manifest, null, 2)};\n`);

// ---------- summary ----------

const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);
const pct = (from, to) => (from && to ? `-${Math.round((1 - to / from) * 100)}%` : "—");

console.log("");
console.log(`${pad("source", 16)}${pad("dimensions", 12)}${pad("widths", 18)}${padL("jpeg", 10)}${padL("webp", 10)}${padL("", 7)}${padL("avif", 10)}${padL("", 7)}`);
console.log("-".repeat(90));
for (const r of rows) {
  console.log(
    pad(r.file, 16) +
      pad(r.dims, 12) +
      pad(r.widths, 18) +
      padL(kb(r.jpg), 10) +
      padL(r.webp ? kb(r.webp) : "—", 10) +
      padL(pct(r.jpg, r.webp), 7) +
      padL(r.avif ? kb(r.avif) : "—", 10) +
      padL(pct(r.jpg, r.avif), 7),
  );
}
console.log("-".repeat(90));

const totalJpg = rows.reduce((n, r) => n + r.jpg, 0);
const totalWebp = rows.reduce((n, r) => n + r.webp, 0);
const totalAvif = rows.reduce((n, r) => n + r.avif, 0);
console.log(
  pad("TOTAL (widest)", 46) + padL(kb(totalJpg), 10) + padL(kb(totalWebp), 10) + padL(pct(totalJpg, totalWebp), 7) + padL(kb(totalAvif), 10) + padL(pct(totalJpg, totalAvif), 7),
);
console.log("");
console.log(
  `${madeCount} file(s) encoded, ${skipCount} already current. ` +
    `All widths on disk: ${kb(rows.reduce((n, r) => n + r.webpAll, 0))} webp + ${kb(rows.reduce((n, r) => n + r.avifAll, 0))} avif.`,
);
console.log(`Manifest: ${path.relative(ROOT, MANIFEST)}`);
console.log("Commit public/renders/gen — Vercel has no image encoders and will not regenerate it.");
