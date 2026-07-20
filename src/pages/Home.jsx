import Seo from "../components/ui/Seo.jsx";
import Hero from "../components/sections/Hero.jsx";
import Manifesto from "../components/sections/Manifesto.jsx";
import Ticker from "../components/sections/Ticker.jsx";
import Residences from "../components/sections/Residences.jsx";
import FloorPlan from "../components/sections/FloorPlan.jsx";
import Lifestyle from "../components/sections/Lifestyle.jsx";
import LivingMap from "../components/sections/LivingMap.jsx";
import Exhibition from "../components/sections/Exhibition.jsx";
import Faq from "../components/sections/Faq.jsx";
import WelcomeHome from "../components/sections/WelcomeHome.jsx";

/* The homepage as an editorial journey. Each section carries its own
   cathedral whitespace; the page is a single calm ivory column. */
export default function Home() {
  return (
    <div className="bg-canvas">
      <Seo
        title="M3M Brabus, Sector 58 Gurgaon | 4 & 5 BHK Branded Residences"
        description="M3M Brabus on Golf Course Extension Road, Sector 58 Gurgaon — 4 & 5 BHK branded residences of approx. 5,000–7,000 sq.ft by M3M India, inspired by BRABUS. Floor plans, amenities, location and price enquiry."
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
      <LivingMap />          {/* 05 · The Address */}
      <Exhibition />         {/* 06 · The Exhibition */}
      <Faq />                {/* SEO / answers */}
      <WelcomeHome />        {/* 07 · Welcome Home (enquire) */}
    </div>
  );
}
