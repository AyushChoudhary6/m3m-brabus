// ============================================================
// M3M Brabus — amenities, grouped by category (Ch. 29).
//
// site.js holds the flat list of twelve amenities the official listing
// names. A flat list reads as a specification sheet; a buyer thinks in
// occasions — a swim, a party, somewhere for the children, who is at the
// gate. This file re-cuts the same twelve into the categories a visitor
// actually scans by, and adds nothing that isn't already stated.
//
// PROVENANCE — every item below traces to one of two places:
//   "listing"    the official M3M Brabus listing (see facts.js, OFFICIAL_SOURCE)
//   "highlights" the project highlights / residence specification in site.js
// Nothing was invented to round out a category. Where a category is thinner
// than a buyer expects, it carries a `gated` entry that says plainly what is
// not published and offers to send it — an unknown is a conversation, not a
// blank. Categories the sources cannot support at all simply do not exist
// here (there is no "Concierge", because none has been announced).
// ============================================================

import { IMG } from "./images.js";

/**
 * @typedef {object} AmenityItem
 * @property {string} name
 * @property {string} note      one line, what it actually is
 * @property {"listing"|"highlights"} source
 *
 * @typedef {object} AmenityCategory
 * @property {string}  id
 * @property {string}  label
 * @property {string}  icon     lucide-react export name
 * @property {string}  lede     the category in a sentence
 * @property {string|null} image  one of the three renders that exist, or null
 * @property {string}  [imageAlt]
 * @property {AmenityItem[]} items
 * @property {{note:string,cta:string,subject:string}} [gated]  what isn't published
 */
export const AMENITY_CATEGORIES = [
  {
    id: "clubhouse",
    label: "Clubhouse",
    icon: "Landmark",
    lede: "The grand clubhouse is the centre of the address — the room you pass through on the way to everything else.",
    image: IMG.lobby,
    imageAlt: "M3M Brabus — the marble lobby leading through to the clubhouse",
    items: [
      { name: "Grand Clubhouse", note: "A multi-level club and lounge reserved for residents", source: "listing" },
      { name: "Fully-Equipped Gym", note: "Strength, cardio and recovery, within the clubhouse", source: "listing" },
    ],
    gated: {
      note: "The clubhouse area and its floor-by-floor plan are not published on the official listing.",
      cta: "Ask for the clubhouse plan",
      subject: "Amenities · Clubhouse",
    },
  },
  {
    id: "wellness",
    label: "Wellness",
    icon: "Waves",
    lede: "Water, heat and quiet — the three things a house of this size is usually missing.",
    image: null,
    items: [
      { name: "Temperature-Controlled Pool", note: "Swimming through every season, not only the kind ones", source: "listing" },
      { name: "Spa & Wellness Centre", note: "Treatment rooms for the unhurried hour", source: "listing" },
      { name: "Sauna & Steam Rooms", note: "Dry heat and wet, adjoining the spa", source: "listing" },
    ],
  },
  {
    id: "sports",
    label: "Sports",
    icon: "Trophy",
    lede: "Somewhere to compete, indoors and out, without leaving the gates.",
    image: null,
    items: [
      { name: "Indoor & Outdoor Games", note: "Courts outside and a games room within", source: "listing" },
      { name: "Jogging Track", note: "A run laid through the landscaped grounds", source: "listing" },
    ],
    gated: {
      // The listing says "indoor & outdoor games" and stops there. Naming a
      // tennis court or a squash box would be us writing the brief for M3M.
      note: "Which court sports are planned — tennis, squash, badminton — is not named on the official listing.",
      cta: "Ask which courts are planned",
      subject: "Amenities · Sports",
    },
  },
  {
    id: "kids",
    label: "Kids",
    icon: "ToyBrick",
    lede: "A ground given to the children, inside the security line rather than beyond it.",
    image: null,
    items: [
      { name: "Children's Play Area", note: "Safe, supervised play within the estate", source: "listing" },
    ],
    gated: {
      note: "A crèche, day-care or children's club has not been announced, so none is listed here.",
      cta: "Ask about family facilities",
      subject: "Amenities · Kids",
    },
  },
  {
    id: "outdoor",
    label: "Outdoor",
    icon: "Trees",
    lede: "The green between the buildings — the part of a low-density plan you feel first.",
    image: IMG.tower,
    imageAlt: "M3M Brabus — the towers above the landscaped grounds at dusk",
    items: [
      { name: "Landscaped Gardens", note: "Planting laid across the estate, not around its edges", source: "listing" },
      { name: "Green Courts", note: "Open lawns held between the built form", source: "listing" },
    ],
    gated: {
      note: "Total land area and the percentage kept as open space are not published on the official listing.",
      cta: "Request the site details",
      subject: "Amenities · Open space",
    },
  },
  {
    id: "security",
    label: "Security",
    icon: "ShieldCheck",
    lede: "Manned, watched and covered — the arrangements you should never have to think about.",
    image: IMG.arrival,
    imageAlt: "M3M Brabus — the gated arrival court and porte-cochère",
    items: [
      { name: "24/7 Security", note: "Manned gates with CCTV surveillance throughout", source: "listing" },
      { name: "Dedicated Parking", note: "Covered parking allotted to each residence", source: "listing" },
    ],
  },
  {
    id: "smart-living",
    label: "Smart Living",
    icon: "Cpu",
    lede: "What is published under this heading is in-residence, not estate-wide: smart-home integration and VRV climate control, with rainwater harvesting and energy-efficient systems built in.",
    image: null,
    items: [
      { name: "Smart-Home Integration", note: "Specified within the residence", source: "highlights" },
      { name: "VRV Climate Control", note: "Zoned air conditioning through the home", source: "highlights" },
      { name: "Rainwater Harvesting", note: "Estate-wide, per the official listing", source: "listing" },
      { name: "Energy-Efficient Systems", note: "Stated as built in, without figures attached", source: "highlights" },
    ],
    gated: {
      // Deliberately blunt. Every branded scheme in Gurgaon claims an app;
      // this one has not, and we are not going to draft one on its behalf.
      note: "No resident app, building-management platform or digital concierge has been announced. The two smart systems above are the ones actually specified.",
      cta: "Ask what is automated",
      subject: "Amenities · Smart living",
    },
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    icon: "UtensilsCrossed",
    lede: "Dining and occasion — the rooms you borrow when the house is not the right size for the evening.",
    image: null,
    items: [
      { name: "Restaurant", note: "Dining within the address", source: "listing" },
      { name: "Multipurpose Event Hall", note: "Private celebrations and gatherings at scale", source: "listing" },
    ],
    gated: {
      note: "A screening room, business lounge or valet service is not part of the published amenity set.",
      cta: "Ask what else is planned",
      subject: "Amenities · Lifestyle",
    },
  },
];

/** Flat index of every amenity name — used for the always-visible summary. */
export const AMENITY_INDEX = AMENITY_CATEGORIES.flatMap((c) =>
  c.items.map((i) => i.name),
);

export const AMENITY_COUNT = AMENITY_INDEX.length;

/** Convenience lookup by id. */
export const AMENITY_CATEGORY = Object.fromEntries(
  AMENITY_CATEGORIES.map((c) => [c.id, c]),
);
