import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "../../lib/i18n.jsx";

/**
 * "No dead-end pages" — PRD Business Rule 6.
 * Every page ends with links onward to the next relevant pages.
 */
const ALL = {
  "/overview": { t: "srelated.overviewTitle", d: "srelated.overviewDesc" },
  "/residences": { t: "srelated.residencesTitle", d: "srelated.residencesDesc" },
  "/floor-plan": { t: "srelated.floorPlanTitle", d: "srelated.floorPlanDesc" },
  "/price": { t: "srelated.priceTitle", d: "srelated.priceDesc" },
  "/payment-plan": { t: "srelated.paymentPlanTitle", d: "srelated.paymentPlanDesc" },
  "/brabus": { t: "srelated.brabusTitle", d: "srelated.brabusDesc" },
  "/amenities": { t: "srelated.amenitiesTitle", d: "srelated.amenitiesDesc" },
  "/location": { t: "srelated.locationTitle", d: "srelated.locationDesc" },
  "/gallery": { t: "srelated.galleryTitle", d: "srelated.galleryDesc" },
  "/brochure": { t: "srelated.brochureTitle", d: "srelated.brochureDesc" },
  "/reviews": { t: "srelated.reviewsTitle", d: "srelated.reviewsDesc" },
  "/possession": { t: "srelated.possessionTitle", d: "srelated.possessionDesc" },
  "/rera": { t: "srelated.reraTitle", d: "srelated.reraDesc" },
  "/contact": { t: "srelated.contactTitle", d: "srelated.contactDesc" },
  "/master-plan": { t: "srelated.masterPlanTitle", d: "srelated.masterPlanDesc" },
  "/specifications": { t: "srelated.specificationsTitle", d: "srelated.specificationsDesc" },
  "/construction-status": { t: "srelated.constructionStatusTitle", d: "srelated.constructionStatusDesc" },
  "/faqs": { t: "srelated.faqsTitle", d: "srelated.faqsDesc" },
  "/guides": { t: "srelated.guidesTitle", d: "srelated.guidesDesc" },
  "/blogs": { t: "srelated.blogsTitle", d: "srelated.blogsDesc" },
  "/about": { t: "srelated.aboutTitle", d: "srelated.aboutDesc" },
  "/privacy-policy": { t: "srelated.privacyTitle", d: "srelated.privacyDesc" },
  "/disclaimer": { t: "srelated.disclaimerTitle", d: "srelated.disclaimerDesc" },
};

export default function RelatedPages({ links = [] }) {
  const { t } = useI18n();
  const items = links.map((p) => ({ path: p, ...ALL[p] })).filter((i) => i.t);
  if (!items.length) return null;

  return (
    <section className="container-lux py-[clamp(3rem,9vh,5rem)]">
      <div className="mb-8 border-t border-line" />
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
                {t(i.t)}
              </span>
              <span className="mt-1.5 block max-w-[34ch] text-sm leading-relaxed text-ink-soft">{t(i.d)}</span>
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
