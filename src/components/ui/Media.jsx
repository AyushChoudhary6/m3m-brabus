import { useState } from "react";
import { RENDERS } from "../../lib/renders.generated";

/**
 * Cover image with a smooth blur-up fade on decode. Sits inside an
 * ImageReveal (or any relative box) and fills it. Lazy + async by default.
 *
 * Format ladder, best first: AVIF → WebP → the original JPEG. The AVIF and
 * WebP entries come from src/lib/renders.generated.js, which scripts/images.mjs
 * writes from what it actually put on disk — we never advertise a derivative
 * that might 404, and a render with no derivatives simply serves its JPEG.
 *
 * Remote Pexels URLs get a width-based srcset instead: the CDN resizes on
 * demand, so we drop the baked-in dpr=2 and let the browser pick the width
 * its own device pixel ratio warrants.
 */

// Matches the ladder in scripts/images.mjs. Only used for the remote CDN,
// where there is no manifest to tell us which widths exist.
const REMOTE_WIDTHS = [640, 1024, 1600, 2200];

/** "/a-640.avif 640w, /a-1024.avif 1024w" from the manifest's [width, path] pairs. */
const setFrom = (variants) => variants.map(([w, url]) => `${url} ${w}w`).join(", ");

/**
 * Pexels serves any width from the same photo id, so a real srcset costs
 * nothing. Returns null for anything that is not a Pexels URL — we cannot
 * assume an arbitrary host honours a `w` parameter.
 */
function remoteSrcSet(src) {
  if (typeof src !== "string" || !src.includes("images.pexels.com")) return null;
  const [base, query = ""] = src.split("?");
  const params = new URLSearchParams(query);
  if (!params.has("w")) return null;
  return REMOTE_WIDTHS.map((w) => {
    const p = new URLSearchParams(params);
    p.set("w", String(w));
    // The w-descriptors below already encode density; a hard dpr=2 on top of
    // them would ship four times the pixels a phone asks for.
    p.set("dpr", "1");
    return `${base}?${p.toString()} ${w}w`;
  }).join(", ");
}

export default function Media({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
  width,
  height,
}) {
  const [loaded, setLoaded] = useState(false);

  const local = typeof src === "string" ? RENDERS[src] : undefined;
  const isLocalJpg = typeof src === "string" && src.startsWith("/") && /\.jpe?g$/i.test(src);

  // Legacy path: a local JPEG added before the generator was run still has a
  // hand-made .webp sibling. Kept so nothing regresses if someone drops a file
  // into /renders and forgets to run `node scripts/images.mjs`.
  const legacyWebp = !local && isLocalJpg ? src.replace(/\.jpe?g$/i, ".webp") : null;

  const remote = !local && !isLocalJpg ? remoteSrcSet(src) : null;

  // Intrinsic size reserves layout space before decode — the usual fix for CLS.
  // Callers wrap Media in a sized box and the object-cover classes below win,
  // so these attributes only ever help.
  const w = width ?? local?.w;
  const h = height ?? local?.h;

  const img = (
    <img
      src={src}
      srcSet={remote || undefined}
      alt={alt}
      sizes={sizes}
      width={w}
      height={h}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      // The pages are prerendered, so a cached image can finish loading before
      // React attaches onLoad — without this check the blur-up never clears
      // and the image stays invisible.
      ref={(el) => {
        if (el?.complete) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      className={`h-full w-full object-cover transition-[opacity,filter,transform] duration-[1200ms] ease-lux ${
        loaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-md"
      } ${className}`}
    />
  );

  if (!local && !legacyWebp) return img;

  return (
    <picture>
      {local?.avif?.length ? (
        <source type="image/avif" srcSet={setFrom(local.avif)} sizes={sizes} />
      ) : null}
      {local?.webp?.length ? (
        <source type="image/webp" srcSet={setFrom(local.webp)} sizes={sizes} />
      ) : null}
      {legacyWebp ? <source type="image/webp" srcSet={legacyWebp} /> : null}
      {img}
    </picture>
  );
}
