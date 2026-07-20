import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import ConfigTable from "../components/sections/ConfigTable.jsx";
import Media from "../components/ui/Media.jsx";
import { RESIDENCES, PROJECT } from "../lib/site.js";
import { px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Three ways of reading the same collection, in the order a buyer uses them:
   the alternating residence rows to fall for a home, ConfigTable to compare the
   two side by side, then the specification schedule for what is actually in
   them. The comparison is a real <table> in its own component because it is the
   page's conversion point — carpet area and availability are unpublished, and
   each unknown is offered as an enquiry rather than guessed at.

   The three do not overlap. Size and aspect appear in both the rows and the
   table because that is the axis of a comparison; everything the two homes
   hold in common is stated once, in 03. */

const SPEC_SCHEDULE = [
  { t: "Flooring", d: "Italian marble to the living and dining areas, with premium finishes carried through the home." },
  { t: "Kitchen", d: "Modular kitchen fitted with branded appliances and hardware." },
  { t: "Climate", d: "VRV air conditioning throughout, zoned for quiet, even comfort." },
  { t: "Automation", d: "Smart-home integration for lighting, climate and security." },
  { t: "Structure", d: "Open-core architecture — each residence opens on three sides for daylight and cross-ventilation." },
  { t: "Arrival", d: "Private lift lobby serving the residence, with dedicated covered parking." },
  { t: "Safety", d: "24/7 manned security with CCTV surveillance across the address." },
  { t: "Sustainability", d: "Rainwater harvesting and energy-efficient building systems." },
];

/* Both homes are built to the schedule above, so a bullet repeating one of its
   rows said nothing about which to buy — the 4 BHK's list was, in full, four
   lines of section 03. RESIDENCES is shared, and other pages still want the
   whole list, so the thinning happens here. Matching is by exact string and
   fails open: reword a bullet in site.js and it reappears rather than
   vanishing unnoticed. "Private foyer & lift lobby" stays whole — the foyer is
   the 5 BHK's alone, and editing shared copy is how a new claim gets made. */
const SHARED_WITH_SCHEDULE = new Set([
  "Italian marble flooring",
  "Modular kitchen · branded fittings",
  "VRV air conditioning",
  "Private lift lobby",
  "Smart-home integration",
  "Premium branded finishes",
]);

const DISTINCT = Object.fromEntries(
  RESIDENCES.map((r) => [r.id, r.features.filter((f) => !SHARED_WITH_SCHEDULE.has(f))]),
);

/* Neither residence has been rendered inside. The two frames these rows carry
   are the shared spaces each home is reached through — the lobby, the arrival
   court — and this is the one page where that can be said out loud: a printed
   caption under the picture, not just an alt attribute a sighted buyer never
   reads. Without it a photograph directly beside the words "5 BHK Residence"
   claims to be the 5 BHK. Each render appears once, and only here; the
   homepage cards carry no photograph at all for want of room to caption them.

   site.js already states what is in each frame, prefixed with the project name
   for the alt attribute's sake. On the page the reader can see whose site they
   are on, so the prefix is dropped and the sentence set as a caption. Falls
   back to nothing rather than to a guess. */
const frameCaption = (alt) => {
  const s = String(alt || "").replace(/^M3M Brabus\s*[—–-]\s*/, "").trim();
  return s ? s[0].toUpperCase() + s.slice(1) : "";
};

export default function ResidencesPage() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        q(".res-row").forEach((el) => {
          const wrap = el.querySelector(".rr-img");
          gsap.set(wrap, { clipPath: "inset(100% 0 0 0)" });
          gsap.to(wrap, {
            clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power3.inOut",
            scrollTrigger: { trigger: el, start: "top 82%" },
          });
          gsap.from(el.querySelectorAll(".rr-rise"), {
            autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 80%" },
          });
          gsap.to(el.querySelector(".rr-img-inner"), {
            yPercent: 8, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
        gsap.from(q(".spec"), {
          autoAlpha: 0, y: 22, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".spec-grid")[0], start: "top 86%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Floor Plans & Residences | 4 & 5 BHK, 5,000–7,000 sq.ft"
        description="M3M Brabus 4 BHK (~5,000 sq.ft) and 5 BHK (~7,000 sq.ft) branded residences — layouts, Italian marble, VRV climate control and the specification schedule."
        path="/residences"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Residences", path: "/residences" }])}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Residences", path: "/residences" }]} />
      <PageHeader
        compact
        eyebrow="M3M Brabus Residences · 4 & 5 BHK"
        title="Open on three sides."
        accent="A collection for the few."
        lede={`${PROJECT.configs} of ${PROJECT.sizes} — composed so that light, air and silence arrive before you do.`}
      />

      {/* alternating residence rows */}
      <section className="container-lux pb-[clamp(3rem,9vh,6rem)]">
        {RESIDENCES.map((r, i) => (
          <article
            key={r.id}
            className={`res-row grid items-center gap-10 border-b border-line py-[clamp(3rem,8vh,5rem)] lg:grid-cols-2 lg:gap-16 ${i % 2 ? "lg:[&>figure]:order-last" : ""}`}
          >
            <figure>
              <div className="rr-img relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line">
                <div className="rr-img-inner ed-breath absolute inset-0 scale-[1.06]">
                  <Media
                    src={px(r.image, 1600)}
                    alt={r.imageAlt || `M3M Brabus, Sector 58 Gurgaon — ${r.name}`}
                    priority={i === 0}
                    sizes="(max-width:1024px) 100vw, 48vw"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_58%,rgba(8,6,5,0.6))]" />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
              </div>
              {frameCaption(r.imageAlt) && (
                <figcaption className="rr-rise mono mt-3 text-[0.56rem] leading-relaxed tracking-[0.18em] text-ink-faint">
                  Shown — {frameCaption(r.imageAlt)}
                </figcaption>
              )}
            </figure>

            <div>
              <span className="rr-rise kicker">{r.tag}</span>
              <h2 className="rr-rise mt-3 font-display text-[clamp(2rem,4.4vw,3.4rem)] font-light leading-[1.02] tracking-[-0.02em] text-ink">
                {r.name}
              </h2>
              <p className="rr-rise mt-3 font-serif text-lg italic text-brass">{r.subtitle}</p>

              <dl className="rr-rise mt-7 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-line pt-6">
                <div>
                  <dt className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">Size</dt>
                  <dd className="mt-1 font-display text-lg text-ink">{r.area}</dd>
                </div>
                <div>
                  <dt className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">Orientation</dt>
                  <dd className="mt-1 text-sm leading-snug text-ink-soft">{r.facing}</dd>
                </div>
              </dl>

              {/* absent on the 4 BHK by design — it is defined by its size and
                  aspect, and claims nothing the 5 BHK does not also have */}
              {DISTINCT[r.id].length > 0 && (
                <div className="rr-rise mt-7">
                  <p className="mono text-[0.58rem] tracking-[0.2em] text-ink-faint">
                    Only in this residence
                  </p>
                  <ul className="mt-3 grid gap-y-2.5 sm:grid-cols-2 sm:gap-x-8">
                    {DISTINCT[r.id].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-ink-soft">
                        <Check size={13} strokeWidth={2} className="shrink-0 text-brass" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </article>
        ))}

        {/* Says out loud what the short lists imply, so a reader cannot infer
            that the 4 BHK goes without the marble or the lift lobby. */}
        <p className="mono mt-8 text-[0.58rem] leading-relaxed tracking-[0.2em] text-ink-faint">
          Both residences are built to the same specification schedule, set out in 03
          <span className="mt-2 block">
            No interior render of either residence has been published · Layouts are
            issued on request
          </span>
        </p>
      </section>

      {/* comparison — semantic table, with the two unpublished figures gated */}
      <ConfigTable index="02" kicker="Side by side" />

      {/* specification schedule */}
      <section className="spec-grid container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">Specification schedule</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {SPEC_SCHEDULE.map((s) => (
            <div key={s.t} className="spec group border-b border-line py-6">
              <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">{s.t}</h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Specifications are indicative and subject to the final approved plan
        </p>
      </section>

      <RelatedPages links={["/floor-plan", "/price", "/brochure", "/amenities"]} />
      <CtaBand title="Request the" accent="floor plans." subject="Residences" />
    </div>
  );
}
