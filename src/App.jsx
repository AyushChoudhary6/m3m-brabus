import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SmoothScroll from "./lib/SmoothScroll.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import MobileCTA from "./components/MobileCTA.jsx";
import Home from "./pages/Home.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import CustomCursor from "./components/ui/CustomCursor.jsx";
import ScrollProgress from "./components/ui/ScrollProgress.jsx";
import { NAV_LINKS } from "./lib/site.js";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <SmoothScroll>
      <ScrollToTop />
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {NAV_LINKS.map((l) => (
            <Route key={l.to} path={l.to} element={<Placeholder title={l.label} />} />
          ))}
          <Route path="*" element={<Placeholder title="Page" />} />
        </Routes>
      </main>
      <Footer />
      <MobileCTA />
    </SmoothScroll>
  );
}
