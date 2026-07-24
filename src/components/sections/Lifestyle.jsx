import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { icon } from "../../lib/icons.js";
import { useI18n } from "../../lib/i18n.jsx";
import { AMENITY_CATEGORY, AMENITY_COUNT } from "../../lib/amenities.js";
import { RENDERS } from "../../lib/renders.generated.js";

/* Card widths: 78vw phone, 58vw sm, 30vw md, 26vw lg — kept in sync with the
   <article> classes below so the browser fetches the right derivative width. */
const IMG_SIZES = "(max-width:640px) 78vw, (max-width:768px) 58vw, (max-width:1024px) 30vw, 26vw";
const srcSet = (variants) => variants.map(([w, url]) => `${url} ${w}w`).join(", ");

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* CHAPTER 05 — THE LIFESTYLE  (horizontal scroll)
   The tour still travels sideways: a tall section + a sticky viewport
   translate a track of plates as you scroll, and native swipe carries it on
   touch. What changed is what the plates are made of.

   They used to be photographs. Only three renders exist for this project —
   towers, arrival, lobby — so all seven panels resolved to the SAME marble
   lobby frame, captioned "Spa & Wellness", "Performance Gym", "The Theatre".
   An official-looking render under the wrong caption is a worse claim than a
   stock photo ever was: it asserts that this is the project's gym. It is not,
   and we have no picture of one. Two of those captions were inventions in
   their own right — no screening room and no sky lounge have been announced
   (see the `gated` notes in lib/amenities.js), and "Olympic" was a length
   nobody published. Both panels are gone.

   So the plates are typographic. The frame, the sequence numerals and the
   scrub all survive; the picture is replaced by type, a hairline and a
   decorative field that claims nothing. The three real renders already appear
   once each, correctly captioned, in Exhibition further down the homepage —
   borrowing the lobby a third time here would buy nothing.

   Content is unchanged and unchanged-able: each panel names an occasion and
   lists the facilities lib/amenities.js traces to the official listing.
   Nothing here is authored — the names come from the fact layer, so the day a
   facility is added or withdrawn this section follows without an edit. */

/* Seven occasions, each mapping exactly onto one category's published items.
   `smart-living` is deliberately absent: what is published under it (smart
   home, VRV) sits inside the residence, not in the private world outside it,
   and it is carried by the Residences chapter instead. */
/* `img` names the plate in /public/renders/lifestyle. It is explicit rather than
   derived from `cat` so a panel can point at whichever render actually shows its
   subject — the drawings are named for what is IN them, not for the category. */
const PANELS = [
  { cat: "clubhouse", img: "clubhouse-lounge", n: "The Club", nKey: "slifestyle.clubName", d: "A multi-level club and lounge, with the gym inside it.", dKey: "slifestyle.clubDesc" },
  { cat: "wellness", img: "rooftop-pool-dusk", n: "The Water", nKey: "slifestyle.waterName", d: "A pool held at temperature through the year, and the still rooms beside it.", dKey: "slifestyle.waterDesc" },
  { cat: "lifestyle", img: "private-dining-room", n: "The Table", nKey: "slifestyle.tableName", d: "A restaurant within the gates, and a hall for the evening the house cannot hold.", dKey: "slifestyle.tableDesc" },
  { cat: "outdoor", img: "private-garden-terrace", n: "The Grounds", nKey: "slifestyle.groundsName", d: "Gardens and green courts held between the towers, not squeezed around them.", dKey: "slifestyle.groundsDesc" },
  { cat: "sports", img: "billiards-games-room", n: "The Court", nKey: "slifestyle.courtName", d: "Games indoors and out, and a run laid through the landscape.", dKey: "slifestyle.courtDesc" },
  // No render of a children's ground exists yet — this plate still carries the
  // old stock image. Swap `img` the moment a real one lands.
  { cat: "kids", img: "kids", n: "The Children's Ground", nKey: "slifestyle.kidsName", d: "Play kept inside the security line rather than beyond it.", dKey: "slifestyle.kidsDesc" },
  { cat: "security", img: "entrance-signage-wall", n: "The Gate", nKey: "slifestyle.gateName", d: "Manned gates, cameras throughout, and covered parking to each residence.", dKey: "slifestyle.gateDesc" },
].map(({ cat, img, n, nKey, d, dKey }) => {
  const c = AMENITY_CATEGORY[cat];
  // A renamed or retired category should surface as a build-time failure, not
  // as a silently empty plate in the tour.
  if (!c) throw new Error(`Lifestyle: no amenity category "${cat}"`);
  return { n, nKey, d, dKey, img, icon: c.icon };
});

const TOTAL = PANELS.length + 1; // the index card closes the sequence

/* Decorative only — a warm field that shifts from plate to plate so the track
   reads as a sequence of materials rather than seven identical cards. It
   depicts nothing, which is the entire point. */
const field = (i) =>
  `radial-gradient(120% 95% at ${14 + (i % 3) * 33}% ${i % 2 ? 6 : 94}%, rgba(201,168,106,0.11), transparent 62%),` +
  `linear-gradient(${150 + i * 9}deg, rgba(241,234,217,0.035), transparent 48%)`;

export default function Lifestyle() {
  const root = useRef(null);
  const track = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add(
        { desktop: "(min-width:768px) and (prefers-reduced-motion: no-preference)" },
        () => {
          const el = track.current;
          const distance = () => Math.max(0, el.scrollWidth - window.innerWidth + window.innerWidth * 0.06);

          // horizontal scrub driven by the tall section (sticky viewport, no pin)
          gsap.to(el, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          });

          // progress rail
          gsap.to(q(".life-bar"), {
            scaleX: 1, ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    /* 280vh, up from 260: the track gained a plate, and the scrub pace is the
       ratio of travel to section height. Same feel, one card longer. */
    <section ref={root} id="lifestyle" className="relative md:h-[280vh]">
      <div className="flex flex-col md:sticky md:top-0 md:h-svh md:overflow-hidden">
        {/* header — kept compact on desktop so the cards below have room to fit
            the sticky viewport without their bottoms being clipped. */}
        <div className="container-lux pt-[clamp(2rem,6vh,3.5rem)] md:pt-[9vh]">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-16">
            <h2 className="max-w-[20ch] font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
              {t("slifestyle.headingLead")} <span className="font-serif italic text-brass">{t("slifestyle.headingAccent")}</span>
            </h2>
          </div>

          {/* desktop-only rule; no margin on mobile where it isn't rendered */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:mt-7">
            <div className="hidden h-px w-full max-w-40 origin-left bg-line md:block">
              <div className="life-bar h-px w-full origin-left scale-x-0 bg-brass" />
            </div>
          </div>
        </div>

        {/* track */}
        <div className="mt-8 flex-1 md:mt-10 md:flex md:items-center">
          <div
            ref={track}
            dir="ltr"
            className="flex gap-5 overflow-x-auto px-[var(--spacing-gutter)] pb-6 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-8 md:overflow-visible md:pb-0 md:pr-[6vw] [&::-webkit-scrollbar]:hidden"
          >
            {PANELS.map((p, i) => {
              const Icon = icon(p.icon);
              const gen = RENDERS[`/renders/lifestyle/${p.img}.jpg`];
              return (
                <article
                  key={p.n}
                  className="amen group relative flex min-h-[max(26rem,calc(78vw*4/3))] w-[78vw] flex-none flex-col overflow-hidden rounded-[1.25rem] border border-line bg-paper transition-colors duration-500 hover:border-brass/40 sm:min-h-[calc(58vw*4/3)] sm:w-[58vw] md:h-[clamp(20rem,58vh,30rem)] md:min-h-0 md:w-[30vw] lg:w-[26vw]"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-700 ease-lux group-hover:opacity-100"
                    style={{ background: field(i) }}
                  />
                  {/* Representative amenity photograph — royalty-free, self-hosted,
                      NOT a render of this project. It fills the top of the card
                      and fades into the card bg so the text below stays legible. */}
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[62%] overflow-hidden rounded-t-[1.25rem]">
                    {/* Responsive AVIF/WebP from the generated manifest, best
                        first; the hand-made full-size .webp is the fallback for
                        any plate that has no derivatives yet, then the JPEG. */}
                    <picture>
                      {gen?.avif?.length ? (
                        <source type="image/avif" srcSet={srcSet(gen.avif)} sizes={IMG_SIZES} />
                      ) : null}
                      {gen?.webp?.length ? (
                        <source type="image/webp" srcSet={srcSet(gen.webp)} sizes={IMG_SIZES} />
                      ) : (
                        <source type="image/webp" srcSet={`/renders/lifestyle/${p.img}.webp`} />
                      )}
                      <img
                        src={`/renders/lifestyle/${p.img}.jpg`}
                        alt=""
                        width={gen?.w}
                        height={gen?.h}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover opacity-[0.72] transition-[transform,opacity] duration-[1200ms] ease-lux group-hover:scale-[1.04] group-hover:opacity-90"
                      />
                    </picture>
                    <div className="absolute inset-0 [background:linear-gradient(180deg,rgba(14,11,8,0.35)_0%,rgba(27,22,15,0.35)_45%,var(--color-paper)_100%)]" />
                  </div>
                  {/* watermark numeral — the sequence, set large and nearly out */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-6 right-1 select-none font-display text-[7.5rem] font-light leading-none tracking-[-0.04em] text-brass/[0.07] transition-transform duration-[1600ms] ease-lux group-hover:-translate-y-2 md:text-[9rem]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pointer-events-none absolute inset-0 rounded-[1.25rem] ring-1 ring-inset ring-brass/10" />

                  <div className="relative flex h-full flex-col p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="mono text-[0.56rem] tracking-[0.2em] text-brass-soft">
                        {String(i + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
                      </span>
                      <span className="text-ink-faint transition-colors duration-500 group-hover:text-brass" aria-hidden="true">
                        <Icon size={19} strokeWidth={1.3} />
                      </span>
                    </div>

                    <div className="mt-auto">
                      {/* the rule does the work the image zoom used to */}
                      <span
                        aria-hidden="true"
                        className="mb-5 block h-px w-10 origin-left bg-brass/50 transition-transform duration-[900ms] ease-lux group-hover:scale-x-[2.4]"
                      />
                      <h3 className="font-display text-xl leading-tight text-ink md:text-2xl">{t(p.nKey)}</h3>
                      <p className="mt-2 max-w-[32ch] text-[0.82rem] leading-relaxed text-ink-soft">{t(p.dKey)}</p>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* The sequence closes on the record rather than on a picture:
                the full count, and the page that carries the omissions too. */}
            <Link
              to="/amenities"
              data-cursor="OPEN"
              className="amen group relative flex min-h-[max(26rem,calc(78vw*4/3))] w-[78vw] flex-none flex-col overflow-hidden rounded-[1.25rem] border border-brass/25 bg-paper transition-colors duration-500 hover:border-brass/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass sm:min-h-[calc(58vw*4/3)] sm:w-[58vw] md:h-[clamp(20rem,58vh,30rem)] md:min-h-0 md:w-[30vw] lg:w-[26vw]"
            >
              <div
                aria-hidden="true"
                className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(32%_32%_at_70%_10%,rgba(201,168,106,0.16),transparent_70%)]"
              />
              <div className="pointer-events-none absolute inset-0 rounded-[1.25rem] ring-1 ring-inset ring-brass/10" />

              <div className="relative flex h-full flex-col p-5 md:p-6">
                <span className="mono text-[0.56rem] tracking-[0.2em] text-brass-soft">
                  {String(TOTAL).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
                </span>

                <div className="mt-auto">
                  <span
                    aria-hidden="true"
                    className="mb-5 block h-px w-10 origin-left bg-brass/50 transition-transform duration-[900ms] ease-lux group-hover:scale-x-[2.4]"
                  />
                  <h3 className="max-w-[12ch] font-display text-xl font-light leading-tight text-ink md:text-2xl">
                    {AMENITY_COUNT} {t("slifestyle.namedFacilities")}{" "}
                    <span className="font-serif italic text-brass">{t("slifestyle.andTheGaps")}</span>
                  </h3>
                  <p className="mt-3 max-w-[32ch] text-[0.82rem] leading-relaxed text-ink-soft">
                    {t("slifestyle.indexDesc")}
                  </p>
                  <span className="mono mt-6 inline-flex items-center gap-2 border-b border-brass/40 pb-1 text-[0.62rem] tracking-[0.18em] text-brass transition-colors duration-500 group-hover:border-brass">
                    {t("slifestyle.amenityIndex")}
                    <ArrowUpRight
                      size={13}
                      aria-hidden="true"
                      className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
