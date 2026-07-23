import { Reveal } from "../ui/Reveal.jsx";
import ImageReveal from "../ui/ImageReveal.jsx";
import Media from "../ui/Media.jsx";
import { useI18n } from "../../lib/i18n.jsx";
import { IMG, px } from "../../lib/images.js";

const TILES = [
  { labelKey: "sgallery.arrival", id: IMG.tower, w: 1200, span: "lg:col-span-2 lg:row-span-2" },
  { labelKey: "sgallery.lobby", id: IMG.lobbyWarm, w: 800, span: "" },
  { labelKey: "sgallery.residence", id: IMG.livingRoom, w: 800, span: "" },
  { labelKey: "sgallery.spa", id: IMG.spa, w: 1200, span: "lg:col-span-2" },
];

export default function Gallery() {
  const { t } = useI18n();
  return (
    <section className="py-24 md:py-32">
      <div className="container-lux">
        <Reveal className="mb-14 max-w-xl">
          <h2 className="text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.06] text-ink">
            {t("sgallery.headingLead")} <span className="italic text-brass">{t("sgallery.headingAccent")}</span>
          </h2>
        </Reveal>

        <div className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((tile) => (
            <div key={tile.labelKey} className={`group relative ${tile.span}`} data-cursor="View">
              <ImageReveal className="h-full w-full border border-line" parallax={8}>
                <div className="absolute inset-0 transition-transform duration-[1.4s] ease-lux group-hover:scale-105">
                  <Media src={px(tile.id, tile.w)} alt={`M3M Brabus — ${t(tile.labelKey)}`} sizes="(max-width:640px) 100vw, 50vw" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </ImageReveal>
              <figcaption className="pointer-events-none absolute bottom-5 left-6 z-10 font-display text-sm italic text-white">
                {t(tile.labelKey)}
              </figcaption>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
