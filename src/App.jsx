import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "./lib/SmoothScroll.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import MobileCTA from "./components/MobileCTA.jsx";
import Home from "./pages/Home.jsx"; // eager: the LCP route must not flash a fallback
import NotFound from "./pages/NotFound.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";

/* Ch. 80 — route-level code splitting. Every page below is its own chunk, so a
   visitor landing on /rera no longer downloads Leaflet, the map, and 29 other
   pages before first paint. Home stays eager because it is the LCP route and
   the most common entry point. */
const Overview = lazy(() => import("./pages/Overview.jsx"));
const ResidencesPage = lazy(() => import("./pages/ResidencesPage.jsx"));
const Brabus = lazy(() => import("./pages/Brabus.jsx"));
const Amenities = lazy(() => import("./pages/Amenities.jsx"));
const LocationPage = lazy(() => import("./pages/LocationPage.jsx"));
const Gallery = lazy(() => import("./pages/Gallery.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const PricePage = lazy(() => import("./pages/PricePage.jsx"));
const FloorPlanPage = lazy(() => import("./pages/FloorPlanPage.jsx"));
const PaymentPlanPage = lazy(() => import("./pages/PaymentPlanPage.jsx"));
const BrochurePage = lazy(() => import("./pages/BrochurePage.jsx"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage.jsx"));
const PossessionPage = lazy(() => import("./pages/PossessionPage.jsx"));
const ReraPage = lazy(() => import("./pages/ReraPage.jsx"));
const MasterPlanPage = lazy(() => import("./pages/MasterPlanPage.jsx"));
const SpecificationsPage = lazy(() => import("./pages/SpecificationsPage.jsx"));
const ConstructionStatusPage = lazy(() => import("./pages/ConstructionStatusPage.jsx"));
const FaqsPage = lazy(() => import("./pages/FaqsPage.jsx"));
const GuidesPage = lazy(() => import("./pages/GuidesPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage.jsx"));
const DisclaimerPage = lazy(() => import("./pages/DisclaimerPage.jsx"));
const BlogIndex = lazy(() => import("./pages/BlogIndex.jsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.jsx"));
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
          {/* A render error in one page must not blank the whole site. */}
          <ErrorBoundary>
            {/* No spinner: the fallback is deliberately an empty, correctly-sized
                shell so a fast chunk load never flashes a loading state. */}
            <Suspense fallback={<div className="min-h-svh" />}>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
            </Suspense>
          </ErrorBoundary>
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
