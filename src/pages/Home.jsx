import { lazy, Suspense } from "react";
import Seo from "../components/ui/Seo.jsx";
import Hero from "../components/sections/Hero.jsx";
import Manifesto from "../components/sections/Manifesto.jsx";
import Ticker from "../components/sections/Ticker.jsx";
import Residences from "../components/sections/Residences.jsx";
import FloorPlan from "../components/sections/FloorPlan.jsx";
import Lifestyle from "../components/sections/Lifestyle.jsx";
import Exhibition from "../components/sections/Exhibition.jsx";
import Faq from "../components/sections/Faq.jsx";
import WelcomeHome from "../components/sections/WelcomeHome.jsx";

/* The homepage as an editorial journey — deliberately lean.
   This is a multi-page site, not a one-page scroll: the homepage tells the
   story and hands off, and each subject is carried in depth by its own page
   (/overview, /residences, /price, /location, /master-plan, /about,
   /construction-status, /blogs). Sections belonging to those subjects live
   there, not here. Resist adding to this list — every extra band pushes the
   enquiry further down and dilutes what the homepage is for. */

/* Leaflet is ~145 kB (42 kB gz) and the map sits well below the fold, so it is
   split out and fetched only when the reader gets there. The prerenderer waits
   8s before dumping the DOM, so the map is still present in the crawlable HTML. */
const LivingMap = lazy(() => import("../components/sections/LivingMap.jsx"));

export default function Home() {
  return (
    <div className="bg-canvas">
      <Seo
        title="M3M Brabus, Sector 58 Gurgaon | 4 & 5 BHK Branded Residences"
        description="M3M Brabus, Sector 58 Gurgaon — 4 & 5 BHK branded residences of approx. 5,000–7,000 sq.ft by M3M India, inspired by BRABUS. Floor plans, amenities and price."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Residence",
          name: "M3M Brabus",
          description:
            "Ultra-luxury 4 & 5 BHK branded residences (approx. 5,000–7,000 sq.ft) at Sector 58, Golf Course Extension Road, Gurugram — by M3M India, inspired by BRABUS.",
          url: "https://m3m-brabus.com",
          image: "https://m3m-brabus.com/renders/tower.jpg",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Golf Course Extension Road, Sector 58",
            addressLocality: "Gurugram",
            addressRegion: "Haryana",
            addressCountry: "IN",
          },
          geo: { "@type": "GeoCoordinates", latitude: 28.4236, longitude: 77.0916 },
          brand: { "@type": "Brand", name: "BRABUS" },
          provider: { "@type": "Organization", name: "M3M India" },
        }}
      />
      <Hero />               {/* 01 · Arrival */}
      <Manifesto />          {/* 01–02 · Philosophy & Engineering */}
      <Ticker />             {/* kinetic marquee */}
      <Residences />         {/* 03 · The Residences */}
      <FloorPlan />          {/* 04 · The Floor Plan (interactive) */}
      <Lifestyle />          {/* 05 · The Lifestyle */}
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <LivingMap />        {/* 05 · The Address */}
      </Suspense>
      <Exhibition />         {/* 06 · The Exhibition */}
      <Faq />                {/* SEO / answers */}
      <WelcomeHome />        {/* 07 · Welcome Home (enquire) */}
    </div>
  );
}
