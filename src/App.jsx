import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "./lib/SmoothScroll.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import MobileCTA from "./components/MobileCTA.jsx";
import Home from "./pages/Home.jsx";
import Overview from "./pages/Overview.jsx";
import ResidencesPage from "./pages/ResidencesPage.jsx";
import Brabus from "./pages/Brabus.jsx";
import Amenities from "./pages/Amenities.jsx";
import LocationPage from "./pages/LocationPage.jsx";
import Gallery from "./pages/Gallery.jsx";
import Contact from "./pages/Contact.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import CustomCursor from "./components/ui/CustomCursor.jsx";
import ScrollProgress from "./components/ui/ScrollProgress.jsx";
import { EnquiryProvider } from "./components/ui/Enquiry.jsx";
import SideEnquiry from "./components/ui/SideEnquiry.jsx";
import { LanguageProvider } from "./lib/i18n.jsx";

/* Reset scroll on navigation, then let ScrollTrigger re-measure the new page. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 220);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <SmoothScroll>
      <LanguageProvider>
      <EnquiryProvider>
        <ScrollToTop />
        <ScrollProgress />
        <CustomCursor />
        <Navbar />
        <main className="noise">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/residences" element={<ResidencesPage />} />
            <Route path="/brabus" element={<Brabus />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/location" element={<LocationPage />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Placeholder title="Page" />} />
          </Routes>
        </main>
        <Footer />
        <MobileCTA />
        <SideEnquiry />
      </EnquiryProvider>
      </LanguageProvider>
    </SmoothScroll>
  );
}
