import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Phone, Download, PhoneCall, FileText, CalendarCheck } from "lucide-react";
import WhatsAppIcon from "../components/ui/WhatsAppIcon.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo from "../components/ui/Seo.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT } from "../lib/site.js";
import { whatsappUrl } from "../lib/whatsapp.js";
import { claimConversion, track, trackCall, trackWhatsApp } from "../lib/analytics.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * /thank-you — the conversion page.
 *
 * Why it exists: an ad platform cannot be pointed at a modal. A URL gives
 * Google Ads and Meta something to count, gives retargeting an audience to
 * match on, and — with the guard in analytics.js — lets a refresh be told
 * apart from a second lead.
 *
 * SEO: noindex, nofollow. A thank-you page in the index is a conversion
 * counted for anyone who searches their way onto it. The canonical stays
 * self-referential rather than pointing at a real page, so this URL is
 * dropped from the index outright instead of being folded into /contact.
 *
 * Nothing routes here yet — the enquiry modal keeps its in-place thank-you
 * state, which the owner prefers and several components depend on. The page
 * therefore has to read well on a cold, direct visit, which is what the
 * `direct` branch below is for.
 */

export default function ThankYou() {
  const root = useRef(null);
  const { openEnquiry, openBrochure } = useEnquiry();
  const { t } = useI18n();

  /* Deliberately operational, not promotional. Someone who has just handed over
     a phone number wants to know who calls, when, and what lands in their inbox
     — not to be sold to a second time. */
  const NEXT = [
    {
      icon: PhoneCall,
      k: t("thankyou.next1Title"),
      d: t("thankyou.next1Body"),
      when: t("thankyou.next1When"),
    },
    {
      icon: FileText,
      k: t("thankyou.next2Title"),
      d: `${t("thankyou.next2BodyPre")}${PROJECT.configs.toLowerCase()}${t("thankyou.next2BodyMid")}${PROJECT.developer}${t("thankyou.next2BodyPost")}`,
      when: t("thankyou.next2When"),
    },
    {
      icon: CalendarCheck,
      k: t("thankyou.next3Title"),
      d: `${t("thankyou.next3BodyPre")}${PROJECT.location}${t("thankyou.next3BodyPost")}`,
      when: t("thankyou.next3When"),
    },
  ];

  /* The moment after converting is when interest is highest — so the page ends
     pointing outward, at the four things enquirers ask for next. */
  const READ_NEXT = [
    { to: "/floor-plan", name: t("thankyou.readFloorName"), d: `${t("thankyou.readFloorDescPre")}${PROJECT.configs.toLowerCase()}, ${PROJECT.sizes}.` },
    { to: "/location", name: t("thankyou.readAddressName"), d: `${PROJECT.address}${t("thankyou.readAddressDescSuffix")}` },
    { to: "/amenities", name: t("thankyou.readAmenitiesName"), d: t("thankyou.readAmenitiesDesc") },
    { to: "/faqs", name: t("thankyou.readFaqsName"), d: t("thankyou.readFaqsDesc") },
  ];

  /* Resolved after mount, never during render: the prerendered snapshot and
     the first client render must agree, so the direct-visit notice is added
     to the page rather than swapped into it. */
  const [claim, setClaim] = useState({ status: "", ref: "", name: "", config: "" });
  const claimed = useRef(false);

  useEffect(() => {
    if (claimed.current) return; // StrictMode double-invokes effects in dev
    claimed.current = true;
    setClaim(claimAndReport());
  }, []);

  const direct = claim.status === "direct";
  const firstName = (claim.name || "").trim().split(" ")[0];

  const cta = (label, run) => () => {
    track("cta_click", { location: "thank_you", label });
    run();
  };

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 88%" },
        });

        gsap.from(q(".step"), {
          autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: q(".steps")[0], start: "top 86%" },
        });

        gsap.from(q(".nxt"), {
          autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".nxt-grid")[0], start: "top 88%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="Thank You | M3M Brabus"
        description="Your enquiry has reached the M3M Brabus private client team. Here is what happens next, and what will be sent to you."
        path="/thank-you"
        noindex
      />

      <PageHeader
        title={t("thankyou.title")}
        accent={t("thankyou.accent")}
        lede={`${t("thankyou.ledePre")}${PROJECT.name}${t("thankyou.ledePost")}`}
      />

      {/* what happens next */}
      <section className="steps container-lux pb-[clamp(4rem,11vh,7rem)]">

        {firstName && (
          <p className="mb-9 max-w-[52ch] font-display text-[clamp(1.5rem,3.2vw,2.1rem)] font-light leading-snug text-ink">
            {t("enq.thankYou")} <span className="font-serif italic text-brass">{firstName}.</span>
          </p>
        )}

        <div className="border-t border-line">
          {NEXT.map((s, i) => (
            <div
              key={s.k}
              className="step grid grid-cols-1 gap-x-10 gap-y-3 border-b border-line py-7 sm:grid-cols-[minmax(0,16rem)_1fr_auto]"
            >
              <h2 className="flex items-baseline gap-3 font-display text-xl font-light leading-snug text-ink">
                {s.k}
              </h2>
              <p className="max-w-[58ch] leading-relaxed text-ink-soft">{s.d}</p>
              <p className="mono flex items-center gap-2 self-baseline text-[0.56rem] tracking-[0.18em] text-ink-faint sm:justify-end">
                <s.icon size={13} className="text-brass" aria-hidden="true" />
                {s.when}
              </p>
            </div>
          ))}
        </div>

        {claim.ref && (
          <p className="mono mt-8 text-[0.58rem] leading-relaxed tracking-[0.18em] text-ink-faint">
            {t("thankyou.refLabel")} <span className="text-brass">{claim.ref}</span>{t("thankyou.refSuffix")}
          </p>
        )}

        {/* A bookmark, a shared link, a back-button return a week later. Say so
            plainly rather than confirming something that never happened. */}
        {direct && (
          <div className="mt-10 rounded-[1.25rem] border border-line bg-cream p-6 md:p-9">
            <h3 className="max-w-[36ch] font-display text-xl font-light leading-snug text-ink md:text-2xl">
              {t("thankyou.directTitle")}
            </h3>
            <p className="mt-4 max-w-[62ch] leading-relaxed text-ink-soft">
              {t("thankyou.directBody")}
            </p>
            <button
              type="button"
              onClick={cta("register_direct", () => openEnquiry("Thank you page"))}
              data-cursor="OPEN"
              className="group/cta relative mt-7 inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
              <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                {t("thankyou.registerInterest")}
              </span>
              <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
            </button>
          </div>
        )}
      </section>

      {/* don't wait */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-11">
          <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div>
              <h2 className="rise mt-4 max-w-[20ch] font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                {t("thankyou.reachableTitle")} <span className="font-serif italic text-brass">{t("thankyou.reachableAccent")}</span>
              </h2>
              <p className="rise mt-5 max-w-[48ch] leading-relaxed text-ink-soft">
                {t("thankyou.reachableBody")}
              </p>
            </div>

            <div className="rise flex flex-wrap items-center gap-4">
              <a
                href={`tel:${PROJECT.phone}`}
                onClick={() => trackCall("thank_you")}
                aria-label={`${t("thankyou.callAria")}${PROJECT.phone}`}
                className="group inline-flex items-center gap-2.5 rounded-full border border-brass/50 px-7 py-4 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 hover:bg-brass hover:text-obsidian focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                <Phone size={14} />
                {PROJECT.phone}
              </a>
              <a
                href={whatsappUrl({ context: "default" })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsApp("thank_you")}
                className="group inline-flex items-center gap-2.5 rounded-full border border-line px-7 py-4 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors duration-500 hover:border-brass/50 hover:text-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                <WhatsAppIcon size={14} className="text-brass" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="relative mt-9 border-t border-line pt-7">
            <p className="rise mono text-[0.6rem] tracking-[0.24em] text-ink-faint">{t("thankyou.whileMoment")}</p>
            <button
              type="button"
              onClick={cta("brochure", () => openBrochure("Thank you page"))}
              data-cursor="DOWNLOAD"
              className="rise group mt-4 inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass"
            >
              <Download size={14} className="animate-bounce group-hover:animate-none" />
              {t("contact.downloadBrochure")}
              <ArrowUpRight size={13} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            <p className="rise mt-4 max-w-[56ch] text-sm leading-relaxed text-ink-soft">
              {t("thankyou.brochureNote")}
            </p>
          </div>
        </div>
      </section>

      {/* where to go from here */}
      <section className="nxt-grid container-lux pb-[clamp(4rem,12vh,8rem)]">
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {READ_NEXT.map((p, i) => (
            <Link
              key={p.to}
              to={p.to}
              onClick={() => track("cta_click", { location: "thank_you", label: p.to })}
              className="nxt group block border-b border-line py-6"
              data-cursor="VIEW"
            >
              <h2 className="mt-3 flex items-center gap-2 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {p.name}
                <ArrowUpRight
                  size={15}
                  className="text-brass opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </h2>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{p.d}</p>
            </Link>
          ))}
        </div>
        <p className="mono mt-9 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
          {PROJECT.configs} · {PROJECT.address} · {t("thankyou.officiallyReleased")}{PROJECT.developer}
        </p>
      </section>
    </div>
  );
}

/* Kept out of the component so the effect body stays one line and the
   swallow-everything guard is explicit: analytics must never be the reason a
   buyer sees a blank confirmation. */
function claimAndReport() {
  try {
    return claimConversion({ source: "Thank you page" });
  } catch {
    return { status: "", ref: "", name: "", config: "" };
  }
}
