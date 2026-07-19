import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { IMG, px } from "../../lib/images.js";
import Media from "../ui/Media.jsx";

export default function StatementBand() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1.25]);

  const words = "A residence is not built. It is composed.".split(" ");

  return (
    <section ref={ref} className="relative h-[80vh] min-h-[520px] overflow-hidden">
      {/* Parallax image */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Media src={px(IMG.duplexLiving, 1800)} alt="M3M Brabus interior craftsmanship" sizes="100vw" />
      </motion.div>
      <div className="absolute inset-0 bg-black/45" />

      {/* Editorial pull-quote */}
      <div className="container-lux relative flex h-full items-center">
        <h2 className="max-w-[18ch] text-[clamp(2rem,5.5vw,4.5rem)] font-light leading-[1.05] text-white">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-baseline">
              <motion.span
                className={`inline-block ${w === "composed." ? "italic text-brass-soft" : ""}`}
                initial={{ y: "110%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ delay: i * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
