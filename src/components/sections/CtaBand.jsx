import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import Magnetic from "../ui/Magnetic.jsx";
import { useEnquiry } from "../ui/Enquiry.jsx";
import { useI18n } from "../../lib/i18n.jsx";
import { PROJECT } from "../../lib/site.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Closing enquiry band — used at the foot of every inner page. */
export default function CtaBand({ title = "Your residence", accent = "awaits.", subject = "" }) {
  const root = useRef(null);
  const { openEnquiry } = useEnquiry();
  const { t } = useI18n();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.from(q(".cta-rise"), {
          autoAlpha: 0, y: 24, duration: 1, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: root.current, start: "top 82%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden border-t border-line bg-cream">
      <div className="gold-glow pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-brass/[0.08] blur-[130px]" />
      <div className="container-lux relative py-[clamp(4.5rem,12vh,8rem)] text-center">
        <p className="cta-rise kicker">{t("enq.consultation")}</p>
        <h2 className="cta-rise mx-auto mt-5 max-w-[16ch] font-display text-[clamp(2.2rem,6vw,4.5rem)] font-light leading-[1] tracking-[-0.02em] text-ink">
          {title} <span className="font-serif italic text-brass">{accent}</span>
        </h2>
        <p className="cta-rise mx-auto mt-6 max-w-md text-ink-soft">
{PROJECT.configs} · {PROJECT.location}. {t("enq.ctaBody")}
        </p>
        <div className="cta-rise mt-9 flex flex-wrap items-center justify-center gap-5">
          <Magnetic>
            <button
              type="button"
              onClick={() => openEnquiry(subject)}
              data-cursor="ENTER"
              className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
              <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                {t("cta.registerInterest")}
              </span>
              <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
            </button>
          </Magnetic>
          <a
            href={`tel:${PROJECT.phone}`}
            className="mono text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
          >
            {t("cta.orCall")} {PROJECT.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
