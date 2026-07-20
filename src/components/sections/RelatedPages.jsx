import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/**
 * "No dead-end pages" — PRD Business Rule 6.
 * Every page ends with links onward to the next relevant pages.
 */
const ALL = {
  "/overview": { t: "Overview", d: "The project at a glance — sizes, facts and what sets it apart." },
  "/residences": { t: "The Residences", d: "4 & 5 BHK layouts, specifications and the plan schedule." },
  "/floor-plan": { t: "Floor Plans", d: "Interactive 4 & 5 BHK plans, room by room." },
  "/price": { t: "Price", d: "What drives the pricing, and how to get the price sheet." },
  "/payment-plan": { t: "Payment Plan", d: "How payment schedules work and how to request the official plan." },
  "/brabus": { t: "The BRABUS Partnership", d: "How the marque shapes the interiors and the standard." },
  "/amenities": { t: "Amenities", d: "Clubhouse, pool, spa, gym and the private world within." },
  "/location": { t: "Location & Connectivity", d: "Sector 58 on Golf Course Extension Road, mapped." },
  "/gallery": { t: "Gallery", d: "Official renders of the towers, arrival and lobby." },
  "/brochure": { t: "Download Brochure", d: "Floor plans, specifications and the price list." },
  "/reviews": { t: "Review & Assessment", d: "An honest look at the proposition — and what to verify." },
  "/possession": { t: "Possession", d: "Timeline status and what to ask before you buy." },
  "/rera": { t: "RERA", d: "Registration status and how to verify on the HARERA portal." },
  "/contact": { t: "Contact", d: "Speak to the private client team or book a site visit." },
  "/master-plan": { t: "Master Plan", d: "How the site is planned — orientation, spacing and phasing." },
  "/specifications": { t: "Specifications", d: "Finishes and systems, confirmed and on request." },
  "/construction-status": { t: "Construction Status", d: "Verified progress, and how to check it yourself." },
  "/faqs": { t: "FAQs", d: "Straight answers on price, RERA, possession and layouts." },
  "/guides": { t: "Buyer Guides", d: "A staged path from research to handover." },
  "/blogs": { t: "Blogs", d: "Guides on branded residences, the corridor and buying well." },
  "/about": { t: "About", d: "Who runs this site, and how we handle information." },
  "/privacy-policy": { t: "Privacy Policy", d: "What we collect, where it goes, and your rights." },
  "/disclaimer": { t: "Disclaimer", d: "What this website is, and what it is not." },
};

export default function RelatedPages({ links = [], title = "Continue exploring" }) {
  const items = links.map((p) => ({ path: p, ...ALL[p] })).filter((i) => i.t);
  if (!items.length) return null;

  return (
    <section className="container-lux py-[clamp(3rem,9vh,5rem)]">
      <div className="mb-8 flex items-baseline gap-5 border-t border-line pt-8">
        <span className="kicker">{title}</span>
      </div>
      <div className="grid gap-x-12 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Link
            key={i.path}
            to={i.path}
            data-cursor="ENTER"
            className="group flex items-start justify-between gap-6 border-b border-line py-6 transition-colors duration-500 hover:bg-brass/[0.035]"
          >
            <span>
              <span className="block font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {i.t}
              </span>
              <span className="mt-1.5 block max-w-[34ch] text-sm leading-relaxed text-ink-soft">{i.d}</span>
            </span>
            <ArrowUpRight
              size={16}
              className="mt-1 shrink-0 text-brass transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
