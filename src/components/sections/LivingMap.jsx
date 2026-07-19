import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LOCATION, PROJECT } from "../../lib/site.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 06 — THE ADDRESS
   The real location on a dark map — Sector 58, on Golf Course Extension Road —
   with a pulsing gold marker, alongside a ledger of distances. */
const COORDS = [28.4236, 77.0916]; // Sector 58, Gurugram · GCE Road (indicative — set to the exact plot)

export default function LivingMap() {
  const root = useRef(null);
  const mapEl = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !mapEl.current) return;
    const map = L.map(mapEl.current, {
      center: COORDS,
      zoom: 14,
      zoomControl: false,
      scrollWheelZoom: false, // don't hijack page scroll
      dragging: true,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
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

    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => {
      clearTimeout(t);
      map.remove();
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
    <section id="location" ref={root} className="container-lux py-[clamp(5rem,13vh,9rem)]">
      <div className="mb-[clamp(2.5rem,6vh,4.5rem)] grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
        <div className="flex items-baseline gap-5">
          <span className="idx">06</span>
          <span className="kicker">The Address</span>
        </div>
        <h2 className="max-w-[18ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
          The centre of <span className="font-serif italic text-brass">new Gurugram.</span>
        </h2>
      </div>

      <div className="grid items-stretch gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* distance ledger */}
        <div className="flex flex-col">
          <p className="mono mb-6 text-[0.6rem] tracking-[0.24em] text-ink-faint">Connectivity</p>
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
            Open in Google Maps
            <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* real map */}
        <div className="map-frame relative overflow-hidden rounded-[1.25rem] border border-line">
          <div ref={mapEl} className="h-[clamp(360px,60vh,640px)] w-full" />
          {/* subtle framing overlays (do not block map interaction) */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 [background:linear-gradient(180deg,rgba(8,6,5,0.5),transparent)]" />
          <div className="pointer-events-none absolute bottom-4 left-4 z-[500]">
            <p className="mono text-[0.58rem] tracking-[0.2em] text-brass-soft [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
              {PROJECT.location} · GCE Road
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
