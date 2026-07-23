import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Media from "../ui/Media.jsx";
import { useI18n } from "../../lib/i18n.jsx";
import { IMG, px } from "../../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 01 / 02 — THE PHILOSOPHY & ENGINEERING
   A read-along statement, then the BRABUS engineering as a framed plate beside
   three principles. Motion: the statement brightens word by word; the plate
   clip-reveals; the text rises. */
const PRINCIPLES = [
  { k: "i", t: "smanifesto.p1Title", d: "smanifesto.p1Desc" },
  { k: "ii", t: "smanifesto.p2Title", d: "smanifesto.p2Desc" },
  { k: "iii", t: "smanifesto.p3Title", d: "smanifesto.p3Desc" },
];

export default function Manifesto() {
  const root = useRef(null);
  const imgWrap = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(q(".rise"), { autoAlpha: 0, y: 24 });
        gsap.set(imgWrap.current, { clipPath: "inset(100% 0 0 0)" });

        // read-along: words brighten one by one as you scroll through them
        gsap.fromTo(q(".stmt-word"),
          { opacity: 0.55 },
          {
            opacity: 1, ease: "none", stagger: 0.4,
            scrollTrigger: { trigger: q(".stmt")[0], start: "top 72%", end: "top 24%", scrub: true },
          },
        );

        // engineering plate reveal + text rise
        gsap.to(imgWrap.current, {
          clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".eng")[0], start: "top 82%" },
        });
        gsap.to(q(".rise"), {
          autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".eng")[0], start: "top 78%" },
        });
        gsap.to(q(".mf-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".eng")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="philosophy" ref={root} className="container-lux py-[clamp(5rem,13vh,9rem)]">
      {/* statement */}
      <div className="stmt grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-16">
        <h2 className="flex max-w-[24ch] flex-wrap font-display text-[clamp(1.9rem,4.6vw,3.9rem)] font-light leading-[1.14] tracking-[-0.02em] text-ink">
          {t("smanifesto.statementLead").split(" ").map((w, i) => (
            <span key={i} className="stmt-word mr-[0.28em]">{w}</span>
          ))}
          {t("smanifesto.statementAccent").split(" ").map((w, i) => (
            <span key={`a${i}`} className="stmt-word mr-[0.28em] font-serif italic text-brass">{w}</span>
          ))}
        </h2>
      </div>

      {/* engineering */}
      <div className="eng mt-[clamp(4.5rem,12vh,8rem)] grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
        {/* framed plate */}
        <figure className="rise">
          <div ref={imgWrap} className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line md:aspect-[5/6]">
            <div className="mf-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media src={px(IMG.lobby, 1600)} alt={t("smanifesto.lobbyAlt")} sizes="(max-width:1024px) 100vw, 46vw" />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_50%,rgba(8,6,5,0.6))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            {/* Caption the frame, not the argument. This is the lobby render; no
                image of the engineering itself has been published. */}
            <span className="mono absolute left-5 bottom-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">{t("smanifesto.theLobby")}</span>
          </div>
        </figure>

        {/* text */}
        <div>
          <h3 className="rise max-w-[18ch] font-display text-[clamp(1.8rem,3.8vw,3.1rem)] font-light leading-[1.06] tracking-[-0.02em] text-ink">
            {t("smanifesto.engLead")} <span className="font-serif italic text-brass">{t("smanifesto.engAccent")}</span>
          </h3>

          <ul className="mt-9 border-t border-line">
            {PRINCIPLES.map((c) => (
              <li key={c.k} className="rise group border-b border-line py-6 transition-colors duration-500 hover:bg-brass/[0.035]">
                <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-2xl">{t(c.t)}</h3>
                <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{t(c.d)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
