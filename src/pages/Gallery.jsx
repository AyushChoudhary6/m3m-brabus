import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Distinct from the homepage exhibition: the full collection, filterable
   by category, in a masonry hang. */
const PLATES = [
  // official renders
  { n: "The Towers", c: "Architecture", id: IMG.tower, ratio: "aspect-[4/3]" },
  { n: "The Arrival", c: "Architecture", id: IMG.arrival, ratio: "aspect-[4/3]" },
  { n: "The Lobby", c: "Interiors", id: IMG.lobby, ratio: "aspect-[4/3]" },
  // indicative interiors + amenities
  { n: "The Living Room", c: "Interiors", id: IMG.livingRoom, ratio: "aspect-[4/5]" },
  { n: "The Duplex", c: "Interiors", id: IMG.duplexLiving, ratio: "aspect-square" },
  { n: "The Master Suite", c: "Interiors", id: IMG.bedroom, ratio: "aspect-[4/5]" },
  { n: "The Suite", c: "Interiors", id: IMG.bedroomDecor, ratio: "aspect-[5/6]" },
  { n: "The Spa", c: "Amenities", id: IMG.spa, ratio: "aspect-[4/5]" },
  { n: "The Pool", c: "Amenities", id: IMG.pool, ratio: "aspect-square" },
  { n: "Performance Gym", c: "Amenities", id: IMG.gym, ratio: "aspect-[4/5]" },
];

const CATEGORIES = ["All", "Architecture", "Interiors", "Amenities"];

export default function Gallery() {
  const root = useRef(null);
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? PLATES : PLATES.filter((p) => p.c === filter);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.fromTo(q(".gp"),
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 },
        );
      });
    },
    { scope: root, dependencies: [filter] },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Gallery | Tower, Arrival & Lobby Renders, Gurgaon"
        description="Official M3M Brabus renders — the twin towers at dusk, the BRABUS porte-cochère arrival and the marble lobby, alongside indicative interiors and amenities."
        path="/gallery"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Gallery", path: "/gallery" }])}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Gallery", path: "/gallery" }]} />
      <PageHeader
        compact
        eyebrow="M3M Brabus Gallery"
        title="A first look,"
        accent="framed."
        lede="The architecture, the interiors and the private world within — the full collection, in one place."
      />

      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        {/* filters */}
        <div className="mb-[clamp(2rem,5vh,3rem)] flex flex-wrap items-center gap-2 border-b border-line pb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              data-cursor="VIEW"
              className={`rounded-full px-5 py-2 font-sans text-[0.68rem] font-medium uppercase tracking-[0.14em] transition-colors duration-500 ${
                filter === c ? "bg-brass text-obsidian" : "border border-line text-ink-soft hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
          <span className="mono ml-auto text-[0.6rem] tracking-[0.2em] text-ink-faint">
            {String(shown.length).padStart(2, "0")} images
          </span>
        </div>

        {/* masonry hang */}
        <div className="gap-x-8 [column-gap:2rem] sm:columns-2 lg:columns-3">
          {shown.map((p, i) => (
            <figure key={p.n} className="gp mb-8 break-inside-avoid" data-cursor="VIEW">
              <div className={`group relative ${p.ratio} overflow-hidden rounded-[1.25rem] border border-line transition-colors duration-500 hover:border-brass/40`}>
                <div className="absolute inset-0 scale-[1.04] transition-transform duration-[1600ms] ease-lux group-hover:scale-[1.09]">
                  <Media src={px(p.id, 1200)} alt={`${p.n} — M3M Brabus, Golf Course Extension Road, Gurgaon`} sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 32vw" />
                </div>
                <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_50%,rgba(8,6,5,0.7))]" />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
                <span className="mono absolute left-4 top-4 text-[0.56rem] tracking-[0.2em] text-brass-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <figcaption className="absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-3 p-5">
                  <h3 className="font-display text-xl text-bone">{p.n}</h3>
                  <span className="mono text-[0.55rem] tracking-[0.18em] text-ink-faint">{p.c}</span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>

        <p className="mono mt-2 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Imagery is indicative and for representation only
        </p>
      </section>

      <RelatedPages links={["/residences", "/amenities", "/brochure"]} />
      <CtaBand title="See the" accent="real thing." subject="Gallery" />
    </div>
  );
}
