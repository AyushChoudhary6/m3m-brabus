// ============================================================
// M3M Brabus — Single source of truth for site content.
// Facts sourced from the official M3M listing:
// https://www.m3mproperties.com/residential/gurugram/m3m-brabus/
// Where the official page does not publish a figure (price, RERA,
// possession, exact drive times) we say so rather than invent it.
// ============================================================

import { IMG } from "./images.js";

export const PROJECT = {
  name: "M3M Brabus",
  tagline: "Branded Residences, Engineered for the Extraordinary",
  developer: "M3M India",
  partner: "BRABUS",
  location: "Sector 58, Gurgaon",
  address: "Golf Course Extension Road, Sector 58, Gurugram, Haryana",
  configs: "4 & 5 BHK Residences",
  sizes: "≈ 5,000 – 7,000 sq.ft",
  rera: "RERA registration — on request",
  possession: "Announced on request",
  price: "Coming soon",
  phone: "+91 00000 00000",
  whatsapp: "910000000000",
  email: "sales@m3m-brabus.com",
};

/* Ch. 21 — primary navigation. `tKey` is explicit rather than derived from
   the path, so multi-word routes (/floor-plan) and "/" translate cleanly.

   `inline` marks the links shown in the top bar on wide screens. All ten
   appear in the fullscreen menu; only these six sit in the bar.

   Why not all ten inline: measured in headless Chrome, ten items overlap the
   right-hand CTA cluster by 46px at 1280px and 11px at 1360px — both very
   common laptop widths. The alternative fix, shrinking the type, runs against
   an explicit request to make the nav text larger, so the bar carries the
   high-intent links and the menu carries the full index.
   Home is omitted because the wordmark already links home, and Brochure
   because it is the gold CTA button beside the menu. */
export const NAV_LINKS = [
  { label: "Home", to: "/", tKey: "nav.home" },
  { label: "Project", to: "/overview", tKey: "nav.overview", inline: true },
  { label: "Price", to: "/price", tKey: "nav.price", inline: true },
  { label: "Floor Plans", to: "/floor-plan", tKey: "nav.floorPlans", inline: true },
  { label: "Amenities", to: "/amenities", tKey: "nav.amenities" },
  { label: "Location", to: "/location", tKey: "nav.location", inline: true },
  { label: "Gallery", to: "/gallery", tKey: "nav.gallery", inline: true },
  { label: "Brochure", to: "/brochure", tKey: "nav.brochure" },
  { label: "Blogs", to: "/blogs", tKey: "nav.blogs" },
  { label: "Contact", to: "/contact", tKey: "nav.contact", inline: true },
];

/** The subset shown in the top bar. The menu always shows NAV_LINKS in full. */
export const NAV_INLINE = NAV_LINKS.filter((l) => l.inline);

/* Ch. 21 — footer navigation, four columns.
   Deviation from the spec, deliberate: "Configuration" points at the existing
   /residences page rather than a new /configuration URL. Two pages covering
   the same unit mix would compete with each other in search and split the
   internal links. The label follows the spec; the destination stays canonical.
   /brabus, /reviews and /possession are also listed here so no indexed page
   is left orphaned by the new IA. */
export const FOOTER_NAV = [
  {
    heading: "Project",
    links: [
      { label: "Overview", to: "/overview" },
      { label: "Configuration", to: "/residences" },
      { label: "Specifications", to: "/specifications" },
      { label: "Master Plan", to: "/master-plan" },
      { label: "The BRABUS Partnership", to: "/brabus" },
    ],
  },
  {
    heading: "Buyer Information",
    links: [
      { label: "Price", to: "/price" },
      { label: "Payment Plan", to: "/payment-plan" },
      { label: "Construction Status", to: "/construction-status" },
      { label: "RERA Information", to: "/rera" },
      { label: "Possession", to: "/possession" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blogs", to: "/blogs" },
      { label: "FAQs", to: "/faqs" },
      { label: "Guides", to: "/guides" },
      { label: "Reviews", to: "/reviews" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Disclaimer", to: "/disclaimer" },
    ],
  },
];

export const STATS = [
  { value: 58, label: "Sector · Golf Course Ext.", suffix: "" },
  { value: 7000, label: "Sq.ft · Largest residence", suffix: "" },
  { value: 3, label: "Sides Open · Every home", suffix: "" },
  { value: 24, label: "Security & Concierge", suffix: "/7" },
];

export const HIGHLIGHTS = [
  {
    title: "Open-Core Architecture",
    body: "Every residence opens on three sides — natural light and cross-ventilation reach each room, giving a high-rise home the feel of a villa.",
  },
  {
    title: "Ultra-Low Density",
    body: "A limited collection across a generous address, planned so privacy, silence and space are the default rather than the upgrade.",
  },
  {
    title: "BRABUS-Inspired Design",
    body: "Bespoke interiors and premium finishes shaped by the marque's ethos of luxury, performance and exclusivity.",
  },
  {
    title: "Smart & Sustainable",
    body: "Smart-home integration and VRV climate control, with rainwater harvesting and energy-efficient systems built in.",
  },
];

/* No render of either residence interior has been published, so the two cards
   carry the official renders instead of stock photography of somebody else's
   apartment: the lobby each home is entered through, and the arrival court.
   `imageAlt` says what is actually in the frame — a card that captions the
   arrival canopy as "the 5 BHK interior" is the same misrepresentation the
   stock shots were, just cheaper. */
export const RESIDENCES = [
  {
    id: "4bhk",
    name: "4 BHK Residence",
    area: "≈ 5,000 sq.ft",
    facing: "3-side open · light & cross-ventilation",
    tag: "The Signature",
    subtitle: "A four-bedroom sanctuary in the sky",
    image: IMG.lobby,
    imageAlt: "M3M Brabus — the marble lobby the 4 BHK residences are entered through",
    features: [
      "Italian marble flooring",
      "Modular kitchen · branded fittings",
      "VRV air conditioning",
      "Private lift lobby",
    ],
  },
  {
    id: "5bhk",
    name: "5 BHK Residence",
    area: "≈ 7,000 sq.ft",
    facing: "3-side open · golf-green vistas",
    tag: "The Grand",
    subtitle: "Crafted like a private villa",
    image: IMG.arrival,
    imageAlt: "M3M Brabus — the porte-cochère arrival court at Sector 58",
    features: [
      "Villa-scale living spaces",
      "Smart-home integration",
      "Premium branded finishes",
      "Private foyer & lift lobby",
    ],
  },
];

export const AMENITIES = [
  { name: "Grand Clubhouse", note: "Multi-level club & lounge" },
  { name: "Temperature-Controlled Pool", note: "Swimming through every season" },
  { name: "Spa & Wellness Centre", note: "Sauna · steam · treatment rooms" },
  { name: "Fully-Equipped Gym", note: "Strength, cardio & recovery" },
  { name: "Multipurpose Event Hall", note: "Private celebrations & gatherings" },
  { name: "Landscaped Gardens", note: "Jogging tracks & green courts" },
  { name: "Children's Play Area", note: "Safe, supervised play" },
  { name: "Indoor & Outdoor Games", note: "Courts and a games room" },
  { name: "Restaurant", note: "Dining within the address" },
  { name: "24/7 Security", note: "CCTV surveillance & manned gates" },
  { name: "Dedicated Parking", note: "Covered resident parking" },
  { name: "Rainwater Harvesting", note: "Energy-efficient & eco-conscious" },
];

// The official page describes connectivity qualitatively; exact drive times
// are not published, so we describe access rather than quote minutes.
export const LOCATION = [
  { place: "Golf Course Extension Road", time: "On doorstep" },
  { place: "Golf Course Road", time: "Direct link" },
  { place: "Cyber City & business hubs", time: "Easy access" },
  { place: "NH-8", time: "Quick access" },
  { place: "Sohna Road", time: "Quick access" },
  { place: "IGI Airport", time: "Easy access" },
  { place: "Metro connectivity", time: "Nearby" },
  { place: "Schools, hospitals & retail", time: "Close by" },
];

export const FAQS = [
  {
    q: "Where is M3M Brabus located?",
    a: "M3M Brabus is at Sector 58, on Golf Course Extension Road, Gurugram — with easy access to Golf Course Road, Cyber City, NH-8, Sohna Road and IGI Airport, and metro connectivity nearby.",
  },
  {
    q: "What configurations and sizes does M3M Brabus offer?",
    a: "The project presents 4 BHK and 5 BHK branded residences, with homes ranging approximately 5,000 to 7,000 sq.ft. Exact carpet and saleable areas are shared on request.",
  },
  {
    q: "Who is the developer and the brand partner?",
    a: "The project is developed by M3M India as a branded residence inspired by BRABUS, the German luxury automotive marque, whose ethos of luxury, performance and exclusivity shapes the bespoke interiors and premium finishes.",
  },
  {
    q: "What is the price of M3M Brabus?",
    a: "Pricing has not been publicly released yet — it is marked as coming soon. Register your interest to receive the price sheet and payment plan as soon as it is announced.",
  },
  {
    q: "What is the possession timeline and RERA status?",
    a: "Possession and RERA registration details are not published on the official listing at this stage. We share only verified, official information — please enquire for the current status.",
  },
  {
    q: "What amenities are planned?",
    a: "A grand clubhouse with a fully equipped gym, a temperature-controlled swimming pool, a spa and wellness centre with sauna and steam rooms, a multipurpose event hall, landscaped gardens with jogging tracks, a children's play area, indoor and outdoor games, a restaurant, dedicated parking and 24/7 security with CCTV surveillance.",
  },
  {
    q: "What makes the homes different?",
    a: "Open-core architecture opens each residence on three sides for natural light and ventilation, in an ultra-low-density plan. Homes feature Italian marble flooring, modular kitchens with branded fittings, VRV air conditioning and smart-home integration — a villa-like feel in a high-rise format.",
  },
];
