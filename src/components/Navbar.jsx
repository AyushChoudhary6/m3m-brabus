import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Menu, X, Download } from "lucide-react";
import clsx from "clsx";
import { useEnquiry } from "./ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import usePresence from "../lib/usePresence.js";
import { NAV_LINKS, NAV_INLINE, PROJECT } from "../lib/site.js";

gsap.registerPlugin(useGSAP);

/* Minimal editorial bar — wordmark, centred index, quiet menu.
   Transparent at rest; an ivory hairline settles in on scroll. */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navRef = useRef(null);
  const { openEnquiry, openBrochure } = useEnquiry();
  const { t } = useI18n();

  /* The overlay has to survive its own dismissal long enough to animate out:
     the links lift away, then the sheet fades. usePresence holds the node
     mounted until the timeline finishes. */
  const exitMenu = useCallback(
    (node, done) =>
      gsap
        .timeline({ onComplete: done })
        .to(node.querySelectorAll(".menu-link"), {
          opacity: 0,
          y: "-0.3em",
          duration: 0.25,
          ease: "power1.inOut",
        }, 0)
        .to(node.querySelectorAll(".menu-aside"), { opacity: 0, duration: 0.25, ease: "power1.inOut" }, 0)
        .to(node, { opacity: 0, duration: 0.4, ease: "power2.inOut" }, 0.05),
    [],
  );

  const { mounted: menuMounted, ref: menuRef } = usePresence(open, exitMenu);

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

  /* Menu opening: the sheet washes in, each link is unmasked from below on a
     stagger, and the contact column follows. Under reduced motion nothing is
     hidden in the first place, so the overlay simply appears — which is also
     what the prerenderer captures. */
  useGSAP(
    () => {
      if (!open || !menuRef.current) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(menuRef);
        gsap.set(menuRef.current, { opacity: 0 });
        gsap.set(q(".menu-link"), { clipPath: "inset(0 0 100% 0)", y: "0.4em", opacity: 0 });
        gsap.set(q(".menu-aside"), { opacity: 0, y: 20 });

        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .to(menuRef.current, { opacity: 1, duration: 0.5 }, 0)
          .to(
            q(".menu-link"),
            { clipPath: "inset(0 0 -10% 0)", y: 0, opacity: 1, duration: 0.7, stagger: 0.06 },
            0.15
          )
          .to(q(".menu-aside"), { opacity: 1, y: 0, duration: 0.6 }, 0.45);
      });
    },
    { dependencies: [open], scope: menuRef }
  );

  return (
    <>
      <header
        ref={navRef}
        className={clsx(
          "fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-500 ease-lux",
          scrolled
            ? "border-b border-line/70 bg-canvas/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div
          className={clsx(
            "flex items-center justify-between gap-6 px-[var(--spacing-gutter)] transition-[padding] duration-500 ease-lux",
            scrolled ? "py-4" : "py-6"
          )}
        >
          <Link to="/" className="nav-logo flex shrink-0 items-baseline gap-2 leading-none">
            <span className="font-display text-2xl tracking-[-0.01em] text-ink">M3M</span>
            <span className="font-serif text-2xl italic text-brass">Brabus</span>
          </Link>

          {/* The bar carries NAV_INLINE; the fullscreen menu carries all of
              NAV_LINKS. See the note in site.js for why they differ.

              The 1180px breakpoint is measured, not chosen: below it the six
              links run into the CTA cluster (1120px overlapped by 5px, 1024px
              by 46px). Between lg and 1180 the burger menu carries navigation
              on its own, which it is designed to do. If a link is ever added
              here, re-measure — do not assume it still fits. */}
          <ul className="hidden min-w-0 flex-1 items-center justify-center gap-5 min-[1180px]:flex xl:gap-7 2xl:gap-9">
            {NAV_INLINE.map((l) => (
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
              <Download size={13} className="animate-bounce transition-transform duration-500 group-hover:translate-y-0.5 group-hover:animate-none" />
              {t("nav.brochure")}
            </button>
            {/* Hidden from 1180px up — the exact width the inline links appear at.
                Below that the bar has no links, so the burger is the only
                navigation and must stay (hiding it at lg would leave 1024–1180px
                with no nav at all). */}
            <button
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              data-cursor="OPEN"
              className="mono flex items-center gap-2 text-[0.8rem] tracking-[0.16em] text-ink transition-colors hover:text-brass min-[1180px]:hidden"
            >
              <span className="hidden sm:inline">{t("nav.menu")}</span>
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* FULLSCREEN EDITORIAL MENU */}
      {menuMounted && (
        <div
          ref={menuRef}
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
                /* The mask each link is drawn out of; the clip-path runs on the
                   child so the overflow rule has something to clip against. */
                <div key={l.to} className="overflow-hidden">
                  <div className="menu-link">
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
                  </div>
                </div>
              ))}
            </nav>

            <div className="menu-aside flex flex-col gap-10 lg:max-w-xs lg:items-end lg:text-right">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
