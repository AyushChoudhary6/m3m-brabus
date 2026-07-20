import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Menu, X, Download } from "lucide-react";
import clsx from "clsx";
import { useEnquiry } from "./ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { NAV_LINKS, PROJECT } from "../lib/site.js";

gsap.registerPlugin(useGSAP);

/* Minimal editorial bar — wordmark, centred index, quiet menu.
   Transparent at rest; an ivory hairline settles in on scroll. */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navRef = useRef(null);
  const { openEnquiry, openBrochure } = useEnquiry();
  const { t, lang, toggle } = useI18n();

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Quiet unveil on load
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(navRef);
      gsap.set(navRef.current, { y: -24, autoAlpha: 0 });
      gsap.set(q(".nav-logo"), { autoAlpha: 0, y: -6 });
      gsap.set(q(".nav-item"), { autoAlpha: 0, y: -6 });
      gsap.set(q(".nav-cta"), { autoAlpha: 0 });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(navRef.current, { y: 0, autoAlpha: 1, duration: 1 }, 0.2)
        .to(q(".nav-logo"), { autoAlpha: 1, y: 0, duration: 0.9 }, 0.3)
        .to(q(".nav-item"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.05 }, 0.4)
        .to(q(".nav-cta"), { autoAlpha: 1, duration: 0.8 }, 0.55);
    },
    { scope: navRef }
  );

  const linkLift = reduce
    ? { initial: false, animate: {}, exit: {} }
    : {
        initial: { clipPath: "inset(0 0 100% 0)", y: "0.4em", opacity: 0 },
        animate: { clipPath: "inset(0 0 -10% 0)", y: 0, opacity: 1 },
        exit: { opacity: 0, y: "-0.3em", transition: { duration: 0.25, ease: "easeInOut" } },
      };

  return (
    <>
      <header
        ref={navRef}
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,padding] duration-500 ease-lux",
          scrolled
            ? "border-b border-line/70 bg-canvas/85 py-4 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent py-6"
        )}
      >
        <div className="flex items-center justify-between gap-6 px-[var(--spacing-gutter)]">
          <Link to="/" className="nav-logo flex shrink-0 items-baseline gap-2 leading-none">
            <span className="font-display text-2xl tracking-[-0.01em] text-ink">M3M</span>
            <span className="font-serif text-2xl italic text-brass">Brabus</span>
          </Link>

          <ul className="hidden min-w-0 flex-1 items-center justify-center gap-4 xl:flex 2xl:gap-6">
            {NAV_LINKS.map((l) => (
              <li key={l.to} className="nav-item">
                <Link
                  to={l.to}
                  className="group relative mono whitespace-nowrap text-[0.68rem] tracking-[0.12em] text-ink-soft transition-colors hover:text-ink xl:text-[0.74rem]"
                >
                  {t(l.tKey)}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-brass transition-all duration-500 ease-lux group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-cta flex shrink-0 items-center gap-4 xl:gap-5">
            {/* language switch */}
            <button
              type="button"
              onClick={toggle}
              aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
              className="mono flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.68rem] tracking-[0.14em] text-ink-soft transition-colors hover:border-brass hover:text-brass"
            >
              <span className={lang === "en" ? "text-brass" : ""}>EN</span>
              <span className="text-ink-faint">/</span>
              <span className={lang === "ar" ? "text-brass" : ""} style={{ fontFamily: "system-ui" }}>ع</span>
            </button>
            <button
              type="button"
              onClick={() => openEnquiry()}
              className="mono hidden text-[0.8rem] tracking-[0.16em] text-ink-soft transition-colors hover:text-ink md:inline xl:hidden"
            >
              {t("nav.enquire")}
            </button>

            {/* gated: opens the form, download starts on submit */}
            <button
              type="button"
              onClick={() => openBrochure("Navbar")}
              data-cursor="DOWNLOAD"
              className="group hidden items-center gap-2 rounded-full bg-brass px-4 py-2 font-sans text-[0.72rem] font-medium uppercase tracking-[0.12em] text-obsidian transition-colors hover:bg-brass-soft sm:inline-flex"
            >
              <Download size={13} className="transition-transform duration-500 group-hover:translate-y-0.5" />
              {t("nav.brochure")}
            </button>
            <button
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              data-cursor="OPEN"
              className="mono flex items-center gap-2 text-[0.8rem] tracking-[0.16em] text-ink transition-colors hover:text-brass"
            >
              <span className="hidden sm:inline">{t("nav.menu")}</span>
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* FULLSCREEN EDITORIAL MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-canvas text-ink"
          >
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(50%_50%_at_82%_12%,rgba(124,106,79,0.08),transparent_70%)]" />

            <div className="relative flex items-center justify-between px-[var(--spacing-gutter)] py-5">
              <Link to="/" className="flex flex-col leading-none" onClick={() => setOpen(false)}>
                <span className="font-display text-2xl tracking-[-0.01em] text-ink">
                  M3M <span className="font-serif italic text-brass">Brabus</span>
                </span>
                <span className="mono mt-1.5 text-[0.58rem] tracking-[0.3em] text-ink-faint">
                  Sector 58 · Gurgaon
                </span>
              </Link>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-11 w-11 place-items-center border border-line text-ink-soft transition-colors hover:border-brass hover:text-brass"
                data-cursor="CLOSE"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative flex flex-1 flex-col justify-center gap-16 px-[var(--spacing-gutter)] py-10 lg:flex-row lg:justify-between lg:gap-10">
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
                        className="group flex items-baseline gap-5 py-1.5 font-display font-light leading-[1.04] tracking-[-0.02em] text-ink transition-colors hover:text-brass"
                      >
                        <span className="mono text-[0.66rem] tracking-[0.2em] text-brass/70 transition-colors group-hover:text-brass">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[clamp(2rem,7vw,5rem)] transition-all duration-500 ease-lux group-hover:translate-x-3 group-hover:italic">
                          {t(l.tKey)}
                        </span>
                      </Link>
                    </motion.div>
                  </div>
                ))}
              </nav>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.45 }}
                className="flex flex-col gap-10 lg:max-w-xs lg:items-end lg:text-right"
              >
                <p className="max-w-xs font-serif text-xl italic leading-snug text-ink-soft">
                  {PROJECT.tagline}
                </p>

                <div className="flex flex-col gap-6">
                  <div>
                    <p className="kicker">{t("nav.salesEnquiries")}</p>
                    <a
                      href={`tel:${PROJECT.phone}`}
                      className="mt-2 block font-display text-2xl text-ink transition-colors hover:text-brass"
                    >
                      {PROJECT.phone}
                    </a>
                    <a
                      href={`mailto:${PROJECT.email}`}
                      className="mt-1 block font-sans text-sm text-ink-soft transition-colors hover:text-brass"
                    >
                      {PROJECT.email}
                    </a>
                  </div>

                  <p className="mono text-[0.62rem] tracking-[0.2em] text-ink-faint">
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
