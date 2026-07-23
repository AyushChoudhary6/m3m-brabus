import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Media from "../ui/Media.jsx";
import { useI18n } from "../../lib/i18n.jsx";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 06 — THE EXHIBITION
   A first look at the architecture, hung like a gallery: large plates
   that alternate side to side, each with a clip reveal and a caption
   ledger. Distinct from the amenity gallery — this is the building itself. */
const PIECES = [
  { no: "I", labelKey: "sexhibition.towersLabel", id: IMG.tower, noteKey: "sexhibition.towersNote" },
  { no: "II", labelKey: "sexhibition.arrivalLabel", id: IMG.arrival, noteKey: "sexhibition.arrivalNote" },
  { no: "III", labelKey: "sexhibition.lobbyLabel", id: IMG.lobby, noteKey: "sexhibition.lobbyNote" },
];

export default function Exhibition() {
  const root = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        q(".piece").forEach((el) => {
          const wrap = el.querySelector(".pc-img");
          gsap.set(wrap, { clipPath: "inset(100% 0 0 0)" });
          gsap.set(el.querySelectorAll(".rise"), { autoAlpha: 0, y: 20 });
          gsap.to(wrap, {
            clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power3.inOut",
            scrollTrigger: { trigger: el, start: "top 82%" },
          });
          gsap.to(el.querySelectorAll(".rise"), {
            autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 80%" },
          });
          gsap.to(el.querySelector(".pc-img-inner"), {
            yPercent: 10, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="gallery" ref={root} className="container-lux py-[clamp(5rem,13vh,9rem)]">
      <div className="mb-[clamp(2.5rem,7vh,5rem)] grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
        <h2 className="max-w-[16ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
          {t("sexhibition.headingLead")} <span className="font-serif italic text-brass">{t("sexhibition.headingAccent")}</span>
        </h2>
      </div>

      <div className="flex flex-col gap-[clamp(3.5rem,9vh,7rem)]">
        {PIECES.map((p, i) => (
          <figure
            key={p.no}
            className={`piece grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${i % 2 ? "lg:[&>figcaption]:order-first" : ""}`}
            data-cursor="VIEW"
          >
            <div className="pc-img relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line">
              <div className="pc-img-inner ed-breath absolute inset-0 scale-[1.05]">
                <Media src={px(p.id, 1600)} alt={`${t(p.labelKey)} — M3M Brabus, ${t("sexhibition.locSuffix")}`} sizes="(max-width:1024px) 100vw, 48vw" />
              </div>
              <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_60%,rgba(8,6,5,0.45))]" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            </div>
            <figcaption>
              <span className="rise idx block">{p.no}</span>
              <h3 className="rise mt-4 font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-light tracking-[-0.01em] text-ink">{t(p.labelKey)}</h3>
              <p className="rise mt-4 max-w-[38ch] text-lg leading-relaxed text-ink-soft">{t(p.noteKey)}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
