import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "../ui/Reveal.jsx";
import { AMENITIES } from "../../lib/site.js";

export default function Amenities() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container-lux">
        <Reveal className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="kicker mb-5">The Lifestyle</p>
            <h2 className="text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.06] text-ink">
              A private world of <span className="italic text-brass">amenities.</span>
            </h2>
          </div>
          <p className="max-w-sm text-ink-soft">
            Every facility curated to a five-star standard — because a branded
            residence is a lifestyle, not just an address.
          </p>
        </Reveal>

        <RevealGroup className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {AMENITIES.map((a) => (
            <RevealItem key={a.name}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group flex h-full min-h-[190px] flex-col justify-between bg-paper p-8"
              >
                <span className="h-2 w-2 rounded-full bg-brass transition-all duration-500 group-hover:w-8" />
                <div>
                  <h3 className="font-display text-xl text-ink">{a.name}</h3>
                  <p className="mt-2 text-sm text-ink-faint">{a.note}</p>
                </div>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
