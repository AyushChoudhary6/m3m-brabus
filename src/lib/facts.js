// ============================================================
// M3M Brabus — verified project facts.
//
// GROUND RULE: a figure appears here ONLY if the official M3M listing
// states it. Everything else carries `value: null`, which the UI renders
// as a gated "on request" CTA rather than a number. Never fill a null
// with an estimate, a portal listing, or general knowledge — the whole
// point of this file is that the site cannot accidentally fabricate.
//
// Source of truth (re-verified 20 Jul 2026):
//   https://www.m3mproperties.com/residential/gurugram/m3m-brabus/
//
// What that page does NOT publish, as of the last check:
//   starting price · RERA number · land area · tower count · floor count
//   clubhouse size · open-space % · carpet areas · any Penthouse unit
// ============================================================

export const OFFICIAL_SOURCE =
  "https://www.m3mproperties.com/residential/gurugram/m3m-brabus/";

/**
 * Ch. 25 — Project Highlights. Order matters; this drives the homepage
 * highlight grid, the specifications page and the hero fact strip.
 *
 * @typedef {object} Fact
 * @property {string}      key      stable id, also used for analytics labels
 * @property {string}      label    short caption under the icon
 * @property {string|null} value    null ⇒ not published ⇒ render the CTA
 * @property {string}      icon     lucide-react icon name
 * @property {string}      [cta]    button copy when value is null
 * @property {string}      [note]   honest qualifier shown beneath the value
 */
export const PROJECT_FACTS = [
  {
    key: "location",
    label: "Location",
    value: "Sector 58, Golf Course Extension Road, Gurugram",
    icon: "MapPin",
  },
  {
    key: "configs",
    label: "Apartment Types",
    value: "4 & 5 BHK Residences",
    icon: "BedDouble",
  },
  {
    key: "sizes",
    label: "Sizes",
    value: "≈ 5,000 – 7,000 sq.ft",
    icon: "Maximize2",
    note: "Total area as published. Carpet areas are shared on request.",
  },
  {
    key: "clubhouse",
    label: "Clubhouse",
    value: "Grand clubhouse with fully equipped gym",
    icon: "Sparkles",
  },
  {
    key: "landArea",
    label: "Land Area",
    value: null,
    icon: "LandPlot",
    cta: "Request details",
  },
  {
    key: "towers",
    label: "Towers",
    value: null,
    icon: "Building2",
    cta: "Request details",
  },
  {
    key: "floors",
    label: "Floors",
    value: null,
    icon: "Layers",
    cta: "Request details",
  },
  {
    key: "openSpace",
    label: "Open Space",
    value: null,
    icon: "Trees",
    cta: "Request details",
  },
  {
    key: "possession",
    label: "Possession",
    value: null,
    icon: "CalendarClock",
    cta: "Get possession update",
    note: 'The official listing states only that possession is "expected in the coming years".',
  },
  {
    key: "rera",
    label: "RERA Status",
    value: null,
    icon: "ShieldCheck",
    cta: "Get RERA status",
    note: "No RERA registration number is published on the official listing yet.",
  },
];

/** Convenience lookup: PROJECT_FACT.price, PROJECT_FACT.rera, … */
export const PROJECT_FACT = Object.fromEntries(
  PROJECT_FACTS.map((f) => [f.key, f]),
);

/** Starting price is quoted separately — it drives the hero and price page. */
export const PRICE = {
  key: "price",
  label: "Starting Price",
  value: null, // not published on the official listing
  icon: "IndianRupee",
  cta: "Request price",
  note: "Pricing has not been publicly released. Register to receive it the moment it is announced.",
};

/**
 * Ch. 26 — Configuration table. Two rows only: the official listing names
 * 4 BHK and 5 BHK and no Penthouse, so no Penthouse row exists here.
 * `carpet: null` renders as "On request", never as a guessed number.
 * `status: null` likewise — the official listing publishes no inventory or
 * availability position, so we ask rather than assert one.
 * `features` are indicative marketing descriptors carried over from the
 * residence copy, NOT figures published by M3M. Never attribute them to the
 * official listing in UI copy.
 */
export const CONFIGURATIONS = [
  {
    id: "4bhk",
    config: "4 BHK",
    size: "≈ 5,000 sq.ft",
    carpet: null,
    features: "3-side open · private lift lobby · Italian marble · VRV climate control",
    status: null,
  },
  {
    id: "5bhk",
    config: "5 BHK",
    size: "≈ 7,000 sq.ft",
    carpet: null,
    features: "Villa-scale living · smart-home integration · private foyer · golf-green vistas",
    status: null,
  },
];

/** True when every published figure is present — used to hide empty UI. */
export const hasValue = (fact) => Boolean(fact && fact.value);
