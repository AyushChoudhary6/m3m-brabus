import { Reveal } from "../ui/Reveal.jsx";
import ImageReveal from "../ui/ImageReveal.jsx";
import Media from "../ui/Media.jsx";
import { IMG, px } from "../../lib/images.js";

const TILES = [
  { label: "The Arrival", id: IMG.tower, w: 1200, span: "lg:col-span-2 lg:row-span-2" },
  { label: "The Lobby", id: IMG.lobbyWarm, w: 800, span: "" },
  { label: "The Residence", id: IMG.livingRoom, w: 800, span: "" },
  { label: "The Spa", id: IMG.spa, w: 1200, span: "lg:col-span-2" },
];

export default function Gallery() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-lux">
        <Reveal className="mb-14 max-w-xl">
          <p className="kicker mb-5">The Vision</p>
          <h2 className="text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.06] text-ink">
            A <span className="italic text-brass">first look.</span>
          </h2>
        </Reveal>

        <div className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((t) => (
            <div key={t.label} className={`group relative ${t.span}`} data-cursor="View">
              <ImageReveal className="h-full w-full border border-line" parallax={8}>
                <div className="absolute inset-0 transition-transform duration-[1.4s] ease-lux group-hover:scale-105">
                  <Media src={px(t.id, t.w)} alt={`M3M Brabus — ${t.label}`} sizes="(max-width:640px) 100vw, 50vw" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </ImageReveal>
              <figcaption className="pointer-events-none absolute bottom-5 left-6 z-10 font-display text-sm italic text-white">
                {t.label}
              </figcaption>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
