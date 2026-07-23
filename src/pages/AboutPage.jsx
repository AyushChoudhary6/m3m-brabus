import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, ExternalLink, Phone, Mail } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import Fact from "../components/ui/Fact.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT } from "../lib/site.js";
import { PROJECT_FACTS, PRICE, OFFICIAL_SOURCE, hasValue } from "../lib/facts.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* This page is about the WEBSITE, not about the developer. We are not M3M
   India and do not present ourselves as it — so there is no company history,
   no founding year, no project count and no "our team" here. What we can
   describe honestly is our own editorial method, and that is the page. */

const NOT = [
  "about.not1",
  "about.not2",
  "about.not3",
  "about.not4",
];

const IS = [
  "about.is1",
  "about.is2",
  "about.is3",
  "about.is4",
];

/* The transparency statement. This is the heart of the page and the reason
   a buyer should trust anything else on the site. */
const PRINCIPLES = [
  { n: "01", tKey: "about.principle1t", dKey: "about.principle1d" },
  { n: "02", tKey: "about.principle2t", dKey: "about.principle2d" },
  { n: "03", tKey: "about.principle3t", dKey: "about.principle3d" },
  { n: "04", tKey: "about.principle4t", dKey: "about.principle4d" },
  { n: "05", tKey: "about.principle5t", dKey: "about.principle5d" },
];

/* Deliberately generic — this is how to check a promoter, not a claim about
   this one. Every item is a document the buyer can obtain independently, which
   is why it costs us nothing in credibility to publish it. */
const DUE_DILIGENCE = [
  { k: "i", tKey: "about.dd1t", dKey: "about.dd1d" },
  { k: "ii", tKey: "about.dd2t", dKey: "about.dd2d" },
  { k: "iii", tKey: "about.dd3t", dKey: "about.dd3d" },
  { k: "iv", tKey: "about.dd4t", dKey: "about.dd4d" },
];

const ENQUIRY_FLOW = [
  { n: "01", tKey: "about.flow1t", dKey: "about.flow1d" },
  { n: "02", tKey: "about.flow2t", dKey: "about.flow2d" },
  { n: "03", tKey: "about.flow3t", dKey: "about.flow3d" },
  { n: "04", tKey: "about.flow4t", dKey: "about.flow4d" },
];

export default function AboutPage() {
  const root = useRef(null);
  const { openEnquiry, openVisit } = useEnquiry();
  const { t } = useI18n();

  const published = PROJECT_FACTS.filter(hasValue);
  const onRequest = [...PROJECT_FACTS.filter((f) => !hasValue(f)), PRICE];

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        gsap.from(q(".dd"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".dd-grid")[0], start: "top 86%" },
        });

        gsap.from(q(".pri"), {
          autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".pri-grid")[0], start: "top 86%" },
        });

        gsap.from(q(".led"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: q(".led-grid")[0], start: "top 87%" },
        });

        gsap.from(q(".flw"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".flw-grid")[0], start: "top 86%" },
        });

        gsap.from(q(".ab-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".ab-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".ab-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".ab-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="bg-canvas">
      <Seo
        title="About M3M Brabus | About This Website, M3M India & BRABUS"
        description="About this M3M Brabus resource — who publishes it, how every figure is verified against the official M3M India listing, and what happens when you enquire."
        path="/about"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
      <PageHeader
        compact
        title={t("about.title")}
        accent={t("about.accent")}
        lede={t("about.lede")}
      />

      {/* what this site is, and what it is not */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">

        <p className="rise max-w-[62ch] text-lg leading-relaxed text-ink-soft">
          {t("about.introP1")}
        </p>
        <p className="rise mt-5 max-w-[62ch] leading-relaxed text-ink-soft">
          {t("about.introP2")}
        </p>

        <div className="rise mt-[clamp(2.5rem,6vh,4rem)] grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="mono text-[0.6rem] tracking-[0.24em] text-brass">{t("about.isLabel")}</p>
            <ul className="mt-5 border-t border-line">
              {IS.map((i) => (
                <li key={i} className="border-b border-line py-4 text-sm leading-relaxed text-ink-soft">
                  {t(i)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mono text-[0.6rem] tracking-[0.24em] text-ink-faint">{t("about.isNotLabel")}</p>
            <ul className="mt-5 border-t border-line">
              {NOT.map((i) => (
                <li key={i} className="border-b border-line py-4 text-sm leading-relaxed text-ink-soft">
                  {t(i)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* the developer and the marque */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">

        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <h2 className="rise max-w-[18ch] font-display text-[clamp(1.9rem,4vw,2.9rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink">
              {t("about.developerTitle")} <span className="font-serif italic text-brass">{t("about.developerAccent")}</span>
            </h2>
            <p className="rise mt-6 max-w-[54ch] leading-relaxed text-ink-soft">
              {t("about.developerP1")}
            </p>
            <p className="rise mt-4 max-w-[54ch] leading-relaxed text-ink-soft">
              {t("about.developerP2A")}{" "}
              <Link to="/brabus" className="text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:text-brass-soft">
                {t("about.brabusLink")}
              </Link>
              .
            </p>

            <a
              href={OFFICIAL_SOURCE}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="rise group mt-9 inline-flex items-center gap-3 rounded-full border border-brass/40 px-6 py-3.5 transition-colors duration-500 hover:bg-brass/10"
            >
              <span className="font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass">
                {t("about.verifyOfficial")}
              </span>
              <ExternalLink size={14} className="text-brass transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <p className="rise mono mt-4 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
              {t("about.opensNote")}
            </p>
          </div>

          <figure className="ab-img-wrap relative min-h-[20rem] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="ab-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.arrival, 1400)}
                alt={t("about.arrivalAlt")}
                sizes="(max-width:1024px) 100vw, 42vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_52%,rgba(8,6,5,0.68))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              {t("about.artistCaption")}
            </figcaption>
          </figure>
        </div>

        {/* The coda to the section above. Having just declined to vouch for the
            developer in adjectives, the honest next move is to hand over the
            checks a buyer should run for themselves — on this promoter or any
            other. Unnumbered because it continues 02 rather than opening 03. */}
        <div className="dd-grid mt-[clamp(3.5rem,9vh,6rem)]">
          <p className="dd mt-6 max-w-[58ch] leading-relaxed text-ink-soft">
            {t("about.verifyDevIntro")}
          </p>

          <ul className="mt-10 grid gap-x-14 gap-y-0 border-t border-line md:grid-cols-2">
            {DUE_DILIGENCE.map((c) => (
              <li key={c.k} className="dd group flex gap-6 border-b border-line py-6">
                <div>
                  <h3 className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-xl">
                    {t(c.tKey)}
                  </h3>
                  <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-ink-soft">{t(c.dKey)}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Points at the RERA page and at the ledger in 04 rather than
              restating the registration position, which both already carry. */}
          <p className="dd mt-8 max-w-[58ch] text-sm leading-relaxed text-ink-faint">
            {t("about.ddOutroA")}{" "}
            <Link
              to="/rera"
              className="border-b border-brass/40 text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
            >
              {t("about.reraPageLink")}
            </Link>
            {t("about.ddOutroB")}
          </p>
        </div>
      </section>

      {/* the transparency statement — the heart of the page */}
      <section className="pri-grid border-y border-line bg-cream">
        <div className="container-lux py-[clamp(4rem,11vh,7rem)]">

          <h2 className="pri max-w-[20ch] font-display text-[clamp(2rem,4.4vw,3.2rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
            {t("about.principlesTitle")} <span className="font-serif italic text-brass">{t("about.principlesAccent")}</span>
          </h2>

          <dl className="mt-[clamp(2.5rem,6vh,4rem)] border-t border-line">
            {PRINCIPLES.map((p) => (
              <div
                key={p.n}
                className="pri grid grid-cols-1 gap-3 border-b border-line py-7 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-10"
              >
                <dt className="font-display text-xl leading-snug text-ink md:text-2xl">{t(p.tKey)}</dt>
                <dd className="max-w-[62ch] leading-relaxed text-ink-soft">{t(p.dKey)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* the rule, demonstrated on this project's own numbers */}
      <section className="led-grid container-lux py-[clamp(4rem,11vh,7rem)]">
        <p className="max-w-[62ch] leading-relaxed text-ink-soft">
          {t("about.ledgerIntro")}
        </p>

        <div className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="led mono text-[0.6rem] tracking-[0.24em] text-brass">{t("about.publishedLabel")}</p>
            <div className="mt-6 space-y-7">
              {published.map((f) => (
                <Fact key={f.key} fact={f} className="led" />
              ))}
            </div>
          </div>
          <div>
            <p className="led mono text-[0.6rem] tracking-[0.24em] text-ink-faint">{t("about.notPublishedLabel")}</p>
            <div className="mt-6 space-y-7">
              {onRequest.map((f) => (
                <Fact key={f.key} fact={f} className="led" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* what happens when you enquire */}
      <section className="flw-grid container-lux pb-[clamp(4rem,11vh,7rem)]">

        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {ENQUIRY_FLOW.map((f) => (
            <article key={f.n} className="flw group border-b border-line py-7">
              <h3 className="mt-3 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-2xl">
                {t(f.tKey)}
              </h3>
              <p className="mt-2.5 max-w-[46ch] leading-relaxed text-ink-soft">{t(f.dKey)}</p>
            </article>
          ))}
        </div>

        <div className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-11">
            <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
            <div className="relative">
              <h2 className="rise mt-4 max-w-[18ch] font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                {t("about.reachTitle")} <span className="font-serif italic text-brass">{t("about.reachAccent")}</span>
              </h2>
              <p className="rise mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
                {t("about.reachBody")}
              </p>

              <div className="rise mt-9 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => openEnquiry("About")}
                  data-cursor="OPEN"
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    {t("about.askQuestion")}
                  </span>
                  <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                </button>
                <button
                  type="button"
                  onClick={() => openVisit("About")}
                  className="group inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass"
                >
                  {t("about.bookVisit")}
                  <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </div>

              <div className="rise mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                <a
                  href={`tel:${PROJECT.phone}`}
                  aria-label={`${t("about.callAria")} ${PROJECT.phone}`}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                >
                  <Phone size={13} className="text-brass" />
                  {PROJECT.phone}
                </a>
                <a
                  href={`mailto:${PROJECT.email}`}
                  aria-label={`${t("about.emailAria")} ${PROJECT.email}`}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                >
                  <Mail size={13} className="text-brass" />
                  {PROJECT.email}
                </a>
              </div>
            </div>
          </div>

          {/* corrections + the legal footing, kept together deliberately */}
          <div className="rise self-start">
            <p className="mono text-[0.6rem] tracking-[0.24em] text-ink-faint">{t("about.correctionsLabel")}</p>
            <p className="mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
              {t("about.correctionsBody")}
            </p>
            <ul className="mt-7 border-t border-line">
              {[
                { to: "/privacy-policy", tKey: "about.privacyTitle", dKey: "about.privacyDesc" },
                { to: "/disclaimer", tKey: "about.disclaimerTitle", dKey: "about.disclaimerDesc" },
                { to: "/rera", tKey: "about.reraPositionTitle", dKey: "about.reraPositionDesc" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="group flex items-start justify-between gap-6 border-b border-line py-5 transition-colors duration-500 hover:bg-brass/[0.035]"
                  >
                    <span>
                      <span className="block font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass-soft">
                        {t(l.tKey)}
                      </span>
                      <span className="mt-1 block max-w-[34ch] text-sm leading-relaxed text-ink-soft">{t(l.dKey)}</span>
                    </span>
                    <ArrowUpRight size={15} className="mt-1.5 shrink-0 text-brass transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mono mt-6 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
              {t("about.marketingFootnote")}
            </p>
          </div>
        </div>
      </section>

      <RelatedPages links={["/contact", "/privacy-policy", "/disclaimer"]} />
      <CtaBand title={t("about.ctaTitle")} accent={t("about.ctaAccent")} subject="About" />
    </div>
  );
}
