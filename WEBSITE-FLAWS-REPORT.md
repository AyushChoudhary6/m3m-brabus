# M3M Brabus — Website Flaws Report

**Date:** 24 July 2026
**Scope:** Full codebase — frontend (`src/`), backend (`server/`), serverless relay (`api/`), build/deploy config, and shipped assets.
**Method:** Five parallel code audits (frontend correctness, backend & security, SEO & accessibility, performance & assets, content & data integrity). Every finding was verified by reading the actual code, asset bytes, or build output — not inferred. Live-site claims were checked against `https://m3m-brabus.vercel.app`.

---

## Executive summary

The engineering is, on the whole, disciplined: the lead-capture and gating flow is correct, the site deliberately refuses to invent unpublished figures, SEO is strong per-page, the hero-video loading strategy is excellent, and the OAuth relay is properly hardened. **No critical *code* defect was found.** The real risks cluster in three places:

1. **Shipped content is placeholder or wrong** — the brochure PDF, both floor-plan drawings, and every phone/WhatsApp/email link are non-final. These are the most damaging because they are buyer-facing and, for the floor plans, legally exposed.
2. **A few real backend-security gaps** — a rate-limit bypass, spreadsheet-formula injection, and no server-side spam gate.
3. **Front-load performance** — a bundling misconfiguration silently defeats the brochure's lazy-load, and several large images ship without modern formats.

| Severity | Count | Nature |
|---|---|---|
| 🔴 Critical | 3 | Wrong/misleading floor-plan assets; bundling defeats lazy PDF load |
| 🟠 High | 6 | Placeholder brochure & contact data; live DB creds on disk; rate-limit bypass; heavy first-load JS; unoptimised images; soft-404 |
| 🟡 Medium | 11 | CORS 500s; formula injection; no server spam gate; analytics double-count; a11y focus traps; meta-description issues |
| ⚪ Low | 17 | Dead code, stale comments, minor a11y/SEO/config nits |

**The single most impactful *code* fix** is splitting `pdfjs-dist` + `page-flip` out of the eager `vendor` chunk (C3) — it recovers ~110 KB gzip of first-load JS for every visitor. **The most impactful *content* fixes** are the two floor plans (C1, C2) — they are the only items with genuine legal exposure.

---

## 🔴 Critical

### C1 — The "4 BHK" floor plan is a different project's 3-BHK drawing, contradicting the site's own headline
- **Asset:** `public/renders/floor-plan-4bhk.jpg` (+ `-preview.jpg`), wired in [FloorPlan.jsx:48-49](src/components/sections/FloorPlan.jsx#L48)
- **What's wrong:** The image itself is titled **"UNIT- A [3B 3T UNIT]"** and prints **"Super built-up area 1792 SFT / 166.52 SQM, Carpet Area 1204 SFT / 111.85 SQM"** — a 3-bedroom, ~1,792 sq.ft unit from another, much smaller project.
- **Why it matters:** The entire site sells M3M Brabus as **4 & 5 BHK, ≈5,000–7,000 sq.ft** ([site.js:19-20](src/lib/site.js#L19)). A buyer who fills the lead form to unlock this "4 BHK" plan is shown a 3 BHK of 1,204 sq.ft carpet — contradicting the headline config *and* the site's own claim ([facts.js:161](src/lib/facts.js#L161)) that carpet area is unpublished. This is buyer-misleading and carries real RERA-advertising / misrepresentation exposure. It is also gated behind lead capture, so it is presented as *the* authentic plan.

### C2 — The "5 BHK" floor plan is unverified third-party artwork
- **Asset:** `public/renders/floor-plan-5bhk.jpg` (+ `-preview.jpg`), [FloorPlan.jsx:69-70](src/components/sections/FloorPlan.jsx#L69)
- **What's wrong:** Shows an "ARCHITECTURAL FEATURE" layout with library/wardrobe callouts and a servant/utility wing — no M3M Brabus branding, styling inconsistent with the (already-wrong) 4 BHK sheet. It cannot be verified as an M3M Brabus 5 BHK plan.
- **Why it matters:** Same as C1 — gated behind the lead form and presented as the project's authentic plan. Note both files are PNGs saved with a `.jpg` extension (cosmetic), and the page copy at [FloorPlan.jsx:24-28](src/components/sections/FloorPlan.jsx#L24) claims "no square footage is printed against a single room" — true of the SVG overlay, false of the raster underneath, which prints area figures.
- **Action:** Client must supply genuine M3M Brabus 4 & 5 BHK drawings. Until then, do not present these as authentic plans.

### C3 — Bundling defeats the brochure's lazy load; ~400 KB of PDF code ships to every visitor
- **Files:** [vite.config.js](vite.config.js) (`VENDOR_GROUPS` catch-all), [BrochureBook.jsx:140-144](src/components/ui/BrochureBook.jsx#L140)
- **What's wrong:** `BrochureBook.jsx` correctly `import()`s `pdfjs-dist` and `page-flip` lazily so non-brochure visitors never pay for them. But the Rolldown `codeSplitting.groups` config has a priority-10 catch-all (`test: /node_modules/`, name `vendor`) that pulls **both** libraries into the shared `vendor` chunk. Confirmed: `GlobalWorkerOptions`/`PageFlip` strings are inside `dist/assets/vendor-*.js`, and `dist/index.html` `modulepreload`s that chunk on first paint.
- **Why it matters:** The `vendor` chunk is **469 KB raw / 135 KB gzip**, most of it pdfjs, and it is preloaded on the homepage. The lazy boundary buys nothing — ~**400 KB raw / ~110 KB gzip** of PDF/book-flip code is downloaded and parsed by every visitor, most of whom never open the brochure. Inflates TBT/TTI on the LCP route.
- **Fix:** Give `pdfjs-dist` and `page-flip` their own groups (as `leaflet` already has) or exclude them from the catch-all, so Rolldown keeps them async.

---

## 🟠 High

### H1 — The downloadable brochure is an SEO placeholder, not a brochure
- **Asset:** `public/brochure/M3M-Brabus-Brochure.pdf` (297 KB, 3 pages), served at [Enquiry.jsx:21](src/components/ui/Enquiry.jsx#L21)
- **What's wrong:** PDF metadata reads `/Title (seo_ref.html)`, `/Creator (…HeadlessChrome/150…)`, `/Producer (Skia/PDF m150)` — an internal HTML page printed to PDF by headless Chrome, not a designed brochure.
- **Why it matters:** [BrochurePage.jsx](src/pages/BrochurePage.jsx) promises floor plans, specs, amenities and location inside. A lead who submits their details receives a placeholder. Undercuts the "we only share verified material" positioning.

### H2 — Placeholder contact details ship site-wide — every call/WhatsApp/email CTA is dead
- **Files:** [site.js:24-26](src/lib/site.js#L24) (`phone: "+91 00000 00000"`, `whatsapp: "910000000000"`, `email: "sales@m3m-brabus.com"`); duplicated in [contact.md:2-4](src/content/settings/contact.md#L2)
- **What's wrong:** These feed **every** `tel:`, `wa.me` and `mailto:` link — consumed in ~24 files (Footer, Navbar, MobileCTA, CtaBand, WhatsAppFloat, Contact, Enquiry, `whatsapp.js`, …).
- **Why it matters:** A lead-capture site whose primary conversion action dials `+91 00000 00000`. Every phone/WhatsApp CTA is non-functional; the sales mailbox is unverified for deliverability.

### H3 — Live Neon Postgres credentials sit in `server/.env` on disk
- **File:** `server/.env:5` (`DATABASE_URL` with inline password), `:8` (`GOOGLE_SCRIPT_URL`)
- **What's wrong:** A real, working production DB credential in plaintext on disk. It is **gitignored and not committed** (verified — no history hits), but nothing enforces that at commit time; one `git add -f`, backup, or shared folder leaks full read/write DB access.
- **Why it matters:** Because it was in active use, treat it as already-exposed. **Rotate the Neon password**; keep the value only in the Render dashboard (`render.yaml` already uses `sync: false`).

### H4 — Rate-limit bypass via spoofed `X-Forwarded-For`
- **Files:** [requestContext.js:16-20](server/src/middlewares/requestContext.js#L16) sets `req.clientIp` from the *first* `X-Forwarded-For` token; [rateLimiter.js:18](server/src/middlewares/rateLimiter.js#L18) keys on it.
- **What's wrong:** `app.set("trust proxy", 1)` tells Express to trust one hop, but the limiter ignores Express's vetted `req.ip` and reads the raw header's first element — which is attacker-controlled (proxies *append* the real IP after the client value).
- **Why it matters:** Rotating a fake IP per request fully bypasses the 30-per-15-min throttle → unlimited spam rows into Neon and unbounded Apps Script/Sheets quota burn. The same spoofable value is written to `leads.ip_address`, poisoning audit data. **Fix:** key on `req.ip` with `trust proxy` set correctly for Render.

### H5 — 16 lifestyle renders ship without AVIF and without responsive widths
- **Files:** [images.js](src/lib/images.js) (`L()` helper), [Media.jsx](src/components/ui/Media.jsx), `public/renders/lifestyle/`
- **What's wrong:** Only the 3 official renders (tower/arrival/lobby) have generated AVIF+WebP derivatives + a manifest entry. The 16 lifestyle images have **no `gen/` derivatives and no manifest entry**, so `Media.jsx` falls back to a single full-size `.webp` — no AVIF, no `srcSet`, no real `sizes`.
- **Why it matters:** A phone downloads the full-resolution image regardless of viewport (95–347 KB each; `entrance-signage-wall.webp` = 347 KB). Across ~20 files this is large wasted mobile bytes and slower LCP where a lifestyle image is the hero. **Fix:** run the image generator over `renders/lifestyle/`. (~250 KB recoverable per above-fold image on mobile.)

### H6 — Floor-plan drawings are 1.5–1.6 MB raw JPEG with no WebP/AVIF
- **Files:** `public/renders/floor-plan-4bhk.jpg` (1.55 MB), `floor-plan-5bhk.jpg` (1.6 MB); rendered as a plain `<img>` at [FloorPlan.jsx:217](src/components/sections/FloorPlan.jsx#L217) & `:506`, not via `Media`.
- **What's wrong:** Gating is good (locked users get the ~100 KB preview), but when unlocked the full plan is served as raw JPEG with no modern format or responsive sizing.
- **Why it matters:** ~3.1 MB of JPEG to an unlocked visitor who views both plans; each would be ~250–400 KB as WebP. (Moot until the correct plans exist per C1/C2 — fix format when replacing the assets.)

### H7 — Main app chunk is 599 KB (176 KB gzip), eager on every route
- **File:** `dist/assets/index-*.js` (entry, modulepreloaded)
- **What's wrong:** Shared app code (App + Home + shared UI/sections). Route-level `React.lazy` is correctly in place for all 29 non-home pages, so this is first-paint-necessary, but large.
- **Why it matters:** First-load JS preloaded by `dist/index.html` totals ~1.45 MB raw / ~440 KB gzip (`index` 599 + `vendor` 469 + `react` 231 + `gsap` 133 + `icons` 15) before any route content. Fixing C3 removes the biggest slice; the rest is a candidate for further splitting.

### H8 — Soft-404: unknown URLs return HTTP 200 serving the prerendered home page
- **Files:** [vercel.json:10-11](vercel.json#L10) rewrites any extension-less path to `/index.html`; [NotFound.jsx:21-27](src/pages/NotFound.jsx#L21) acknowledges it.
- **What's wrong:** The `NotFound` component and its `noindex` only exist after JS runs. A non-JS crawler hitting any mistyped/stale URL receives the fully prerendered **home page** (200) with the home canonical.
- **Why it matters:** Google sees unlimited bad URLs all serving duplicate home content with no 404 signal — classic soft-404 / index bloat. A true fix needs host-level 404 handling (a limitation of static SPA hosting).

---

## 🟡 Medium

### M1 — CORS rejects by throwing → 500 with no `Access-Control-Allow-Origin`
- **Files:** [app.js:38-45](server/src/app.js#L38) (origin callback does `cb(new Error(...))`), lands as a 500 in [errorHandler.js:19-35](server/src/middlewares/errorHandler.js#L19); allowlist is a single origin in [render.yaml:32-33](render.yaml#L32).
- **Why:** Throwing produces a 500 with no ACAO header — the "submission failed with an opaque CORS error" class. Any legitimate-but-unlisted origin (Vercel preview deploys `m3m-brabus-git-*.vercel.app`, a `www.` host, a future custom domain) hits a 500, and it spams the error log for every bot probe. The moment the site moves to a real domain, live submissions break again. **Fix:** `cb(null, false)` (clean deny) + an env-driven multi-origin list.

### M2 — No server-side honeypot / spam enforcement; direct API POST bypasses all bot defense
- **Files:** [lead.service.js:55-56](server/src/services/lead.service.js#L55) records but doesn't act on spam signals; honeypot/spam gating lives only client-side in [leads.js](src/lib/leads.js) / `spam.js`.
- **Why:** Anyone can `POST /api/leads` directly, skipping the client honeypot/spam screen. The server accepts any well-formed lead, subject only to the (bypassable — H4) rate limiter → automated spam into Neon and the owner's Sheet. **Fix:** reject on a filled honeypot field and/or implausible `fillMs` server-side.

### M3 — Google Sheets formula/CSV injection via unsanitized forwarded body
- **Files:** [lead.service.js:77](server/src/services/lead.service.js#L77) forwards `rawBody` as `extra`; [googleSheets.service.js:31-34](server/src/services/googleSheets.service.js#L31) spreads the entire raw body (`...extra`); [sanitize.js:15-22](server/src/utils/sanitize.js#L15) doesn't neutralize leading `= + - @`.
- **Why:** (1) The raw body is forwarded wholesale → an attacker can inject arbitrary columns into the owner's sheet. (2) A value like `=HYPERLINK("http://evil","click")` or `=IMPORTXML(...)` executes as a live formula when the owner opens the sheet — phishing/exfiltration from the owner's Google account context. **Fix:** forward only a known field allow-list, and prefix any cell starting with `= + - @` with a quote.

### M4 — Mobile brochure taps double-count (and false-count) the conversion metric
- **File:** [MobileCTA.jsx:75](src/components/MobileCTA.jsx#L75) fires `trackBrochure("mobile_bar")` on click, before any lead; the modal fires it again on submit ([Enquiry.jsx:284](src/components/ui/Enquiry.jsx#L284)).
- **Why:** Every mobile brochure tap counts as a `brochure_download` conversion even if the form is never filled, and a completed one counts twice. Contradicts the documented decision at [Contact.jsx:107-113](src/pages/Contact.jsx#L107) that Navbar/Hero/Contact/ThankYou all follow. Inflated/doubled metric from the mobile bar only. **Fix:** drop the click-time call.

### M5 — LivingMap (Leaflet) initialises on homepage mount, not on scroll
- **Files:** [Home.jsx:23,57-59](src/pages/Home.jsx#L57), [LivingMap.jsx](src/components/sections/LivingMap.jsx)
- **Why:** `React.lazy` keeps the 148 KB leaflet chunk out of the entry (good), but the component renders unconditionally, so the chunk fetches and the map `useEffect` fires (map init + CARTO tile requests) as soon as Home mounts — the map sits well below the fold, and the code comment claiming otherwise is inaccurate. ~163 KB JS/CSS + tiles compete with real homepage content. **Fix:** gate the mount behind an IntersectionObserver.

### M6 — Single 263 KB render-blocking stylesheet
- **File:** `dist/assets/index-*.css` (263 KB raw, ~30 KB gzip)
- **Why:** `cssCodeSplit` is on but there's one entry, so the whole Tailwind output is one render-blocking file on every page. Low-ish but on the critical path.

### M7 — 103 MB master video is copied into `dist/` on every build
- **File:** `public/BrabusIslandVilla_H264_WEB.mp4` (103 MB)
- **Why:** Referenced by nothing in `src`, gitignored and vercelignored — so a normal Git deploy does **not** ship it. But `vite build` copies `public/*` into `dist/` verbatim, so `dist/` is 129 MB and a `vercel deploy --prebuilt` of that directory would upload the 103 MB file and blow past Vercel's per-file limit. Deploy-hygiene footgun, not a live regression. **Fix:** move the master out of `public/`.

### M8 — Enquiry modal has no focus management or focus trap
- **File:** [Enquiry.jsx:301-309](src/components/ui/Enquiry.jsx#L301) — `role="dialog" aria-modal="true"` but no initial focus move, no trap, no focus return, background not inert. Same in `SideEnquiry.jsx`. Auto-opens after 40s with focus left in the background.
- **Why:** Keyboard/screen-reader users can Tab straight out of the dialog into the page behind it; `aria-modal` promises containment that isn't enforced (WCAG 2.4.3 / dialog pattern).

### M9 — Fullscreen nav menu is not an accessible dialog
- **File:** [Navbar.jsx:197-201](src/components/Navbar.jsx#L197) — bare `<div className="fixed inset-0">` with no `role="dialog"`, no `aria-modal`, no accessible name, no focus trap. Body scroll is locked and Escape closes it, but background links stay in the tab order behind the opaque sheet.
- **Why:** Screen-reader/keyboard users can Tab into hidden content beneath the menu; the overlay isn't announced as modal.

### M10 — Three meta descriptions exceed the SERP truncation length
- **Files:** [Brabus.jsx:70](src/pages/Brabus.jsx#L70) (162 chars), [Home.jsx:30](src/pages/Home.jsx#L30) (161), [PricePage.jsx:134](src/pages/PricePage.jsx#L134) (160)
- **Why:** Google truncates ~155–160 chars; each tail risks being cut in results. Easy trim.

### M11 — Location meta description is a truncated, dangling sentence
- **File:** [LocationPage.jsx:133](src/pages/LocationPage.jsx#L133) — ends "…the airport, schools, hospitals and." (155 chars, cut mid-clause).
- **Why:** A broken sentence renders verbatim in the SERP snippet, reads as an error, hurts CTR.

---

## ⚪ Low

**Security**
- **L1** — [errorHandler.js:34](server/src/middlewares/errorHandler.js#L34): only 5xx messages are masked in prod; a non-500 error carrying an internal library string surfaces verbatim. Latent info-leak.
- **L2** — [leads.js:26](src/lib/leads.js#L26): the Apps Script `/exec` URL ships in client JS (by design) and is unauthenticated — anyone can POST leads straight to the owner's sheet. Property of the Apps Script design; reinforces M2.
- **L3** — [app.js:56-67](server/src/app.js#L56): accepting `text/plain` and re-parsing as JSON makes lead POSTs CORS-safelisted "simple" requests that skip preflight, so CORS is the only browser-side gate. Intentional (Apps-Script compat); informational.

**Frontend correctness**
- **L4** — [FloorPlan.jsx:109](src/components/sections/FloorPlan.jsx#L109): `aria-label` contains a hardcoded Arabic comma `، ` (U+060C) on an English-only site — screen readers announce a stray glyph. Leftover from the removed Arabic i18n.
- **L5** — [FloorPlan.jsx:263](src/components/sections/FloorPlan.jsx#L263): `openEnquiry` destructured but unused in `PlanLightbox`. Dead code.
- **L6** — [FloorPlan.jsx:281](src/components/sections/FloorPlan.jsx#L281): `cfg = CONFIG_BY_ID[plan.id]` assigned but never read in `PlanLightbox`. Dead code.
- **L7** — [Contact.jsx:104](src/pages/Contact.jsx#L104): the "Address" channel renders as a plain `<a href="/location">`, triggering a full-document reload instead of SPA navigation. Should be a router `<Link>`.
- **L8** — [MobileCTA.jsx:10-22](src/components/MobileCTA.jsx#L10): docstring/comment describe a four-cell bar ("call · WhatsApp · site visit · brochure"), but only three cells render. Stale docs after a removed action.
- **L9** — [LivingMap.jsx:51](src/components/sections/LivingMap.jsx#L51): `const t = setTimeout(...)` shadows the translation function `t`. Harmless today; latent footgun if `t("...")` is ever added in that effect.
- **L10** — [Enquiry.jsx:70](src/components/ui/Enquiry.jsx#L70): comment says "after 1 minute" but `AUTO_DELAY = 40000` (40s). Misleading comment, no functional impact.

**Content**
- **L11** — [site.js:110-115](src/lib/site.js#L110): `STATS` hard numbers ("7,000 sq.ft largest", "3 sides open · every home", "24/7") are unsourced and not backed by `facts.js`. Currently **dead code** (not rendered) — flagged so it isn't switched on as-is.
- **L12** — [site.js](src/lib/site.js) `HIGHLIGHTS`/`RESIDENCES`/`AMENITIES` state finishes/sizes as fact ("VRV air conditioning", "Italian marble", "≈5,000/7,000 sq.ft") without an inline "indicative" qualifier on the residence cards, though disclaimer copy labels them indicative. Low exposure; consistency across files is otherwise clean.

**SEO / accessibility**
- **L13** — [Seo.jsx:18-20](src/components/ui/Seo.jsx#L18) & [sitemap.mjs:6](scripts/sitemap.mjs#L6): canonical/OG host defaults to the vercel.app subdomain and depends on env vars (`VITE_SITE_URL` client, `SITE_URL` node script — different names). Correct today; a partial set when a custom domain goes live would desync canonical from sitemap.
- **L14** — [sitemap.mjs:36](scripts/sitemap.mjs#L36): `Disallow: /brochure/*.pdf` is under `User-agent: *`, but named AI-crawler groups (GPTBot, ClaudeBot, PerplexityBot, …) ignore `*` per spec, so the PDF stays crawlable by the bots you explicitly welcomed. Contradicts stated intent.
- **L15** — [BlogPost.jsx:194-226](src/pages/BlogPost.jsx#L194): related-reading section jumps from body `<h2>` straight to card `<h3>` with no owning `<h2>`. Minor heading-hierarchy gap.
- **L16** — [index.css:109](src/index.css#L109): `--color-ink-faint: #8a8069` is tuned to 5.0:1 against `--color-canvas`, but the same microcopy renders on lighter `--color-paper`/`--color-cream` surfaces (Footer address, nav sublabels) where the ratio drops toward ~4.3–4.5:1 at very small sizes — can dip under AA. Re-check per surface.

**Performance**
- **L17** — [index.html](index.html) / [vercel.json](vercel.json): a comment claims the hero-poster LCP preload lives in a route-scoped `Link` response header for `source: "/"`, but that block only sets `Cache-Control` — no `Link` header exists. LCP is still mostly covered by `fetchpriority="high"` + the prerendered `<picture>`, but the documented preload is absent.

---

## Verified clean — no action needed

These were checked and found correct, worth recording so they aren't re-litigated:

- **Lead-capture & gating flow** — the gate unlocks via `LEAD_EVENT`, brochure delivery survives a queued/failed POST, double-submit is guarded by `sending`, duplicate submits still unlock. No missing translation keys, no broken internal routes.
- **Prerender / SEO (live)** — the live site *is* prerendered (verified: per-route `<title>` + self-referential canonical present). Unique titles (all ≤60 chars), unique descriptions, correct `noindex` on `/thank-you`, `/maintenance`, `/404`, well-formed JSON-LD, real skip link, single `<h1>` per page, every image has `alt`, accordion answers always in the DOM. *(The stale local `dist/` is a plain `npm run build` and is not what Vercel ships — Vercel runs `build:static`.)*
- **OAuth relay (`api/`)** — CSRF via 256-bit `state` in an HttpOnly/Secure/SameSite cookie, constant-time compared; reply origin re-validated against an env allowlist; token postMessaged only to the resolved target, never `"*"`; secret/code never logged; strict per-response CSP.
- **Google Sheets forward** — native `fetch` with `redirect: "follow"` correctly follows the Apps Script 302; `AbortController` timeout; `Promise.allSettled` isolates Neon and Sheets failures.
- **SQL injection** — all access via Prisma parameterized queries; the only raw query is a static `SELECT 1`.
- **Hero video strategy** — `preload="none"`, AVIF/WebP poster carrying LCP with `fetchpriority="high"`, `src` attached only at idle, refusal on reduced-motion / Save-Data / 2G. Desktop encode 4.27 MB, mobile 1.59 MB.
- **Fonts** — `font-display: swap`, `unicode-range` subsetting, 7 woff2 shipped, two above-fold faces preloaded.
- **Route code splitting** — all 29 non-home pages lazy-loaded.
- **Caching headers** — `/assets/*` immutable 1yr; renders/brochure/mp4 with sensible stale-while-revalidate.
- **No fabricated data** — no fake RERA numbers, no invented testimonials or blog bylines; unpublished figures (price, RERA, possession, land area, towers) rendered as "on request" rather than guessed.

---

## Owner action checklist

**Blocking launch (client-supplied):**
- [ ] Replace both floor-plan drawings with genuine M3M Brabus 4 & 5 BHK plans **(C1, C2 — legal exposure)**
- [ ] Replace the brochure PDF with the real designed brochure **(H1)**
- [ ] Set the real phone, WhatsApp and email in `site.js` + `contact.md` **(H2)**

**Backend / infra:**
- [ ] Rotate the Neon password; keep it only in the Render dashboard **(H3)**
- [ ] Set `CORS_ORIGIN` (multi-origin) and confirm `NODE_ENV=production` in Render **(M1)**
- [ ] Key the rate limiter on `req.ip`; add a server-side honeypot check **(H4, M2)**
- [ ] Allow-list forwarded Sheet fields + defang leading `= + - @` **(M3)**

**Code (developer, low-risk quick wins):**
- [ ] Split `pdfjs-dist` + `page-flip` out of the eager `vendor` chunk **(C3 — biggest perf win)**
- [ ] Generate AVIF/WebP responsive derivatives for the 16 lifestyle renders **(H5)**
- [ ] Gate the map mount behind an IntersectionObserver **(M5)**
- [ ] Drop the click-time `trackBrochure` in MobileCTA **(M4)**
- [ ] Add focus management to the enquiry modal and nav overlay **(M8, M9)**
- [ ] Trim the four over-length / dangling meta descriptions **(M10, M11)**
- [ ] Clear the Low-severity dead code and stale comments **(L4–L10)**

---

*Report generated from a five-track parallel code audit. Every finding cites a file/asset and was verified against the actual code, bytes, or build output.*
