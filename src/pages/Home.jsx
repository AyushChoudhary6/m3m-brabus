import Hero from "../components/sections/Hero.jsx";
import Philosophy from "../components/sections/Philosophy.jsx";
import Engineering from "../components/sections/Engineering.jsx";
import Residences from "../components/sections/Residences.jsx";
import Lifestyle from "../components/sections/Lifestyle.jsx";
import LivingMap from "../components/sections/LivingMap.jsx";
import Exhibition from "../components/sections/Exhibition.jsx";
import Faq from "../components/sections/Faq.jsx";
import WelcomeHome from "../components/sections/WelcomeHome.jsx";

/* The homepage as a cinematic journey — chapters, not sections.
   The flex gap gives every chapter calm ivory breathing space and removes
   hard section-to-section seams, without touching any pin/scroll geometry. */
export default function Home() {
  return (
    <div className="flex flex-col gap-[4vh] bg-canvas pt-3 pb-[4vh] md:gap-[7vh] md:pt-5">
      <Hero />               {/* 01 · Arrival */}
      <Philosophy />         {/* 02 · The Philosophy */}
      <Engineering />        {/* 03 · Engineering (BRABUS) */}
      <Residences />         {/* 06 · The Residences (pinned) */}
      <Lifestyle />          {/* 07 · The Lifestyle (day → night) */}
      <LivingMap />          {/* 08 · The Address (living map) */}
      <Exhibition />         {/* 09 · The Exhibition */}
      <Faq />                {/* SEO / answers */}
      <WelcomeHome />        {/* 10 · Welcome Home */}
    </div>
  );
}
