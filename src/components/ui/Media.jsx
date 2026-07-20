import { useState } from "react";

/**
 * Cover image with a smooth blur-up fade on decode. Sits inside an
 * ImageReveal (or any relative box) and fills it. Lazy + async by default.
 *
 * Local renders in /renders are served as WebP with a JPEG fallback
 * (~30% lighter) via <picture>. Remote URLs are passed straight through.
 */
export default function Media({ src, alt, className = "", priority = false, sizes = "100vw" }) {
  const [loaded, setLoaded] = useState(false);
  const isLocalJpg = typeof src === "string" && src.startsWith("/") && /\.jpe?g$/i.test(src);
  const webp = isLocalJpg ? src.replace(/\.jpe?g$/i, ".webp") : null;

  const img = (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onLoad={() => setLoaded(true)}
      className={`h-full w-full object-cover transition-[opacity,filter,transform] duration-[1200ms] ease-lux ${
        loaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-md"
      } ${className}`}
    />
  );

  if (!webp) return img;

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      {img}
    </picture>
  );
}
