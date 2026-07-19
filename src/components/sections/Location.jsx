import { MapPin } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "../ui/Reveal.jsx";
import { LOCATION, PROJECT } from "../../lib/site.js";

export default function Location() {
  return (
    <section className="relative border-y border-line bg-cream py-24 md:py-32">
      <div className="container-lux grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <Reveal>
          <p className="kicker mb-5">The Address</p>
          <h2 className="text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.06] text-ink">
            The centre of <span className="italic text-brass">new Gurugram.</span>
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-ink-soft">
            {PROJECT.location}, on Golf Course Extension Road — minutes from the
            Rapid Metro, business districts, the finest schools and hospitals,
            yet wrapped in calm and greenery.
          </p>

          <RevealGroup className="mt-10 divide-y divide-line border-y border-line">
            {LOCATION.map((l) => (
              <RevealItem key={l.place}>
                <div className="flex items-center justify-between py-4">
                  <span className="flex items-center gap-3 text-ink-soft">
                    <MapPin size={15} className="text-brass" />
                    {l.place}
                  </span>
                  <span className="font-display text-sm text-ink">{l.time}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Reveal>

        {/* Stylised map plate */}
        <Reveal delay={0.1}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-line bg-paper">
            <div className="absolute inset-0 [background:repeating-linear-gradient(0deg,transparent_0,transparent_46px,rgba(23,20,15,0.05)_47px),repeating-linear-gradient(90deg,transparent_0,transparent_46px,rgba(23,20,15,0.05)_47px)]" />
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(154,123,63,0.14),transparent_65%)]" />
            {/* Roads */}
            <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-brass/35" />
            <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-ink/10" />
            {/* Pin */}
            <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-oxblood opacity-60" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-oxblood" />
              </span>
              <span className="mt-3 block font-display text-xs italic text-ink">M3M Brabus</span>
            </div>
            <span className="absolute bottom-4 left-4 text-[0.6rem] uppercase tracking-[0.2em] text-ink-faint">
              Sector 58 · GCE Road
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
