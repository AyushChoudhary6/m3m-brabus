import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Phone } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { useEnquiry } from "../components/ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* A specification page is read system by system, not theme by theme — a buyer
   wants to know what is on the floor and what is behind the wall, in that order.
   So the page is organised the way a schedule of finishes is drawn, and every
   line carries a status. Confirmed lines come only from what M3M has published;
   everything else is marked "On request" and opens the enquiry rather than
   inventing a make, a model or a thickness. The status column is the honest
   part and, not coincidentally, the part that converts. */

const SYSTEMS = [
  {
    id: "structure",
    nameKey: "specs.sysStructureName",
    introKey: "specs.sysStructureIntro",
    rows: [
      { itemKey: "specs.structureArchitectureItem", detailKey: "specs.structureArchitectureDetail", status: "Confirmed" },
      { itemKey: "specs.structureDensityItem", detailKey: "specs.structureDensityDetail", status: "Confirmed" },
      { itemKey: "specs.structureFrameItem", detailKey: "specs.structureFrameDetail", status: "On request" },
    ],
  },
  {
    id: "flooring",
    nameKey: "specs.sysFlooringName",
    introKey: "specs.sysFlooringIntro",
    rows: [
      { itemKey: "specs.flooringLivingItem", detailKey: "specs.flooringLivingDetail", status: "Confirmed" },
      { itemKey: "specs.flooringBedroomsItem", detailKey: "specs.flooringBedroomsDetail", status: "On request" },
      { itemKey: "specs.flooringSkirtingItem", detailKey: "specs.detailNotPublished", status: "On request" },
    ],
  },
  {
    id: "kitchen",
    nameKey: "specs.sysKitchenName",
    introKey: "specs.sysKitchenIntro",
    rows: [
      { itemKey: "specs.kitchenCabinetryItem", detailKey: "specs.kitchenCabinetryDetail", status: "Confirmed" },
      { itemKey: "specs.kitchenFittingsItem", detailKey: "specs.kitchenFittingsDetail", status: "Confirmed" },
      { itemKey: "specs.kitchenCounterItem", detailKey: "specs.kitchenCounterDetail", status: "On request" },
    ],
  },
  {
    id: "bathrooms",
    nameKey: "specs.sysBathroomsName",
    introKey: "specs.sysBathroomsIntro",
    rows: [
      { itemKey: "specs.bathSanitaryItem", detailKey: "specs.bathSanitaryDetail", status: "On request" },
      { itemKey: "specs.bathCladdingItem", detailKey: "specs.bathCladdingDetail", status: "On request" },
      { itemKey: "specs.bathVanitiesItem", detailKey: "specs.bathVanitiesDetail", status: "On request" },
    ],
  },
  {
    id: "doors-windows",
    nameKey: "specs.sysDoorsName",
    introKey: "specs.sysDoorsIntro",
    rows: [
      { itemKey: "specs.doorsGlazingItem", detailKey: "specs.doorsGlazingDetail", status: "On request" },
      { itemKey: "specs.doorsEntranceItem", detailKey: "specs.doorsEntranceDetail", status: "On request" },
      { itemKey: "specs.doorsBalconyItem", detailKey: "specs.detailNotPublished", status: "On request" },
    ],
  },
  {
    id: "electrical",
    nameKey: "specs.sysElectricalName",
    introKey: "specs.sysElectricalIntro",
    rows: [
      { itemKey: "specs.elecAutomationItem", detailKey: "specs.elecAutomationDetail", status: "Confirmed" },
      { itemKey: "specs.elecSwitchesItem", detailKey: "specs.elecSwitchesDetail", status: "On request" },
      { itemKey: "specs.elecPowerItem", detailKey: "specs.elecPowerDetail", status: "On request" },
    ],
  },
  {
    id: "climate",
    nameKey: "specs.sysClimateName",
    introKey: "specs.sysClimateIntro",
    rows: [
      { itemKey: "specs.climateSystemItem", detailKey: "specs.climateSystemDetail", status: "Confirmed" },
      { itemKey: "specs.climateMakeItem", detailKey: "specs.climateMakeDetail", status: "On request" },
      { itemKey: "specs.climateFreshItem", detailKey: "specs.climateFreshDetail", status: "On request" },
    ],
  },
  {
    id: "lifts",
    nameKey: "specs.sysLiftsName",
    introKey: "specs.sysLiftsIntro",
    rows: [
      { itemKey: "specs.liftsLobbyItem", detailKey: "specs.liftsLobbyDetail", status: "Confirmed" },
      { itemKey: "specs.liftsFoyerItem", detailKey: "specs.liftsFoyerDetail", status: "Confirmed" },
      { itemKey: "specs.liftsMakeItem", detailKey: "specs.liftsMakeDetail", status: "On request" },
    ],
  },
  {
    id: "safety",
    nameKey: "specs.sysSafetyName",
    introKey: "specs.sysSafetyIntro",
    rows: [
      { itemKey: "specs.safetySecurityItem", detailKey: "specs.safetySecurityDetail", status: "Confirmed" },
      { itemKey: "specs.safetyFireItem", detailKey: "specs.safetyFireDetail", status: "On request" },
      { itemKey: "specs.safetyAccessItem", detailKey: "specs.safetyAccessDetail", status: "On request" },
    ],
  },
  {
    id: "sustainability",
    nameKey: "specs.sysSustainName",
    introKey: "specs.sysSustainIntro",
    rows: [
      { itemKey: "specs.sustainRainItem", detailKey: "specs.sustainRainDetail", status: "Confirmed" },
      { itemKey: "specs.sustainEnergyItem", detailKey: "specs.sustainEnergyDetail", status: "Confirmed" },
      { itemKey: "specs.sustainGreenItem", detailKey: "specs.sustainGreenDetail", status: "On request" },
    ],
  },
  {
    id: "common",
    nameKey: "specs.sysCommonName",
    introKey: "specs.sysCommonIntro",
    rows: [
      { itemKey: "specs.commonClubItem", detailKey: "specs.commonClubDetail", status: "Confirmed" },
      { itemKey: "specs.commonLandscapeItem", detailKey: "specs.commonLandscapeDetail", status: "Confirmed" },
      { itemKey: "specs.commonParkingItem", detailKey: "specs.commonParkingDetail", status: "Confirmed" },
      { itemKey: "specs.commonAreasItem", detailKey: "specs.commonAreasDetail", status: "On request" },
    ],
  },
];

/* Genuinely useful and rarely written down — how the trade actually words a
   schedule of finishes, and where the words do less than they appear to. */
const READING = [
  { titleKey: "specs.readOrEquivTitle", bodyKey: "specs.readOrEquivBody" },
  { titleKey: "specs.readCategoryTitle", bodyKey: "specs.readCategoryBody" },
  { titleKey: "specs.readMakeTitle", bodyKey: "specs.readMakeBody" },
  { titleKey: "specs.readRoomTitle", bodyKey: "specs.readRoomBody" },
  { titleKey: "specs.readExclusionsTitle", bodyKey: "specs.readExclusionsBody" },
  { titleKey: "specs.readShowflatTitle", bodyKey: "specs.readShowflatBody" },
  { titleKey: "specs.readAnnexedTitle", bodyKey: "specs.readAnnexedBody" },
  { titleKey: "specs.readChangesTitle", bodyKey: "specs.readChangesBody" },
];

const STATUS_COUNT = SYSTEMS.flatMap((s) => s.rows).filter(
  (r) => r.status === "Confirmed",
).length;

export default function SpecificationsPage() {
  const root = useRef(null);
  const { t } = useI18n();
  const { openEnquiry } = useEnquiry();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        q(".sys").forEach((el) => {
          gsap.from(el.querySelectorAll(".sys-row"), {
            autoAlpha: 0, y: 16, duration: 0.65, ease: "power3.out", stagger: 0.05,
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        gsap.from(q(".read-card"), {
          autoAlpha: 0, y: 22, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: q(".read-grid")[0], start: "top 86%" },
        });

        gsap.from(q(".sp-img-wrap"), {
          clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut",
          scrollTrigger: { trigger: q(".sp-img-wrap")[0], start: "top 84%" },
        });
        gsap.to(q(".sp-img-inner"), {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: q(".sp-img-wrap")[0], start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div className="bg-canvas" ref={root}>
      <Seo
        title="M3M Brabus Specifications | Finishes & Fittings"
        description="M3M Brabus specifications system by system — structure, flooring, kitchen, bathrooms, smart home, climate control, lifts, safety and sustainability."
        path="/specifications"
        jsonLd={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Overview", path: "/overview" },
          { name: "Specifications", path: "/specifications" },
        ])}
      />
      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Overview", path: "/overview" },
          { name: "Specifications", path: "/specifications" },
        ]}
      />
      <PageHeader
        compact
        eyebrow={t("specs.eyebrow")}
        title={t("specs.heroTitle")}
        accent={t("specs.heroAccent")}
        lede={`${t("specs.ledeA")} ${PROJECT.configs} ${t("specs.ledeB")} ${PROJECT.name}${t("specs.ledeC")}`}
      />

      {/* how this page is built — the legend, stated before the table */}
      <section className="container-lux pb-[clamp(3.5rem,10vh,6rem)]">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="rise max-w-[52ch] leading-relaxed text-ink-soft">
              {t("specs.read01p1")}
            </p>
            <p className="rise mt-4 max-w-[52ch] leading-relaxed text-ink-soft">
              {t("specs.read01p2a")} <span className="text-ink">{t("specs.statusConfirmed")}</span>{" "}
              {t("specs.read01p2b")} {PROJECT.developer} {t("specs.read01p2c")} {PROJECT.name}.{" "}
              <span className="text-brass">{t("specs.statusOnRequest")}</span> {t("specs.read01p2d")}
            </p>
            <p className="rise mt-4 max-w-[52ch] leading-relaxed text-ink-soft">
              {t("specs.read01p3")}
            </p>
          </div>

          <dl className="rise self-start border-t border-line">
            {[
              { k: t("specs.fieldConfirmedLines"), v: `${STATUS_COUNT} ${t("specs.across")} ${SYSTEMS.length} ${t("specs.systemsWord")}` },
              { k: t("specs.fieldAppliesTo"), v: PROJECT.configs },
              { k: t("specs.fieldResidenceSizes"), v: PROJECT.sizes },
              { k: t("specs.fieldAddress"), v: PROJECT.address },
              { k: t("specs.fieldDetailedSheet"), v: t("specs.detailedSheetValue") },
              { k: t("specs.fieldCarpetAreas"), v: t("specs.carpetAreasValue") },
            ].map((f) => (
              <div
                key={f.k}
                className="grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-8"
              >
                <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{f.k}</dt>
                <dd className="text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* the schedule itself */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <caption className="sr-only">
              {t("specs.tableCaption")}
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="mono w-[16rem] pb-4 pr-6 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  {t("specs.thItem")}
                </th>
                <th scope="col" className="mono pb-4 pr-6 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  {t("specs.thSpecified")}
                </th>
                <th scope="col" className="mono w-[12rem] pb-4 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  {t("specs.thStatus")}
                </th>
              </tr>
            </thead>

            {SYSTEMS.map((s, i) => (
              <tbody key={s.id} className="sys">
                <tr>
                  <th scope="colgroup" colSpan={3} className="pb-3 pt-9 text-left align-bottom">
                    <span className="ml-4 font-display text-xl font-light text-ink">{t(s.nameKey)}</span>
                    <span className="mt-1.5 block max-w-[54ch] text-sm font-normal leading-relaxed text-ink-soft">
                      {t(s.introKey)}
                    </span>
                  </th>
                </tr>

                {s.rows.map((r) => (
                  <tr key={r.itemKey} className="sys-row border-b border-line-soft align-top">
                    <th scope="row" className="py-5 pr-6 text-left font-sans text-sm font-normal leading-snug text-ink">
                      {t(r.itemKey)}
                    </th>
                    <td className="max-w-[52ch] py-5 pr-6 text-sm leading-relaxed text-ink-soft">
                      {t(r.detailKey)}
                    </td>
                    <td className="py-5">
                      {r.status === "Confirmed" ? (
                        <span className="mono inline-flex items-center rounded-full border border-brass/30 px-3 py-1.5 text-[0.56rem] tracking-[0.18em] text-brass-soft">
                          {t("specs.statusConfirmed")}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openEnquiry("Specifications")}
                          data-cursor="ASK"
                          aria-label={`${t("specs.onRequestAria")} ${t(r.itemKey)}, ${t(s.nameKey)}`}
                          className="mono group/req inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.56rem] tracking-[0.18em] text-ink-soft transition-colors duration-300 hover:border-brass/50 hover:text-brass focus-visible:border-brass focus-visible:text-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass/60"
                        >
                          {t("specs.statusOnRequest")}
                          <ArrowUpRight
                            size={12}
                            className="transition-transform duration-500 group-hover/req:-translate-y-0.5 group-hover/req:translate-x-0.5"
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <p className="mono mt-7 text-[0.58rem] leading-relaxed tracking-[0.18em] text-ink-faint">
          {t("specs.footnoteA")} {PROJECT.developer} {t("specs.footnoteB")}
        </p>
      </section>

      {/* the gated sheet */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid items-stretch gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-11">
            <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
            <div className="relative">
              <p className="rise kicker">{t("specs.gatedKicker")}</p>
              <h2 className="rise mt-4 max-w-[17ch] font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                {t("specs.gatedTitleA")}{" "}
                <span className="font-serif italic text-brass">{t("specs.gatedTitleB")}</span>
              </h2>
              <p className="rise mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
                {t("specs.gatedBody")}
              </p>

              <div className="rise mt-9 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => openEnquiry("Specifications")}
                  data-cursor="OPEN"
                  className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-brass/50 px-7 py-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-brass transition-transform duration-500 ease-lux group-hover/cta:scale-x-100" />
                  <span className="relative z-10 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass transition-colors duration-500 group-hover/cta:text-obsidian">
                    {t("specs.gatedCta")}
                  </span>
                  <ArrowUpRight size={15} className="relative z-10 text-brass transition-colors duration-500 group-hover/cta:text-obsidian" />
                </button>
                <a
                  href={`tel:${PROJECT.phone}`}
                  className="mono inline-flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                >
                  <Phone size={13} className="text-brass" />
                  {PROJECT.phone}
                </a>
              </div>

              <p className="rise mono mt-8 text-[0.58rem] leading-relaxed tracking-[0.16em] text-ink-faint">
                {t("specs.gatedNote")}
              </p>
            </div>
          </div>

          <figure className="sp-img-wrap relative min-h-[18rem] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="sp-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.arrival, 1400)}
                alt={`${PROJECT.name} — ${t("specs.arrivalAlt")}`}
                sizes="(max-width:1024px) 100vw, 42vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_52%,rgba(8,6,5,0.68))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <figcaption className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              {PROJECT.configs} · {PROJECT.location}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* the education — how to read any specification sheet */}
      <section className="read-grid container-lux pb-[clamp(4rem,12vh,8rem)]">

        <p className="mb-10 max-w-[58ch] leading-relaxed text-ink-soft">
          {t("specs.read03intro")}
        </p>

        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {READING.map((r, i) => (
            <div key={r.titleKey} className="read-card group border-b border-line py-6">
              <h3 className="mt-3 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {t(r.titleKey)}
              </h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{t(r.bodyKey)}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[1.25rem] border border-line bg-cream p-7 md:p-9">
          <p className="kicker">{t("specs.writingKicker")}</p>
          <p className="mt-4 max-w-[62ch] leading-relaxed text-ink-soft">
            {t("specs.writingBodyA")} {PROJECT.name} {t("specs.writingBodyB")}
          </p>
        </div>
      </section>

      <RelatedPages links={["/residences", "/floor-plan", "/brochure", "/rera"]} />
      <CtaBand title={t("specs.ctaTitle")} accent={t("specs.ctaAccent")} subject="Specifications" />
    </div>
  );
}
