// ============================================================
// Icon registry.
//
// Data files (facts.js, amenities.js) name their icon as a string, which means
// something has to turn that string into a component. The obvious way —
// `import * as Icons from "lucide-react"` — is a trap: a namespace import is
// not tree-shakeable, so it pulled the ENTIRE lucide set into the bundle
// (measured: a 617 kB chunk for ~20 icons in use).
//
// Naming each icon explicitly lets the bundler drop everything else. Add an
// icon here before referencing it by name in a data file.
// ============================================================
import {
  ArrowUpRight,
  BedDouble,
  Building2,
  CalendarClock,
  Cpu,
  Diamond,
  Dumbbell,
  Flower2,
  Gamepad2,
  IndianRupee,
  LandPlot,
  Landmark,
  Layers,
  MapPin,
  Maximize2,
  ShieldCheck,
  Sparkles,
  ToyBrick,
  Trees,
  Trophy,
  UtensilsCrossed,
  Waves,
} from "lucide-react";

const REGISTRY = {
  ArrowUpRight,
  BedDouble,
  Building2,
  CalendarClock,
  Cpu,
  Diamond,
  Dumbbell,
  Flower2,
  Gamepad2,
  IndianRupee,
  LandPlot,
  Landmark,
  Layers,
  MapPin,
  Maximize2,
  ShieldCheck,
  Sparkles,
  ToyBrick,
  Trees,
  Trophy,
  UtensilsCrossed,
  Waves,
};

/** Resolve a data-file icon name to a component; Diamond is the safe default. */
export const icon = (name) => REGISTRY[name] || REGISTRY.Diamond;

export default REGISTRY;
