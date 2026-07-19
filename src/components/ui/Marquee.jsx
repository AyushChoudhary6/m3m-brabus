import { motion } from "framer-motion";

/** Seamless infinite marquee. `items` repeats twice for the loop. */
export default function Marquee({ items, speed = 26, className = "" }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex w-max gap-16 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {row.map((it, i) => (
          <span
            key={i}
            className="flex items-center gap-16 font-display text-[clamp(2rem,7vw,5rem)] italic tracking-tight text-transparent [-webkit-text-stroke:1px_var(--color-line)]"
          >
            {it}
            <span className="text-[0.4em] not-italic text-brass [-webkit-text-stroke:0]">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
