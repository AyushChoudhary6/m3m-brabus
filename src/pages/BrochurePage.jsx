import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Check } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Magnetic from "../components/ui/Magnetic.jsx";
import Media from "../components/ui/Media.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { PROJECT, RESIDENCES } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* What the brochure carries. Each row states plainly where a figure is
   unpublished — nothing here quotes a number the official listing doesn't. */
const CONTENTS = [
  {
    t: "Floor plans",
    d: `Layouts for the ${PROJECT.configs.toLowerCase()} — ${RESIDENCES[0].area} and ${RESIDENCES[1].area} — with orientation, the private lift lobby and the three-side-open core drawn room by room.`,
    n: "Plans",
  },
  {
    t: "Specifications",
    d: "The full finish schedule: Italian marble flooring, modular kitchen with branded fittings, VRV air conditioning and smart-home integration.",
    n: "Finishes",
  },
  {
    t: "Amenities",
    d: "The grand clubhouse, temperature-controlled pool, spa with sauna and steam, gym, event hall, landscaped gardens, play areas, games and restaurant.",
    n: "The club",
  },
  {
    t: "Location & connectivity",
    d: `${PROJECT.address} — the address mapped against Golf Course Extension Road, Golf Course Road, Cyber City, NH-8, Sohna Road, IGI Airport and nearby metro.`,
    n: "Sector 58",
  },
  {
    t: "Price list & payment plan",
    d: `Pricing is ${PROJECT.price.toLowerCase()} — it has not been publicly released. Register through the form and the price sheet and payment plan reach you the moment they are announced.`,
    n: PROJECT.price,
  },
  {
    t: "Project & approval status",
    d: `Possession: ${PROJECT.possession.toLowerCase()}. ${PROJECT.rera}. We publish only what the developer has released, and share the current status directly.`,
    n: "On request",
  },
];

const ASSURANCES = [
  "Sent straight to you — no third-party listing portals",
  "Official developer material only, nothing invented",
  "One conversation, no obligation to proceed",
];

export default function BrochurePage() {
  const root = useRef(null);
  const { openBrochure } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        gsap.set(q(".br-img"), { clipPath: "inset(100% 0 0 0)" });
        gsap.to(q(".br-img"), {
          clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".br-img")[0], start: "top 84%" },
        });
        gsap.to(q(".br-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".br-img")[0], start: "top bottom", end: "bottom top", scrub: true },
        });

        gsap.from(q(".dl-rise"), {
          autoAlpha: 0, y: 26, duration: 1, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".dl")[0], start: "top 84%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Brochure | Download Floor Plans, Specifications & Price List"
        description="Download the M3M Brabus brochure — 4 & 5 BHK residences of approx. 5,000–7,000 sq.ft at Sector 58, Gurugram. Floor plans, specifications and amenities."
        path="/brochure"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Brochure", path: "/brochure" }])}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Brochure", path: "/brochure" }]} />
      <PageHeader
        eyebrow="M3M Brabus Brochure"
        title="The full book,"
        accent="sent to you directly."
        lede={`Floor plans, specifications, amenities and the location dossier for ${PROJECT.name} — ${PROJECT.configs.toLowerCase()} of ${PROJECT.sizes} at ${PROJECT.location}. Leave your details and the brochure arrives from the private client team.`}
      />

      {/* what's inside */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">What's inside the brochure</span>
        </div>
        <div className="border-t border-line">
          {CONTENTS.map((c, i) => (
            <article
              key={c.t}
              className="rise group grid grid-cols-1 gap-2 border-b border-line py-6 transition-colors duration-500 hover:bg-brass/[0.035] sm:grid-cols-[3rem_minmax(0,16rem)_1fr] sm:items-baseline sm:gap-8"
            >
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-2xl">
                {c.t}
              </h2>
              <div>
                <p className="max-w-[54ch] text-sm leading-relaxed text-ink-soft">{c.d}</p>
                <p className="mono mt-2 text-[0.58rem] tracking-[0.2em] text-ink-faint">{c.n}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          Contents are indicative and subject to the final approved plan
        </p>
      </section>

      {/* the download */}
      <section className="dl container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid items-center gap-10 border-t border-line pt-[clamp(3rem,8vh,5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <span className="dl-rise kicker">Download</span>
            <h2 className="dl-rise mt-4 max-w-[14ch] font-display text-[clamp(2.1rem,5vw,3.6rem)] font-light leading-[1.02] tracking-[-0.02em] text-ink">
              Request the{" "}
              <span className="font-serif italic text-brass">brochure.</span>
            </h2>
            <p className="dl-rise mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
              A short form unlocks the download — just your name and phone, so the team can answer
              anything the book leaves open. The file starts downloading the moment you submit.
            </p>

            <div className="dl-rise mt-9">
              <Magnetic>
                <button
                  type="button"
                  onClick={() => openBrochure("Brochure page")}
                  data-cursor="DOWNLOAD"
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    Download the brochure
                  </span>
                  <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                </button>
              </Magnetic>
            </div>

            <ul className="dl-rise mt-9 border-t border-line">
              {ASSURANCES.map((a) => (
                <li key={a} className="flex items-center gap-3 border-b border-line-soft py-3.5 text-sm text-ink-soft">
                  <Check size={13} strokeWidth={2} className="shrink-0 text-brass" />
                  {a}
                </li>
              ))}
            </ul>

            <p className="dl-rise mono mt-6 text-[0.62rem] leading-relaxed tracking-[0.14em] text-ink-faint">
              Or call {PROJECT.phone} · {PROJECT.email}
            </p>
          </div>

          <figure className="br-img relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="br-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.lobby, 1400)}
                alt={`${PROJECT.name} — brochure cover imagery, the lobby`}
                sizes="(max-width:1024px) 100vw, 44vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_52%,rgba(8,6,5,0.7))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              {PROJECT.name} · {PROJECT.location}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* no obligation note */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="border-t border-line pt-8">
          <span className="rise kicker">No obligation</span>
          <p className="rise mt-5 max-w-[62ch] font-serif text-[clamp(1.15rem,2.2vw,1.5rem)] italic leading-relaxed text-ink">
            The brochure is shared directly by the private client team — nothing is sold on this page,
            and there is no commitment attached to asking for it.
          </p>
          <p className="rise mt-5 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
            Your details are used to send the material and to answer your questions, nothing else. Where a
            figure is not yet published by {PROJECT.developer} — price, RERA registration or possession —
            the brochure says so plainly, and we follow up the moment it is released.
          </p>
        </div>
      </section>

      <RelatedPages links={["/residences", "/amenities", "/location", "/contact"]} />
      <CtaBand title="Ask for the" accent="full book." subject="Brochure" />
    </div>
  );
}
