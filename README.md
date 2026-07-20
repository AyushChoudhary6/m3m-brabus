# M3M Brabus

Marketing site for **M3M Brabus** — branded residences at Sector 58, Golf Course
Extension Road, Gurugram, developed by M3M India in partnership with BRABUS.

A static single-page React application, prerendered to real HTML at build time
and served from a CDN. Thirty crawlable pages, a lead-capture pipeline that ends
in a Google Sheet, a git-backed CMS for the blog, and — apart from two small
serverless functions that relay the CMS's GitHub login — no server of our own
anywhere in the request path.

---

## The one thing you must not get wrong

There are two build commands and they are **not** interchangeable.

| Command | What it produces | Fit for production? |
| --- | --- | --- |
| `npm run build` | `dist/` containing a single empty `index.html` shell plus JS | **No** |
| `npm run build:static` | the same, then a real HTML file per route, plus `sitemap.xml` | **Yes** |

`npm run build` alone ships a site whose every URL returns the same two-kilobyte
shell with an empty `<div id="root">`. Browsers cope. Google's crawler mostly
copes, eventually. AI crawlers — GPTBot, PerplexityBot, ClaudeBot, all of which
`public/robots.txt` explicitly invites — largely do not execute JavaScript and
will see nothing at all. Every per-page `<title>`, meta description, canonical
link, Open Graph tag and JSON-LD block on this site is rendered by React and
captured by the prerender step. Skip the step and all of it vanishes, silently,
with a green build log.

**Deploy the output of `npm run build:static`. Nothing else.**

`build:static` drives a headless Chrome, so the build environment must have one —
which Vercel's build image does not. That is why the production build runs in
GitHub Actions (`.github/workflows/deploy.yml`) and ships the finished artefact
with `vercel deploy --prebuilt`. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
before changing anything about how this deploys.

---

## Stack

| | |
| --- | --- |
| Build | Vite 8 (Rolldown) |
| UI | React 19, React Router 7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`, no `tailwind.config.js`) |
| Motion | GSAP + ScrollTrigger, Framer Motion, Lenis smooth scroll |
| Icons | lucide-react |
| Map | Leaflet + OpenStreetMap/CARTO tiles (one component) |
| Metadata | React 19 native document metadata — no Helmet |
| Prerender | headless Chrome `--dump-dom`, `scripts/prerender.mjs` |
| Lead backend | Google Apps Script web app → Google Sheet |
| CMS | Sveltia (Decap-compatible), git-backed, at `/admin` |
| Host | Vercel (static + two OAuth relay functions in `api/`) |
| CI/CD | GitHub Actions → `vercel deploy --prebuilt` |
| Lint | oxlint |

No TypeScript, no test runner, no CSS-in-JS, no state library. That is
deliberate: the site is content, motion and one form.

---

## Quick start

```bash
git clone https://github.com/AyushChoudhary6/m3m-brabus.git
cd m3m-brabus
npm install
npm run dev            # http://localhost:5173
```

Node 20 or newer (developed on Node 26). No environment variables are required
for local development — analytics stays switched off without one — but note that
the lead form posts to the **live** Apps Script endpoint even in dev, so a test
submission lands in the real sheet and mails the real sales inbox. See
[docs/SETUP.md](docs/SETUP.md) for how to avoid that.

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `vite build` only — **not deployable**, see above |
| `npm run prerender` | `scripts/prerender.mjs` + `scripts/sitemap.mjs` over an existing `dist/` |
| `npm run build:static` | `build` + `prerender` — **this is the production build** |
| `npm run preview` | serve `dist/` locally; run it after `build:static` to see the real thing |
| `npm run lint` | oxlint |

`scripts/images.mjs` is **not** wired into `package.json`. Run it directly
(`node scripts/images.mjs`) after changing anything in `public/renders/`; it
regenerates the responsive AVIF/WebP derivatives and the
`src/lib/renders.generated.js` manifest, both of which are committed. Vercel has
no image encoders and will never regenerate them.

### Chrome

`prerender` shells out to a real Chrome binary. It defaults to the macOS path:

```
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
```

Anywhere else — Linux, CI, a colleague's machine — set `CHROME_PATH`:

```bash
CHROME_PATH=/usr/bin/google-chrome-stable npm run build:static
```

If the binary is missing, the script exits non-zero and prints the path it tried,
so a misconfigured CI fails loudly rather than silently shipping unprerendered
HTML. It also exits non-zero if any route renders suspiciously small or ends up
with more than one `<link rel="canonical">`.

Two other variables affect the build only: `PRERENDER_PORT` (default `4179`, the
temporary static server the prerenderer drives Chrome against) and `SITE_URL`
(default `https://m3m-brabus.com`, the origin written into `sitemap.xml`).

---

## Repository layout

```
index.html                 Vite shell. Deliberately holds no <title> or meta —
                           <Seo> renders those per route.
vercel.json                Routing, security headers, cache policy. Schema-
                           validated, so the reasoning lives in .vercelignore.
api/                       The only serverless code: the CMS's GitHub OAuth
                           relay, and the one place a real secret can live.
.github/workflows/         Build + prerender + verify + deploy. The production
                           build runs here, not on Vercel.
scripts/
  routes.mjs               Single source of truth for crawlable routes.
                           Both the prerenderer and the sitemap read it.
  prerender.mjs            dist/ → one real HTML file per route.
  sitemap.mjs              dist/sitemap.xml.
  images.mjs               Responsive image derivatives. Run by hand.
server/
  apps-script/Code.gs      The lead endpoint. The only server-side code in the
                           project. It runs in Google's infrastructure, not ours.
src/
  lib/facts.js             Verified project facts. The one file allowed to
                           state a figure about the project.
  lib/site.js              Navigation, copy blocks, residences, amenities.
  lib/leads.js             submitLead() + the offline retry queue.
  lib/attribution.js       First-touch / last-touch campaign capture.
  lib/spam.js              Client-side junk-lead screening (advisory only).
  lib/validate.js          Shared form validation (IN / AE phone numbers).
  lib/cms.js               Markdown + frontmatter parser for the blog.
  content/blog/*.md        Blog posts, editable without touching code.
  components/ui/Seo.jsx    Per-page metadata and JSON-LD.
  pages/                   One component per route.
public/
  admin/                   The CMS editor and its configuration.
  robots.txt               Explicitly welcomes AI crawlers.
  renders/                 Official M3M renders + generated derivatives.
  brochure/                The PDF the brochure gate unlocks.
```

---

## The facts rule

`src/lib/facts.js` is the single source of truth for anything factual about the
project, and it carries a hard rule every contributor is expected to honour:

> A figure appears in the site only if the official M3M listing states it.

The official listing publishes the location, the 4 & 5 BHK configurations, the
approximate 5,000–7,000 sq.ft range, and a named amenity list. It publishes **no
price, no RERA registration number, no possession date, no land area, no tower or
floor count, no carpet areas and no penthouse.** Those fields are `null` in
`facts.js` and the UI renders them as an honest "on request" call to action.

Never fill a `null` with an estimate, a property-portal listing, or general
knowledge. The point of the file is that the site cannot accidentally fabricate a
claim about a crore-plus purchase.

---

## Documentation

| Document | Read it when |
| --- | --- |
| [docs/SETUP.md](docs/SETUP.md) | Setting up a machine from a clean clone |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | You want to know why it is built this way |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Shipping, DNS, rollback, pre-launch checklist |
| [docs/CMS-GUIDE.md](docs/CMS-GUIDE.md) | Editing content at `/admin` |
| [docs/CRM-FIELD-MAPPING.md](docs/CRM-FIELD-MAPPING.md) | Wiring the sheet into a CRM |
| [docs/KNOWN-LIMITATIONS.md](docs/KNOWN-LIMITATIONS.md) | **Before promising anyone a feature** |
| [docs/HANDOVER.md](docs/HANDOVER.md) | Taking ownership of the accounts |
| [.env.example](.env.example) | Configuring environment variables safely |

`docs/KNOWN-LIMITATIONS.md` is the honest one. If you read only a second file
after this one, read that.
