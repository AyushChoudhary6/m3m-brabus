import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * Breadcrumb trail — PRD Business Rule 3 (internal links on every page).
 * Pair with breadcrumbLd() in <Seo> so the same trail is emitted as schema.
 */
export default function Breadcrumbs({ trail = [] }) {
  if (!trail.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="container-lux pt-[clamp(6.5rem,14vh,9rem)]">
      <ol className="mono flex flex-wrap items-center gap-2 text-[0.62rem] tracking-[0.18em] text-ink-faint">
        {trail.map((t, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={t.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-brass">{t.name}</span>
              ) : (
                <>
                  <Link to={t.path} className="transition-colors hover:text-ink">{t.name}</Link>
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
