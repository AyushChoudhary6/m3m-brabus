import { lazy, Suspense } from "react";
import Seo from "../components/ui/Seo.jsx";
import Hero from "../components/sections/Hero.jsx";
import ProjectHighlights from "../components/sections/ProjectHighlights.jsx";
import ProjectOverview from "../components/sections/ProjectOverview.jsx";
import Manifesto from "../components/sections/Manifesto.jsx";
import Ticker from "../components/sections/Ticker.jsx";
import ConfigTable from "../components/sections/ConfigTable.jsx";
import Residences from "../components/sections/Residences.jsx";
import PriceSnapshot from "../components/sections/PriceSnapshot.jsx";
import FloorPlan from "../components/sections/FloorPlan.jsx";
import Lifestyle from "../components/sections/Lifestyle.jsx";
import LocationAdvantages from "../components/sections/LocationAdvantages.jsx";
import MasterPlanPreview from "../components/sections/MasterPlanPreview.jsx";
import Exhibition from "../components/sections/Exhibition.jsx";
import WhyInvest from "../components/sections/WhyInvest.jsx";
import DeveloperInfo from "../components/sections/DeveloperInfo.jsx";
import ConstructionStatus from "../components/sections/ConstructionStatus.jsx";
import Faq from "../components/sections/Faq.jsx";
import RelatedBlogs from "../components/sections/RelatedBlogs.jsx";
import FinalCta from "../components/sections/FinalCta.jsx";

/* Leaflet is ~145 kB (42 kB gz) and the map sits well below the fold, so it is
   split out and fetched only when the reader gets there. The prerenderer waits
   8s before dumping the DOM, so the map is still present in the crawlable HTML. */
const LivingMap = lazy(() => import("../components/sections/LivingMap.jsx"));

/* The homepage as an editorial journey, ordered to Volume 2 · Ch. 22.
   Each section carries its own cathedral whitespace; the page is a single
   calm ivory column that hands the reader on to the next chapter.

   Ch. 22 lists Testimonials at 14 as optional — it is deliberately absent.
   We hold no verified resident reviews, and inventing them is the one thing
   this site must never do. /reviews carries an honest assessment instead. */
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
      <Hero />                {/* 01 · Hero banner */}
      <ProjectHighlights />   {/* 02 · Quick project highlights */}
      <ProjectOverview />     {/* 03 · Project overview */}
      <Manifesto />           {/*  — · Philosophy & engineering */}
      <Ticker />              {/*  — · Kinetic marquee */}
      <ConfigTable />         {/* 04 · Configuration */}
      <Residences />          {/* 04 · The residences, in detail */}
      <PriceSnapshot />       {/* 05 · Price snapshot */}
      <FloorPlan />           {/* 06 · Floor plan preview */}
      <Lifestyle />           {/* 07 · Amenities */}
      <LocationAdvantages />  {/* 08 · Location advantages */}
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <LivingMap />        {/* 08 · The address, mapped */}
      </Suspense>
      <MasterPlanPreview />   {/* 09 · Master plan preview */}
      <Exhibition />          {/* 10 · Gallery */}
      <WhyInvest />           {/* 11 · Why invest */}
      <DeveloperInfo />       {/* 12 · Developer information */}
      <ConstructionStatus />  {/* 13 · Construction status */}
      <Faq />                 {/* 15 · FAQs */}
      <RelatedBlogs />        {/* 16 · Related blogs */}
      <FinalCta />            {/* 17 · Final CTA */}
    </div>
  );
}
