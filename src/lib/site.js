// ============================================================
// M3M Brabus — Single source of truth for site content.
// Verify all figures against the official RERA listing / brochure
// before going live. Placeholders are marked "on request".
// ============================================================

export const PROJECT = {
  name: "M3M Brabus",
  tagline: "Branded Residences, Engineered for the Extraordinary",
  developer: "M3M India",
  partner: "BRABUS",
  location: "Sector 58, Gurgaon",
  address: "Golf Course Extension Road, Sector 58, Gurugram, Haryana",
  configs: "4 & 5 BHK Residences",
  rera: "RERA registration — on request",
  possession: "On request",
  price: "On request",
  phone: "+91 00000 00000",
  whatsapp: "910000000000",
  email: "sales@m3m-brabus.com",
};

export const NAV_LINKS = [
  { label: "Overview", to: "/overview" },
  { label: "Residences", to: "/residences" },
  { label: "BRABUS", to: "/brabus" },
  { label: "Amenities", to: "/amenities" },
  { label: "Location", to: "/location" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
];

export const STATS = [
  { value: 58, label: "Sector · GCE Road", suffix: "" },
  { value: 2, label: "Homes Per Core", suffix: "" },
  { value: 100, label: "Natural Light", suffix: "%" },
  { value: 5, label: "Star Concierge", suffix: "★" },
];

export const HIGHLIGHTS = [
  {
    title: "Open-Core Architecture",
    body: "Only two residences per core and a three-side-open form — every home breathes with cross-ventilation and uninterrupted light.",
  },
  {
    title: "Ultra-Low Density",
    body: "A limited collection of residences across a sprawling address, engineered for privacy, silence and space.",
  },
  {
    title: "Private Arrival",
    body: "Dedicated lift lobbies and porte-cochère arrival — a sequence choreographed like a marque unveiling.",
  },
  {
    title: "Intelligent Living",
    body: "IoT and AI-assisted home automation, climate, lighting and security — performance you command with a touch.",
  },
];

export const RESIDENCES = [
  {
    id: "4bhk",
    name: "4 BHK Residence",
    area: "On request",
    facing: "3-side open · green & city vistas",
    tag: "The Signature",
    subtitle: "A four-bedroom sanctuary in the sky",
    image: 28729467,
    features: ["Private lift lobby", "Double-height living", "Chef & family kitchens", "Wellness suite"],
  },
  {
    id: "5bhk",
    name: "5 BHK Residence",
    area: "On request",
    facing: "3-side open · golf-green vistas",
    tag: "The Grand",
    subtitle: "Crafted like a private villa",
    image: 31737843,
    features: ["Private foyer", "Sky lounge", "Staff quarters", "Panoramic terrace"],
  },
];

export const AMENITIES = [
  { name: "The BRABUS Club", note: "Multi-level clubhouse & lounge" },
  { name: "Olympic Pool", note: "Temperature-controlled" },
  { name: "Signature Spa", note: "Hammam · sauna · treatment suites" },
  { name: "Performance Gym", note: "Precision fitness & recovery" },
  { name: "Sky Lounges", note: "Elevated social decks" },
  { name: "Concierge", note: "24/7 five-star service" },
  { name: "Private Theatre", note: "Screening & amphitheatre" },
  { name: "Racquet Courts", note: "Tennis · badminton · squash" },
];

export const LOCATION = [
  { place: "Rapid Metro Station", time: "< 2 min" },
  { place: "Golf Course Extension Road", time: "On doorstep" },
  { place: "Cyber Hub / Cyber City", time: "~ 25 min" },
  { place: "IGI Airport", time: "~ 30 min" },
  { place: "Leading Hospitals & Schools", time: "5–10 min" },
  { place: "Diplomatic Enclave", time: "~ 15 min" },
];

export const FAQS = [
  {
    q: "Where is M3M Brabus located?",
    a: "M3M Brabus is at Sector 58, on Golf Course Extension Road, Gurugram — one of the city's most established ultra-luxury corridors, with the Rapid Metro moments away.",
  },
  {
    q: "What configurations does M3M Brabus offer?",
    a: "M3M Brabus presents 4 BHK and 5 BHK branded residences, designed for ultra-low-density living with only two homes per core.",
  },
  {
    q: "Who is the developer and the brand partner?",
    a: "The project is developed by M3M India in partnership with BRABUS, the German automotive luxury marque, whose design language shapes the residences.",
  },
  {
    q: "What is the price of M3M Brabus?",
    a: "Pricing is available on request as the collection is limited. Register your interest to receive the detailed price sheet and payment plan.",
  },
  {
    q: "What is the possession timeline and RERA status?",
    a: "Possession and RERA registration details are shared on request. We provide only verified, official information — please enquire for the current status.",
  },
];
