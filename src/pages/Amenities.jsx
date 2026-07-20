import { useRef } from "react";
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

/* Distinct from the homepage tour: amenities grouped by how they're used,
   each group with its own plate and index. */
const GROUPS = [
  {
    k: "01",
    title: "Wellness",
    lede: "A floor given entirely to recovery — water, heat and quiet.",
    img: IMG.spa,
    items: [
      { n: "Temperature-Controlled Pool", d: "Swimming through every season" },
      { n: "Spa & Wellness Centre", d: "Sauna, steam and treatment rooms" },
      { n: "Fully-Equipped Gym", d: "Strength, cardio and recovery" },
    ],
  },
  {
    k: "02",
    title: "Social",
    lede: "Rooms made for gathering — from a quiet drink to a full celebration.",
    img: IMG.lobbyWarm,
    items: [
      { n: "Grand Clubhouse", d: "Multi-level club and lounge" },
      { n: "Multipurpose Event Hall", d: "Private celebrations and gatherings" },
      { n: "Restaurant", d: "Dining within the address" },
    ],
  },
  {
    k: "03",
    title: "Family & Play",
    lede: "Space for the household — outdoors, indoors and in between.",
    img: IMG.pool,
    items: [
      { n: "Landscaped Gardens", d: "Jogging tracks and green courts" },
      { n: "Children's Play Area", d: "Safe, supervised play" },
      { n: "Indoor & Outdoor Games", d: "Courts and a games room" },
    ],
  },
  {
    k: "04",
    title: "Services",
    lede: "The quiet infrastructure that makes the rest effortless.",
    img: IMG.gym,
    items: [
      { n: "24/7 Security", d: "CCTV surveillance and manned gates" },
      { n: "Dedicated Parking", d: "Covered resident parking" },
      { n: "Rainwater Harvesting", d: "Energy-efficient and eco-conscious" },
    ],
  },
];

export default function Amenities() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        q(".grp").forEach((el) => {
          const wrap = el.querySelector(".grp-img");
          gsap.set(wrap, { clipPath: "inset(100% 0 0 0)" });
          gsap.to(wrap, {
            clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "power3.inOut",
            scrollTrigger: { trigger: el, start: "top 84%" },
          });
          gsap.from(el.querySelectorAll(".grp-rise"), {
            autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.07,
            scrollTrigger: { trigger: el, start: "top 82%" },
          });
          gsap.to(el.querySelector(".grp-img-inner"), {
            yPercent: 8, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Amenities | Clubhouse, Pool, Spa & Gym, Sector 58 Gurgaon"
        description="M3M Brabus amenities — grand clubhouse, temperature-controlled pool, spa with sauna and steam, gym, event hall, landscaped gardens and 24/7 security."
        path="/amenities"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Amenities", path: "/amenities" }])}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Amenities", path: "/amenities" }]} />
      <PageHeader
        compact
        eyebrow="M3M Brabus Amenities"
        title="A private world"
        accent="within the walls."
        lede="A grand clubhouse, water, wellness and green — staffed around the clock and reserved for residents alone."
      />

      <section className="container-lux pb-[clamp(3rem,9vh,6rem)]">
        {GROUPS.map((g, i) => (
          <article
            key={g.title}
            className={`grp grid items-center gap-10 border-b border-line py-[clamp(3rem,8vh,5rem)] lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 ${i % 2 ? "lg:[&>figure]:order-last" : ""}`}
          >
            <figure className="grp-img relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line">
              <div className="grp-img-inner ed-breath absolute inset-0 scale-[1.06]">
                <Media src={px(g.img, 1400)} alt={`${g.title} — M3M Brabus amenities, Sector 58 Gurgaon`} priority={i === 0} sizes="(max-width:1024px) 100vw, 46vw" />
              </div>
              <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
              <span className="mono absolute left-5 top-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">{g.k}</span>
            </figure>

            <div>
              <h2 className="grp-rise font-display text-[clamp(1.9rem,4vw,3rem)] font-light leading-[1.02] tracking-[-0.02em] text-ink">
                {g.title}
              </h2>
              <p className="grp-rise mt-3 max-w-[42ch] font-serif text-lg italic text-brass">{g.lede}</p>

              <ul className="mt-7 border-t border-line">
                {g.items.map((it) => (
                  <li key={it.n} className="grp-rise group flex items-baseline justify-between gap-6 border-b border-line py-4 transition-colors duration-500 hover:bg-brass/[0.035]">
                    <span className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass-soft">{it.n}</span>
                    <span className="mono shrink-0 text-right text-[0.6rem] tracking-[0.14em] text-ink-faint">{it.d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Amenities are indicative and subject to the final approved plan
        </p>
      </section>

      <RelatedPages links={["/residences", "/gallery", "/location"]} />
      <CtaBand title="Tour the" accent="amenities." subject="Amenities" />
    </div>
  );
}
