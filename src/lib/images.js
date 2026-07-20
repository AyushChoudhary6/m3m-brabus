// ============================================================
// Imagery.
//
// The architectural shots are the OFFICIAL M3M Brabus renders, served
// locally from /public/renders. The interior + amenity shots are still
// indicative stock (Pexels, free commercial use) until official renders
// for those spaces are supplied — swap the ids below when they arrive.
// ============================================================

/**
 * Resolve an image source.
 * - a string starting with "/" is a local asset and is returned as-is
 * - a number is a Pexels photo id, built into a responsive CDN URL
 */
export const px = (id, w = 1200) =>
  typeof id === "string"
    ? id
    : `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&dpr=2`;

export const IMG = {
  // ---- Official M3M Brabus renders ----
  heroExterior: "/renders/tower.jpg",   // twin towers at dusk
  tower: "/renders/tower.jpg",
  arrival: "/renders/arrival.jpg",      // porte-cochère / entrance
  facade: "/renders/arrival.jpg",
  lobby: "/renders/lobby.jpg",          // BRABUS marble lobby
  lobbyWarm: "/renders/lobby.jpg",

  // ---- Indicative stock (awaiting official interior renders) ----
  livingRoom: 6588599,      // modern apartment living room
  duplexLiving: 28729467,   // luxurious duplex living room
  bedroom: 31737843,        // modern luxury bedroom
  bedroomDecor: 33837741,   // luxury bedroom modern decor
  spa: 7031704,             // modern luxury spa zone
  pool: 6667430,            // luxury indoor pool
  gym: 29392546,            // dark modern gym
};
