import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import LivingMap from "../components/sections/LivingMap.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import { PROJECT } from "../lib/site.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const NEIGHBOURHOOD = [
  { k: "01", t: "Golf Course Extension Road", d: "The city's most sought-after residential spine — the address sits directly on it, with a direct link to Golf Course Road." },
  { k: "02", t: "Business hubs", d: "Cyber City and Gurugram's corporate districts within easy reach, with NH-8 and Sohna Road for quick city-wide access." },
  { k: "03", t: "Airport & metro", d: "Easy access to IGI Airport, with metro connectivity nearby for the daily commute." },
  { k: "04", t: "Schools, healthcare & retail", d: "Reputed schools, hospitals and shopping destinations close by — the everyday, kept convenient." },
];

export default function LocationPage() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        q(".nb").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0, y: 26, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Location | Sector 58, Golf Course Extension Road, Gurgaon"
        description="M3M Brabus is on Golf Course Extension Road, Sector 58, Gurugram — with easy access to Golf Course Road, Cyber City, NH-8, Sohna Road, IGI Airport and nearby metro connectivity."
        path="/location"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Location", path: "/location" }])}
      />
      <PageHeader
        eyebrow="05 · The Address"
        title="The centre of"
        accent="new Gurugram."
        lede={`${PROJECT.address} — a position that puts the metro, the business district and the airport within easy reach, while keeping the noise out.`}
      />

      {/* real map + connectivity ledger (page supplies its own heading) */}
      <LivingMap bare />

      {/* neighbourhood */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">The neighbourhood</span>
        </div>
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {NEIGHBOURHOOD.map((n) => (
            <article key={n.t} className="nb group border-b border-line py-7">
              <span className="idx">{n.k}</span>
              <h3 className="mt-3 font-display text-2xl text-ink transition-colors duration-300 group-hover:text-brass-soft">{n.t}</h3>
              <p className="mt-2 max-w-[44ch] leading-relaxed text-ink-soft">{n.d}</p>
            </article>
          ))}
        </div>
      </section>

      <CtaBand title="Visit the" accent="address." subject="Location" />
    </div>
  );
}
