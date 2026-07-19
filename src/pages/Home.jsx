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
