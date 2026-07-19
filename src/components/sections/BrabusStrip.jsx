import Marquee from "../ui/Marquee.jsx";
import { Reveal } from "../ui/Reveal.jsx";
import Button from "../ui/Button.jsx";
import ImageReveal from "../ui/ImageReveal.jsx";
import Media from "../ui/Media.jsx";
import { IMG, px } from "../../lib/images.js";

export default function BrabusStrip() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <Marquee
        items={["BRABUS", "M3M", "Bespoke", "Hand-built", "Performance"]}
        className="pointer-events-none absolute top-6 left-0 opacity-70"
      />

      <div className="container-lux relative mt-28 grid gap-12 md:grid-cols-[1fr_1fr] md:items-end">
        <Reveal>
          <p className="kicker mb-6">The Partnership</p>
          <h2 className="max-w-[14ch] text-[clamp(2rem,5vw,3.6rem)] font-light leading-[1.04] text-ink">
            German performance, <span className="italic text-brass">translated into architecture.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-lg leading-relaxed text-ink-soft">
            BRABUS has spent decades hand-building the world's most exclusive
            automobiles — obsessive engineering, bespoke craft, uncompromising
            detail. At M3M Brabus, that same philosophy shapes every residence:
            precision-planned, individually crafted, and made for those who
            refuse the ordinary.
          </p>
          <div className="mt-8">
            <Button variant="ghost" to="/brabus">Discover the BRABUS story</Button>
          </div>
        </Reveal>
      </div>

      {/* Feature image band */}
      <div className="container-lux mt-16 md:mt-20" data-cursor="View">
        <ImageReveal className="aspect-[21/9] w-full border border-line" parallax={9}>
          <Media src={px(IMG.lobby, 1800)} alt="M3M Brabus signature lobby" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </ImageReveal>
      </div>
    </section>
  );
}
