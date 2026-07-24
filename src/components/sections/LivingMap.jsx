import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "../../lib/i18n.jsx";
import { LOCATION, PROJECT } from "../../lib/site.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 06 — THE ADDRESS
   The real location on a dark map — Sector 58, on Golf Course Extension Road —
   with a pulsing gold marker, alongside a ledger of distances. */
const COORDS = [28.4236, 77.0916]; // Sector 58, Gurugram · GCE Road (indicative — set to the exact plot)

export default function LivingMap({ bare = false }) {
  const root = useRef(null);
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const { t } = useI18n();

  useEffect(() => {
    const node = mapEl.current;
    if (mapRef.current || !node) return;

    let invalidate;
    const init = () => {
      if (mapRef.current) return;
      const map = L.map(node, {
        center: COORDS,
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: false, // don't hijack page scroll
        dragging: true,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 20,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      }).addTo(map);

      const icon = L.divIcon({
        className: "mb-pin",
        html: '<span class="mb-pin-ring"></span><span class="mb-pin-dot"></span>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker(COORDS, { icon, keyboard: false }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Named to avoid shadowing the translation function `t` above — a stray
      // t("…") added inside this effect would otherwise resolve to a timeout id.
      invalidate = setTimeout(() => map.invalidateSize(), 250);
    };

    // The section (and its crawlable distance ledger) stays in the DOM, but the
    // Leaflet init and the batch of cross-origin CARTO tile requests are the
    // real cost — and the map sits well below the fold. Hold both until the
    // reader is within ~300px of it so they don't compete with the homepage's
    // above-the-fold load. No IntersectionObserver (old browser, or the
    // prerenderer, which never scrolls) → initialise immediately, unchanged.
    if (typeof IntersectionObserver === "undefined") {
      init();
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            init();
          }
        },
        { rootMargin: "300px" },
      );
      io.observe(node);
      return () => {
        io.disconnect();
        clearTimeout(invalidate);
        mapRef.current?.remove();
        mapRef.current = null;
      };
    }

    return () => {
      clearTimeout(invalidate);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        q(".loc-row").forEach((row) => {
          gsap.from(row.querySelector(".loc-inner"), {
            yPercent: 120, ease: "power4.out",
            scrollTrigger: { trigger: row, start: "top 92%", end: "top 72%", scrub: true },
          });
        });
        gsap.from(q(".map-frame"), {
          autoAlpha: 0, y: 34, duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: q(".map-frame")[0], start: "top 82%" },
        });
      });
    },
    { scope: root },
  );

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${COORDS[0]},${COORDS[1]}`;

  return (
    <section
      id="location"
      ref={root}
      className={bare ? "container-lux pb-[clamp(3rem,9vh,6rem)]" : "container-lux py-[clamp(5rem,13vh,9rem)]"}
    >
      {!bare && (
        <div className="mb-[clamp(2.5rem,6vh,4.5rem)] grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
          <h2 className="max-w-[18ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
            {t("smap.headingLead")} <span className="font-serif italic text-brass">{t("smap.headingAccent")}</span>
          </h2>
        </div>
      )}

      <div className="grid items-stretch gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* distance ledger */}
        <div className="flex flex-col">
          <p className="mono mb-6 text-[0.6rem] tracking-[0.24em] text-ink-faint">{t("smap.connectivity")}</p>
          <div className="border-t border-line">
            {LOCATION.map((l) => (
              <div key={l.place} className="loc-row overflow-hidden border-b border-line">
                <span className="loc-inner flex items-baseline justify-between gap-4 py-4">
                  <span className="text-ink">{l.place}</span>
                  <span className="mono whitespace-nowrap text-[0.72rem] tracking-[0.1em] text-brass">{l.time}</span>
                </span>
              </div>
            ))}
          </div>
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="VIEW"
            className="group mt-8 inline-flex items-center gap-2.5 self-start border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass"
          >
            {t("smap.openInMaps")}
            <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* real map */}
        <div className="map-frame relative overflow-hidden rounded-[1.25rem] border border-line">
          <div ref={mapEl} className="h-[clamp(360px,60vh,640px)] w-full" />
          {/* subtle framing overlay (does not block map interaction). The dark
              top scrim is gone: over light tiles it read as a grey smudge. */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
          <div className="pointer-events-none absolute bottom-4 left-4 z-[500]">
            {/* dark type on a light plate — the pale gold used for the dark map
                is unreadable against light tiles */}
            <p className="mono rounded-full bg-white/85 px-3 py-1.5 text-[0.58rem] tracking-[0.2em] text-[#3d3729] shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
              {PROJECT.location} · {t("smap.gceRoad")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
