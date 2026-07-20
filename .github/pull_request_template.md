<!-- Keep this short. Delete the sections that do not apply. -->

## What changed, and why

<!-- One or two sentences. The "why" is the part review cannot reconstruct. -->

## Facts discipline

The site's one non-negotiable rule: nothing appears on a page unless the
official M3M listing publishes it. `src/lib/facts.js` is the single source of
truth; anything unpublished stays `null` and renders as a request-CTA.

- [ ] **No unverified figures added.** No price, RERA registration number,
      possession date or quarter, land area, tower or floor count, carpet
      area, clubhouse size or open-space percentage — none of these are
      published by M3M.
- [ ] No Penthouse, duplex or other typology beyond the published 4 & 5 BHK.
- [ ] Any new number traces to `facts.js`, and `facts.js` traces to the
      official listing with the date it was re-read.
- [ ] CI's fabrication guard passed (it greps the built HTML, including
      JSON-LD and meta tags — do not work around it, fix the copy).

## Build & prerender

- [ ] `npm run build:static` succeeds locally, or CI's build job is green.
- [ ] Prerender still emits one HTML file per route in `scripts/routes.mjs`
      (currently **30**) — no route lost, none silently unrendered.
- [ ] New routes were added to `scripts/routes.mjs`, so the prerenderer and
      the sitemap stay in step.
- [ ] Every page still has exactly **one** `<link rel="canonical">`, pointing
      at its own path. (This regressed once; CI now asserts it.)
- [ ] Page titles are unique, and internal links all resolve.

## Copy

- [ ] Editorial, restrained, British-leaning — matches the house voice.
- [ ] Claims are hedged where the underlying fact is unpublished.
- [ ] Comments explain **why**, not what.

## Checked by hand

<!-- CI has no unit tests and no type checking; it cannot cover these.
     Say what you actually opened and clicked. -->

- [ ] Viewed on a phone-width viewport.
- [ ] The lead form submits and the row lands in the Sheet (if forms touched).
- [ ] No console errors on first paint — anything that throws before mount
      corrupts that route's prerendered HTML.

## Screenshots

<!-- Before / after for anything visual. -->
