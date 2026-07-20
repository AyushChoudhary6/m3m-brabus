# Architecture

How the pieces fit, and — more usefully — why each one was chosen over the
obvious alternative.

---

## 1. The shape of the thing

```
                  BUILD TIME (GitHub Actions — Chrome lives here)
  ┌──────────────────────────────────────────────────────────────────┐
  │  vite build                                                      │
  │    src/**  ──▶  dist/index.html  (2 kB shell, empty #root)       │
  │                 dist/assets/*.js  *.css  *.woff2                 │
  │                                                                  │
  │  scripts/prerender.mjs                                           │
  │    serve dist/ on :4179  ──▶  headless Chrome --dump-dom         │
  │    for each of the 30 routes in scripts/routes.mjs               │
  │      ──▶  dist/<route>/index.html   (fully rendered)             │
  │                                                                  │
  │  scripts/sitemap.mjs  ──▶  dist/sitemap.xml                      │
  │                                                                  │
  │  verify-prerender.mjs · verify-no-fabrication.mjs   (CI gates)   │
  │  make-vercel-output.mjs  ──▶  .vercel/output/                    │
  └──────────────────────────────────────────────────────────────────┘
                          │  vercel deploy --prebuilt
                          ▼
                        RUN TIME (Vercel's CDN edge)
  ┌──────────────────────────────────────────────────────────────────┐
  │  Static files. No database. Two serverless functions in api/,    │
  │  used only by the CMS login — never by a page view or a lead.    │
  │                                                                  │
  │  Visitor ─▶ /price ─▶ real HTML with <title>, canonical, JSON-LD │
  │                       then React hydrates and the SPA takes over │
  └──────────────────────────────────────────────────────────────────┘
                                    │  lead form POST
                                    ▼
                        GOOGLE (not ours, but the only server we have)
  ┌──────────────────────────────────────────────────────────────────┐
  │  Apps Script web app  (server/apps-script/Code.gs)               │
  │    validate ▸ rate-limit ▸ dedupe ▸ append row ▸ email the desk  │
  │                              │                                   │
  │                              ▼                                   │
  │                    Google Sheet — "Leads" tab                    │
  └──────────────────────────────────────────────────────────────────┘
```

Three environments, three trust levels. Everything in the browser is advisory.
Everything in Apps Script is enforcement. Everything at build time is a
one-shot artefact that cannot change until someone redeploys.

---

## 2. Why prerendering rather than Next.js

The brief asked for a site that ranks and that AI crawlers can read. Both need
real HTML at the URL. The two ways to get it are server rendering (Next.js,
Remix, Astro) or prerendering the SPA you already have.

Migrating to Next.js would have meant rewriting every one of ~60 components
around a different router, a different metadata API and a server/client
component split — and then living with the fact that GSAP ScrollTrigger, Lenis
and Leaflet are all browser-only and would each need a `"use client"` boundary
and a `dynamic(..., { ssr: false })` wrapper. The animation work is the product
here; wrapping all of it in escape hatches to satisfy a renderer that then does
not render it is a poor trade.

Prerendering with a real Chrome sidesteps every one of those problems. GSAP,
Lenis, Leaflet and `window` all work, because a real browser is running. What
gets captured is exactly what a visitor sees. The cost is honest and small:

- The build needs a Chrome binary (`CHROME_PATH`). See
  [DEPLOYMENT.md](DEPLOYMENT.md) for the CI consequence — it is the single
  most awkward thing about this design.
- Content is frozen at build time. A price change means a redeploy. For a
  pre-launch project whose facts change monthly, that is fine.
- Anything that throws during first paint corrupts that route's HTML.
  `scripts/prerender.mjs` guards against it by failing the build when a route
  renders under 6 kB or emits anything other than exactly one
  `<link rel="canonical">`.

`scripts/routes.mjs` is the single source of truth for the route list. Both the
prerenderer and the sitemap generator import it, so the two cannot drift.
Adding a page means adding a `<Route>` in `App.jsx` **and** an entry in
`routes.mjs`; miss the second and the page exists but is never prerendered or
listed in the sitemap.

### One subtlety worth preserving

`prerender.mjs` reads `dist/index.html` into memory **before** the loop starts
and serves that buffer as the SPA fallback for every route. It must not re-read
the file from disk, because the loop overwrites `dist/index.html` with the
rendered homepage. If the fallback picked that up, every subsequent route would
boot from the already-rendered homepage and inherit its `<title>`, canonical and
JSON-LD — React would then append the correct tags on top, leaving two canonicals
per page and pointing half the site at `/`. The in-memory shell is load-bearing.

---

## 3. Metadata

`src/components/ui/Seo.jsx` uses React 19's native document-metadata support:
rendering `<title>`, `<meta>` or `<link>` anywhere in the tree hoists it into
`<head>`. No `react-helmet`, no extra dependency, and — because the tags are
part of the React output — the prerenderer captures them for free.

`index.html` therefore deliberately contains **no** title, description,
canonical or Open Graph tag. If it did, every prerendered page would ship two of
each.

---

## 4. The lead pipeline, end to end

This is the only path in the whole system that carries a business consequence,
so it is worth following in full.

**Step 0 — arrival.** `src/lib/attribution.js` runs at module load, before any
routing. It reads `utm_*`, `gclid`, `fbclid` and friends off the landing URL and
the external referrer, and writes a *first touch* (90-day TTL, matching Google
Ads' maximum click window) and a *last touch* (30-day TTL, matching GA4's
default lookback) into `localStorage`. It has to happen at load: after the first
`<Link>` click the query string is gone from `window.location` for good.

**Step 1 — the form.** Five components collect leads. All of them import
`submitLead` from `src/lib/leads.js`:

| Component | Fields | `source` value |
| --- | --- | --- |
| `components/ui/Enquiry.jsx` (modal) | name, phone, email, config, optional visit date | `Modal · …` / `Brochure · …` / `Site visit · …` / `Timed invite` |
| `components/ui/SideEnquiry.jsx` (desktop side panel) | name, phone, email, config | `Side panel` |
| `components/sections/WelcomeHome.jsx` | name, phone, email, config | `Welcome Home section` |
| `pages/Contact.jsx` | name, phone, email, config, message | `Contact page` |
| `components/sections/LeadForm.jsx` | name, phone, email, config | **none — see below** |

`LeadForm.jsx` is **not wired up**. Its submit handler sets a success state and
carries a `// TODO: wire to CRM` comment; it never calls `submitLead`. Anything
typed into it is discarded and the visitor is shown a thank-you message. It is
also dead code — nothing in `src/` imports it — so it is doing no harm today.
See [KNOWN-LIMITATIONS.md](KNOWN-LIMITATIONS.md).

Every wired form validates through `src/lib/validate.js` first, which returns
translation *keys* rather than English strings so the messages follow the
selected language (English / Arabic, `src/lib/i18n.jsx`). Phone validation
covers India (`+91`, 10 digits starting 6–9) and the UAE (`+971`, 9 digits
starting 5) — the two markets the sales desk actually works.

**Step 2 — screening.** `submitLead` calls `screenLead()` from
`src/lib/spam.js`. Two things hard-block: a filled honeypot field (`company`,
rendered hidden in every form) and an abusive submission rate from this browser.
A repeat of the identical phone+email inside ten minutes resolves as a *silent
success* — the buyer is already in the sheet and does not deserve an error.
Everything else (disposable email domain, sub-2.5-second fill time, link in the
name field, keyboard-mash patterns) is recorded as a soft signal and sent
through, because a false positive here throws away a crore-plus buyer.

None of this is security. It all runs in the visitor's browser and can be
bypassed in ten seconds with devtools. It exists to keep casual bots and
fat-finger duplicates out of the sheet.

**Step 3 — the payload.** `buildPayload()` merges the form values, the
attribution block, the environment block (device class, screen, viewport, DPR,
language, timezone), the spam signals, the page path and a `leadId` (a UUID,
stable across retries).

Each identity value is sent under several key spellings — `name`, `fullname`,
`fullName`, `Fullname` — because the sheet's existing headers were inherited and
the client cannot assume which the script maps. `Code.gs` resolves them through
`PAYLOAD_ALIASES`. Extra keys cost nothing: the script ignores anything it has
no column for, which is why the whole attribution block can ride along today and
start appearing the moment the owner adds columns.

**Step 4 — the wire, and why `text/plain`.** The POST goes out as:

```
Content-Type: text/plain;charset=utf-8
body: <a JSON string>
```

This looks wrong and is deliberate. `application/json` is not a CORS-safelisted
content type, so the browser would send a preflight `OPTIONS` request first — and
a Google Apps Script web app has no `doOptions` entry point and cannot answer it.
The request would fail before the script ever ran. `text/plain` **is** safelisted,
so the browser sends a "simple" request with no preflight. The script reads the
body with `JSON.parse(e.postData.contents)` and neither side cares what the
header claimed.

Apps Script answers with a 302 to `script.googleusercontent.com`. Both hops send
`Access-Control-Allow-Origin: *`, so the response body is readable and the site
can report genuine success or failure rather than firing blind.

**Step 5 — the server.** `server/apps-script/Code.gs` is the only server-side
code in the project. It:

- caps body size (12 kB) and key count (60) before spending quota;
- checks six honeypot field names, and returns `success: true` when one is
  tripped so the bot stops retrying and never learns it was caught;
- validates name, phone and email again, mirroring `validate.js` — this is the
  copy that counts, because the client's copy is advisory;
- rate-limits per phone (4 per hour), per identical-payload fingerprint (90
  seconds) and globally (120 per hour, with a one-shot flood alert email);
- canonicalises the phone to E.164 and derives `country` and `intent`
  (`Enquiry` / `Brochure request` / `Site visit request`) from `source`;
- deduplicates against the last 5,000 rows over a 30-day window — a repeat from
  the same phone updates the existing row, bumps a `Submissions` counter and
  refreshes `Last Seen` rather than creating a second row;
- appends columns it needs to the *right* of whatever headers already exist,
  never moving or renaming an inherited column;
- mints a human-quotable reference (`MB-260720-4F2A`) and emails the desk;
- writes failures to a `_Log` tab and never, under any circumstance, throws —
  an uncaught exception would render as an Apps Script HTML error page, which
  `leads.js` could not parse, and the visitor would be told the form is broken.

**Step 6 — failure.** If the network dies mid-send, `leads.js` writes the
payload to a `localStorage` queue and retries: on reconnect (`online` event), on
tab focus (`visibilitychange`, because mobile Safari suspends timers), 2.5
seconds after load, and on a capped exponential backoff from 15 seconds to 30
minutes. Entries expire after 7 days or 12 attempts. A crude cross-tab lock
stops two open tabs double-posting.

Be clear about what that buys. It survives a flaky connection, a short Google
outage and a tab left open. It does **not** survive the visitor closing the tab
and never returning, private-browsing mode, or a cleared store. There is no
server of ours to hand the lead to, so a device that never comes back takes the
lead with it. The only real fix is a server-side inbox, which this site does not
have.

---

## 5. Why the facts layer exists

`src/lib/facts.js` holds every project figure, and every figure the official M3M
listing does not publish is `null` rather than absent. The UI renders a `null`
as an "on request" call to action.

This is a structural defence, not a style guide. A property marketing site is
under constant pressure to fill a blank — a portal quotes a price, a broker
mentions a possession quarter, a copywriter rounds a number to make a sentence
land. Any one of those, published against a crore-plus purchase, is a
misrepresentation with legal weight, and under RERA it is the kind of thing that
draws complaints.

By putting every fact in one file with `null` as an explicit, rendered state,
fabricating a claim requires deliberately editing that file rather than typing a
number into a component. `src/lib/whatsapp.js` follows the same rule for
prefilled chat text: a message may *ask* for a price list; it may never *state*
one.

The official listing publishes: location, 4 & 5 BHK configurations, ≈5,000–7,000
sq.ft, and a named amenity list. It publishes no price, no RERA number, no
possession date, no land area, no tower or floor count, no carpet areas and no
penthouse.

---

## 6. Content: the git-backed CMS

Blog posts live as markdown with YAML frontmatter in `src/content/blog/*.md`.
Vite inlines them at build time with `import.meta.glob(…, { query: "?raw", eager:
true })`, so there is no fetch, no runtime file access and nothing for the
prerenderer to wait on.

`src/lib/cms.js` parses them. It is a deliberately small, closed grammar — six
block shapes plus paragraphs — rather than a markdown library, because the
renderer it feeds (`components/ui/BlogBody.jsx`) accepts exactly those six shapes
and plain strings. A general markdown library returns HTML or an mdast tree, so
we would still own a lossy mapping down onto six shapes, *and* the dependency.
Anything the parser does not understand degrades to a paragraph rather than
disappearing. Inline `**bold**`, `_italic_` and links are flattened to their
text, because `BlogBody` takes strings and there is nowhere for inline markup to
go.

**The editor.** `public/admin/index.html` loads Sveltia CMS (which speaks Decap's
configuration format and its OAuth protocol, so either can be swapped in) and
`public/admin/config.yml` defines three collections: blog posts, FAQs and a
single site-settings file.

Authentication is the interesting part, because it is the one place this project
needed a server. Decap's git-gateway is a Netlify service and does not exist on
Vercel, so `api/auth.js` and `api/callback.js` stand in as a GitHub OAuth relay:
the popup goes to `/api/auth`, which mints a one-time `state` into an `HttpOnly`
cookie and redirects to GitHub; GitHub returns to `/api/callback`, which
validates the state, exchanges the code for a token **server-side**, and
`postMessage`s the token to a single explicitly-resolved origin — never `"*"`.
`GITHUB_CLIENT_SECRET` never leaves the function.

Note also what the CMS deliberately *cannot* edit: there is no collection
pointing at `src/lib/site.js` or `src/lib/facts.js`. Changing a published fact
stays a code change, reviewed in a pull request. Putting a text box in front of
those two files would put a text box in front of exactly the mistake this site is
built to avoid. Full walkthrough in [CMS-GUIDE.md](CMS-GUIDE.md).

Note the loop this closes: a git-backed CMS commits markdown to the repository,
which triggers a Vercel build, which runs the prerenderer, which produces new
static HTML. The editor never touches a server — the CDN is updated by a build,
not by a database write. That is why "publish" takes a couple of minutes here
rather than being instant.

---

## 7. Bundle and chunking

`vite.config.js` splits vendors into named groups through Rolldown's
`build.rolldownOptions.output.codeSplitting.groups`. Note the shape: Vite 8
bundles with Rolldown, not Rollup, and a copied-in Rollup `manualChunks` recipe
would look correct and do nothing.

Current production output (verified 20 Jul 2026):

| Chunk | Raw | Gzip |
| --- | --- | --- |
| `icons` (lucide-react) | 632 kB | 156 kB |
| `index` (app) | 600 kB | 155 kB |
| `react` | 231 kB | 74 kB |
| `leaflet` | 149 kB | 43 kB |
| `motion` (framer-motion) | 134 kB | 44 kB |
| `gsap` (+ lenis, split-type) | 134 kB | 50 kB |
| CSS | 123 kB | 25 kB |

Splitting buys cache granularity and parallel parsing. It does **not** reduce
first-load bytes, because `src/App.jsx` imports all 30 pages eagerly, which makes
every chunk a static import of the entry. Reducing first load needs
`React.lazy()` on the routes — a change in `App.jsx`, not in `vite.config.js`.
`chunkSizeWarningLimit` is deliberately left at Vite's default rather than raised
to silence the warning: the app chunk should keep complaining until that work is
done.

`three` and `@react-three/*` are in `package.json` but have zero imports in
`src/` and appear nowhere in the bundle — tree-shaking removes them entirely.
They are dead entries in the dependency list, not shipped weight.

---

## 8. Images

`scripts/images.mjs` generates responsive AVIF and WebP derivatives from the
JPEGs in `public/renders/`, and writes `src/lib/renders.generated.js` — a
manifest of exactly which widths and formats exist on disk.
`components/ui/Media.jsx` reads that manifest, so it can only ever advertise a
file that is really there.

It is a shell-out to `cwebp` / `avifenc` / `ffmpeg` rather than a Vite plugin
because `sharp` drags a ~30 MB native binary into the lockfile for three source
photographs, and Vercel's build image has no encoder binaries. So derivatives are
generated once on a developer's machine and **committed**. `vite build` never
needs to know the script exists.

The consequence to respect: after adding or replacing anything in
`public/renders/`, run `node scripts/images.mjs` and commit the output.

---

## 9. What deliberately does not exist

- **No database.** The Google Sheet is the record of leads.
- **No visitor sessions, no login, no user accounts.** Nothing on the public
  site is gated behind an identity. The only authenticated flow anywhere is the
  CMS's GitHub login, which authenticates an *editor* against GitHub, not a
  visitor against us.
- **Almost no serverless code.** `api/` contains two functions and they do one
  job: relay an OAuth handshake. Nothing else runs on a server, and in
  particular a page view and a lead submission both touch zero of our
  server-side code. Extending `api/` is the correct answer to several open
  problems (a server-side lead inbox, CAPTCHA verification, IP rate limiting) —
  it just has not been done, and each addition moves this further from "static
  site" toward "application", with the operational weight that implies.
- **No admin dashboard.** Leads are read in the Google Sheet.
- **No cookies set by this site.** State lives in `localStorage`
  (`mb-lang`, `mb-lead`, `mb-lead-queue`, `mb-lead-recent`, `mb-attr-*`).
  Google Analytics sets its own cookies when `VITE_GA_ID` is configured.

Each of these is examined honestly, with what it would take to change,
in [KNOWN-LIMITATIONS.md](KNOWN-LIMITATIONS.md).
