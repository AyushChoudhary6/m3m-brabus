import { Link } from "react-router-dom";
import { NAV_LINKS, PROJECT } from "../lib/site.js";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-cream">
      <div className="container-lux py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="font-display text-2xl tracking-tight text-ink">
              M3M <span className="italic text-brass">Brabus</span>
            </span>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
              Branded residences at {PROJECT.location}, on Golf Course Extension
              Road — engineered in partnership with {PROJECT.partner}. {PROJECT.configs}.
            </p>
            <p className="mt-6 max-w-sm text-xs leading-relaxed text-ink-faint">
              {PROJECT.rera}. This is not an offer or a contract. All imagery is
              artistic and indicative. Figures are subject to the official RERA
              listing and may change.
            </p>
          </div>

          <div>
            <h4 className="kicker mb-5">Explore</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-ink-soft transition-colors hover:text-brass">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="kicker mb-5">Sales Enquiry</h4>
            <ul className="space-y-3 text-sm text-ink-soft">
              <li>
                <a href={`tel:${PROJECT.phone}`} className="transition-colors hover:text-brass">
                  {PROJECT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${PROJECT.email}`} className="transition-colors hover:text-brass">
                  {PROJECT.email}
                </a>
              </li>
              <li className="pt-2 text-ink-faint">{PROJECT.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-8 text-xs text-ink-faint md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} M3M Brabus. All rights reserved.</span>
          <span>Developed by {PROJECT.developer} · in partnership with {PROJECT.partner}</span>
        </div>
      </div>
    </footer>
  );
}
