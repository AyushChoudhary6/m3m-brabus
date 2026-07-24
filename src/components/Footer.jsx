import { Link } from "react-router-dom";
import { useI18n } from "../lib/i18n.jsx";
import { FOOTER_NAV, PROJECT } from "../lib/site.js";

/* Ch. 21 — footer navigation in four columns beside the brand block.
   Every route on the site is reachable from here, so nothing is orphaned. */
export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line bg-cream">
      <div className="container-lux py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2.5fr]">
          {/* brand + contact */}
          <div>
            <span className="font-display text-3xl tracking-[-0.01em] text-ink">
              M3M <span className="font-serif italic text-brass">Brabus</span>
            </span>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
              {t("footer.brandLinePre")} {PROJECT.location}{t("footer.brandLineMid")} {PROJECT.partner}. {PROJECT.configs}.
            </p>

            {/* flex column (not space-y on block children): guarantees the
                phone, email and address each sit on their own line with a gap,
                even if the block utility is ever dropped from an anchor. */}
            <div className="mt-7 flex flex-col items-start gap-2.5 text-sm">
              <a href={`tel:${PROJECT.phone}`} className="w-fit text-ink transition-colors hover:text-brass">
                {PROJECT.phone}
              </a>
              <a href={`mailto:${PROJECT.email}`} className="w-fit text-ink-soft transition-colors hover:text-brass">
                {PROJECT.email}
              </a>
              <p className="pt-1 text-ink-faint">{PROJECT.address}</p>
            </div>
          </div>

          {/* four-column index */}
          <nav className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4" aria-label="Footer">
            {FOOTER_NAV.map((col) => (
              <div key={col.heading}>
                <h2 className="mb-5 font-display text-base text-ink">{col.heading}</h2>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="text-sm leading-snug text-ink-soft transition-colors hover:text-brass"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="mt-16 max-w-3xl text-xs leading-relaxed text-ink-faint">
          {PROJECT.rera}. {t("footer.legalBody")}{" "}
          <Link to="/disclaimer" className="underline underline-offset-2 hover:text-brass">
            {t("footer.disclaimerLink")}
          </Link>
          .
        </p>

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-8 text-xs text-ink-faint md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} M3M Brabus. {t("footer.rightsReserved")}</span>
          <span>{t("footer.developedBy")} {PROJECT.developer} {t("footer.inPartnership")} {PROJECT.partner}</span>
        </div>
      </div>
    </footer>
  );
}
