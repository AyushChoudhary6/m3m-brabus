import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Menu, X, Phone } from "lucide-react";
import clsx from "clsx";
import { NAV_LINKS, PROJECT } from "../lib/site.js";

gsap.registerPlugin(useGSAP);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navRef = useRef(null);

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change (also handles link clicks that navigate)
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll while the fullscreen menu is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Unveil entrance — plays once on initial load (motion only)
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(navRef);
      gsap.set(navRef.current, { y: -40, autoAlpha: 0 });
      gsap.set(q(".nav-logo"), { autoAlpha: 0, scale: 0.96, filter: "blur(8px)" });
      gsap.set(q(".nav-item"), { autoAlpha: 0, y: -8 });
      gsap.set(q(".nav-cta"), { autoAlpha: 0 });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(navRef.current, { y: 0, autoAlpha: 1, duration: 1 }, 0.2)
        .to(q(".nav-logo"), { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1 }, 0.3)
        .to(q(".nav-item"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.05 }, 0.4)
        .to(q(".nav-cta"), { autoAlpha: 1, duration: 0.8 }, 0.6);
    },
    { scope: navRef }
  );

  // Reveal timing for the giant menu links — instant under reduced motion
  const linkLift = reduce
    ? { initial: false, animate: {}, exit: {} }
    : {
        initial: { clipPath: "inset(0 0 100% 0)", y: "0.4em", opacity: 0 },
        animate: { clipPath: "inset(0 0 -10% 0)", y: 0, opacity: 1 },
        exit: { opacity: 0, y: "-0.3em", transition: { duration: 0.25, ease: "easeInOut" } },
      };

  return (
    <>
      {/* Floating liquid-glass pill — hugs its content, centred */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 md:pt-5">
        <nav
          ref={navRef}
          className={clsx(
            "relative flex items-center rounded-full border border-white/50 backdrop-blur-2xl backdrop-saturate-150",
            "shadow-[0_10px_40px_-14px_rgba(23,20,15,0.4)] transition-[padding,background-color,box-shadow,column-gap] duration-500 ease-lux",
            scrolled ? "gap-4 bg-white/70 px-4 py-2 md:px-5" : "gap-5 bg-white/45 px-5 py-2.5 md:px-6 md:py-3"
          )}
        >
          {/* liquid-glass top sheen */}
          <span className="pointer-events-none absolute inset-0 rounded-full opacity-70 [background:linear-gradient(180deg,rgba(255,255,255,0.65),transparent_45%)]" />

          <Link to="/" className="nav-logo relative flex items-center leading-none">
            <span className="font-display text-lg tracking-tight text-ink">
              M3M <span className="italic text-brass">Brabus</span>
            </span>
          </Link>

          <span className="relative hidden h-4 w-px bg-ink/15 lg:block" />

          <ul className="relative hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.to} className="nav-item">
                <Link
                  to={l.to}
                  className="group relative font-sans text-[0.78rem] tracking-wide text-ink-soft transition-colors hover:text-ink"
                >
                  {l.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-brass transition-all duration-500 ease-lux group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-cta relative flex items-center gap-2">
            <a
              href={`tel:${PROJECT.phone}`}
              className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2 font-sans text-[0.7rem] font-medium uppercase tracking-[0.14em] text-canvas transition-colors hover:bg-brass md:inline-flex"
            >
              <Phone size={12} /> Enquire
            </a>
            <button
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              data-cursor="OPEN"
              className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5"
            >
              <Menu size={17} />
            </button>
          </div>
        </nav>
      </header>

      {/* FULLSCREEN EDITORIAL MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ink-900 text-white"
          >
            {/* ambient gold wash */}
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(50%_50%_at_80%_15%,rgba(198,166,100,0.14),transparent_70%)]" />

            {/* Top bar */}
            <div className="relative flex items-center justify-between px-[var(--spacing-gutter)] py-5">
              <Link to="/" className="flex flex-col leading-none" onClick={() => setOpen(false)}>
                <span className="font-display text-xl tracking-tight text-white">
                  M3M <span className="italic text-champagne">Brabus</span>
                </span>
                <span className="mt-0.5 text-[0.58rem] uppercase tracking-[0.3em] text-white/45">
                  Sector 58 · Gurgaon
                </span>
              </Link>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-11 w-11 place-items-center border border-white/20 text-white/80 transition-colors hover:border-champagne hover:text-champagne"
                data-cursor="CLOSE"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="relative flex flex-1 flex-col justify-center gap-16 px-[var(--spacing-gutter)] py-10 lg:flex-row lg:justify-between lg:gap-10">
              {/* Giant serif links */}
              <nav className="flex flex-col">
                {NAV_LINKS.map((l, i) => (
                  <div key={l.to} className="overflow-hidden">
                    <motion.div
                      initial={linkLift.initial}
                      animate={linkLift.animate}
                      exit={linkLift.exit}
                      transition={{
                        duration: reduce ? 0 : 0.7,
                        delay: reduce ? 0 : 0.15 + i * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        to={l.to}
                        onClick={() => setOpen(false)}
                        data-cursor="ENTER"
                        className="group flex items-baseline gap-4 py-1.5 font-display font-light leading-[1.02] tracking-[-0.02em] text-white/90 transition-colors hover:text-champagne"
                      >
                        <span className="font-sans text-[0.7rem] font-medium tracking-[0.2em] text-champagne/70 transition-colors group-hover:text-champagne">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[clamp(2rem,7vw,5rem)] transition-all duration-500 ease-lux group-hover:italic group-hover:translate-x-2">
                          {l.label}
                        </span>
                      </Link>
                    </motion.div>
                  </div>
                ))}
              </nav>

              {/* Secondary column — contact + tagline */}
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.45 }}
                className="flex flex-col gap-10 lg:max-w-xs lg:items-end lg:text-right"
              >
                <p className="max-w-xs font-display text-lg italic leading-snug text-white/70">
                  {PROJECT.tagline}
                </p>

                <div className="flex flex-col gap-6">
                  <div>
                    <p className="kicker text-champagne-soft">Sales Enquiries</p>
                    <a
                      href={`tel:${PROJECT.phone}`}
                      className="mt-2 block font-display text-2xl text-white transition-colors hover:text-champagne"
                    >
                      {PROJECT.phone}
                    </a>
                    <a
                      href={`mailto:${PROJECT.email}`}
                      className="mt-1 block font-sans text-sm text-white/60 transition-colors hover:text-champagne"
                    >
                      {PROJECT.email}
                    </a>
                  </div>

                  <p className="text-[0.7rem] uppercase tracking-[0.2em] text-white/35">
                    {PROJECT.location}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
