import { useState } from "react";

/**
 * Cover image with a smooth blur-up fade on decode. Sits inside an
 * ImageReveal (or any relative box) and fills it. Lazy + async by default.
 */
export default function Media({ src, alt, className = "", priority = false, sizes = "100vw" }) {
  const [loaded, setLoaded] = useState(false);
  return (
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
}
