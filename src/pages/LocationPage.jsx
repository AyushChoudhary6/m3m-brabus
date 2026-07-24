import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Route, TrainFront, Building2, GraduationCap, HeartPulse, ShoppingBag } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import LivingMap from "../components/sections/LivingMap.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import { PROJECT } from "../lib/site.js";
import { useI18n } from "../lib/i18n.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* M3M publishes no drive times and no distances for Brabus, so none appear
   here. A minute figure measured on a quiet Sunday is not the number anyone
   drives on a Monday, and inventing one would be worse than the gap.
   LivingMap above plots the place and carries the published ledger; this page
   supplies the other half — what each landmark is for, and what having it on
   this side of Gurugram does to an ordinary week. Where the distance genuinely
   decides the answer, the reader gets the check to run on their own map. */

/* The three arguments a purchase at this size actually turns on. `places`
   names the ledger rows each argument covers — the descriptors themselves are
   stated once, in the connectivity ledger above, and not repeated here. */
const PILLARS = [
  {
    key: "roads",
    icon: Route,
    title: "Roads & connectivity",
    places: "Golf Course Extension Road · Golf Course Road · NH-8 · Sohna Road",
    body: [
      "The address sits on Golf Course Extension Road rather than behind it — a smaller distinction on paper than it is at eight in the morning, when the difference is joining the arterial directly instead of queueing along a sector road to reach it.",
      "From that spine the belt offers several ways out: Golf Course Road towards the older city, NH-8 towards Delhi, Sohna Road to the south. A household that can choose its route treats a bad junction as a detour rather than a lost hour — and choice of route is the first thing a resale buyer tests on the drive up.",
    ],
    check:
      "Drive the approach yourself at the hour you actually leave, in both directions. The road is the same all day; the entry to it is not.",
  },
  {
    key: "transit",
    icon: TrainFront,
    title: "Metro & airport",
    places: "Metro connectivity · IGI Airport",
    body: [
      "Rail matters at this ticket size for a reason buyers rarely say aloud: it is what the household staff, the visiting cousin and anyone whose car is spoken for actually use. A home that works without a second driver is a home that works on a Tuesday.",
      "The airport decides something different — whether an early flight means leaving at four or at five, and whether guests landing from abroad reach you before dinner or after it. Both travel with the property.",
    ],
    check:
      "Find the nearest station operating today, not the one on a future map, and look at the route you would take to it after dark. Rail plans along this corridor are still moving, and the honest answer moves with them.",
  },
  {
    key: "work",
    icon: Building2,
    title: "Business districts",
    places: "Cyber City & business hubs",
    body: [
      "Cyber City and Udyog Vihar hold the older headquarters. The Golf Course Extension corridor has spent the past decade growing offices of its own along its length, which is the part most location pages forget to mention.",
      "A four- or five-bedroom home is usually bought by a household with two careers pointed in two directions, and the case for this stretch is that it does not force one of them to lose. One commute runs towards the established districts; the other may never leave the corridor. It is the same arithmetic that decides who a home here lets to later.",
    ],
    check:
      "Plot both commutes, not the shorter one. An address is only ever as good as the second journey out of it.",
  },
];

/* The everyday three. M3M publishes them as a single ledger line, so the
   descriptor stays upstairs and only the argument is made here. */
const EVERYDAY = [
  {
    key: "schools",
    icon: GraduationCap,
    title: "Schools",
    body: "The school run is the commute you make twice a day for a decade, and it is what really sets the hour the household wakes. Sector 58 sits inside the belt around which the established Gurugram schools drew their catchments — which matters far less as a distance than as a bus route.",
    check: "Ask each school for its route and its catchment before you ask for the distance.",
  },
  {
    key: "hospitals",
    icon: HeartPulse,
    title: "Hospitals",
    body: "This is the amenity you hope never to use and cannot compromise on. What counts is not the daytime run to a multi-speciality hospital but the two-in-the-morning one: whether the route stays arterial and lit the whole way, or threads through unlit sector roads.",
    check: "Drive the emergency route once, at night, before you sign anything.",
  },
  {
    key: "retail",
    icon: ShoppingBag,
    title: "Shopping & dining",
    body: "Two quite different needs usually get collapsed into one line. The first is the ordinary — a chemist, a grocer, somebody who can take up a hem — where the test is whether a forgotten errand costs ten minutes or a whole evening. The second is the occasion: somewhere worth leaving the house for on a weeknight.",
    check: "Walk the nearest everyday parade on foot. Convenience is felt at that scale, not measured on a map.",
  },
];

export default function LocationPage() {
  const root = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 88%" },
        });

        gsap.from(q(".pillar"), {
          autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: q(".pillars")[0], start: "top 86%" },
        });

        /* Rules draw left to right so each argument reads as a line being
           written down rather than a card switching on. */
        gsap.from(q(".pillar-rule"), {
          scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: q(".pillars")[0], start: "top 86%" },
        });

        gsap.from(q(".day"), {
          autoAlpha: 0, y: 18, duration: 0.75, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".everyday")[0], start: "top 88%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus Location | Sector 58, Golf Course Ext Road"
        description="M3M Brabus is on Golf Course Extension Road, Sector 58 Gurugram — what the address means for the commute, the metro, the airport, schools and hospitals."
        path="/location"
        jsonLd={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Location", path: "/location" }])}
      />
      <Breadcrumbs trail={[{ name: t("home.crumbHome"), path: "/" }, { name: t("location.crumb"), path: "/location" }]} />
      <PageHeader
        compact
        title={t("location.title")}
        accent={t("location.accent")}
        lede={`${PROJECT.address} — ${t("location.ledeBody")}`}
      />

      {/* real map + the published connectivity ledger (page supplies its own heading) */}
      <LivingMap bare />

      {/* why the address matters — the argument the ledger above cannot make */}
      <section className="container-lux pb-[clamp(4rem,12vh,8rem)]">

        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[1fr_0.92fr] lg:items-end">
          <h2 className="rise max-w-[17ch] font-display text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.03] tracking-[-0.025em] text-ink">
            {t("location.whyTitle1")} <span className="font-serif italic text-brass">{t("location.whyTitle2")}</span>
          </h2>
          <p className="rise max-w-[48ch] leading-relaxed text-ink-soft">
            {PROJECT.developer} {t("location.whyBody")}
          </p>
        </div>

        <ol className="pillars mt-[clamp(2.5rem,7vh,4.5rem)] grid list-none grid-cols-1 gap-0 p-0">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <li key={p.key} className="pillar group relative py-8">
                <span aria-hidden="true" className="pillar-rule absolute inset-x-0 top-0 h-px bg-line" />
                <div className="grid gap-x-16 gap-y-5 lg:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <div className="flex items-baseline gap-4">
                      <span className="shrink-0 self-center text-brass" aria-hidden="true">
                        <Icon size={18} strokeWidth={1.4} />
                      </span>
                    </div>
                    <h3 className="mt-3 max-w-[16ch] font-display text-xl leading-snug text-ink transition-colors duration-500 group-hover:text-brass-soft md:text-2xl">
                      {t(`location.pillar.${p.key}.title`)}
                    </h3>
                    <p className="mono mt-4 max-w-[26ch] text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
                      {t(`location.pillar.${p.key}.places`)}
                    </p>
                  </div>

                  <div>
                    {p.body.map((para, bi) => (
                      <p key={bi} className="mb-4 max-w-[62ch] leading-relaxed text-ink-soft last:mb-0">
                        {t(`location.pillar.${p.key}.body.${bi}`)}
                      </p>
                    ))}
                    <p className="mt-6 max-w-[62ch] border-l border-brass/40 pl-5 text-sm leading-relaxed text-ink-faint">
                      <span className="mono mr-2 text-[0.58rem] tracking-[0.18em] text-brass">{t("location.checkForYourself")}</span>
                      {t(`location.pillar.${p.key}.check`)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="everyday mt-[clamp(2.5rem,7vh,4.5rem)] border-t border-line pt-8">
          <h3 className="rise font-display text-xl text-ink md:text-2xl">{t("location.weekInBetween")}</h3>

          <div className="mt-8 grid grid-cols-1 gap-x-14 gap-y-0 md:grid-cols-3">
            {EVERYDAY.map((e) => {
              const Icon = e.icon;
              return (
                <article key={e.key} className="day group border-t border-line py-6 md:border-t-0 md:pt-0">
                  <span className="text-brass" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.4} />
                  </span>
                  <h3 className="mt-3 font-display text-lg text-ink transition-colors duration-500 group-hover:text-brass-soft">
                    {t(`location.everyday.${e.key}.title`)}
                  </h3>
                  <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{t(`location.everyday.${e.key}.body`)}</p>
                  <p className="mt-4 max-w-[46ch] border-l border-brass/40 pl-4 text-sm leading-relaxed text-ink-faint">
                    {t(`location.everyday.${e.key}.check`)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <p className="rise mono mt-[clamp(2rem,6vh,3.5rem)] border-t border-line pt-8 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
          {t("location.noDrivePrefix")} {PROJECT.name} ·{" "}
          <span>{t("location.factsBy")} {PROJECT.developer}</span>
        </p>
      </section>

      <RelatedPages links={["/overview", "/amenities", "/contact"]} />
      <CtaBand title={t("location.ctaTitle")} accent={t("location.ctaAccent")} subject="Location" />
    </div>
  );
}
