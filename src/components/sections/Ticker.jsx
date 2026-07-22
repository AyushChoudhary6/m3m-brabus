import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Marquee from "../ui/Marquee.jsx";
import { useI18n } from "../../lib/i18n.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* INTERLUDE — a kinetic outlined-type marquee band.
   Drifts on its own; the whole band skews and shifts a touch with scroll
   velocity so it feels physically connected to the page. */
const WORDS = [
  "sticker.brandedResidences",
  "sticker.sectorGurgaon",
  "sticker.configs",
  "sticker.engineeredBrabus",
  "sticker.gceRoad",
];

export default function Ticker() {
  const root = useRef(null);
  const { t } = useI18n();
  const words = WORDS.map((k) => t(k));

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          root.current.querySelector(".ticker-inner"),
          { xPercent: 4 },
          {
            xPercent: -4, ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className="border-y border-line py-[clamp(1.6rem,4vh,3rem)]">
      <div className="ticker-inner">
        <Marquee items={words} speed={30} />
      </div>
    </div>
  );
}
