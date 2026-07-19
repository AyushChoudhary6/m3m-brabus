import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Media from "../ui/Media.jsx";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PIECES = [
  { label: "I. The Tower", id: IMG.tower, w: "w-full md:w-[58%]", ratio: "aspect-[4/5]", align: "md:mr-auto" },
  { label: "II. The Lobby", id: IMG.lobbyWarm, w: "w-full md:w-[42%]", ratio: "aspect-[3/4]", align: "md:ml-auto md:-mt-[18vh]" },
  { label: "III. The Residence", id: IMG.livingRoom, w: "w-full md:w-[50%]", ratio: "aspect-[16/10]", align: "md:mx-auto" },
  { label: "IV. The Spa", id: IMG.spa, w: "w-full md:w-[46%]", ratio: "aspect-[4/5]", align: "md:mr-auto md:-mt-[10vh]" },
];

/* CHAPTER 09 — THE EXHIBITION
   Not a grid — an exhibition. Framed pieces reveal with a clip mask and
   a slow inner parallax; asymmetric hanging so every screen surprises. */
export default function Exhibition() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);
      q(".piece").forEach((el) => {
        gsap.fromTo(el.querySelector(".frame"), { clipPath: "inset(100% 0 0 0)" }, {
          clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
        gsap.fromTo(el.querySelector(".frame img"), { yPercent: -12 }, {
          yPercent: 12, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative py-[14vh]">
      <div className="mb-[8vh] px-[var(--spacing-gutter)]">
        <p className="kicker mb-5">Chapter 09 — The Exhibition</p>
        <h2 className="max-w-[16ch] font-display text-[clamp(2.4rem,6vw,5rem)] font-light leading-[1.02] text-ink">
          A first look, <span className="italic text-brass">framed.</span>
        </h2>
      </div>

      <div className="flex flex-col gap-[10vh] px-[var(--spacing-gutter)]">
        {PIECES.map((p) => (
          <figure key={p.label} className={`piece ${p.w} ${p.align}`} data-cursor="VIEW">
            <div className={`frame relative ${p.ratio} overflow-hidden rounded-[1.5rem] border border-line`}>
              <div className="absolute inset-0 scale-110">
                <Media src={px(p.id, 1200)} alt={p.label} sizes="(max-width:768px) 100vw, 55vw" />
              </div>
            </div>
            <figcaption className="mt-4 font-display text-sm italic text-ink-soft">{p.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
