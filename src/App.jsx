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
import PricePage from "./pages/PricePage.jsx";
import FloorPlanPage from "./pages/FloorPlanPage.jsx";
import PaymentPlanPage from "./pages/PaymentPlanPage.jsx";
import BrochurePage from "./pages/BrochurePage.jsx";
import ReviewsPage from "./pages/ReviewsPage.jsx";
import PossessionPage from "./pages/PossessionPage.jsx";
import ReraPage from "./pages/ReraPage.jsx";
import MasterPlanPage from "./pages/MasterPlanPage.jsx";
import SpecificationsPage from "./pages/SpecificationsPage.jsx";
import ConstructionStatusPage from "./pages/ConstructionStatusPage.jsx";
import FaqsPage from "./pages/FaqsPage.jsx";
import GuidesPage from "./pages/GuidesPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.jsx";
import DisclaimerPage from "./pages/DisclaimerPage.jsx";
import BlogIndex from "./pages/BlogIndex.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import CustomCursor from "./components/ui/CustomCursor.jsx";
import ScrollProgress from "./components/ui/ScrollProgress.jsx";
import { EnquiryProvider } from "./components/ui/Enquiry.jsx";
import SideEnquiry from "./components/ui/SideEnquiry.jsx";
import WhatsAppFloat from "./components/ui/WhatsAppFloat.jsx";
import { initAnalytics, trackPageView } from "./lib/analytics.js";
import { LanguageProvider } from "./lib/i18n.jsx";

/* Reset scroll on navigation, then let ScrollTrigger re-measure the new page. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      trackPageView(pathname);
    }, 220);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}

export default function App() {
  useEffect(() => { initAnalytics(); }, []);

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
            <Route path="/price" element={<PricePage />} />
            <Route path="/floor-plan" element={<FloorPlanPage />} />
            <Route path="/payment-plan" element={<PaymentPlanPage />} />
            <Route path="/brochure" element={<BrochurePage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/possession" element={<PossessionPage />} />
            <Route path="/rera" element={<ReraPage />} />

            {/* Volume 2 · Part 1 — IA build-out */}
            <Route path="/master-plan" element={<MasterPlanPage />} />
            <Route path="/specifications" element={<SpecificationsPage />} />
            <Route path="/construction-status" element={<ConstructionStatusPage />} />
            <Route path="/faqs" element={<FaqsPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/blogs" element={<BlogIndex />} />
            <Route path="/blogs/:slug" element={<BlogPost />} />
            <Route path="*" element={<Placeholder title="Page" />} />
          </Routes>
        </main>
        <Footer />
        <MobileCTA />
        <SideEnquiry />
        <WhatsAppFloat />
      </EnquiryProvider>
      </LanguageProvider>
    </SmoothScroll>
  );
}
