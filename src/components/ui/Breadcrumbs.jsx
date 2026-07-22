import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useI18n } from "../../lib/i18n.jsx";

/**
 * Breadcrumb trail — PRD Business Rule 3 (internal links on every page).
 * Pair with breadcrumbLd() in <Seo> so the same trail is emitted as schema.
 */
export default function Breadcrumbs({ trail = [] }) {
  const { t } = useI18n();
  if (!trail.length) return null;
  return (
    <nav aria-label={t("breadcrumbs.aria")} className="container-lux pt-[clamp(6.5rem,14vh,9rem)]">
      <ol className="mono flex flex-wrap items-center gap-2 text-[0.62rem] tracking-[0.18em] text-ink-faint">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-brass">{crumb.name}</span>
              ) : (
                <>
                  <Link to={crumb.path} className="transition-colors hover:text-ink">{crumb.name}</Link>
                  <ChevronRight size={11} className="text-ink-faint/60" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
