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
    name: "Structure & Envelope",
    intro:
      "How the building is put together, and how each home sits within it.",
    rows: [
      {
        item: "Architecture",
        detail:
          "Open-core planning. Every residence opens on three sides, so daylight and cross-ventilation reach each room rather than only the outer face of the plan.",
        status: "Confirmed",
      },
      {
        item: "Density",
        detail:
          "An ultra-low-density collection — a limited number of homes across a generous address, planned so distance between residences is the default condition.",
        status: "Confirmed",
      },
      {
        item: "Frame, walls & heights",
        detail:
          "The structural system, wall construction, external cladding and floor-to-floor heights are not stated on the official listing. Ask for them in writing before you compare this building with another.",
        status: "On request",
      },
    ],
  },
  {
    id: "flooring",
    name: "Flooring",
    intro: "The single line buyers check first, and the one most loosely written.",
    rows: [
      {
        item: "Living & dining",
        detail:
          "Italian marble. The quarry, block selection, slab size, thickness and finish are matters for the detailed schedule.",
        status: "Confirmed",
      },
      {
        item: "Bedrooms, kitchen, bathrooms, balconies",
        detail:
          "Premium branded finishes are committed to across the residence, but the material is not published room by room. A house-wide phrase is not a room-wise schedule — insist on the latter.",
        status: "On request",
      },
      {
        item: "Skirting, thresholds & inlays",
        detail: "Not published.",
        status: "On request",
      },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    intro: "What is fitted, what is fixed, and what you will be buying yourself.",
    rows: [
      {
        item: "Cabinetry",
        detail:
          "A modular kitchen is provided as part of the residence rather than left as a bare shell.",
        status: "Confirmed",
      },
      {
        item: "Fittings & hardware",
        detail: "Branded fittings and hardware are specified.",
        status: "Confirmed",
      },
      {
        item: "Counter, splashback & appliance schedule",
        detail:
          "Counter material, splashback, sink, hob, chimney and any built-in appliances are not itemised publicly. Whether an appliance is supplied or merely provisioned for is the question to put.",
        status: "On request",
      },
    ],
  },
  {
    id: "bathrooms",
    name: "Bathrooms",
    intro: "Where cost is most often quietly saved, and most visibly noticed.",
    rows: [
      {
        item: "Sanitaryware & CP fittings",
        detail:
          "No make, range or finish is published. The listing commits to premium branded finishes across the home; it does not name the bathroom brands.",
        status: "On request",
      },
      {
        item: "Wall & floor cladding",
        detail: "Material, size and height of cladding are not published.",
        status: "On request",
      },
      {
        item: "Vanities, mirrors & shower enclosures",
        detail:
          "Not published. Worth asking whether enclosures and vanity units are supplied or are an owner's fit-out item.",
        status: "On request",
      },
    ],
  },
  {
    id: "doors-windows",
    name: "Doors & Windows",
    intro: "The parts of a home that are used a hundred times a day.",
    rows: [
      {
        item: "Glazing & aspect",
        detail:
          "Three-side-open planning implies substantial glazing to each residence; the glazing system, glass specification and acoustic performance are not published figures.",
        status: "On request",
      },
      {
        item: "Entrance & internal doors",
        detail:
          "Door construction, veneer or finish, ironmongery and lock make are not stated.",
        status: "On request",
      },
      {
        item: "Balcony & railing detail",
        detail: "Not published.",
        status: "On request",
      },
    ],
  },
  {
    id: "electrical",
    name: "Electrical & Smart Home",
    intro: "Automation is only as good as the wiring and the point count beneath it.",
    rows: [
      {
        item: "Home automation",
        detail:
          "Smart-home integration is part of the residence specification, extending to lighting, climate and security.",
        status: "Confirmed",
      },
      {
        item: "Switches, points & distribution",
        detail:
          "Switchgear make, point count per room, data and TV provision and the distribution board specification are not published.",
        status: "On request",
      },
      {
        item: "Power back-up",
        detail:
          "The back-up load allocated per residence, and what it covers, is not published. Ask for it in kVA, not in adjectives.",
        status: "On request",
      },
    ],
  },
  {
    id: "climate",
    name: "Climate Control",
    intro: "A system choice that decides both comfort and running cost.",
    rows: [
      {
        item: "System",
        detail:
          "VRV air conditioning throughout the residence — variable refrigerant volume, so output modulates by zone instead of cycling a single compressor on and off.",
        status: "Confirmed",
      },
      {
        item: "Make, zoning & indoor units",
        detail:
          "The manufacturer, the number of zones, indoor unit type and whether ducting is concealed to every room are not published.",
        status: "On request",
      },
      {
        item: "Fresh air & filtration",
        detail:
          "Any fresh-air or filtration provision is not stated. A sealed, heavily glazed home makes this worth asking about.",
        status: "On request",
      },
    ],
  },
  {
    id: "lifts",
    name: "Lifts & Lobbies",
    intro: "The arrival sequence — the part of the building you use daily.",
    rows: [
      {
        item: "Private lift lobby",
        detail:
          "Each residence is served by its own private lift lobby, so you do not share a landing with a neighbour.",
        status: "Confirmed",
      },
      {
        item: "Private foyer",
        detail:
          "The larger 5 BHK residence adds a private foyer ahead of the lobby.",
        status: "Confirmed",
      },
      {
        item: "Lift make, speed & count",
        detail:
          "Manufacturer, car capacity, speed, the number of passenger and service lifts per core and the finish of common lobbies are not published.",
        status: "On request",
      },
    ],
  },
  {
    id: "safety",
    name: "Safety & Security",
    intro: "The systems you hope never to test.",
    rows: [
      {
        item: "Manned security & surveillance",
        detail:
          "24/7 security with CCTV surveillance across the address, with controlled, manned entry.",
        status: "Confirmed",
      },
      {
        item: "Fire detection & suppression",
        detail:
          "Detection, sprinkler and suppression provision within residences and common areas is not published. It will be governed by the sanctioned fire scheme — ask to see it.",
        status: "On request",
      },
      {
        item: "Access control & video door phone",
        detail:
          "Boom barriers, visitor management, apartment-level access control and video door phone specification are not itemised.",
        status: "On request",
      },
    ],
  },
  {
    id: "sustainability",
    name: "Sustainability",
    intro: "What the building does about water, power and waste.",
    rows: [
      {
        item: "Rainwater harvesting",
        detail: "Rainwater harvesting is built into the development.",
        status: "Confirmed",
      },
      {
        item: "Energy-efficient systems",
        detail:
          "Energy-efficient building systems are specified as part of the smart and sustainable brief.",
        status: "Confirmed",
      },
      {
        item: "Green rating, STP & EV charging",
        detail:
          "Any green-building rating, sewage treatment capacity, solar provision and electric-vehicle charging in the parking are not published.",
        status: "On request",
      },
    ],
  },
  {
    id: "common",
    name: "Common Areas",
    intro: "Everything beyond your own front door.",
    rows: [
      {
        item: "Clubhouse & wellness",
        detail:
          "A grand clubhouse with a fully equipped gym, a temperature-controlled swimming pool, a spa and wellness centre with sauna and steam, and a multipurpose event hall.",
        status: "Confirmed",
      },
      {
        item: "Landscape & play",
        detail:
          "Landscaped gardens with jogging tracks, and a children's play area within the estate.",
        status: "Confirmed",
      },
      {
        item: "Parking",
        detail:
          "Dedicated covered parking is allotted to each residence.",
        status: "Confirmed",
      },
      {
        item: "Areas, materials & bay allocation",
        detail:
          "The clubhouse area, the finish schedule for common lobbies and corridors, the landscape consultant and the number of bays per residence are not published.",
        status: "On request",
      },
    ],
  },
];

/* Genuinely useful and rarely written down — how the trade actually words a
   schedule of finishes, and where the words do less than they appear to. */
const READING = [
  {
    t: '"Or equivalent"',
    d: "The most consequential two words on any specification sheet. A named brand followed by \"or equivalent\" permits substitution at the developer's discretion. Ask for equivalence to be defined — same product grade, same price band, and any change approved in writing rather than announced at handover.",
  },
  {
    t: "Category words are not quality words",
    d: "\"Vitrified tile\" describes a manufacturing process, not a standard. The category spans commodity tile and full-body porcelain many times its cost. The same is true of \"imported marble\", \"branded CP fittings\" and \"premium laminate\". A category tells you almost nothing until it is pinned to a product.",
  },
  {
    t: "Make, series, size, finish",
    d: "A complete line ends in a manufacturer and a product identity. \"Branded sanitaryware\" is a promise; a named range in a named finish is a specification. Where a model cannot be fixed this far out, ask for a written price band per unit or per sq.ft instead — it constrains substitution just as effectively.",
  },
  {
    t: "Room by room, not house-wide",
    d: "A schedule that reads \"marble flooring\" without naming rooms can be honoured by marble in the living room alone. Ask for the schedule set out room by room — living, dining, bedrooms, kitchen, bathrooms, balconies, utility and the private lobby — with the material against each.",
  },
  {
    t: "Read the exclusions",
    d: "What is absent matters as much as what is listed. Light fittings, wardrobes, curtains and blinds, loose furniture and free-standing appliances are commonly outside the specification. Establish the boundary before you budget your fit-out, not after.",
  },
  {
    t: "The show flat is not the contract",
    d: "Sample residences are dressed well beyond the delivered specification. Walk one with the schedule in hand and ask, item by item, which elements are contractual and which are staging. Photograph anything you are told is included.",
  },
  {
    t: "Get it annexed",
    d: "The specification only binds if it forms a numbered annexure to the builder–buyer agreement, referenced in the body of the agreement, signed and dated by both parties. A specification circulated as a brochure page or an email attachment is marketing material, not a term.",
  },
  {
    t: "Ask how changes are notified",
    d: "Long builds see genuine, sometimes unavoidable substitutions. The fair position is a clause requiring written notice of any change, with an equal-or-better test and a stated remedy. Ask what that clause says before you sign, not when the change arrives.",
  },
];

const STATUS_COUNT = SYSTEMS.flatMap((s) => s.rows).filter(
  (r) => r.status === "Confirmed",
).length;

export default function SpecificationsPage() {
  const root = useRef(null);
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
        title="M3M Brabus Specifications | Finishes, Fittings & Systems, Sector 58"
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
        eyebrow="M3M Brabus Specifications"
        title="Read it by system,"
        accent="not by adjective."
        lede={`The specification for the ${PROJECT.configs} at ${PROJECT.name}, set out the way a schedule of finishes is drawn — structure first, common areas last. Every line is marked confirmed or on request; nothing is filled in with a plausible guess.`}
      />

      {/* how this page is built — the legend, stated before the table */}
      <section className="container-lux pb-[clamp(3.5rem,10vh,6rem)]">
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">01</span>
          <span className="kicker">How to read this page</span>
        </div>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="rise max-w-[52ch] leading-relaxed text-ink-soft">
              Most specification pages in this market read as one long list of
              superlatives. This one does not. It is arranged by building system —
              structure, then flooring, then kitchen, and so on to the common
              estate — because that is the order in which a schedule of finishes is
              drawn and the order in which a surveyor would check it.
            </p>
            <p className="rise mt-4 max-w-[52ch] leading-relaxed text-ink-soft">
              Against every line sits a status. <span className="text-ink">Confirmed</span>{" "}
              means {PROJECT.developer} has published it for {PROJECT.name}.{" "}
              <span className="text-brass">On request</span> means it has not been
              published — no make, no model, no thickness — and we will not supply
              one from imagination. Ask, and the detailed sheet comes to you as an
              official document.
            </p>
            <p className="rise mt-4 max-w-[52ch] leading-relaxed text-ink-soft">
              That distinction is worth more than a longer list. A specification you
              can rely on is one you can hold a developer to; everything else is
              atmosphere.
            </p>
          </div>

          <dl className="rise self-start border-t border-line">
            {[
              { k: "Confirmed lines", v: `${STATUS_COUNT} across ${SYSTEMS.length} systems` },
              { k: "Applies to", v: PROJECT.configs },
              { k: "Residence sizes", v: PROJECT.sizes },
              { k: "Address", v: PROJECT.address },
              { k: "Detailed sheet", v: "Issued on request" },
              { k: "Carpet areas", v: "Not published · on request" },
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
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">02</span>
          <span className="kicker">The schedule, system by system</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <caption className="sr-only">
              M3M Brabus specifications by building system, with the published status of each line
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="mono w-[16rem] pb-4 pr-6 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  Item
                </th>
                <th scope="col" className="mono pb-4 pr-6 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  What is specified
                </th>
                <th scope="col" className="mono w-[12rem] pb-4 text-[0.6rem] font-normal tracking-[0.2em] text-ink-faint">
                  Status
                </th>
              </tr>
            </thead>

            {SYSTEMS.map((s, i) => (
              <tbody key={s.id} className="sys">
                <tr>
                  <th scope="colgroup" colSpan={3} className="pb-3 pt-9 text-left align-bottom">
                    <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ml-4 font-display text-xl font-light text-ink">{s.name}</span>
                    <span className="mt-1.5 block max-w-[54ch] text-sm font-normal leading-relaxed text-ink-soft">
                      {s.intro}
                    </span>
                  </th>
                </tr>

                {s.rows.map((r) => (
                  <tr key={r.item} className="sys-row border-b border-line-soft align-top">
                    <th scope="row" className="py-5 pr-6 text-left font-sans text-sm font-normal leading-snug text-ink">
                      {r.item}
                    </th>
                    <td className="max-w-[52ch] py-5 pr-6 text-sm leading-relaxed text-ink-soft">
                      {r.detail}
                    </td>
                    <td className="py-5">
                      {r.status === "Confirmed" ? (
                        <span className="mono inline-flex items-center rounded-full border border-brass/30 px-3 py-1.5 text-[0.56rem] tracking-[0.18em] text-brass-soft">
                          Confirmed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openEnquiry("Specifications")}
                          data-cursor="ASK"
                          aria-label={`On request — the published detail for ${r.item.toLowerCase()}, ${s.name}`}
                          className="mono group/req inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.56rem] tracking-[0.18em] text-ink-soft transition-colors duration-300 hover:border-brass/50 hover:text-brass focus-visible:border-brass focus-visible:text-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass/60"
                        >
                          On request
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
          Confirmed lines reflect the official {PROJECT.developer} listing · All specifications are
          subject to the finally approved plans and the builder–buyer agreement
        </p>
      </section>

      {/* the gated sheet */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid items-stretch gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-brass/25 bg-paper p-8 md:p-11">
            <div className="gold-glow pointer-events-none absolute -inset-16 [background:radial-gradient(30%_30%_at_80%_0%,rgba(201,168,106,0.14),transparent_70%)]" />
            <div className="relative">
              <p className="rise kicker">Detailed specification</p>
              <h2 className="rise mt-4 max-w-[17ch] font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
                Every line the listing{" "}
                <span className="font-serif italic text-brass">does not carry.</span>
              </h2>
              <p className="rise mt-5 max-w-[46ch] leading-relaxed text-ink-soft">
                The detailed schedule of finishes — makes, models, room-by-room materials,
                fitting brands, glazing and electrical provision — is issued to registered
                buyers as an official document rather than published on a web page. Ask for
                it and the private client team will send the current version, with the date
                it was issued and a note of anything still subject to approval.
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
                    Request the specification sheet
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
                Official documents only · No indicative finishes are circulated as fact
              </p>
            </div>
          </div>

          <figure className="sp-img-wrap relative min-h-[18rem] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="sp-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.arrival, 1400)}
                alt={`${PROJECT.name} — arrival court and entrance`}
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
        <div className="mb-[clamp(2rem,5vh,3.5rem)] flex items-baseline gap-5">
          <span className="idx">03</span>
          <span className="kicker">How to read a specification sheet</span>
        </div>

        <p className="mb-10 max-w-[58ch] leading-relaxed text-ink-soft">
          This applies to any developer, in any sector, at any price. A schedule of
          finishes is a legal document written in trade shorthand, and the shorthand is
          where the room for movement lives. Eight things worth knowing before you read
          one — ours included.
        </p>

        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {READING.map((r, i) => (
            <div key={r.t} className="read-card group border-b border-line py-6">
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {r.t}
              </h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{r.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[1.25rem] border border-line bg-cream p-7 md:p-9">
          <p className="kicker">Put it in writing</p>
          <p className="mt-4 max-w-[62ch] leading-relaxed text-ink-soft">
            If you take one habit from this page, take this one: whatever you are told
            about a finish, ask for it as a line in the annexed schedule. Verbal
            assurances about marble, brands, appliances or point counts survive exactly
            as long as the person who gave them. A dated document, signed by both parties
            and referenced in the agreement, survives the build. We will help you assemble
            that list for {PROJECT.name} and tell you plainly which items are settled and
            which are still subject to approval.
          </p>
        </div>
      </section>

      <RelatedPages links={["/residences", "/floor-plan", "/brochure", "/rera"]} />
      <CtaBand title="Request the full" accent="specification sheet." subject="Specifications" />
    </div>
  );
}
