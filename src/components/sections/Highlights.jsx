import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "../ui/Reveal.jsx";
import { HIGHLIGHTS } from "../../lib/site.js";

export default function Highlights() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container-lux">
        <Reveal className="mb-16 max-w-2xl">
          <p className="kicker mb-5">The Difference</p>
          <h2 className="text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.06] text-ink">
            Engineered for light, air, and <span className="italic text-brass">absolute privacy.</span>
          </h2>
        </Reveal>

        <RevealGroup className="grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-2">
          {HIGHLIGHTS.map((h, i) => (
            <RevealItem key={h.title}>
              <motion.div
                whileHover={{ backgroundColor: "#ffffff" }}
                className="group relative h-full bg-canvas p-9 md:p-12"
              >
                <span className="font-display text-lg italic text-brass">0{i + 1}</span>
                <h3 className="mt-5 text-2xl text-ink">{h.title}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-ink-soft">{h.body}</p>
                <span className="absolute bottom-0 left-0 h-px w-0 bg-brass transition-all duration-700 ease-lux group-hover:w-full" />
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
