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
import { PROJECT } from "../lib/site.js";
import { PROJECT_FACTS, PRICE, OFFICIAL_SOURCE, hasValue } from "../lib/facts.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* This page is about the WEBSITE, not about the developer. We are not M3M
   India and do not present ourselves as it — so there is no company history,
   no founding year, no project count and no "our team" here. What we can
   describe honestly is our own editorial method, and that is the page. */

const NOT = [
  "The corporate website of M3M India — the official listing is linked on this page, and you should read it.",
  "A price list. No price has been publicly released, so none is quoted anywhere on this site.",
  "An offer, an allotment, or any part of a contract. Only the developer's own documents create rights.",
  "A resale or listings portal. This site covers one address and one address only.",
];

const IS = [
  "A single, carefully maintained reference for M3M Brabus at Sector 58, Golf Course Extension Road.",
  "A way to reach a private client team who will answer in plain language, including when the answer is \"not published yet\".",
  "A record of what the developer has actually stated — configurations, sizes, amenities and address — kept separate from what it has not.",
  "A route to the official brochure, floor plans and price sheet the moment each is issued.",
];

/* The transparency statement. This is the heart of the page and the reason
   a buyer should trust anything else on the site. */
const PRINCIPLES = [
  {
    n: "01",
    t: "One source, and it is not us",
    d: `Every figure on this website is traceable to the official ${PROJECT.developer} listing for ${PROJECT.name}. Portal aggregations, broker circulars and forwarded WhatsApp images are not sources, and nothing from them is republished here. The official page is linked below so you can check any line against it yourself.`,
  },
  {
    n: "02",
    t: "Unpublished is marked, never estimated",
    d: "Price, RERA registration, land area, tower and floor counts, open-space share, carpet areas and the possession date are not published for this project at present. Rather than fill those gaps with a plausible-looking number, we label them on request and offer to send the real figure the day it exists. A blank you can trust is worth more than a number you cannot.",
  },
  {
    n: "03",
    t: "Imagery is artistic and indicative",
    d: "The architectural renders shown across this site are the developer's own — the towers, the arrival and the lobby. Interior and amenity photographs used to convey mood are indicative and are not photographs of this project. No render is a guarantee of finish, view, orientation or dimension. Where an image does not exist, we design around its absence instead of substituting one that misleads.",
  },
  {
    n: "04",
    t: "No borrowed credibility",
    d: "You will find no invented testimonials, no star ratings, no awards we cannot cite, no percentage-sold claims, and no appreciation, rental-yield or market statistic we cannot source. Those devices sell projects; they also survive as the reason a buyer feels misled two years later.",
  },
  {
    n: "05",
    t: "Nothing here creates an obligation",
    d: "This website is marketing material. It is not an offer, an invitation to offer, or a contract. Terms of sale, payment milestones, specifications and dates are governed solely by the developer's allotment letter, agreement to sell and RERA-registered disclosures — which take precedence over everything written here.",
  },
];

/* Deliberately generic — this is how to check a promoter, not a claim about
   this one. Every item is a document the buyer can obtain independently, which
   is why it costs us nothing in credibility to publish it. */
const DUE_DILIGENCE = [
  {
    k: "i",
    t: "RERA registration of the promoter",
    d: "Search the promoter's name on the Haryana RERA portal, not the project's marketing name. The registration names the legal entity, the sanctioned scope and the declared completion date — and a project without a live registration cannot lawfully be advertised or sold.",
  },
  {
    k: "ii",
    t: "Delivery record on completed projects",
    d: "Ask for the list of the developer's completed addresses, then verify them yourself: occupation certificates issued, the gap between the RERA-declared date and the date keys were actually handed over, and what residents say once the sales team has moved on.",
  },
  {
    k: "iii",
    t: "A litigation and encumbrance search",
    d: "Have an advocate run the title chain, the encumbrance certificate on the land parcel and a case search against the promoter entity. Consumer-forum and NCLT matters are public record and take an afternoon to pull.",
  },
  {
    k: "iv",
    t: "The entity actually named on the agreement",
    d: "The brand on the hoarding and the company on the builder–buyer agreement are frequently not the same. Read the allotment letter for the signing entity, the land-owning company and any development-management arrangement before you pay anything beyond the booking amount.",
  },
];

const ENQUIRY_FLOW = [
  {
    n: "01",
    t: "Who actually calls",
    d: "A private client adviser from the team that runs this site — not an automated dialler and not a call centre reading a script. You will be asked what you are looking for and what you already know, so the conversation starts where you are.",
  },
  {
    n: "02",
    t: "How quickly",
    d: "We aim to respond the same working day, and to say so plainly if a question needs checking with the developer before we answer it. A slower correct answer is the house policy.",
  },
  {
    n: "03",
    t: "What you receive",
    d: "The official brochure, the configuration and area detail, the amenity schedule, and any figure that has since been released — price sheet, payment plan, RERA and possession position stated exactly as it stands on the day you ask. Nothing estimated is ever sent.",
  },
  {
    n: "04",
    t: "What happens to your details",
    d: "They are used to answer your enquiry and to send you the documents you asked for. The Privacy Policy sets out what is collected, how long it is held and how to have it removed.",
  },
];

export default function AboutPage() {
  const root = useRef(null);
  const { openEnquiry, openVisit } = useEnquiry();

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
        eyebrow="About M3M Brabus"
        title="An honest"
        accent="reference."
        lede={`This is a dedicated information and enquiry resource for ${PROJECT.name} at ${PROJECT.address}. It is not the developer's corporate site — and everything below explains exactly where the line falls.`}
      />

      {/* what this site is, and what it is not */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">What this website is</span>
        </div>

        <p className="rise max-w-[62ch] text-lg leading-relaxed text-ink-soft">
          Most enquiries about a new luxury address begin the same way: a buyer collects six versions
          of the same project from six different sites, each carrying a slightly different price, a
          slightly different possession date and a confident figure for the land area. None of them
          cite anything. This site exists because that is a poor way to buy a home at this level.
        </p>
        <p className="rise mt-5 max-w-[62ch] leading-relaxed text-ink-soft">
          We maintain one address — {PROJECT.name}, {PROJECT.location} — and we maintain it against
          the developer's own listing rather than against the market's collective guesswork. Where
          {" "}{PROJECT.developer} has published something, you will find it stated here with the same
          words. Where it has not, you will find that said out loud, and a person you can ask.
        </p>

        <div className="rise mt-[clamp(2.5rem,6vh,4rem)] grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="mono text-[0.6rem] tracking-[0.24em] text-brass">It is</p>
            <ul className="mt-5 border-t border-line">
              {IS.map((i) => (
                <li key={i} className="border-b border-line py-4 text-sm leading-relaxed text-ink-soft">
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mono text-[0.6rem] tracking-[0.24em] text-ink-faint">It is not</p>
            <ul className="mt-5 border-t border-line">
              {NOT.map((i) => (
                <li key={i} className="border-b border-line py-4 text-sm leading-relaxed text-ink-soft">
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* the developer and the marque */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">The developer & the marque</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <h2 className="rise max-w-[18ch] font-display text-[clamp(1.9rem,4vw,2.9rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink">
              Described only as far as the <span className="font-serif italic text-brass">listing goes.</span>
            </h2>
            <p className="rise mt-6 max-w-[54ch] leading-relaxed text-ink-soft">
              {PROJECT.name} is developed by {PROJECT.developer}. We deliberately describe the
              developer no further than its own listing for this project supports — no founding year,
              no portfolio count, no delivery record and no awards appear on this page, because
              repeating those from memory is how errors enter a buyer's file. If you want the
              developer's own account of itself, read it from the developer.
            </p>
            <p className="rise mt-4 max-w-[54ch] leading-relaxed text-ink-soft">
              The residence is presented as a branded home inspired by {PROJECT.partner}, the German
              luxury automotive marque, whose ethos of luxury, performance and exclusivity shapes the
              bespoke interiors and premium finishes. That is the extent of what has been published
              about the collaboration, and so it is the extent of what we assert.{" "}
              <Link to="/brabus" className="text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:text-brass-soft">
                The BRABUS partnership, in detail
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
                Verify on the official M3M listing
              </span>
              <ExternalLink size={14} className="text-brass transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <p className="rise mono mt-4 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
              Opens m3mproperties.com · Last re-verified 20 Jul 2026
            </p>
          </div>

          <figure className="ab-img-wrap relative min-h-[20rem] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="ab-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.arrival, 1400)}
                alt={`${PROJECT.name} — the arrival court, artist's impression`}
                sizes="(max-width:1024px) 100vw, 42vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_52%,rgba(8,6,5,0.68))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              Artist's impression · Indicative only
            </figcaption>
          </figure>
        </div>

        {/* The coda to the section above. Having just declined to vouch for the
            developer in adjectives, the honest next move is to hand over the
            checks a buyer should run for themselves — on this promoter or any
            other. Unnumbered because it continues 02 rather than opening 03. */}
        <div className="dd-grid mt-[clamp(3.5rem,9vh,6rem)]">
          <div className="dd flex items-baseline gap-5">
            <span className="idx">—</span>
            <span className="kicker">What to verify about any developer</span>
          </div>
          <p className="dd mt-6 max-w-[58ch] leading-relaxed text-ink-soft">
            Four checks worth running before a booking amount leaves your account — on this address
            or on any other. None of them require a broker's permission, and each one is a document
            you can obtain independently.
          </p>

          <ul className="mt-10 grid gap-x-14 gap-y-0 border-t border-line md:grid-cols-2">
            {DUE_DILIGENCE.map((c) => (
              <li key={c.k} className="dd group flex gap-6 border-b border-line py-6">
                <span className="idx pt-1.5">{c.k}</span>
                <div>
                  <h3 className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-xl">
                    {c.t}
                  </h3>
                  <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-ink-soft">{c.d}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Points at the RERA page and at the ledger in 04 rather than
              restating the registration position, which both already carry. */}
          <p className="dd mt-8 max-w-[58ch] text-sm leading-relaxed text-ink-faint">
            Where {PROJECT.name} itself stands on the first of those is set out on the{" "}
            <Link
              to="/rera"
              className="border-b border-brass/40 text-brass transition-colors hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
            >
              RERA page
            </Link>
            ; the ledger further down this page records every other figure the listing has yet to
            publish.
          </p>
        </div>
      </section>

      {/* the transparency statement — the heart of the page */}
      <section className="pri-grid border-y border-line bg-cream">
        <div className="container-lux py-[clamp(4rem,11vh,7rem)]">
          <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
            <span className="idx">03</span>
            <span className="kicker">How we handle information</span>
          </div>

          <h2 className="pri max-w-[20ch] font-display text-[clamp(2rem,4.4vw,3.2rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
            Five rules this site <span className="font-serif italic text-brass">will not break.</span>
          </h2>

          <dl className="mt-[clamp(2.5rem,6vh,4rem)] border-t border-line">
            {PRINCIPLES.map((p) => (
              <div
                key={p.n}
                className="pri grid grid-cols-1 gap-3 border-b border-line py-7 lg:grid-cols-[auto_minmax(0,18rem)_1fr] lg:gap-10"
              >
                <span className="idx">{p.n}</span>
                <dt className="font-display text-xl leading-snug text-ink md:text-2xl">{p.t}</dt>
                <dd className="max-w-[62ch] leading-relaxed text-ink-soft">{p.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* the rule, demonstrated on this project's own numbers */}
      <section className="led-grid container-lux py-[clamp(4rem,11vh,7rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">04</span>
          <span className="kicker">The rule, applied</span>
        </div>
        <p className="max-w-[62ch] leading-relaxed text-ink-soft">
          A transparency policy is easy to write and easy to abandon on the one page where a number
          would help. So here is the whole ledger for {PROJECT.name}, split down the middle: on the
          left, everything the official listing states; on the right, everything it does not. The
          right-hand column is not a gap in our research — it is the current, accurate state of what
          has been made public, and each line will be answered for you personally on request.
        </p>

        <div className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="led mono text-[0.6rem] tracking-[0.24em] text-brass">Published — stated as issued</p>
            <div className="mt-6 space-y-7">
              {published.map((f) => (
                <Fact key={f.key} fact={f} className="led" />
              ))}
            </div>
          </div>
          <div>
            <p className="led mono text-[0.6rem] tracking-[0.24em] text-ink-faint">Not published — offered, not invented</p>
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
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">05</span>
          <span className="kicker">What happens when you enquire</span>
        </div>

        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {ENQUIRY_FLOW.map((f) => (
            <article key={f.n} className="flw group border-b border-line py-7">
              <span className="idx">{f.n}</span>
              <h3 className="mt-3 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft md:text-2xl">
                {f.t}
              </h3>
              <p className="mt-2.5 max-w-[46ch] leading-relaxed text-ink-soft">{f.d}</p>
            </article>
          ))}
        </div>

        <div className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-11">
            <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
            <div className="relative">
              <p className="rise kicker">Reach a person</p>
              <h2 className="rise mt-4 max-w-[18ch] font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                Skip the form if you'd <span className="font-serif italic text-brass">rather talk.</span>
              </h2>
              <p className="rise mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
                No question about this project is too early or too blunt — including the ones this
                site answers with "not published". Call, write, or ask to be walked through the
                address in person.
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
                    Ask a question
                  </span>
                  <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                </button>
                <button
                  type="button"
                  onClick={() => openVisit("About")}
                  className="group inline-flex items-center gap-2.5 border-b border-brass/50 pb-1 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass"
                >
                  Book a site visit
                  <ArrowUpRight size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </div>

              <div className="rise mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                <a
                  href={`tel:${PROJECT.phone}`}
                  aria-label={`Call the private client team on ${PROJECT.phone}`}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                >
                  <Phone size={13} className="text-brass" />
                  {PROJECT.phone}
                </a>
                <a
                  href={`mailto:${PROJECT.email}`}
                  aria-label={`Email the private client team at ${PROJECT.email}`}
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
            <p className="mono text-[0.6rem] tracking-[0.24em] text-ink-faint">Corrections & legal footing</p>
            <p className="mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
              If a line on this site has fallen behind the official listing — a figure released, a
              date announced, a detail changed — write to us and it will be corrected or removed.
              Being told we are wrong is considerably cheaper than a buyer discovering it later.
            </p>
            <ul className="mt-7 border-t border-line">
              {[
                { to: "/privacy-policy", t: "Privacy Policy", d: "What is collected when you enquire, where it goes, and how to have it removed." },
                { to: "/disclaimer", t: "Disclaimer", d: "The formal statement of what this website is, and what it is not." },
                { to: "/rera", t: "RERA position", d: "Registration status, and how to verify it yourself on the HARERA portal." },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="group flex items-start justify-between gap-6 border-b border-line py-5 transition-colors duration-500 hover:bg-brass/[0.035]"
                  >
                    <span>
                      <span className="block font-display text-lg text-ink transition-colors duration-300 group-hover:text-brass-soft">
                        {l.t}
                      </span>
                      <span className="mt-1 block max-w-[34ch] text-sm leading-relaxed text-ink-soft">{l.d}</span>
                    </span>
                    <ArrowUpRight size={15} className="mt-1.5 shrink-0 text-brass transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mono mt-6 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
              Marketing material · Not an offer or contract · Renders are artistic impressions
            </p>
          </div>
        </div>
      </section>

      <RelatedPages links={["/contact", "/privacy-policy", "/disclaimer"]} />
      <CtaBand title="Ask us" accent="anything." subject="About" />
    </div>
  );
}
