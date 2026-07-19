// ============================================================
// Curated stock photography (Pexels — free commercial use, no
// attribution required). All IDs verified live. Swap these for
// official M3M Brabus renders when available.
// ============================================================

/** Build a responsive Pexels CDN URL at a given width. */
export const px = (id, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&dpr=2`;

export const IMG = {
  heroExterior: 944007,     // low-angle high-rise
  facade: 22604447,         // apartment facade with balconies
  tower: 1662159,           // clean high-rise
  lobby: 6758532,           // luxury hotel lobby
  lobbyWarm: 31080809,      // elegant warm lobby
  livingRoom: 6588599,      // modern apartment living room
  duplexLiving: 28729467,   // luxurious duplex living room
  bedroom: 31737843,        // modern luxury bedroom
  bedroomDecor: 33837741,   // luxury bedroom modern decor
  spa: 7031704,             // modern luxury spa zone
  pool: 6667430,            // luxury indoor pool
  gym: 29392546,            // dark modern gym
};
