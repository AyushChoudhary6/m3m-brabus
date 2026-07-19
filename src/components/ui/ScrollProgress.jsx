import { motion, useScroll, useSpring } from "framer-motion";

/** Thin bronze reading-progress hairline pinned to the top of the viewport. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[65] h-px origin-left bg-brass"
    />
  );
}
