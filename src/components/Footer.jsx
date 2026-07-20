import { Link } from "react-router-dom";
import { FOOTER_NAV, PROJECT } from "../lib/site.js";

/* Ch. 21 — footer navigation in four columns beside the brand block.
   Every route on the site is reachable from here, so nothing is orphaned. */
export default function Footer() {
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
              Branded residences at {PROJECT.location}, on Golf Course Extension
              Road — engineered in partnership with {PROJECT.partner}. {PROJECT.configs}.
            </p>

            <div className="mt-7 space-y-2 text-sm">
              <a href={`tel:${PROJECT.phone}`} className="block text-ink transition-colors hover:text-brass">
                {PROJECT.phone}
              </a>
              <a href={`mailto:${PROJECT.email}`} className="block text-ink-soft transition-colors hover:text-brass">
                {PROJECT.email}
              </a>
              <p className="pt-1 text-ink-faint">{PROJECT.address}</p>
            </div>
          </div>

          {/* four-column index */}
          <nav className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4" aria-label="Footer">
            {FOOTER_NAV.map((col) => (
              <div key={col.heading}>
                <h4 className="kicker mb-5">{col.heading}</h4>
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
          {PROJECT.rera}. This website is for information only and does not
          constitute an offer or a contract. All imagery is artistic and
          indicative. Areas, specifications and figures are subject to the
          official RERA listing and may change at the developer's discretion.
          See our{" "}
          <Link to="/disclaimer" className="underline underline-offset-2 hover:text-brass">
            disclaimer
          </Link>
          .
        </p>

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-8 text-xs text-ink-faint md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} M3M Brabus. All rights reserved.</span>
          <span>Developed by {PROJECT.developer} · in partnership with {PROJECT.partner}</span>
        </div>
      </div>
    </footer>
  );
}
