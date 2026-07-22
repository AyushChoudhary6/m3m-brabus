import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "White Collar Realty CRM",
    short_name: "WCR CRM",
    // Neutral copy covering BOTH modules (Sales + HR recruitment), so the install
    // prompt doesn't read as Sales-only to HR users (audit #134).
    description: "Sales & HR Recruitment CRM for White Collar Realty — Dubai & India teams",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    // "any" so tablet users can rotate to landscape for the board/table (audit #135).
    orientation: "any",
    background_color: "#0b1a33",
    theme_color: "#0b1a33",
    categories: ["business", "productivity"],
    lang: "en",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "New Lead",   short_name: "New", url: "/leads/new", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "AI Assistant", short_name: "AI",  url: "/ai",      icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      // HR shortcuts so the installed app is useful to the recruitment team too (audit #133).
      { name: "New Candidate", short_name: "Candidate", url: "/hr/candidates/new", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "HR Board", short_name: "Board", url: "/hr/board", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
